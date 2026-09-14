import { describe, expect, it, vi } from "vitest";
import maplibregl from "maplibre-gl";
import {
  colorTransitionCodec,
  lifecycleTransitionCodec,
  opacityTransitionCodec,
  positionTransitionCodec,
  rotationTransitionCodec,
  runPropertyTransition,
  scaleTransitionCodec,
} from "../../src/Marker/marker-transitions";
import type { LifecycleAnimationValue } from "../../src/Marker/marker-animation-presets";

/** Drives a manually-updated MaptilerAnimation all the way through completion (play -> iteration -> animationend -> stop). */
function driveToCompletion(animation: { update: () => unknown }, duration: number): void {
  const steps = Math.ceil(duration / 16) + 2;
  for (let i = 0; i < steps; i++) animation.update();
}

//#region Codecs

describe("scaleTransitionCodec", () => {
  it("round-trips a Vector2", () => {
    expect(scaleTransitionCodec.toNumeric([2, 3])).toEqual({ x: 2, y: 3 });
    expect(scaleTransitionCodec.fromNumeric({ x: 2, y: 3 })).toEqual([2, 3]);
  });
});

describe("rotationTransitionCodec", () => {
  it("round-trips a number", () => {
    expect(rotationTransitionCodec.toNumeric(45)).toEqual({ value: 45 });
    expect(rotationTransitionCodec.fromNumeric({ value: 45 })).toBe(45);
  });
});

describe("opacityTransitionCodec", () => {
  it("round-trips a number", () => {
    expect(opacityTransitionCodec.toNumeric(0.5)).toEqual({ value: 0.5 });
    expect(opacityTransitionCodec.fromNumeric({ value: 0.5 })).toBe(0.5);
  });
});

describe("lifecycleTransitionCodec", () => {
  it("round-trips opacity/scale/lift", () => {
    const value: LifecycleAnimationValue = { opacity: 0.6, scale: [1.5, 2], lift: -10 };
    const numeric = lifecycleTransitionCodec.toNumeric(value);
    expect(numeric).toEqual({ opacity: 0.6, scaleX: 1.5, scaleY: 2, lift: -10 });
    expect(lifecycleTransitionCodec.fromNumeric(numeric)).toEqual(value);
  });
});

describe("positionTransitionCodec", () => {
  it("round-trips an LngLat", () => {
    const lngLat = new maplibregl.LngLat(12.5, -3.25);
    const numeric = positionTransitionCodec.toNumeric(lngLat);
    expect(numeric).toEqual({ lng: 12.5, lat: -3.25 });
    const back = positionTransitionCodec.fromNumeric(numeric);
    expect(back).toBeInstanceOf(maplibregl.LngLat);
    expect(back.lng).toBe(12.5);
    expect(back.lat).toBe(-3.25);
  });
});

describe("colorTransitionCodec", () => {
  it("encodes undefined as transparent black", () => {
    expect(colorTransitionCodec.toNumeric(undefined)).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("encodes 'transparent' as transparent white", () => {
    expect(colorTransitionCodec.toNumeric("transparent")).toEqual({ r: 1, g: 1, b: 1, a: 0 });
  });

  it("round-trips a formatted rgba string back through fromNumeric", () => {
    const rgba = colorTransitionCodec.fromNumeric({ r: 1, g: 0, b: 0, a: 1 });
    expect(rgba).toBe("rgba(255, 0, 0, 1)");
  });
});

//#endregion

//#region runPropertyTransition

describe("runPropertyTransition", () => {
  it("calls onStart when the animation begins playing", () => {
    const onStart = vi.fn();
    runPropertyTransition(0, 1, [100], {
      codec: opacityTransitionCodec,
      onUpdate: vi.fn(),
      onStart,
      onEnd: vi.fn(),
    });
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("calls onUpdate with decoded interpolated values as it progresses", () => {
    const onUpdate = vi.fn();
    const animation = runPropertyTransition(0, 100, [100], {
      codec: opacityTransitionCodec,
      onUpdate,
      onStart: vi.fn(),
      onEnd: vi.fn(),
    });
    animation.update();
    expect(onUpdate).toHaveBeenCalled();
    const [value] = onUpdate.mock.calls[0] as [number];
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(100);
  });

  it("calls onEnd with the exact target value once complete, and destroys the animation", () => {
    const onEnd = vi.fn();
    const animation = runPropertyTransition(0, 42, [100], {
      codec: opacityTransitionCodec,
      onUpdate: vi.fn(),
      onStart: vi.fn(),
      onEnd,
    });
    driveToCompletion(animation, 100);
    expect(onEnd).toHaveBeenCalledWith(42);
    expect(animation.isPlaying).toBe(false);
  });

  it("uses Linear easing by default when none is specified", () => {
    const onUpdate = vi.fn();
    const animation = runPropertyTransition(0, 100, [100], {
      codec: opacityTransitionCodec,
      onUpdate,
      onStart: vi.fn(),
      onEnd: vi.fn(),
    });
    // first manual update() step advances currentDelta by 16/100 = 0.16 under Linear easing
    animation.update();
    const [value] = onUpdate.mock.calls[0] as [number];
    expect(value).toBeCloseTo(16, 0);
  });

  it("interpolates Vector2 scale through the codec", () => {
    const onUpdate = vi.fn();
    const animation = runPropertyTransition<[number, number]>([0, 0], [10, 20], [100], {
      codec: scaleTransitionCodec,
      onUpdate,
      onStart: vi.fn(),
      onEnd: vi.fn(),
    });
    driveToCompletion(animation, 100);
    // last onUpdate before onEnd interpolates; final state is asserted via onEnd in the previous test.
    expect(onUpdate).toHaveBeenCalled();
  });

  it("is already playing when returned", () => {
    const animation = runPropertyTransition(0, 1, [100], {
      codec: opacityTransitionCodec,
      onUpdate: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
    });
    expect(animation.isPlaying).toBe(true);
  });
});

//#endregion
