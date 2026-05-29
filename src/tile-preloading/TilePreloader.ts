import { Map as SDKMap } from "../Map";
import { prefetchTileUrl } from "../caching";
import {
  boundsTreeForBounds,
  buildTileUrl,
  deduplicateTiles,
  formatTileID,
  parseTileID,
  sampleFlyToPath,
  sampleLinearPath,
  tilesForBounds,
  tilesForCameraPosition,
} from "./tile-math";
import type {
  CameraPosition,
  PreloadTilesForBoundsOptions,
  PreloadTilesForCameraPositionsOptions,
  PreloadTilesForFlyToPathOptions,
  PreloadTilesForLinearPathOptions,
  PreloadTilesOptions,
  TileCoord,
  TilePreloadOptions,
  TilePreloadProgressCallback,
} from "./types";
import { config } from "../config";
import type { LngLatBoundsLike, MapSourceDataEvent } from "maplibre-gl";
import { StyleSpecificationWithMetaData } from "../custom-layers";

const DEFAULT_PATH_SAMPLE_STEPS = 4;

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

  private preloaderMapInstance: SDKMap;
  private preloaderContainerElement: HTMLElement;

  constructor(map: SDKMap) {
    this.map = map;

    /**
     * This is used to pre-parse the tiles after they have been preloaded.
     */
    const preloaderContainer = document.getElementById("maptiler-preloader-container") ?? document.createElement("div");
    preloaderContainer.id = "maptiler-preloader-container";
    const mapWidth = map.getContainer().clientWidth;
    const mapHeight = map.getContainer().clientHeight;
    preloaderContainer.style.width = `${mapWidth}px`;
    preloaderContainer.style.height = `${mapHeight}px`;
    preloaderContainer.style.position = "absolute";
    preloaderContainer.style.top = "-5000px";
    preloaderContainer.style.left = "-5000px";
    preloaderContainer.style.pointerEvents = "none";
    document.body.appendChild(preloaderContainer);
    this.preloaderContainerElement = preloaderContainer;

    this.preloaderMapInstance = new SDKMap({
      container: this.preloaderContainerElement,
      style: map.getStyle(),
      center: map.getCenter(),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
      apiKey: config.apiKey,
    });
  }

  public setPreloaderMapStyle(style: StyleSpecificationWithMetaData): void {
    this.preloaderMapInstance.setStyle(style);
  }

  destroy(): void {
    this.preloaderMapInstance.remove();
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

  calculateBoundsTreeFromZoomLevels(parentBounds: LngLatBoundsLike, minZoom: number, maxZoom: number): LngLatBoundsLike[] {
    const { width, height } = this.map.transform;
    return boundsTreeForBounds(parentBounds, minZoom, maxZoom, width, height);
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
   *   preprocessTiles: true,
   * });
   */
  async preloadForBounds({ bounds, minZoom, maxZoom, onProgress, onError, preprocessTiles }: PreloadTilesForBoundsOptions): Promise<void> {
    const boundsList = this.calculateBoundsTreeFromZoomLevels(bounds, minZoom, maxZoom);
    const tiles = deduplicateTiles(tilesForBounds(bounds, minZoom, maxZoom));

    const fetchTilesOnProgress: TilePreloadProgressCallback = (done, total, tileID) => {
      onProgress?.(done, preprocessTiles ? total + boundsList.length : total, tileID);
    };

    await this.fetchTiles(tiles, { onProgress: fetchTilesOnProgress, onError });

    if (preprocessTiles) {
      for (const [index, subBounds] of boundsList.entries()) {
        await new Promise<void>((resolve) => {
          const onIdle = (e: MapSourceDataEvent) => {
            resolve();
            onProgress?.(tiles.length + index, tiles.length + boundsList.length, null);
          };

          void this.preloaderMapInstance.once("idle", onIdle);

          this.preloaderMapInstance.fitBounds(subBounds, { animate: false }); // then trigger movement
        }).catch((error) => {
          onError?.(error);
        });
      }
    }
  }

  /**
   * Preloads tiles visible from each of the given camera positions.
   *
   * @remarks
   * **API Key Usage**: Each position triggers requests for all tiles visible from
   * that viewpoint. More positions at higher zoom levels increase API usage significantly.
   */
  async preloadForCameraPositions({ positions, onProgress, onError, preprocessTiles }: PreloadTilesForCameraPositionsOptions): Promise<TileCoord[]> {
    const { width, height } = this.map.transform;

    const allTiles: TileCoord[] = [];

    const fetchTilesOnProgress: TilePreloadProgressCallback = (done, total, tileID) => {
      onProgress?.(done, preprocessTiles ? total + positions.length : total, tileID);
    };

    for (const position of positions) {
      allTiles.push(...tilesForCameraPosition(position, width, height));
    }

    await this.fetchTiles(deduplicateTiles(allTiles), { onProgress: fetchTilesOnProgress, onError });

    if (preprocessTiles) {
      for (const [index, position] of positions.entries()) {
        await new Promise<void>((resolve) => {
          const onIdle = (e: MapSourceDataEvent) => {
            resolve();
            onProgress?.(allTiles.length + index, allTiles.length + positions.length, null);
          };

          void this.preloaderMapInstance.once("idle", onIdle);

          this.preloaderMapInstance.jumpTo(position, { animate: false });
        });
      }
    }

    return allTiles;
  }

  /**
   * Preloads a specific set of tiles by their IDs (`"z/x/y"` format).
   * Does _not_ preprocess tiles after they are fetched.
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
  preloadForLinearPath({ start, end, onProgress, onError, preprocessTiles }: PreloadTilesForLinearPathOptions): Promise<TileCoord[]> {
    const positions = sampleLinearPath(start, end, DEFAULT_PATH_SAMPLE_STEPS);
    return this.preloadForCameraPositions({ positions, onProgress, onError, preprocessTiles });
  }

  /**
   * Preloads tiles along a flyTo path, accounting for the zoom-out arc.
   */
  async preloadForFlyToPath({ start, end, curve, onProgress, onError, preprocessTiles }: PreloadTilesForFlyToPathOptions): Promise<void> {
    const positions = sampleFlyToPath(start, end, DEFAULT_PATH_SAMPLE_STEPS, curve);

    const fetchTilesOnProgress: TilePreloadProgressCallback = (done, total, tileID) => {
      onProgress?.(done + positions.length, total + positions.length, tileID);
    };

    const tiles = await this.preloadForCameraPositions({ positions, onProgress: fetchTilesOnProgress, onError, preprocessTiles });

    for (const [index, position] of positions.entries()) {
      await new Promise<void>((resolve) => {
        void this.preloaderMapInstance.once("idle", resolve);
        this.preloaderMapInstance.jumpTo(position, { animate: false });
      });
      onProgress?.(tiles.length + index, tiles.length + positions.length, null);
    }

    return;
  }

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
        `[MapTiler SDK] Tile preloading capped at ${maxTiles} tiles, the remaining ${fetchItems.length - maxTiles} tile preloads will be skipped. Increase the \`maxTiles\` option to load more.`,
      );
    }

    const total = fetchItems.length;
    let done = 0;

    const abortController = new AbortController();
    const requestID = crypto.randomUUID();
    this.activeAbortControllers.set(requestID, abortController);

    try {
      await Promise.allSettled(
        fetchItems.map(async ({ url, tileID }) => {
          try {
            await prefetchTileUrl(url, abortController.signal);
            return;
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
