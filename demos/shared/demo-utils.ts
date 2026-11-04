import "../../dist/maptiler-sdk.css";
import { Marker } from "@maptiler/sdk";
import type { Map, SdkConfig } from "@maptiler/sdk";
import Stats from "stats.js";
import { getDockSlot } from "./dock";

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
 * Adds performance statistics to the dock at the top left of the page.
 */
export function addPerformanceStats() {
  const stats = new Stats();
  // stats.js pins itself to the top left corner, the dock places it instead
  stats.dom.style.position = "static";
  getDockSlot("stats").appendChild(stats.dom);

  requestAnimationFrame(function loop() {
    stats.update();
    requestAnimationFrame(loop);
  });
}

/**
 * Configures the MapTiler API key for the SDK, from the first of:
 * - `MAPTILER_API_KEY` at the top of the demo
 * - `VITE_MAPTILER_API_KEY` in `.env.local` at the root of the repo, also stored in the browser if no key is yet
 * - the key stored in the browser
 * - the `key` URL parameter, also stored in the browser
 */
export function setupMapTilerApiKey({ config, apiKey: demoApiKey }: { config: SdkConfig; apiKey: string }) {
  // Not typed through `vite/client`, as its global declarations would change how `src` type-checks
  const envApiKey = (import.meta as ImportMeta & { env: { VITE_MAPTILER_API_KEY?: string } }).env.VITE_MAPTILER_API_KEY;
  if (envApiKey && !localStorage.getItem("MT_DEMO_API_KEY")) {
    localStorage.setItem("MT_DEMO_API_KEY", envApiKey);
  }

  config.apiKey = demoApiKey !== "API_KEY" ? demoApiKey : (envApiKey ?? localStorage.getItem("MT_DEMO_API_KEY") ?? "API_KEY");

  if (config.apiKey === "API_KEY") {
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get("key");
    if (apiKey) {
      config.apiKey = apiKey;
      localStorage.setItem("MT_DEMO_API_KEY", apiKey);
    } else {
      const errorMessage =
        "MapTiler API key is missing. Please set `VITE_MAPTILER_API_KEY` in `.env.local` at the root of the repo, or use URL `key` parameter to set it (`?key=XXXXX`).";
      alert(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
