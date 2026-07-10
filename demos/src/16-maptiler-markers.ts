import { Map, MapStyle, Marker, config, registerMarkerTemplate } from "../../src/index";
import { setupMapTilerApiKey } from "./demo-utils";
import type { MapTilerMarkerBaseOptions, MapTilerMarkerOptions, MapTilerMarkerSVGOptions } from "../../src/Marker";

// demo template: dark round badge with a label
registerMarkerTemplate("badge", (params) => {
  const div = document.createElement("div");
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.borderRadius = "50%";
  div.style.background = "#1a1a2e";
  div.style.color = "#ffd166";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.font = "700 16px system-ui";
  div.textContent = String(params?.label ?? "?");
  return div;
});

setupMapTilerApiKey({ config });

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} not found`);
  return found as T;
}

const zoom = 12;

async function main() {
  const map = new Map({
    container: el("map"),
    style: MapStyle.STREETS.DEFAULT,
    projection: "globe",
    zoom,
    center: [10, 50],
    pitch: 45,
  });

  await map.onLoadAsync();

  // cross drawn over the marker's lngLat so the anchor point is easy to eyeball;
  // re-added after every style switch (setStyle wipes sources/layers)
  const [centerLng, centerLat] = [10, 50];
  const armLat = 0.01;
  const armLng = armLat / Math.cos((centerLat * Math.PI) / 180); // visually square arms

  function addCenterCross() {
    if (map.getSource("center-cross")) return;

    map.addSource("center-cross", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [centerLng - armLng, centerLat],
                [centerLng + armLng, centerLat],
              ],
            },
          },
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [centerLng, centerLat - armLat],
                [centerLng, centerLat + armLat],
              ],
            },
          },
        ],
      },
    });

    map.addLayer({
      id: "center-cross",
      type: "line",
      source: "center-cross",
      paint: {
        "line-color": "#ff00ff",
        "line-width": 2,
      },
    });
  }

  addCenterCross();

  map.on("styledata", () => {
    try {
      addCenterCross();
    } catch {
      // style still transitioning — the next styledata event will succeed
    }
    syncStatus();
  });

  let i = 0;
  let animating = false;

  function loop() {
    if (!animating) return;
    i += 0.75;
    requestAnimationFrame(loop);
    map.setBearing(i);
    map.setZoom(zoom + Math.sin(i / 50) * 2);
  }

  const animToggle = el<HTMLButtonElement>("anim-toggle");

  animToggle.addEventListener("click", () => {
    animating = !animating;
    animToggle.textContent = animating ? "Pause" : "Resume";
    if (animating) loop();
  });
  // Single source of truth for the marker configuration.
  // Control handlers write here as well as calling the setter.
  const markerOptions: MapTilerMarkerSVGOptions = {
    draggable: true,
    scale: [1, 1],
    shape: "bubble-square",
    size: "m",
    color: "blue", // adaptive — resolves against the current map style
    outerColor: "#ffffff",
    contentColor: "#ffffff",
    shadow: "medium",
    content: "1",
    title: "Marker 1",
    subpixelPositioning: true,
    priority: 100,
  };

  // Content mode — content variants are constructor-only, so switching
  // modes rebuilds the marker from markerOptions + the selected variant.
  type ContentMode = "text" | "type" | "url" | "template" | "element" | "none";
  let contentMode: ContentMode = "text";

  function createConfiguredMarker(): Marker {
    // widen away the SVG-options `never` variant keys and drop the maplibre
    // `element` key so any content variant can be attached
    const widened: MapTilerMarkerBaseOptions = { ...markerOptions, content: undefined };
    delete widened.element;
    const base = widened as Omit<MapTilerMarkerBaseOptions, "element">;

    switch (contentMode) {
      case "text":
        return new Marker({ ...markerOptions });
      case "none":
        return new Marker(base);
      case "type":
        return new Marker({ ...base, contentType: "star" });
      case "url":
        return new Marker({ ...base, url: "https://picsum.photos/128" });
      case "template":
        return new Marker({ ...base, template: "badge", templateParams: { label: markerOptions.content ?? "?" } });
      case "element": {
        const pin = document.createElement("div");
        pin.textContent = "📍";
        pin.style.fontSize = "40px";
        pin.style.cursor = "pointer";
        const { shape, size, ...behaviour } = base;
        void shape;
        void size;
        return new Marker({ ...behaviour, element: pin });
      }
    }
  }

  function mountMarker(m: Marker, lngLat: [number, number]) {
    m.on("click", console.log);
    m.setLngLat(lngLat);
    map.addMarker(m);
  }

  let marker = createConfiguredMarker();
  mountMarker(marker, [10, 50]);
  marker.setDebug(true);

  const contentModeButtons = document.querySelectorAll<HTMLButtonElement>("[data-content-mode]");

  function syncContentModeButtons(active: string) {
    contentModeButtons.forEach((b) => b.classList.toggle("active", b.dataset.contentMode === active));
  }

  contentModeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      contentMode = btn.dataset.contentMode as ContentMode;
      const lngLat = marker.getLngLat();
      marker.remove();
      marker = createConfiguredMarker();
      mountMarker(marker, [lngLat.lng, lngLat.lat]);
      marker.setDebug(el<HTMLInputElement>("debug-toggle").checked);
      syncContentModeButtons(contentMode);
      syncStatus();
    });
  });

  syncContentModeButtons(contentMode);

  for (let i = 0; i < 4; i++) {
    const otherMarker = new Marker({ ...markerOptions, content: String(i + 2), title: `Marker ${String(i + 2)}`, priority: 1 + i });
    otherMarker.on("click", console.log);
    const offsetLat = Math.sin((i / 4) * Math.PI * 2) / 20;
    const offsetLon = Math.cos((i / 4) * Math.PI * 2) / 20;
    otherMarker.setLngLat([10 + offsetLon, 50 + offsetLat]);
    map.addMarker(otherMarker);
  }

  // Shape
  const shapeButtons = document.querySelectorAll<HTMLButtonElement>("[data-shape]");

  function syncShapeButtons(active: string) {
    shapeButtons.forEach((b) => b.classList.toggle("active", b.dataset.shape === active));
  }

  shapeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const shape = btn.dataset.shape as MapTilerMarkerOptions["shape"];
      markerOptions.shape = shape;
      marker.setShape(shape);
      syncShapeButtons(btn.dataset.shape ?? "");
      syncStatus();
    });
  });

  syncShapeButtons(marker.getShape() ?? "bubble-square");

  // Map style — exercises adaptive colour re-resolution on style change
  const mapStyles = {
    streets: MapStyle.STREETS.DEFAULT,
    "streets-dark": MapStyle.STREETS.DARK,
    base: MapStyle.BASE.DEFAULT,
    "base-dark": MapStyle.BASE.DARK,
    dataviz: MapStyle.DATAVIZ.DEFAULT,
    "dataviz-dark": MapStyle.DATAVIZ.DARK,
    hybrid: MapStyle.HYBRID.DEFAULT,
    topo: MapStyle.TOPO.DEFAULT,
  } as const;

  const styleButtons = document.querySelectorAll<HTMLButtonElement>("[data-map-style]");

  function syncStyleButtons(active: string) {
    styleButtons.forEach((b) => b.classList.toggle("active", b.dataset.mapStyle === active));
  }

  styleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.mapStyle as keyof typeof mapStyles;
      map.setStyle(mapStyles[key]);
      syncStyleButtons(key);
    });
  });

  syncStyleButtons("streets");

  // Adaptive color
  const adaptiveButtons = document.querySelectorAll<HTMLButtonElement>("[data-adaptive-color]");

  function syncAdaptiveButtons(active: string) {
    adaptiveButtons.forEach((b) => b.classList.toggle("active", b.dataset.adaptiveColor === active));
  }

  adaptiveButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.adaptiveColor ?? "";
      const color = (key === "" ? undefined : key) as MapTilerMarkerOptions["color"];
      markerOptions.color = color;
      if (color) markerOptions.innerColor = undefined; // adaptive takes over from explicit inner
      marker.setColor(color);
      syncAdaptiveButtons(key);
      syncStatus();
    });
  });

  syncAdaptiveButtons(typeof markerOptions.color === "string" ? markerOptions.color : "");

  // Size
  const sizeButtons = document.querySelectorAll<HTMLButtonElement>("[data-size]");

  function syncSizeButtons(active: string) {
    sizeButtons.forEach((b) => b.classList.toggle("active", b.dataset.size === active));
  }

  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const size = btn.dataset.size as MapTilerMarkerOptions["size"];
      markerOptions.size = size;
      marker.setSize(size);
      syncSizeButtons(btn.dataset.size ?? "m");
      syncStatus();
    });
  });

  syncSizeButtons(markerOptions.size ?? "m");

  // Shadow
  const shadowButtons = document.querySelectorAll<HTMLButtonElement>("[data-shadow]");

  function syncShadowButtons(active: string) {
    shadowButtons.forEach((b) => b.classList.toggle("active", b.dataset.shadow === active));
  }

  shadowButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const shadow = (btn.dataset.shadow === "" ? undefined : btn.dataset.shadow) as MapTilerMarkerOptions["shadow"];
      markerOptions.shadow = shadow;
      marker.setShadow(shadow);
      syncShadowButtons(btn.dataset.shadow ?? "");
      syncStatus();
    });
  });

  syncShadowButtons(markerOptions.shadow ?? "");

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

  outerColorInput.value = colorToHex(markerOptions.outerColor ?? "#ffffff");
  innerColorInput.value = colorToHex(marker.getInnerColor() ?? "#ffffff");
  contentColorInput.value = colorToHex(markerOptions.contentColor ?? "#ffffff");
  outlineColorInput.value = colorToHex(markerOptions.outlineColor ?? "#ffffff");

  outerColorInput.addEventListener("input", () => {
    markerOptions.outerColor = outerColorInput.value;
    marker.setOuterColor(outerColorInput.value);
    syncStatus();
  });
  innerColorInput.addEventListener("input", () => {
    // explicit innerColor pins the colour and pauses adaptation
    markerOptions.innerColor = innerColorInput.value;
    marker.setInnerColor(innerColorInput.value);
    syncStatus();
  });
  contentColorInput.addEventListener("input", () => {
    markerOptions.contentColor = contentColorInput.value;
    marker.setContentColor(contentColorInput.value);
    syncStatus();
  });
  outlineColorInput.addEventListener("input", () => {
    markerOptions.outlineColor = outlineColorInput.value;
    marker.setOutlineColor(outlineColorInput.value);
    syncStatus();
  });

  // Outline width
  const outlineWidthInput = el<HTMLInputElement>("outline-width");
  const outlineWidthVal = el("outline-width-val");

  outlineWidthInput.addEventListener("input", () => {
    const w = parseFloat(outlineWidthInput.value);
    markerOptions.outline = w === 0 ? undefined : w;
    marker.setOutline(markerOptions.outline);
    outlineWidthVal.textContent = w === 0 ? "off" : `${String(w)}px`;
    syncStatus();
  });

  // Content
  const contentInput = el<HTMLInputElement>("content-input");

  contentInput.addEventListener("input", () => {
    markerOptions.content = contentInput.value;
    marker.setContent(contentInput.value);
    syncStatus();
  });

  // Rotation
  const rotationInput = el<HTMLInputElement>("rotation");
  const rotationVal = el("rotation-val");

  rotationInput.addEventListener("input", () => {
    const deg = parseInt(rotationInput.value, 10);
    markerOptions.rotation = deg;
    marker.setRotation(deg);
    rotationVal.textContent = `${String(deg)}°`;
    syncStatus();
  });

  // Scale
  const scaleXInput = el<HTMLInputElement>("scale-x");
  const scaleYInput = el<HTMLInputElement>("scale-y");
  const scaleXVal = el("scale-x-val");
  const scaleYVal = el("scale-y-val");

  function getScale(): [number, number] {
    return markerOptions.scale ?? [1, 1];
  }

  scaleXInput.addEventListener("input", () => {
    const x = parseFloat(scaleXInput.value);
    markerOptions.scale = [x, getScale()[1]];
    marker.setScale(markerOptions.scale);
    scaleXVal.textContent = x.toFixed(2);
    syncStatus();
  });

  scaleYInput.addEventListener("input", () => {
    const y = parseFloat(scaleYInput.value);
    markerOptions.scale = [getScale()[0], y];
    marker.setScale(markerOptions.scale);
    scaleYVal.textContent = y.toFixed(2);
    syncStatus();
  });

  // Debug overlay
  const debugToggle = el<HTMLInputElement>("debug-toggle");
  debugToggle.checked = marker.getDebug();

  debugToggle.addEventListener("change", () => {
    markerOptions.debug = debugToggle.checked;
    marker.setDebug(debugToggle.checked);
  });

  const statusEl = el("status");

  function syncStatus() {
    const shape = marker.getShape() ?? "bubble-square";
    const size = markerOptions.size ?? "m";
    const [sx, sy] = getScale();
    const color = marker.getColor();
    const colorLabel = color === undefined ? "off" : typeof color === "string" ? `"${color}"` : color.name;
    const innerColor = marker.getInnerColor() ?? "default";
    statusEl.textContent =
      `getShape() → "${shape}"  |  getSize() → "${size}"  |  getScale() → [${sx.toFixed(2)}, ${sy.toFixed(2)}]` +
      `  |  getColor() → ${colorLabel}  |  getInnerColor() → ${innerColor}`;
  }

  syncStatus();

  loop();
}

void main();
