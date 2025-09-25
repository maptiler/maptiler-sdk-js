import { config, ImageViewerEvent } from "../../src";
import ImageViewer from "../../src/ImageViewer/ImageViewer";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

async function main() {
  addPerformanceStats();
  setupMapTilerApiKey({ config });

  const imageViewer = new ImageViewer({
    container: document.getElementById("map")!,
    // you will need to get your own imageUUID from MapTiler
    // cloud as these are only accesible per API key
    // please see cloud documentation for creating an image resource
    imageUUID: "01986025-ceb9-7487-9ea6-7a8637dcc1a1",
    debug: true,
  });

  imageViewer.on("imageviewerready", () => {
    console.log("imageviewerready!");
  });

  await imageViewer.onReadyAsync();

  imageViewer.on("click", (e: ImageViewerEvent) => {
    console.log("click", e.imageX, e.imageY);
  });

  setTimeout(() => {
    imageViewer.fitImageBounds([
      [1246.3768115942328, 788.2391304347748],
      [3501.449275362361, 2144.7608695652225],
    ]);
  }, 2000);

  imageViewer.on("moveend", (e: ImageViewerEvent) => {
    console.log("moveend", e);
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
}

void main();
