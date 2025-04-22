import MTAnimation from "./MaptilerAnimation";

// at present we only have one easing type
// but in future we will add more
export enum EasingFunctionName {
  Linear = "linear",
  QuadraticIn = "Quadratic.In",
  QuadraticOut = "Quadratic.Out",
  QuadraticInOut = "Quadratic.InOut",
  CubicIn = "Cubic.In",
  CubicOut = "Cubic.Out",
  CubicInOut = "Cubic.InOut",
  SinusoidalIn = "Sinusoidal.In",
  SinusoidalOut = "Sinusoidal.Out",
  SinusoidalInOut = "Sinusoidal.InOut",
  ExponentialIn = "Exponential.In",
  ExponentialOut = "Exponential.Out",
  ExponentialInOut = "Exponential.InOut",
  ElasticIn = "Elastic.In",
  ElasticOut = "Elastic.Out",
  ElasticInOut = "Elastic.InOut",
  BounceIn = "Bounce.In",
  BounceOut = "Bounce.Out",
  BounceInOut = "Bounce.InOut",
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
  target: MTAnimation;
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

export { MTAnimation };
