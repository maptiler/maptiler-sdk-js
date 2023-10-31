/**
 * Languages. Note that not all the languages of this list are available but the compatibility list may be expanded in the future.
 */
const Language = {
  /**
   * The visitor language mode concatenates the prefered language from the user settings and the "default name".
   * Note: The "default name" is equivalent to OSM's `{name}`, which can be the most recognized names a global
   * scale or the local name.
   * This mode is helpful in the context where a user needs to access both the local names and the names in their
   * own language, for instance when traveling abroad, where signs likely to be only available in the local language.
   */
  VISITOR: "visitor",

  /**
   * The visitor language mode concatenates English and the "default name".
   * Note: The "default name" is equivalent to OSM's `{name}`, which can be the most recognized names a global
   * scale or the local name.
   * This mode is helpful in the context where a user needs to access both the local names and the names in their
   * own language, for instance when traveling abroad, where signs likely to be only available in the local language.
   */
  VISITOR_ENGLISH: "visitor_en",

  /**
   * Language as the style is designed. Not that this is the default state and one
   * the language has been changed to another than `STYLE`, then it cannot be set back to `STYLE`.
   */
  STYLE: "style",

  /**
   * AUTO mode uses the language of the browser
   */
  AUTO: "auto",

  /**
   * STYLE is a custom flag to keep the language of the map as defined into the style.
   * If STYLE is set in the constructor, then further modification of the language
   * with `.setLanguage()` is not possible.
   */
  STYLE_LOCK: "style_lock",

  /**
   * Default fallback languages that uses latin charaters
   */
  LATIN: "name:latin",

  /**
   * Default fallback languages that uses non-latin charaters
   */
  NON_LATIN: "name:nonlatin",

  /**
   * Labels are in their local language, when available
   */
  LOCAL: "name",

  /**
   * International name
   */
  INTERNATIONAL: "name_int",

  ALBANIAN: "name:sq",
  AMHARIC: "name:am",
  ARABIC: "name:ar",
  ARMENIAN: "name:hy",
  AZERBAIJANI: "name:az",
  BASQUE: "name:eu",
  BELORUSSIAN: "name:be",
  BENGALI: "name:bn",
  BOSNIAN: "name:bs",
  BRETON: "name:br",
  BULGARIAN: "name:bg",
  CATALAN: "name:ca",
  CHINESE: "name:zh",
  TRADITIONAL_CHINESE: "name:zh-Hant",
  SIMPLIFIED_CHINESE: "name:zh-Hans",
  CORSICAN: "name:co",
  CROATIAN: "name:hr",
  CZECH: "name:cs",
  DANISH: "name:da",
  DUTCH: "name:nl",
  ENGLISH: "name:en",
  ESPERANTO: "name:eo",
  ESTONIAN: "name:et",
  FINNISH: "name:fi",
  FRENCH: "name:fr",
  FRISIAN: "name:fy",
  GEORGIAN: "name:ka",
  GERMAN: "name:de",
  GREEK: "name:el",
  HEBREW: "name:he",
  HINDI: "name:hi",
  HUNGARIAN: "name:hu",
  ICELANDIC: "name:is",
  INDONESIAN: "name:id",
  IRISH: "name:ga",
  ITALIAN: "name:it",
  JAPANESE: "name:ja",
  JAPANESE_HIRAGANA: "name:ja-Hira",
  JAPANESE_KANA: "name:ja_kana",
  JAPANESE_LATIN: "name:ja_rm",
  JAPANESE_2018: "name:ja-Latn",
  KANNADA: "name:kn",
  KAZAKH: "name:kk",
  KOREAN: "name:ko",
  KOREAN_LATIN: "name:ko-Latn",
  KURDISH: "name:ku",
  ROMAN_LATIN: "name:la",
  LATVIAN: "name:lv",
  LITHUANIAN: "name:lt",
  LUXEMBOURGISH: "name:lb",
  MACEDONIAN: "name:mk",
  MALAYALAM: "name:ml",
  MALTESE: "name:mt",
  NORWEGIAN: "name:no",
  OCCITAN: "name:oc",
  PERSIAN: "name:fa",
  POLISH: "name:pl",
  PORTUGUESE: "name:pt",
  PUNJABI: "name:pa",
  WESTERN_PUNJABI: "name:pnb",
  ROMANIAN: "name:ro",
  ROMANSH: "name:rm",
  RUSSIAN: "name:ru",
  SCOTTISH_GAELIC: "name:gd",
  SERBIAN_CYRILLIC: "name:sr",
  SERBIAN_LATIN: "name:sr-Latn",
  SLOVAK: "name:sk",
  SLOVENE: "name:sl",
  SPANISH: "name:es",
  SWEDISH: "name:sv",
  TAMIL: "name:ta",
  TELUGU: "name:te",
  THAI: "name:th",
  TURKISH: "name:tr",
  UKRAINIAN: "name:uk",
  URDU: "name:ur",
  VIETNAMIAN_LATIN: "name:vi",
  WELSH: "name:cy",
} as const;

const languagesIsoSet = new Set(Object.values(Language) as Array<string>);

function isLanguageSupported(lang: string): boolean {
  return languagesIsoSet.has(lang);
}

const languageCodeSet = new Set(Object.values(Language));

/**
 * Type representing the key of the Language object
 */
type LanguageKey = keyof typeof Language;

type Values<T> = T[keyof T];

/**
 * Built-in languages values as strings
 */
type LanguageString = Values<typeof Language>;

function getBrowserLanguage(): LanguageString {
  if (typeof navigator === "undefined") {
    return `name:${
      Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0]
    }` as LanguageString;
  }

  const canditatelangs = Array.from(
    new Set(navigator.languages.map((l) => `name:${l.split("-")[0]}`)),
  ).filter((l) => languageCodeSet.has(l as LanguageString));

  return canditatelangs.length
    ? (canditatelangs[0] as LanguageString)
    : Language.LOCAL;
}

export {
  Language,
  LanguageString,
  LanguageKey,
  getBrowserLanguage,
  isLanguageSupported,
};
