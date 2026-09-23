import { LngLat, Marker, Point, PositionAnchor, TransformConstrainFunction } from '../index';
export declare function unprojectFromWorldCoordinates(worldSize: number, point: Point): LngLat;
export declare const overpanningUnderzoomingTransformConstrain: TransformConstrainFunction;
export declare const anchorTranslate: Record<PositionAnchor, string>;
/**
 * Monkey patches the Marker instance to remove wrapping. Because pixel projection does not wrap like lnglat.
 * See here https://github.com/maplibre/maplibre-gl-js/blob/14f56b00e0f08784681ef98f0731c60f3923a4a9/src/ui/marker.ts#L601
 * @param {Marker} marker - The Marker instance to patch.
 */
export declare function monkeyPatchMarkerInstanceToRemoveWrapping(marker: Marker): void;
