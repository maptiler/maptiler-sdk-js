import { config, ImageViewer, ImageViewerMarker } from "../../src";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

async function main() {
  addPerformanceStats();
  setupMapTilerApiKey({ config });

  const imageViewer = new ImageViewer({
    container: document.getElementById("map")!,
    // you will need to get your own imageUUID from MapTiler
    // cloud as these are only accesible per API key
    // please see cloud documentation for creating an image resource
    imageUUID: "01997715-a22b-7170-9a4c-5e8435f847c7",
    apiKey: "NrHbzRcISmjG1VwSD6jh",
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
