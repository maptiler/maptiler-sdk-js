import satelliteBuiltin from "./builtinStyles/satellite.json";
import { StyleSpecification } from "maplibre-gl";

/**
 * Built-in styles
 */
const MaptilerStyle = {
  STREETS: "streets-v2",
  HYBRID: "hybrid",
  SATELLITE: "satellite",
  OUTDOOR: "outdoor",
  BASIC: "basic-v2",
  DARK: "streets-v2-dark",
  LIGHT: "streets-v2-light",
} as const;

type Values<T> = T[keyof T];

/**
 * Built-in style values as strings
 */
type MaptilerStyleString = Values<typeof MaptilerStyle>;

const builtInStyles = {};
builtInStyles[MaptilerStyle.SATELLITE] = satelliteBuiltin;

function isBuiltinStyle(styleId: string): boolean {
  return styleId in builtInStyles;
}

function getBuiltinStyle(styleId: MaptilerStyleString): StyleSpecification | null {
  if (!isBuiltinStyle(styleId)) {
    return null;
  }

  return builtInStyles[styleId];
}

export {
  MaptilerStyle,
  MaptilerStyleString,
  isBuiltinStyle,
  getBuiltinStyle,
};
