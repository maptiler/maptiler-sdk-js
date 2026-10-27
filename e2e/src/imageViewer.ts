import "../../dist/maptiler-sdk.css";
import { config, ImageViewer, ImageViewerMarker, type ImageViewerConstructorOptions, setWorkerUrl } from "../../src/index";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// MapLibre v6 loads its worker as a separate module, bundlers need its URL set explicitly
setWorkerUrl(workerUrl);

config.apiKey = "DOESNT_MATTER";
// the metrics request is not mocked
config.telemetry = false;

// waits for the next render to settle, so tiles requested by the last camera change are drawn
async function waitForIdle() {
  const viewer = window.__imageViewer;
  const idle = viewer.getSDKInternal().once("idle");
  viewer.triggerRepaint();
  await idle;
}

window.createImageViewer = async function createImageViewer(options: Partial<ImageViewerConstructorOptions> = {}) {
  (window.__imageViewer as ImageViewer | undefined)?.remove();

  const viewer = new ImageViewer({
    container: "map",
    imageUUID: "e2e-image",
    ...options,
  });

  window.__imageViewer = viewer;

  await viewer.onReadyAsync();
  await waitForIdle();
};

window.waitForImageViewerIdle = waitForIdle;

window.__pageObjects = {
  ...window.__pageObjects,
  ImageViewerMarker,
};
