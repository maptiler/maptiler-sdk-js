import { Language } from "../language";

/**
 * Some default settings for the SDK
 */
const defaults = {
  maptilerURL: "https://www.maptiler.com/",
  rtlPluginURL: "https://cdn.maptiler.com/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.min.js",
  primaryLanguage: Language.STYLE,
  secondaryLanguage: Language.LOCAL,
  terrainSourceId: "maptiler-terrain",
};

Object.freeze(defaults);

export { defaults };
