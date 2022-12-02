import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import globals from "rollup-plugin-node-globals";
import commonjs from "@rollup/plugin-commonjs";
import copy from 'rollup-plugin-copy-merge'
import json from '@rollup/plugin-json';

const outputName = "maptiler-sdk"

const copyCssPlugin = copy({
  targets: [
    {
      src: ["node_modules/maplibre-gl/dist/maplibre-gl.css", "src/style/style.css"],
      file: `dist/${outputName}.css`,
    },
  ],
});


const bundles = [ 
  // ES module, not minified + sourcemap
  {
    plugins: [copyCssPlugin, json(), esbuild()],
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
    external: ["maplibre-gl", "@maptiler/client"], 
  },
 
  // CJS module, not minified + sourcemap
  // {
  //   plugins: [
  //     copyCssPlugin,
  //     nodeResolve(), // for the standalone UMD, we want to resolve so that the bundle contains all the dep.
  //     commonjs({ include: 'node_modules/**' }),
  //     globals(),
  //     json(),
  //     esbuild({
  //       // include: ['src/services/*.ts'],
  //       // exclude: ['*'],
  //     })
  //   ],
  //   output: [
  //     {
  //       file: `dist/${outputName}.cjs`,
  //       format: "cjs",
  //       sourcemap: true
  //     }
  //   ],
  //   input: "src/index.ts",
  //   watch: {
  //     include: 'src/**'
  //   },
  //   external: ["maplibre-gl", "@maptiler/client"]
  // },

  // UMD module, not minified
  {
    plugins: [
      copyCssPlugin,
      nodeResolve(), // for the standalone UMD, we want to resolve so that the bundle contains all the dep.
      commonjs({ include: "node_modules/**" }),
      globals(),
      json(),
      esbuild(),
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
      external: ["maplibre-gl", "@maptiler/client"],
    },
    {
      plugins: [
        copyCssPlugin,
        nodeResolve(), // for the standalone UMD, we want to resolve so that the bundle contains all the dep.
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
