import type { GetResourceResponse, RequestParameters, ResourceType } from "maplibre-gl";

import { config } from "./config";

import maplibregl from "maplibre-gl";

import { defaults } from "./constants/defaults";
import { TileJSON } from "@maptiler/client";

const LOCAL_CACHE_PROTOCOL_SOURCE = "localcache_source";
const LOCAL_CACHE_PROTOCOL_DATA = "localcache";
const LOCAL_CACHE_NAME = "maptiler_sdk";

const CACHE_LIMIT_ITEMS = 1000;
const CACHE_LIMIT_CHECK_INTERVAL = 100;
export const CACHE_API_AVAILABLE = typeof caches !== "undefined";

const { addProtocol } = maplibregl;

//#region localCacheTransformRequest

export function localCacheTransformRequest(reqUrl: URL, resourceType?: ResourceType): string {
  if (CACHE_API_AVAILABLE && config.caching && config.session && reqUrl.host === defaults.maptilerApiHost) {
    if (resourceType === "Source" && reqUrl.href.includes("tiles.json")) {
      return reqUrl.href.replace("https://", `${LOCAL_CACHE_PROTOCOL_SOURCE}://`);
    }

    if (resourceType === "Tile" || resourceType === "Glyphs") {
      return reqUrl.href.replace("https://", `${LOCAL_CACHE_PROTOCOL_DATA}://`);
    }
  }
  return reqUrl.href;
}

//#endregion

//#region getTileCacheKey

/**
 * Derives a stable cache key from a tile URL by stripping ephemeral params
 * (`key`, `mtsid`) that vary per-request but do not affect tile content.
 * Both the prefetch path and the protocol handler must use this function so
 * cache writes and reads always resolve to the same key.
 * @internal
 */
export function getTileCacheKey(url: URL | string): string {
  const u = new URL(url instanceof URL ? url.href : url);
  u.searchParams.delete("key");
  u.searchParams.delete("mtsid");
  return u.toString();
}

//#endregion

//#region cache management

let cacheInstance: Cache;

async function getCache() {
  // cacheInstance is _technically_ always defined, but we need to check.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!cacheInstance) {
    cacheInstance = await caches.open(LOCAL_CACHE_NAME);
  }
  return cacheInstance;
}

let cachePutCounter = 0;
async function limitCache() {
  const cache = await getCache();
  const keys = await cache.keys();
  const toPurge = keys.slice(0, Math.max(keys.length - CACHE_LIMIT_ITEMS, 0));
  for (const key of toPurge) {
    void cache.delete(key);
  }
}

//#endregion

//#region prefetchTileUrl

/**
 * Fetches a tile URL and stores it in the SDK cache so subsequent MapLibre
 * requests for the same tile are served from cache without a network round-trip.
 *
 * When the Cache API is unavailable, the tile is still fetched so the browser's
 * own HTTP cache can serve it later.
 *
 * @internal
 */
export async function prefetchTileUrl(url: string, signal?: AbortSignal): Promise<void> {
  const urlObj = new URL(url);
  const cacheKey = getTileCacheKey(urlObj);
  const cache = CACHE_API_AVAILABLE ? await getCache() : null;

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return;
  }

  const fetchableUrl = new URL(urlObj);

  const response = await fetch(fetchableUrl.toString(), { signal });

  if (cache && response.ok) {
    try {
      await cache.put(cacheKey, response);
    } catch {
      // Ignore cache write errors (e.g. QuotaExceededError, AbortError mid-stream)
    }
  }
}

//#endregion

//#region registerLocalCacheProtocol

export function registerLocalCacheProtocol() {
  addProtocol(
    LOCAL_CACHE_PROTOCOL_SOURCE,
    async (
      params: RequestParameters,
      abortController: AbortController,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<GetResourceResponse<any>> => {
      if (!params.url) throw new Error("");

      params.url = params.url.replace(`${LOCAL_CACHE_PROTOCOL_SOURCE}://`, "https://");

      const requestInit: RequestInit = params;
      requestInit.signal = abortController.signal;
      const response = await fetch(params.url, requestInit);
      const json = (await response.json()) as TileJSON;

      // we don't know if the tilesJSON from the reponsse is valid, so we need to check.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (json.tiles && json.tiles.length > 0) {
        // move `Last-Modified` to query so it propagates to tile URLs
        json.tiles[0] = `${json.tiles[0]}&last-modified=${response.headers.get("Last-Modified") ?? ""}`;
      }

      return {
        data: json,
        cacheControl: response.headers.get("Cache-Control"),
        expires: response.headers.get("Expires"),
      };
    },
  );
  addProtocol(LOCAL_CACHE_PROTOCOL_DATA, async (params: RequestParameters, abortController: AbortController): Promise<GetResourceResponse<any>> => {
    if (!params.url) throw new Error("");

    params.url = params.url.replace(`${LOCAL_CACHE_PROTOCOL_DATA}://`, "https://");

    const url = new URL(params.url);
    const cacheKey = getTileCacheKey(url);

    const fetchableUrl = new URL(url);
    fetchableUrl.searchParams.delete("last-modified");
    const fetchUrl = fetchableUrl.toString();

    const respond = async (response: Response): Promise<GetResourceResponse<any>> => {
      return {
        data: await response.arrayBuffer(),
        cacheControl: response.headers.get("Cache-Control"),
        expires: response.headers.get("Expires"),
      };
    };

    const cache = await getCache();
    const cacheMatch = await cache.match(cacheKey);

    if (cacheMatch) {
      return await respond(cacheMatch);
    }

    const requestInit: RequestInit = params;
    requestInit.signal = abortController.signal;
    const response = await fetch(fetchUrl, requestInit);
    if (response.status >= 200 && response.status < 300) {
      cache.put(cacheKey, response.clone()).catch(() => {
        // "DOMException: Cache.put() was aborted"
        // can happen here because the response is not done streaming yet
      });
      if (++cachePutCounter > CACHE_LIMIT_CHECK_INTERVAL) {
        void limitCache();
        cachePutCounter = 0;
      }
    }
    return respond(response);
  });
}

//#endregion
