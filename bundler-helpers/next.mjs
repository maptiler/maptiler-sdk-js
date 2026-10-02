// Next.js config wrapper that serves the MapLibre worker files from `public/`:
//   // next.config.mjs
//   import { withMaptilerWorker } from "@maptiler/sdk/next";
//   export default withMaptilerWorker(nextConfig);
//
// Next.js (Turbopack and webpack modes) does not emit `maplibre-gl-shared.mjs` next to the worker,
// so both files are copied into `public/` when the config is loaded (on every `next dev` and `next build`).
// Pair it with `import "@maptiler/sdk/next-worker"` in the component creating the map.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const WORKER_FILES = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];
const PUBLIC_SUBDIR = "_maptiler";

function copyWorkerFiles() {
  // Resolved from the SDK's own dependencies, so the worker always matches the SDK's MapLibre
  const require = createRequire(import.meta.url);
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

export function withMaptilerWorker(nextConfig = {}) {
  copyWorkerFiles();

  // Next.js also accepts a (possibly async) function returning the config
  if (typeof nextConfig === "function") {
    return async (...args) => withWorkerEnv(await nextConfig(...args));
  }

  return withWorkerEnv(nextConfig);
}
