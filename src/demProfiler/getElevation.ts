import { llToTilePx } from "web-merc-projection";

import type { TileImage } from "./";

export type ElevationParser = (
  r: number,
  g: number,
  b: number,
  a: number,
) => number;

/** Given an RGB or RBGA image and lon-lat coordinate, determine the elevation */
export default function getElevation(
  coord: [lon: number, lat: number],
  tile: [zoom: number, x: number, y: number],
  tileSize: number,
  tileImage: TileImage,
  elevationParser: ElevationParser = defaultElevationParser,
): number {
  const { channels, image } = tileImage;
  let [x, y] = llToTilePx(coord, tile, tileSize);
  x = clampPixel(x, tileSize);
  y = clampPixel(y, tileSize);
  const index = (y * tileSize + x) * channels;

  return elevationParser(
    image[index],
    image[index + 1],
    image[index + 2],
    channels === 4 ? image[index + 3] : 0,
  );
}

/** Clamp the pixels to the 0-tileSize bounds */
function clampPixel(n: number, tileSize: number): number {
  return Math.max(0, Math.min(tileSize, Math.floor(n * tileSize)));
}

/** Default elevation parser used by Mapbox and Maplibre. Result is in meters */
export function defaultElevationParser(
  r: number,
  g: number,
  b: number,
): number {
  return -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
}
