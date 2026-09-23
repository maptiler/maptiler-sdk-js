import { AnimationEvent, AnimationEventTypes, EasingFunctionName, Keyframe } from '../../MaptilerAnimation/types';
import { MaptilerAnimation, MaptilerAnimationOptions } from '../../MaptilerAnimation';
import { CustomLayerInterface, Map as MapSDK } from '../../';
export type SourceData = {
    id: string;
    layerID: string;
};
/**
 * Options for configuring the animated stroke effect for routes.
 * When an object is provided, it defines colors for active and inactive parts of the route.
 * When `false`, the animated stroke effect is disabled.
 *
 * @typedef {Object|boolean} AnimatedStrokeOptions
 * @property {[number, number, number, number]} activeColor - The color of the path that has been progressed, in RGBA format.
 * @property {[number, number, number, number]} inactiveColor - The base color of the path, in RGBA format.
 */
export type AnimatedStrokeOptions = {
    activeColor: [number, number, number, number];
    inactiveColor: [number, number, number, number];
} | false;
/**
 * Options for configuring the animated camera movement
 * along the route.
 *
 * @typedef {Object|boolean} AnimatedCameraOptions
 * @property {boolean} [follow] - Whether the camera should follow the animation.
 * @property {Object|boolean} [pathSmoothing] - Whether the camera path should be smoothed.
 * @property {number} [pathSmoothing.resolution] - The resolution of the smoothing, higher resolution means more fidelity to the path.
 * @property {number} [pathSmoothing.epsilon] - How much to simplify the path beforehand.
 * @property {false} [pathSmoothing] - Whether the camera path should be smoothed.
 */
export type AnimatedCameraOptions = {
    /** Whether the camera should follow the animation */
    follow?: boolean;
    /** Whether the camera path should be smoothed */
    pathSmoothing?: {
        /** the resolution of the smoothing, higher resolution means more fidelity to the path */
        resolution: number;
        /** How mich to simplify the path beforehand */
        epsilon: number;
    } | false;
} | false;
/**
 * Configuration options for the AnimatedRouteLayer.
 * This type supports either providing keyframes directly OR source data for the animation.
 *
 * @typedef AnimatedRouteLayerOptions
 * @property {number} [duration] - The duration of the animation in milliseconds
 * @property {number} [iterations] - The number of animation iterations to perform
 * @property {number} [delay] - The delay in milliseconds before starting the animation
 * @property {EasingFunctionName} [easing] - The default easing function to use if not provided in the GeoJSON
 * @property {AnimatedCameraOptions} [cameraAnimation] - Options for camera animation
 * @property {AnimatedStrokeOptions} [pathStrokeAnimation] - Options for stroke animation, only applicable for LineString geometries
 * @property {boolean} [autoplay] - Whether the animation should start playing automatically
 * @property {boolean} [manualUpdate] - Whether the animation should update automatically or require manual frameAdvance calls
 * @property {Keyframe[]} [keyframes] - The keyframes for the animation (mutually exclusive with source)
 * @property {SourceData} [source] - The source data for the animation (mutually exclusive with keyframes)
 */
export type AnimatedRouteLayerOptions = {
    /** The Duration in ms */
    duration?: number;
    /** The number of iterations */
    iterations?: number;
    /** The delay in ms before playing */
    delay?: number;
    /** The default easing to use if not provided in teh GeoJSON */
    easing?: EasingFunctionName;
    /** The camera animation options */
    cameraAnimation?: AnimatedCameraOptions;
    /** The stroke animation options, only viable for LineString geometries */
    pathStrokeAnimation?: AnimatedStrokeOptions;
    /** Whether the animation should autoplay */
    autoplay?: boolean;
    /** Whether the animation should auto matically animated or whether the frameAdvance method should be called */
    manualUpdate?: boolean;
} & ({
    /** The keyframes for the the animation OR */
    keyframes: Keyframe[];
    source?: never;
} | {
    /** The source data  */
    source: SourceData;
    keyframes?: never;
});
/**
 * A callback function that gets executed for each animation frame. This is simply a utility type.
 * @param {AnimationEvent} event - The animation event data provided during animation frame updates.
 */
export type FrameCallback = (event: AnimationEvent) => void;
export declare const ANIM_LAYER_PREFIX = "animated-route-layer";
/**
 * This layer allows you to create animated paths on a map by providing keyframes or a GeoJSON source
 * with route data. The animation can control both the visual appearance of the path (using color transitions)
 * and optionally animate the camera to follow along the route path.
 * @class AnimatedRouteLayer
 *
 * @example
 * ```typescript
 * // Create an animated route layer using a GeoJSON source
 * const animatedRoute = new AnimatedRouteLayer({
 *   source: {
 *     id: 'route-source',
 *     layerID: 'route-layer',
 *   },
 *   duration: 5000,
 *   pathStrokeAnimation: {
 *     activeColor: [0, 255, 0, 1],
 *     inactiveColor: [100, 100, 100, 0.5]
 *   },
 *   autoplay: true
 * });
 *
 * // Add the layer to the map
 * map.addLayer(animatedRoute);
 *
 * // Control playback
 * animatedRoute.play();
 * animatedRoute.pause();
 * ```
 *
 * @remarks
 * The animation can be configured using either explicit keyframes or a GeoJSON source.
 * When using a GeoJSON source, the feature can include special properties that control
 * animation behavior:
 * - `@duration`: Animation duration in milliseconds
 * - `@iterations`: Number of times to repeat the animation
 * - `@delay`: Delay before starting animation in milliseconds
 * - `@autoplay`: Whether to start the animation automatically
 *
 * Only one AnimatedRouteLayer can be active at a time on a map.
 */
