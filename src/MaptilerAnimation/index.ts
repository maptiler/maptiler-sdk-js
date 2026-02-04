import MaptilerAnimation from "./MaptilerAnimation";
export { MaptilerAnimation };

export type * from "./MaptilerAnimation";
export type * from "./types";

export * from "./easing";
export {
  type KeyframeableGeometry,
  type KeyframeableGeoJSONFeature,
  lerp,
  lerpArrayValues,
  parseGeoJSONFeatureToKeyframes,
  createBezierPathFromCoordinates,
  getAverageDistance,
  simplifyPath,
  resamplePath,
  stretchNumericalArray,
} from "./animation-helpers";

export type * from "./animation-helpers";
