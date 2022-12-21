import EventEmitter from "events";
import { Language, LanguageString } from "./language";
import { config as clientConfig, FetchFunction } from "@maptiler/client";
import { Unit } from "./unit";

/**
 * Configuration class for the SDK
 */
class SdkConfig extends EventEmitter {
  /**
   * The primary language. By default, the language of the web browser is used.
   */
  primaryLanguage: LanguageString | null = Language.AUTO;

  /**
   * The secondary language, to overwrite the default language defined in the map style.
   * This settings is highly dependant on the style compatibility and may not work in most cases.
   */
  secondaryLanguage: LanguageString | null = null;

  /**
   * Unit to be used
   */
  private _unit: Unit = "metric";

  /**
   * MapTiler Cloud API key
   */
  private _apiKey = "";

  constructor() {
    super();
  }

  /**
   * Set the unit system
   */
  set unit(u: Unit) {
    this._unit = u;
    this.emit("unit", u);
  }

  /**
   * Get the unit system
   */
  get unit(): Unit {
    return this._unit;
  }

  /**
   * Set the MapTiler Cloud API key
   */
  set apiKey(k: string) {
    this._apiKey = k;
    clientConfig.apiKey = k;
    this.emit("apiKey", k);
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
