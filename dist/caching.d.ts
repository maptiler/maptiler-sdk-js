import { ResourceType } from 'maplibre-gl';
export declare const CACHE_API_AVAILABLE: boolean;
export declare function localCacheTransformRequest(reqUrl: URL, resourceType?: ResourceType): string;
/**
 * Derives a stable cache key from a tile URL by stripping ephemeral params
 * (`key`, `mtsid`) that vary per-request but do not affect tile content.
 * Both the prefetch path and the protocol handler must use this function so
 * cache writes and reads always resolve to the same key.
 * @internal
 */
export declare function getTileCacheKey(url: URL | string): string;
/**
 * Fetches a tile URL and stores it in the SDK cache so subsequent MapLibre
 * requests for the same tile are served from cache without a network round-trip.
 *
 * When the Cache API is unavailable, the tile is still fetched so the browser's
 * own HTTP cache can serve it later.
 *
 * @internal
 */
export declare function prefetchTileUrl(url: string, signal?: AbortSignal): Promise<void>;
export declare function registerLocalCacheProtocol(): void;
