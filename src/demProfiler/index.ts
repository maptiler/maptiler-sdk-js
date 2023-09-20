import tileCover from "./tileCover";
import getElevation from "./getElevation";
import { pointDistance, mToFt } from "../geometry";

import type { TileCoverCoordinates, TileID } from "./tileCover";
import type { ElevationParser } from "./getElevation";
import type { Feature, LineString } from "geojson";

export interface TileImage {
  channels: 1 | 2 | 3 | 4;
  image: Uint8ClampedArray;
}

export type TileRequest = (
  x: number,
  y: number,
  z: number,
) => Promise<TileImage>;

export interface Options {
  /** type of metric to use. Meters or feet. Default: meters */
  metric?: "m" | "ft";
  /** Zoom that is queried from the server. Default: 13 */
  zoom?: number;
  /** Tile size of the images returned. Default 512 */
  tileSize?: number;
  /** Tile Request method */
  tileRequest: TileRequest;
  /** Elevation parser. Default: elevation = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1) */
  elevationParser?: ElevationParser;
}

export interface ElevPoint {
  /** Distance along path from the starting point in the metric defind by options */
  distance: number;
  /** Elevation of the point */
  elevation: number;
  /** Coordinates of the point in lat-lon */
  coordinate: [lon: number, lat: number];
  /** Tile that the point is in */
  tile: TileID;
}

export interface Output {
  /** Total length of the path in the metric defined by options */
  distance: number;
  /** Minimum elevation of the path */
  minElevation: number;
  /** Maximum elevation of the path */
  maxElevation: number;
  /** Average elevation of the path */
  avgElevation: number;
  /** Elevation at the start of the path */
  startElevation: number;
  /** Elevation at the end of the path */
  endElevation: number;
  /** Array of points along the path */
  points: ElevPoint[];
}

/**
 * Given a GeoJSON LineString or Feature<Linestring>, return the elevation data for the path.
 * This algorithm will automatically break the path into denser segments relative to the zoom level if necessary.
 */
export async function profileLineString(
  path: Feature<LineString> | LineString,
  options: Options,
): Promise<Output> {
  // get the tile cover
  const coordinates =
    "geometry" in path ? path.geometry.coordinates : path.coordinates;
  const { coords, tiles } = tileCover(
    coordinates,
    options.zoom ?? 13,
    options.tileSize ?? 512,
  );
  // get tiles
  const tileCache = await getTiles(tiles, options.tileRequest);
  // get the elevation data
  const points = getElevations(
    coords,
    tileCache,
    options.tileSize ?? 512,
    options.elevationParser,
  );
  // calculate the output
  let output = buildOutput(points);
  // convert to miles if needed
  if (options.metric === "ft") output = toFeet(output);

  return output;
}

/** Request all the tiles we need */
async function getTiles(
  tiles: TileID[],
  tileRequest: TileRequest,
): Promise<Map<number, TileImage>> {
  const tileCache = new Map<number, TileImage>();

  // request all the tiles we need
  const requests: Array<Promise<TileImage | undefined>> = [];
  for (const tile of tiles) {
    requests.push(
      tileRequest(tile.x, tile.y, tile.z)
        .then((res: TileImage): TileImage => {
          tileCache.set(tile.id, res);
          return res;
        })
        .catch((err: unknown) => {
          console.error(err);
          return undefined;
        }),
    );
  }
  // wait for all the requests to finish
  await Promise.allSettled(requests);

  return tileCache;
}

/** Get the elevation data for each coordinate */
function getElevations(
  coords: TileCoverCoordinates[],
  tileCache: Map<number, TileImage>,
  tileSize: number,
  elevationParser?: ElevationParser,
): ElevPoint[] {
  const points: ElevPoint[] = [];

  // get the elevation data for each coordinate
  let curDistance = 0;
  let prevCoord: [lon: number, lat: number] | undefined;
  for (const { tile, coordinate } of coords) {
    const cTile = tileCache.get(tile.id);
    if (cTile === undefined)
      throw new Error(
        `Missing tile ${tile.id} (${tile.x}-${tile.y}-${tile.z})`,
      );
    const elevation = getElevation(
      coordinate,
      [tile.z, tile.x, tile.y],
      tileSize,
      cTile,
      elevationParser,
    );
    points.push({
      distance: curDistance,
      elevation,
      coordinate,
      tile,
    });
    // calculate the distance between the points
    if (prevCoord !== undefined) {
      curDistance += pointDistance(prevCoord, coordinate);
    }
    prevCoord = coordinate;
  }

  return points;
}

/** Improve the output to include metrics about the max/min/avg elevation */
function buildOutput(points: ElevPoint[]): Output {
  // setup variables
  let minElevation = Infinity;
  let maxElevation = -Infinity;
  let totalElevation = 0;
  // calcuate min, max, and average
  for (const point of points) {
    if (point.elevation < minElevation) minElevation = point.elevation;
    if (point.elevation > maxElevation) maxElevation = point.elevation;
    totalElevation += point.elevation;
  }

  return {
    distance: points[points.length - 1].distance,
    minElevation,
    maxElevation,
    avgElevation: totalElevation / points.length,
    startElevation: points[0].elevation,
    endElevation: points[points.length - 1].elevation,
    points,
  };
}

/** Convert all output properties from km to miles */
function toFeet(input: Output): Output {
  const output: Output = {
    distance: mToFt(input.distance),
    minElevation: mToFt(input.minElevation),
    maxElevation: mToFt(input.maxElevation),
    avgElevation: mToFt(input.avgElevation),
    startElevation: mToFt(input.startElevation),
    endElevation: mToFt(input.endElevation),
    points: input.points.map((point) => ({
      distance: mToFt(point.distance),
      elevation: mToFt(point.elevation),
      coordinate: point.coordinate,
      tile: point.tile,
    })),
  };

  return output;
}
