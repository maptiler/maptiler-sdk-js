enum EasingFunction {
  LINEAR = "linear",
}

// https://www.npmjs.com/search?page=0&q=easing%20functions&sortBy=score

export type Keyframe = {
  // the properties to interpolate between
  props: Record<string, number>;

  // when in the animation to apply the keyframe
  // 0 start of the animation, 1 end of the animation
  delta: number;

  // the easing function to use between this keyframe and the next
  easing: EasingFunction;

  // a unique id for the keyframe
  id: string;
};

export enum AnimationEventTypes {
  Pause = "pause",
  Reset = "reset",
  Play = "play",
  TimeUpdate = "timeupdate",
  Scrub = "scrub",
  PlaybackRateChange = "playbackratechange",
  AnimationStart = "animationstart",
  AnimationEnd = "animationend",
  Keyframe = "keyframe",
  Iteration = "iteration",
}

export type AnimationEvent = {
  type: AnimationEventTypes;
  target: Animation;
  currentTime: number;
  currentDelta: number;
  keyframe?: Keyframe;
};

export type AnimationEventListenersRecord = Record<
  AnimationEventTypes,
  AnimationEventCallback[]
>;

export type AnimationEventCallback = (event: AnimationEvent) => void;

export default class Animation {
  iterations: number;

  // an array of keyframes animations to interpolate between
  private keyframes: Keyframe[];

  // the duration of the animation in milliseconds
  private duration: number;

  // the rate at which the animation is playing
  private playbackRate: number;

  // the current time in milliseconds
  private currentTime: number;

  // 0 start of the animation, 1 end of the animation
  private currentDelta: number;

  private listeners: AnimationEventListenersRecord = Object.values(
    AnimationEventTypes,
  ).reduce((acc, type) => {
    acc[type] = [];
    return acc;
  }, {} as AnimationEventListenersRecord);

  constructor(keyframes: Keyframe[], durationMS: number, iterations: number) {
    this.keyframes = keyframes;
    this.duration = durationMS;
    this.iterations = iterations;
    this.playbackRate = 1;
    this.currentTime = 0;
    this.currentDelta = 0;
  }

  getCurrentTime() {
    return this.currentTime;
  }

  getCurrentDelta() {
    return this.currentDelta;
  }

  setCurrentTime(time: number) {
    this.currentTime = time;
  }

  setCurrentDelta(delta: number) {
    this.currentDelta = delta;
    this.currentTime = delta * this.duration;
  }

  setPlaybackRate(rate: number) {
    this.playbackRate = rate;
  }

  setDuration(durationMS: number) {
    this.duration = durationMS;
  }

  addEventListener(
    type: AnimationEventTypes,
    callback: AnimationEventCallback,
  ) {
    // "value is always falsy" - TS
    // this is to catch any dynamically set events
    if (!(type in this.listeners)) {
      console.warn(`Event type ${type} does not exist, ignoring`);
      return;
    }

    this.listeners[type].push(callback);
  }

  removeEventListener(
    type: AnimationEventTypes,
    callback: AnimationEventCallback,
  ) {
    // "value is always falsy" - TS
    // this is to catch any dynamically set events
    if (!(type in this.listeners)) {
      console.warn(`Event type ${type} does not exist, ignoring`);
      return;
    }

    this.listeners[type] = this.listeners[type].filter((fn) => fn !== callback);
  }

  play() {}

  pause() {}

  reset() {}

  private update() {
    // find the keyframes that are before and after the current time
    // interpolate between them
  }

  clone() {
    return new Animation(this.keyframes, this.duration, this.iterations);
  }
}
