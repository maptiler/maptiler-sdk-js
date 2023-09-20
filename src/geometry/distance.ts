import { earthRadius, degToRad } from "./util";

/** Get the distance of a LineString in meters */
export function lineDistance(
  line:
    | GeoJSON.Feature<GeoJSON.LineString>
    | GeoJSON.LineString
    | GeoJSON.Position[],
) {
  // grab the coordinates
  const coordinates =
    "geometry" in line
      ? line.geometry.coordinates
      : "coordinates" in line
      ? line.coordinates
      : line;
  // iterate through the coordinates and calculate the distance
  let distance = 0;
  let prevCoord: GeoJSON.Position | undefined;
  for (const coordinate of coordinates) {
    if (prevCoord !== undefined) {
      distance += pointDistance(prevCoord, coordinate);
    }
    prevCoord = coordinate;
  }

  return distance;
}

/** Get the distance between two lon-lat pairs in meters */
export function pointDistance(
  from: GeoJSON.Position,
  to: GeoJSON.Position,
): number {
  const { pow, sin, cos, sqrt, atan2 } = Math;
  const dLat = degToRad(to[1] - from[1]);
  const dLon = degToRad(to[0] - from[0]);
  const lat1 = degToRad(from[1]);
  const lat2 = degToRad(to[1]);

  const a =
    pow(sin(dLat / 2), 2) + pow(sin(dLon / 2), 2) * cos(lat1) * cos(lat2);

  return 2 * atan2(sqrt(a), sqrt(1 - a)) * earthRadius;
}
