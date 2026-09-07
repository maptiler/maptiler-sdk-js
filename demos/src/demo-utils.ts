import "../../dist/maptiler-sdk.css";
import { SdkConfig } from "../../src/config";
import { Marker } from "../../src/index";
import type { Map } from "../../src/index";
import Stats from "stats.js";

/** Looks up an element by id, throwing if it isn't found. */
export function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} not found`);
  return found as T;
}

/** Static caption pinned under a marker's position — always visible, unlike a hover-only `title` tooltip. */
export function addCaption(map: Map, lngLat: [number, number], text: string) {
  const captionEl = document.createElement("div");
  captionEl.textContent = text;
  captionEl.style.font = "700 10px system-ui";
  captionEl.style.letterSpacing = "0.03em";
  captionEl.style.color = "rgba(0, 0, 0, 0.75)";
  captionEl.style.background = "rgba(255, 255, 255, 0.85)";
  captionEl.style.padding = "2px 6px";
  captionEl.style.borderRadius = "4px";
  captionEl.style.whiteSpace = "nowrap";
  captionEl.style.pointerEvents = "none";

  const caption = new Marker({ element: captionEl, anchor: "top", offset: [0, 34], htmlAttributes: { tabindex: "-1" } });
  caption.setLngLat(lngLat);
  map.addMarker(caption);
}
/**
 * Adds performance statistics to the page.
 */
export function addPerformanceStats() {
  const stats = new Stats();
  stats.dom.style.top = "unset";
  stats.dom.style.bottom = "0";
  document.body.appendChild(stats.dom);

  requestAnimationFrame(function loop() {
    stats.update();
    requestAnimationFrame(loop);
  });
}

/**
 * Configures the MapTiler API key for the SDK.
 * If you don't want to use the URL parameter, you can set the key directly in the code.
 */
export function setupMapTilerApiKey({ config }: { config: SdkConfig }) {
  config.apiKey = localStorage.getItem("MT_DEMO_API_KEY") ?? "API_KEY";

  if (config.apiKey === "API_KEY") {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get("key");
    if (apiKey) {
      config.apiKey = apiKey;
      localStorage.setItem("MT_DEMO_API_KEY", apiKey);
    } else {
      const errorMessage = "MapTiler API key is missing. Please use URL `key` parameter to set it (`?key=XXXXX`).";
      alert(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
