// ripped from https://github.com/Turfjs/turf/blob/master/packages/turf-area/index.ts
import { degToRad, earthRadius } from "./util";

/**
 * Finds the area of a Polygon or MultiPolygon in square meters.
 */
export function area(
  area:
    | GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
    | GeoJSON.Polygon
    | GeoJSON.MultiPolygon,
) {
  const geometry = "geometry" in area ? area.geometry : area;
  const type = geometry.type;
  if (type === "MultiPolygon") {
    return multiPolygonArea(geometry.coordinates);
  }
  return polygonArea(geometry.coordinates);
}

/**
 * Finds the area of a MultiPolygon in square meters.
 */
export function multiPolygonArea(
  multiPoly: GeoJSON.MultiPolygon | GeoJSON.Position[][][],
): number {
  const coords = "coordinates" in multiPoly ? multiPoly.coordinates : multiPoly;
  let total = 0;
  for (const polygon of coords) {
    total += polygonArea(polygon);
  }
  return total;
}

/**
 * Finds the area of a Polygon in square meters.
 */
export function polygonArea(
  poly: GeoJSON.Polygon | GeoJSON.Position[][],
): number {
  const coords = "coordinates" in poly ? poly.coordinates : poly;
  let total = 0;
  for (const ring of coords) {
    total += ringArea(ring);
  }
  return total;
}

/**
 * Calculate the approximate area of the polygon were it projected onto the earth.
 * Note that this area will be positive if ring is oriented clockwise, otherwise it will be negative.
 *
 * Reference:
 * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for Polygons on a Sphere",
 * JPL Publication 07-03, Jet Propulsion
 * Laboratory, Pasadena, CA, June 2007 https://trs.jpl.nasa.gov/handle/2014/40409
 */
function ringArea(coords: GeoJSON.Position[]): number {
  let p1;
  let p2;
  let p3;
  let lowerIndex;
  let middleIndex;
  let upperIndex;
  let i;
  let total = 0;
  const coordsLength = coords.length;

  if (coordsLength > 2) {
    for (i = 0; i < coordsLength; i++) {
      if (i === coordsLength - 2) {
        // i = N-2
        lowerIndex = coordsLength - 2;
        middleIndex = coordsLength - 1;
        upperIndex = 0;
      } else if (i === coordsLength - 1) {
        // i = N-1
        lowerIndex = coordsLength - 1;
        middleIndex = 0;
        upperIndex = 1;
      } else {
        // i = 0 to N-3
        lowerIndex = i;
        middleIndex = i + 1;
        upperIndex = i + 2;
      }
      p1 = coords[lowerIndex];
      p2 = coords[middleIndex];
      p3 = coords[upperIndex];
      total += (degToRad(p3[0]) - degToRad(p1[0])) * Math.sin(degToRad(p2[1]));
    }

    total = (total * earthRadius * earthRadius) / 2;
  }
  return Math.abs(total);
}
