import { describe, it, expect, vi } from "vitest";
import { MaptilerAnimation } from "../../src/MaptilerAnimation";

import {
  Keyframe,
} from "../../src/MaptilerAnimation/types";

const keyframes: Keyframe[] = [
  {
    delta: 0,
    props: { x: 0, y: 0 },
    easing: "Linear",
  },
  {
    delta: 0.5,
    props: { x: 50, y: 20 },
    easing: "Linear",
  },
  {
    delta: 1,
    props: { x: 100, y: 0 },
    easing: "Linear",
  },
];

const duration = 1000;
const iterations = 2;

describe("MaptilerAnimation", () => {
  it("should initialize with correct properties", () => {
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });

    expect(animation.getCurrentTime()).toBe(0);
    expect(animation.getCurrentDelta()).toBe(0);
    expect(animation.getPlaybackRate()).toBe(1);
    expect(animation.isPlaying).toBe(false);
  });

  it("should play the animation", () => {
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
    animation.play();
    expect(animation.isPlaying).toBe(true);
  });

  it("should pause the animation", () => {
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
    animation.play();
    animation.pause();
    expect(animation.isPlaying).toBe(false);
  });

  it("should stop the animation", () => {
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
    animation.play();
    animation.stop();
    expect(animation.isPlaying).toBe(false);
  });

  it("should reset the animation", () => {
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
    expect(animation.getCurrentTime()).toBe(0);
    animation.play();
    animation.reset(true);
    expect(animation.isPlaying).toBe(false);
    expect(animation.getCurrentTime()).toBe(0);
    expect(animation.getCurrentDelta()).toBe(0);
    expect(animation.isPlaying).toBe(false);
  });

  it("should update animation state", () => {
    //@ts-expect-error we only use the now method, so this is fine
    vi.spyOn(global, "performance", "get").mockReturnValue({ now: () => 500 });
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
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
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
    const playListener = vi.fn();
    const pauseListener = vi.fn();
    const stopListener = vi.fn();

    animation.addEventListener("play", playListener);
    animation.addEventListener("pause", pauseListener);
    animation.addEventListener("stop", stopListener);

    animation.play();
    animation.pause();
    animation.stop();

    expect(playListener).toHaveBeenCalled();
    expect(pauseListener).toHaveBeenCalled();
    expect(stopListener).toHaveBeenCalled();
  });

  it("should scrub to a specific time and fire the correct event", () => {
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
    const scrubListener = vi.fn();
    animation.addEventListener("scrub", scrubListener);
    animation.setCurrentTime(500);
    expect(animation.getCurrentTime()).toBe(500);
    expect(scrubListener).toHaveBeenCalled();
  });

  it("should scrub to a specific delta", () => {
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
    const scrubListener = vi.fn();
    animation.addEventListener("scrub", scrubListener);
    animation.setCurrentDelta(0.5);
    expect(animation.getCurrentDelta()).toBe(0.5);
    expect(scrubListener).toHaveBeenCalled();
  });

  it("should change playback rate", () => {
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
    animation.setPlaybackRate(2);
    expect(animation.getPlaybackRate()).toBe(2);
  });

  it("should clone the animation", () => {
    const animation = new MaptilerAnimation({
      keyframes,
      duration,
      iterations,
    });
    const clone = animation.clone();
    expect(clone.getCurrentTime()).toBe(0);
    expect(clone.getPlaybackRate()).toBe(1);
    expect(clone.getCurrentDelta()).toBe(0);
  });
});
