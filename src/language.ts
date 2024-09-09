import { Language as LanguageFromClient, getLanguageInfoFromCode, type LanguageInfo } from "@maptiler/client";

// Adding some language entries that are specific to the SDK
const Language = {
  /**
   * Language mode to display labels in both the local language and the language of the visitor's device, concatenated.
   * Note that if those two languages are the same, labels won't be duplicated.
   */
  VISITOR: {
    code: null,
    flag: "visitor",
    name: "Visitor",
    latin: true,
    isMode: true,
    geocoding: false,
  } as LanguageInfo,

  /**
   * Language mode to display labels in both the local language and English, concatenated.
   * Note that if those two languages are the same, labels won't be duplicated.
   */
  VISITOR_ENGLISH: {
    code: null,
    flag: "visitor_en",
    name: "Visitor English",
    latin: true,
    isMode: true,
    geocoding: false,
  } as LanguageInfo,

  /**
   * Language mode to display labels in a language enforced in the style.
   */
  STYLE: { code: null, flag: "style", name: "Style", latin: false, isMode: true, geocoding: false } as LanguageInfo,

  /**
   * Language mode to display labels in a language enforced in the style. The language cannot be further modified.
   */
  STYLE_LOCK: {
    code: null,
    flag: "style_lock",
    name: "Style Lock",
    latin: false,
    isMode: true,
    geocoding: false,
  } as LanguageInfo,

  ...LanguageFromClient,
} as const;

/**
 * Get the browser language
 */
export function getBrowserLanguage(): LanguageInfo {
  if (typeof navigator === "undefined") {
    const code = Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0];

    const langInfo = getLanguageInfoFromCode(code);

    if (langInfo) return langInfo;
    return Language.ENGLISH;
  }

  const canditatelangs = Array.from(new Set(navigator.languages.map((l) => l.split("-")[0])))
    .map((code) => getLanguageInfoFromCode(code))
    .filter((li) => li);

  return canditatelangs[0] ?? Language.LOCAL;
}

export { Language, type LanguageInfo };
