import { Language } from "./language";
import { Style } from "./style";

/**
 * Some default settings for the SDK
 */
const defaults = {
  // When a Map is instanciated without a 'style', then this one is the default
  mapStyle: Style.STREETS,
  maptilerLogoURL: "https://api.maptiler.com/resources/logo.svg",
  maptilerURL: "https://www.maptiler.com/",
  maptilerApiURL: "https://api.maptiler.com/",
  rtlPluginURL:
    "https://cdn.maptiler.com/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.min.js",
  primaryLanguage: Language.LATIN,
  secondaryLanguage: Language.NON_LATIN,
  terrainSourceURL: "https://api.maptiler.com/tiles/terrain-rgb/tiles.json",
  terrainSourceId: "maptiler-terrain",
};

Object.freeze(defaults);

export { defaults };
