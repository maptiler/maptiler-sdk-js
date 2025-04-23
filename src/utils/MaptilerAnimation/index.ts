import MaptilerAnimation from "./MaptilerAnimation";

export default MaptilerAnimation;
export * from "./types";
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
} from "./animation-helpers";
