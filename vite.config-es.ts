import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const isProduction = process.env.NODE_ENV === "production";

const plugins = [
  dts({insertTypesEntry: true}),
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
      fileName: (format, entryName) => "maptiler-sdk.mjs",
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
  plugins,
})