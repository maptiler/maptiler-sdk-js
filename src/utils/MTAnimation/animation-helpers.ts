import { Feature, LineString, MultiLineString, MultiPoint, Polygon } from "geojson";
import { EasingFunctionName, Keyframe, NumericArrayWithNull } from "./types";
import { arraysAreTheSameLength } from "../array";

/**
 * Performs simple linear interpolation between two numbers.
 *
 * @param a - The start value
 * @param b - The end value
 * @param alpha - The interpolation factor (typically between 0 and 1):
 *                0 returns a, 1 returns b, and values in between return a proportional mix
 * @returns The interpolated value between a and b
 */
export function lerp(a: number, b: number, alpha: number) {
  return a + (b - a) * alpha;
}

const f = 1;

/**
 * Interpolates an array of numbers, replacing null values with interpolated values.
 *
 * `null` is treated as an empty value where an interpolation is needed.
 *
 * @param numericArray - The array of numbers to interpolate, which may contain null values
 * @returns A new array with null values replaced by interpolated values
 */
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

/**
 * Looks ahead in an array for the next entry that is not null.
 *
 * @param arr - The array to search through
 * @param currentIndex - The index to start searching from
 * @returns A tuple containing the index of the next entry and its value, or null if not found
 */
function findNextEntryAndIndexWithValue(arr: NumericArrayWithNull, currentIndex: number) {
  for (let i = currentIndex + 1; i < arr.length; i++) {
    if (arr[i] !== null) {
      return [i, arr[i]];
    }
  }
  return [null, null];
}

/**
 * Looks back in an array for the previous entry that is not null.
 *
 * @param arr - The array to search through
 * @param currentIndex - The index to start searching from
 * @returns A tuple containing the index of the previous entry and its value, or null if not found
 */
function findPreviousEntryAndIndexWithValue(arr: NumericArrayWithNull, currentIndex: number) {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (arr[i] !== null) {
      return [i, arr[i]];
    }
  }
  return [null, null];
}

interface IParseGeoJSONToKeyframesOptions {
  defaultEasing?: EasingFunctionName;
  pathSmoothing?:
    | {
        resolution: number;
        epsilon?: number;
      }
    | false;
}

const parseGeoJSONFeatureToKeyframesDefaultOptions: IParseGeoJSONToKeyframesOptions = {
  defaultEasing: EasingFunctionName.Linear,
  pathSmoothing: false,
};

const ACCEPTED_GEOMETRY_TYPES = ["MultiPoint", "LineString", "MultiLineString", "Polygon"];

export type KeyframeableGeometry = MultiPoint | LineString | MultiLineString | Polygon;

export type KeyframeableGeoJSONFeature = Feature<KeyframeableGeometry> & {
  properties: Record<string, number[]> & {
    "@easing"?: EasingFunctionName[];
    "@delta"?: number[];
  };
};

/**
 * Converts a GeoJSON feature into an array of animation keyframes.
 *
 * Parses a GeoJSON feature with reserved properties to create animation keyframes.
 * It extracts coordinates from the geometry and uses properties prefixed with '@' as animation
 * control parameters (easing functions, delta values). Non-reserved properties are preserved
 * and passed to the keyframe objects as props that will be interpolated
 *
 * @param feature - The GeoJSON feature to convert to keyframes
 * @param feature.geometry - The geometry object containing coordinates
 * @param feature.properties - Properties object that may contain animation controls:
 *   - `@easing`: Array of easing function names for each keyframe
 *   - `@delta`: Array of timing values (0-1) representing the progress for each keyframe
 * @param options - Configuration options
 * @param options.defaultEasing - Default easing function to use when not specified in properties
 * @param options.pathSmoothing - Optional path smoothing configuration
 * @param options.pathSmoothing.resolution - Resolution factor for the smoothing algorithm
 * @param options.pathSmoothing.epsilon - Epsilon value for the smoothing algorithm
 *
 * @returns Array of keyframe objects that can be used for animation
 *
 * @throws {Error} When no geometry is found in the feature
 * @throws {Error} When the geometry type is not supported
 */
