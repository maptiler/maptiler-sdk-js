import { lerp, lerpArrayValues } from "./animation-helpers";
import AnimationManager from "./AnimationManager";
import { AnimationEventCallback, AnimationEventListenersRecord, AnimationEventTypes, EasingFunctionName, Keyframe } from "./types";
import EasingFunctions from "./easing";

/**
 * Configuration options for creating an animation.
 *
 * @interface AnimationOptions
 * @property {Keyframe[]} keyframes - The keyframes that define the animation states at various points in time.
 * @property {number} duration - The total duration of the animation in milliseconds.
 * @property {number} iterations - The number of times the animation should repeat. Use 0 for no repeat, or Infinity for an infinite loop.
 * @property {delay} [delay] - Optional. The delay before the animation starts, in milliseconds. Defaults to 0 if not specified.
 * @property {boolean} [manualMode] - Optional. If true, the animation will not be automatically managed by the animation manager
 *                                   and must be updated manually by calling update(). Defaults to false if not specified.
 */
export interface AnimationOptions {
  // the keyframes to animate between
  keyframes: Keyframe[];
  // the duration of the animation in milliseconds
  duration: number;
  // the number of times to repeat the
  // animation, 0 is no repeat, Infinity is infinite repeat
  iterations: number;
  // if true, the animation will not be added to the
  // animation manager and will need to be updated manually
  // by calling update()
  manualMode?: boolean;

  // the delay before the animation starts in milliseconds
  delay?: number;
}

export type InterpolatedKeyFrame = Keyframe & {
  props: Record<string, number>;
  easing: EasingFunctionName;
  id: string;
};

/**
 * Animation controller for keyframe-based animation sequences.
 *
 * MTAnimation handles interpolation between keyframes, timing control,
 * and event dispatching during animation playback.
 *
 * @example
 * ```typescript
 * const animation = new MTAnimation({
 *   keyframes: [
 *     { delta: 0, props: { x: 0, y: 0 } },
 *     { delta: 0.5, props: { x: 50, y: 20 } },
 *     { delta: 1, props: { x: 100, y: 0 } }
 *   ],
 *   duration: 1000, // milliseconds
 *   iterations: 2
 * });
 *
 * animation.addEventListener(AnimationEventTypes.TimeUpdate, (event) => {
 *   // Use interpolated property values to update something
 *   console.log(event.props);
 * });
 *
 * animation.play();
 * ```
 *
 * @remarks
 * The animation supports various playback controls (play, pause, stop, reset),
 * time manipulation, and an event system for tracking animation progress.
 * Properties missing in keyframes will be automatically interpolated.
 *
 * Animation events include play, pause, stop, timeupdate, iteration, and more.
 *
 * When not using manualMode, animations are automatically added to the AnimationManager.
 */
export default class MTAnimation {
  private playing: boolean = false;

  get isPlaying() {
    return this.playing;
  }

  // the number of times to repeat the animation
  // 0 is no repeat, Infinity is infinite repeat
  private iterations: number;

  private currentIteration: number = 0;

  // an array of keyframes animations to interpolate between
  private keyframes: InterpolatedKeyFrame[];

  private currentKeyframe?: string;

  // the duration of the animation in milliseconds
  readonly duration: number;

  // the duration of the animation affected by the playback rate
  // if playback rate is 2, the effective duration is double
  private effectiveDuration: number;

  // the rate at which the animation is playing
  private playbackRate: number;

  // the current time in milliseconds
  private currentTime: number;

  // 0 start of the animation, 1 end of the animation
  private currentDelta: number;

  private animationStartTime: number = 0;

  private lastFrameAt: number = 0;

  private delay: number = 0;

  private delayTimeoutID?: number | NodeJS.Timeout;

  private listeners: AnimationEventListenersRecord = Object.values(AnimationEventTypes).reduce((acc, type) => {
    acc[type] = [];
    return acc;
  }, {} as AnimationEventListenersRecord);

  private previousProps!: Record<string, number>;

