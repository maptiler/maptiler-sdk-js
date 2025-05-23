import "../../dist/maptiler-sdk.css";
import { SdkConfig } from "../../src/config";
import Stats from "stats.js";
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
