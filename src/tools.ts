import maplibregl from "maplibre-gl";
import type { RequestParameters, ResourceType, RequestTransformFunction } from "maplibre-gl";
import { defaults } from "./defaults";
import { config } from "./config";
import { MAPTILER_SESSION_ID } from "./config";
import { localCacheTransformRequest } from "./caching";

export function enableRTL() {
  // Prevent this from running server side
  if (typeof window === "undefined") return;

  const status = maplibregl.getRTLTextPluginStatus();

  if (status === "unavailable" || status === "requested") {
    try {
      maplibregl.setRTLTextPlugin(defaults.rtlPluginURL, true);
    } catch (e) {
      // nothing
    }
  }
}

// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/util.ts#L223
export function bindAll(fns: Array<string>, context: any): void {
  for (const fn of fns) {
    if (typeof context[fn] !== "function") continue;
    context[fn] = context[fn].bind(context);
  }
}

// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/dom.ts#L22
export function DOMcreate<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  container?: HTMLElement,
): HTMLElementTagNameMap[K] {
  const el = window.document.createElement(tagName);
  if (className !== undefined) el.className = className;
  if (container) container.appendChild(el);
  return el;
}

// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/dom.ts#L111
export function DOMremove(node: HTMLElement) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

/**
 * This function is meant to be used as transformRequest by any Map instance created.
 * It adds the session ID as well as the MapTiler Cloud key from the config to all the requests
 * performed on MapTiler Cloud servers.
 */
export function maptilerCloudTransformRequest(url: string, resourceType?: ResourceType): RequestParameters {
  let reqUrl = null;

  try {
    // The URL is expected to be absolute.
    // Yet, if it's local we just return it without assuming a 'base' url (in the URL constructor)
    // and we let the URL be locally resolved with a potential base path.
    reqUrl = new URL(url);
  } catch (e) {
    return {
      url,
    };
  }

  if (reqUrl.host === defaults.maptilerApiHost) {
    if (!reqUrl.searchParams.has("key")) {
      reqUrl.searchParams.append("key", config.apiKey);
    }

    if (config.session) {
      reqUrl.searchParams.append("mtsid", MAPTILER_SESSION_ID);
    }
  }

  return {
    url: localCacheTransformRequest(reqUrl, resourceType),
  };
}

/**
 * This combines a user-defined tranformRequest function (optionnal)
 * with the MapTiler Cloud-specific one: maptilerCloudTransformRequest
 */
export function combineTransformRequest(userDefinedRTF?: RequestTransformFunction | null): RequestTransformFunction {
  return (url: string, resourceType?: ResourceType): RequestParameters => {
    if (userDefinedRTF !== undefined && userDefinedRTF !== null) {
      const rp = userDefinedRTF(url, resourceType);
      const rp2 = maptilerCloudTransformRequest(rp?.url ?? "", resourceType);

      return {
        ...rp,
        ...rp2,
      };
    }

    return maptilerCloudTransformRequest(url, resourceType);
  };
}

/**
 * Generate a random string. Handy to create random IDs
 */
export function generateRandomString(): string {
  return Math.random().toString(36).substring(2);
}

/**
 * Check if a given string is in a uuid format
 */
export function isUUID(s: string): boolean {
  // Regular expression to check if string is a valid UUID
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(s);
}

/**
 * Attempt a JSON parse of a string but does not throw if the string is not valid JSON, returns `null` instead.
 */
export function jsonParseNoThrow<T>(doc: string): T | null {
  try {
    return JSON.parse(doc);
  } catch (e) {
    // pass
  }

  return null;
}

/**
 * Simple function to check if an object is a GeoJSON
 */
export function isValidGeoJSON<T>(obj: T & { type: string }): boolean {
  if (typeof obj !== "object" || Array.isArray(obj) || obj === null) return false;
  if (!("type" in obj)) return false;

  const validTypes = [
    "Feature",
    "FeatureCollection",
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
    "GeometryCollection",
  ];

  if (validTypes.includes(obj.type)) return true;
  return false;
}

/**
 * This function tests if WebGL2 is supported. Since it can be for a different reasons that WebGL2 is
 * not supported but we do not have an action to take based on the reason, this function return null
 * if there is no error (WebGL is supported), or returns a string with the error message if WebGL2 is
 * not supported.
 */
export function getWebGLSupportError(): string | null {
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) {
    if (typeof WebGL2RenderingContext !== "undefined") {
      return "Graphic rendering with WebGL2 has been disabled or is not supported by your graphic card. The map cannot be displayed.";
    }
    return "Your browser does not support graphic rendering with WebGL2. The map cannot be displayed.";
  }
  return null;
}

/**
 * Display an error message in the Map div if WebGL2 is not supported
 */
export function displayNoWebGlWarning(container: HTMLElement | string) {
  const webglError = getWebGLSupportError();

  if (!webglError) return;

  let actualContainer: HTMLElement | null = null;

  if (typeof container === "string") {
    actualContainer = document.getElementById(container);
  } else if (container instanceof HTMLElement) {
    actualContainer = container;
  }

  if (!actualContainer) {
    throw new Error("The Map container must be provided.");
  }

  const errorMessageDiv = document.createElement("div");
  errorMessageDiv.innerHTML = webglError;
  errorMessageDiv.classList.add("no-webgl-support-div");
  actualContainer.appendChild(errorMessageDiv);
  throw new Error(webglError);
}