  constructor({ keyframes, duration, iterations, manualMode, delay }: AnimationOptions) {
    // collate all properties that are animated
    const animatedProperties = keyframes
      .map(({ props }: Keyframe) => {
        return Object.keys(props) as string[];
      })
      .flat()
      .reduce<string[]>((props, prop: string) => {
        if (prop && !props.includes(prop)) {
          props.push(prop);
        }
        return props;
      }, []);

    // iterate over keyframes and ensure all properties are present
    // if not, add them with the value in next keyframe that has this property defined

    const keyframesWithAllProps = keyframes
      // order keyframes by delta
      .sort((a, b) => a.delta - b.delta)
      // ensure animated properties are present in all keyframes
      .map((keyframe) => {
        const newProps = animatedProperties.reduce((props: Keyframe["props"], prop: string) => {
          if (prop in props) {
            return props;
          }
          return {
            ...props,
            // set as null to infer that this proprty
            // does not have a value but will need to be
            [prop]: null,
          };
        }, keyframe.props);

        return {
          ...keyframe,
          props: newProps,
        };
      });

    // transform keyframes into a format that is easier to interpolate
    const valuesForAllProps = keyframesWithAllProps
      .map(({ props }) => props)
      .reduce<Record<string, (number | null)[]>>((acc, keyframeProps) => {
        for (const [prop, value] of Object.entries(keyframeProps)) {
          if (!(prop in acc)) {
            acc[prop] = [];
          }

          acc[prop].push(value);
        }

        return acc;
      }, {});

    // interpolate values for each property
    const interpolatedValues = Object.entries(valuesForAllProps).reduce<Record<string, number[]>>((acc, [prop, values]) => {
      acc[prop] = lerpArrayValues(values);
      return acc;
    }, {});

    // update keyframes with interpolated values
    this.keyframes = keyframesWithAllProps.map((keyframe, _) => {
      return {
        ...keyframe,
        props: animatedProperties.reduce<Keyframe["props"]>((props, prop) => {
          props[prop] = interpolatedValues[prop][_];
          return props;
        }, {}),
        easing: keyframe.easing ?? EasingFunctionName.Linear,
        id: crypto.randomUUID(),
      } as InterpolatedKeyFrame;
    });

    this.duration = duration;
    this.iterations = iterations;
    this.delay = delay ?? 0;
    this.playbackRate = 1;
    this.effectiveDuration = duration / this.playbackRate;
    this.currentTime = 0;
    this.currentDelta = 0;

    // if not manually updating, add to the animation manager
    if (!manualMode) {
      AnimationManager.add(this);
    }
  }
  /**
   * Starts or resumes the animation
   * @returns This animation instance for method chaining
   * @emits AnimationEventTypes.Play
   */
  play() {
    if (this.playing) {
      return this;
    }

    if (this.delayTimeoutID) {
      return this;
    }

    this.delayTimeoutID = setTimeout(() => {
      this.playing = true;
      this.animationStartTime = performance.now();
      this.lastFrameAt = this.animationStartTime;
      this.emitEvent(AnimationEventTypes.Play);
      this.delayTimeoutID = undefined;
    }, this.delay / this.playbackRate);

    return this;
  }

  /**
   * Pauses the animation
   * @returns This animation instance for method chaining
   * @emits AnimationEventTypes.Pause
   */
  pause() {
    this.playing = false;
    this.emitEvent(AnimationEventTypes.Pause);
    return this;
  }

  /**
   * Stops the animation and resets to initial state
   * @returns This animation instance for method chaining
   * @emits AnimationEventTypes.Stop
   */
  stop() {
    this.playing = false;
    this.emitEvent(AnimationEventTypes.Stop);
    return this;
  }

  /**
   * Resets the animation to its initial state without stopping
   * @returns This animation instance for method chaining
   * @emits AnimationEventTypes.Reset
   */
  reset(manual: boolean = true) {
    this.playing = false;
    this.currentTime = 0;
    this.currentDelta = this.playbackRate < 0 ? 1 : 0;
    this.emitEvent(AnimationEventTypes.Reset);
    this.update(false, true);

    if (!manual) this.play();

    return this;
  }
  /**
   * Updates the animation state if playing, this is used by the AnimationManager
   * to update all animations in the loop
   * @returns This animation instance for method chaining
   */

