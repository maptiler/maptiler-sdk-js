export function arraysAreTheSameLength(...arrays: unknown[][]) {
  const length = arrays[0].length;
  return arrays.every((array) => {
    return array.length === length;
  });
}
