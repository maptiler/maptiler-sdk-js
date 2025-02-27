function minMax(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number, min: number, max: number): number {
  return minMax((value - min) / (max - min), min, max);
}

function diagonalOfSquare(side: number): number {
  return Math.sqrt(2) * side;
}

export { minMax, normalize, diagonalOfSquare };
