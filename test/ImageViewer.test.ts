// Mock global WebGL2RenderingContext

globalThis.WebGL2RenderingContext = class WebGL2RenderingContextMock {} as any;

// Mock the Map class
vi.mock("../src/Map", async () => {
  const actual = await vi.importActual("../src/Map");
  return {
    ...actual,
    Map: vi.fn().mockImplementation(function (options: MapOptions) {
      let center = new LngLat(0, 0);
      return {
        // Core map properties
        version: "1.0.0",
        options,

        // Event system
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
        fire: vi.fn(),

        // Camera methods
        getZoom: vi.fn(() => 1),
        setZoom: vi.fn(),
        getCenter: vi.fn(() => center),
        setCenter: vi.fn((lngLat: LngLat) => (center = lngLat)),
        getBearing: vi.fn(() => 0),
        setBearing: vi.fn(),
        getPitch: vi.fn(() => 0),
        setPitch: vi.fn(),
        getBounds: vi.fn(() => new LngLatBounds([0, 0], [90, 0])),
        setBounds: vi.fn(),
        cameraForBounds: vi.fn(),
        fitBounds: vi.fn(),

        // Movement methods
        flyTo: vi.fn(),
        jumpTo: vi.fn(),
        panBy: vi.fn(),
        panTo: vi.fn(),
        zoomTo: vi.fn(),
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        resetNorth: vi.fn(),
        onReadyAsync: vi.fn(() => Promise.resolve()),

        // Projection methods
        project: vi.fn((lngLat: LngLat) => ({ x: lngLat.lng * 100, y: lngLat.lat * 100 })),
        unproject: vi.fn((point: [number, number]) => ({ lng: point[0] / 100, lat: point[1] / 100 })),

        // Style methods
        addSource: vi.fn(),
        addLayer: vi.fn(),
        removeLayer: vi.fn(),
        getStyle: vi.fn(() => ({ version: 8, sources: {}, layers: [] })),
        isStyleLoaded: vi.fn(() => true),

        // Controls
        addControl: vi.fn(),

        // Handler properties
        scrollZoom: { isEnabled: vi.fn(() => true), enable: vi.fn(), disable: vi.fn() },
        boxZoom: { isEnabled: vi.fn(() => true), enable: vi.fn(), disable: vi.fn() },
        dragPan: { isEnabled: vi.fn(() => true), enable: vi.fn(), disable: vi.fn() },
        keyboard: { isEnabled: vi.fn(() => true), enable: vi.fn(), disable: vi.fn() },
        doubleClickZoom: { isEnabled: vi.fn(() => true), enable: vi.fn(), disable: vi.fn() },
        touchZoomRotate: { isEnabled: vi.fn(() => true), enable: vi.fn(), disable: vi.fn() },
        cooperativeGestures: { isEnabled: vi.fn(() => true), enable: vi.fn(), disable: vi.fn() },

        // Container methods
        getContainer: vi.fn(() => document.createElement("div")),
        getCanvas: vi.fn(() => document.createElement("canvas")),

        // Utility methods
        resize: vi.fn(),
        triggerRepaint: vi.fn(),
        loaded: vi.fn(() => true),
        remove: vi.fn(),
        transform: {
          getConstrained: vi.fn(),
        },
        telemetry: {
          registerViewerType: vi.fn(),
        },
      };
    }),
  };
});

vi.mock("../src", async () => {
  const actual = await vi.importActual("../src");

  // @ts-expect-error - Mocking the class
  class MockMercatorCoordinate extends actual.MercatorCoordinate {
    // @ts-expect-error - Mocking the method
    static fromLngLat = vi.fn(actual.MercatorCoordinate.fromLngLat);
    // @ts-expect-error - Mocking the method
    static toLngLat = vi.fn(actual.MercatorCoordinate.toLngLat);
  }

  return {
    ...actual,
    MercatorCoordinate: MockMercatorCoordinate,
  };
});

// Spy on the triangulation, which the outside cutline layer does when it is drawn
vi.mock("../src/ImageViewer/cutline", async () => {
  const actual = await vi.importActual<typeof import("../src/ImageViewer/cutline")>("../src/ImageViewer/cutline");
  return {
    ...actual,
    triangulateOutsideCutline: vi.fn(actual.triangulateOutsideCutline),
  };
});

