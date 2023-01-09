import maplibregl from "maplibre-gl";
import { defaults } from "./defaults";

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
