// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
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

  setupCutlineControls(imageViewer);
}

// Buttons to crop the image with a cutline, and to switch how the image outside of it is drawn
function setupCutlineControls(imageViewer: ImageViewer) {
  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "40px";
  panel.style.left = "10px";
  panel.style.zIndex = "1000";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.gap = "4px";
  document.body.appendChild(panel);

  const addButton = (text: string, onClick: () => void) => {
    const button = document.createElement("button");
    button.innerText = text;
    button.addEventListener("click", onClick);
    panel.appendChild(button);
  };

  imageViewer.on("cutlinechange", (e) => {
    console.log("cutlinechange", e.cutline);
  });

  // cutlines 10% from the edges of the image
  const cutlines: Record<string, (width: number, height: number) => [number, number][] | null> = {
    "no cutline": () => null,
    "smaller square": (width, height) => [
      [width * 0.1, height * 0.1],
      [width * 0.9, height * 0.1],
      [width * 0.9, height * 0.9],
      [width * 0.1, height * 0.9],
    ],
    triangle: (width, height) => [
      [width * 0.5, height * 0.1],
      [width * 0.9, height * 0.9],
      [width * 0.1, height * 0.9],
    ],
  };

  const select = document.createElement("select");
  for (const name of Object.keys(cutlines)) {
    const option = document.createElement("option");
    option.value = name;
    option.innerText = `cutline: ${name}`;
    select.appendChild(option);
  }
  select.addEventListener("change", () => {
    const metadata = imageViewer.getImageMetadata();
    if (!metadata) return;

    imageViewer.setCutline(cutlines[select.value](metadata.width, metadata.height));
  });
  panel.appendChild(select);

  addButton("outside: hidden", () => {
    imageViewer.setOutsideCutlineStyle({ type: "hidden" });
  });

  addButton("outside: overlay", () => {
    imageViewer.setOutsideCutlineStyle({ type: "overlay", color: "rgba(0, 0, 0, 0.6)" });
  });
}

void main();
