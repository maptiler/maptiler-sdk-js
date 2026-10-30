import { resolve } from 'path';
import { defineConfig } from 'vite';
import { copyMaplibreWorker, defineBuildConstants, isProduction } from "./vite.shared";

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
  define: defineBuildConstants("umd"),
  plugins: [copyMaplibreWorker()],
});
