import { Map as SDKMap } from '../Map';
import { PreloadTilesForBoundsOptions, PreloadTilesForCameraPositionsOptions, PreloadTilesForLinearPathOptions, PreloadTilesOptions, TileCoord } from './types';
/**
 * Handles tile preloading for a {@link Map} instance.
 *
 * Prefetches tiles for every active tile source in the current style and stores
 * them in the SDK tile cache so MapLibre can render them without a network
 * round-trip.
 *
 * Preload strategies include geographic bounds with a zoom range
 * (`preloadForBounds`), prefetch a tilePyramid for a LatLngBounds
 * (`preloadForCameraPositions`), a sampled linear camera path
 * (`preloadForLinearPath`), and explicit `"z/x/y"` tile IDs (`preloadByTileIDs`).
 * Each method returns a `Promise` that resolves when the preloading is complete.
 * Call `abortAll()` to cancel in-flight requests.
 *
 * @remarks
 * **API Key Usage**: Every tile fetched by this class counts against your
 * MapTiler Cloud API key quota. Prefer narrow zoom ranges and small geographic
 * areas where possible, and use the `onProgress` callback to monitor consumption.
 *
 * If you update the version of the tile preloader, please update the version in the `EXPERIMENTAL_TILE_PRELOADING_VERSION` constant.
 * @example
 * ```ts
 * import { EXPERIMENTAL_TILE_PRELOADING_VERSION } from "./version";
  
 * EXPERIMENTAL_TILE_PRELOADING_VERSION = "0.2.0";
 * ```
 */
export declare class TilePreloader {
    private readonly map;
    private readonly activeAbortControllers;
    constructor(map: SDKMap);
    /**
     * Cancels all in-flight preload requests. Called automatically when a new
     * camera movement begins so stale prefetches do not waste quota.
     */
    abortAll(): void;
    /**
     * Preloads all tiles within a geographic bounds across a range of zoom levels.
     *
     * @remarks
     * **API Key Usage**: Tile count grows exponentially with zoom level. A wide zoom
     * range over a large area can trigger thousands of requests.
     * @param {PreloadTilesForBoundsOptions} options Options for preloading tiles for bounds.
     * @returns A promise that resolves when the preloading is complete.
     * @example
     * ```ts
     * await map.preloadTilesForBounds({
     *   bounds: map.getBounds(),
     *   minZoom: 8,
     *   maxZoom: 12,
     * });
     */
    preloadForBounds({ bounds, minZoom, maxZoom, onProgress, onError }: PreloadTilesForBoundsOptions): Promise<void>;
    /**
     * Preloads tiles visible from each of the given camera positions.
     *
     * @remarks
     * **API Key Usage**: Each position triggers requests for all tiles visible from
     * that viewpoint. More positions at higher zoom levels increase API usage significantly.
     */
    preloadForCameraPositions({ positions, onProgress, onError }: PreloadTilesForCameraPositionsOptions): Promise<TileCoord[]>;
    /**
     * Preloads a specific set of tiles by their IDs (`"z/x/y"` format).
     * @param {PreloadTilesOptions} options - The options for preloading tiles by tile IDs.
     * @returns A promise that resolves when the preloading is complete.
     * @example
     * ```ts
     * await map.preloadByTileIDs({
     *   tileIDs: ["12/1205/1540", "12/1206/1540"],
     * });
     * ```
     */
    preloadByTileIDs({ tileIDs, onProgress, onError }: PreloadTilesOptions): Promise<void>;
    /**
     * Preloads tiles along a linear camera path (used by panTo and easeTo overrides).
     * @param {PreloadTilesForLinearPathOptions} options - The options for preloading tiles along a linear camera path.
     * @returns A promise that resolves when the preloading is complete.
     * @example
     * ```ts
     * await map.preloadForLinearPath({
     *   start: { lng: -74.006, lat: 40.7128, zoom: 12 },
     *   end: { lng: -73.935, lat: 40.730, zoom: 14 },
     * });
     * ```
     */
    preloadForLinearPath({ start, end, onProgress, onError }: PreloadTilesForLinearPathOptions): Promise<TileCoord[]>;
    /**
     * Fetches tiles for the given tile coordinates and stores them in the SDK tile cache.
     * @param tiles - The tile coordinates to fetch.
     * @param {TilePreloadOptions} callbacks - The callbacks for the preloading.
     * @returns A promise that resolves when the preloading is complete.
     */
    private fetchTiles;
}
