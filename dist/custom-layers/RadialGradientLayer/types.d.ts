import { Object3D } from '../../utils/webgl-utils';
/**
 * Represents a color string. Can be any valid CSS color format such as hex (#RRGGBB),
 * RGB/RGBA (rgb(r, g, b) / rgba(r, g, b, a)), HSL/HSLA, or named colors (e.g., 'red', 'blue').
 * Used within RadialGradientLayer implementations.
 */
export type GradientStopColor = string;
/**
 * Represents a position in a radial gradient.
 * The numeric value typically indicates the position along the gradient where a color stop should be placed.
 * Usually normalized between 0 and 1, where 0 represents the center of the gradient and 1 represents the outer edge.
 */
export type GradientStop = number;
/**
 * Options for constructing a RadialGradientLayer.
 * This type is an alias for {@link GradientDefinition}, which defines the properties
 * needed to create a radial gradient visualization on a map.
 */
export type RadialGradientLayerConstructorOptions = GradientDefinition;
/**
 * Defines a gradient for use in a radial gradient layer.
 *
 * @typedef {Object} GradientDefinition
 * @property {Array<[GradientStop, GradientStopColor]>} stops - Array of gradient stops, where each stop is a tuple containing a position and a color
 * @property {number} scale - Scale factor that affects the size/reach of the gradient
 */
export type GradientDefinition = {
    stops: Array<[GradientStop, GradientStopColor]>;
    scale: number;
};
export type GradientAttributeKey = "vertexPosition";
/**
 * Keys for gradient uniform values used in the RadialGradientLayer.
 *
 * @typedef {string} GradientUniformKey
 * @property {"stopsNumber"} stopsNumber - Key for the number of stops in the gradient.
 * @property {"stops"} stops - Key for the positions of color stops in the gradient.
 * @property {"colors"} colors - Key for the color values at each stop in the gradient.
 */
export type GradientUniformKey = "stopsNumber" | "stops" | "colors";
/**
 * Represents a subset of a 3D object used for gradient rendering.
 *
 * This type picks only the essential properties from Object3D that are needed
 * for rendering radial gradients.
 *
 * @template GradientAttributeKey - The type defining attribute keys for the gradient
 * @template GradientUniformKey - The type defining uniform keys for the gradient
 */
export type GradientPlaneObject3D = Pick<Object3D<GradientAttributeKey, GradientUniformKey>, "shaderProgram" | "programInfo" | "positionBuffer">;
