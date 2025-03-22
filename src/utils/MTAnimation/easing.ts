import Easing from "easing-functions"
import { EasingFunctionName } from "./types"

const EasingFunctions: Record<EasingFunctionName, (K: number) => number> = {
  [EasingFunctionName.Linear]: Easing.Linear,
  [EasingFunctionName.QuadraticIn]: Easing.quadratic.In,
  [EasingFunctionName.QuadraticOut]: Easing.quadratic.Out,
  [EasingFunctionName.QuadraticInOut]: Easing.quadratic.InOut,
  [EasingFunctionName.CubicIn]: Easing.cubic.In,
  [EasingFunctionName.CubicOut]: Easing.cubic.Out,
  [EasingFunctionName.CubicInOut]: Easing.cubic.InOut,
  [EasingFunctionName.SinusoidalIn]: Easing.sinusoidal.In,
  [EasingFunctionName.SinusoidalOut]: Easing.sinusoidal.Out,
  [EasingFunctionName.SinusoidalInOut]: Easing.sinusoidal.InOut,
  [EasingFunctionName.ExponentialIn]: Easing.exponential.In,
  [EasingFunctionName.ExponentialOut]: Easing.exponential.Out,
  [EasingFunctionName.ExponentialInOut]: Easing.exponential.InOut,
  [EasingFunctionName.ElasticIn]: Easing.elastic.In,
  [EasingFunctionName.ElasticOut]: Easing.elastic.Out,
  [EasingFunctionName.ElasticInOut]: Easing.elastic.InOut,
  [EasingFunctionName.BounceIn]: Easing.bounce.In,
  [EasingFunctionName.BounceOut]: Easing.bounce.Out,
  [EasingFunctionName.BounceInOut]: Easing.bounce.InOut,
}

export default EasingFunctions
