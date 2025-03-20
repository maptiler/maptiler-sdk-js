export function lerp(a: number, b: number, alpha: number) {
  return a + (b - a) * alpha;
}

export function lerpArrayValues(arr: (number | null)[]): number[] {
  return arr.map((value, index) => {
    // If value exists, return it directly
    if (value !== null) return value;

    // Find nearest indices with valid values
    const leftIndex = findNearestIndex(arr, index, -1);
    const rightIndex = findNearestIndex(arr, index, 1);

    // Handle edge cases
    if (leftIndex === null && rightIndex === null) {
      throw new Error(`Cannot interpolate array with all null values`);
    }

    if (leftIndex === null && rightIndex !== null) {
      const rightValue = arr[rightIndex];
      return rightValue !== null ? rightValue : 0; // Use right value if available
    }

    if (rightIndex === null && leftIndex !== null) {
      const leftValue = arr[leftIndex];
      return leftValue !== null ? leftValue : 0; // Use left value if available
    }

    // Both indices are valid, do the interpolation
    if (leftIndex !== null && rightIndex !== null) {
      const leftValue = arr[leftIndex];
      const rightValue = arr[rightIndex];

      if (leftValue !== null && rightValue !== null) {
        const t = (index - leftIndex) / (rightIndex - leftIndex);
        return lerp(leftValue, rightValue, t);
      }
    }

    // Fallback case (shouldn't happen with proper type guards)
    return 0;
  });
}

// function findNearestIndex(arr: (number | null)[], startIndex: number, direction: 1 | -1) {
//   let index = startIndex + direction;
//   while (index >= 0 && index < arr.length) {
//       if (arr[index] !== null) return index;
//       index += direction;
//   }
//   return null;
// }

export function findNearestIndex(
  arr: (number | null)[],
  startIndex: number,
  direction: 1 | -1,
): number | null {
  return (
    arr
      .map((val, idx) => (val !== null ? idx : null)) // Get valid indices
      .filter((idx) => idx !== null) // Remove nulls
      .find((idx) =>
        direction === 1 ? idx! > startIndex : idx! < startIndex,
      ) ?? null
  );
}
