import { describe, expect, it } from "vitest";
import { ENTER_PRESET_EASING, EXIT_PRESET_EASING, IDLE_PRESET_DEFAULT_DURATION, LIFECYCLE_LIFT_PX } from "../../src/Marker/marker-constants";
import { IDLE_PRESET_CONFIG, enterPresetHiddenValue, exitPresetHiddenValue, scaleIdleMagnitude, scaleLifecycleMagnitude } from "../../src/Marker/marker-animation-presets";

//#region enterPresetHiddenValue

describe("enterPresetHiddenValue", () => {
  it("fade: hidden opacity 0, scale unchanged, no lift", () => {
    expect(enterPresetHiddenValue("fade", 0.8, [2, 2])).toEqual({ opacity: 0, scale: [2, 2], lift: 0 });
  });

  it("grow/pop: hidden opacity 0, scale collapsed to 0", () => {
    expect(enterPresetHiddenValue("grow", 1, [1, 1])).toEqual({ opacity: 0, scale: [0, 0], lift: 0 });
    expect(enterPresetHiddenValue("pop", 1, [1, 1])).toEqual({ opacity: 0, scale: [0, 0], lift: 0 });
  });

  it("drop: hidden opacity 0, base scale, lifted above", () => {
    expect(enterPresetHiddenValue("drop", 1, [1, 1])).toEqual({ opacity: 0, scale: [1, 1], lift: -LIFECYCLE_LIFT_PX });
  });

  it("bounce: opacity unchanged from base, base scale, lifted above", () => {
    expect(enterPresetHiddenValue("bounce", 0.5, [1, 1])).toEqual({ opacity: 0.5, scale: [1, 1], lift: -LIFECYCLE_LIFT_PX });
  });
});

//#endregion

//#region exitPresetHiddenValue

describe("exitPresetHiddenValue", () => {
  it("fade: hidden opacity 0, scale unchanged", () => {
    expect(exitPresetHiddenValue("fade", 1, [1, 1])).toEqual({ opacity: 0, scale: [1, 1], lift: 0 });
  });

  it("shrink: fully opaque, scale collapsed to 0", () => {
    expect(exitPresetHiddenValue("shrink", 0.7, [2, 3])).toEqual({ opacity: 0.7, scale: [0, 0], lift: 0 });
  });

  it("pop: opacity 0, scale collapsed to 0", () => {
    expect(exitPresetHiddenValue("pop", 1, [1, 1])).toEqual({ opacity: 0, scale: [0, 0], lift: 0 });
  });

  it("explode: opacity 0, scale doubled", () => {
    expect(exitPresetHiddenValue("explode", 1, [1, 2])).toEqual({ opacity: 0, scale: [2, 4], lift: 0 });
  });
});

//#endregion

//#region scaleLifecycleMagnitude

describe("scaleLifecycleMagnitude", () => {
  const shown = { opacity: 1, scale: [1, 1] as [number, number], lift: 0 };
  const hidden = { opacity: 0, scale: [0, 0] as [number, number], lift: -48 };

  it("magnitude 1 returns hidden as-is", () => {
    expect(scaleLifecycleMagnitude(shown, hidden, 1)).toEqual(hidden);
  });

  it("magnitude 0 returns shown as-is", () => {
    expect(scaleLifecycleMagnitude(shown, hidden, 0)).toEqual(shown);
  });

  it("magnitude 0.5 interpolates halfway", () => {
    expect(scaleLifecycleMagnitude(shown, hidden, 0.5)).toEqual({ opacity: 0.5, scale: [0.5, 0.5], lift: -24 });
  });

  it("magnitude beyond 1 extrapolates past hidden", () => {
    const result = scaleLifecycleMagnitude(shown, hidden, 2);
    expect(result.opacity).toBeCloseTo(-1);
    expect(result.lift).toBeCloseTo(-96);
  });
});

//#endregion

//#region scaleIdleMagnitude

describe("scaleIdleMagnitude", () => {
  it("scale/opacity channels rest at 1", () => {
    expect(scaleIdleMagnitude("scale", 1.15, 1)).toBeCloseTo(1.15);
    expect(scaleIdleMagnitude("scale", 1.15, 0)).toBeCloseTo(1);
    expect(scaleIdleMagnitude("opacity", 0.5, 0.5)).toBeCloseTo(0.75);
  });

  it("rotation/lift channels rest at 0", () => {
    expect(scaleIdleMagnitude("rotation", 12, 1)).toBeCloseTo(12);
    expect(scaleIdleMagnitude("rotation", 12, 0)).toBeCloseTo(0);
    expect(scaleIdleMagnitude("lift", -14, 0.5)).toBeCloseTo(-7);
  });

  it("magnitude beyond 1 extrapolates", () => {
    expect(scaleIdleMagnitude("rotation", 10, 2)).toBeCloseTo(20);
  });
});

//#endregion

//#region Config tables

describe("preset config tables", () => {
  it("every enter preset has an easing default", () => {
    const presets = ["fade", "grow", "pop", "drop", "bounce"];
    for (const key of Object.keys(ENTER_PRESET_EASING)) {
      expect(presets).toContain(key);
    }
  });

  it("every exit preset has an easing default", () => {
    const presets = ["fade", "shrink", "pop", "explode"];
    for (const key of Object.keys(EXIT_PRESET_EASING)) {
      expect(presets).toContain(key);
    }
  });

  it("every idle preset config starts and ends at delta 0/1", () => {
    for (const preset of Object.keys(IDLE_PRESET_CONFIG) as (keyof typeof IDLE_PRESET_CONFIG)[]) {
      const { keyframes } = IDLE_PRESET_CONFIG[preset];
      expect(keyframes[0].delta).toBe(0);
      expect(keyframes[keyframes.length - 1].delta).toBe(1);
    }
  });

  it("every idle preset has a default duration", () => {
    for (const preset of Object.keys(IDLE_PRESET_CONFIG) as (keyof typeof IDLE_PRESET_CONFIG)[]) {
      expect(IDLE_PRESET_DEFAULT_DURATION[preset]).toBeGreaterThan(0);
    }
  });
});

//#endregion
