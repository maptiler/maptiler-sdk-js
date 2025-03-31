import Easing from "easing-functions";
import { EasingFunctionName } from "./types";

// We are wrapping these in arrow functions to avoid ts complaining about
// unboud `this` in the easing functions.
const EasingFunctions: Record<EasingFunctionName, (K: number) => number> = {
  [EasingFunctionName.Linear]: (n: number) => Easing.Linear(n),
  [EasingFunctionName.QuadraticIn]: (n: number) => Easing.quadratic.In(n),
  [EasingFunctionName.QuadraticOut]: (n: number) => Easing.quadratic.Out(n),
  [EasingFunctionName.QuadraticInOut]: (n: number) => Easing.quadratic.InOut(n),
  [EasingFunctionName.CubicIn]: (n: number) => Easing.cubic.In(n),
  [EasingFunctionName.CubicOut]: (n: number) => Easing.cubic.Out(n),
  [EasingFunctionName.CubicInOut]: (n: number) => Easing.cubic.InOut(n),
  [EasingFunctionName.SinusoidalIn]: (n: number) => Easing.sinusoidal.In(n),
  [EasingFunctionName.SinusoidalOut]: (n: number) => Easing.sinusoidal.Out(n),
  [EasingFunctionName.SinusoidalInOut]: (n: number) => Easing.sinusoidal.InOut(n),
  [EasingFunctionName.ExponentialIn]: (n: number) => Easing.exponential.In(n),
  [EasingFunctionName.ExponentialOut]: (n: number) => Easing.exponential.Out(n),
  [EasingFunctionName.ExponentialInOut]: (n: number) => Easing.exponential.InOut(n),
  [EasingFunctionName.ElasticIn]: (n: number) => Easing.elastic.In(n),
  [EasingFunctionName.ElasticOut]: (n: number) => Easing.elastic.Out(n),
  [EasingFunctionName.ElasticInOut]: (n: number) => Easing.elastic.InOut(n),
  [EasingFunctionName.BounceIn]: (n: number) => Easing.bounce.In(n),
  [EasingFunctionName.BounceOut]: (n: number) => Easing.bounce.Out(n),
  [EasingFunctionName.BounceInOut]: (n: number) => Easing.bounce.InOut(n),
};

export default EasingFunctions;
