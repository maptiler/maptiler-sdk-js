import { Vec4 } from './webgl-utils';
declare function minMax(value: number, min: number, max: number): number;
declare function normalize(value: number, min: number, max: number): number;
declare function diagonalOfSquare(side: number): number;
type Lerpable = [number, number, number, number] | Vec4;
declare function lerpVec4(a: Lerpable, b: Lerpable, t: number): Vec4;
/**
 * Performs simple linear interpolation between two numbers.
 *
 * @param a - The start value
 * @param b - The end value
 * @param alpha - The interpolation factor (typically between 0 and 1):
 *                0 returns a, 1 returns b, and values in between return a proportional mix
 * @returns The interpolated value between a and b
 */
declare function lerp(a: number, b: number, alpha: number): number;
export { minMax, normalize, diagonalOfSquare, lerpVec4, lerp };
