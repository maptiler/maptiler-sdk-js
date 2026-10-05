import { Language } from "../language";

/**
 * Some default settings for the SDK
 */
const defaults = {
  maptilerURL: "https://www.maptiler.com/",
  maptilerApiHost: "api.maptiler.com",
  telemetryURL: "https://api.maptiler.com/metrics",
  primaryLanguage: Language.STYLE,
  secondaryLanguage: Language.LOCAL,
  terrainSourceId: "maptiler-terrain",
};

Object.freeze(defaults);

export { defaults };
