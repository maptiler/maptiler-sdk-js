import ml from "maplibre-gl";
import type { LngLatBoundsLike } from "maplibre-gl";
import type { CameraPosition, TileCoord } from "./types";

const TILE_SIZE = 256;

const LngLatBounds = ml.LngLatBounds;

function lngToTileX(lng: number, zoom: number): number {
  const z = Math.pow(2, zoom);
  return ((lng + 180) / 360) * z;
}

function latToTileY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  const z = Math.pow(2, zoom);
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * z;
}

function tileXToLng(x: number, zoom: number): number {
  return (x / Math.pow(2, zoom)) * 360 - 180;
}

function tileYToLat(y: number, zoom: number): number {
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / Math.pow(2, zoom))));
  return (latRad * 180) / Math.PI;
}

/**
 * Returns all tile coordinates that fall within the given geographic bounds
 * at each integer zoom level from `minZoom` to `maxZoom` (inclusive).
 *
 * @internal
 */
export function tilesForBounds(bounds: LngLatBoundsLike, minZoom: number, maxZoom: number): TileCoord[] {
  const lngLatBounds = LngLatBounds.convert(bounds);
  const sw = lngLatBounds.getSouthWest();
  const ne = lngLatBounds.getNorthEast();

  const tiles: TileCoord[] = [];

  for (let z = Math.floor(minZoom); z <= Math.ceil(maxZoom); z++) {
    const tileCount = Math.pow(2, z);

    const minX = Math.floor(Math.min(lngToTileX(sw.lng, z), lngToTileX(ne.lng, z)));
    const maxX = Math.floor(Math.max(lngToTileX(sw.lng, z), lngToTileX(ne.lng, z)));
    // Y increases southward in tile coordinates, so north lat → smaller Y
    const y1 = Math.floor(latToTileY(sw.lat, z));
    const y2 = Math.floor(latToTileY(ne.lat, z));
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        // Wrap X for antimeridian-crossing bounds
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        if (y >= 0 && y < tileCount) {
          tiles.push({ z, x: wrappedX, y });
        }
      }
    }
  }

  return tiles;
}

/**
 * Returns all tile coordinates visible from a camera position given the
 * current map viewport dimensions. Accounts for pitch by extending the
 * visible area toward the horizon.
 *
 * @internal
 */
export function tilesForCameraPosition(position: CameraPosition, viewportWidth: number, viewportHeight: number): TileCoord[] {
  const zoom = Math.floor(position.zoom);
  const tileCount = Math.pow(2, zoom);

  // Fractional tile coordinates of the camera center
  const centerTileX = lngToTileX(position.lng, zoom);
  const centerTileY = latToTileY(position.lat, zoom);

  // Number of tiles visible across the viewport at this zoom level
  const tilesX = viewportWidth / TILE_SIZE;
  const tilesY = viewportHeight / TILE_SIZE;

  // Pitch extends the visible area upward toward the horizon
  const pitchExtension = ((position.pitch ?? 0) / 90) * tilesY;

  const minX = Math.floor(centerTileX - tilesX / 2) - 1;
  const maxX = Math.ceil(centerTileX + tilesX / 2) + 1;
  const minY = Math.floor(centerTileY - tilesY / 2 - pitchExtension) - 1;
  const maxY = Math.ceil(centerTileY + tilesY / 2) + 1;

  const tiles: TileCoord[] = [];

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const wrappedX = ((x % tileCount) + tileCount) % tileCount;
      if (y >= 0 && y < tileCount) {
        tiles.push({ z: zoom, x: wrappedX, y });
      }
    }
  }

  return tiles;
}

/**
 * Returns the geographic bounds visible from a camera position at the given
 * viewport size. Matches the tile footprint used by {@link tilesForCameraPosition}
 * without the extra padding margin.
 *
 * @internal
 */
export function viewBoundsForCameraPosition(position: CameraPosition, viewportWidth: number, viewportHeight: number): LngLatBoundsLike {
  const zoom = position.zoom;
  const centerTileX = lngToTileX(position.lng, zoom);
  const centerTileY = latToTileY(position.lat, zoom);
  const tilesX = viewportWidth / TILE_SIZE;
  const tilesY = viewportHeight / TILE_SIZE;

  const west = tileXToLng(centerTileX - tilesX / 2, zoom);
  const east = tileXToLng(centerTileX + tilesX / 2, zoom);
  const north = tileYToLat(centerTileY - tilesY / 2, zoom);
  const south = tileYToLat(centerTileY + tilesY / 2, zoom);

  return [west, south, east, north];
}

/**
 * Tessellates a parent bounds into viewport-sized geographic bounds at each
 * integer zoom level from `minZoom` to `maxZoom` (inclusive).
 *
 * @internal
 */
