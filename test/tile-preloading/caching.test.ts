import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted runs before any import, ensuring caches exists when caching.ts
// evaluates CACHE_API_AVAILABLE = typeof caches !== "undefined".
const { cacheMatchMock, cachePutMock } = vi.hoisted(() => {
  const cacheMatchMock = vi.fn().mockResolvedValue(null);
  const cachePutMock = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(globalThis, "caches", {
    value: { open: vi.fn().mockResolvedValue({ match: cacheMatchMock, put: cachePutMock }) },
    writable: true,
    configurable: true,
  });
  return { cacheMatchMock, cachePutMock };
});

import { getTileCacheKey, prefetchTileUrl } from "../../src/caching";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock.mockResolvedValue(new Response("tile-data", { status: 200 }));
  cacheMatchMock.mockResolvedValue(null);
  cachePutMock.mockResolvedValue(undefined);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

//#region getTileCacheKey

describe("getTileCacheKey", () => {
  it("strips the key param", () => {
    expect(getTileCacheKey("https://api.maptiler.com/tiles/v3/14/8235/5349.pbf?key=MY_KEY")).toBe("https://api.maptiler.com/tiles/v3/14/8235/5349.pbf");
  });

  it("strips the mtsid param", () => {
    expect(getTileCacheKey("https://api.maptiler.com/tiles/v3/14/8235/5349.pbf?mtsid=SESSION")).toBe("https://api.maptiler.com/tiles/v3/14/8235/5349.pbf");
  });

  it("strips both key and mtsid but preserves other params", () => {
    const result = getTileCacheKey("https://api.maptiler.com/tiles/v3/14/8235/5349.pbf?key=K&mtsid=S&last-modified=Mon%2C+01+Jan+2024");
    expect(result).not.toContain("key=");
    expect(result).not.toContain("mtsid=");
    expect(result).toContain("last-modified=");
  });

  it("returns the URL unchanged when no ephemeral params present", () => {
    const url = "https://api.maptiler.com/fonts/Open%20Sans%20Regular/0-255.pbf";
    expect(getTileCacheKey(url)).toBe(url);
  });

  it("accepts a URL object", () => {
    const result = getTileCacheKey(new URL("https://api.maptiler.com/tiles/v3/14/8235/5349.pbf?key=K&mtsid=S"));
    expect(result).not.toContain("key=");
    expect(result).not.toContain("mtsid=");
  });

  it("produces the same key regardless of param order", () => {
    const a = getTileCacheKey("https://example.com/tile?key=K&mtsid=S&last-modified=X");
    const b = getTileCacheKey("https://example.com/tile?last-modified=X&mtsid=S&key=K");
    expect(a).toBe(b);
  });
});

//#endregion

//#region prefetchTileUrl

describe("prefetchTileUrl", () => {
  const tileUrl = "https://api.maptiler.com/tiles/v3/14/8235/5349.pbf?key=MY_KEY";

  it("fetches the URL on a cache miss", async () => {
    await prefetchTileUrl(tileUrl);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("skips fetch when tile is already in cache", async () => {
    cacheMatchMock.mockResolvedValue(new Response("cached", { status: 200 }));
    await prefetchTileUrl(tileUrl);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("writes response to cache after a successful fetch", async () => {
    await prefetchTileUrl(tileUrl);
    expect(cachePutMock).toHaveBeenCalledOnce();
  });

  it("does not write to cache for a non-ok response", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 404 }));
    await prefetchTileUrl(tileUrl);
    expect(cachePutMock).not.toHaveBeenCalled();
  });

  it("cache match key has no key or mtsid params", async () => {
    await prefetchTileUrl(tileUrl);
    const matchKey = cacheMatchMock.mock.calls[0][0] as string;
    expect(matchKey).not.toContain("key=");
    expect(matchKey).not.toContain("mtsid=");
  });

  it("cache put key matches cache match key", async () => {
    await prefetchTileUrl(tileUrl);
    const matchKey = cacheMatchMock.mock.calls[0][0] as string;
    const putKey = cachePutMock.mock.calls[0][0] as string;
    expect(putKey).toBe(matchKey);
  });

  it("propagates fetch errors", async () => {
    fetchMock.mockRejectedValue(new Error("network error"));
    await expect(prefetchTileUrl(tileUrl)).rejects.toThrow("network error");
  });
});

//#endregion
