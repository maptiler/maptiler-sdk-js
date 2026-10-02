// Sets the MapLibre worker URL in a Next.js app, from a client component:
//   "use client";
//   import "@maptiler/sdk/next-worker";
//
// The URL is provided at build time by `withMaptilerWorker` (see "@maptiler/sdk/next"),
// which copies the worker files into `public/` and exposes their URL.
// Imported from the SDK (not "maplibre-gl") so it always sets the worker URL on the MapLibre instance the SDK uses
import { setWorkerUrl } from "@maptiler/sdk";

const workerUrl = process.env.NEXT_PUBLIC_MAPTILER_WORKER_URL;

if (workerUrl) {
  setWorkerUrl(workerUrl);
} else {
  console.warn('[@maptiler/sdk/next-worker] No worker URL found. Wrap your Next.js config with `withMaptilerWorker` from "@maptiler/sdk/next".');
}
