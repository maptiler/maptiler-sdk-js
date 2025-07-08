import type { Map as MapSDK } from "./Map";
import { config, MAPTILER_SESSION_ID } from "./config";
import { defaults } from "./constants/defaults";
import packagejson from "../package.json";

/**
 * A Telemetry instance sends some usage and merics to a dedicated endpoint at MapTiler Cloud.
 */
export class Telemetry {
  private map: MapSDK;
  private registeredModules = new Set<string>();
  private viewerType: string;

  /**
   *
   * @param map : a Map instance
   * @param delay : a delay in milliseconds after which the payload is sent to MapTiler cloud (cannot be less than 1000ms)
   */
  constructor(map: MapSDK, delay: number = 2000) {
    this.map = map;

    this.viewerType = "Map";

    setTimeout(
      async () => {
        if (!config.telemetry) {
          return;
        }
        const endpointURL = this.preparePayload();

        try {
          const response = await fetch(endpointURL, { method: "POST" });
          if (!response.ok) {
            console.warn("The metrics could not be sent to MapTiler Cloud");
          }
        } catch (e) {
          console.warn("The metrics could not be sent to MapTiler Cloud", e);
        }
      },
      Math.max(1000, delay),
    );
  }

  /**
   * Register a module to the telemetry system of the SDK.
   * The arguments `name` and `version` likely come from the package.json
   * of each module.
   */
  registerModule(name: string, version: string) {
    // The telemetry is using a Set (and not an array) to avoid duplicates
    // of same module + same version. Yet we want to track is the same module
    // is being used with multiple version in a given project as this
    // could be a source of incompatibility
    this.registeredModules.add(`${name}:${version}`);
  }

  registerViewerType(viewerType: string = "Map") {
    this.viewerType = viewerType;
  }

  private preparePayload(): string {
    const telemetryUrl = new URL(defaults.telemetryURL);

    // Adding the version of the SDK
    telemetryUrl.searchParams.append("sdk", packagejson.version);

    // Adding the API key
    telemetryUrl.searchParams.append("key", config.apiKey);

    // Adding MapTiler Cloud session ID
    telemetryUrl.searchParams.append("mtsid", MAPTILER_SESSION_ID);

    // Is the app using session?
    telemetryUrl.searchParams.append("session", config.session ? "1" : "0");

    // Is the app using tile caching?
    telemetryUrl.searchParams.append("caching", config.caching ? "1" : "0");

    // Is the langauge updated from the original style?
    telemetryUrl.searchParams.append("lang-updated", this.map.isLanguageUpdated() ? "1" : "0");

    // Is terrain enabled?
    telemetryUrl.searchParams.append("terrain", this.map.getTerrain() ? "1" : "0");

    // Is globe enabled?
    telemetryUrl.searchParams.append("globe", this.map.isGlobeProjection() ? "1" : "0");

    // Is this a stadnard map or a different viewer?
    telemetryUrl.searchParams.append("viewerType", this.viewerType);

    // Adding the modules
    // the list of modules are separated by a "|". For each module, a ":" is used to separate the name and the version:
    // "@maptiler/module-foo:1.1.0|@maptiler/module-bar:3.4.0|@maptiler/module-baz:9.0.3|@maptiler/module-quz:0.0.2-rc.1"
    // then the `.append()` function is in charge of URL-encoding the argument
    if (this.registeredModules.size > 0) {
      telemetryUrl.searchParams.append("modules", Array.from(this.registeredModules).join("|"));
    }

    return telemetryUrl.href;
  }
}
