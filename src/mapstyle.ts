import satelliteBuiltin from "./builtinStyles/satellite.json";
import { StyleSpecification } from "maplibre-gl";

/**
 * Built-in styles
 */
const MapStyle = {
  STREETS: "streets-v2",
  HYBRID: "hybrid",
  SATELLITE: "satellite",
  OUTDOOR: "outdoor",
  BASIC: "basic-v2",
  STREETS_DARK: "streets-v2-dark",
  STREETS_LIGHT: "streets-v2-light",
} as const;

type Values<T> = T[keyof T];

/**
 * Built-in style values as strings
 */
type MapStyleString = Values<typeof MapStyle>;

const builtInStyles = {};
builtInStyles[MapStyle.SATELLITE] = satelliteBuiltin;

function isBuiltinStyle(styleId: string): boolean {
  return styleId in builtInStyles;
}

function getBuiltinStyle(styleId: MapStyleString): StyleSpecification | null {
  if (!isBuiltinStyle(styleId)) {
    return null;
  }

  return builtInStyles[styleId];
}

export { MapStyle, MapStyleString, isBuiltinStyle, getBuiltinStyle };
