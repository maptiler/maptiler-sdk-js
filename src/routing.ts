import * as client from "@maptiler/client";
import { config, MAPTILER_SESSION_ID } from "./config";

export type ExtraRoutingOptions = {
  /**
   * Specifies whether the routing request runs with a session logic.
   * A "session" is started at the initialization of the SDK and finished when the browser
   * page is being closed or refreshed.
   * When this option is enabled, extra URL param `mtsid` is added to queries
   * to the MapTiler Cloud API. This allows MapTiler to enable "session based billing".
   *
   * Default: value of this option in global config (which is `true` by default).
   */
  session?: boolean;
};

export type RoutingOptions = client.RoutingOptions & ExtraRoutingOptions;

function getOptionsWithSession<O extends RoutingOptions>(options: O): O {
  options = { ...options };

  if (config.session ? options.session !== false : options.session === true) {
    const originalAdjustSearchParams = options.adjustSearchParams;
    options.adjustSearchParams = (searchParams: URLSearchParams) => {
      if (typeof originalAdjustSearchParams === "function") {
        originalAdjustSearchParams(searchParams);
      }

      searchParams.append("mtsid", MAPTILER_SESSION_ID);
    };
  }
  delete options.session;

  return options;
}

export const routing = {
  directionsPost: (body: client.RoutingRequest, options: RoutingOptions = {}) => client.routing.directionsPost(body, getOptionsWithSession(options)),
  directionsGet: (req: client.RoutingRequest, options: RoutingOptions = {}) => client.routing.directionsGet(req, getOptionsWithSession(options)),
};
