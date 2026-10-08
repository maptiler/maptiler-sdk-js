import { Language } from "../language";

/**
 * Some default settings for the SDK
 */
const defaults = {
  maptilerURL: "https://www.maptiler.com/",
  primaryLanguage: Language.STYLE,
  secondaryLanguage: Language.LOCAL,
  terrainSourceId: "maptiler-terrain",
};

Object.freeze(defaults);

export { defaults };
