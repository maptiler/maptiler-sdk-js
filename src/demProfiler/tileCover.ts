import { llToTile } from "web-merc-projection";
import {
  pointDistance,
  getZoomLevelResolution,
  xyzToTileID,
} from "../geometry";

import type { Point } from "web-merc-projection";

export interface TileID {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface TileCoverCoordinates {
  /** Store the coordinates as an ll-pair */
  coordinate: Point;
  /** Track the tile relative to the point */
  tile: TileID;
}

export interface TileCoverOutput {
  coords: TileCoverCoordinates[];
  tiles: TileID[];
}

/**
 * Given LineString coordinates, return the web mercator tiles that all the points contain.
 * Breaks the coordinates down into points that are relative to the zoom.
 */
export default function tileCover(
  coordinates: GeoJSON.Position[],
  zoom: number,
  tileSize: number,
): TileCoverOutput {
  const tileHash = new Map<number, TileID>(); // tileHash => { id, x, y, z }
  const tiles: TileID[] = [];
  const coords: TileCoverCoordinates[] = [];

  // get the resolution of the zoom level
  const resolution = getZoomLevelResolution(coordinates[0][1], zoom);

  // migrate from coordinates to "samples" that are relative to the zoom
  const samples = sampleProfileLine(coordinates, resolution);

  for (const sample of samples) {
    const coordinate = sample as unknown as [lon: number, lat: number];
    // file the file that the coordinate is in
    const [tileX, tileY] = llToTile(coordinate, zoom, tileSize);
    // create the tile and store it
    const id = xyzToTileID(tileX, tileY, zoom);
    const tile: TileID = { id, x: tileX, y: tileY, z: zoom };
    tileHash.set(id, tile);
    // store the coordinates
    coords.push({ coordinate, tile });
  }
  // store the tiles we've found
  for (const tile of tileHash.values()) tiles.push(tile);

  return { coords, tiles };
}

/** convert coordinates to samples that have a max distance of the zoom level resolution */
function sampleProfileLine(
  coordinates: GeoJSON.Position[],
  resolution: number,
): GeoJSON.Position[] {
  const samples: GeoJSON.Position[] = [];

  let prevCoord: GeoJSON.Position | undefined;
  for (const coord of coordinates) {
    if (prevCoord !== undefined) {
      const dist = pointDistance(
        prevCoord as unknown as [lon: number, lat: number],
        coord as unknown as [lon: number, lat: number],
      );
      const numSamples = Math.ceil(dist / resolution);

      for (let i = 0; i <= numSamples; i++) {
        const sample = [
          prevCoord[0] + (coord[0] - prevCoord[0]) * (i / numSamples),
          prevCoord[1] + (coord[1] - prevCoord[1]) * (i / numSamples),
        ];
        samples.push(sample);
      }
    } else {
      samples.push(coord);
    }

    prevCoord = coord;
  }

  return samples;
}
