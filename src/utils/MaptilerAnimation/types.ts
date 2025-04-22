import MaptilerAnimation from "./MaptilerAnimation";

export const enum EasingFunctionName {
  Linear = "Linear",
  QuadraticIn = "QuadraticIn",
  QuadraticOut = "QuadraticOut",
  QuadraticInOut = "QuadraticInOut",
  CubicIn = "CubicIn",
  CubicOut = "CubicOut",
  CubicInOut = "CubicInOut",
  SinusoidalIn = "SinusoidalIn",
  SinusoidalOut = "SinusoidalOut",
  SinusoidalInOut = "SinusoidalInOut",
  ExponentialIn = "ExponentialIn",
  ExponentialOut = "ExponentialOut",
  ExponentialInOut = "ExponentialInOut",
  ElasticIn = "ElasticIn",
  ElasticOut = "ElasticOut",
  ElasticInOut = "ElasticInOut",
  BounceIn = "BounceIn",
  BounceOut = "BounceOut",
  BounceInOut = "BounceInOut",
}

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

export enum AnimationEventTypes {
  Pause = "pause",
  Reset = "reset",
  Play = "play",
  Stop = "stop",
  TimeUpdate = "timeupdate",
  Scrub = "scrub",
  PlaybackRateChange = "playbackratechange",
  AnimationStart = "animationstart",
  AnimationEnd = "animationend",
  Keyframe = "keyframe",
  Iteration = "iteration",
}

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
