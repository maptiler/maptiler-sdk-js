import { EasingFunctionName } from '../MaptilerAnimation/types';
import { EnterAnimationPreset, ExitAnimationPreset, IdleAnimationPreset, Vector2 } from './types';
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
export declare const LIFECYCLE_LIFT_PX = 48;
/** Default easing per `enter` preset, used when `MarkerAnimationOptions.easing` doesn't override it. */
export declare const ENTER_PRESET_EASING: Record<EnterAnimationPreset, EasingFunctionName>;
/**
 * The "hidden" end of `preset`'s `enter` animation — the value a marker
 * eases from. `baseOpacity`/`baseScale` are the marker's own configured
 * values, i.e. the "shown" end shared by every preset.
 */
export declare function enterPresetHiddenValue(preset: EnterAnimationPreset, baseOpacity: number, baseScale: Vector2): LifecycleAnimationValue;
/** Default easing per `exit` preset, used when `MarkerAnimationOptions.easing` doesn't override it. */
export declare const EXIT_PRESET_EASING: Record<ExitAnimationPreset, EasingFunctionName>;
/**
 * The "hidden" end of `preset`'s `exit` animation — the value a marker
 * eases to. `baseOpacity`/`baseScale` are the marker's own configured
 * values, i.e. the "shown" end shared by every preset.
 */
export declare function exitPresetHiddenValue(preset: ExitAnimationPreset, baseOpacity: number, baseScale: Vector2): LifecycleAnimationValue;
/**
 * Scales a preset's `hidden` value by `magnitude` — `1` (the default) is the
 * full designed motion (`hidden` as-is), `0` is no motion at all (`shown`),
 * values beyond `1` extrapolate past `hidden`.
 */
export declare function scaleLifecycleMagnitude(shown: LifecycleAnimationValue, hidden: LifecycleAnimationValue, magnitude: number): LifecycleAnimationValue;
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
export declare function scaleIdleMagnitude(channel: IdleAnimationChannel, value: number, magnitude: number): number;
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
export declare const IDLE_PRESET_CONFIG: Record<IdleAnimationPreset, IdlePresetConfig>;
/**
 * Default loop duration (ms) per idle preset, used when
 * `MarkerIdleAnimationOptions.duration` is omitted — overrides the generic
 * `1000` documented on {@link MarkerAnimationOptions}. `pulsescale`/
 * `pulseopacity` default to ~1Hz; `ring`/`bounce` recur every few seconds.
 */
export declare const IDLE_PRESET_DEFAULT_DURATION: Record<IdleAnimationPreset, number>;
