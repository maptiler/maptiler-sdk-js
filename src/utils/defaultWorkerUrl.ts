import { getWorkerUrl, prewarm as prewarmMLGL, setWorkerUrl } from "maplibre-gl";

/**
 * URL of the MapLibre worker published on the MapTiler CDN alongside the UMD bundle of this SDK version.
 */
export function getCdnWorkerUrl(): string {
  return `https://cdn.maptiler.com/maptiler-sdk-js/v${__MT_SDK_VERSION__}/maplibre-gl-worker.mjs`;
}

/**
 * Since MapLibre v6, the worker is loaded from a separate file that bundlers generally don't emit,
 * so in the ES build (npm) the SDK falls back to the worker hosted on the MapTiler CDN.
 * A URL set beforehand, with `setWorkerUrl` or one of the bundler helpers
 * (e.g. `@maptiler/sdk/vite-worker`), always takes precedence.
 * The UMD build keeps MapLibre's default, which finds the worker next to the UMD bundle.
 */
export function setDefaultWorkerUrl() {
  if (__MT_BUILD_FORMAT__ !== "es") return;
  if (getWorkerUrl()) return;

  setWorkerUrl(createSameOriginWorkerUrl(getCdnWorkerUrl()));
}

/**
 * Same as MapLibre's `prewarm`, but sets the default worker URL first,
 * as the workers it starts are the ones later used by the maps.
 */
export function prewarm() {
  setDefaultWorkerUrl();
  prewarmMLGL();
}

/**
 * Wraps a cross-origin worker URL in a same-origin `blob:` module that imports it.
 * MapLibre does the same for cross-origin URLs, but with `new URL(url, import.meta.url)`,
 * which webpack rewrites into a module lookup that always throws ("Cannot find module '<url>'").
 * Given a same-origin URL, MapLibre creates the worker directly and never reaches that code.
 * The worker's own imports (`./maplibre-gl-shared.mjs`) still resolve against the CDN URL.
 * The blob URL is not revoked, as MapLibre may create workers from it at any time.
 */
function createSameOriginWorkerUrl(url: string): string {
  const blob = new Blob([`import ${JSON.stringify(url)};`], { type: "text/javascript" });
  return URL.createObjectURL(blob);
}
