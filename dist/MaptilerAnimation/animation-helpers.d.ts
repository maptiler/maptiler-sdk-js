import { Feature, LineString, MultiLineString, MultiPoint, Polygon } from 'geojson';
import { EasingFunctionName, Keyframe, NumericArrayWithNull } from './types';
/**
 * Interpolates an array of numbers, replacing null values with interpolated values.
 *
 * `null` is treated as an empty value where an interpolation is needed.
 *
 * @param {NumericArrayWithNull} numericArray - The array of numbers to interpolate, which may contain null values
 * @returns A new array with null values replaced by interpolated values
 */
export declare function lerpArrayValues(numericArray: NumericArrayWithNull): number[];
/**
 * Looks ahead in an array for the next entry that is not null.
 *
 * @param arr - The array to search through
 * @param currentIndex - The index to start searching from
 * @returns [index, value] A tuple containing the index of the next entry and its value, or null if not found
 */
export declare function findNextEntryAndIndexWithValue(arr: NumericArrayWithNull, currentIndex: number): (number | null)[];
/**
 * Looks back in an array for the previous entry that is not null.
 *
 * @param arr - The array to search through
 * @param currentIndex - The index to start searching from
 * @returns [index, value] A tuple containing the index of the previous entry and its value, or null if not found
 */
export declare function findPreviousEntryAndIndexWithValue(arr: NumericArrayWithNull, currentIndex: number): (number | null)[];
/**
 * Options for parsing GeoJSON data into animation keyframes.
 *
 * @interface ParseGeoJSONToKeyframesOptions
 * @property {EasingFunctionName} [defaultEasing] - The default easing function to apply to the animation.
 * @property {Object|false} [pathSmoothing] - Configuration for path smoothing, or false to disable smoothing.
 * @property {number} [pathSmoothing.resolution] - The resolution used for path smoothing, higher values produce more detailed paths.
 * @property {number} [pathSmoothing.epsilon] - Optional tolerance parameter for path simplification.
 */
export interface ParseGeoJSONToKeyframesOptions {
    ignoreFields?: string[];
    defaultEasing?: EasingFunctionName;
    pathSmoothing?: {
        resolution: number;
        epsilon?: number;
    } | false;
}
/**
 * Represents geometry types that can be animated using keyframes.
 *
 * This type includes geometries like MultiPoint, LineString, MultiLineString, and Polygon
 * which can be interpolated or transformed over time in animations.
 */
export type KeyframeableGeometry = MultiPoint | LineString | MultiLineString | Polygon;
/**
 * Represents a GeoJSON Feature that can be animated with keyframes.
 * Extends the standard GeoJSON Feature with animation-specific properties.
 *
 * @typedef {Object} KeyframeableGeoJSONFeature
 * @extends {Feature<KeyframeableGeometry>}
 * @property {Object} properties - Contains both standard GeoJSON properties (as number arrays) and animation controls
 * @property {EasingFunctionName[]} [properties.@easing] - Easing functions to apply to property animations
 * @property {number[]} [properties.@delta] - Delta values for animation calculations
 * @property {number} [properties.@duration] - Duration of the animation in milliseconds
 * @property {number} [properties.@delay] - Delay before animation starts in milliseconds
 * @property {number} [properties.@iterations] - Number of times the animation should repeat
 * @property {boolean} [properties.@autoplay] - Whether the animation should start automatically
 */
export type KeyframeableGeoJSONFeature = Feature<KeyframeableGeometry> & {
    properties: Record<string, number[] | boolean | number | EasingFunctionName[]> & {
        "@easing"?: EasingFunctionName[];
        "@delta"?: number[];
        "@duration"?: number;
        "@delay"?: number;
        "@iterations"?: number;
        "@autoplay"?: boolean;
        altitude?: (number | null)[];
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
 * @param {KeyframeableGeoJSONFeature} feature - The GeoJSON feature to convert to keyframes
 * @param {ParseGeoJSONToKeyframesOptions} options - Configuration options
 *
 * @returns Array of keyframe objects that can be used for animation
 *
 * @throws {Error} When no geometry is found in the feature
 * @throws {Error} When the geometry type is not supported
 */
export declare function parseGeoJSONFeatureToKeyframes(feature: KeyframeableGeoJSONFeature, options?: ParseGeoJSONToKeyframesOptions): Keyframe[];
/**
 *
 * "Stretches" an array of numbers to a new length, filling in null values for the new indices.
 *
 * @param source the array to stretch
 * @param targetLength the length to stretch to
 * @returns {number[]} the stretched array with null values
 */
export declare function stretchNumericalArray(source: number[], targetLength: number): (number | null)[];
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
 *   ["Linear", "ElasticIn"], // easings
 *   { zoom: [10, 15] } // additional properties
 * );
 */
export declare function getKeyframes(coordinates: number[][], deltas: number[], easings: EasingFunctionName[], properties?: Record<string, number[]>): Keyframe[];
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
export declare function createBezierPathFromCoordinates(inputPath: [number, number][], outputResolution?: number, simplificationThreshold?: number): [number, number][];
/**
 * Calculates the average distance between points in an array of coordinates.
 *
 * This function computes the average distance between consecutive points in the array.
 * It uses the LngLat class from MapLibre to calculate distances based on geographical coordinates.
 *
 * @param arr - An array of coordinate pairs [longitude, latitude]
 * @returns The average distance between points in the array
 */
export declare function getAverageDistance(arr: [number, number][]): number;
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
export declare function simplifyPath(points: [number, number][], distance: number): [number, number][];
/**
 * Resamples a geographic path to have points spaced at approximately equal distances.
 * If the original path has fewer than 2 points, it is returned unchanged.
 *
 * @param path - An array of coordinate pairs [longitude, latitude] representing the path to resample
 * @param spacing - The desired spacing between points in the resampled path (in the same unit as used by the distanceTo method), defaults to 10
 * @returns A new array of coordinate pairs representing the resampled path with approximately equal spacing between points
 *
 */
export declare function resamplePath(path: [number, number][], spacing?: number): [number, number][];
