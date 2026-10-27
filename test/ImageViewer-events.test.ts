import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { Event as EventML, LngLat } from "maplibre-gl";
import ImageViewer from "../src/ImageViewer/ImageViewer";
import { ImageViewerEvent, setupGlobalMapEventForwarder, type ImageViewerEventType, type ImageViewerInitErrorEvent } from "../src/ImageViewer/events";
import type { ImageViewerEventTypes } from "../src/ImageViewer";
import type { Map } from "../src/Map";
import type * as sdk from "../src/index";

// MapLibre 6 made `Evented` generic: without an event map, listeners had to
// accept the base `Event`, so listeners typed with the SDK's own
// `ImageViewerEvent` were rejected. These tests are checked by `tsc` as well as
// run — the type assertions fail the build, not the test run.

/** An ImageViewer with no map behind it — `Evented` keeps no constructor state, so `on` / `off` / `fire` work as is. */
function createViewer(imageMetadata = { width: 100, height: 50 }): ImageViewer {
  const viewer = Object.create(ImageViewer.prototype) as ImageViewer;
  Object.assign(viewer, { imageMetadata });
  return viewer;
}

//#region Types

describe("ImageViewer event types", () => {
  it("compiles the reported snippet, against the package entry's exports", () => {
    const viewer: sdk.ImageViewer = createViewer();

    // as reported: TS2345, '(e: ImageViewerEvent) => void' not assignable to '(event: Event<string>) => void'
    viewer.on("click", (e: sdk.ImageViewerEvent) => {
      expectTypeOf(e.imageX).toBeNumber();
      expectTypeOf(e.imageY).toBeNumber();
    });

    expectTypeOf<sdk.ImageViewerEventType["click"]>().toEqualTypeOf<sdk.ImageViewerEvent>();
    expectTypeOf<sdk.ImageViewerEventType["imagevieweriniterror"]>().toEqualTypeOf<sdk.ImageViewerInitErrorEvent>();
  });

  it("accepts listeners typed with ImageViewerEvent for forwarded and viewer events", () => {
    const viewer = createViewer();
    const listener = (e: ImageViewerEvent) => e.imageX + e.imageY;

    // each of these was TS2345 before the fix
    viewer.on("click", listener);
    viewer.off("click", listener);
    viewer.once("mousemove", listener);
    viewer.on("imageviewerready", (e: ImageViewerEvent) => e.target);
    viewer.on("beforeremove", (e: ImageViewerEvent) => e.target);
  });

  it("types the listener's event from the event name", () => {
    const viewer = createViewer();

    viewer.on("click", (e) => {
      expectTypeOf(e).toEqualTypeOf<ImageViewerEvent>();
      expectTypeOf(e.imageX).toBeNumber();
      expectTypeOf(e.isOutOfBounds).toBeBoolean();
      expectTypeOf(e.target).toEqualTypeOf<ImageViewer>();
    });
    viewer.on("imagevieweriniterror", (e) => {
      expectTypeOf(e).toEqualTypeOf<ImageViewerInitErrorEvent>();
      expectTypeOf(e.error).toEqualTypeOf<Error>();
    });
  });

  it("types once() without a listener as a promise of the event", () => {
    const viewer = createViewer();
    expectTypeOf(viewer.once("imageviewerready")).resolves.toEqualTypeOf<ImageViewerEvent>();
    expectTypeOf(viewer.once("imagevieweriniterror")).resolves.toEqualTypeOf<ImageViewerInitErrorEvent>();
  });

  it("has an event map entry for every event type, each a MapLibre Event", () => {
    expectTypeOf<keyof ImageViewerEventType>().toEqualTypeOf<ImageViewerEventTypes>();
    expectTypeOf<ImageViewerEvent>().toExtend<EventML>();
    expectTypeOf<ImageViewerInitErrorEvent>().toExtend<EventML>();
  });

  it("rejects unknown event types and listeners expecting the wrong payload", () => {
    const viewer = createViewer();

    // @ts-expect-error - not an ImageViewer event
    viewer.on("not-an-event", () => undefined);
    // @ts-expect-error - the init error carries `{ error }`, not an ImageViewerEvent
    viewer.on("imagevieweriniterror", (e: ImageViewerEvent) => e.imageX);
  });
});

//#endregion

//#region ImageViewerEvent

