import { resolve } from 'path';
import { defineConfig, transformWithEsbuild } from 'vite';
import packagejson from "./package.json";
import { copyMaplibreWorker } from "./vite.shared";

// Self-contained ES build for the CDN: unlike the npm ES build, all dependencies (MapLibre included) are bundled,
// so it can be imported straight from a browser. As with the UMD build, MapLibre resolves its worker relative
// to this file, so `maplibre-gl-worker.mjs` and `maplibre-gl-shared.mjs` are copied next to it.
const isProduction = process.env.NODE_ENV === "production";

// In library mode, Vite leaves whitespace and comments in ES output to keep it tree-shakable by the consumer's bundler.
// This file is served as is, so it is fully minified instead, after Vite's own (partial) minification.
function minifyEsBundle() {
  return {
    name: 'minify-es-bundle',
    renderChunk: {
      order: 'post' as const,
      handler(code: string, chunk: { fileName: string }) {
        return transformWithEsbuild(code, chunk.fileName, { minify: true, format: 'esm', sourcemap: true });
      },
    },
  }
}

export default defineConfig({
  mode: isProduction ? "production" : "development",
  build: {
    outDir: "build",
    minify: true,
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: (_, __) => "maptiler-sdk.min.mjs",
      formats: ['es'],
    }
  },
  define: {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
    __MT_BUILD_FORMAT__: JSON.stringify("esm-cdn"),
    __MT_NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
  },
  plugins: [minifyEsBundle(), copyMaplibreWorker()],
});
