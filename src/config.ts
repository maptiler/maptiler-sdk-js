import { Language } from "./language";

/**
 * The config object old some values related to the user settings
 */
export interface Config {
  /**
   * Maptiler API token (sometimes calles "API key"). Default: empty.
   */
  apiKey: string;
  /**
   * If `true`, some more debuf text will show. Default: `false`
   */
  verbose: boolean;

  /**
   * The primary language, to overwrite the default language defined in the map style.
   */
  primaryLanguage: Language | null;

  /**
   * The secondary language, to overwrite the default language defined in the map style.
   * This settings is highly dependant on the style compatibility and may not work in most cases.
   */
  secondaryLanguage: Language | null;
}


const config: Config = {
  /**
   * The MapTiler Cloud API key. Get one with a free account: https://www.maptiler.com/ 
   */
  apiKey: "Not defined yet.",

  /**
   * Enable of disable the verbose mode
   */
  verbose: false,

  /**
   * The primary language. Use the `Language` enum, it's easier!
   */
  primaryLanguage: null,

  /**
   * The secondary language. Not compatible with all the styles
   */
  secondaryLanguage: null,
};

export { config };
