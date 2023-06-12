import maplibregl from "maplibre-gl";
import type {
  RequestParameters,
  ResourceType,
  RequestTransformFunction,
} from "maplibre-gl";
import { defaults } from "./defaults";
import { config } from "./config";
import { MAPTILER_SESSION_ID } from "./config";

export function enableRTL() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (maplibregl.getRTLTextPluginStatus() === "unavailable") {
    maplibregl.setRTLTextPlugin(
      defaults.rtlPluginURL,
      null,
      true // Lazy load the plugin
    );
  }
}

// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/util.ts#L223
export function bindAll(fns: Array<string>, context: any): void {
  fns.forEach((fn) => {
    if (!context[fn]) {
      return;
    }
    context[fn] = context[fn].bind(context);
  });
}

// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/dom.ts#L22
export function DOMcreate<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  container?: HTMLElement
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
 * @param url
 * @param resourceType
 * @returns
 */
export function maptilerCloudTransformRequest(
  url: string,
  resourceType?: ResourceType
): RequestParameters {
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
    url: reqUrl.href,
  };
}

/**
 * This combines a user-defined tranformRequest function (optionnal)
 * with the MapTiler Cloud-specific one: maptilerCloudTransformRequest
 * @param userDefinedRTF
 * @returns
 */
export function combineTransformRequest(
  userDefinedRTF: RequestTransformFunction = null
): RequestTransformFunction {
  return function (
    url: string,
    resourceType?: ResourceType
  ): RequestParameters {
    if (userDefinedRTF) {
      const rp = userDefinedRTF(url, resourceType);
      const rp2 = maptilerCloudTransformRequest(rp.url);

      return {
        ...rp,
        ...rp2,
      };
    } else {
      return maptilerCloudTransformRequest(url);
    }
  };
}
