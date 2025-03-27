import { NumericArrayWithNull } from "./types";

export function lerp(a: number, b: number, alpha: number) {
  return a + (b - a) * alpha;
}

export const linear = (k: number) => k;

export function lerpArrayValues(numericArray: NumericArrayWithNull): number[] {
  if (numericArray.length === 0) {
    console.warn("Array empty, nothing to interpolate");
    return [];
  }

  if (numericArray.every((value) => value === null)) {
    throw new Error("Cannot interpolate an array where all values are `null`");
  }

  return numericArray.map((value, index, arr): number => {
    // if  value is a number, return it
    if (typeof value === "number") {
      return value;
    }

    const [prevIndex, prevValue] = findPreviousEntryAndIndexWithValue(
      arr,
      index,
    );

    const [nextIndex, nextValue] = findNextEntryAndIndexWithValue(arr, index);

    // if there is no previous value, eg all values are null before this index
    // return the value of the next entry that has a value
    // "fill all the way to the start"
    if (prevIndex === null || prevValue === null) {
      return arr[index + 1] as number;
    }

    // if there is no next value, eg all values are null after this index
    // return the value of the previous entry that has a value
    // "fill all the way to the end
    if (nextIndex === null || nextValue === null) {
      return prevValue;
    }

    // this means that anything else is null that sits between
    // two values that are not null, meaning we can interpolate
    const alpha = (index - prevIndex) / (nextIndex - prevIndex);

    return lerp(prevValue, nextValue, alpha);
  });
}

function findNextEntryAndIndexWithValue(
  arr: NumericArrayWithNull,
  currentIndex: number,
) {
  for (let i = currentIndex + 1; i < arr.length; i++) {
    if (arr[i] !== null) {
      return [i, arr[i]];
    }
  }
  return [null, null];
}

function findPreviousEntryAndIndexWithValue(
  arr: NumericArrayWithNull,
  currentIndex: number,
) {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (arr[i] !== null) {
      return [i, arr[i]];
    }
  }
  return [null, null];
}