  updateInternal() {
    if (!this.playing) {
      return this;
    }
    return this.update(false);
  }

  /**
   * Updates the animation state, interpolating between keyframes
   * and emitting events as necessary
   * @emits AnimationEventTypes.TimeUpdate
   * @emits AnimationEventTypes.Keyframe
   * @emits AnimationEventTypes.Iteration
   * @emits AnimationEventTypes.AnimationEnd
   * @returns This animation instance for method chaining
   */
  update(manual = true, ignoreIteration = false) {
    const currentTime = performance.now();

    const frameLength = manual ? 16 : currentTime - this.lastFrameAt;
    const timeElapsed = currentTime - this.animationStartTime;

    this.lastFrameAt = currentTime;

    const timeDelta = timeElapsed * this.playbackRate;
    this.currentTime = timeDelta;

    this.currentDelta += frameLength / this.effectiveDuration;

    const { next, current } = this.getCurrentAndNextKeyFramesAtDelta(this.currentDelta);

    if (current?.id !== this.currentKeyframe) {
      this.emitEvent(AnimationEventTypes.Keyframe, current, next);
    }

    this.currentKeyframe = current?.id;

    const iterpolatedProps = Object.keys(current?.props ?? {}).reduce<Record<string, number>>((acc, prop) => {
      if (current && next) {
        const currentValue = current.props[prop];
        const nextValue = next.props[prop];

        // get the current step in the interpolation
        // eg 0 = current keyframe, 1 = next keyframe
        const t = (this.currentDelta - current.delta) / (next.delta - current.delta);

        // get the easing function to use
        const easingFunc = EasingFunctions[current.easing];

        // get the alpha value from the easing function
        // this value is the amount to interpolate between
        // the current and next value
        const alpha = easingFunc(t);

        // lerp the value, becuase we are lerping between
        // two values, we can use the alpha value to determine
        // how much of each value to use
        acc[prop] = lerp(currentValue, nextValue, alpha);
      }

      if (current && !next) {
        acc[prop] = current.props[prop];
      }
      return acc;
    }, {});
    if (!this.previousProps) {
      this.previousProps = this.keyframes[0].props;
    }

    this.emitEvent(AnimationEventTypes.TimeUpdate, current, next, iterpolatedProps, this.previousProps);

    if ((this.currentDelta >= 1 || this.currentDelta < 0) && !ignoreIteration) {
      this.currentIteration += 1;
      this.emitEvent(AnimationEventTypes.Iteration, null, null, {});
      if (this.iterations === 0 || this.currentIteration <= this.iterations) {
        this.reset(manual);
        return this;
      }

      this.stop();
      this.emitEvent(AnimationEventTypes.AnimationEnd);
      return this;
    }

    this.previousProps = { ...iterpolatedProps };

    return this;
  }

  /**
   * Gets the current and next keyframes at a specific time
   * @param time - The time position to query
   * @returns Object containing current and next keyframes, which may be null
   */
  getCurrentAndNextKeyFramesAtTime(time: number) {
    return this.getCurrentAndNextKeyFramesAtDelta(time / this.effectiveDuration);
  }

  /**
   * Gets the current and next keyframes at a specific delta value
   * @param delta - The delta value to query
   * @returns Object containing current and next keyframes, which may be null
   */
  getCurrentAndNextKeyFramesAtDelta(delta: number) {
    const next = this.keyframes.find((keyframe) => keyframe.delta > delta) ?? null;
    const current = [...this.keyframes].reverse().find((keyframe) => keyframe.delta <= delta) ?? null;

    return { current, next };
  }

  /**
   * Gets the current time position of the animation
   * @returns The current time in milliseconds
   */
  getCurrentTime() {
    return this.currentTime;
  }

