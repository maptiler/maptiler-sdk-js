import * as maplibre from "maplibre-gl";
import { config } from "./config";
import { defaults } from "./defaults";

/**
 * Prints on console only if 'verbose' mode from the config is set to true
 * @param args
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function vlog(...args: any[]) {
  if (config.verbose) {
    console.log(...args);
  }
}

export function enableRTL() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maplibrePackage = maplibre as any;
  if (maplibrePackage.getRTLTextPluginStatus() === "unavailable") {
    maplibrePackage.setRTLTextPlugin(
      defaults.rtlPluginURL,
      null,
      true // Lazy load the plugin
    );
  }
}
