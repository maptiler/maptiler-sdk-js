import { Feature, LineString, MultiLineString, MultiPoint, Polygon } from "geojson";
import { EasingFunctionName, Keyframe, NumericArrayWithNull } from "./types";
import { arraysAreTheSameLength } from "../array";

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

    const [prevIndex, prevValue] = findPreviousEntryAndIndexWithValue(arr, index);

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

function findNextEntryAndIndexWithValue(arr: NumericArrayWithNull, currentIndex: number) {
  for (let i = currentIndex + 1; i < arr.length; i++) {
    if (arr[i] !== null) {
      return [i, arr[i]];
    }
  }
  return [null, null];
}

function findPreviousEntryAndIndexWithValue(arr: NumericArrayWithNull, currentIndex: number) {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (arr[i] !== null) {
      return [i, arr[i]];
    }
  }
  return [null, null];
}

interface IparseGeoJSONToKeyframesOptions {
  defaultEasing?: EasingFunctionName;
}

const defaultOptions: IparseGeoJSONToKeyframesOptions = {
  defaultEasing: EasingFunctionName.Linear,
};

const ACCEPTED_GEOMETRY_TYPES = ["MultiPoint", "LineString", "MultiLineString", "Polygon"];

export type KeyframeableGeometry = MultiPoint | LineString | MultiLineString | Polygon;

export type KeyframeableGeoJSONFeature = Feature<KeyframeableGeometry> & {
  properties: Record<string, number[]> & {
    "@easing"?: EasingFunctionName[];
    "@delta"?: number[];
  };
};

export function parseGeoJSONFeatureToKeyframes(feature: KeyframeableGeoJSONFeature, options: IparseGeoJSONToKeyframesOptions = {}): Keyframe[] {
  const { defaultEasing } = {
    ...defaultOptions,
    ...options,
  } as IparseGeoJSONToKeyframesOptions;

  const geometry = feature.geometry;
  const properties = feature.properties;

  const easings = properties["@easing"];

  if (!easings) {
    console.warn(`[parseGeoJSONFeatureToKeyframes]: No '@easing' property found in GeoJSON properties, using default easing ${defaultEasing as string}`);
  }

  const deltas = properties["@delta"];
  if (!deltas) {
    console.warn(`[parseGeoJSONFeatureToKeyframes]: No '@delta' property found in GeoJSON properties, delta for each frame will default to its index divided by the total`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!geometry.type) {
    throw new Error("[parseGeoJSONFeatureToKeyframes]: No geometry found in feature");
  }

  if (!ACCEPTED_GEOMETRY_TYPES.includes(geometry.type)) {
    throw new Error(`[parseGeoJSONFeatureToKeyframes]: Geometry type ${geometry.type} not supported. Accepted types are: ${ACCEPTED_GEOMETRY_TYPES.join(", ")}`);
  }

  const flattenGeometry = geometry.type !== "LineString" && geometry.type !== "MultiPoint";

  const nonReservedProperties = Object.entries(properties).reduce((acc, [key, value]: [string, number]) => {
    if (key.startsWith("@")) {
      return acc;
    }
    return {
      ...acc,
      [key]: value,
    };
  }, {});

  // for now we flatten the geometry to a single array
  // this means that polygons with holes will be treated as a single array
  const parseableGeometry = flattenGeometry ? geometry.coordinates.flat() : geometry.coordinates;
  const parseableDeltas = deltas ?? parseableGeometry.map((_, index) => index / parseableGeometry.length);
  const parseableEasings = easings ?? parseableDeltas.map(() => defaultEasing ?? EasingFunctionName.Linear);

  return getKeyframes(parseableGeometry, parseableDeltas, parseableEasings, nonReservedProperties);
}

function getKeyframes(coordinates: number[][], deltas: number[], easings: EasingFunctionName[], properties: Record<string, number[]> = {}): Keyframe[] {
  if (!arraysAreTheSameLength(coordinates, deltas, easings, ...Object.values(properties))) {
    throw new Error("[parseGeoJSONFeatureToKeyframes]: Coordinates, deltas and easings arrays must be the same length");
  }

  return coordinates.map((coordinate: number[], index: number) => {
    const delta = deltas[index];
    const easing = easings[index];

    const propertyValuesForThisKeyframe = Object.entries(properties).reduce((acc, [key, valueArray]) => {
      return {
        ...acc,
        [key]: valueArray[index],
      };
    }, {});

    const props = {
      ...propertyValuesForThisKeyframe,
      lng: coordinate[0],
      lat: coordinate[1],
      altitude: coordinate[2] ?? 0,
    };

    return {
      props,
      delta,
      easing,
    };
  });
}
