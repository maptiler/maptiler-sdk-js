import { languages } from "./languages";

/**
 * The config object old some values related to the user settings
 */
export interface Config {
  /**
   * Maptiler API token (sometimes calles "API key"). Default: empty.
   */
  apiToken: string;
  /**
   * If `true`, some more debuf text will show. Default: `false`
   */
  verbose: boolean;

  /**
   * The primary language, to overwrite the default language defined in the map style.
   */
  primaryLanguage: languages | null;

  /**
   * The secondary language, to overwrite the default language defined in the map style.
   * This settings is highly dependant on the style compatibility and may not work in most cases.
   */
  secondaryLanguage: languages | null;
}

const config: Config = {
  apiToken: "Not defined yet.",
  verbose: false,
  primaryLanguage: null,
  secondaryLanguage: null,
};

export { config };
