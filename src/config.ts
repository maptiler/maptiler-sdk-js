import { Language } from "./language";
import { config as clientConfig, FetchFunction } from "@maptiler/client";

/**
 * Configuration class for the SDK
 */
class SdkConfig {
  /**
   * If `true`, some more debuf text will show. Default: `false`
   */
  verbose = false;

  /**
   * The primary language, to overwrite the default language defined in the map style.
   */
  primaryLanguage: Language | null = null;

  /**
   * The secondary language, to overwrite the default language defined in the map style.
   * This settings is highly dependant on the style compatibility and may not work in most cases.
   */
  secondaryLanguage: Language | null = null;

  /**
   * MapTiler Cloud API key
   */
  private _apiKey = "Not defined yet.";

  /**
   * Set the MapTiler Cloud API key
   */
  set apiKey(k: string) {
    this._apiKey = k;
    clientConfig.apiKey = k;
  }

  /**
   * Get the MapTiler Cloud API key
   */
  get apiKey(): string {
    return this._apiKey;
  }

  /**
   * Set a the custom fetch function to replace the default one
   */
  set fetch(f: FetchFunction) {
    clientConfig.fetch = f;
  }

  /**
   * Get the fetch fucntion
   */
  get fetch(): FetchFunction | null {
    return clientConfig.fetch;
  }
}

const config = new SdkConfig();

export { config, SdkConfig };
