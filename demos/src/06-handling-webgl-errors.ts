import "@maptiler/sdk/style.css";
import { Map, config, getVersion, displayWebGLContextLostWarning } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });
/*
 * The mapLeftTop will lose the WebGL context because it is removed
 * so the event will not be called.
 */
const mapLeftTop = createMap();

mapLeftTop.on("webglcontextlost", () => {
  console.log("webglcontextlost", mapLeftTop); // Should not be called
});

mapLeftTop.on("load", () => {
  console.log(getVersion());

  setTimeout(() => {
    mapLeftTop.remove();
    mapLeftTop.getContainer().innerHTML = "Map removed successfully \uD83C\uDF89";
  }, 1000);
});
/* *** */

/*
 * The mapRightTop will lose the WebGL context and default warning will be displayed.
 */
const mapRightTop = createMap() as Map;

mapRightTop.on("webglcontextlost", () => {
  displayWebGLContextLostWarning(mapRightTop);
});

mapRightTop.on("load", () => {
  setTimeout(() => {
    mapRightTop.getCanvas().getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
  }, 1000);
});
/* *** */

/*
 * The mapLeftBottom will lose the WebGL context and custom warning will be displayed.
 */
const mapLeftBottom = createMap();

mapLeftBottom.on("webglcontextlost", () => {
  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.top = "0";
  element.style.left = "0";
  element.style.right = "0";
  element.style.bottom = "0";
  element.style.margin = "auto";
  element.style.height = "48px";
  element.style.width = "256px";
  element.style.display = "flex";
  element.style.justifyContent = "center";
  element.style.alignItems = "center";
  element.style.transform = "rotate(-45deg)";
  element.style.background = "peachpuff";
  element.innerHTML = "WebGL context lost custom warning.";

  mapLeftBottom.getContainer().appendChild(element);
});

mapLeftBottom.on("load", () => {
  setTimeout(() => {
    mapLeftBottom.getCanvas().getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
  }, 1000);
});
/* *** */

/*
 * The mapRightBottom will lose the WebGL context and the map will be recreated.
 */
const mapRightBottom = createMap() as Map;

mapRightBottom.on("webglContextLost", () => {
  mapRightBottom.recreate();
});

mapRightBottom.on("load", () => {
  setTimeout(() => {
    mapRightBottom.getCanvas().getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
  }, 1000);
});
/* *** */

function createMap(): Map {
  const element = document.createElement("div") as HTMLDivElement;
  element.className = "map";
  document.body.appendChild(element);

  const map = new Map({
    container: element,
    hash: false,
    geolocate: true,
    terrain: true,
    scaleControl: true,
    fullscreenControl: true,
    terrainControl: true,
  });

  return map;
}
