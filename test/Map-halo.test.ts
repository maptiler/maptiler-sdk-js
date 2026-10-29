import { describe, expect, it, vi } from "vitest";
import type { AddLayerObject } from "maplibre-gl";
import { Map, type MapOptions } from "../src/Map";
import Minimap from "../src/controls/Minimap";
import type { GradientDefinition } from "../src/custom-layers/RadialGradientLayer/types";

// MapLibre 6 fires an `error` event when `removeLayer` is given an id that is
// not in the style. `initHalo` used to remove the halo layer before ever adding
// it, so every map with a halo fired "Cannot remove non-existing layer" at any
// `map.on("error")` listener the app had attached.

const HALO_STOPS: GradientDefinition["stops"] = [
  [0, "rgba(255, 255, 255, 1)"],
  [1, "rgba(255, 255, 255, 0)"],
];

type InitHalo = (args: { options?: MapOptions; before: string; spec?: GradientDefinition }) => void;

/**
 * An SDK Map with no WebGL behind it. Its layers live in a set, and `removeLayer`
 * records an error for a missing id, as MapLibre's does.
 */
function createMap(options: MapOptions, existingLayerIds: string[] = []) {
  const map = Object.create(Map.prototype) as Map;
  const layers = new Set(existingLayerIds);
  const errors: string[] = [];

  (map as unknown as { options: MapOptions }).options = options;
  vi.spyOn(map, "getLayer").mockImplementation((id: string) => (layers.has(id) ? ({ id } as ReturnType<Map["getLayer"]>) : undefined));
  const addLayer = vi.spyOn(map, "addLayer").mockImplementation((layer: AddLayerObject) => {
    layers.add(layer.id);
    return map;
  });
  const removeLayer = vi.spyOn(map, "removeLayer").mockImplementation((id: string) => {
    if (!layers.delete(id)) errors.push(`Cannot remove non-existing layer "${id}".`);
    return map;
  });

  const initHalo = (args: Parameters<InitHalo>[0]) => {
    (map as unknown as { initHalo: InitHalo }).initHalo(args);
  };

  return { map, layers, errors, addLayer, removeLayer, initHalo };
}

describe("Map halo initialisation", () => {
  it("adds the halo from map options without removing a layer that does not exist", () => {
    const options = { halo: { scale: 1, stops: HALO_STOPS } } as MapOptions;
    const { map, errors, addLayer, removeLayer, initHalo } = createMap(options);

    initHalo({ options, before: "first-layer" });

    expect(errors).toEqual([]);
    expect(removeLayer).not.toHaveBeenCalled();
    expect(addLayer).toHaveBeenCalledWith(map.getHalo(), "first-layer");
  });

  it("adds the halo from the style metadata without removing a layer that does not exist", () => {
    const { map, errors, addLayer, removeLayer, initHalo } = createMap({} as MapOptions);

    initHalo({ before: "first-layer", spec: { scale: 1, stops: HALO_STOPS } });

    expect(errors).toEqual([]);
    expect(removeLayer).not.toHaveBeenCalled();
    expect(addLayer).toHaveBeenCalledWith(map.getHalo(), "first-layer");
  });

  it("adds the default halo for `halo: true` without removing a layer that does not exist", () => {
    const options = { halo: true } as MapOptions;
    const { map, errors, addLayer, removeLayer, initHalo } = createMap(options);

    initHalo({ options, before: "first-layer" });

    expect(errors).toEqual([]);
    expect(removeLayer).not.toHaveBeenCalled();
    expect(addLayer).toHaveBeenCalledWith(map.getHalo(), "first-layer");
  });

  it("still replaces a halo layer already in the style", () => {
    const options = { halo: true } as MapOptions;
    const { map, layers, errors, addLayer, removeLayer, initHalo } = createMap(options, ["Halo Layer"]);

    initHalo({ options, before: "first-layer" });

    expect(errors).toEqual([]);
    expect(removeLayer).toHaveBeenCalledWith("Halo Layer");
    expect(addLayer).toHaveBeenCalledWith(map.getHalo(), "first-layer");
    expect(layers).toEqual(new Set(["Halo Layer"]));
  });
});

describe("Minimap removeLayer", () => {
  function createMinimap(existingLayerIds: string[]) {
    const minimap = new Minimap({}, {} as MapOptions);
    const layers = new Set(existingLayerIds);
    const removeLayer = vi.fn((id: string) => layers.delete(id));
    minimap.map = { getLayer: (id: string) => (layers.has(id) ? { id } : undefined), removeLayer } as unknown as Map;
    return { minimap, removeLayer };
  }

  it("does not remove a layer the minimap map does not have", () => {
    const { minimap, removeLayer } = createMinimap([]);

    minimap.removeLayer("Halo Layer");

    expect(removeLayer).not.toHaveBeenCalled();
  });

  it("removes a layer the minimap map has", () => {
    const { minimap, removeLayer } = createMinimap(["Halo Layer"]);

    minimap.removeLayer("Halo Layer");

    expect(removeLayer).toHaveBeenCalledWith("Halo Layer");
  });
});
