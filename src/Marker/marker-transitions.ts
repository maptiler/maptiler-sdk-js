import { MaptilerAnimation } from "../MaptilerAnimation";
import type { EasingFunctionName } from "../MaptilerAnimation/types";
import EasingFunctions from "../MaptilerAnimation/easing";
import { parseColorStringToVec4 } from "../utils/webgl-utils";
import type { MarkerTransitionSpec, Vector2 } from "./types";

const EASING_NAMES_LOWER: Record<string, EasingFunctionName> = Object.keys(EasingFunctions).reduce<Record<string, EasingFunctionName>>((acc, name) => {
  acc[name.toLowerCase()] = name as EasingFunctionName;
  return acc;
}, {});

/** Resolves a transition's easing name case-insensitively (e.g. `"bouncein"` -> `"BounceIn"`), falling back to `"Linear"` for unknown names. */
export function resolveTransitionEasing(name: string | undefined): EasingFunctionName {
  if (!name) return "Linear";
  const resolved = EASING_NAMES_LOWER[name.toLowerCase()];
  if (!resolved) {
    console.warn(`[Marker] Unknown transition easing "${name}", falling back to "Linear".`);
    return "Linear";
  }
  return resolved;
}

/** Bridges a transitionable property's real value to/from the flat numeric props {@link MaptilerAnimation} interpolates between. */
export type TransitionValueCodec<T> = {
  toNumeric(value: T): Record<string, number>;
  fromNumeric(props: Record<string, number>): T;
};

export const scaleTransitionCodec: TransitionValueCodec<Vector2> = {
  toNumeric: ([x, y]) => ({ x, y }),
  fromNumeric: (props) => [props.x, props.y] as Vector2,
};

export const rotationTransitionCodec: TransitionValueCodec<number> = {
  toNumeric: (value) => ({ value }),
  fromNumeric: (props) => props.value,
};

export type LngLatPosition = { lng: number; lat: number };

export const positionTransitionCodec: TransitionValueCodec<LngLatPosition> = {
  toNumeric: ({ lng, lat }) => ({ lng, lat }),
  fromNumeric: ({ lng, lat }) => ({ lng, lat }),
};

// colours with no value (unset) have nothing to interpolate from/to — fall
// back to transparent black, since the exact endpoint is always re-applied
// as-is once the transition ends (see runPropertyTransition)
export const colorTransitionCodec: TransitionValueCodec<string | undefined> = {
  toNumeric: (color) => {
    if (color === undefined) return { r: 0, g: 0, b: 0, a: 0 };
    const [r, g, b, a] = parseColorStringToVec4(color);
    return { r, g, b, a };
  },
  fromNumeric: ({ r, g, b, a }) => `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`,
};

export type PropertyTransitionHandlers<T> = {
  codec: TransitionValueCodec<T>;
  onUpdate: (value: T) => void;
  onStart: () => void;
  onEnd: (value: T) => void;
};

/**
 * Eases `from` to `to` over `spec`'s duration/easing/delay via a one-shot
 * {@link MaptilerAnimation}, calling `onUpdate` every frame and `onEnd` once
 * with the exact target value. The returned animation is already playing;
 * callers own its lifetime — `.destroy()` it to cancel.
 */
export function runPropertyTransition<T>(from: T, to: T, spec: MarkerTransitionSpec, handlers: PropertyTransitionHandlers<T>): MaptilerAnimation {
  const [duration, easing, delay] = spec;

  const animation = new MaptilerAnimation({
    keyframes: [
      { delta: 0, props: handlers.codec.toNumeric(from), easing: resolveTransitionEasing(easing) },
      { delta: 1, props: handlers.codec.toNumeric(to) },
    ],
    duration,
    iterations: 1,
    delay: delay ?? 0,
  });

  animation.addEventListener("play", () => {
    handlers.onStart();
  });
  animation.addEventListener("timeupdate", (event) => {
    handlers.onUpdate(handlers.codec.fromNumeric(event.props));
  });
  animation.addEventListener("animationend", () => {
    handlers.onEnd(to);
    animation.destroy();
  });

  animation.play();
  return animation;
}
