import type MaptilerAnimation from "./MaptilerAnimation";

export type EasingFunctionName =
  | "Linear"
  | "QuadraticIn"
  | "QuadraticOut"
  | "QuadraticInOut"
  | "CubicIn"
  | "CubicOut"
  | "CubicInOut"
  | "SinusoidalIn"
  | "SinusoidalOut"
  | "SinusoidalInOut"
  | "ExponentialIn"
  | "ExponentialOut"
  | "ExponentialInOut"
  | "ElasticIn"
  | "ElasticOut"
  | "ElasticInOut"
  | "BounceIn"
  | "BounceOut"
  | "BounceInOut";

export type Keyframe = {
  // the properties to interpolate between
  props: Record<string, number | null>;

  // when in the animation to apply the keyframe
  // 0 start of the animation, 1 end of the animation
  delta: number;

  // the easing function to use between this keyframe and the next
  easing?: EasingFunctionName;

  // custom data to pass to the keyframe
  userData?: Record<string, any>;
};

export type AnimationEventTypes =
  | "pause"
  | "reset"
  | "play"
  | "stop"
  | "timeupdate"
  | "scrub"
  | "playbackratechange"
  | "animationstart"
  | "animationend"
  | "keyframe"
  | "iteration";

export const AnimationEventTypesArray: AnimationEventTypes[] = [
  "pause",
  "reset",
  "play",
  "stop",
  "timeupdate",
  "scrub",
  "playbackratechange",
  "animationstart",
  "animationend",
  "keyframe",
  "iteration",
];

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
