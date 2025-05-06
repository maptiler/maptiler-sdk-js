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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export { minMax, normalize, diagonalOfSquare, lerpVec4, lerp };
