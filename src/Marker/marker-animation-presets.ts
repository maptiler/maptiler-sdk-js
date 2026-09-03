import type { EasingFunctionName } from "../MaptilerAnimation/types";
import type { EnterAnimationPreset, ExitAnimationPreset, IdleAnimationPreset, Vector2 } from "./types";

//#region Enter / Exit

/**
 * An `enter`/`exit` preset's animated state at one end of its motion:
 * opacity, 2-D scale, and a vertical `lift` offset in CSS px (used by
 * `enter`'s `drop`/`bounce`; `0` elsewhere).
 */
export type LifecycleAnimationValue = {
  opacity: number;
  scale: Vector2;
  lift: number;
};

/** Vertical offset (CSS px) `enter`'s `drop`/`bounce` start from on `enter`. */
export const LIFECYCLE_LIFT_PX = 48;

/** Default easing per `enter` preset, used when `MarkerAnimationOptions.easing` doesn't override it. */
export const ENTER_PRESET_EASING: Record<EnterAnimationPreset, EasingFunctionName> = {
  fade: "Linear",
  grow: "CubicOut",
  pop: "ElasticOut",
  drop: "CubicOut",
  bounce: "BounceOut",
};

/**
 * The "hidden" end of `preset`'s `enter` animation — the value a marker
 * eases from. `baseOpacity`/`baseScale` are the marker's own configured
 * values, i.e. the "shown" end shared by every preset.
 */
export function enterPresetHiddenValue(preset: EnterAnimationPreset, baseOpacity: number, baseScale: Vector2): LifecycleAnimationValue {
  switch (preset) {
    case "fade":
      return { opacity: 0, scale: baseScale, lift: 0 };
    case "grow":
    case "pop":
      return { opacity: 0, scale: [0, 0], lift: 0 };
    case "drop":
      return { opacity: 0, scale: baseScale, lift: -LIFECYCLE_LIFT_PX };
    case "bounce":
      return { opacity: baseOpacity, scale: baseScale, lift: -LIFECYCLE_LIFT_PX };
  }
}

/** Default easing per `exit` preset, used when `MarkerAnimationOptions.easing` doesn't override it. */
export const EXIT_PRESET_EASING: Record<ExitAnimationPreset, EasingFunctionName> = {
  fade: "Linear",
  shrink: "CubicIn",
  pop: "ElasticIn",
  explode: "CubicOut",
};

/** Scale multiplier `explode` grows the marker to (from its own base scale) while it fades out. */
const EXPLODE_SCALE_MULTIPLIER = 2;

/**
 * The "hidden" end of `preset`'s `exit` animation — the value a marker
 * eases to. `baseOpacity`/`baseScale` are the marker's own configured
 * values, i.e. the "shown" end shared by every preset.
 */
export function exitPresetHiddenValue(preset: ExitAnimationPreset, baseOpacity: number, baseScale: Vector2): LifecycleAnimationValue {
  switch (preset) {
    case "fade":
      return { opacity: 0, scale: baseScale, lift: 0 };
    case "shrink":
      return { opacity: baseOpacity, scale: [0, 0], lift: 0 };
    case "pop":
      return { opacity: 0, scale: [0, 0], lift: 0 };
    case "explode":
      return { opacity: 0, scale: [baseScale[0] * EXPLODE_SCALE_MULTIPLIER, baseScale[1] * EXPLODE_SCALE_MULTIPLIER], lift: 0 };
  }
}

/**
 * Scales a preset's `hidden` value by `magnitude` — `1` (the default) is the
 * full designed motion (`hidden` as-is), `0` is no motion at all (`shown`),
 * values beyond `1` extrapolate past `hidden`.
 */
export function scaleLifecycleMagnitude(shown: LifecycleAnimationValue, hidden: LifecycleAnimationValue, magnitude: number): LifecycleAnimationValue {
  const lerp = (from: number, to: number) => from + (to - from) * magnitude;
  return {
    opacity: lerp(shown.opacity, hidden.opacity),
    scale: [lerp(shown.scale[0], hidden.scale[0]), lerp(shown.scale[1], hidden.scale[1])],
    lift: lerp(shown.lift, hidden.lift),
  };
}

//#endregion

//#region Idle

/**
 * Which marker channel an idle preset animates. `value` at a keyframe
 * multiplies the marker's base value for `scale`/`opacity` (rest = `1`), or
 * is added to it for `rotation`/`lift` (rest = `0`).
 */
