// Sets the MapLibre worker URL for webpack 5 / rspack projects:
//   import "@maptiler/sdk/webpack-worker";
//
// This file is shipped as is (not bundled by the SDK build) so that `new URL(..., import.meta.url)`
// is resolved by the consumer's webpack, which emits the worker file and replaces the expression with its URL.
// webpack emits only the file named here, so it points to the self-contained worker built by the SDK
// (MapLibre's worker + its shared chunk), not to MapLibre's own worker, which imports a sibling file.
// Imported from the SDK (not "maplibre-gl") so it always sets the worker URL on the MapLibre instance the SDK uses
import { setWorkerUrl } from "@maptiler/sdk";

setWorkerUrl(new URL("./maplibre-gl-worker.mjs", import.meta.url).toString());
