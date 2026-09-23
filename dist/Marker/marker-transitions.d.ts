import { LngLat } from '../index';
import { MaptilerAnimation } from '../MaptilerAnimation';
import { MarkerTransitionSpec, Vector2 } from './types';
import { LifecycleAnimationValue } from './marker-animation-presets';
/** Bridges a transitionable property's real value to/from the flat numeric props {@link MaptilerAnimation} interpolates between. */
export type TransitionValueCodec<T> = {
    toNumeric(value: T): Record<string, number>;
    fromNumeric(props: Record<string, number>): T;
};
export declare const scaleTransitionCodec: TransitionValueCodec<Vector2>;
export declare const rotationTransitionCodec: TransitionValueCodec<number>;
export declare const opacityTransitionCodec: TransitionValueCodec<number>;
/** Bridges an `enter`/`exit` preset's combined opacity/scale/lift state to the numeric props {@link MaptilerAnimation} interpolates between. */
export declare const lifecycleTransitionCodec: TransitionValueCodec<LifecycleAnimationValue>;
export declare const positionTransitionCodec: TransitionValueCodec<LngLat>;
export declare const colorTransitionCodec: TransitionValueCodec<string | undefined>;
export type PropertyTransitionHandlers<T> = {
    codec: TransitionValueCodec<T>;
    onUpdate: (value: T) => void;
    onStart: () => void;
    onEnd: (value: T) => void;
};
/**
 * Eases `from` to `to` over `spec`'s duration/easing/delay via a one-shot
 * {@link MaptilerAnimation}, calling `onUpdate` every frame and `onEnd` once
 * with the exact target value. The returned animation is already playing;
 * callers own its lifetime — `.destroy()` it to cancel.
 */
export declare function runPropertyTransition<T>(from: T, to: T, spec: MarkerTransitionSpec, handlers: PropertyTransitionHandlers<T>): MaptilerAnimation;