// Mock event forwarding
vi.mock("../src/ImageViewer/events", async () => {
  const actual = await vi.importActual("../src/ImageViewer/events");
  return {
    ...actual,
    // @ts-expect-error - Mocking the function
    setupGlobalMapEventForwarder: vi.fn(actual.setupGlobalMapEventForwarder),
  };
});

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import fs from "fs";
import path from "path";
import ImageViewer from "../src/ImageViewer/ImageViewer";
import { ImageViewerEvent, setupGlobalMapEventForwarder, type ImageViewerCutlineChangeEvent } from "../src/ImageViewer/events";
import type { ImageViewerConstructorOptions } from "../src/ImageViewer/ImageViewer";
import { OutsideCutlineLayer, OUTSIDE_CUTLINE_LAYER_ID, type OutsideCutlineLayerData } from "../src/ImageViewer/OutsideCutlineLayer";
import { triangulateOutsideCutline } from "../src/ImageViewer/cutline";
import { FetchError } from "../src/utils/errors";
import { Map } from "../src/Map";
import type { MapOptions, DragPanHandler, DoubleClickZoomHandler, TwoFingersTouchZoomRotateHandler } from "maplibre-gl";
import { NavigationControl } from "maplibre-gl";
// Import fixture data
import fixtureImageMetadata from "./fixtures/ImageViewer/image.json";
import { BoxZoomHandler, CooperativeGesturesHandler, KeyboardHandler, LngLat, LngLatBounds, MercatorCoordinate, ScrollZoomHandler } from "../src";
import { ImageViewerFitImageToBoundsControl } from "../src/controls/ImageViewerFitImageToBoundsControl";

// Read the fixture image file
const fixtureImagePath = path.join(__dirname, "fixtures/ImageViewer/image.png");
const fixtureImageBuffer = fs.readFileSync(fixtureImagePath);

