import { resolve } from 'path';
import { copyFileSync } from 'fs';

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
