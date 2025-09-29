/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/dot-notation */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageViewerMarker, ImageViewerMarkerEvent } from "../src/ImageViewer/ImageViewerMarker";
import ImageViewer from "../src/ImageViewer/ImageViewer";
import { lngLatToPxInternalSymbolKey, pxToLngLatInternalSymbolKey, sdkSymbolKey } from "../src/ImageViewer/symbols";
import { Popup, PointLike, Alignment, LngLat, Marker, Point } from "../src/index";

vi.mock("../src/index");

vi.mock("../src/ImageViewer/ImageViewer", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import("../src/ImageViewer/ImageViewer") as typeof import("../src/ImageViewer/ImageViewer");

  const { lngLatToPxInternalSymbolKey, pxToLngLatInternalSymbolKey, sdkSymbolKey } = await import("../src/ImageViewer/symbols");

  class MockImageViewer {
    [sdkSymbolKey] = {
      version: "1.0.0",
      getContainer: vi.fn(() => document.createElement("div")),
    };
    [lngLatToPxInternalSymbolKey] = vi.fn((_: LngLat) => [100, 100] as [number, number]);
    [pxToLngLatInternalSymbolKey] = vi.fn((px: [number, number]) => new LngLat(px[0] / 100, px[1] / 100));
  }

  return {
    ...actual,
    default: MockImageViewer,
  };
});

function createNewMocks() {
  const mockImageViewer = new ImageViewer({ container: "map", imageUUID: "test-uuid" });
  mockImageViewer[lngLatToPxInternalSymbolKey] = vi.fn((lngLat: LngLat) => [lngLat.lng * 100, lngLat.lat * 100] as [number, number]);
  mockImageViewer[pxToLngLatInternalSymbolKey] = vi.fn((px: [number, number]) => new LngLat(px[0] / 100, px[1] / 100));
  (mockImageViewer as any).pointIsWithinImageBounds = vi.fn().mockReturnValue(true);

  const imageViewerMarker = new ImageViewerMarker({
    draggable: true,
  });

  return {
    mockImageViewer,
    imageViewerMarker,
  };
}

