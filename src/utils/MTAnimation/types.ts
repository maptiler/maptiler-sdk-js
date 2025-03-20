import MTAnimation from "./MTAnimation";

export enum EasingFunction {
  Linear = "linear",
}

/**
 * Interface for animation control with keyframe support.
 *
 * This interface provides methods to control animation playback,
 * query and manipulate animation state, and manage animation events.
 */
export interface IMTAnimation {
  /** Indicates whether the animation is currently playing */
  readonly isPlaying: boolean;

  /**
   * Starts or resumes the animation
   * @returns This animation instance for method chaining
   */
  play(): IMTAnimation;

  /**
   * Pauses the animation
   * @returns This animation instance for method chaining
   */
  pause(): IMTAnimation;

  /**
   * Stops the animation and resets to initial state
   * @returns This animation instance for method chaining
   */
  stop(): IMTAnimation;

  /**
   * Resets the animation to its initial state without stopping
   * @returns This animation instance for method chaining
   */
  reset(): IMTAnimation;

  /**
   * Updates the animation state
   * @returns This animation instance for method chaining
   */
  update(): IMTAnimation;

  /**
   * Gets the current and next keyframes at a specific time
   * @param time - The time position to query
   * @returns Object containing current and next keyframes, which may be null
   */
  getCurrentAndNextKeyFramesAtTime(time: number): {
    current: Keyframe | null;
    next: Keyframe | null;
  };

  /**
   * Gets the current and next keyframes at a specific delta value
   * @param delta - The delta value to query
   * @returns Object containing current and next keyframes, which may be null
   */
  getCurrentAndNextKeyFramesAtDelta(delta: number): {
    current: Keyframe | null;
    next: Keyframe | null;
  };

  /**
   * Gets the current time position of the animation
   * @returns The current time in milliseconds
   */
  getCurrentTime(): number;

  /**
   * Sets the current time position of the animation
   * @param time - The time to set in milliseconds
   * @returns This animation instance for method chaining
   */
  setCurrentTime(time: number): IMTAnimation;

  /**
   * Gets the current delta value of the animation
   * @returns The current delta value (normalized progress between 0 and 1)
   */
  getCurrentDelta(): number;

  /**
   * Sets the current delta value of the animation
   * @param delta - The delta value to set (normalized progress between 0 and 1)
   * @returns This animation instance for method chaining
   */
  setCurrentDelta(delta: number): IMTAnimation;

  /**
   * Sets the playback rate of the animation
   * @param rate - The playback rate (1.0 is normal speed)
   * @returns This animation instance for method chaining
   */
  setPlaybackRate(rate: number): IMTAnimation;

  /**
   * Gets the current playback rate
   * @returns The current playback rate
   */
  getPlaybackRate(): number;

  /**
   * Adds an event listener for animation events
   * @param type - The type of event to listen for
   * @param callback - The callback function to execute when the event occurs
   * @returns This animation instance for method chaining
   */
  addEventListener(
    type: AnimationEventTypes,
    callback: AnimationEventCallback,
  ): IMTAnimation;

  /**
   * Removes an event listener
   * @param type - The type of event to remove
   * @param callback - The callback function to remove
   * @returns This animation instance for method chaining
   */
  removeEventListener(
    type: AnimationEventTypes,
    callback: AnimationEventCallback,
  ): IMTAnimation;

  /**
   * Creates a clone of this animation
   * @returns A new animation instance with the same properties as this one
   */
  clone(): IMTAnimation;
}

// https://www.npmjs.com/search?page=0&q=easing%20functions&sortBy=score

export type Keyframe = {
  // the properties to interpolate between
  props: Record<string, number | null>;

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
  Stop = "stop",
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
  target: MTAnimation;
  currentTime: number;
  currentDelta: number;
  playbackRate: number;
  keyframe?: Keyframe | null;
  props?: Record<string, number>;
  iteration?: number;
};

export type AnimationEventListenersRecord = Record<
  AnimationEventTypes,
  AnimationEventCallback[]
>;

export type AnimationEventCallback = (event: AnimationEvent) => void;
