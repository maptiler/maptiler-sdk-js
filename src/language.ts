/**
 * Languages. Note that not all the languages of this list are available but the compatibility list may be expanded in the future.
 */
const Language = {
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
  BOSNIAN: "bs",
  BRETON: "br",
  BULGARIAN: "bg",
  CATALAN: "ca",
  CHINESE: "zh",
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
  POLISH: "pl",
  PORTUGUESE: "pt",
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
    new Set(navigator.languages.map((l) => l.split("-")[0]))
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
