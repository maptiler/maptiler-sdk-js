import { config } from "../../src";
import ImageViewer from "../../src/ImageViewer/ImageViewer";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

function main() {
  addPerformanceStats();
  setupMapTilerApiKey({ config });

  const imageViewer = new ImageViewer({
    container: document.getElementById("map")!,
    // you will need to get your own imageUUID from MapTiler
    // cloud as these are only accesible per API key
    imageUUID: "01986025-ceb9-7487-9ea6-7a8637dcc1a1",
    debug: true,
  });

  imageViewer.on("imageviewerready", () => {
    console.log("imageviewerready");
  });
}

main();