describe("ImageViewerMarker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe("constructor", () => {
    it("should pass options to Marker constructor", () => {
      const options = { draggable: true };

      const imageViewerMarker = new ImageViewerMarker(options);

      // @ts-expect-error - marker is private
      expect(imageViewerMarker.marker).toBeInstanceOf(Marker);

      expect(Marker).toHaveBeenCalledWith(options);
    });
  });

  describe("addTo", () => {
    it("should add the marker to the viewer's map instance", () => {
      const { imageViewerMarker, mockImageViewer } = createNewMocks();

      imageViewerMarker.addTo(mockImageViewer);
      expect(imageViewerMarker["marker"].addTo).toHaveBeenCalledWith(mockImageViewer[sdkSymbolKey]);
    });

    it("should throw an error if not added to an ImageViewer instance", () => {
      const { imageViewerMarker } = createNewMocks();
      expect(() => imageViewerMarker.addTo({} as ImageViewer)).toThrow("[ImageViewerMarker]: an ImageViewerMarker must be added to an instance of ImageViewer");
    });

    it("should setup event forwarders", () => {
      const { imageViewerMarker, mockImageViewer } = createNewMocks();

      imageViewerMarker.addTo(mockImageViewer);

      expect(imageViewerMarker["marker"].on).toHaveBeenCalledWith("dragstart", expect.any(Function));
      expect(imageViewerMarker["marker"].on).toHaveBeenCalledWith("drag", expect.any(Function));
      expect(imageViewerMarker["marker"].on).toHaveBeenCalledWith("dragend", expect.any(Function));
    });

    it("should set the initial position", () => {
      const { imageViewerMarker, mockImageViewer } = createNewMocks();

      imageViewerMarker.setPosition([10, 20]);
      imageViewerMarker.addTo(mockImageViewer);

      expect(mockImageViewer[pxToLngLatInternalSymbolKey]).toHaveBeenCalledWith([10, 20]);
      const expectedLngLat = new LngLat(0.1, 0.2);

      // @ts-expect-error - mock.calls is not available on the Marker instance
      const lngLat = imageViewerMarker["marker"].setLngLat.mock.calls[0][0];

      expect(lngLat.lng).toEqual(expectedLngLat.lng);
      expect(lngLat.lat).toEqual(expectedLngLat.lat);
    });
  });

  describe("getters", () => {
    it("getElement should call marker.getElement", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.getElement();
      expect(imageViewerMarker["marker"].getElement).toHaveBeenCalled();
    });

    it("getPosition should return the stored position", () => {
      const pos: [number, number] = [100, 200];
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.setPosition(pos);
      expect(imageViewerMarker.getPosition()).toEqual(pos);
    });

    it("getOffset should call marker.getOffset", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.getOffset();
      expect(imageViewerMarker["marker"].getOffset).toHaveBeenCalled();
    });

    it("getPitchAlignment should call marker.getPitchAlignment", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.getPitchAlignment();
      expect(imageViewerMarker["marker"].getPitchAlignment).toHaveBeenCalled();
    });

    it("getPopup should call marker.getPopup", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.getPopup();
      expect(imageViewerMarker["marker"].getPopup).toHaveBeenCalled();
    });

    it("getRotation should call marker.getRotation", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.getRotation();
      expect(imageViewerMarker["marker"].getRotation).toHaveBeenCalled();
    });

    it("getRotationAlignment should call marker.getRotationAlignment", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.getRotationAlignment();
      expect(imageViewerMarker["marker"].getRotationAlignment).toHaveBeenCalled();
    });

    it("isDraggable should call marker.isDraggable", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.isDraggable();
      expect(imageViewerMarker["marker"].isDraggable).toHaveBeenCalled();
    });
  });

  describe("setters", () => {
    it("addClassName should call marker.addClassName", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.addClassName("test-class");
      expect(imageViewerMarker["marker"].addClassName).toHaveBeenCalledWith("test-class");
    });

    it("setDraggable should call marker.setDraggable", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.setDraggable(true);
      expect(imageViewerMarker["marker"].setDraggable).toHaveBeenCalledWith(true);
    });

    it("setPosition should update position and call marker.setLngLat if viewer is set", () => {
      const { imageViewerMarker, mockImageViewer } = createNewMocks();

      imageViewerMarker.addTo(mockImageViewer);
      const pos: [number, number] = [150, 250];
      imageViewerMarker.setPosition(pos);
      expect(imageViewerMarker.getPosition()).toEqual(pos);
      expect(mockImageViewer[pxToLngLatInternalSymbolKey]).toHaveBeenCalledWith(pos);

      imageViewerMarker.setPosition([10, 20]);
      imageViewerMarker.addTo(mockImageViewer);

      expect(mockImageViewer[pxToLngLatInternalSymbolKey]).toHaveBeenCalledWith([10, 20]);
      const expectedLngLat = new LngLat(0.1, 0.2);

      // @ts-expect-error - mock.calls is not available on the Marker instance
      const lngLat = imageViewerMarker["marker"].setLngLat.mock.calls[0][0];

      expect(lngLat.lng).toEqual(expectedLngLat.lng);
      expect(lngLat.lat).toEqual(expectedLngLat.lat);
    });

    it("setPosition should only update position if viewer is not set", () => {
      const { imageViewerMarker } = createNewMocks();

      const pos: [number, number] = [150, 250];
      imageViewerMarker.setPosition(pos);
      expect(imageViewerMarker.getPosition()).toEqual(pos);
      expect(imageViewerMarker["marker"].setLngLat).not.toHaveBeenCalled();
    });

    it("setOffset should call marker.setOffset", () => {
      const { imageViewerMarker } = createNewMocks();

      const offset = new Point(10, 20);
      imageViewerMarker.setOffset(offset);
      expect(imageViewerMarker["marker"].setOffset).toHaveBeenCalledWith(offset);
    });

    it("setOpacity should call marker.setOpacity", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.setOpacity("0.5", "0.2");
      expect(imageViewerMarker["marker"].setOpacity).toHaveBeenCalledWith("0.5", "0.2");
    });

    it("setPitchAlignment should call marker.setPitchAlignment", () => {
      const { imageViewerMarker } = createNewMocks();

      const alignment: Alignment = "map";
      imageViewerMarker.setPitchAlignment(alignment);
      expect(imageViewerMarker["marker"].setPitchAlignment).toHaveBeenCalledWith(alignment);
    });

    it("setPopup should call marker.setPopup", () => {
      const { imageViewerMarker } = createNewMocks();

      const popup = {} as Popup;
      imageViewerMarker.setPopup(popup);
      expect(imageViewerMarker["marker"].setPopup).toHaveBeenCalledWith(popup);
    });

    it("setRotation should call marker.setRotation", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.setRotation(90);
      expect(imageViewerMarker["marker"].setRotation).toHaveBeenCalledWith(90);
    });

    it("setRotationAlignment should call marker.setRotationAlignment", () => {
      const { imageViewerMarker } = createNewMocks();

      const alignment: Alignment = "viewport";
      imageViewerMarker.setRotationAlignment(alignment);
      expect(imageViewerMarker["marker"].setRotationAlignment).toHaveBeenCalledWith(alignment);
    });

    it("setSubpixelPositioning should call marker.setSubpixelPositioning", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.setSubpixelPositioning(true);
      expect(imageViewerMarker["marker"].setSubpixelPositioning).toHaveBeenCalledWith(true);
    });
  });

  describe("eventing", () => {
    it("on, off, fire should work as expected", () => {
      const listener = vi.fn();
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.on("drag", listener);
      const event = new ImageViewerMarkerEvent("drag", imageViewerMarker, { data: "test" });
      imageViewerMarker.fire("drag", event);

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: "drag", target: imageViewerMarker, data: "test" }));

      imageViewerMarker.off("drag", listener);
      imageViewerMarker.fire("drag", event);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should forward marker events", async () => {
      const MockMarker = vi.mocked(Marker);

      // Temporarily give it a new, complex implementation for THIS TEST ONLY
      MockMarker.mockImplementation(() => {
        const listeners = new Map<string, Function[]>();
        return {
          on: vi.fn((eventName, listener) => {
            if (!listeners.has(eventName)) listeners.set(eventName, []);
            listeners.get(eventName)!.push(listener);
          }),
          fire: vi.fn((eventName, eventObject) => {
            if (listeners.has(eventName)) {
              listeners.get(eventName)!.forEach(l => l(eventObject));
            }
          }),
          // Add any other simple methods this test might need
          addTo: vi.fn().mockReturnThis(), 
          setLngLat: vi.fn().mockReturnThis(),
        };
      });

      const { imageViewerMarker, mockImageViewer } = createNewMocks();

      const dragStartListener = vi.fn(() => {
        console.log("dragstart");
      });

      imageViewerMarker.on("dragstart", dragStartListener);

      const dragListener = vi.fn();
      imageViewerMarker.on("drag", dragListener);

      const dragEndListener = vi.fn();
      imageViewerMarker.on("dragend", dragEndListener);

      imageViewerMarker.addTo(mockImageViewer);

      const mockMapLibreEvent = {
        target: {
          getLngLat: () => new LngLat(0.5, 0.7),
        },
        originalEvent: "something",
      };

      imageViewerMarker["marker"].fire("dragstart", mockMapLibreEvent);
      imageViewerMarker["marker"].fire("drag", mockMapLibreEvent);
      imageViewerMarker["marker"].fire("dragend", mockMapLibreEvent);

      await vi.waitFor(() => expect(dragListener).toHaveBeenCalled());
      await vi.waitFor(() => expect(dragStartListener).toHaveBeenCalled());
      await vi.waitFor(() => expect(dragEndListener).toHaveBeenCalled());

      expect(dragListener).toHaveBeenCalledWith(expect.objectContaining({ type: "drag", target: imageViewerMarker, originalEvent: "something" }));
      expect(dragStartListener).toHaveBeenCalledWith(expect.objectContaining({ type: "dragstart", target: imageViewerMarker, originalEvent: "something" }));
      expect(dragEndListener).toHaveBeenCalledWith(expect.objectContaining({ type: "dragend", target: imageViewerMarker, originalEvent: "something" }));
    });
  });

  describe("utility methods", () => {
    it("isWithinImageBounds should call viewer.pointIsWithinImageBounds", () => {
      const { imageViewerMarker, mockImageViewer } = createNewMocks();

      imageViewerMarker.addTo(mockImageViewer);
      imageViewerMarker.setPosition([50, 50]);
      imageViewerMarker.isWithinImageBounds();
      expect((mockImageViewer as any).pointIsWithinImageBounds).toHaveBeenCalledWith([50, 50]);
    });

    it("remove should call marker.remove", () => {
      const { imageViewerMarker } = createNewMocks();
      imageViewerMarker.remove();
      expect(imageViewerMarker["marker"].remove).toHaveBeenCalled();
    });

    it("removeClassName should call marker.removeClassName", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.removeClassName("test-class");

      expect(imageViewerMarker["marker"].removeClassName).toHaveBeenCalledWith("test-class");
    });

    it("toggleClassName should call marker.toggleClassName", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.toggleClassName("test-class");
      expect(imageViewerMarker["marker"].toggleClassName).toHaveBeenCalledWith("test-class");
    });

    it("togglePopup should call marker.togglePopup", () => {
      const { imageViewerMarker } = createNewMocks();

      imageViewerMarker.togglePopup();
      expect(imageViewerMarker["marker"].togglePopup).toHaveBeenCalled();
    });
  });
});
