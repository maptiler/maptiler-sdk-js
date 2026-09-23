import { LngLatBoundsLike } from 'maplibre-gl';
import { CameraPosition, TileCoord } from './types';
/**
 * Returns all tile coordinates that fall within the given geographic bounds
 * at each integer zoom level from `minZoom` to `maxZoom` (inclusive).
 *
 * @internal
 */
export declare function tilesForBounds(bounds: LngLatBoundsLike, minZoom: number, maxZoom: number): TileCoord[];
/**
 * Returns all tile coordinates visible from a camera position given the
 * current map viewport dimensions. Accounts for pitch by extending the
 * visible area toward the horizon.
 *
 * @internal
 */
export declare function tilesForCameraPosition(position: CameraPosition, viewportWidth: number, viewportHeight: number): TileCoord[];
/**
 * Returns the geographic bounds visible from a camera position at the given
 * viewport size. Matches the tile footprint used by {@link tilesForCameraPosition}
 * without the extra padding margin.
 *
 * @internal
 */
export declare function viewBoundsForCameraPosition(position: CameraPosition, viewportWidth: number, viewportHeight: number): LngLatBoundsLike;
/**
 * Samples positions along a linear camera path (panTo, easeTo) at the
 * given number of steps.
 *
 * @internal
 */
export declare function sampleLinearPath(start: CameraPosition, end: CameraPosition, steps: number): CameraPosition[];
/**
 * Parses a tile ID string in `"z/x/y"` format into a {@link TileCoord}.
 * Returns `null` if the string is not valid.
 *
 * @internal
 */
export declare function parseTileID(tileID: string): TileCoord | null;
/**
 * Formats a {@link TileCoord} as a `"z/x/y"` string.
 *
 * @internal
 */
export declare function formatTileID(tile: TileCoord): string;
/**
 * Substitutes `{z}`, `{x}`, `{y}` placeholders in a tile URL template.
 *
 * @internal
 */
export declare function buildTileUrl(urlTemplate: string, tile: TileCoord): string;
/**
 * Deduplicates an array of tile coordinates using a string-keyed Set.
 *
 * @internal
 */
export declare function deduplicateTiles(tiles: TileCoord[]): TileCoord[];
