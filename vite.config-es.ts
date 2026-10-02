import { resolve } from 'path';
import { build, defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import packagejson from "./package.json";
import { copyFileSync, mkdirSync, readdirSync } from 'fs';

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

// The bundler helpers (@maptiler/sdk/vite-worker, /webpack-worker, /next, /next-worker) are shipped as is:
// their worker imports must be resolved by the consumer's bundler, not by this build.
function copyBundlerHelpers() {
  return {
    name: 'copy-bundler-helpers',
    writeBundle() {
      const sourceDir = resolve(import.meta.dirname, 'bundler-helpers');
      const destDir = resolve(import.meta.dirname, 'dist/bundler');
      mkdirSync(destDir, { recursive: true });
      for (const file of readdirSync(sourceDir)) {
        copyFileSync(resolve(sourceDir, file), resolve(destDir, file));
      }
    }
  }
}

// MapLibre's worker imports its shared chunk by relative path, which bundlers like webpack don't follow
// when emitting the worker as an asset. This bundles both into a single self-contained worker file,
// used by the webpack helper.
function bundleMaplibreWorker() {
  return {
    name: 'bundle-maplibre-worker',
    async closeBundle() {
      await build({
        configFile: false,
        logLevel: 'warn',
        build: {
          outDir: resolve(import.meta.dirname, 'dist/bundler'),
          emptyOutDir: false,
          minify: true,
          lib: {
            entry: resolve(import.meta.dirname, 'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs'),
            fileName: () => 'maplibre-gl-worker.mjs',
            formats: ['es'],
          },
        },
      });
    }
  }
}

const plugins = [
  dts({insertTypesEntry: true, include: ["src"]}),
  copyLinterConfig(),
  copyBundlerHelpers(),
  bundleMaplibreWorker(),
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
    __MT_BUILD_FORMAT__: JSON.stringify("es"),
    __MT_NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
  },
  plugins,
})