/**
 * Creates an animated route layer for MapTiler maps.
 *
 * The `AnimatedRouteLayer` allows you to animate paths on a map with visual effects and optional camera following.
 * You can define animations either through explicit keyframes or by referencing GeoJSON data with animation metadata.
 *
 * Features:
 * - Animate route paths with color transitions (active/inactive segments)
 * - Optional camera following along the route
 * - Control animation playback (play, pause)
 * - Configure animation properties (duration, iterations, delay, easing)
 * - Support for manual or automatic animation updates
 * - Event system for animation state changes
 *
 * @example
 * ```typescript
 * // Create an animated route from GeoJSON source
 * const animatedRoute = new AnimatedRouteLayer({
 *   source: {
 *     id: 'route-source',
 *     layerID: 'route-layer',
 *   },
 *   duration: 5000,
 *   iterations: 1,
 *   autoplay: true,
 *   cameraAnimation: {
 *     follow: true,
 *     pathSmoothing: { resolution: 20, epsilon: 5 }
 *   },
 *   pathStrokeAnimation: {
 *     activeColor: [255, 0, 0, 1],
 *     inactiveColor: [0, 0, 255, 1]
 *   }
 * });
 *
 * // Add the layer to the map
 * map.addLayer(animatedRoute);
 *
 * // Control playback
 * animatedRoute.pause();
 * animatedRoute.play();
 *
 * // Listen for animation events
 * animatedRoute.addEventListener("animationend", () => {
 *   console.log('Animation completed');
 * });
 * ```
 *
 * @implements {CustomLayerInterface}
 */
export declare class AnimatedRouteLayer implements CustomLayerInterface {
    /** Unique ID for the layer */
    readonly id: string;
    readonly type = "custom";
    /** The MaptilerAnimation instance that handles the animation */
    animationInstance: MaptilerAnimation | null;
    /**
     * Keyframes for the animation
     * If keyframes are provided, they will be used for the animation
     * If a source is provided, the keyframes will be parsed from the GeoJSON feature
     */
    private keyframes;
    /**
     * Source data for the animation
     * If a source is provided, it will be used to get the keyframes
     * If keyframes are provided, this will be ignored
     */
    private source;
    /** The duration of the animation in ms */
    private duration;
    /** The number of interations */
    private iterations;
    /** The delay before the animation starts in ms */
    private delay;
    /** The default easing function for the animation */
    private easing?;
    /** The map instance */
    private map;
    /** The camera animation options */
    private cameraMaptilerAnimationOptions?;
    /**
     * The path stroke animation options
     * This controls the color of the path during the animation
     */
    private pathStrokeAnimation?;
    /** Whether the animation will autoplay */
    private autoplay;
    /** Whether the animation will be managed manually */
    private manualUpdate;
    private enquedEventHandlers;
    private enquedCommands;
    constructor({ keyframes, source, duration, iterations, easing, delay, cameraAnimation, pathStrokeAnimation, autoplay, manualUpdate, }: AnimatedRouteLayerOptions);
    /**
     * This method is called when the layer is added to the map.
     * It initializes the animation instance and sets up event listeners.
     *
     * @param {MapLibreMap} map - The map instance (maplibre Map, but will be MapSDK at runtime)
     * @param {WebGLRenderingContext | WebGL2RenderingContext} _gl - The WebGL context (unused in this layer)
     */
    onAdd(map: MapSDK): Promise<void>;
    /**
     * Initializes the animation instance asynchronously.
     * This is called from onAdd but runs asynchronously to handle async data loading.
     */
    /**
     * This method is used to manually advance the animation
     *
     * @returns {AnimatedRouteLayer} - The current instance of AnimatedRouteLayer
     */
    frameAdvance(): this;
    /**
     * Adds an event listener to the animation instance.
     *
     * @param {AnimationEventTypes} type - The type of event to listen for
     * @param {FrameCallback} callback - The callback function to execute when the event occurs
     */
    addEventListener(type: AnimationEventTypes, callback: FrameCallback): AnimatedRouteLayer;
    /**
     * Removes an event listener from the animation instance.
     *
     * @param {AnimationEventTypes} type - The type of event to remove
     * @param {FrameCallback} callback - The callback function to remove
     */
    removeEventListener(type: AnimationEventTypes, callback: FrameCallback): AnimatedRouteLayer;
    updateManual(): void;
    /**
     * Updates the layer's properties based on the animation event.
     * @private
     * @param {AnimationEvent} event - The animation event
     */
    private update;
    /**
     * Plays the animation.
     *
     * @returns {AnimatedRouteLayer} - The current instance of AnimatedRouteLayer
     */
    play(): AnimatedRouteLayer;
    /**
     * Stops the animation.
     *
     * @returns {AnimatedRouteLayer} - The current instance of AnimatedRouteLayer
     */
    pause(): AnimatedRouteLayer;
    /**
     * Gets the source GeoJSON data from the map instance, parses it, and returns the animation options.
     *
     * @returns {Promise<MaptilerAnimationOptions>} - The MaptilerAnimation constructor options
     */
    getMaptilerAnimationOptions(): Promise<MaptilerAnimationOptions & {
        autoplay: boolean;
    }>;
    /**
     * This method is called when the layer is removed from the map.
     * It destroys the animation instance.
     */
    onRemove(): void;
    /**
     * This method is called to render the layer.
     * It is a no-op for this layer.
     */
    render(): void;
}
