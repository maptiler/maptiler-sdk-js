import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TilePreloader } from "../../src/tile-preloading/TilePreloader";
import type { Map as SDKMap } from "../../src/Map";

//#region Test helpers

function makeMockMap(sourceOverrides: Record<string, unknown> = {}): SDKMap {
  const defaultSources = {
    openmaptiles: {
      tiles: ["https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=test"],
      type: "vector",
    },
    ...sourceOverrides,
  };

  return {
    getStyle: () => ({
      sources: Object.fromEntries(Object.keys(defaultSources).map((id) => [id, { type: "vector" }])),
    }),
    getSource: (id: string) => (defaultSources as Record<string, unknown>)[id] ?? null,
    transform: { width: 1280, height: 720 },
  } as unknown as SDKMap;
}

//#endregion

//#region Mocking fetch and caches

const fetchMock = vi.fn();
const cachePutMock = vi.fn();
const cacheMatchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock.mockResolvedValue(new Response("", { status: 200 })));

  const cacheMock = { match: cacheMatchMock.mockResolvedValue(null), put: cachePutMock.mockResolvedValue(undefined) };
  vi.stubGlobal("caches", { open: vi.fn().mockResolvedValue(cacheMock) });

  vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

//#endregion

//#region preloadForBounds

describe("TilePreloader.preloadForBounds", () => {
  it("fetches tiles for each zoom level in the range", async () => {
    const map = makeMockMap();
    const preloader = new TilePreloader(map);

    await preloader.preloadForBounds({
      bounds: [-74.1, 40.6, -73.9, 40.8],
      minZoom: 9,
      maxZoom: 10,
    });

    expect(fetchMock).toHaveBeenCalled();
    const urls: string[] = fetchMock.mock.calls.map((args: unknown[]) => args[0] as string);

    expect(urls.some((url) => url.includes("/10/"))).toBe(true);
    expect(urls.some((url) => url.includes("/9/"))).toBe(true);
  });

  it("calls onProgress for each tile fetched", async () => {
    const map = makeMockMap();
    const preloader = new TilePreloader(map);
    const progressCalls: Array<[number, number, string]> = [];

    await preloader.preloadForBounds({
      bounds: [-74.1, 40.6, -73.9, 40.8],
      minZoom: 10,
      maxZoom: 10,
      onProgress: (done, total, tileID) => progressCalls.push([done, total, tileID ?? ""]),
    });

    expect(progressCalls.length).toBeGreaterThan(0);
    // done should reach total at the end
    const [lastDone, lastTotal] = progressCalls[progressCalls.length - 1];
    expect(lastDone).toBe(lastTotal);
  });

  it("calls onError when fetch rejects", async () => {
    const fetchError = new Error("Network error");
    fetchMock.mockRejectedValue(fetchError);

    const map = makeMockMap();
    const preloader = new TilePreloader(map);
    const errors: unknown[] = [];

    await preloader.preloadForBounds({
      bounds: [-74.1, 40.6, -73.9, 40.8],
      minZoom: 10,
      maxZoom: 10,
      onError: (err) => errors.push(err),
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  it("does nothing when no tileable sources are present", async () => {
    const map = makeMockMap({ "geojson-source": { type: "geojson", data: {} } });
    (map as unknown as { getStyle: () => unknown }).getStyle = () => ({
      sources: { "geojson-source": { type: "geojson" } },
    });
    (map as unknown as { getSource: (id: string) => unknown }).getSource = () => ({
      type: "geojson",
      data: {},
    });

    const preloader = new TilePreloader(map);
    await preloader.preloadForBounds({ bounds: [-180, -85, 180, 85], minZoom: 0, maxZoom: 0 });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

//#endregion

//#region preloadForCameraPositions

describe("TilePreloader.preloadForCameraPositions", () => {
  it("fetches tiles at the given zoom level", async () => {
    const map = makeMockMap();
    const preloader = new TilePreloader(map);

    await preloader.preloadForCameraPositions({
      positions: [{ lng: -74.006, lat: 40.7128, zoom: 12 }],
    });

    expect(fetchMock).toHaveBeenCalled();
    const urls: string[] = fetchMock.mock.calls.map((args: unknown[]) => args[0] as string);
    expect(urls.some((url) => url.includes("/12/"))).toBe(true);
  });

  it("deduplicates overlapping tiles across multiple positions", async () => {
    const map = makeMockMap();
    const preloader = new TilePreloader(map);

    const position = { lng: -74.006, lat: 40.7128, zoom: 10 };
    const singleCount = (await (async () => {
      fetchMock.mockClear();
      await preloader.preloadForCameraPositions({ positions: [position] });
      return fetchMock.mock.calls.length;
    })()) as number;

    fetchMock.mockClear();
    // Two identical positions should not double the request count
    await preloader.preloadForCameraPositions({ positions: [position, position] });
    const doubleCount = fetchMock.mock.calls.length;

    expect(doubleCount).toBe(singleCount);
  });
});

//#endregion

//#region preloadByTileIDs

describe("TilePreloader.preloadByTileIDs", () => {
  it("fetches the specified tile IDs", async () => {
    const map = makeMockMap();
    const preloader = new TilePreloader(map);

    await preloader.preloadByTileIDs({ tileIDs: ["12/1205/1540"] });

    expect(fetchMock).toHaveBeenCalled();
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/12/1205/1540");
  });

  it("skips invalid tile ID formats", async () => {
    const map = makeMockMap();
    const preloader = new TilePreloader(map);

    await preloader.preloadByTileIDs({ tileIDs: ["not-valid", "also-bad/format"] });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls onProgress with correct total", async () => {
    const map = makeMockMap();
    const preloader = new TilePreloader(map);
    let lastDone = 0;
    let lastTotal = 0;

    await preloader.preloadByTileIDs({
      tileIDs: ["12/1205/1540", "12/1206/1540"],
      onProgress: (done, total) => {
        lastDone = done;
        lastTotal = total;
      },
    });

    // 2 tile IDs × 1 source = 2 total fetches
    expect(lastTotal).toBe(2);
    expect(lastDone).toBe(2);
  });
});

//#endregion

//#region abortAll

describe("TilePreloader.abortAll", () => {
  it("aborts in-flight requests when called", () => {
    const map = makeMockMap();
    const preloader = new TilePreloader(map);
    const abortSpy = vi.fn();

    vi.spyOn(global, "AbortController").mockImplementation(
      () =>
        ({
          signal: { aborted: false },
          abort: abortSpy,
        }) as unknown as AbortController,
    );

    // Start a preload but do not await it
    void preloader.preloadForBounds({
      bounds: [-74.1, 40.6, -73.9, 40.8],
      minZoom: 10,
      maxZoom: 10,
    });

    preloader.abortAll();
    expect(abortSpy).toHaveBeenCalled();
  });
});

//#endregion
