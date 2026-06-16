import { Map as SDKMap } from "../Map";
import { prefetchTileUrl } from "../caching";
import { buildTileUrl, deduplicateTiles, formatTileID, parseTileID, sampleLinearPath, tilesForBounds, tilesForCameraPosition } from "./tile-math";
import type {
  PreloadTilesForBoundsOptions,
  PreloadTilesForCameraPositionsOptions,
  PreloadTilesForLinearPathOptions,
  PreloadTilesOptions,
  TileCoord,
  TilePreloadOptions,
} from "./types";
import { config } from "../config";
import { v4 } from "uuid";

type TileSource = {
  tiles: string[];
  scheme?: string;
};

const PREFETCH_CONCURRENCY = 16;

//#region helpers

/**
 * Returns all tile sources that have URL templates and are currently in use.
 * @param map - The map instance.
 * @returns @link{Record<string, TileSource>} - A record of all active tile sources.
 */
function getActiveTileSources(map: SDKMap): Record<string, TileSource> {
  const style = map.getStyle();

  // style.sources is _technically_ always defined, but we need to check.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!style?.sources) return {};

  const result: Record<string, TileSource> = {};

  for (const sourceId of Object.keys(style.sources)) {
    const source = map.getSource(sourceId);
    if (!source) continue;

    const tiledSource = source as unknown as TileSource;
    if (Array.isArray(tiledSource.tiles) && tiledSource.tiles.length > 0) {
      result[sourceId] = tiledSource;
    }
  }

  return result;
}

/**
 * Builds tile fetch URLs for a given tile coordinate across all active sources.
 * @param sources - A record of all active tile sources.
 * @param tile - The tile coordinate.
 * @returns An array of { url: string; tileID: string } objects.
 */
function buildFetchItems(sources: Record<string, TileSource>, tile: TileCoord): Array<{ url: string; tileID: string }> {
  const tileID = formatTileID(tile);
  const items: Array<{ url: string; tileID: string }> = [];

  for (const source of Object.values(sources)) {
    const url = buildTileUrl(source.tiles[0], tile);
    items.push({ url, tileID });
  }

  return items;
}

//#endregion

//#region TilePreloader

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
export class TilePreloader {
  private readonly map: SDKMap;
  private readonly activeAbortControllers = new Map<string, AbortController>();

  constructor(map: SDKMap) {
    this.map = map;
  }

  /**
   * Cancels all in-flight preload requests. Called automatically when a new
   * camera movement begins so stale prefetches do not waste quota.
   */
  abortAll(): void {
    for (const controller of this.activeAbortControllers.values()) {
      controller.abort();
    }
    this.activeAbortControllers.clear();
  }

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
  async preloadForBounds({ bounds, minZoom, maxZoom, onProgress, onError }: PreloadTilesForBoundsOptions): Promise<void> {
    const tiles = deduplicateTiles(tilesForBounds(bounds, minZoom, maxZoom));
    await this.fetchTiles(tiles, { onProgress, onError });
  }

  /**
   * Preloads tiles visible from each of the given camera positions.
   *
   * @remarks
   * **API Key Usage**: Each position triggers requests for all tiles visible from
   * that viewpoint. More positions at higher zoom levels increase API usage significantly.
   */
  async preloadForCameraPositions({ positions, onProgress, onError }: PreloadTilesForCameraPositionsOptions): Promise<TileCoord[]> {
    const { width, height } = this.map.transform;

    const allTiles: TileCoord[] = [];

    for (const position of positions) {
      allTiles.push(...tilesForCameraPosition(position, width, height));
    }

    await this.fetchTiles(deduplicateTiles(allTiles), { onProgress, onError });

    return allTiles;
  }

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
  async preloadByTileIDs({ tileIDs, onProgress, onError }: PreloadTilesOptions): Promise<void> {
    const tiles: TileCoord[] = [];

    for (const id of tileIDs) {
      const tile = parseTileID(id);
      if (tile) tiles.push(tile);
    }

    await this.fetchTiles(tiles, { onProgress, onError });
  }

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
  preloadForLinearPath({ start, end, onProgress, onError }: PreloadTilesForLinearPathOptions): Promise<TileCoord[]> {
    const positions = sampleLinearPath(start, end, config.experimental_defaultPathSampleSteps);
    return this.preloadForCameraPositions({ positions, onProgress, onError });
  }

  //#region fetchTiles

  /**
   * Fetches tiles for the given tile coordinates and stores them in the SDK tile cache.
   * @param tiles - The tile coordinates to fetch.
   * @param {TilePreloadOptions} callbacks - The callbacks for the preloading.
   * @returns A promise that resolves when the preloading is complete.
   */
  private async fetchTiles(tiles: TileCoord[], callbacks?: TilePreloadOptions): Promise<void> {
    const sources = getActiveTileSources(this.map);
    const maxTiles = callbacks?.maxTiles ?? 512;

    const fetchItems: Array<{ url: string; tileID: string }> = [];

    for (const tile of tiles) {
      fetchItems.push(...buildFetchItems(sources, tile));
      if (fetchItems.length >= maxTiles) break;
    }

    if (fetchItems.length >= maxTiles) {
      console.warn(
        // we are okay with type coercion here, it's just a warning message
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `[MapTiler SDK] Tile preloading capped at ${maxTiles} tiles, the remaining ${fetchItems.length - maxTiles} tile preloads will be skipped. Increase the \`maxTiles\` option to load more.`,
      );
    }

    const total = fetchItems.length;
    let done = 0;

    const abortController = new AbortController();
    const requestID = v4();
    this.activeAbortControllers.set(requestID, abortController);

    // Worker-pool concurrency: N workers drain a shared queue in order so
    // high-priority tiles (queued first) always start downloading before the rest.
    const concurrency = Math.min(PREFETCH_CONCURRENCY, total);
    const queue = fetchItems.slice();

    try {
      await Promise.all(
        Array.from({ length: concurrency }, async () => {
          // we need to use a while loop here because the queue is not guaranteed to be empty
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          while (true) {
            const item = queue.shift();
            if (!item) break;
            try {
              await prefetchTileUrl(item.url, abortController.signal);
            } catch (error) {
              callbacks?.onError?.(error);
            } finally {
              done++;
              callbacks?.onProgress?.(done, total, item.tileID);
            }
          }
        }),
      );
    } finally {
      this.activeAbortControllers.delete(requestID);
    }
  }

  //#endregion
}

//#endregion
