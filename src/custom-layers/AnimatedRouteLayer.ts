import { AnimationEvent, AnimationEventListenersRecord, AnimationEventTypes, EasingFunctionName, Keyframe } from "../utils/MaptilerAnimation/types";
import { v4 as uuidv4 } from "uuid";
import MaptilerAnimation, { AnimationOptions } from "../utils/MaptilerAnimation/MaptilerAnimation";

import { GeoJSONSource, CustomLayerInterface, Map } from "@maptiler/sdk";
import { KeyframeableGeoJSONFeature, parseGeoJSONFeatureToKeyframes } from "../utils/MaptilerAnimation/animation-helpers";

type SourceData = {
  id: string;
  featureSetIndex: number;
  layerID: string;
};

type AnimatedStrokeOptions =
  | {
      /** The color of the path that has been progressed */
      activeColor: [number, number, number, number];
      /** The base color of the path */
      inactiveColor: [number, number, number, number];
    }
  | false;

type AnimatedCameraOptions =
  | {
      /** Whether the camera should follow the animation */
      follow?: boolean;
      /** Whether the camera path should be smoothed */
      pathSmoothing?:
        | {
            /** the resolution of the smoothing, higher resolution means more fidelity to the path */
            resolution: number;
            /** How mich to simplify the path beforehand */
            epsilon: number;
          }
        | false;
    }
  | false;

type AnimatedRouteLayerOptions = {
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
} & (
  | {
      /** The keyframes for the the animation OR */
      keyframes: Keyframe[];
      source?: never;
    }
  | {
      /** The source data  */
      source: SourceData;
      keyframes?: never;
    }
);

type FrameCallback = (event: AnimationEvent) => void;

const ANIM_LAYER_PREFIX = "animated-route-layer";

/**
 * This layer allows you to create animated paths on a map by providing keyframes or a GeoJSON source
 * with route data. The animation can control both the visual appearance of the path (using color transitions)
 * and optionally animate the camera to follow along the route path.
 *
 * @implements {CustomLayerInterface}
 *
 * @example
 * ```typescript
 * // Create an animated route layer using a GeoJSON source
 * const animatedRoute = new AnimatedRouteLayer({
 *   source: {
 *     id: 'route-source',
 *     layerID: 'route-layer',
 *     featureSetIndex: 0
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
 *     featureSetIndex: 0
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
 * animatedRoute.addEventListener(AnimationEventTypes.Finish, () => {
 *   console.log('Animation completed');
 * });
 * ```
 *
 * @implements {CustomLayerInterface}
 */
export class AnimatedRouteLayer implements CustomLayerInterface {
  /** Unique ID for the layer */
  readonly id = `${ANIM_LAYER_PREFIX}-${uuidv4()}`;

  readonly type = "custom";

  /** The MaptilerAnimation instance that handles the animation */
  animationInstance!: MaptilerAnimation;

  /**
   * Keyframes for the animation
   * If keyframes are provided, they will be used for the animation
   * If a source is provided, the keyframes will be parsed from the GeoJSON feature
   */
  private keyframes: Keyframe[] | null = null;

  /**
   * Source data for the animation
   * If a source is provided, it will be used to get the keyframes
   * If keyframes are provided, this will be ignored
   */
  private source: SourceData | null = null;

  /** The duration of the animation in ms */
  private duration!: number;

  /** The number of interations */
  private iterations!: number;

  /** The delay before the animation starts in ms */
  private delay!: number;

  /** The default easing function for the animation */
  private easing?: EasingFunctionName;

  /** The map instance */
  private map!: Map;

  /** The camera animation options */
  private cameraAnimationOptions?: AnimatedCameraOptions;

  /**
   * The path stroke animation options
   * This controls the color of the path during the animation
   */
  private pathStrokeAnimation?: AnimatedStrokeOptions;

  /** Whether the animation will autoplay */
  private autoplay: boolean = false;

  /** Whether the animation will be managed manually */
  private manualUpdate: boolean = false;

  private enquedEventHandlers: AnimationEventListenersRecord = Object.values(AnimationEventTypes).reduce((acc, type) => {
    acc[type] = [];
    return acc;
  }, {} as AnimationEventListenersRecord);

  private enquedCommands: (() => void)[] = [];

