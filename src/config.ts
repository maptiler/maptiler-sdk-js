import EventEmitter from "events";
import type { LanguageInfo } from "./language";
import { config as clientConfig, type FetchFunction } from "@maptiler/client";
import { v4 as uuidv4 } from "uuid";
import type { Unit } from "./types";
import { defaults } from "./constants/defaults";

export const MAPTILER_SESSION_ID = uuidv4();

/**
 * Configuration class for the SDK
 */
class SdkConfig extends EventEmitter {
  /**
   * The primary language. By default, the language of the web browser is used.
   */
  primaryLanguage: LanguageInfo = defaults.primaryLanguage;

  /**
   * The secondary language, to overwrite the default language defined in the map style.
   * This settings is highly dependant on the style compatibility and may not work in most cases.
   */
  secondaryLanguage?: LanguageInfo;

  /**
   * Setting on whether of not the SDK runs with a session logic.
   * A "session" is started at the initialization of the SDK and finished when the browser
   * page is being closed or refreshed.
   * When `session` is enabled (default: true), the extra URL param `mtsid` is added to queries
   * to the MapTiler Cloud API. This allows MapTiler to enable "session based billing".
   */
  session = true;

  /**
   * Enables client-side caching of requests for tiles and fonts.
   * The cached requests persist multiple browser sessions and will be reused when possible.
   * Works only for requests to the MapTiler Cloud API when sessions are enabled.
   */
  caching = true;

  /**
   * Telemetry is enabled by default but can be opted-out by setting this value to `false`.
   * The telemetry is very valuable to the team at MapTiler because it shares information
   * about where to add the extra effort. It also helps spotting some incompatibility issues
   * that may arise between the SDK and a specific version of a module.
   *
   * It consists in sending metrics about usage of the following features:
   * - SDK version [string]
   * - API key [string]
   * - MapTiler sesion ID (if opted-in) [string]
   * - if tile caching is enabled [boolean]
   * - if language specified at initialization [boolean]
   * - if terrain is activated at initialization [boolean]
   * - if globe projection is activated at initialization [boolean]
   *
   * In addition, each official module will be added to a list, alongside its version number.
   */
  telemetry = true;

  /**
   * Unit to be used
   */
  private _unit: Unit = "metric";

  /**
   * MapTiler Cloud API key
   */
  private _apiKey = "";

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

  /**
   * Switch between the default `api.maptiler.com` host and the EU-based `api.maptiler.eu` host.
   * Set to `false` to switch back to the default.
   */
  set useEuEndpoints(value: boolean) {
    clientConfig.useEuEndpoints = value;
    this.emit("useEuEndpoints", value);
  }

  /**
   * Whether the EU-based `api.maptiler.eu` host is currently in use instead of the default `api.maptiler.com`
   */
  get useEuEndpoints(): boolean {
    return clientConfig.useEuEndpoints;
  }

  /**
   * The host currently used for the MapTiler API requests (`api.maptiler.com` or `api.maptiler.eu`)
   */
  get apiHost(): string {
    return clientConfig.apiHost;
  }

  /**
   * The base URL currently used for the MapTiler API requests
   * (`https://api.maptiler.com/` or `https://api.maptiler.eu/`)
   */
  get apiURL(): string {
    return clientConfig.apiURL;
  }

  /**
   * The default number of steps to sample for the experimental flyTo path preloading.
   */
  private _experimentalDefaultPathSampleSteps = 4;

  get experimental_defaultPathSampleSteps(): number {
    return this._experimentalDefaultPathSampleSteps;
  }

  set experimental_defaultPathSampleSteps(s: number) {
    this._experimentalDefaultPathSampleSteps = s;
    this.emit("experimentalDefaultPathSampleSteps", s);
  }

  private _experimentalDefaultWorkerCount = 4;

  get experimental_defaultWorkerCount(): number {
    return this._experimentalDefaultWorkerCount;
  }

  set experimental_defaultWorkerCount(w: number) {
    this._experimentalDefaultWorkerCount = w;
    this.emit("experimentalDefaultWorkerCount", w);
  }
}

const config = new SdkConfig();

export { config, SdkConfig };
