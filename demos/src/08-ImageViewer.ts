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

// Selects to crop the image with a cutline, and to switch how the image outside of it is drawn
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

  // a select calling the function of the chosen option
  const addSelect = (label: string, options: Record<string, () => void>) => {
    const select = document.createElement("select");
    for (const name of Object.keys(options)) {
      const option = document.createElement("option");
      option.value = name;
      option.innerText = `${label}: ${name}`;
      select.appendChild(option);
    }
    select.addEventListener("change", () => {
      options[select.value]();
    });
    panel.appendChild(select);
  };

  imageViewer.on("cutlinechange", (e) => {
    console.log("cutlinechange", e.cutline);
  });

  // cutlines 10% from the edges of the image
  const cutlines: Record<string, (width: number, height: number) => [number, number][] | null> = {
    "no cutline": () => null,
    rectangle: (width, height) => [
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
    // a cutline with many points, e.g. to try out performance
    "circle (10k points)": (width, height) => {
      const radius = Math.min(width, height) * 0.4;
      return Array.from({ length: 10_000 }, (_, i): [number, number] => {
        const angle = (i / 10_000) * Math.PI * 2;
        return [width / 2 + radius * Math.cos(angle), height / 2 + radius * Math.sin(angle)];
      });
    },
  };

  addSelect(
    "cutline",
    Object.fromEntries(
      Object.entries(cutlines).map(([name, getCutline]) => [
        name,
        () => {
          const metadata = imageViewer.getImageMetadata();
          if (!metadata) return;

          imageViewer.setCutline(getCutline(metadata.width, metadata.height));
        },
      ]),
    ),
  );

  addSelect("outside cutline", {
    hidden: () => imageViewer.setOutsideCutlineStyle({ type: "hidden" }),
    overlay: () => imageViewer.setOutsideCutlineStyle({ type: "overlay", color: "rgba(0, 0, 0, 0.6)" }),
  });
}

void main();
