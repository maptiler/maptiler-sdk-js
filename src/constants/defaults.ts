import { Language } from "../language";

/**
 * Some default settings for the SDK
 */
const defaults = {
  maptilerLogoURL: "https://api.maptiler.com/resources/logo.svg",
  maptilerURL: "https://www.maptiler.com/",
  maptilerApiHost: "api.maptiler.com",
  telemetryURL: "https://api.maptiler.com/metrics",
  primaryLanguage: Language.STYLE,
  secondaryLanguage: Language.LOCAL,
  terrainSourceURL: "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json",
  terrainSourceId: "maptiler-terrain",
};

Object.freeze(defaults);

export { defaults };
