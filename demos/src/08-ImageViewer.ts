import { config } from "../../src";
import ImageViewer from "../../src/ImageViewer/ImageViewer";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

function main() {
  addPerformanceStats();
  setupMapTilerApiKey({ config });

  const imageViewer = new ImageViewer({
    container: document.getElementById("map")!,
    apiKey: config.apiKey,
    imageUUID: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    debug: true,
    center: [0, 0],
  });

  console.log(imageViewer);
}

main();
