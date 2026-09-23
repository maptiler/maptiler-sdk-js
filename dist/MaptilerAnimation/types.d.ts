import { default as MaptilerAnimation } from './MaptilerAnimation';
export type EasingFunctionName = "Linear" | "QuadraticIn" | "QuadraticOut" | "QuadraticInOut" | "CubicIn" | "CubicOut" | "CubicInOut" | "SinusoidalIn" | "SinusoidalOut" | "SinusoidalInOut" | "ExponentialIn" | "ExponentialOut" | "ExponentialInOut" | "ElasticIn" | "ElasticOut" | "ElasticInOut" | "BounceIn" | "BounceOut" | "BounceInOut";
export type Keyframe = {
    props: Record<string, number | null>;
    delta: number;
    easing?: EasingFunctionName;
    userData?: Record<string, any>;
};
export type AnimationEventTypes = "pause" | "reset" | "play" | "stop" | "timeupdate" | "scrub" | "playbackratechange" | "animationstart" | "animationend" | "keyframe" | "iteration";
export declare const AnimationEventTypesArray: AnimationEventTypes[];
export type NumericArrayWithNull = (number | null)[];
export type AnimationEvent = {
    type: AnimationEventTypes;
    target: MaptilerAnimation;
    currentTime: number;
    currentDelta: number;
    playbackRate: number;
    keyframe?: Keyframe | null;
    nextKeyframe?: Keyframe | null;
    props: Record<string, number>;
    previousProps: Record<string, number>;
    iteration?: number;
};
export type AnimationEventListenersRecord = Record<AnimationEventTypes, AnimationEventCallback[]>;
export type AnimationEventCallback = (event: AnimationEvent) => void;
export { MaptilerAnimation };
