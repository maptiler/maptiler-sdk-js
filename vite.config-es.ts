import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import packagejson from "./package.json";
import { copyFileSync } from 'fs';

const isProduction = process.env.NODE_ENV === "production";

function copyLinterConfig() {
  return {
    name: 'copy-linter-config',
    writeBundle() {
      const sourcePath = resolve(import.meta.dirname, 'eslint.config.mjs');
      const destPath = resolve(import.meta.dirname, 'dist/eslint.mjs');
      console.log(`Copying ${sourcePath} to ${destPath}`);
      copyFileSync(sourcePath, destPath);
    }
  }
}

const plugins = [
  dts({insertTypesEntry: true}),
  copyLinterConfig(),
];

export default defineConfig({
  mode: isProduction ? "production" : "development",
  build: {
    minify: isProduction,
    emptyOutDir: isProduction,
    outDir: "dist",
    sourcemap: true,
    lib: {
      
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'maptilersdk',
      // the proper extensions will be added
      fileName: (_, __) => "maptiler-sdk.mjs",
      formats: ['es'],
    },
    
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        "maplibre-gl", 
        "@maptiler/client", 
        "@mapbox/point-geometry", 
        "uuid", 
        "@mapbox/unitbezier", 
        "events", 
        "js-base64", 
        "geojson-validation",
      ],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
      },
    },
  },
    define: {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
  },
  plugins,
})