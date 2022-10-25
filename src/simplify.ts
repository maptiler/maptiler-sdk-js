/**\
 * This code is borrowed from https://github.com/mourner/simplify-js and reworked a little.
 */

import { lngLatArrayType } from "./generalTypes";

// square distance from a point to a segment
function getSqSegDist(
  p: lngLatArrayType,
  p1: lngLatArrayType,
  p2: lngLatArrayType
): number {
  let x = p1[0],
    y = p1[1],
    dx = p2[0] - x,
    dy = p2[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;

  return dx * dx + dy * dy;
}

function simplifyDPStep(
  points: Array<lngLatArrayType>,
  first: number,
  last: number,
  sqTolerance: number,
  simplified: Array<lngLatArrayType>
) {
  let maxSqDist = sqTolerance,
    index;

  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);

    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    if (index - first > 1) {
      simplifyDPStep(points, first, index, sqTolerance, simplified);
    }
    simplified.push(points[index]);

    if (last - index > 1) {
      simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(
  points: Array<lngLatArrayType>,
  sqTolerance: number
): Array<lngLatArrayType> {
  const last = points.length - 1;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);
  return simplified;
}

// both algorithms combined for awesome performance
export default function simplify(
  points: Array<lngLatArrayType>,
  tolerance: number
): Array<lngLatArrayType> {
  if (points.length <= 2) {
    return points;
  }

  const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
  const simplePoints = simplifyDouglasPeucker(points, sqTolerance);
  return simplePoints;
}
