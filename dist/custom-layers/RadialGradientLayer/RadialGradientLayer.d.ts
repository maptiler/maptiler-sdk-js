import { CustomLayerInterface, CustomRenderMethodInput } from 'maplibre-gl';
import { Map as MapSDK } from '../../Map';
import { GradientDefinition, RadialGradientLayerConstructorOptions } from './types';
/**
 * A custom map layer that renders a radial gradient effect, typically used as a halo around a globe.
 * This layer uses WebGL for rendering and provides animation capabilities.
 *
 * The layer is implemented as a 3D custom layer that renders a billboard quad with a radial gradient shader.
 * The gradient can be configured with multiple color stops and can be animated.
 *
 * @example
 * ```typescript
 * // Create a simple halo layer with default settings
 * const haloLayer = new RadialGradientLayer(true);
 * map.addLayer(haloLayer);
 *
 * // Create a customized halo layer
 * const customHalo = new RadialGradientLayer({
 *   scale: 1.5,
 *   stops: [
 *     [0, "rgba(255, 255, 255, 0.8)"],
 *     [1, "rgba(255, 255, 255, 0)"]
 *   ]
 * });
 * map.addLayer(customHalo);
 * ```
 * @remarks You shouldn't have to use this class directly.
 * Instead, use the `Map.setHalo` method to create and add a halo layer to the map.
 */
export declare class RadialGradientLayer implements CustomLayerInterface {
    id: string;
    type: CustomLayerInterface["type"];
    renderingMode: CustomLayerInterface["renderingMode"];
    /**
     * The gradient definition used by this layer.
     * It contains the stops and scale for the radial gradient.
     * @private
     * @type {GradientDefinition}
     */
    private gradient;
    /**
     * The scale of the radial gradient, which determines its size.
     * This value is animated from 0 to the target scale during the layer's appearance.
     * @private
     * @type {number}
     */
    private scale;
    /**
     * The animation delta value used to control the progress of the gradient's appearance animation.
     * It is incremented during each frame of the animation until it reaches 1.
     * @private
     * @type {number}
     */
    private animationDelta;
    /**
     * The MapSDK instance to which this layer is added.
     * This is set when the layer is added to the map.
     * @private
     * @type {MapSDK}
     */
    private map;
    /**
     * The 3D object representing the radial gradient plane.
     * This object is created when the layer is added to the map and contains the shader program and buffers.
     * It is used for rendering the radial gradient effect.
     * @private
     * @type {Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>}
     */
    private plane?;
    /**
     * Whether the halo should be animated in and out.
     * @private
     * @type {boolean}
     */
    private animationActive;
    /**
     * Creates a new RadialGradientLayer instance.
     *
     * @param {RadialGradientLayerConstructorOptions | boolean} gradient - Configuration options for the radial gradient or a boolean value.
     * If a boolean is provided, default configuration options will be used.
     * If an `RadialGradientLayerConstructorOptions` is provided, it will be merged with default options.
     */
    constructor(gradient: RadialGradientLayerConstructorOptions | boolean);
    /**
     * Adds the radial gradient layer to the specified map.
     * This method is called by the map when the layer is added to it.
     *
     * @param {MapSDK} map - The MapSDK instance to which this layer is being added
     * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL rendering context used for rendering the layer
     * @returns void
     */
    onAdd(map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void;
    /**
     * Returns the current gradient configuration of the radial gradient layer.
     *
     * @returns {GradientDefinition} The current gradient configuration.
     */
    getConfig(): GradientDefinition;
    /**
     * Checks if the gradient needs to be updated based on the provided specification.
     *
     * @param {GradientDefinition} spec - The gradient specification to compare with the current gradient.
     * @returns {boolean} True if the gradient needs to be updated, false otherwise.
     */
    shouldUpdate(newSpec?: GradientDefinition | boolean): boolean;
    /**
     * Animates the radial gradient into view by gradually scaling from 0 to the target scale.
     *
     * This method uses requestAnimationFrame to create a smooth scaling animation effect.
     * During each frame, it:
     *   1. Interpolates the scale value between 0 and the target scale
     *   2. Increments the animation progress (animationDelta)
     *   3. Triggers a map repaint
     *
     * @private
     * @returns {Promise<void>} A promise that resolves when the animation completes
     */
    private animateIn;
    /**
     * Animates the radial gradient layer out by gradually reducing its scale to zero.
     *
     * This method creates a smooth transition effect by linearly interpolating the scale
     * from its current value to zero over multiple animation frames. During each frame,
     * the animation progresses by incrementing the internal animation delta value.
     *
     * The map is repainted after each animation step to reflect the updated scale.
     *
     * @private
     * @returns A Promise that resolves when the animation is complete.
     */
    private animateOut;
    onRemove(_map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void;
    private fireEvent;
    prerender(_gl: WebGLRenderingContext | WebGL2RenderingContext, _options: CustomRenderMethodInput): void;
    render(gl: WebGLRenderingContext | WebGL2RenderingContext, options: CustomRenderMethodInput): void;
    /**
     * Sets a new gradient for the radial gradient layer and animates the transition.
     *
     * This method first animates the current gradient out, then updates the gradient
     * property with the new gradient definition, and finally animates the new gradient in.
     *
     * @param {GradientDefinition} gradient - The new gradient definition to set for this layer.
     * @returns {Promise<void>} A promise that resolves when the new gradient is set and animated in.
     */
    setGradient(gradient: GradientDefinition | boolean): Promise<void>;
    setAnimationActive(active: boolean): void;
    show(): void;
    hide(): void;
}
export declare function validateHaloSpecification(halo: RadialGradientLayerConstructorOptions | boolean): Array<string>;
