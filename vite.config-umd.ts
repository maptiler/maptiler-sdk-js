import { resolve } from 'path';
import { copyFileSync } from 'fs';
import { defineConfig } from 'vite';
import packagejson from "./package.json";

// Since v6, MapLibre loads its worker as a separate ES module, resolved relative to the script that
// loaded MapLibre (here, the UMD bundle), and the worker itself imports the shared chunk.
// Both files must therefore be shipped (and served from the CDN) next to `maptiler-sdk.umd.min.js`.
const MAPLIBRE_WORKER_FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

function copyMaplibreWorker() {
  return {
    name: 'copy-maplibre-worker',
    writeBundle() {
      for (const file of MAPLIBRE_WORKER_FILES) {
        copyFileSync(resolve(import.meta.dirname, 'node_modules/maplibre-gl/dist', file), resolve(import.meta.dirname, 'build', file));
      }
    }
  }
}

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  mode: isProduction ? "production" : "development",
  build: {
    outDir: "build",
    minify: true,
    emptyOutDir: isProduction,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'maptilersdk',
      fileName: (_, __) => "maptiler-sdk.umd.min.js",
      formats: ['umd'],
    }
  },
  define: {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
    __MT_BUILD_FORMAT__: JSON.stringify("umd"),
    __MT_NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
  },
  plugins: [copyMaplibreWorker()],
});
