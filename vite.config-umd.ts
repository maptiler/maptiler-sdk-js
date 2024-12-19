import { resolve } from 'path';
import { defineConfig } from 'vite';

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
  plugins: [],
});
