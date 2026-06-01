import { Vec4 } from "./webgl-utils";

function minMax(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number, min: number, max: number): number {
  return minMax((value - min) / (max - min), min, max);
}

function diagonalOfSquare(side: number): number {
  return Math.sqrt(2) * side;
}

type Lerpable = [number, number, number, number] | Vec4;

function lerpVec4(a: Lerpable, b: Lerpable, t: number): Vec4 {
  //prettier-ignore
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
    lerp(a[3], b[3], t),
  ];
}

/**
 * Performs simple linear interpolation between two numbers.
 *
 * @param a - The start value
 * @param b - The end value
 * @param alpha - The interpolation factor (typically between 0 and 1):
 *                0 returns a, 1 returns b, and values in between return a proportional mix
 * @returns The interpolated value between a and b
 */
function lerp(a: number, b: number, alpha: number) {
  return a + (b - a) * alpha;
}

export { minMax, normalize, diagonalOfSquare, lerpVec4, lerp };
