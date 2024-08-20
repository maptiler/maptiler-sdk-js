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

    /**
     * If `true`, the whole page, as displayed in browser, will be included in the screenshot.
     * This requires user permission with a native prompt to select the browser tab or page.
     * On Chromium-based browsers, the current tab will already be preselected.
     * 
     * If `false`, only the map context (without DOM elements such as Markers or Popups) will be included.
     * This mode does not need the user to grant permission.
     * 
     * Default: `false`
     */
    wholePage?: boolean;
  } = {},
): Promise<Blob> {
  const download = options.download ?? false;
  const wholePage = options.wholePage ?? false;
  const blob = wholePage ? await getPageScreenshotBlob() : await getMapScreenshotBlob(map);

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
      map.getCanvas().toBlob( (blob) => {
        if (!blob) {
          return reject(Error("Screenshot could not be created."));
        }

        resolve(blob);
      }, "image/png");
    });
  });
}


async function getPageScreenshotBlob(): Promise<Blob> {
  const captureStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: "browser",
    },
    // @ts-ignore: experimental, works well on Chrome-based browsers
    preferCurrentTab: true,
    audio: false,
  });

  const video = document.createElement("video");
  video.srcObject = captureStream;

  // Wait for the video to be ready
  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => {
      video.play();
      resolve();
    };
  });

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error();
  }

  // Draw the current video frame to the canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  for (const track of captureStream.getTracks()) {
    track.stop();
  }
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        return reject(Error("Screenshot could not be created."));
      }

      resolve(blob);
    }, "image/png");
  });
};