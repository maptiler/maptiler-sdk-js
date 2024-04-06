import {
  GetResourceResponse,
  RequestParameters,
  ResourceType,
  addProtocol,
  config,
} from ".";
import { defaults } from "./defaults";

const LOCAL_CACHE_PROTOCOL_SOURCE = "localcache_source";
const LOCAL_CACHE_PROTOCOL_DATA = "localcache";
const LOCAL_CACHE_NAME = "maptiler_sdk";

const CACHE_LIMIT_ITEMS = 1000;
const CACHE_LIMIT_CHECK_INTERVAL = 100;

export function localCacheTransformRequest(
  reqUrl: URL,
  resourceType?: ResourceType,
): string {
  if (
    config.caching &&
    config.session &&
    reqUrl.host === defaults.maptilerApiHost
  ) {
    if (resourceType == "Source") {
      return reqUrl.href.replace(
        "https://",
        `${LOCAL_CACHE_PROTOCOL_SOURCE}://`,
      );
    } else if (resourceType == "Tile" || resourceType == "Glyphs") {
      return reqUrl.href.replace("https://", `${LOCAL_CACHE_PROTOCOL_DATA}://`);
    }
  }
  return reqUrl.href;
}

let cacheInstance: Cache;

async function getCache() {
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
    cache.delete(key);
  }
}

export function registerLocalCacheProtocol() {
  addProtocol(
    LOCAL_CACHE_PROTOCOL_SOURCE,
    async (
      params: RequestParameters,
      abortController: AbortController,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<GetResourceResponse<any>> => {
      if (!params.url) throw new Error("");

      params.url = params.url.replace(
        `${LOCAL_CACHE_PROTOCOL_SOURCE}://`,
        "https://",
      );

      const requestInit: RequestInit = params;
      requestInit.signal = abortController.signal;
      const response = await fetch(params.url, requestInit);
      const json = await response.json();

      // move `Last-Modified` to query so it propagates to tile URLs
      json.tiles[0] +=
        "&last-modified=" + response.headers.get("Last-Modified");

      return {
        data: json,
        cacheControl: response.headers.get("Cache-Control"),
        expires: response.headers.get("Expires"),
      };
    },
  );
  addProtocol(
    LOCAL_CACHE_PROTOCOL_DATA,
    async (
      params: RequestParameters,
      abortController: AbortController,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<GetResourceResponse<any>> => {
      if (!params.url) throw new Error("");

      params.url = params.url.replace(
        `${LOCAL_CACHE_PROTOCOL_DATA}://`,
        "https://",
      );

      const url = new URL(params.url);

      const cacheableUrl = new URL(url);
      cacheableUrl.searchParams.delete("mtsid");
      cacheableUrl.searchParams.delete("key");
      const cacheKey = cacheableUrl.toString();

      const fetchableUrl = new URL(url);
      fetchableUrl.searchParams.delete("last-modified");
      const fetchUrl = fetchableUrl.toString();

      const respond = async (
        response: Response,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ): Promise<GetResourceResponse<any>> => {
        return {
          data: await response.arrayBuffer(),
          cacheControl: response.headers.get("Cache-Control"),
          expires: response.headers.get("Expires"),
        };
      };

      const cache = await getCache();
      const cacheMatch = await cache.match(cacheKey);

      if (cacheMatch) {
        return respond(cacheMatch);
      } else {
        const requestInit: RequestInit = params;
        requestInit.signal = abortController.signal;
        const response = await fetch(fetchUrl, requestInit);
        if (response.status >= 200 && response.status < 300) {
          cache.put(cacheKey, response.clone()).catch(() => {
            // "DOMException: Cache.put() was aborted"
            // can happen here because the response is not done streaming yet
          });
          if (++cachePutCounter > CACHE_LIMIT_CHECK_INTERVAL) {
            limitCache();
            cachePutCounter = 0;
          }
        }
        return respond(response);
      }
    },
  );
}
