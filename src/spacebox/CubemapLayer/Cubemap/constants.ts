const size = 2;
const hw = size / 2;
const hh = size / 2;
const hd = size / 2;

const positions = [
  // Front face
  -hw, -hh, hd, hw, -hh, hd, hw, hh, hd, -hw, hh, hd,
  // Back face
  -hw, -hh, -hd, -hw, hh, -hd, hw, hh, -hd, hw, -hh, -hd,
  // Top face
  -hw, hh, -hd, -hw, hh, hd, hw, hh, hd, hw, hh, -hd,
  // Bottom face
  -hw, -hh, -hd, hw, -hh, -hd, hw, -hh, hd, -hw, -hh, hd,
  // Right face
  hw, -hh, -hd, hw, hh, -hd, hw, hh, hd, hw, -hh, hd,
  // Left face
  -hw, -hh, -hd, -hw, -hh, hd, -hw, hh, hd, -hw, hh, -hd,
];

const indices = [
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

export { positions, indices };
