import { resolve } from 'path';
import { defineConfig } from 'vite';

console.log(">>>>> process.env.NODE_ENV", process.env.NODE_ENV);


const isProduction = process.env.NODE_ENV === "production";

const plugins = [];


export default defineConfig({
  mode: isProduction ? "production" : "development",
  build: {
    outDir: "build",
    minify: isProduction,
    emptyOutDir: isProduction,
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'maptilersdk',
      // the proper extensions will be added
      fileName: (format, entryName) => "maptiler-sdk.umd.js",
      formats: ['umd'],
    }
  },
  plugins,
})