// Mock fetch with fixture-based responses
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ImageViewer", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a container element for each test
    container = document.createElement("div");
    container.id = "test-map-container";
    document.body.appendChild(container);

    // Reset all mocks
    vi.clearAllMocks();

    // Setup smart fetch mock that returns appropriate fixture data
    mockFetch.mockImplementation((url: string | URL) => {
      const urlString = url.toString();

      // Handle JSON metadata requests
      if (urlString.includes("image.json")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          url: urlString,
          json: async () => await Promise.resolve(fixtureImageMetadata),
        });
      }

      // Handle image tile requests (/{z}/{x}/{y} pattern)
      if (/\/\d+\/\d+\/\d+$/.exec(urlString)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          url: urlString,
          headers: {
            get: (name: string) => {
              if (name.toLowerCase() === "content-type") return "image/png";
              return null;
            },
          },
          arrayBuffer: async () =>
            await Promise.resolve(fixtureImageBuffer.buffer.slice(fixtureImageBuffer.byteOffset, fixtureImageBuffer.byteOffset + fixtureImageBuffer.byteLength)),
          blob: async () => await Promise.resolve(new Blob([fixtureImageBuffer], { type: "image/png" })),
        });
      }

      // Default to not found
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        url: urlString,
      });
    });
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
  });

  describe("Constructor", () => {
    it("should create ImageViewer instance with required options", () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      expect(viewer).toBeInstanceOf(ImageViewer);
      expect(viewer.version).toBe("1.0.0");
    });

    it("fire the correct init event if onReadyAsync is not called", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      const readyCallback = vi.fn();

      await new Promise((resolve) => {
        void viewer.once("imageviewerready", () => {
          readyCallback();
          resolve(undefined);
        });
      });

      expect(readyCallback).toHaveBeenCalled();
    });

    it("should reutrn the internal sdk instance", () => {
      const MockedMap = Map as unknown as Mock;
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });
      expect(viewer.getSDKInternal()).toBe(MockedMap.mock.results[0].value);
    });

    it("should return the canvas of the internal sdk instance", () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });
      expect(viewer.getCanvas()).toStrictEqual(viewer.getSDKInternal().getCanvas());
    });

    it("should merge options correctly with overrides", async () => {
      const MockedMap = Map as unknown as Mock;

      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: true,
        center: [10, 20] as [number, number],
        zoom: 5,
      });

      await viewer.onReadyAsync();

      const mapOptions = MockedMap.mock.calls[0][0];

      // Should override certain properties
      expect(mapOptions.style).toEqual({
        version: 8,
        sources: {},
        layers: [],
      });
      expect(mapOptions.minPitch).toBe(0);
      expect(mapOptions.maxPitch).toBe(0);
      expect(mapOptions.pitch).toBe(0);
      expect(mapOptions.bearing).toBe(0);
      expect(mapOptions.projection).toBe("mercator");
      expect(mapOptions.renderWorldCopies).toBe(false);
    });

    it("should setup event forwarding", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await viewer.onReadyAsync();

      expect(setupGlobalMapEventForwarder).toHaveBeenCalledOnce();
    });
  });

  describe("Initialization with Fixture Data", () => {
    it("should fetch image metadata successfully using fixture data", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await viewer.onReadyAsync();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("test-uuid/image.json"));
    });

    it("should use actual fixture metadata values", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      const MockedMap = Map as unknown as Mock;
      const mockMapInstance = MockedMap.mock.results[0].value;

      await viewer.onReadyAsync();

      // Verify that the source was added with the fixture metadata values
      expect(mockMapInstance.addSource).toHaveBeenCalledWith("image", {
        attribution: '<a href="https://www.maptiler.com/engine/">Rendered with MapTiler Engine</a>',
        bounds: [-180, -40.97989806962013, 45, 85.05112877980659],
        description: "abc",
        height: 5120,
        id: "random id",
        maxzoom: 18,
        minzoom: 0,
        tileSize: 512,
        tiles: ["https://api.maptiler.com/images/test-uuid/{z}/{x}/{y}?key="],
        type: "raster",
        width: 5120,
      });

      expect(mockMapInstance.addLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "image",
          type: "raster",
          source: "image",
        }),
      );
    });

    it("should handle fetch errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await expect(viewer.onReadyAsync()).rejects.toThrow("Network error");
    });

    it("should handle HTTP error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        url: "test-url",
      });

      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await expect(viewer.onReadyAsync()).rejects.toThrow("[ImageViewer]: Failed to fetch image metadata at test-url: 404: Not Found");
    });

    it("fires imageviewerready as an ImageViewerEvent targeting the viewer", async () => {
      const viewer = new ImageViewer({ container, imageUUID: "test-uuid", apiKey: "test-key", debug: false });

      const event = await viewer.once("imageviewerready");

      expect(event).toBeInstanceOf(ImageViewerEvent);
      expect(event.type).toBe("imageviewerready");
      expect(event.target).toBe(viewer);
    });

    it("fires imagevieweriniterror with the error that stopped it", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const viewer = new ImageViewer({ container, imageUUID: "test-uuid", apiKey: "test-key", debug: false });

      // typed as `{ error: Error }` — no cast needed
      const event = await viewer.once("imagevieweriniterror");

      expect(event.type).toBe("imagevieweriniterror");
      expect(event.error).toBeInstanceOf(Error);
      expect(event.error.message).toBe("Network error");
    });

    it("fires beforeremove as an ImageViewerEvent", async () => {
      const viewer = new ImageViewer({ container, imageUUID: "test-uuid", apiKey: "test-key", debug: false });
      await viewer.onReadyAsync();
      const listener = vi.fn();
      viewer.on("beforeremove", listener);

      viewer.remove();

      expect(listener).toHaveBeenCalledWith(expect.any(ImageViewerEvent));
      expect((listener.mock.calls[0] as [ImageViewerEvent])[0].target).toBe(viewer);
    });
  });

  describe("Coordinate Transformations", () => {
    let viewer: ImageViewer;

    beforeEach(async () => {
      viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });
      // @ts-expect-error - Mocking the method, we know it's private
      await viewer.init();
    });

    it("should convert LngLat to pixel coordinates", () => {
      // Access private method through reflection for testing
      const lngLat1 = new LngLat(0, 0);
      const lngLatToPx1 = (viewer as any).lngLatToPx(lngLat1);

      expect(lngLatToPx1).toEqual([4096, 4096]);

      const lngLat2 = new LngLat(-90, 45);
      const lngLatToPx2 = (viewer as any).lngLatToPx(lngLat2);

      expect(MercatorCoordinate.fromLngLat).toHaveBeenCalledWith({ lng: -90, lat: 45 });

      expect(lngLatToPx2).toEqual([2048, 2946.8675024093595]);
    });

    it("should convert pixel coordinates to LngLat", () => {
      // Access private method through reflection for testing
      const pxToLngLat = (viewer as any).pxToLngLat([1000, 1000]);

      const lngLat = new LngLat(-136.0546875, 79.36770077764092);

      expect(pxToLngLat).toEqual(lngLat);
    });
  });

  describe("Camera Operations", () => {
    let viewer: ImageViewer;
    let mockMapInstance: any;

    beforeEach(async () => {
      viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await viewer.onReadyAsync();

      const MockedMap = Map as unknown as Mock;
      mockMapInstance = MockedMap.mock.results[0].value;
    });

    it("should handle zoom operations", () => {
      viewer.setZoom(2);
      expect(mockMapInstance.setZoom).toHaveBeenCalledWith(2);

      mockMapInstance.getZoom.mockReturnValue(2);
      expect(viewer.getZoom()).toBe(2);
    });

    it("should handle center operations", () => {
      mockMapInstance.getCenter.mockClear();
      viewer.setCenter([512, 512]);

      expect(mockMapInstance.setCenter).toHaveBeenCalledWith({
        lat: 55.776573018667705,
        lng: -67.5,
      });

      const viewerCenter = viewer.getCenter();
      expect(viewerCenter[0]).toBeCloseTo(512);
      expect(viewerCenter[1]).toBeCloseTo(512);
    });

    it("should handle bearing operations", () => {
      viewer.setBearing(45);
      expect(mockMapInstance.setBearing).toHaveBeenCalledWith(45);

      mockMapInstance.getBearing.mockReturnValue(45);
      expect(viewer.getBearing()).toBe(45);
    });

    it("should handle flyTo with image coordinates", () => {
      viewer.flyTo({
        center: [100, 200],
        zoom: 2,
        bearing: 10,
      });

      expect(mockMapInstance.flyTo).toHaveBeenCalledWith(
        expect.objectContaining({
          center: expect.objectContaining({
            lat: 84.23194746223982,
            lng: -175.60546875,
          }),
          zoom: 2,
          bearing: 10,
          pitch: 0,
        }),
        undefined,
      );
    });

    it("should handle jumpTo with image coordinates", () => {
      viewer.jumpTo({
        center: [100, 200],
        zoom: 3,
        bearing: 123,
      });

      expect(mockMapInstance.jumpTo).toHaveBeenCalledWith(
        expect.objectContaining({
          center: expect.objectContaining({
            lng: -175.60546875,
            lat: 84.23194746223982,
          }),
          zoom: 3,
          bearing: 123,
          pitch: 0,
        }),
        undefined,
      );
    });

    it("should handle panBy operations", () => {
      viewer.panBy([10, 20], undefined, { data: "yes" });
      expect(mockMapInstance.panBy).toHaveBeenCalledWith([10, 20], { pitch: 0 }, { data: "yes" });
    });

    it("should handle panTo operations", () => {
      viewer.panTo([150, 250], undefined, { data: "yes" });
      expect(mockMapInstance.panTo).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: 84.00685244708399,
          lng: -173.408203125,
        }),
        { pitch: 0 },
        { data: "yes" },
      );
    });
  });

  describe("Handler Properties", () => {
    let viewer: ImageViewer;
    let mockMapInstance: any;

    beforeEach(async () => {
      viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });
      await viewer.onReadyAsync();

      const MockedMap = Map as unknown as Mock;
      mockMapInstance = MockedMap.mock.results[0].value;
    });

    it("should proxy scrollZoom handler", () => {
      const newHandler = { isEnabled: vi.fn(), enable: vi.fn(), disable: vi.fn() } as unknown as ScrollZoomHandler;
      viewer.scrollZoom = newHandler;
      expect(mockMapInstance.scrollZoom).toBe(newHandler);

      expect(viewer.scrollZoom).toBe(mockMapInstance.scrollZoom);
    });

    it("should proxy boxZoom handler", () => {
      const newHandler = { isEnabled: vi.fn(), enable: vi.fn(), disable: vi.fn() } as unknown as BoxZoomHandler;
      viewer.boxZoom = newHandler;
      expect(mockMapInstance.boxZoom).toBe(newHandler);

      expect(viewer.boxZoom).toBe(mockMapInstance.boxZoom);
    });

    it("should proxy dragPan handler", () => {
      const newHandler = { isEnabled: vi.fn(), enable: vi.fn(), disable: vi.fn() } as unknown as DragPanHandler;
      viewer.dragPan = newHandler;
      expect(mockMapInstance.dragPan).toBe(newHandler);

      expect(viewer.dragPan).toBe(mockMapInstance.dragPan);
    });

    it("should proxy keyboard handler", () => {
      const newHandler = { isEnabled: vi.fn(), enable: vi.fn(), disable: vi.fn() } as unknown as KeyboardHandler;
      viewer.keyboard = newHandler;
      expect(mockMapInstance.keyboard).toBe(newHandler);

      expect(viewer.keyboard).toBe(mockMapInstance.keyboard);
    });

    it("should proxy doubleClickZoom handler", () => {
      const newHandler = { isEnabled: vi.fn(), enable: vi.fn(), disable: vi.fn() } as unknown as DoubleClickZoomHandler;
      viewer.doubleClickZoom = newHandler;
      expect(mockMapInstance.doubleClickZoom).toBe(newHandler);

      expect(viewer.doubleClickZoom).toBe(mockMapInstance.doubleClickZoom);
    });

    it("should proxy touchZoomRotate handler", () => {
      const newHandler = { isEnabled: vi.fn(), enable: vi.fn(), disable: vi.fn() } as unknown as TwoFingersTouchZoomRotateHandler;
      viewer.touchZoomRotate = newHandler;
      expect(mockMapInstance.touchZoomRotate).toBe(newHandler);

      expect(viewer.touchZoomRotate).toBe(mockMapInstance.touchZoomRotate);
    });

    it("should proxy cooperativeGestures handler", () => {
      const newHandler = { isEnabled: vi.fn(), enable: vi.fn(), disable: vi.fn() } as unknown as CooperativeGesturesHandler;
      viewer.cooperativeGestures = newHandler;
      expect(mockMapInstance.cooperativeGestures).toBe(newHandler);

      expect(viewer.cooperativeGestures).toBe(mockMapInstance.cooperativeGestures);
    });
  });

  describe("Event System", () => {
    it("should create ImageViewerEvent correctly", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await viewer.onReadyAsync();

      const mouseEvent = new MouseEvent("click");
      const data = { x: 100, y: 200 };

      const event = new ImageViewerEvent("click", viewer, mouseEvent, data);

      expect(event.type).toBe("click");
      expect(event.target).toBe(viewer);
      expect(event.originalEvent).toBe(mouseEvent);
      expect(event.x).toBe(100);
      expect(event.y).toBe(200);
    });

    it("should handle null originalEvent", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await viewer.onReadyAsync();

      const event = new ImageViewerEvent("load", viewer);

      expect(event.type).toBe("load");
      expect(event.target).toBe(viewer);
      expect(event.originalEvent).toBeNull();
      expect(event.data).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("should create FetchError with correct properties", () => {
      const mockResponse = {
        status: 404,
        statusText: "Not Found",
        url: "https://api.example.com/image.json",
      } as Response;

      const error = new FetchError(mockResponse, "image metadata", "ImageViewer");

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("FetchError");
      expect(error.status).toBe(404);
      expect(error.statusText).toBe("Not Found");
      expect(error.message).toContain("Failed to fetch image metadata");
      expect(error.message).toContain("404");
      expect(error.message).toContain("Not Found");
    });
  });

  describe("Utility Methods", () => {
    let viewer: ImageViewer;
    let mockMapInstance: any;

    beforeEach(async () => {
      viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });
      await viewer.onReadyAsync();

      const MockedMap = Map as unknown as Mock;
      mockMapInstance = MockedMap.mock.results[0].value;
    });

    it("should call triggerRepaint on underlying map", () => {
      viewer.triggerRepaint();
      expect(mockMapInstance.triggerRepaint).toHaveBeenCalledOnce();
    });

    it("should return version from underlying map", () => {
      expect(viewer.version).toBe("1.0.0");
    });
  });

  describe("Integration with Fixture Data", () => {
    it("should properly initialize with real fixture metadata", async () => {
      const viewer = new ImageViewer({
        zoom: 2,
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      // Should not throw
      await viewer.onReadyAsync();

      // Should be able to call methods
      viewer.setZoom(2);
      viewer.setCenter([100, 200]);
      viewer.triggerRepaint();

      expect(viewer.getSDKInternal().setZoom).toHaveBeenCalledWith(2);

      expect(viewer.getCenter()).toEqual([100, 200]);
      expect(viewer.getBearing()).toBe(0);

      // Verify fixture metadata values were used
      const MockedMap = Map as unknown as Mock;
      const mockMapInstance = MockedMap.mock.results[0].value;
      const addSourceCall = mockMapInstance.addSource.mock.calls[0];

      expect(addSourceCall[1].tileSize).toBe(fixtureImageMetadata.tileSize);
    });

    it("should handle complete workflow with fixture data", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: true,
      });

      // Initialize with fixture data
      await viewer.onReadyAsync();

      // Interact with the viewer
      viewer.flyTo({ center: [500, 600], zoom: 3 });
      viewer.panBy([10, 20]);
      viewer.setZoom(4);

      const MockedMap = Map as unknown as Mock;
      const mockMapInstance = MockedMap.mock.results[0].value;

      // Verify all interactions were properly delegated
      expect(mockMapInstance.flyTo).toHaveBeenCalled();
      expect(mockMapInstance.panBy).toHaveBeenCalled();
      expect(mockMapInstance.setZoom).toHaveBeenCalledWith(4);

      // Verify we can fetch image tiles
      const tileResponse = await mockFetch("https://api.example.com/test-uuid/1/0/0");
      expect(tileResponse.ok).toBe(true);
    });

    it("should handle fitImageBounds correctly", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });
      await viewer.onReadyAsync();

      viewer.fitImageBounds([
        [0, 0],
        [5120 / 2, 5120 / 2],
      ]);

      expect(viewer.getSDKInternal().fitBounds).toHaveBeenCalledWith({
        _ne: {
          lat: 55.776573018667705,
          lng: -67.5,
        },
        _sw: {
          lat: 85.05112877980659,
          lng: -180,
        },
      });
    });

    it("should handle getImageBounds correctly", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await viewer.onReadyAsync();

      expect(viewer.getImageBounds()).toEqual([
        [4096, 4096],
        [6144, 4096],
      ]);
    });

    it("should return the correct imagemetadata", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });
      await viewer.onReadyAsync();

      expect(viewer.getImageMetadata()).toEqual(fixtureImageMetadata);
    });

    it("should destroy itself correctly", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await viewer.onReadyAsync();

      viewer.on("beforeremove", () => {
        console.log("beforeremove");
      });

      viewer.on("click", () => {
        console.log("click");
      });

      vi.spyOn(viewer, "off");

      viewer.remove();

      expect(viewer.getSDKInternal().remove).toHaveBeenCalled();

      // 3 event listeners will be removed
      // 1 init, 2 beforedestroy, 1 click
      expect(viewer.off).toHaveBeenCalledTimes(3);
    });
  });
  describe("Cutline", () => {
    const triangle: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 50],
    ];

    function createViewer(options: Partial<ImageViewerConstructorOptions> = {}) {
      return new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
        ...options,
      });
    }

    it("should have no cutline by default", () => {
      expect(createViewer().getCutline()).toBeNull();
    });

    it("should take the cutline from the constructor options", () => {
      expect(createViewer({ cutline: triangle }).getCutline()).toEqual(triangle);
    });

    it("should not pass the cutline to the map", () => {
      createViewer({ cutline: triangle });

      const MockedMap = Map as unknown as Mock;
      expect(MockedMap.mock.calls[0][0]).not.toHaveProperty("cutline");
    });

    it("should throw in the constructor for an invalid cutline", () => {
      expect(() => createViewer({ cutline: triangle.slice(0, 2) })).toThrow("[ImageViewer]: `cutline` must have at least 3 points, got 2");
    });

    it("should return a copy of the cutline", () => {
      const viewer = createViewer({ cutline: triangle });

      const cutline = viewer.getCutline();
      cutline?.[0].splice(0, 2, 999, 999);
      cutline?.pop();

      expect(viewer.getCutline()).toEqual(triangle);
    });

    it("should not be affected by changes to the array it was given", () => {
      const cutline = triangle.map(([x, y]) => [x, y] as [number, number]);
      const viewer = createViewer().setCutline(cutline);

      cutline[0][0] = 999;

      expect(viewer.getCutline()).toEqual(triangle);
    });

    it("should set the cutline and fire cutlinechange with a copy of it", () => {
      const viewer = createViewer();
      const listener = vi.fn();
      viewer.on("cutlinechange", listener);

      expect(viewer.setCutline(triangle)).toBe(viewer);
      expect(viewer.getCutline()).toEqual(triangle);

      expect(listener).toHaveBeenCalledTimes(1);
      const event = (listener.mock.calls[0] as [ImageViewerCutlineChangeEvent])[0];
      expect(event).toBeInstanceOf(ImageViewerEvent);
      expect(event.type).toBe("cutlinechange");
      expect(event.target).toBe(viewer);
      expect(event.cutline).toEqual(triangle);
      expect(event.cutline).not.toBe(triangle);
    });

    it("should remove the cutline with null and fire cutlinechange", () => {
      const viewer = createViewer({ cutline: triangle });
      const listener = vi.fn();
      viewer.on("cutlinechange", listener);

      viewer.setCutline(null);

      expect(viewer.getCutline()).toBeNull();
      expect((listener.mock.calls[0] as [ImageViewerCutlineChangeEvent])[0].cutline).toBeNull();
    });

    it("should not fire cutlinechange for the constructor option", () => {
      const listener = vi.fn();
      const viewer = createViewer({ cutline: triangle });
      viewer.on("cutlinechange", listener);

      expect(listener).not.toHaveBeenCalled();
    });

    it("should keep the current cutline and not fire when setting an invalid one", () => {
      const viewer = createViewer({ cutline: triangle });
      const listener = vi.fn();
      viewer.on("cutlinechange", listener);

      expect(() => viewer.setCutline([[0, 0]])).toThrow("got 1");

      expect(viewer.getCutline()).toEqual(triangle);
      expect(listener).not.toHaveBeenCalled();
    });

    it("should work before the viewer is ready", () => {
      const viewer = createViewer();

      viewer.setCutline(triangle);

      expect(viewer.getCutline()).toEqual(triangle);
    });
  });

  describe("Outside cutline layer", () => {
    // the fixture image is 5120 x 5120 px, its tiles cover 8192 px
    const PADDED_SIZE = 8192;
    const square: [number, number][] = [
      [512, 512],
      [4608, 512],
      [4608, 4608],
      [512, 4608],
    ];

    function getMockMap() {
      const MockedMap = Map as unknown as Mock;
      return MockedMap.mock.results[0].value as { addLayer: Mock; removeLayer: Mock; triggerRepaint: Mock };
    }

    function getAddedOutsideCutlineLayers() {
      return getMockMap()
        .addLayer.mock.calls.map(([layer]) => layer as unknown)
        .filter((layer): layer is OutsideCutlineLayer => layer instanceof OutsideCutlineLayer);
    }

    function getLayerData(layer: OutsideCutlineLayer) {
      return (layer as unknown as { data: OutsideCutlineLayerData }).data;
    }

    function createViewer(options: Partial<ImageViewerConstructorOptions> = {}) {
      return new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
        ...options,
      });
    }

    async function createReadyViewer(options: Partial<ImageViewerConstructorOptions> = {}) {
      const viewer = createViewer(options);
      await viewer.onReadyAsync();
      return viewer;
    }

    it("should not add the layer without a cutline", async () => {
      await createReadyViewer();

      expect(getAddedOutsideCutlineLayers()).toHaveLength(0);
    });

    it("should add the layer above the image for the cutline option", async () => {
      await createReadyViewer({ cutline: square });

      const addLayer = getMockMap().addLayer;
      const layers = getAddedOutsideCutlineLayers();
      expect(layers).toHaveLength(1);
      expect(layers[0].id).toBe(OUTSIDE_CUTLINE_LAYER_ID);
      // added after the image layer, so it is drawn on top of it
      expect(addLayer.mock.calls.map(([layer]) => (layer as { id: string }).id)).toEqual(["image", OUTSIDE_CUTLINE_LAYER_ID]);

      expect(getLayerData(layers[0])).toEqual({
        cutline: square,
        imageSize: [5120, 5120],
        paddedSize: PADDED_SIZE,
        // hidden by default
        color: [0, 0, 0, 0],
      });
    });

    it("should leave the triangulation to the layer, which does it when drawn", async () => {
      const viewer = await createReadyViewer({ cutline: square });

      viewer.setCutline(square.slice(0, 3));
      viewer.setCutline(square);

      expect(triangulateOutsideCutline).not.toHaveBeenCalled();
    });

    it("should pass the layer the same cutline on a style change, so it keeps its triangles", async () => {
      const viewer = await createReadyViewer({ cutline: square });
      const [layer] = getAddedOutsideCutlineLayers();
      const { cutline } = getLayerData(layer);

      viewer.setOutsideCutlineStyle({ type: "overlay", color: "black" });

      expect(getLayerData(layer).cutline).toBe(cutline);
    });

    it("should add the layer once ready when the cutline is set before", async () => {
      const viewer = createViewer();
      viewer.setCutline(square);

      expect(getAddedOutsideCutlineLayers()).toHaveLength(0);

      await viewer.onReadyAsync();

      expect(getAddedOutsideCutlineLayers()).toHaveLength(1);
    });

    it("should add the layer when a cutline is set after the viewer is ready", async () => {
      const viewer = await createReadyViewer();

      viewer.setCutline(square);

      expect(getAddedOutsideCutlineLayers()).toHaveLength(1);
    });

    it("should update the existing layer when the cutline changes", async () => {
      const viewer = await createReadyViewer({ cutline: square });
      const [layer] = getAddedOutsideCutlineLayers();
      const repaints = getMockMap().triggerRepaint.mock.calls.length;

      viewer.setCutline([
        [0, 0],
        [100, 0],
        [100, 100],
      ]);

      expect(getAddedOutsideCutlineLayers()).toHaveLength(1);
      expect(getLayerData(layer).cutline).toEqual([
        [0, 0],
        [100, 0],
        [100, 100],
      ]);
      expect(getMockMap().triggerRepaint.mock.calls.length).toBe(repaints + 1);
    });

    it("should remove the layer when the cutline is removed, and add a new one for the next cutline", async () => {
      const viewer = await createReadyViewer({ cutline: square });

      viewer.setCutline(null);

      expect(getMockMap().removeLayer).toHaveBeenCalledWith(OUTSIDE_CUTLINE_LAYER_ID);

      viewer.setCutline(square);

      expect(getAddedOutsideCutlineLayers()).toHaveLength(2);
    });

    it("should leave the layer as is when the cutline is invalid", async () => {
      const viewer = await createReadyViewer({ cutline: square });
      const [layer] = getAddedOutsideCutlineLayers();
      const data = getLayerData(layer);

      expect(() => viewer.setCutline([[0, 0]])).toThrow("got 1");

      expect(getLayerData(layer)).toBe(data);
      expect(getMockMap().removeLayer).not.toHaveBeenCalled();
    });

    describe("outsideCutlineStyle", () => {
      it("should be hidden by default", () => {
        expect(createViewer().getOutsideCutlineStyle()).toEqual({ type: "hidden" });
      });

      it("should take the style from the constructor options, and draw its color premultiplied", async () => {
        const viewer = await createReadyViewer({ cutline: square, outsideCutlineStyle: { type: "overlay", color: "rgba(255, 0, 0, 0.5)" } });

        expect(viewer.getOutsideCutlineStyle()).toEqual({ type: "overlay", color: "rgba(255, 0, 0, 0.5)" });
        expect(getLayerData(getAddedOutsideCutlineLayers()[0]).color).toEqual([0.5, 0, 0, 0.5]);
      });

      it("should not pass the style to the map", () => {
        createViewer({ outsideCutlineStyle: { type: "overlay", color: "red" } });

        const MockedMap = Map as unknown as Mock;
        expect(MockedMap.mock.calls[0][0]).not.toHaveProperty("outsideCutlineStyle");
      });

      it("should throw in the constructor for an invalid style", () => {
        expect(() => createViewer({ outsideCutlineStyle: { type: "overlay", color: "not-a-color" } })).toThrow(
          "[ImageViewer]: `outsideCutlineStyle.color` must be a valid CSS color",
        );
      });

      it("should update the layer color, and return the viewer", async () => {
        const viewer = await createReadyViewer({ cutline: square });
        const [layer] = getAddedOutsideCutlineLayers();

        expect(viewer.setOutsideCutlineStyle({ type: "overlay", color: "black" })).toBe(viewer);
        expect(getLayerData(layer).color).toEqual([0, 0, 0, 1]);

        viewer.setOutsideCutlineStyle({ type: "hidden" });
        expect(getLayerData(layer).color).toEqual([0, 0, 0, 0]);
      });

      it("should be kept without a cutline, and used for the next one", async () => {
        const viewer = await createReadyViewer();

        viewer.setOutsideCutlineStyle({ type: "overlay", color: "black" });
        expect(getAddedOutsideCutlineLayers()).toHaveLength(0);

        viewer.setCutline(square);
        expect(getLayerData(getAddedOutsideCutlineLayers()[0]).color).toEqual([0, 0, 0, 1]);
      });

      it("should keep the current style when the new one is invalid", () => {
        const viewer = createViewer({ outsideCutlineStyle: { type: "overlay", color: "red" } });

        // @ts-expect-error - testing an invalid type
        expect(() => viewer.setOutsideCutlineStyle({ type: "blur" })).toThrow('`outsideCutlineStyle.type` must be "hidden" or "overlay"');

        expect(viewer.getOutsideCutlineStyle()).toEqual({ type: "overlay", color: "red" });
      });

      it("should return a copy of the style", () => {
        const viewer = createViewer({ outsideCutlineStyle: { type: "overlay", color: "red" } });

        (viewer.getOutsideCutlineStyle() as { color: string }).color = "blue";

        expect(viewer.getOutsideCutlineStyle()).toEqual({ type: "overlay", color: "red" });
      });
    });
  });

  describe("Controls", () => {
    it("should add the navigation and fit image to bounds controls by default", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
      });

      await viewer.onReadyAsync();

      const MockedMap = Map as unknown as Mock;
      const mockMapInstance = MockedMap.mock.results[0].value;

      expect(mockMapInstance.addControl).toHaveBeenCalledWith(expect.any(NavigationControl));
      expect(mockMapInstance.addControl).toHaveBeenCalledWith(expect.any(ImageViewerFitImageToBoundsControl));
    });

    it("should not add the controls when disabled", async () => {
      const viewer = new ImageViewer({
        container: container,
        imageUUID: "test-uuid",
        apiKey: "test-key",
        debug: false,
        navigationControl: false,
        fitToBoundsControl: false,
      });

      await viewer.onReadyAsync();

      const MockedMap = Map as unknown as Mock;
      const mockMapInstance = MockedMap.mock.results[0].value;

      expect(mockMapInstance.addControl).not.toHaveBeenCalled();
    });
  });
});
