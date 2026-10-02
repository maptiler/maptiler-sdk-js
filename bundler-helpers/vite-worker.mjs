// Sets the MapLibre worker URL for Vite projects:
//   import "@maptiler/sdk/vite-worker";
//
// This file is shipped as is (not bundled by the SDK build) so that the `?worker&url` import
// is resolved by the consumer's Vite, which bundles the worker and its shared chunk into one file.
// `maplibre-gl` is resolved from the SDK's own dependencies, so the worker always matches the SDK's MapLibre.
// Imported from the SDK (not "maplibre-gl") so it always sets the worker URL on the MapLibre instance the SDK uses
import { setWorkerUrl } from "@maptiler/sdk";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

setWorkerUrl(workerUrl);
