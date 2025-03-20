import { lerp, lerpArrayValues } from "./animation-helpers";
import AnimationManager from "./AnimationManager";
import {
  AnimationEventCallback,
  AnimationEventListenersRecord,
  AnimationEventTypes,
  IMTAnimation,
  Keyframe,
} from "./types";

/**
 * Configuration options for creating an animation.
 *
 * @interface AnimationOptions
 * @property {Keyframe[]} keyframes - The keyframes that define the animation states at various points in time.
 * @property {number} duration - The total duration of the animation in milliseconds.
 * @property {number} iterations - The number of times the animation should repeat. Use 0 for no repeat, or Infinity for an infinite loop.
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
}

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
}

export default class MTAnimation implements IMTAnimation {
  private playing: boolean = false;

  get isPlaying() {
    return this.playing;
  }

  // the number of times to repeat the animation
  // 0 is no repeat, Infinity is infinite repeat
  private iterations: number;

  private currentIteration: number = 0;

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

  private animationStartTime: number = 0;

  private listeners: AnimationEventListenersRecord = Object.values(
    AnimationEventTypes,
  ).reduce((acc, type) => {
    acc[type] = [];
    return acc;
  }, {} as AnimationEventListenersRecord);

  constructor({
    keyframes,
    duration,
    iterations,
    manualMode,
  }: AnimationOptions) {
    // collate all properties that are animated
    const animatedProperties = keyframes
      .map(({ props }: Keyframe) => {
        return Object.keys(props) as string[];
      })
      .flat()
      .reduce<string[]>((props, prop: string) => {
        // WAT
        if (prop && !props.includes(prop)) {
          props.push(prop);
        }
        return props;
      }, []);

    // iterate over keyframes and ensure all properties are present
    // if not, add them with the value in next keyframe that has this property defined

    this.keyframes = keyframes
      // order keyframes by delta
      .sort((a, b) => a.delta - b.delta)
      // ensure animated properties are present in all keyframes
      .map((keyframe) => {
        const newProps = animatedProperties.reduce(
          (props: Keyframe["props"], prop: string) => {
            if (prop in props) {
              return props;
            }
            return {
              ...props,
              // set as null to infer that this proprty
              // does not have a value but will need to be
              [prop]: null,
            };
          },
          keyframe.props,
        );

        return {
          ...keyframe,
          props: newProps,
        };
      });

    // transform keyframes into a format that is easier to interpolate
    const valuesForAllProps = this.keyframes
      .map(({ props }) => props)
      .reduce<Record<string, (number | null)[]>>((acc, keyframeProps) => {
        for (const [prop, value] of Object.entries(keyframeProps)) {
          if (acc[prop] === undefined) {
            acc[prop] = [];
          }

          acc[prop].push(value);
        }

        return acc;
      }, {});

    // interpolate values for each property
    const interpolatedValues = Object.entries(valuesForAllProps).reduce<
      Record<string, number[]>
    >((acc, [prop, values]) => {
      acc[prop] = lerpArrayValues(values);
      return acc;
    }, {});

    // update keyframes with interpolated values
    this.keyframes = this.keyframes.map((keyframe, _) => {
      return {
        ...keyframe,
        props: animatedProperties.reduce<Keyframe["props"]>((props, prop) => {
          props[prop] = interpolatedValues[prop][_];
          return props;
        }, {}),
      };
    });

    this.duration = duration;
    this.iterations = iterations;
    this.playbackRate = 1;
    this.currentTime = 0;
    this.currentDelta = 0;

    // if not manually updating, add to the animation manager
    if (!manualMode) {
      AnimationManager.add(this);
    }
  }

  play() {
    this.playing = true;
    this.animationStartTime = performance.now();
    this.emitEvent(AnimationEventTypes.Play);
    return this;
  }

  pause() {
    this.playing = false;
    this.emitEvent(AnimationEventTypes.Pause);
    return this;
  }

  stop() {
    this.playing = false;
    this.emitEvent(AnimationEventTypes.Stop);
    return this;
  }

  reset() {
    this.currentTime = 0;
    this.currentDelta = 0;
    this.emitEvent(AnimationEventTypes.Reset);
    this.play();
    return this;
  }

  update() {
    if (!this.playing) {
      return this;
    }

    const currentTime = performance.now();

    const timeElapsed = currentTime - this.animationStartTime;

    const timeDelta = timeElapsed * this.playbackRate;

    this.currentTime = timeDelta;
    this.currentDelta = timeDelta / this.duration;

    if (this.currentDelta >= 1) {
      this.currentIteration += 1;
      this.emitEvent(AnimationEventTypes.Iteration, null, {});
      if (this.iterations === 0 || this.currentIteration < this.iterations) {
        this.reset();
        return this;
      }

      this.stop();
      this.emitEvent(AnimationEventTypes.AnimationEnd);
      return this;
    }

    const { next, current } = this.getCurrentAndNextKeyFramesAtDelta(
      this.currentDelta,
    );

    if (current?.delta === this.currentDelta) {
      this.emitEvent(AnimationEventTypes.Keyframe, current);
    }

    const iterpolatedProps = Object.keys(current?.props || {}).reduce<
      Record<string, number>
    >((acc, prop) => {
      if (current && next) {
        const currentValue = current.props[prop]!;
        const nextValue = next.props[prop]!;
        // this will change
        const easingFunction = lerp;
        const t =
          (this.currentDelta - current.delta) / (next.delta - current.delta);
        acc[prop] = easingFunction(currentValue, nextValue, t);
      }
      return acc;
    }, {});

    this.emitEvent(AnimationEventTypes.TimeUpdate, current, iterpolatedProps);
    return this;
  }

  getCurrentAndNextKeyFramesAtTime(time: number) {
    return this.getCurrentAndNextKeyFramesAtDelta(time / this.duration);
  }

  getCurrentAndNextKeyFramesAtDelta(delta: number) {
    const next =
      this.keyframes.find((keyframe) => keyframe.delta > delta) || null;
    const current =
      [...this.keyframes]
        .reverse()
        .find((keyframe) => keyframe.delta <= delta) || null;

    return { current, next };
  }

  getCurrentTime() {
    return this.currentTime;
  }

  setCurrentTime(time: number) {
    if (time > this.duration) {
      throw new Error(`Cannot set time greater than duration`);
    }

    this.play();

    this.currentTime = time;
    this.currentDelta = time / this.duration;
    this.emitEvent(AnimationEventTypes.Scrub);
    return this;
  }

  getCurrentDelta() {
    return this.currentDelta;
  }

  setCurrentDelta(delta: number) {
    if (delta > 1) {
      throw new Error(`Cannot set delta greater than 1`);
    }

    this.play();

    this.currentDelta = delta;
    this.currentTime = delta * this.duration;
    this.emitEvent(AnimationEventTypes.Scrub);
    return this;
  }

  setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    this.emitEvent(AnimationEventTypes.PlaybackRateChange);
    return this;
  }

  getPlaybackRate() {
    return this.playbackRate;
  }

  addEventListener(
    type: AnimationEventTypes,
    callback: AnimationEventCallback,
  ) {
    // "value is always falsy" - TS
    // this is to catch any dynamically set events
    if (!(type in this.listeners)) {
      console.warn(`Event type ${type} does not exist, ignoring`);
      return this;
    }

    this.listeners[type].push(callback);

    return this;
  }

  removeEventListener(
    type: AnimationEventTypes,
    callback: AnimationEventCallback,
  ) {
    // "value is always falsy" - TS
    // this is to catch any dynamically set events
    if (!(type in this.listeners)) {
      console.warn(`Event type ${type} does not exist, ignoring`);
      return this;
    }

    this.listeners[type] = this.listeners[type].filter((fn) => fn !== callback);

    return this;
  }

  emitEvent(
    event: AnimationEventTypes,
    keyframe?: Keyframe | null,
    props: Record<string, number> = {},
  ) {
    this.listeners[event].forEach((fn: AnimationEventCallback) => {
      fn({
        type: event,
        target: this,
        currentTime: this.currentTime,
        currentDelta: this.currentDelta,
        playbackRate: this.playbackRate,
        keyframe,
        props,
      });
    });
  }

  clone() {
    return new MTAnimation({
      keyframes: this.keyframes,
      duration: this.duration,
      iterations: this.iterations,
    });
  }
}
