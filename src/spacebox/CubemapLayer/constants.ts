const size = 1;
const hw = size / 2;
const hh = size / 2;
const hd = size / 2;

const frontFace = [-hw, -hh, hd, hw, -hh, hd, hw, hh, hd, -hw, hh, hd];
const backFace = [-hw, -hh, -hd, -hw, hh, -hd, hw, hh, -hd, hw, -hh, -hd];
const topFace = [-hw, hh, -hd, -hw, hh, hd, hw, hh, hd, hw, hh, -hd];
const bottomFace = [-hw, -hh, -hd, hw, -hh, -hd, hw, -hh, hd, -hw, -hh, hd];
const rightFace = [hw, -hh, -hd, hw, hh, -hd, hw, hh, hd, hw, -hh, hd];
const leftFace = [-hw, -hh, -hd, -hw, -hh, hd, -hw, hh, hd, -hw, hh, -hd];

const VERTICES = [
  ...frontFace,
  ...backFace,
  ...topFace,
  ...bottomFace,
  ...rightFace,
  ...leftFace,
];

const INDICES = [
  // Front
  0, 1, 2, 0, 2, 3,
  // Back
  4, 5, 6, 4, 6, 7,
  // Left
  8, 9, 10, 8, 10, 11,
  // Right
  12, 13, 14, 12, 14, 15,
  // Up
  16, 17, 18, 16, 18, 19,
  // Down
  20, 21, 22, 20, 22, 23,
];

export { VERTICES, INDICES };
