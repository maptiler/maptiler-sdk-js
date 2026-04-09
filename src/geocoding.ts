import * as client from "@maptiler/client";
import { config, MAPTILER_SESSION_ID } from "./config";

export type ExtraGeocodingOptions = {
  /**
   * Specifies whether the geocoding request runs with a session logic.
   * A "session" is started at the initialization of the SDK and finished when the browser
   * page is being closed or refreshed.
   * When this option is enabled, extra URL param `mtsid` is added to queries
   * to the MapTiler Cloud API. This allows MapTiler to enable "session based billing".
   *
   * Default: value of this option in global config (which is `true` by default).
   */
  session?: boolean;
};

export type LanguageGeocodingOptions = client.LanguageGeocodingOptions;
export type BaseGeocodingOptions = client.BaseGeocodingOptions & ExtraGeocodingOptions;
export type CommonForwardAndReverseGeocodingOptions = client.CommonForwardAndReverseGeocodingOptions & ExtraGeocodingOptions;
export type GeocodingOptions = client.GeocodingOptions & ExtraGeocodingOptions;
export type ReverseGeocodingOptions = client.ReverseGeocodingOptions & ExtraGeocodingOptions;
export type ByIdGeocodingOptions = client.ByIdGeocodingOptions & ExtraGeocodingOptions;

function getOptionsWithSession<O extends BaseGeocodingOptions>(options: O): O {
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

export const geocoding = {
  forward: (query: string, options: GeocodingOptions = {}) => client.geocoding.forward(query, getOptionsWithSession(options)),
  reverse: (position: client.Position, options: ReverseGeocodingOptions = {}) => client.geocoding.reverse(position, getOptionsWithSession(options)),
  byId: (id: string, options: ByIdGeocodingOptions = {}) => client.geocoding.byId(id, getOptionsWithSession(options)),
  batch: (queries: string[], options: GeocodingOptions = {}) => client.geocoding.batch(queries, getOptionsWithSession(options)),
};
