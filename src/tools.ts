import * as maplibre from "maplibre-gl";
import { config } from "./config";
import { defaults } from "./defaults";

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