  constructor({
    keyframes,
    source,
    duration,
    iterations,
    easing,
    delay,
    cameraAnimation = {},
    pathStrokeAnimation = {
      activeColor: [255, 0, 0, 1],
      inactiveColor: [0, 0, 255, 1],
    } as AnimatedStrokeOptions,
    autoplay,
    manualUpdate = false,
  }: AnimatedRouteLayerOptions) {
    this.keyframes = keyframes ?? null;

    this.source = source ?? null;

    if (duration) {
      this.duration = duration;
    }

    if (iterations) {
      this.iterations = iterations;
    }

    if (delay) {
      this.delay = delay;
    }

    this.easing = easing;

    this.cameraAnimationOptions = cameraAnimation
      ? {
          ...{
            pathSmoothing: {
              resolution: 20,
              epsilon: 5,
            },
            follow: true,
          },
          ...(cameraAnimation && cameraAnimation),
        }
      : false;

    if (pathStrokeAnimation) {
      this.pathStrokeAnimation = pathStrokeAnimation;
    }

    this.autoplay = autoplay ?? false;

    this.manualUpdate = manualUpdate;

    this.update = this.update.bind(this);
  }

  /**
   * This method is called when the layer is added to the map.
   * It initializes the animation instance and sets up event listeners.
   *
   * @param {Map} map - The map instance
   */
  async onAdd(map: Map): Promise<void> {
    this.map = map;
    if (this.map.getLayersOrder().some((current) => current.includes(ANIM_LAYER_PREFIX) && this.id !== current)) {
      throw new Error(`[AnimatedRouteLayer.onAdd]: Currently, you can only have one active AnimatedRouteLayer at a time. Please remove the existing one before adding a new one.`);
    }

    const animationOptions = await this.getAnimationOptions();

    this.animationInstance = new MaptilerAnimation({ ...animationOptions, manualMode: this.manualUpdate });

    this.animationInstance.addEventListener(AnimationEventTypes.TimeUpdate, this.update);

    Object.entries(this.enquedEventHandlers).forEach(([type, handlers]) => {
      const animationEventKey = type as AnimationEventTypes;

      handlers.forEach((handler) => {
        this.animationInstance.addEventListener(animationEventKey, handler);
      });

      this.enquedEventHandlers[animationEventKey] = [];
    });

    this.enquedCommands.forEach((command) => {
      command();
    });

    this.enquedCommands = [];
    if (this.autoplay) this.animationInstance.play();
  }

  /**
   * This method is used to manually advance the animation
   *
   * @returns {AnimatedRouteLayer} - The current instance of AnimatedRouteLayer
   */
  frameAdvance() {
    if (this.animationInstance && this.manualUpdate) {
      this.animationInstance.update(true);
    }
    return this;
  }

  /**
   * Adds an event listener to the animation instance.
   *
   * @param {AnimationEventTypes} type - The type of event to listen for
   * @param {FrameCallback} callback - The callback function to execute when the event occurs
   */
  addEventListener(type: AnimationEventTypes, callback: FrameCallback): AnimatedRouteLayer {
    if (!this.animationInstance) {
      this.enquedEventHandlers[type].push(callback);
      return this;
    }

    this.animationInstance.addEventListener(type, callback);
    return this;
  }

  /**
   * Removes an event listener from the animation instance.
   *
   * @param {AnimationEventTypes} type - The type of event to remove
   * @param {FrameCallback} callback - The callback function to remove
   */
  removeEventListener(type: AnimationEventTypes, callback: FrameCallback): AnimatedRouteLayer {
    if (!this.animationInstance) {
      return this;
    }
    this.animationInstance.removeEventListener(type, callback);
    return this;
  }

  public updateManual() {
    if (this.animationInstance && this.manualUpdate) {
      this.animationInstance.update(true);
    }
  }

