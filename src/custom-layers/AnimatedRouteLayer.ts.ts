import { CustomLayerInterface, Map } from "maplibre-gl";
import { AnimationEvent, AnimationEventTypes, EasingFunctionName, Keyframe } from "../utils/MTAnimation/types";
import { v4 as uuidv4 } from "uuid";
import MTAnimation, { AnimationOptions } from "../utils/MTAnimation/MTAnimation";

import { GeoJSONSource } from "@maptiler/sdk";
import { KeyframeableGeoJSONFeature, parseGeoJSONFeatureToKeyframes } from "../utils/MTAnimation/animation-helpers";

type SourceData = {
  id: string;
  featureSetIndex: number;
  layerID: string;
};

type AnimatedStrokeOptions =
  | {
      activeColor: [number, number, number, number];
      inactiveColor: [number, number, number, number];
    }
  | false;

type AnimatedCameraOptions =
  | {
      follow?: boolean;
      pathSmoothing?:
        | {
            resolution: number;
            epsilon: number;
          }
        | false;
    }
  | false;

type AnimatedRouteLayerOptions = {
  duration?: number;
  iterations?: number;
  delay?: number;
  easing?: EasingFunctionName;
  cameraAnimation?: AnimatedCameraOptions;
  pathStrokeAnimation?: AnimatedStrokeOptions;
  autoplay?: boolean;
  manualUpdate?: boolean;
} & (
  | {
      keyframes: Keyframe[];
      source?: never;
    }
  | {
      source: SourceData;
      keyframes?: never;
    }
);

type FrameCallback = (event: AnimationEvent) => void;

const ANIM_LAYER_PREFIX = "animated-route-layer";

export class AnimatedRouteLayer implements CustomLayerInterface {
  readonly id = `${ANIM_LAYER_PREFIX}-${uuidv4()}`;
  readonly type = "custom";
  private animationInstance!: MTAnimation;

  private keyframes: Keyframe[] | null = null;

  private source: SourceData | null = null;

  private duration!: number;
  private iterations!: number;
  private delay!: number;

  private easing?: EasingFunctionName;
  private map!: Map;

  private cameraAnimationOptions?: AnimatedCameraOptions;

  private pathStrokeAnimation?: AnimatedStrokeOptions;

  private autoplay: boolean = false;

  private manualUpdate: boolean = false;

  constructor({
    keyframes,
    source,
    duration,
    iterations,
    easing,
    delay,
    cameraAnimation,
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
  }

  async onAdd(map: Map): Promise<void> {
    this.map = map;
    if (this.map.getLayersOrder().some((current) => current.includes(ANIM_LAYER_PREFIX) && this.id !== current)) {
      throw new Error(
        `[AnimatedRouteLayer.onAdd]: Currently, you can only have one active AnimatedRouteLayer at a time. Please remove any existing instances before adding a new one.`,
      );
    }

    const animationOptions = await this.getAnimationOptions();

    this.animationInstance = new MTAnimation({ ...animationOptions, manualMode: this.manualUpdate });

    this.animationInstance.addEventListener(AnimationEventTypes.TimeUpdate, this.update.bind(this));

    if (this.autoplay) this.animationInstance.play();
  }

  addEventListener(type: AnimationEventTypes, callback: FrameCallback): void {
    this.animationInstance.addEventListener(type, callback);
  }

  removeEventListener(type: AnimationEventTypes, callback: FrameCallback): void {
    this.animationInstance.removeEventListener(type, callback);
  }

  update(event: AnimationEvent): void {
    const { props, currentDelta } = event;

    if (this.source && this.pathStrokeAnimation) {
      const { activeColor, inactiveColor } = this.pathStrokeAnimation;

      if (currentDelta >= 1) {
        // when the animation is
        this.map.setPaintProperty(this.source.layerID, "line-gradient", [
          "interpolate",
          ["linear"],
          ["line-progress"], // Progress along the line
          0,
          ["rgba", ...activeColor],
          1,
          ["rgba", ...activeColor],
        ]);
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

  play(): AnimatedRouteLayer {
    this.animationInstance.play();
    return this;
  }

  pause(): AnimatedRouteLayer {
    this.animationInstance.pause();
    return this;
  }

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

      if (this.keyframes) {
        return {
          keyframes: this.keyframes,
          duration: this.duration,
          iterations: this.iterations,
          delay: this.delay,
          autoplay: this.autoplay,
        };
      }
    }

    throw new Error("[AnimatedRouteLayer.onAdd]: No keyframes or source provided");
  }

  onRemove(): void {
    this.animationInstance?.destroy();
  }

  render(): void {
    return;
  }
}
