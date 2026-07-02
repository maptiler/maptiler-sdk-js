import { Map, MapStyle, Marker, config } from "../../src/index";
import { setupMapTilerApiKey } from "./demo-utils";
import type { MapTilerMarkerOptions } from "../../src/Marker";

setupMapTilerApiKey({ config });

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} not found`);
  return found as T;
}

async function main() {
  const map = new Map({
    container: el("map"),
    style: MapStyle.STREETS.DEFAULT,
    projection: "globe",
    zoom: 5,
    center: [10, 50],
  });

  await map.onLoadAsync();

  const marker = new Marker({
    shape: "bubble-square",
    size: "m",
    innerColor: "hsl(223, 100%, 65%)",
    outerColor: "#ffffff",
    contentColor: "#ffffff",
    shadow: "medium",
    title: "1",
    subpixelPositioning: true,
  });

  marker.setLngLat([10, 50]);
  map.addMarker(marker);

  const sizeButtons = document.querySelectorAll<HTMLButtonElement>("[data-size]");

  function syncSizeButtons(active: string) {
    sizeButtons.forEach((b) => b.classList.toggle("active", b.dataset.size === active));
  }

  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const size = btn.dataset.size as MapTilerMarkerOptions["size"];
      marker.setSize(size);
      syncSizeButtons(btn.dataset.size ?? "m");
      syncStatus();
    });
  });

  syncSizeButtons(marker.getSize() ?? "m");

  const shadowButtons = document.querySelectorAll<HTMLButtonElement>("[data-shadow]");

  function syncShadowButtons(active: string) {
    shadowButtons.forEach((b) => b.classList.toggle("active", b.dataset.shadow === active));
  }

  shadowButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const shadow = btn.dataset.shadow as MapTilerMarkerOptions["shadow"] | undefined;
      marker.setShadow(shadow ?? undefined);
      syncShadowButtons(btn.dataset.shadow ?? "");
      syncStatus();
    });
  });

  syncShadowButtons(marker.getShadow() ?? "medium");

  // Colors
  function colorToHex(color: string): string {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#000000";
    ctx.fillStyle = color;
    return ctx.fillStyle;
  }

  const outerColorInput = el<HTMLInputElement>("outer-color");
  const innerColorInput = el<HTMLInputElement>("inner-color");
  const contentColorInput = el<HTMLInputElement>("content-color");
  const outlineColorInput = el<HTMLInputElement>("outline-color");

  outerColorInput.value = colorToHex(marker.getOuterColor() ?? "#ffffff");
  innerColorInput.value = colorToHex(marker.getInnerColor() ?? "#ffffff");
  contentColorInput.value = colorToHex(marker.getContentColor() ?? "#ffffff");
  outlineColorInput.value = colorToHex(marker.getOutlineColor() ?? "#ffffff");

  outerColorInput.addEventListener("input", () => {
    marker.setOuterColor(outerColorInput.value);
    syncStatus();
  });
  innerColorInput.addEventListener("input", () => {
    marker.setInnerColor(innerColorInput.value);
    syncStatus();
  });
  contentColorInput.addEventListener("input", () => {
    marker.setContentColor(contentColorInput.value);
    syncStatus();
  });
  outlineColorInput.addEventListener("input", () => {
    marker.setOutlineColor(outlineColorInput.value);
    syncStatus();
  });

  // Outline width
  const outlineWidthInput = el<HTMLInputElement>("outline-width");
  const outlineWidthVal = el("outline-width-val");

  outlineWidthInput.addEventListener("input", () => {
    const w = parseFloat(outlineWidthInput.value);
    if (w === 0) {
      marker.setOutline(undefined);
      outlineWidthVal.textContent = "off";
    } else {
      marker.setOutline(w);
      outlineWidthVal.textContent = `${String(w)}px`;
    }
    syncStatus();
  });

  // Title
  const titleInput = el<HTMLInputElement>("title-input");

  titleInput.addEventListener("input", () => {
    marker.setTitle(titleInput.value);
    syncStatus();
  });

  // Rotation
  const rotationInput = el<HTMLInputElement>("rotation");
  const rotationVal = el("rotation-val");

  rotationInput.addEventListener("input", () => {
    const deg = parseInt(rotationInput.value, 10);
    marker.setRotation(deg);
    rotationVal.textContent = `${String(deg)}°`;
    syncStatus();
  });

  const scaleXInput = el<HTMLInputElement>("scale-x");
  const scaleYInput = el<HTMLInputElement>("scale-y");
  const scaleXVal = el("scale-x-val");
  const scaleYVal = el("scale-y-val");

  function getScale(): [number, number] {
    return marker.getScale() ?? [1, 1];
  }

  scaleXInput.addEventListener("input", () => {
    const x = parseFloat(scaleXInput.value);
    marker.setScale([x, getScale()[1]]);
    scaleXVal.textContent = x.toFixed(2);
    syncStatus();
  });

  scaleYInput.addEventListener("input", () => {
    const y = parseFloat(scaleYInput.value);
    marker.setScale([getScale()[0], y]);
    scaleYVal.textContent = y.toFixed(2);
    syncStatus();
  });

  const statusEl = el("status");

  function syncStatus() {
    const size = marker.getSize() ?? "m";
    const [sx, sy] = getScale();
    statusEl.textContent = `getSize() → "${size}"  |  getScale() → [${sx.toFixed(2)}, ${sy.toFixed(2)}]`;
  }

  syncStatus();
}

main();
