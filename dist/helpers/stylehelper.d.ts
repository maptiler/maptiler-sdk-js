import { DataDrivenPropertyValueSpecification, ExpressionSpecification } from 'maplibre-gl';
import { ColorRamp } from '../ColorRamp';
import { DataDrivenStyle, PropertyValues, ZoomNumberValues, ZoomStringValues } from './vectorlayerhelpers';
export type ColorPalette = [string, string, string, string];
export declare const colorPalettes: Array<ColorPalette>;
export declare function getRandomColor(): string;
export declare function generateRandomSourceName(): string;
export declare function generateRandomLayerName(): string;
/**
 * Linera interpolation to find a value at an arbitrary zoom level, given a list of tuple zoom-value
 */
export declare function lerpZoomNumberValues(znv: ZoomNumberValues, z: number): number;
export declare function paintColorOptionsToPaintSpec(color: ZoomStringValues): DataDrivenPropertyValueSpecification<string>;
export declare function rampedOptionsToLayerPaintSpec(ramp: ZoomNumberValues): DataDrivenPropertyValueSpecification<number>;
export declare function computeRampedOutlineWidth(lineWidth: number | ZoomNumberValues, outlineWidth: number | ZoomNumberValues): number | DataDrivenPropertyValueSpecification<number>;
export declare function rampedPropertyValueWeight(ramp: PropertyValues, property: string): DataDrivenPropertyValueSpecification<number>;
/**
 * Create a dash array from a string pattern that uses underscore and whitespace characters
 */
export declare function dashArrayMaker(pattern: string): Array<number>;
export declare function colorDrivenByProperty(style: DataDrivenStyle, property: string): DataDrivenPropertyValueSpecification<string>;
export declare function radiusDrivenByProperty(style: DataDrivenStyle, property: string, zoomCompensation?: boolean): DataDrivenPropertyValueSpecification<number>;
export declare function radiusDrivenByPropertyHeatmap(style: PropertyValues, property: string, zoomCompensation?: boolean): DataDrivenPropertyValueSpecification<number>;
/**
 * Turns a ColorRamp instance into a MapLibre style for ramping the opacity, driven by a property
 */
export declare function opacityDrivenByProperty(colorramp: ColorRamp, property: string): DataDrivenPropertyValueSpecification<number>;
export declare function heatmapIntensityFromColorRamp(colorRamp: ColorRamp, steps?: number): ExpressionSpecification;
