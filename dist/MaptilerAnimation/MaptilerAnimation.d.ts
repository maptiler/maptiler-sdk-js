import { AnimationEventCallback, AnimationEventTypes, EasingFunctionName, Keyframe } from './types';
/**
 * Configuration options for creating an animation.
 *
 * @interface MaptilerAnimationOptions
 * @property {Keyframe[]} keyframes - The keyframes that define the animation states at various points in time.
 * @property {number} duration - The total duration of the animation in milliseconds.
 * @property {number} iterations - The number of times the animation should repeat. Use 0 for no repeat, or Infinity for an infinite loop.
 * @property {delay} [delay] - Optional. The delay before the animation starts, in milliseconds. Defaults to 0 if not specified.
 * @property {boolean} [manualMode] - Optional. If true, the animation will not be automatically managed by the animation manager
 *                                   and must be updated manually by calling update(). Defaults to false if not specified.
 */
export interface MaptilerAnimationOptions {
    keyframes: Keyframe[];
    duration: number;
    iterations: number;
    manualMode?: boolean;
    delay?: number;
}
/**
 * A keyframe in the animation sequence where null or undefined values
 * are interpolated to fill in the gaps between keyframes.
 *
 * @extends Keyframe
 * @property {Record<string, number>} props - The properties to be animated at this keyframe.
 * @property {EasingFunctionName} easing - The easing function to use for this keyframe.
 * @property {string} id - A unique identifier for this keyframe.
 */
export type InterpolatedKeyFrame = Keyframe & {
    props: Record<string, number>;
    easing: EasingFunctionName;
    id: string;
};
/**
 * Animation controller for keyframe-based animation sequences.
 *
 * MaptilerAnimation handles interpolation between keyframes, timing control,
 * and event dispatching during animation playback.
 *
 * @example
 * ```typescript
 * const animation = new MaptilerAnimation({
 *   keyframes: [
 *     { delta: 0, props: { x: 0, y: 0 } },
 *     { delta: 0.5, props: { x: 50, y: 20 } },
 *     { delta: 1, props: { x: 100, y: 0 } }
 *   ],
 *   duration: 1000, // milliseconds
 *   iterations: 2
 * });
 *
 * animation.addEventListener("timeupdate", (event) => {
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
export default class MaptilerAnimation {
    private playing;
    /**
     * Indicates if the animation is currently playing
     * @returns {boolean} - true if the animation is playing, false otherwise
     */
    get isPlaying(): boolean;
    /**
     * The number of times to repeat the animation
     * 0 is no repeat, Infinity is infinite repeat
     */
    private iterations;
    private currentIteration;
    /** An array of keyframes animations to interpolate between */
    private keyframes;
    /** The current keyframe id */
    private currentKeyframe?;
    /**The duration of the animation in milliseconds (when playbackRate === 1) */
    readonly duration: number;
    /**
     * The duration of the animation affected by the playback rate
     * if playback rate is 2, the effective duration is double
     */
    private effectiveDuration;
    /** the rate at which the animation is playing */
    private playbackRate;
    /** the current time in milliseconds */
    private currentTime;
    /** 0 start of the animation, 1 end of the animation */
    private currentDelta;
    /** The time at which the animation started */
    private animationStartTime;
    /** The time at which the last frame was rendered */
    private lastFrameAt;
    /** The delay before the animation starts */
    private delay;
    /** The timeout ID for the delay before the animation starts */
    private delayTimeoutID?;
    /** The listeners added for each event */
    private listeners;
    /** The props from the previous frame */
    private previousProps;
    constructor({ keyframes, duration, iterations, manualMode, delay }: MaptilerAnimationOptions);
    /**
     * Starts or resumes the animation
     * @returns This animation instance for method chaining
     * @event "play"
     */
    play(): this;
    /**
     * Pauses the animation
     * @returns This animation instance for method chaining
     * @event "pause"
     */
    pause(): this;
    /**
     * Stops the animation and resets to initial state
     * @returns This animation instance for method chaining
     * @event "stop"
     */
    stop(silent?: boolean): this;
    /**
     * Resets the animation to its initial state without stopping
     * @returns This animation instance for method chaining
     * @event "reset"
     */
    reset(manual?: boolean): this;
    /**
     * Updates the animation state if playing, this is used by the AnimationManager
     * to update all animations in the loop
     * @returns This animation instance for method chaining
     */
    updateInternal(): this;
    /**
     * Updates the animation state, interpolating between keyframes
     * and emitting events as necessary
     * @event "timeupdate"
     * @event "keyframe"
     * @event "iteration"
     * @event "animationend"
     * @returns This animation instance for method chaining
     */
    update(manual?: boolean, ignoreIteration?: boolean): this;
    /**
     * Gets the current and next keyframes at a specific time
     * @param time - The time position to query
     * @returns Object containing current and next keyframes, which may be null
     */
    getCurrentAndNextKeyFramesAtTime(time: number): {
        current: InterpolatedKeyFrame | null;
        next: InterpolatedKeyFrame | null;
    };
    /**
     * Gets the current and next keyframes at a specific delta value
     * @param delta - The delta value to query
     * @returns Object containing current and next keyframes, which may be null
     */
    getCurrentAndNextKeyFramesAtDelta(delta: number): {
        current: InterpolatedKeyFrame | null;
        next: InterpolatedKeyFrame | null;
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
     * @throws Error if time is greater than the duration
     * @event "scrub"
     */
    setCurrentTime(time: number): this;
    /**
     * Gets the current delta value of the animation
     * @returns The current delta value (normalized progress between 0 and 1)
     */
    getCurrentDelta(): number;
    /**
     * Sets the current delta value of the animation
     * @param delta - The delta value to set (normalized progress between 0 and 1)
     * @returns This animation instance for method chaining
     * @throws Error if delta is greater than 1
     * @event "scrub"
     */
    setCurrentDelta(delta: number): this;
    /**
     * Sets the playback rate of the animation
     * @param rate - The playback rate (1.0 is normal speed)
     * @returns This animation instance for method chaining
     * @event "playbackratechange"
     */
    setPlaybackRate(rate: number): this;
    /**
     * Gets the current playback rate
     * @returns The current playback rate
     */
    getPlaybackRate(): number;
    /**
     * Adds an event listener to the animation
     * @param type - The type of event to listen for
     * @param callback - The callback function to execute when the event occurs
     * @returns This animation instance for method chaining
     */
    addEventListener(type: AnimationEventTypes, callback: AnimationEventCallback): this;
    /**
     * Removes an event listener from the animation
     * @param type - The type of event to remove
     * @param callback - The callback function to remove
     * @returns This animation instance for method chaining
     */
    removeEventListener(type: AnimationEventTypes, callback: AnimationEventCallback): this;
    /**
     * Emits an event to all listeners of a specific type
     * @param event - The type of event to emit
     * @param keyframe - The keyframe that triggered the event
     * @param props - The interpolated properties at the current delta
     */
    emitEvent(event: AnimationEventTypes, keyframe?: Keyframe | null, nextKeyframe?: Keyframe | null, props?: Record<string, number>, previousProps?: Record<string, number>): void;
    /**
     * Creates a clone of this animation
     * @returns A new animation instance with the same properties as this one
     */
    clone(): MaptilerAnimation;
    /**
     * Destroys the animation instance, removing all event listeners and stopping playback
     */
    destroy(): void;
}