export type IdleAnimationChannel = "scale" | "opacity" | "rotation" | "lift";

/**
 * Scales an idle keyframe's `value` by `magnitude` around its channel's rest
 * value (`1` for `scale`/`opacity`, `0` for `rotation`/`lift`) — `1` (the
 * default) is the full designed motion, `0` is no motion at all (rest).
 */
export function scaleIdleMagnitude(channel: IdleAnimationChannel, value: number, magnitude: number): number {
  const rest = channel === "scale" || channel === "opacity" ? 1 : 0;
  return rest + (value - rest) * magnitude;
}

/** One control point in an idle preset's per-iteration curve. */
export type IdleAnimationKeyframe = {
  /** Position within one loop iteration, `0`–`1`. */
  delta: number;
  /** Channel value at this point — see {@link IdleAnimationChannel}. */
  value: number;
  /** Easing from the previous keyframe to this one. Defaults to `"Linear"`. */
  easing?: EasingFunctionName;
};

export type IdlePresetConfig = {
  channel: IdleAnimationChannel;
  /**
   * Always starts and ends at rest (`delta` `0` and `1`); every preset's
   * animated motion is centered on `delta` `0.5`.
   */
  keyframes: IdleAnimationKeyframe[];
};

const PULSE_SCALE_PEAK = 1.15;
const PULSE_OPACITY_PEAK = 0.45;
const RING_PEAK_DEG = 12;
const IDLE_BOUNCE_LIFT_PX = 14;

//region Idle Animation Presets

export const IDLE_PRESET_CONFIG: Record<IdleAnimationPreset, IdlePresetConfig> = {
  //region pulsescale
  // Rest for the first/last ~35%, a single smooth "breathing" scale pulse in between.
  pulsescale: {
    channel: "scale",
    keyframes: [
      { delta: 0, value: 1 },
      { delta: 0.4, value: 1 },
      { delta: 0.5, value: PULSE_SCALE_PEAK, easing: "SinusoidalInOut" },
      { delta: 0.65, value: 1, easing: "SinusoidalInOut" },
      { delta: 1, value: 1 },
    ],
  },
  //endregion

  //region pulseopacity
  // Same shape as pulsescale, on opacity instead of scale.
  pulseopacity: {
    channel: "opacity",
    keyframes: [
      { delta: 0, value: 1 },
      { delta: 0.5, value: PULSE_OPACITY_PEAK, easing: "SinusoidalInOut" },
      { delta: 1, value: 1, easing: "SinusoidalInOut" },
    ],
  },
  //endregion

  //region ring
  // Rest for the first/last ~40%, several alternating rotation wiggles clustered around the midpoint.
  ring: {
    channel: "rotation",
    keyframes: [
      { delta: 0, value: 0 },
      { delta: 0.4, value: 0 },
      { delta: 0.45, value: -RING_PEAK_DEG, easing: "SinusoidalInOut" },
      { delta: 0.5, value: RING_PEAK_DEG, easing: "SinusoidalInOut" },
      { delta: 0.55, value: -RING_PEAK_DEG * 0.6, easing: "SinusoidalInOut" },
      { delta: 0.6, value: 0, easing: "SinusoidalInOut" },
      { delta: 1, value: 0 },
    ],
  },
  //endregion

  //region bounce
  // Rest to 0.25, rise to the peak by the midpoint, bounce back down to rest by 0.75, rest out the rest.
  bounce: {
    channel: "lift",
    keyframes: [
      { delta: 0, value: 0 },
      { delta: 0.45, value: 0, easing: "SinusoidalOut" },
      { delta: 0.5, value: -IDLE_BOUNCE_LIFT_PX, easing: "BounceOut" },
      { delta: 0.7, value: 0 },
      { delta: 1, value: 0 },
    ],
  },
  //endregion
};

/**
 * Default loop duration (ms) per idle preset, used when
 * `MarkerIdleAnimationOptions.duration` is omitted — overrides the generic
 * `1000` documented on {@link MarkerAnimationOptions}. `pulsescale`/
 * `pulseopacity` default to ~1Hz; `ring`/`bounce` recur every few seconds.
 */
export const IDLE_PRESET_DEFAULT_DURATION: Record<IdleAnimationPreset, number> = {
  pulsescale: 1000,
  pulseopacity: 1000,
  ring: 3000,
  bounce: 3000,
};

//#endregion
