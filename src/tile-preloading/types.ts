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
export type TilePreloadProgressCallback = (done: number, total: number, tileID?: string | null) => void;

/**
 * Called when a tile fails to load during preloading.
 *
 * @param error - The error that occurred
 */
export type TilePreloadErrorCallback = (error: unknown) => void;

/**
 * Options shared by all tile preloading APIs.
 *
 * @remarks
 * **API Key Usage**: Tile preloading issues one network request per tile per active source.
 * These requests count against your MapTiler Cloud API key quota. Use `onProgress` to
 * monitor consumption and prefer narrow zoom ranges and small bounds where possible.
 */
export type TilePreloadOptions = {
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
  /**
   * Whether to preprocess tiles after they are fetched. This feature may block the current JS thread and have a negative impact on the performance of the map.
   * So it is recommended to use it with caution and / or increase the available workers with `setWorkerCount`
   */
  preprocessTiles?: boolean;
};

/**
 * Adds optional experimental tile preloading to camera animation method options.
 */
export type WithTilePreload<T> = T & {
  /**
   * Experimental tile preloading options. This will only work if `useExperimentalTilePreloading` is set to `true` on the map options.
   */
  experimental_preload?: TilePreloadOptions;
};

/**
 * Options for preloading all tiles within a geographic bounds across a range of zoom levels.
 *
 * @remarks
 * **API Key Usage**: The number of tiles grows exponentially with zoom level. For example,
 * a city-scale area at zoom 12–15 can result in thousands of tile requests per source.
 * Each request counts against your MapTiler Cloud API key quota.
 */
export type PreloadTilesForBoundsOptions = TilePreloadOptions & {
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
export type PreloadTilesForCameraPositionsOptions = TilePreloadOptions & {
  /**
   * Camera positions to preload tiles for. Tiles visible from each position
   * will be fetched and cached.
   */
  positions: CameraPosition[];
};

/**
 * Options for preloading tiles along a linear camera path.
 */
export type PreloadTilesForFlyToPathOptions = TilePreloadOptions & {
  /**
   * Start camera position.
   */
  start: CameraPosition;
  /**
   * End camera position.
   */
  end: CameraPosition;
  /**
   * Curve to use for the flyTo path.
   */
  curve?: number;
  /**
   * Number of steps to sample along the path.
   */
  steps?: number;
};

/**
 * Options for preloading tiles along a linear camera path.
 */
export type PreloadTilesForLinearPathOptions = TilePreloadOptions & {
  /**
   * Start camera position.
   */
  start: CameraPosition;
  /**
   * End camera position.
   */
  end: CameraPosition;
  /**
   * Number of steps to sample along the path.
   */
  steps?: number;
};

/**
 * Options for preloading a specific set of tiles by their IDs.
 *
 * @remarks
 * **API Key Usage**: Each tile ID results in one fetch per active map source.
 * Each request counts against your MapTiler Cloud API key quota.
 */
export type PreloadTilesOptions = TilePreloadOptions & {
  /**
   * Tile IDs to preload, in `"z/x/y"` format.
   */
  tileIDs: string[];
};

/** @internal */
export type TileCoord = { z: number; x: number; y: number };