export function parseGeoJSONFeatureToKeyframes(feature: KeyframeableGeoJSONFeature, options: IParseGeoJSONToKeyframesOptions = {}): Keyframe[] {
  const { defaultEasing } = {
    ...parseGeoJSONFeatureToKeyframesDefaultOptions,
    ...options,
  };

  const { geometry, properties } = feature;

  const easings = properties["@easing"];

  if (!easings) {
    console.warn(`[parseGeoJSONFeatureToKeyframes]: No '@easing' property found in GeoJSON properties, using default easing ${defaultEasing as string}`);
  }

  const deltas = properties["@delta"];
  if (!deltas) {
    console.warn(`[parseGeoJSONFeatureToKeyframes]: No '@delta' property found in GeoJSON properties, delta for each frame will default to its index divided by the total`);
  }

  if (!geometry.type) {
    throw new Error("[parseGeoJSONFeatureToKeyframes]: No geometry found in feature");
  }

  if (!ACCEPTED_GEOMETRY_TYPES.includes(geometry.type)) {
    throw new Error(`[parseGeoJSONFeatureToKeyframes]: Geometry type ${geometry.type} not supported. Accepted types are: ${ACCEPTED_GEOMETRY_TYPES.join(", ")}`);
  }

  // if the geometry is an array of arrays of coordinates
  // we need to flatten it to a single array of coordinates
  const flattenGeometry = geometry.type !== "LineString" && geometry.type !== "MultiPoint";

  // extract the properties that are not reserved for animation control
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

  // if smoothing options are provided, we need to smooth the path
  // this is generally used for camera animations to avoid jerky motion
  if (options.pathSmoothing) {
    const smoothedPath = createBezierPathFromCoordinates(parseableGeometry as [number, number][], options.pathSmoothing.resolution, options.pathSmoothing.epsilon);
    const smoothedDeltas = smoothedPath.map((_, index) => index / smoothedPath.length);
    const smoothedEasings = smoothedDeltas.map(() => defaultEasing ?? EasingFunctionName.Linear);

    const smoothedProperties = Object.entries(nonReservedProperties as Record<string, number[]>).reduce((acc, [key, value]) => {
      const newArrayLength = smoothedPath.length;
      const currentArrayLength = value.length;
      const newArrayToOldArrayRatio = Math.floor(newArrayLength / currentArrayLength);

      // "stretch" the array to the new length
      // this means that if the smoothed path array is longer than the old one
      // we need to fill the new array with the old values and leave `null`
      // for interpolation between those values
      const newArray = new Array(newArrayLength).fill(null).map((_, index) => {
        const newIndex = index / newArrayToOldArrayRatio;
        if (isFloat(newIndex)) {
          return null;
        }

        return value[newIndex] ?? null;
      });

      return {
        ...acc,
        [key]: newArray,
      };
    }, {});

    // pass the arguments to getKeyframes
    // this will return an array of keyframes with the smoothed path
    return getKeyframes(smoothedPath, smoothedDeltas, smoothedEasings, smoothedProperties);
  }

  // if the path smoothing is not applied, we pass the original coordinates
  return getKeyframes(parseableGeometry, parseableDeltas, parseableEasings, nonReservedProperties);
}

// ...
function isFloat(n: number) {
  return n % 1 !== 0;
}

/**
 * Generates an array of keyframes from coordinates, deltas, easings, and other properties provided by the geoJSON feature.
 * Assumes that the coordinates are in the format [longitude, latitude, altitude?]. If altitude is not provided, it defaults to 0.
 *
 * @param coordinates - Array of coordinate points, where each point is an array of [longitude, latitude, altitude?]
 * @param deltas - Array of time deltas between keyframes
 * @param easings - Array of easing function names to apply to each keyframe transition
 * @param properties - Optional additional properties as key-value pairs, where each value is an array
 * of numbers corresponding to each keyframe
 *
 * @returns An array of Keyframe objects, each containing coordinate props, delta, and easing information
 *
 * @throws Error if the arrays for coordinates, deltas, easings, and any property values don't have matching lengths
 *
 * @example
 * const keyframes = getKeyframes(
 *   [[0, 0, 10], [10, 10, 20]], // coordinates
 *   [1000, 2000], // deltas (in milliseconds)
 *   ['linear', 'ease-in'], // easings
 *   { zoom: [10, 15] } // additional properties
 * );
 */
