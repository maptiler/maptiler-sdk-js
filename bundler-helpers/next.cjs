// CommonJS version of "@maptiler/sdk/next", for `next.config.js` files using `require`.
// Keep in sync with next.mjs.
const { copyFileSync, mkdirSync } = require("node:fs");
const path = require("node:path");

const WORKER_FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];
const PUBLIC_SUBDIR = "_maptiler";

function copyWorkerFiles() {
  // Resolved from the SDK's own dependencies, so the worker always matches the SDK's MapLibre
  const maplibreDist = path.join(path.dirname(require.resolve("maplibre-gl/package.json")), "dist");
  const destination = path.join(process.cwd(), "public", PUBLIC_SUBDIR);

  mkdirSync(destination, { recursive: true });
  for (const file of WORKER_FILES) {
    copyFileSync(path.join(maplibreDist, file), path.join(destination, file));
  }
}

function withWorkerEnv(config) {
  const basePath = config.basePath ?? "";
  return {
    ...config,
    env: {
      ...config.env,
      NEXT_PUBLIC_MAPTILER_WORKER_URL: `${basePath}/${PUBLIC_SUBDIR}/maplibre-gl-worker.mjs`,
    },
  };
}

function withMaptilerWorker(nextConfig = {}) {
  copyWorkerFiles();

  // Next.js also accepts a (possibly async) function returning the config
  if (typeof nextConfig === "function") {
    return async (...args) => withWorkerEnv(await nextConfig(...args));
  }

  return withWorkerEnv(nextConfig);
}

module.exports = { withMaptilerWorker };
