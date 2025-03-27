import { resolve } from 'path';
import { defineConfig } from 'vite';
import packagejson from "./package.json";

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
      fileName: (format, entryName) => "maptiler-sdk.umd.min.js",
      formats: ['umd'],
    }
  },
  define: {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
  },
  plugins: [],
});