  /**
   * Updates the layer's properties based on the animation event.
   * @private
   * @param {AnimationEvent} event - The animation event
   */
  private update(event: AnimationEvent): void {
    const { props, currentDelta } = event;

    if (this.source && this.pathStrokeAnimation) {
      const { activeColor, inactiveColor } = this.pathStrokeAnimation;

      if (currentDelta >= 1) {
        // when the animation is finished, set the color to the active color
        this.map.setPaintProperty(this.source.layerID, "line-gradient", ["interpolate", ["linear"], ["line-progress"], 0, ["rgba", ...activeColor], 1, ["rgba", ...activeColor]]);
      } else {
        this.map.setPaintProperty(this.source.layerID, "line-gradient", [
          "interpolate",
          ["linear"],
          ["line-progress"], // Progress along the line
          0,
          ["rgba", ...activeColor], // color at the start
          0.01 + currentDelta,
          ["rgba", ...activeColor], // color at the start
          0.011 + currentDelta,
          ["rgba", ...inactiveColor], // color at the transition
          1,
          ["rgba", ...inactiveColor], // color at the end
        ]);
      }
    }

    if (props && this.cameraAnimationOptions && this.cameraAnimationOptions.follow) {
      const { lng, lat, bearing, zoom, pitch } = props;

      this.map.jumpTo({
        center: [lng, lat],
        pitch: pitch ?? this.map.getPitch(),
        zoom: zoom ?? this.map.getZoom(),
        bearing: bearing ?? this.map.getBearing(),
      });
    }
  }

  /**
   * Plays the animation.
   *
   * @returns {AnimatedRouteLayer} - The current instance of AnimatedRouteLayer
   */
  play(): AnimatedRouteLayer {
    if (!this.animationInstance) {
      this.enquedCommands.push(() => {
        this.animationInstance.play();
      });
      return this;
    }
    this.animationInstance.play();
    return this;
  }

  /**
   * Stops the animation.
   *
   * @returns {AnimatedRouteLayer} - The current instance of AnimatedRouteLayer
   */
  pause(): AnimatedRouteLayer {
    if (!this.animationInstance) {
      this.enquedCommands.push(() => {
        this.animationInstance.pause();
      });
      return this;
    }
    this.animationInstance.pause();
    return this;
  }

  /**
   * Gets the source GeoJSON data from the map instance, parses it, and returns the animation options.
   *
   * @returns {Promise<AnimationOptions>} - The MaptilerAnimation constructor options
   */
  async getAnimationOptions(): Promise<AnimationOptions & { autoplay: boolean }> {
    const map = this.map;
    if (this.source) {
      const source = map.getSource(this.source.id);

      if (source) {
        // this weird type assertion is here to appease typescript
        const featureCollection = await (source as unknown as GeoJSONSource)?.getData();

        if (!featureCollection || featureCollection.type !== "FeatureCollection" || !featureCollection.features) {
          throw new Error("[AnimatedRouteLayer.onAdd]: No featureCollection found in source data");
        }

        const feature = featureCollection.features[this.source.featureSetIndex];
        if (!feature) {
          throw new Error(`[AnimatedRouteLayer.onAdd]: No feature found at index ${this.source.featureSetIndex}`);
        }

        const keyframeableFeature = feature as KeyframeableGeoJSONFeature;

        if (keyframeableFeature.properties["@duration"]) {
          this.duration = keyframeableFeature.properties["@duration"] ?? 1000;
        }

        if (keyframeableFeature.properties["@iterations"]) {
          this.iterations = keyframeableFeature.properties["@iterations"] ?? 0;
        }

        if (keyframeableFeature.properties["@delay"]) {
          this.delay = keyframeableFeature.properties["@delay"] ?? 0;
        }

        if (keyframeableFeature.properties["@autoplay"]) {
          this.autoplay = keyframeableFeature.properties["@autoplay"] ?? false;
        }

        const keyframes = parseGeoJSONFeatureToKeyframes(keyframeableFeature, {
          pathSmoothing: this.cameraAnimationOptions ? this.cameraAnimationOptions.pathSmoothing : false,
          defaultEasing: this.easing,
        });

        const duration = this.duration;
        const iterations = this.iterations;
        const delay = this.delay;
        const autoplay = this.autoplay;

        return {
          keyframes,
          duration,
          iterations,
          delay,
          autoplay,
        };
      }
    }

    if (this.keyframes) {
      return {
        keyframes: this.keyframes,
        duration: this.duration,
        iterations: this.iterations,
        delay: this.delay,
        autoplay: this.autoplay,
      };
    }

    throw new Error("[AnimatedRouteLayer.onAdd]: No keyframes or source provided");
  }

  /**
   * This method is called when the layer is removed from the map.
   * It destroys the animation instance.
   */
  onRemove(): void {
    this.animationInstance?.destroy();
  }

  /**
   * This method is called to render the layer.
   * It is a no-op for this layer.
   */
  render(): void {
    return;
  }
}
