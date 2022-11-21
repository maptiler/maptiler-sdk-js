import satelliteBuiltin from "./builtinStyles/satellite.json";
import { StyleSpecification } from "maplibre-gl";

/**
 * Built-in styles
 */
const Style = {
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
type StyleString = Values<typeof Style>;

const builtInStyles = {};
builtInStyles[Style.SATELLITE] = satelliteBuiltin;

function isBuiltinStyle(styleId: string): boolean {
  return styleId in builtInStyles;
}

function prepareBuiltinStyle(
  styleId: StyleString,
  apiKey: string
): StyleSpecification | null {
  if (!isBuiltinStyle(styleId)) {
    return null;
  }

  const fullTextVersion = JSON.stringify(builtInStyles[styleId]).replace(
    /{key}/gi,
    apiKey
  );
  return JSON.parse(fullTextVersion) as StyleSpecification;
}

export { Style, StyleString, isBuiltinStyle, prepareBuiltinStyle };