  /**
   * Sets the current time position of the animation
   * @param time - The time to set in milliseconds
   * @returns This animation instance for method chaining
   * @throws Error if time is greater than the duration
   * @emits AnimationEventTypes.Scrub
   */
  setCurrentTime(time: number) {
    if (time > this.effectiveDuration) {
      throw new Error(`Cannot set time greater than duration`);
    }

    this.play();

    this.currentTime = time;
    this.currentDelta = time / this.effectiveDuration;
    this.emitEvent(AnimationEventTypes.Scrub);
    return this;
  }

  /**
   * Gets the current delta value of the animation
   * @returns The current delta value (normalized progress between 0 and 1)
   */
  getCurrentDelta() {
    return this.currentDelta;
  }

  /**
   * Sets the current delta value of the animation
   * @param delta - The delta value to set (normalized progress between 0 and 1)
   * @returns This animation instance for method chaining
   * @throws Error if delta is greater than 1
   * @emits AnimationEventTypes.Scrub
   */
  setCurrentDelta(delta: number) {
    if (delta > 1) {
      throw new Error(`Cannot set delta greater than 1`);
    }

    this.play();

    this.currentDelta = delta;
    this.currentTime = delta * this.effectiveDuration;
    this.emitEvent(AnimationEventTypes.Scrub);
    return this;
  }

  /**
   * Sets the playback rate of the animation
   * @param rate - The playback rate (1.0 is normal speed)
   * @returns This animation instance for method chaining
   * @emits AnimationEventTypes.PlaybackRateChange
   */
  setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    this.effectiveDuration = this.duration / this.playbackRate;
    this.emitEvent(AnimationEventTypes.PlaybackRateChange);
    return this;
  }

  /**
   * Gets the current playback rate
   * @returns The current playback rate
   */
  getPlaybackRate() {
    return this.playbackRate;
  }

  /**
   * Adds an event listener to the animation
   * @param type - The type of event to listen for
   * @param callback - The callback function to execute when the event occurs
   * @returns This animation instance for method chaining
   */
  addEventListener(type: AnimationEventTypes, callback: AnimationEventCallback) {
    // "value is always falsy" - TS
    // this is to catch any dynamically set events
    if (!(type in this.listeners)) {
      console.warn(`Event type ${type} does not exist, ignoring`);
      return this;
    }

    this.listeners[type].push(callback);

    return this;
  }

  /**
   * Removes an event listener from the animation
   * @param type - The type of event to remove
   * @param callback - The callback function to remove
   * @returns This animation instance for method chaining
   */
  removeEventListener(type: AnimationEventTypes, callback: AnimationEventCallback) {
    // "value is always falsy" - TS
    // this is to catch any dynamically set events
    if (!(type in this.listeners)) {
      console.warn(`Event type ${type} does not exist, ignoring`);
      return this;
    }

    this.listeners[type] = this.listeners[type].filter((fn) => fn !== callback);

    return this;
  }

  /**
   * Emits an event to all listeners of a specific type
   * @param event - The type of event to emit
   * @param keyframe - The keyframe that triggered the event
   * @param props - The interpolated properties at the current delta
   */
  emitEvent(event: AnimationEventTypes, keyframe?: Keyframe | null, nextKeyframe?: Keyframe | null, props: Record<string, number> = {}, previousProps?: Record<string, number>) {
    this.listeners[event].forEach((fn: AnimationEventCallback) => {
      fn({
        type: event,
        target: this,
        currentTime: this.currentTime,
        currentDelta: this.currentDelta,
        playbackRate: this.playbackRate,
        keyframe,
        nextKeyframe: nextKeyframe ?? keyframe,
        props,
        previousProps: previousProps ?? props,
      });
    });
  }

  /**
   * Creates a clone of this animation
   * @returns A new animation instance with the same properties as this one
   */
  clone() {
    return new MTAnimation({
      keyframes: this.keyframes,
      duration: this.duration,
      iterations: this.iterations,
    });
  }

  /**
   * Destroys the animation instance, removing all event listeners and stopping playback
   * @returns This animation instance for method chaining
   */
  destroy() {
    this.stop();
    this.listeners = Object.values(AnimationEventTypes).reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as AnimationEventListenersRecord);
    AnimationManager.remove(this);
  }
}
