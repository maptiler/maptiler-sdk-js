import { LngLat } from "../index";
import { MaptilerAnimation } from "../MaptilerAnimation";
import { parseColorStringToVec4 } from "../utils/webgl-utils";
import type { MarkerTransitionSpec, Vector2 } from "./types";

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

export const positionTransitionCodec: TransitionValueCodec<LngLat> = {
  toNumeric: ({ lng, lat }) => ({ lng, lat }),
  fromNumeric: ({ lng, lat }) => new LngLat(lng, lat),
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
      { delta: 0, props: handlers.codec.toNumeric(from), easing: easing ?? "Linear" },
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
