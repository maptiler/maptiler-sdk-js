import { Map as SDKMap } from "../Map";
import { prefetchTileUrl } from "../caching";
import { buildTileUrl, deduplicateTiles, formatTileID, parseTileID, sampleFlyToPath, sampleLinearPath, tilesForBounds, tilesForCameraPosition } from "./tile-math";
import type { CameraPosition, PreloadTilesForBoundsOptions, PreloadTilesForCameraPositionsOptions, PreloadTilesOptions, TileCoord, TilePreloadCallbacks } from "./types";

const DEFAULT_PATH_SAMPLE_STEPS = 8;

type TileSource = {
  tiles: string[];
  scheme?: string;
};

/**
 * Returns all tile sources that have URL templates and are currently in use.
 */
function getActiveTileSources(map: SDKMap): Record<string, TileSource> {
  const style = map.getStyle();
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

/**
 * Handles tile preloading for a {@link Map} instance.
 *
 * Fetches tiles ahead of camera movements and stores them in the SDK cache
 * so they are available when MapLibre renders those positions. All preload
 * methods are fire-and-forget — the map continues to render normally while
 * tiles load in the background.
 *
 * @remarks
 * **API Key Usage**: Every tile fetched by this class counts against your
 * MapTiler Cloud API key quota. Prefer narrow zoom ranges and small geographic
 * areas where possible, and use the `onProgress` callback to monitor consumption.
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
  async preloadForCameraPositions({ positions, onProgress, onError }: PreloadTilesForCameraPositionsOptions): Promise<void> {
    const { width, height } = this.map.transform;
    const allTiles: TileCoord[] = [];

    for (const position of positions) {
      allTiles.push(...tilesForCameraPosition(position, width, height));
    }
    console.log("Preloading camera positions", deduplicateTiles(allTiles), positions);

    await this.fetchTiles(deduplicateTiles(allTiles), { onProgress, onError });
  }

  /**
   * Preloads a specific set of tiles by their IDs (`"z/x/y"` format).
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
   */
  preloadForLinearPath(start: CameraPosition, end: CameraPosition, callbacks?: TilePreloadCallbacks): Promise<void> {
    const positions = sampleLinearPath(start, end, DEFAULT_PATH_SAMPLE_STEPS);
    return this.preloadForCameraPositions({ positions, ...callbacks });
  }

  /**
   * Preloads tiles along a flyTo path, accounting for the zoom-out arc.
   */
  preloadForFlyToPath(start: CameraPosition, end: CameraPosition, curve: number | undefined, callbacks?: TilePreloadCallbacks): Promise<void> {
    const positions = sampleFlyToPath(start, end, DEFAULT_PATH_SAMPLE_STEPS, curve);
    console.log("Preloading flyTo path", positions);
    return this.preloadForCameraPositions({ positions, ...callbacks });
  }

  private async fetchTiles(tiles: TileCoord[], callbacks?: TilePreloadCallbacks): Promise<void> {
    const sources = getActiveTileSources(this.map);
    const maxTiles = callbacks?.maxTiles ?? 512;

    const fetchItems: Array<{ url: string; tileID: string }> = [];

    for (const tile of tiles) {
      fetchItems.push(...buildFetchItems(sources, tile));
      if (fetchItems.length >= maxTiles) break;
    }

    if (fetchItems.length >= maxTiles) {
      console.warn(
        `[MapTiler SDK] Tile preloading capped at ${maxTiles} tiles, the remaining ${fetchItems.length - maxTiles} tile preloads will be skipped. Increase the \`maxTiles\` option to load more.`,
      );
    }

    const total = fetchItems.length;
    let done = 0;

    const abortController = new AbortController();
    const requestID = crypto.randomUUID();
    this.activeAbortControllers.set(requestID, abortController);
    console.log("Fetching tiles---", fetchItems.length, maxTiles);
    try {
      await Promise.allSettled(
        fetchItems.map(async ({ url, tileID }) => {
          try {
            await prefetchTileUrl(url, abortController.signal);
          } catch (error) {
            callbacks?.onError?.(error);
          } finally {
            done++;
            callbacks?.onProgress?.(done, total, tileID);
          }
        }),
      );
    } finally {
      this.activeAbortControllers.delete(requestID);
    }
  }
}
