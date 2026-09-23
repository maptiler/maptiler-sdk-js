import { default as EventEmitter } from 'events';
import { LanguageInfo } from './language';
import { FetchFunction } from '@maptiler/client';
import { Unit } from './types';
export declare const MAPTILER_SESSION_ID: string;
/**
 * Configuration class for the SDK
 */
declare class SdkConfig extends EventEmitter {
    /**
     * The primary language. By default, the language of the web browser is used.
     */
    primaryLanguage: LanguageInfo;
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
    session: boolean;
    /**
     * Enables client-side caching of requests for tiles and fonts.
     * The cached requests persist multiple browser sessions and will be reused when possible.
     * Works only for requests to the MapTiler Cloud API when sessions are enabled.
     */
    caching: boolean;
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
    telemetry: boolean;
    /**
     * Unit to be used
     */
    private _unit;
    /**
     * MapTiler Cloud API key
     */
    private _apiKey;
    /**
     * Set the unit system
     */
    set unit(u: Unit);
    /**
     * Get the unit system
     */
    get unit(): Unit;
    /**
     * Set the MapTiler Cloud API key
     */
    set apiKey(k: string);
    /**
     * Get the MapTiler Cloud API key
     */
    get apiKey(): string;
    /**
     * Set a the custom fetch function to replace the default one
     */
    set fetch(f: FetchFunction);
    /**
     * Get the fetch fucntion
     */
    get fetch(): FetchFunction | null;
    /**
     * The default number of steps to sample for the experimental flyTo path preloading.
     */
    private _experimentalDefaultPathSampleSteps;
    get experimental_defaultPathSampleSteps(): number;
    set experimental_defaultPathSampleSteps(s: number);
    private _experimentalDefaultWorkerCount;
    get experimental_defaultWorkerCount(): number;
    set experimental_defaultWorkerCount(w: number);
}
declare const config: SdkConfig;
export { config, SdkConfig };
