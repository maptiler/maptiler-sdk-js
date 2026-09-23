import { LanguageInfo } from '@maptiler/client';
declare const Language: {
    readonly ALBANIAN: LanguageInfo;
    readonly AMHARIC: LanguageInfo;
    readonly ARABIC: LanguageInfo;
    readonly ARMENIAN: LanguageInfo;
    readonly AZERBAIJANI: LanguageInfo;
    readonly BASQUE: LanguageInfo;
    readonly BELARUSIAN: LanguageInfo;
    readonly BENGALI: LanguageInfo;
    readonly BOSNIAN: LanguageInfo;
    readonly BRETON: LanguageInfo;
    readonly BULGARIAN: LanguageInfo;
    readonly CATALAN: LanguageInfo;
    readonly CHINESE: LanguageInfo;
    readonly TRADITIONAL_CHINESE: LanguageInfo;
    readonly SIMPLIFIED_CHINESE: LanguageInfo;
    readonly CORSICAN: LanguageInfo;
    readonly CROATIAN: LanguageInfo;
    readonly CZECH: LanguageInfo;
    readonly DANISH: LanguageInfo;
    readonly DUTCH: LanguageInfo;
    readonly GERMAN: LanguageInfo;
    readonly GREEK: LanguageInfo;
    readonly ENGLISH: LanguageInfo;
    readonly ESPERANTO: LanguageInfo;
    readonly ESTONIAN: LanguageInfo;
    readonly FINNISH: LanguageInfo;
    readonly FRENCH: LanguageInfo;
    readonly FRISIAN: LanguageInfo;
    readonly GEORGIAN: LanguageInfo;
    readonly HEBREW: LanguageInfo;
    readonly HINDI: LanguageInfo;
    readonly HUNGARIAN: LanguageInfo;
    readonly ICELANDIC: LanguageInfo;
    readonly INDONESIAN: LanguageInfo;
    readonly IRISH: LanguageInfo;
    readonly ITALIAN: LanguageInfo;
    readonly JAPANESE: LanguageInfo;
    readonly JAPANESE_HIRAGANA: LanguageInfo;
    readonly JAPANESE_2018: LanguageInfo;
    readonly JAPANESE_KANA: LanguageInfo;
    readonly JAPANESE_LATIN: LanguageInfo;
    readonly KANNADA: LanguageInfo;
    readonly KAZAKH: LanguageInfo;
    readonly KOREAN: LanguageInfo;
    readonly KOREAN_LATIN: LanguageInfo;
    readonly KURDISH: LanguageInfo;
    readonly CLASSICAL_LATIN: LanguageInfo;
    readonly LATVIAN: LanguageInfo;
    readonly LITHUANIAN: LanguageInfo;
    readonly LUXEMBOURGISH: LanguageInfo;
    readonly MACEDONIAN: LanguageInfo;
    readonly MALAYALAM: LanguageInfo;
    readonly MALTESE: LanguageInfo;
    readonly NORWEGIAN: LanguageInfo;
    readonly OCCITAN: LanguageInfo;
    readonly PERSIAN: LanguageInfo;
    readonly POLISH: LanguageInfo;
    readonly PORTUGUESE: LanguageInfo;
    readonly PUNJABI: LanguageInfo;
    readonly WESTERN_PUNJABI: LanguageInfo;
    readonly ROMANIAN: LanguageInfo;
    readonly ROMANSH: LanguageInfo;
    readonly RUSSIAN: LanguageInfo;
    readonly SERBIAN_CYRILLIC: LanguageInfo;
    readonly SERBIAN_LATIN: LanguageInfo;
    readonly SCOTTISH_GAELIC: LanguageInfo;
    readonly SLOVAK: LanguageInfo;
    readonly SLOVENE: LanguageInfo;
    readonly SPANISH: LanguageInfo;
    readonly SWEDISH: LanguageInfo;
    readonly TAMIL: LanguageInfo;
    readonly TELUGU: LanguageInfo;
    readonly THAI: LanguageInfo;
    readonly TURKISH: LanguageInfo;
    readonly UKRAINIAN: LanguageInfo;
    readonly VIETNAMESE: LanguageInfo;
    readonly WELSH: LanguageInfo;
    readonly AUTO: LanguageInfo;
    readonly LATIN: LanguageInfo;
    readonly NON_LATIN: LanguageInfo;
    readonly LOCAL: LanguageInfo;
    /**
     * Language mode to display labels in both the local language and the language of the visitor's device, concatenated.
     * Note that if those two languages are the same, labels won't be duplicated.
     */
    readonly VISITOR: LanguageInfo;
    /**
     * Language mode to display labels in both the local language and English, concatenated.
     * Note that if those two languages are the same, labels won't be duplicated.
     */
    readonly VISITOR_ENGLISH: LanguageInfo;
    /**
     * Language mode to display labels in a language enforced in the style.
     */
    readonly STYLE: LanguageInfo;
    /**
     * Language mode to display labels in a language enforced in the style. The language cannot be further modified.
     */
    readonly STYLE_LOCK: LanguageInfo;
};
/**
 * Get the browser language
 */
export declare function getBrowserLanguage(): LanguageInfo;
export { Language, type LanguageInfo };
