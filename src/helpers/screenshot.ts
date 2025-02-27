import type { Map as MapSDK } from "../Map";

/**
 * Takes a screenshot (PNG file) of the curent map view.
 * Depending on the options, this function can automatically trigger a download of te file.
 */
export async function takeScreenshot(
  map: MapSDK,
  options: {
    /**
     * If `true`, this function will trigger a download in addition to returning a blob.
     * Default: `false`
     */
    download?: boolean;

    /**
     * Only if `options.download` is `true`. Indicates the filename under which
     * the file will be downloaded.
     * Default: `"maptiler_screenshot.png"`
     */
    filename?: string;
  } = {},
): Promise<Blob> {
  const download = options.download ?? false;
  const blob = await getMapScreenshotBlob(map);

  if (download) {
    const filename = options.filename ?? "maptiler_screenshot.png";

    const link = document.createElement("a");
    link.style.display = "none";
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // Cleaning after event loop
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 0);
  }

  return blob;
}

function getMapScreenshotBlob(map: MapSDK): Promise<Blob> {
  return new Promise((resolve, reject) => {
    map.redraw();

    map.once("idle", () => {
      map.getCanvas().toBlob((blob) => {
        if (!blob) {
          reject(Error("Screenshot could not be created."));
          return;
        }

        resolve(blob);
      }, "image/png");
    });
  });
}
