import maplibregl from "maplibre-gl";
import type { RequestParameters, ResourceType, RequestTransformFunction, SymbolLayerSpecification } from "maplibre-gl";
import { defaults } from "./defaults";
import { config } from "./config";
import { MAPTILER_SESSION_ID } from "./config";
import { localCacheTransformRequest } from "./caching";
import type { Map as MapSDK } from "./Map";

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
export function DOMcreate<K extends keyof HTMLElementTagNameMap>(tagName: K, className?: string, container?: HTMLElement): HTMLElementTagNameMap[K] {
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

  const localCacheTransformedReq = localCacheTransformRequest(reqUrl, resourceType);

  return {
    url: localCacheTransformedReq,
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

  const validTypes = ["Feature", "FeatureCollection", "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"];

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
  errorMessageDiv.classList.add("webgl-warning-div");
  actualContainer.appendChild(errorMessageDiv);
  throw new Error(webglError);
}

/**
 * Display a warning message in the Map div if the WebGL context was lost
 */
export function displayWebGLContextLostWarning(map: MapSDK) {
  const webglError = "The WebGL context was lost.";
  const container: HTMLElement = map.getContainer();
  const errorMessageDiv = document.createElement("div");
  errorMessageDiv.innerHTML = webglError;
  errorMessageDiv.classList.add("webgl-warning-div");
  container.appendChild(errorMessageDiv);
}

/**
 * Return true if the provided piece of style expression has the form ["get", "name:XX"]
 * with XX being a 2-letter is code for languages
 */
function isGetNameLanguage(subExpr: unknown, localized: boolean): boolean {
  if (!Array.isArray(subExpr)) return false;
  if (subExpr.length !== 2) return false;
  if (subExpr[0] !== "get") return false;
  if (typeof subExpr[1] !== "string") return false;
  if (localized && !subExpr[1].startsWith("name:")) return false;
  if (!localized && subExpr[1] !== "name") return false;

  return true;
}

/**
 * In a text-field style property (as an object, not a string) the languages that are specified as
 * ["get", "name:XX"] are replaced by the proved replacer (also an object).
 * This replacement happened regardless of how deep in the object the flag is.
 * Note that it does not replace the occurences of ["get", "name"] (local names)
 */
export function changeFirstLanguage(
  origExpr: maplibregl.ExpressionSpecification,
  replacer: maplibregl.ExpressionSpecification,
  localized: boolean,
): maplibregl.ExpressionSpecification {
  const expr = structuredClone(origExpr) as maplibregl.ExpressionSpecification;

  const exploreNode = (subExpr: maplibregl.ExpressionSpecification | string) => {
    if (typeof subExpr === "string") return;

    for (let i = 0; i < subExpr.length; i += 1) {
      if (isGetNameLanguage(subExpr[i], localized)) {
        subExpr[i] = structuredClone(replacer);
      } else {
        exploreNode(subExpr[i] as maplibregl.ExpressionSpecification | string);
      }
    }
  };

  // The provided expression could be directly a ["get", "name:xx"]
  if (isGetNameLanguage(expr, localized)) {
    return replacer;
  }

  exploreNode(expr);
  return expr;
}

/**
 * If `localized` is `true`, it checks for the pattern "{name:xx}" (with "xx" being a language iso string).
 * If `localized` is `false`, it check for {name}.
 * In a exact way or is a loose way (such as "foo {name:xx}" or "foo {name} bar")
 */
export function checkNamePattern(str: string, localized: boolean): { contains: boolean; exactMatch: boolean } {
  const regex = localized ? /\{name:\S+\}/ : /\{name\}/;
  return {
    contains: regex.test(str),
    exactMatch: new RegExp(`^${regex.source}$`).test(str),
  };
}

/**
 * Replaces the occurences of {name:xx} in a string by a provided object-expression to return a concat object expression
 */
export function replaceLanguage(origLang: string, newLang: maplibregl.ExpressionSpecification, localized: boolean): maplibregl.ExpressionSpecification {
  const regex = localized ? /\{name:\S+\}/ : /\{name\}/;
  const elementsToConcat = origLang.split(regex);

  const allElements = elementsToConcat.flatMap((item, i) => (i === elementsToConcat.length - 1 ? [item] : [item, newLang]));

  const expr = ["concat", ...allElements] as maplibregl.ExpressionSpecification;
  return expr;
}

/**
 * Find languages used in string label definition.
 * The returned array contains languages such as "en", "fr" but
 * can also contain null that stand for the use of {name}
 */
export function findLanguageStr(str: string): Array<string | null> {
  const regex = /\{name(?:\:(?<language>\S+))?\}/g;
  const languageUsed = [] as Array<string | null>;

  while (true) {
    const match = regex.exec(str);
    if (!match) break;

    // The is a match
    const language = match.groups?.language ?? null;

    // The language is non-null if provided {name:xx}
    // but if provided {name} then language will be null
    languageUsed.push(language);
  }
  return languageUsed;
}

function isGetNameLanguageAndFind(subExpr: unknown): { isLanguage: boolean; localization: string | null } | null {
  // Not language expression
  if (!Array.isArray(subExpr)) return null;
  if (subExpr.length !== 2) return null;
  if (subExpr[0] !== "get") return null;
  if (typeof subExpr[1] !== "string") return null;

  // Is non localized language
  if (subExpr[1].trim() === "name") {
    return {
      isLanguage: true,
      localization: null,
    };
  }

  // Is a localized language
  if (subExpr[1].trim().startsWith("name:")) {
    return {
      isLanguage: true,
      localization: subExpr[1].trim().split(":").pop()!,
    };
  }

  return null;
}

/**
 * Find languages used in object label definition.
 * The returned array contains languages such as "en", "fr" but
 * can also contain null that stand for the use of {name}
 */
export function findLanguageObj(origExpr: maplibregl.ExpressionSpecification): Array<string | null> {
  const languageUsed = [] as Array<string | null>;
  const expr = structuredClone(origExpr) as maplibregl.ExpressionSpecification;

  const exploreNode = (subExpr: maplibregl.ExpressionSpecification | string | Array<maplibregl.ExpressionSpecification | string>) => {
    if (typeof subExpr === "string") return;

    for (let i = 0; i < subExpr.length; i += 1) {
      const result = isGetNameLanguageAndFind(subExpr[i]);
      if (result) {
        languageUsed.push(result.localization);
      } else {
        exploreNode(subExpr[i] as maplibregl.ExpressionSpecification | string);
      }
    }
  };

  exploreNode([expr]);
  return languageUsed;
}

export function computeLabelsLocalizationMetrics(layers: maplibregl.LayerSpecification[], map: MapSDK): { unlocalized: number; localized: Record<string, number> } {
  const languages: Array<string | null>[] = [];

  for (const genericLayer of layers) {
    // Only symbole layer can have a layout with text-field
    if (genericLayer.type !== "symbol") {
      continue;
    }

    const layer = genericLayer as SymbolLayerSpecification;
    const { id, layout } = layer;

    if (!layout) {
      continue;
    }

    if (!("text-field" in layout)) {
      continue;
    }

    const textFieldLayoutProp: string | maplibregl.ExpressionSpecification = map.getLayoutProperty(id, "text-field");

    if (!textFieldLayoutProp) {
      continue;
    }

    if (typeof textFieldLayoutProp === "string") {
      const l = findLanguageStr(textFieldLayoutProp);
      languages.push(l);
    } else {
      const l = findLanguageObj(textFieldLayoutProp);
      languages.push(l);
    }
  }

  const flatLanguages = languages.flat();
  const localizationMetrics: {
    unlocalized: number;
    localized: Record<string, number>;
  } = {
    unlocalized: 0,
    localized: {},
  };

  for (const lang of flatLanguages) {
    if (lang === null) {
      localizationMetrics.unlocalized += 1;
    } else {
      if (!(lang in localizationMetrics.localized)) {
        localizationMetrics.localized[lang] = 0;
      }
      localizationMetrics.localized[lang] += 1;
    }
  }
  return localizationMetrics;
}
