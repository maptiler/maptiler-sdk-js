import type { LngLatBoundsLike } from "maplibre-gl";

/**
 * Called after each tile fetch attempt during preloading.
 *
 * @param done - Number of tiles attempted so far (loaded or failed)
 * @param total - Total number of tiles to preload
 * @param tileID - ID of the tile just attempted, in `"z/x/y"` format
 *
 * @remarks
 * **API Key Usage**: Each tile fetch counts against your MapTiler Cloud API key quota.
 */
export type TilePreloadProgressCallback = (done: number, total: number, tileID: string) => void;

/**
 * Called when a tile fails to load during preloading.
 *
 * @param error - The error that occurred
 */
export type TilePreloadErrorCallback = (error: unknown) => void;

/**
 * Callbacks and safety limits shared by all preload option types.
 *
 * @remarks
 * **API Key Usage**: Tile preloading issues one network request per tile per active source.
 * These requests count against your MapTiler Cloud API key quota. Use `onProgress` to
 * monitor consumption and prefer narrow zoom ranges and small bounds where possible.
 */
export type TilePreloadCallbacks = {
  /**
   * Called after each tile fetch attempt, whether it succeeded or failed.
   */
  onProgress?: TilePreloadProgressCallback;
  /**
   * Called when a tile fails to load.
   */
  onError?: TilePreloadErrorCallback;
  /**
   * Maximum number of tiles to fetch across all sources. Tiles beyond this
   * limit are silently dropped. Defaults to `512`.
   *
   * @remarks
   * **API Key Usage**: Each tile counts against your MapTiler Cloud API key quota.
   * Keep this value conservative, especially across wide zoom ranges.
   *
   * @defaultValue 512
   */
  maxTiles?: number;
};

/**
 * Options for preloading all tiles within a geographic bounds across a range of zoom levels.
 *
 * @remarks
 * **API Key Usage**: The number of tiles grows exponentially with zoom level. For example,
 * a city-scale area at zoom 12–15 can result in thousands of tile requests per source.
 * Each request counts against your MapTiler Cloud API key quota.
 */
export type PreloadTilesForBoundsOptions = TilePreloadCallbacks & {
  /**
   * The geographic bounds to preload tiles for.
   */
  bounds: LngLatBoundsLike;
  /**
   * Minimum zoom level to preload (inclusive).
   */
  minZoom: number;
  /**
   * Maximum zoom level to preload (inclusive).
   */
  maxZoom: number;
};

/**
 * A camera viewpoint used to determine which tiles are visible from that position.
 */
export type CameraPosition = {
  /** Longitude of the camera center */
  lng: number;
  /** Latitude of the camera center */
  lat: number;
  /** Zoom level */
  zoom: number;
  /** Camera pitch in degrees (default: 0) */
  pitch?: number;
  /** Camera bearing in degrees (default: 0) */
  bearing?: number;
};

/**
 * Options for preloading tiles visible from one or more camera positions.
 *
 * @remarks
 * **API Key Usage**: Each position triggers tile requests for all tiles visible
 * from that viewpoint. More positions and higher zoom levels result in more
 * requests, each counting against your MapTiler Cloud API key quota.
 */
export type PreloadTilesForCameraPositionsOptions = TilePreloadCallbacks & {
  /**
   * Camera positions to preload tiles for. Tiles visible from each position
   * will be fetched and cached.
   */
  positions: CameraPosition[];
};

/**
 * Options for preloading a specific set of tiles by their IDs.
 *
 * @remarks
 * **API Key Usage**: Each tile ID results in one fetch per active map source.
 * Each request counts against your MapTiler Cloud API key quota.
 */
export type PreloadTilesOptions = TilePreloadCallbacks & {
  /**
   * Tile IDs to preload, in `"z/x/y"` format.
   */
  tileIDs: string[];
};

/** @internal */
export type TileCoord = { z: number; x: number; y: number };