describe("ImageViewerEvent", () => {
  it("is a MapLibre Event of its type, targeting the viewer", () => {
    const viewer = createViewer();
    const event = new ImageViewerEvent("click", viewer);

    expect(event).toBeInstanceOf(EventML);
    expect(event.type).toBe("click");
    expect(event.target).toBe(viewer);
    expect(event.originalEvent).toBeNull();
  });

  it("keeps the data it's given, which class fields mustn't overwrite after super()", () => {
    const viewer = createViewer();
    const originalEvent = new MouseEvent("click");
    const event = new ImageViewerEvent("click", viewer, originalEvent, { imageX: 10, imageY: 20, isOutOfBounds: false, extra: "kept" });

    expect(event.imageX).toBe(10);
    expect(event.imageY).toBe(20);
    expect(event.isOutOfBounds).toBe(false);
    expect(event.extra).toBe("kept");
    expect(event.originalEvent).toBe(originalEvent);
  });

  it("keeps the target as the viewer even when the data carries one", () => {
    const viewer = createViewer();
    const event = new ImageViewerEvent("move", viewer, null, { target: { not: "the viewer" } });

    expect(event.target).toBe(viewer);
  });

  it("takes the original event from the data when not given one", () => {
    const viewer = createViewer();
    const originalEvent = new MouseEvent("mousemove");

    expect(new ImageViewerEvent("move", viewer, undefined, { originalEvent }).originalEvent).toBe(originalEvent);
  });

  it("reaches listeners as the same instance", () => {
    const viewer = createViewer();
    const event = new ImageViewerEvent("click", viewer, null, { imageX: 1, imageY: 2, isOutOfBounds: false });
    const listener = vi.fn();

    viewer.on("click", listener);
    viewer.fire(event);

    expect(listener).toHaveBeenCalledWith(event);
  });
});

//#endregion

//#region Forwarding

describe("map event forwarding", () => {
  /** A map that records its listeners, so map events can be fired by hand. */
  function createMap() {
    const listeners: Record<string, ((e: unknown) => void)[]> = {};
    const map = {
      on: vi.fn((type: string, listener: (e: unknown) => void) => {
        (listeners[type] ??= []).push(listener);
      }),
    };
    const fire = (type: string, event: object = {}) => {
      for (const listener of listeners[type] ?? []) listener({ type, ...event });
    };
    return { map: map as unknown as Map, fire };
  }

  // 1 image px per 0.01°, as the coordinate helpers would give
  const lngLatToPx = (lngLat: LngLat): [number, number] => [lngLat.lng * 100, lngLat.lat * 100];

  it("forwards pointer events as ImageViewerEvents with image coordinates", () => {
    const viewer = createViewer({ width: 100, height: 50 });
    const { map, fire } = createMap();
    setupGlobalMapEventForwarder({ map, viewer, lngLatToPx });
    const received: ImageViewerEvent[] = [];
    viewer.on("click", (e) => received.push(e));

    const originalEvent = new MouseEvent("click");
    fire("click", { lngLat: new LngLat(0.2, 0.3), originalEvent, point: { x: 1, y: 2 } });
    fire("click", { lngLat: new LngLat(2, 0.3), originalEvent });

    expect(received).toHaveLength(2);
    expect(received[0]).toBeInstanceOf(ImageViewerEvent);
    expect(received[0]).toMatchObject({ type: "click", imageX: 20, imageY: 30, isOutOfBounds: false, originalEvent, point: { x: 1, y: 2 } });
    expect(received[0].target).toBe(viewer);
    // lngLat is a map concept, not forwarded
    expect(received[0].lngLat).toBeUndefined();
    expect(received[1].isOutOfBounds).toBe(true);
  });

  it("forwards camera and base events as ImageViewerEvents", () => {
    const viewer = createViewer();
    const { map, fire } = createMap();
    setupGlobalMapEventForwarder({ map, viewer, lngLatToPx });
    const moves: ImageViewerEvent[] = [];
    const idles: ImageViewerEvent[] = [];
    viewer.on("move", (e) => moves.push(e));
    viewer.on("idle", (e) => idles.push(e));

    fire("move", { originalEvent: null });
    fire("idle");

    expect(moves[0]).toBeInstanceOf(ImageViewerEvent);
    expect(moves[0].target).toBe(viewer);
    expect(idles[0]).toBeInstanceOf(ImageViewerEvent);
  });

  it("stops delivering to a listener removed with off()", () => {
    const viewer = createViewer();
    const { map, fire } = createMap();
    setupGlobalMapEventForwarder({ map, viewer, lngLatToPx });
    const listener = vi.fn((e: ImageViewerEvent) => e.imageX);

    viewer.on("click", listener);
    viewer.off("click", listener);
    fire("click", { lngLat: new LngLat(0, 0) });

    expect(listener).not.toHaveBeenCalled();
  });
});

//#endregion
