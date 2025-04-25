import { Feature, LineString, MultiLineString, MultiPoint, Polygon } from "geojson";
import { EasingFunctionName, Keyframe, NumericArrayWithNull } from "./types";
import { arraysAreTheSameLength } from "../array";
import { LngLat } from "maplibre-gl";

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

/**
 * Interpolates an array of numbers, replacing null values with interpolated values.
 *
 * `null` is treated as an empty value where an interpolation is needed.
 *
 * @param {NumericArrayWithNull} numericArray - The array of numbers to interpolate, which may contain null values
 * @returns A new array with null values replaced by interpolated values
 */
export function lerpArrayValues(numericArray: NumericArrayWithNull): number[] {
  if (numericArray.length === 0) {
    throw new Error("[lerpArrayValues]: Array empty, nothing to interpolate");
  }

  if (numericArray.every((value) => value === null)) {
    throw new Error("[lerpArrayValues]: Cannot interpolate an array where all values are `null`");
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
    // "fill all the way to the end"
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
 * @returns [index, value] A tuple containing the index of the next entry and its value, or null if not found
 */
export function findNextEntryAndIndexWithValue(arr: NumericArrayWithNull, currentIndex: number) {
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
 * @returns [index, value] A tuple containing the index of the previous entry and its value, or null if not found
 */
export function findPreviousEntryAndIndexWithValue(arr: NumericArrayWithNull, currentIndex: number) {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (arr[i] !== null) {
      return [i, arr[i]];
    }
  }
  return [null, null];
}

interface IparseGeoJSONToKeyframesOptions {
  defaultEasing?: EasingFunctionName;
  pathSmoothing?:
    | {
        resolution: number;
        epsilon?: number;
      }
    | false;
}

const defaultOptions: IparseGeoJSONToKeyframesOptions = {
  defaultEasing: EasingFunctionName.Linear,
  pathSmoothing: {
    resolution: 20,
    epsilon: 5,
  },
};

const ACCEPTED_GEOMETRY_TYPES = ["MultiPoint", "LineString", "MultiLineString", "Polygon"];

export type KeyframeableGeometry = MultiPoint | LineString | MultiLineString | Polygon;

export type KeyframeableGeoJSONFeature = Feature<KeyframeableGeometry> & {
  properties: Record<string, number[]> & {
    "@easing"?: EasingFunctionName[];
    "@delta"?: number[];
    "@duration"?: number;
    "@delay"?: number;
    "@iterations"?: number;
    "@autoplay"?: boolean;
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
export function parseGeoJSONFeatureToKeyframes(feature: KeyframeableGeoJSONFeature, options: IparseGeoJSONToKeyframesOptions = {}): Keyframe[] {
  const { defaultEasing } = {
    ...defaultOptions,
    ...options,
  } as IparseGeoJSONToKeyframesOptions;

  const geometry = feature.geometry;
  const properties = feature.properties ?? {};

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
    throw new Error(`[parseGeoJSONFeatureToKeyframes]: Geometry type '${geometry.type}' is not supported. Accepted types are: ${ACCEPTED_GEOMETRY_TYPES.join(", ")}`);
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
  // NOTE: any 3rd "altitude" coordinate is ignored for smoothing
  // this means that the path will be smoothed only in 2D space
  if (options.pathSmoothing) {
    const smoothedPath = createBezierPathFromCoordinates(parseableGeometry as [number, number][], options.pathSmoothing.resolution, options.pathSmoothing.epsilon);
    const smoothedDeltas = smoothedPath.map((_, index) => index / smoothedPath.length);
    const smoothedEasings = smoothedDeltas.map(() => defaultEasing ?? EasingFunctionName.Linear);

    const smoothedProperties = Object.entries(nonReservedProperties as Record<string, number[]>).reduce((acc, [key, value]) => {
      const newArrayLength = smoothedPath.length;

      // "stretch" the array to the new length
      // this means that if the smoothed path array is longer than the old one
      // we need to fill the new array with the old values and leave `null`
      // for interpolation between those values
      const newArray = stretchNumericalArray(value, newArrayLength);

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

/**
 *
 * "Stretches" an array of numbers to a new length, filling in null values for the new indices.
 *
 * @param source the array to stretch
 * @param targetLength the length to stretch to
 * @returns {number[]} the stretched array with null values
 */
export function stretchNumericalArray(source: number[], targetLength: number): (number | null)[] {
  const mapOfIndices = source.map((_, i) => {
    const t = i / (source.length - 1);
    return Math.round(t * (targetLength - 1));
  });

  return Array.from({ length: targetLength }, (_, i) => (mapOfIndices.includes(i) ? source[mapOfIndices.indexOf(i)] : null));
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
 *   [EasingFunctionName.Linear, EasingFunctionName.ElasticIn], // easings
 *   { zoom: [10, 15] } // additional properties
 * );
 */
export function getKeyframes(coordinates: number[][], deltas: number[], easings: EasingFunctionName[], properties: Record<string, number[]> = {}): Keyframe[] {
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

  const includeAltitude = !coordinates.every((coordinate) => coordinate.length < 3);

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
      ...(includeAltitude && { altitude: coordinate[2] ?? null }),
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
export function createBezierPathFromCoordinates(inputPath: [number, number][], outputResolution: number = 20, epsilon?: number): [number, number][] {
  const path = typeof epsilon === "number" ? simplifyPath(inputPath, epsilon) : inputPath;

  if (path.length < 4) return path; // Need at least 4 points

  const smoothPath: [number, number][] = [];

  for (let i = 1; i < path.length - 2; i++) {
    const p0 = path[i - 1];
    const p1 = path[i];
    const p2 = path[i + 1];
    const p3 = path[i + 2];

    // Compute control points...
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];

    // Generate points along the curve...
    for (let t = 0; t <= 1; t += 1 / outputResolution) {
      const x = (1 - t) ** 3 * p1[0] + 3 * (1 - t) ** 2 * t * c1[0] + 3 * (1 - t) * t ** 2 * c2[0] + t ** 3 * p2[0];

      const y = (1 - t) ** 3 * p1[1] + 3 * (1 - t) ** 2 * t * c1[1] + 3 * (1 - t) * t ** 2 * c2[1] + t ** 3 * p2[1];

      smoothPath.push([x, y]);
    }
  }

  return smoothPath;
}

/**
 * Calculates the average distance between points in an array of coordinates.
 *
 * This function computes the average distance between consecutive points in the array.
 * It uses the LngLat class from MapLibre to calculate distances based on geographical coordinates.
 *
 * @param arr - An array of coordinate pairs [longitude, latitude]
 * @returns The average distance between points in the array
 */
export function getAverageDistance(arr: [number, number][]): number {
  return (
    arr
      .map((point, index) => {
        if (index === 0) return 0;
        const lastPoint = arr[index - 1];
        const lngLat = new LngLat(point[0], point[1]);
        const lastLngLat = new LngLat(lastPoint[0], lastPoint[1]);
        return lngLat.distanceTo(lastLngLat);
      })
      .reduce((acc, dist) => acc + dist, 0) / arr.length
  );
}

/**
 * Simplfies a path by removing points that are too close together.
 *
 * This function first resamples the path based on the average distance between points,
 * then filters out points that are closer than the specified distance from the last included point.
 * The first and last points of the original path are always preserved.
 *
 * @param points - An array of coordinate pairs [longitude, latitude]
 * @param distance - The minimum distance between points in the simplified path
 * @returns A new array containing a simplified version of the input path
 */
export function simplifyPath(points: [number, number][], distance: number): [number, number][] {
  const path = resamplePath(points, getAverageDistance(points) * distance);

  if (path.length < 2) return path;

  const simplifiedPath: [number, number][] = [path[0]]; // Start with the first point

  let lastPoint = path[0];

  for (let i = 1; i < path.length; i++) {
    const currentPoint = path[i];

    const lastLngLat = new LngLat(lastPoint[0], lastPoint[1]);
    const currentLngLat = new LngLat(currentPoint[0], currentPoint[1]);
    const dist = lastLngLat.distanceTo(currentLngLat);
    // Add the point if it is farther than the specified distance
    if (dist >= distance) {
      simplifiedPath.push(currentPoint);
      lastPoint = currentPoint;
    }
  }

  simplifiedPath.push(path[path.length - 1]); // Add the last point

  return simplifiedPath;
}

/**
 * Resamples a geographic path to have points spaced at approximately equal distances.
 * If the original path has fewer than 2 points, it is returned unchanged.
 *
 * @param path - An array of coordinate pairs [longitude, latitude] representing the path to resample
 * @param spacing - The desired spacing between points in the resampled path (in the same unit as used by the distanceTo method), defaults to 10
 * @returns A new array of coordinate pairs representing the resampled path with approximately equal spacing between points
 *
 */
export function resamplePath(path: [number, number][], spacing: number = 10): [number, number][] {
  if (path.length < 2) return path;

  const result: [number, number][] = [path[0]];
  let remaining = spacing;

  for (let i = 0; i < path.length - 1; ) {
    const p1 = LngLat.convert(path[i]);
    const p2 = LngLat.convert(path[i + 1]);
    const segDist = p1.distanceTo(p2);

    if (segDist < remaining) {
      remaining -= segDist;
      i++;
    } else {
      const t = remaining / segDist;

      const newPoint: [number, number] = [lerp(p1.lng, p2.lng, t), lerp(p1.lat, p2.lat, t)];

      result.push(newPoint);
      path[i] = newPoint; // insert newPoint into segment
      remaining = spacing;
    }
  }

  return result;
}
