// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { config, ImageViewer, ImageViewerMarker } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../../shared/demo-utils";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";

async function main() {
  addPerformanceStats();
  setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

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

  const button = document.createElement("button");
  button.style.position = "absolute";
  button.style.top = "10px";
  button.style.left = "10px";
  button.style.zIndex = "1000";
  button.innerText = "bounds!";
  document.body.appendChild(button);

  button.addEventListener("click", () => {
    console.log("Button was clicked!");
    const [topLeft, bottomRight] = imageViewer.getImageBounds();
    console.log(
      `topLeft:
        x: ${topLeft[0]}, y: ${topLeft[1]}\n
bottomRight:
        x: ${bottomRight[0]}, y: ${bottomRight[1]}`,
    );
  });

  const marker = new ImageViewerMarker({ draggable: true });

  marker
    .setPosition([100, 100])
    .addTo(imageViewer)
    .on("dragend", (e) => {
      console.log("e.target.isWithinImageBounds()", e.target.isWithinImageBounds());
    });
}

void main();
