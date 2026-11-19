import { describe, expect, expectTypeOf, it, vi } from "vitest";
import type { LngLat, Map as MapLibreMap, MapMouseEvent, Point } from "maplibre-gl";
import { Map } from "../src/Map";
import type * as sdk from "../src/index";

// The SDK `Map` types `on` / `once` / `off` over `MapEventTypeSDK`. Its own
// events carried the SDK `Map` as their target, but the MapLibre ones (`load`,
// `click`, `move`, …) kept MapLibre's `Map`, which lacks the SDK members — so a
// listener expecting the SDK `Map` was rejected. These tests are checked by
// `tsc` as well as run: the type assertions fail the build, not the test run.

/** An SDK Map with no WebGL behind it — `Evented` keeps no constructor state, so `on` / `off` / `fire` work as is. */
function createMap(): Map {
  return Object.create(Map.prototype) as Map;
}

//#region Types

describe("Map event types", () => {
  it("compiles listeners that use SDK members of the target, for MapLibre events", () => {
    const map: sdk.Map = createMap();

    // each of these was rejected: the target was MapLibre's Map, which has no `telemetry` or `getSpace`
    map.on("load", (e) => e.target.telemetry);
    map.on("click", (e) => e.target.getSpace());
    map.once("move", (e) => e.target.getSdkConfig());
    map.on("remove", (e: { target: sdk.Map }) => e.target.telemetry);
  });

  it("types the target of every MapLibre and SDK event as the SDK Map", () => {
    expectTypeOf<sdk.MapEventSDK<"load">["target"]>().toExtend<sdk.Map>();
    expectTypeOf<sdk.MapEventSDK<"click">["target"]>().toExtend<sdk.Map>();
    expectTypeOf<sdk.MapEventSDK<"data">["target"]>().toExtend<sdk.Map>();
    expectTypeOf<sdk.MapEventSDK<"ready">["target"]>().toExtend<sdk.Map>();
    expectTypeOf<sdk.MapEventSDK<"loadWithTerrain">["target"]>().toExtend<sdk.Map>();
    expectTypeOf<sdk.MapLayerEventSDK<"click">["target"]>().toExtend<sdk.Map>();
  });

  it("accepts listeners typed with MapEventSDK and MapLayerEventSDK", () => {
    const map = createMap();
    const onClick = (e: sdk.MapEventSDK<"click">) => e.target.getSpace() ?? e.lngLat;
    const onLayerClick = (e: sdk.MapLayerEventSDK<"click">) => e.features;

    map.on("click", onClick);
    map.off("click", onClick);
    map.on("click", "some-layer", onLayerClick);
  });

  it("stays assignable to MapLibre's Map, which controls and custom layers receive", () => {
    expectTypeOf<sdk.Map>().toExtend<MapLibreMap>();
  });

  it("keeps each MapLibre event's own payload", () => {
    const map = createMap();

    map.on("click", (e) => {
      expectTypeOf(e.lngLat).toEqualTypeOf<LngLat>();
      expectTypeOf(e.point).toEqualTypeOf<Point>();
      expectTypeOf(e).toHaveProperty("preventDefault").toBeFunction();
      expectTypeOf(e).toExtend<MapMouseEvent>();
    });
    map.on("terrainAnimationStart", (e) => {
      expectTypeOf(e.terrain).not.toBeAny();
    });
  });

  it("types the target as the SDK Map for layer events too", () => {
    const map = createMap();

    map.on("click", "some-layer", (e) => {
      expectTypeOf(e.target).toExtend<sdk.Map>();
      expectTypeOf(e.features).not.toBeAny();
      return e.target.getSpace();
    });
    map.off("mouseenter", "some-layer", (e) => e.target.telemetry);
  });

  it("types once() without a listener as a promise of the retargeted event", () => {
    const map = createMap();

    expectTypeOf(map.once("load")).resolves.toHaveProperty("target").toExtend<sdk.Map>();
    expectTypeOf(map.once("click", "some-layer")).resolves.toHaveProperty("target").toExtend<sdk.Map>();
  });

  it("still accepts listeners written against MapLibre's Map", () => {
    const map = createMap();

    // the SDK Map is a MapLibre Map, so these keep compiling
    map.on("load", (e: { target: MapLibreMap }) => e.target.getZoom());
    map.on("click", (e: MapMouseEvent) => e.lngLat);
  });

  it("rejects unknown events and members the SDK Map doesn't have", () => {
    const map = createMap();

    // @ts-expect-error - not a map event
    map.on("not-an-event", () => undefined);
    map.on("load", (e) => {
      // @ts-expect-error - the target is the SDK Map, which has no such member
      void e.target.notAMember;
    });
  });
});

//#endregion

//#region Runtime

describe("Map event targets", () => {
  it("delivers MapLibre events with the SDK Map itself as the target", () => {
    const map = createMap();
    const listener = vi.fn((e: { target: Map }) => e.target);

    map.on("move", listener);
    map.fire("move");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].target).toBe(map);
    expect(listener.mock.calls[0][0].target).toBeInstanceOf(Map);
  });

  it("removes a typed listener with off()", () => {
    const map = createMap();
    const listener = vi.fn((e: { target: Map }) => e.target.telemetry);

    map.on("load", listener);
    map.off("load", listener);
    map.fire("load");

    expect(listener).not.toHaveBeenCalled();
  });
});

//#endregion
