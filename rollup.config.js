import os from "os";
import path from "path";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import commonjs from "@rollup/plugin-commonjs";
import copy from 'rollup-plugin-copy-merge'
import json from '@rollup/plugin-json';
import execute from "rollup-plugin-shell";

const outputName = "maptiler-sdk";
const externals = ["maplibre-gl", "@maptiler/client", "@mapbox/point-geometry", "uuid", "@mapbox/unitbezier", "events", "js-base64", "geojson-validation"];

const cssMaplibreFilepath = "node_modules/maplibre-gl/dist/maplibre-gl.css";
const cssTemplateFilepath = "src/style/style_template.css";
const cssIntermatdiateFilepath = path.join(os.tmpdir(), `${outputName}-style.css`);
const cssDistribution = `dist/${outputName}.css`;

const replaceCssPath = execute({ commands: [`node scripts/replace-path-with-content.js ${cssTemplateFilepath} ${cssIntermatdiateFilepath}`], hook: "buildStart" })

const copyCssPlugin = copy({
  targets: [
    {
      src: [cssMaplibreFilepath, cssIntermatdiateFilepath],
      file: cssDistribution,
    },
  ],
});


const bundles = [ 
  // ES module, not minified + sourcemap
  {
    plugins: [
      replaceCssPath,
      copyCssPlugin,
      json(),
      esbuild()
    ],
    output: [
      {
        file: `dist/${outputName}.mjs`,
        format: "es",
        sourcemap: true,
      },
    ], 
    input: "src/index.ts", 
    watch: {
      include: "src/**",
    }, 
    external: externals, 
  },

  // UMD module, not minified
  {
    plugins: [
      replaceCssPath,
      copyCssPlugin,
      nodeResolve({
        preferBuiltins: false,
      }), // for the standalone UMD, we want to resolve so that the bundle contains all the dep.
      commonjs({ include: "node_modules/**" }),
      globals(),
      json(),
      esbuild(),
      // copyUmdBundle, 
    ],
    output: [
      {
        name: "maptilersdk",
        file: `dist/${outputName}.umd.js`,
        format: "umd",
        sourcemap: true,
      },
    ],
    input: "src/index.ts",
    watch: {
      include: "src/**",
    },
  },

  // types
  {
    plugins: [dts()], 
    output: {
      file: `dist/${outputName}.d.ts`,
      format: "es",
    },
    input: "src/index.ts",
  },
];

if (process.env.NODE_ENV === "production") {
  bundles.push(
    // ES module, minified
    {
      plugins: [
        replaceCssPath,
        copyCssPlugin,
        json(),
        esbuild({
          sourceMap: false,
          minify: true,
        }),
      ],
      output: [
        {
          file: `dist/${outputName}.min.mjs`,
          format: "es",
        },
      ],
      input: "src/index.ts",
      external: externals,
    },
    {
      plugins: [
        replaceCssPath,
        copyCssPlugin,
        nodeResolve({
          preferBuiltins: false,
        }), // for the standalone UMD, we want to resolve so that the bundle contains all the dep.
        commonjs({ include: "node_modules/**" }),
        globals(),
        json(),
        esbuild({
          sourceMap: false,
          minify: true,
        }),
      ],
      output: [
        {
          name: "maptilersdk",
          file: `dist/${outputName}.umd.min.js`,
          format: "umd",
          sourcemap: false,
        },
      ],
      input: "src/index.ts",
      watch: {
        include: "src/**",
      },
    },
  );
}

export default bundles;
