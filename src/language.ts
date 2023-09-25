/**
 * Languages. Note that not all the languages of this list are available but the compatibility list may be expanded in the future.
 */
const Language = {
  /**
   * The visitor language mode concatenates the prefered language from the user settings and the "defaul name".
   * Note: The "default name" is equivalent to OSM's `{name}`, which can be the most recognized names a global
   * scale or the local name.
   * This mode is helpful in the context where a user needs to access both the local names and the names in their
   * own language, for instance when traveling abroad, where signs likely to be only available in the local language.
   */
  VISITOR: "visitor",

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
  LATIN: "latin",

  /**
   * Default fallback languages that uses non-latin charaters
   */
  NON_LATIN: "nonlatin",

  /**
   * Labels are in their local language, when available
   */
  LOCAL: "",

  ALBANIAN: "sq",
  AMHARIC: "am",
  ARABIC: "ar",
  ARMENIAN: "hy",
  AZERBAIJANI: "az",
  BASQUE: "eu",
  BELORUSSIAN: "be",
  BENGALI: "bn",
  BOSNIAN: "bs",
  BRETON: "br",
  BULGARIAN: "bg",
  CATALAN: "ca",
  CHINESE: "zh",
  TRADITIONAL_CHINESE: "zh-Hant",
  SIMPLIFIED_CHINESE: "zh-Hans",
  CORSICAN: "co",
  CROATIAN: "hr",
  CZECH: "cs",
  DANISH: "da",
  DUTCH: "nl",
  ENGLISH: "en",
  ESPERANTO: "eo",
  ESTONIAN: "et",
  FINNISH: "fi",
  FRENCH: "fr",
  FRISIAN: "fy",
  GEORGIAN: "ka",
  GERMAN: "de",
  GREEK: "el",
  HEBREW: "he",
  HINDI: "hi",
  HUNGARIAN: "hu",
  ICELANDIC: "is",
  INDONESIAN: "id",
  IRISH: "ga",
  ITALIAN: "it",
  JAPANESE: "ja",
  JAPANESE_HIRAGANA: "ja-Hira",
  JAPANESE_KANA: "ja_kana",
  JAPANESE_LATIN: "ja_rm",
  JAPANESE_2018: "ja-Latn",
  KANNADA: "kn",
  KAZAKH: "kk",
  KOREAN: "ko",
  KOREAN_LATIN: "ko-Latn",
  KURDISH: "ku",
  ROMAN_LATIN: "la",
  LATVIAN: "lv",
  LITHUANIAN: "lt",
  LUXEMBOURGISH: "lb",
  MACEDONIAN: "mk",
  MALAYALAM: "ml",
  MALTESE: "mt",
  NORWEGIAN: "no",
  OCCITAN: "oc",
  PERSIAN: "fa",
  POLISH: "pl",
  PORTUGUESE: "pt",
  PUNJABI: "pa",
  WESTERN_PUNJABI: "pnb",
  ROMANIAN: "ro",
  ROMANSH: "rm",
  RUSSIAN: "ru",
  SCOTTISH_GAELIC: "gd",
  SERBIAN_CYRILLIC: "sr",
  SERBIAN_LATIN: "sr-Latn",
  SLOVAK: "sk",
  SLOVENE: "sl",
  SPANISH: "es",
  SWEDISH: "sv",
  TAMIL: "ta",
  TELUGU: "te",
  THAI: "th",
  TURKISH: "tr",
  UKRAINIAN: "uk",
  URDU: "ur",
  VIETNAMIAN_LATIN: "vi",
  WELSH: "cy",
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
    return Intl.DateTimeFormat()
      .resolvedOptions()
      .locale.split("-")[0] as LanguageString;
  }

  const canditatelangs = Array.from(
    new Set(navigator.languages.map((l) => l.split("-")[0])),
  ).filter((l) => languageCodeSet.has(l as LanguageString));

  return canditatelangs.length
    ? (canditatelangs[0] as LanguageString)
    : Language.LATIN;
}

export {
  Language,
  LanguageString,
  LanguageKey,
  getBrowserLanguage,
  isLanguageSupported,
};
