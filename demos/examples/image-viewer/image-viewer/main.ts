// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { config, ImageViewer, ImageViewerMarker } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../../shared/demo-utils";
import { createGui } from "../../../shared/gui";
import { createLogPanelUI } from "../../../shared/log-panel";

async function main() {
  addPerformanceStats();
  createLogPanelUI();
  setupMapTilerApiKey({ config });

  const imageViewer = new ImageViewer({
    container: document.getElementById("map")!,
    // you will need to get your own imageUUID from MapTiler
    // cloud as these are only accesible per API key
    // please see cloud documentation for creating an image resource
    imageUUID: "01997715-a22b-7170-9a4c-5e8435f847c7",
    debug: true,
  });

  imageViewer.on("imageviewerready", () => {
    console.log("imageviewerready!");
  });

  await imageViewer.onReadyAsync();

  imageViewer.on("moveend", (_) => {
    console.log("moveend");
  });

  const actions = {
    logImageBounds() {
      const [topLeft, bottomRight] = imageViewer.getImageBounds();
      console.log(
        `topLeft:
        x: ${topLeft[0]}, y: ${topLeft[1]}\n
bottomRight:
        x: ${bottomRight[0]}, y: ${bottomRight[1]}`,
      );
    },
  };
  createGui("Image viewer").add(actions, "logImageBounds").name("log image bounds");

  const marker = new ImageViewerMarker({ draggable: true });

  marker
    .setPosition([100, 100])
    .addTo(imageViewer)
    .on("dragend", (e) => {
      console.log("e.target.isWithinImageBounds()", e.target.isWithinImageBounds());
    });
}

void main();
