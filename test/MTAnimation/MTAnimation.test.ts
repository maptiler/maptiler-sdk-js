import { describe, it, expect, vi, beforeEach } from "vitest";
import MTAnimation from "../../src/utils/MTAnimation";
import {
  AnimationEventTypes,
  EasingFunction,
  Keyframe,
} from "../../src/utils/MTAnimation/types";
import {
  lerp,
  lerpArrayValues,
} from "../../src/utils/MTAnimation/animation-helpers";

const keyframes: Keyframe[] = [
  {
    delta: 0,
    props: { x: 0, y: 0 },
    easing: EasingFunction.Linear,
  },
  {
    delta: 0.5,
    props: { x: 50, y: 20 },
    easing: EasingFunction.Linear,
  },
  {
    delta: 1,
    props: { x: 100, y: 0 },
    easing: EasingFunction.Linear,
  },
];

const duration = 1000;
const iterations = 2;

describe("MTAnimation", () => {
  let animation: MTAnimation;

  beforeEach(() => {
    animation = new MTAnimation({ keyframes, duration, iterations });
  });

  it("should initialize with correct properties", () => {
    expect(animation.getCurrentTime()).toBe(0);
    expect(animation.getCurrentDelta()).toBe(0);
    expect(animation.getPlaybackRate()).toBe(1);
    expect(animation.isPlaying).toBe(false);
  });

  it("should play the animation", () => {
    animation.play();
    expect(animation.isPlaying).toBe(true);
  });

  it("should pause the animation", () => {
    animation.play();
    animation.pause();
    expect(animation.isPlaying).toBe(false);
  });

  it("should stop the animation", () => {
    animation.play();
    animation.stop();
    expect(animation.isPlaying).toBe(false);
  });

  it("should reset the animation", () => {
    animation.play();
    animation.reset();
    expect(animation.getCurrentTime()).toBe(0);
    expect(animation.getCurrentDelta()).toBe(0);
    expect(animation.isPlaying).toBe(true);
  });

  it("should update animation state", () => {
    //@ts-expect-error we only use the now method, so this is fine
    vi.spyOn(global, "performance", "get").mockReturnValue({ now: () => 500 });
    animation.play();

    const lastTime = animation.getCurrentTime();
    const lastDelta = animation.getCurrentDelta();

    //@ts-expect-error we only use the now method, so this is fine
    vi.spyOn(global, "performance", "get").mockReturnValue({ now: () => 1000 });

    animation.update();

    expect(animation.getCurrentDelta()).toBeGreaterThan(lastDelta);
    expect(animation.getCurrentTime()).toBeGreaterThan(lastTime);
  });

  it("should fire events on play, pause, stop", () => {
    const playListener = vi.fn();
    const pauseListener = vi.fn();
    const stopListener = vi.fn();

    animation.addEventListener(AnimationEventTypes.Play, playListener);
    animation.addEventListener(AnimationEventTypes.Pause, pauseListener);
    animation.addEventListener(AnimationEventTypes.Stop, stopListener);

    animation.play();
    animation.pause();
    animation.stop();

    expect(playListener).toHaveBeenCalled();
    expect(pauseListener).toHaveBeenCalled();
    expect(stopListener).toHaveBeenCalled();
  });

  it("should scrub to a specific time and fire the correct event", () => {
    const scrubListener = vi.fn();
    animation.addEventListener(AnimationEventTypes.Scrub, scrubListener);
    animation.setCurrentTime(500);
    expect(animation.getCurrentTime()).toBe(500);
    expect(scrubListener).toHaveBeenCalled();
  });

  it("should scrub to a specific delta", () => {
    const scrubListener = vi.fn();
    animation.addEventListener(AnimationEventTypes.Scrub, scrubListener);
    animation.setCurrentDelta(0.5);
    expect(animation.getCurrentDelta()).toBe(0.5);
    expect(scrubListener).toHaveBeenCalled();
  });

  it("should change playback rate", () => {
    animation.setPlaybackRate(2);
    expect(animation.getPlaybackRate()).toBe(2);
  });

  it("should clone the animation", () => {
    const clone = animation.clone();
    expect(clone.getCurrentTime()).toBe(0);
    expect(clone.getPlaybackRate()).toBe(1);
    expect(clone.getCurrentDelta()).toBe(0);
  });
});

describe("Animation helpers", () => {
  it("lerp should linearly interpolate between two values", () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(0, 100, 0.35)).toBe(35);
    expect(lerp(0, 100, 0.75)).toBe(75);
  });

  it("lerpArrayValues should interpolate between numerical array values, filling all null values to the end and from the start", () => {
    const arr1 = [0, null, 100, null, 200];
    expect(lerpArrayValues(arr1)).toEqual([0, 50, 100, 150, 200]);

    const arr2 = [null, 0, null, 100, null, null, null];
    expect(lerpArrayValues(arr2)).toEqual([0, 0, 50, 100, 100, 100, 100]);

    const arr3 = [0, 1, null, 3, null, 4, null, null];
    expect(lerpArrayValues(arr3)).toEqual([0, 1, 2, 3, 3.5, 4, 4, 4]);
  });

  it("lerpArrayValues should throw an error if all values are null", () => {
    const arr = [null, null, null];
    expect(() => lerpArrayValues(arr)).toThrowError(
      "Cannot interpolate an array where all values are `null`",
    );
  });

  it("lerpArrayValues should return an empty array if the input is empty", () => {
    const arr: number[] = [];
    expect(lerpArrayValues(arr)).toEqual([]);
  });
});