export function boundsTreeForBounds(parentBounds: LngLatBoundsLike, minZoom: number, maxZoom: number, viewportWidth: number, viewportHeight: number): LngLatBoundsLike[] {
  const lngLatBounds = LngLatBounds.convert(parentBounds);
  const sw = lngLatBounds.getSouthWest();
  const ne = lngLatBounds.getNorthEast();

  const loZoom = Math.floor(Math.min(minZoom, maxZoom));
  const hiZoom = Math.ceil(Math.max(minZoom, maxZoom));
  const tilesX = viewportWidth / TILE_SIZE;
  const tilesY = viewportHeight / TILE_SIZE;

  const boundsTree: LngLatBoundsLike[] = [];

  for (let z = loZoom; z <= hiZoom; z++) {
    const parentMinX = Math.min(lngToTileX(sw.lng, z), lngToTileX(ne.lng, z));
    const parentMaxX = Math.max(lngToTileX(sw.lng, z), lngToTileX(ne.lng, z));
    const parentMinY = Math.min(latToTileY(ne.lat, z), latToTileY(sw.lat, z));
    const parentMaxY = Math.max(latToTileY(ne.lat, z), latToTileY(sw.lat, z));

    const numCols = Math.max(1, Math.ceil((parentMaxX - parentMinX) / tilesX));
    const numRows = Math.max(1, Math.ceil((parentMaxY - parentMinY) / tilesY));

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const centerTileX = parentMinX + tilesX / 2 + col * tilesX;
        const centerTileY = parentMinY + tilesY / 2 + row * tilesY;
        boundsTree.push(viewBoundsForCameraPosition({ lng: tileXToLng(centerTileX, z), lat: tileYToLat(centerTileY, z), zoom: z }, viewportWidth, viewportHeight));
      }
    }
  }

  return boundsTree;
}

/**
 * Samples positions along a linear camera path (panTo, easeTo) at the
 * given number of steps.
 *
 * @internal
 */
export function sampleLinearPath(start: CameraPosition, end: CameraPosition, steps: number): CameraPosition[] {
  const positions: CameraPosition[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    positions.push({
      lng: lerp(start.lng, end.lng, t),
      lat: lerp(start.lat, end.lat, t),
      zoom: lerp(start.zoom, end.zoom, t),
      pitch: lerp(start.pitch ?? 0, end.pitch ?? 0, t),
      bearing: lerp(start.bearing ?? 0, end.bearing ?? 0, t),
    });
  }
  return positions;
}

/**
 * Samples positions along a flyTo path, which zooms out and then in.
 * Uses a sine curve approximation of MapLibre's actual flyTo zoom trajectory.
 *
 * @internal
 */
export function sampleFlyToPath(start: CameraPosition, end: CameraPosition, steps: number, curve = 1.42): CameraPosition[] {
  const positions: CameraPosition[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Approximate the flyTo zoom arc: zoom dips at the midpoint then rises
    const zoomDip = Math.sin(t * Math.PI) * curve * 2;
    positions.push({
      lng: lerp(start.lng, end.lng, t),
      lat: lerp(start.lat, end.lat, t),
      zoom: lerp(start.zoom, end.zoom, t) - zoomDip,
      pitch: lerp(start.pitch ?? 0, end.pitch ?? 0, t),
      bearing: lerp(start.bearing ?? 0, end.bearing ?? 0, t),
    });
  }

  return positions;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Parses a tile ID string in `"z/x/y"` format into a {@link TileCoord}.
 * Returns `null` if the string is not valid.
 *
 * @internal
 */
export function parseTileID(tileID: string): TileCoord | null {
  const parts = tileID.split("/");
  if (parts.length !== 3) return null;

  const [z, x, y] = parts.map(Number);
  if (isNaN(z) || isNaN(x) || isNaN(y)) return null;

  return { z, x, y };
}

/**
 * Formats a {@link TileCoord} as a `"z/x/y"` string.
 *
 * @internal
 */
export function formatTileID(tile: TileCoord): string {
  return `${tile.z}/${tile.x}/${tile.y}`;
}

/**
 * Substitutes `{z}`, `{x}`, `{y}` placeholders in a tile URL template.
 *
 * @internal
 */
export function buildTileUrl(urlTemplate: string, tile: TileCoord): string {
  return urlTemplate.replace("{z}", String(tile.z)).replace("{x}", String(tile.x)).replace("{y}", String(tile.y));
}

/**
 * Deduplicates an array of tile coordinates using a string-keyed Set.
 *
 * @internal
 */
export function deduplicateTiles(tiles: TileCoord[]): TileCoord[] {
  const seen = new Set<string>();
  return tiles.filter((tile) => {
    const key = formatTileID(tile);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
