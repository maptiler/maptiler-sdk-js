import { describe, expect, it, vi } from "vitest";
import type { TerrainSpecification } from "maplibre-gl";
import { Map } from "../src/Map";

// `enableTerrain` called before the map has loaded used to also add the terrain
// on "moveend". MapLibre 6 fires "moveend" from `resize()`, which can run before
// the style has loaded, so `addSource` threw "Style is not done loading.".

const TERRAIN_SOURCE_ID = "maptiler-terrain";

/**
 * An SDK Map with no WebGL behind it, still loading. Its sources live in a set, and
 * `addSource` throws as MapLibre's does when the style is not loaded or the id is taken.
 */
function createLoadingMap() {
  const map = Object.create(Map.prototype) as Map;
  const style = { _loaded: false };
  const sources = new Set<string>();
  let terrain: TerrainSpecification | null = null;

  // class field initialisers and the style do not exist without the constructor
  Object.assign(map, { style, isTerrainEnabled: false, terrainExaggeration: 1 });

  vi.spyOn(map, "loaded").mockReturnValue(false);
  vi.spyOn(map, "getTerrain").mockImplementation(() => terrain);
  vi.spyOn(map, "getSource").mockImplementation(((id: string) => (sources.has(id) ? { id } : undefined)) as never);
  const addSource = vi.spyOn(map, "addSource").mockImplementation((id: string) => {
    if (!style._loaded) throw new Error("Style is not done loading.");
    if (sources.has(id)) throw new Error(`Source "${id}" already exists.`);
    sources.add(id);
    return map;
  });
  const setTerrain = vi.spyOn(map, "setTerrain").mockImplementation((spec: TerrainSpecification | null) => {
    terrain = spec;
    return map;
  });
  const on = vi.spyOn(map, "on");

  const loadStyle = () => {
    style._loaded = true;
    map.fire("style.load");
  };

  const dataListenerCount = () => on.mock.calls.filter(([type]) => type === "data").length;

  return { map, style, addSource, setTerrain, loadStyle, dataListenerCount };
}

describe("Map.enableTerrain before the map has loaded", () => {
  it("does not add the terrain source when moveend fires before the style has loaded", () => {
    const { map, addSource, setTerrain } = createLoadingMap();

    map.enableTerrain();

    // MapLibre's resize() fires movestart / move / resize / moveend
    expect(() => map.fire("moveend")).not.toThrow();
    expect(addSource).not.toHaveBeenCalled();
    expect(setTerrain).not.toHaveBeenCalled();
  });

  it("adds the terrain once the style has loaded", () => {
    const { map, addSource, setTerrain, loadStyle, dataListenerCount } = createLoadingMap();

    map.enableTerrain();
    map.fire("moveend");
    loadStyle();

    expect(addSource).toHaveBeenCalledOnce();
    expect(addSource).toHaveBeenCalledWith(TERRAIN_SOURCE_ID, expect.objectContaining({ type: "raster-dem" }));
    expect(setTerrain).toHaveBeenCalledOnce();
    expect(setTerrain).toHaveBeenCalledWith({ source: TERRAIN_SOURCE_ID, exaggeration: 0 });
    expect(dataListenerCount()).toBe(1);
  });

  it("adds the terrain once when enableTerrain is called several times before the style has loaded", () => {
    const { map, addSource, setTerrain, loadStyle, dataListenerCount } = createLoadingMap();

    map.enableTerrain();
    map.enableTerrain(2);
    map.enableTerrain(3);
    loadStyle();

    expect(addSource).toHaveBeenCalledOnce();
    expect(setTerrain).toHaveBeenCalledOnce();
    expect(dataListenerCount()).toBe(1);
  });

  it("adds the terrain when a style loads without the map firing load, as during setStyle", () => {
    const { map, addSource, loadStyle } = createLoadingMap();

    map.enableTerrain();
    // "load" fires once per map, so it does not come again for a later style
    loadStyle();

    expect(addSource).toHaveBeenCalledOnce();
  });

  it("adds the terrain on the next render when the style is loaded but the map is not", () => {
    const { map, style, addSource, setTerrain } = createLoadingMap();
    style._loaded = true;

    map.enableTerrain();
    expect(addSource).not.toHaveBeenCalled();

    map.fire("render");

    expect(addSource).toHaveBeenCalledOnce();
    expect(setTerrain).toHaveBeenCalledOnce();
  });
});
