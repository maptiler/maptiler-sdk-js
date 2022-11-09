import satelliteBuiltin from "./builtinStyles/satellite.json"
import { StyleSpecification } from "maplibre-gl"

/**
 * Built-in styles
 */
enum Style {
  STREETS = "streets-v2",
  HYBRID = "hybrid",
  SATELLITE = "satellite",
  OUTDOOR = "outdoor",
  BASIC = "basic-v2",
  DARK = "streets-v2-dark",
  LIGHT = "streets-v2-light",
}

const builtInStyles = {}
builtInStyles[Style.SATELLITE] = satelliteBuiltin


function isBuiltinStyle(styleId: string): boolean {
  return styleId in builtInStyles
}


function prepareBuiltinStyle(styleId: Style, apiKey: string ): StyleSpecification | null {
  if (!isBuiltinStyle(styleId)) {
    return null;
  }

  const fullTextVersion = JSON.stringify(builtInStyles[styleId]).replace(/{key}/gi, apiKey);
  return JSON.parse(fullTextVersion) as StyleSpecification;
}


export { Style, isBuiltinStyle, prepareBuiltinStyle }; 