function getKeyframes(coordinates: number[][], deltas: number[], easings: EasingFunctionName[], properties: Record<string, number[]> = {}): Keyframe[] {
  if (!arraysAreTheSameLength(coordinates, deltas, easings, ...Object.values(properties))) {
    throw new Error(`
      [parseGeoJSONFeatureToKeyframes]: If smoothing is not applied, coordinates, deltas, easings and property arrays must be the same length\n
      Coordinates: ${coordinates.length}\n
      Deltas: ${deltas.length}\n
      Easing: ${easings.length}\n
      Properties: ${Object.entries(properties)
        .map(([key, value]) => `"${key}": ${value.length}`)
        .join(", ")}
    `);
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

/**
 * Creates a smoothed path using cubic Bezier curves from an array of coordinates.
 *
 * This function takes a series of points and creates a smooth path by generating cubic
 * Bezier curves between them. It uses the Catmull-Rom method to automatically calculate
 * control points for each curve segment. If the path has fewer than 4 points, the original
 * path is returned unchanged.
 *
 * @param inputPath - Array of [x, y] coordinates that define the original path
 * @param outputResolution - Controls how many points are generated along each segment
 *                           (higher values create smoother curves with more points)
 * @param simplificationThreshold - Optional threshold for simplifying the input path before
 *                                  creating the curves.
 * @returns An array of [x, y] coordinates representing the smoothed path
 */
export function createBezierPathFromCoordinates(inputPath: [number, number][], outputResolution: number = 20, simplificationThreshold?: number): [number, number][] {
  const workingPath = typeof simplificationThreshold === "number" ? simplifyPath(inputPath, simplificationThreshold) : inputPath;

  if (workingPath.length < 4) return workingPath; // Need at least 4 points

  const smoothedPath: [number, number][] = [];

  for (let i = 1; i < workingPath.length - 2; i++) {
    const previousPoint = workingPath[i - 1];
    const currentPoint = workingPath[i];
    const nextPoint = workingPath[i + 1];
    const afterNextPoint = workingPath[i + 2];

    // Compute control points
    const firstControlPoint: [number, number] = [currentPoint[0] + (nextPoint[0] - previousPoint[0]) / 6, currentPoint[1] + (nextPoint[1] - previousPoint[1]) / 6];
    const secondControlPoint: [number, number] = [nextPoint[0] - (afterNextPoint[0] - currentPoint[0]) / 6, nextPoint[1] - (afterNextPoint[1] - currentPoint[1]) / 6];

    // Generate points along the Bezier curve
    for (let curvePosition = 0; curvePosition <= 1; curvePosition += 1 / outputResolution) {
      const interpolatedX =
        (1 - curvePosition) ** 3 * currentPoint[0] +
        3 * (1 - curvePosition) ** 2 * curvePosition * firstControlPoint[0] +
        3 * (1 - curvePosition) * curvePosition ** 2 * secondControlPoint[0] +
        curvePosition ** 3 * nextPoint[0];

      const interpolatedY =
        (1 - curvePosition) ** 3 * currentPoint[1] +
        3 * (1 - curvePosition) ** 2 * curvePosition * firstControlPoint[1] +
        3 * (1 - curvePosition) * curvePosition ** 2 * secondControlPoint[1] +
        curvePosition ** 3 * nextPoint[1];

      smoothedPath.push([interpolatedX, interpolatedY]);
    }
  }

  return smoothedPath;
}

/**
 * Simplifies a path by removing points that are closer than a specified distance to the last retained point.
 * Note that this is euclidean distance only, so for lat lng coordinates
 * there will be some inaccuracies on larger distances and closer to the poles.
 *
 * @param path - An array of [x, y] coordinates representing the original path
 * @param distance - The minimum distance threshold between consecutive points in the simplified path
 * @returns A new array containing the simplified path with fewer points
 *
 */
export function simplifyPath(path: [number, number][], distance: number): [number, number][] {
  if (path.length < 2) return path;

  const simplifiedPath: [number, number][] = [path[0]]; // Start with the first point

  let lastPoint = path[0];

  for (let i = 1; i < path.length; i++) {
    const currentPoint = path[i];
    const dist = Math.sqrt((currentPoint[0] - lastPoint[0]) ** 2 + (currentPoint[1] - lastPoint[1]) ** 2);

    // Add the point if it is farther than the specified distance
    if (dist >= distance) {
      simplifiedPath.push(currentPoint);
      lastPoint = currentPoint;
    }
  }

  return simplifiedPath;
}
