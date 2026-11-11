import { resolve } from 'path';
import { copyFileSync } from 'fs';
import packagejson from "./package.json";

export const isProduction = process.env.NODE_ENV === "production";

/**
 * Compile-time constants declared in `src/declarations.d.ts`, shared by all the build configs
 * so a new constant can't be forgotten in one of the bundles.
 * `format` is the build the code is part of, see `__MT_BUILD_FORMAT__`.
 */
export function defineBuildConstants(format: "es" | "umd" | "esm-cdn" | "dev") {
  return {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
    __MT_BUILD_FORMAT__: JSON.stringify(format),
    __MT_NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
  };
}

// Since v6, MapLibre loads its worker as a separate ES module, resolved relative to the script that
// loaded MapLibre (here, the CDN bundles), and the worker itself imports the shared chunk.
// Both files must therefore be shipped (and served from the CDN) next to `maptiler-sdk.umd.min.js` and `maptiler-sdk.min.mjs`.
const MAPLIBRE_WORKER_FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

export function copyMaplibreWorker() {
  return {
    name: 'copy-maplibre-worker',
    writeBundle() {
      for (const file of MAPLIBRE_WORKER_FILES) {
        copyFileSync(resolve(import.meta.dirname, 'node_modules/maplibre-gl/dist', file), resolve(import.meta.dirname, 'build', file));
      }
    }
  }
}
