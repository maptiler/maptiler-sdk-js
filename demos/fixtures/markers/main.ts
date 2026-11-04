// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, Marker, config } from "@maptiler/sdk";
import { registerMarkerTemplate } from "../../../src/Marker/marker-content-registry";
import { MARKER_ICON_NAMES } from "../../../src/Marker/marker-icons";
import { el, setupMapTilerApiKey } from "../../shared/demo-utils";
import { createGui } from "../../shared/gui";
import { createLogPanelUI } from "../../shared/log-panel";
import type { MapTilerMarkerBaseOptions, MapTilerMarkerIcon, MapTilerMarkerOptions, MapTilerMarkerSVGOptions } from "@maptiler/sdk";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

const SHAPES = ["circle", "square", "bubble-circle", "bubble-square", "maptiler", "maptiler-full"] as const;
const SIZES = ["xs", "s", "m", "l"] as const;
const SHADOWS = ["none", "soft", "medium", "strong"] as const;
const CONTENT_MODES = ["text", "icon", "url", "template", "element", "none"] as const;

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

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });
createLogPanelUI();

const zoom = 12;

async function main() {
  const map = new Map({
    container: el("map"),
    style: MAP_STYLE,
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

  // Single source of truth for the marker configuration.
  // Control handlers write here as well as calling the setter.
  // The first marker starts as the default marker: default shape, size and shadow, no content.
  const markerOptions: MapTilerMarkerSVGOptions = {
    draggable: true,
    scale: [1, 1],
    title: "Marker 1",
    subpixelPositioning: true,
    priority: 100,
  };

  // The surrounding numbered markers keep a fixed look.
  const otherMarkerOptions: MapTilerMarkerSVGOptions = {
    ...markerOptions,
    shape: "bubble-square",
    size: "l",
    shadow: "medium",
  };

  // Content mode — content variants are constructor-only, so switching
  // modes rebuilds the marker from markerOptions + the selected variant.
  type ContentMode = (typeof CONTENT_MODES)[number];
  let contentMode: ContentMode = "none";
  let icon: MapTilerMarkerIcon = "star";

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
      case "icon":
        return new Marker({ ...base, icon });
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

  function rebuildMarker() {
    const lngLat = marker.getLngLat();
    marker.remove();
    marker = createConfiguredMarker();
    mountMarker(marker, [lngLat.lng, lngLat.lat]);
    marker.setDebug(markerOptions.debug ?? false);
    syncStatus();
  }

  for (let i = 0; i < 4; i++) {
    const otherMarker = new Marker({ ...otherMarkerOptions, content: String(i + 2), title: `Marker ${String(i + 2)}`, priority: 1 + i });
    otherMarker.on("click", console.log);
    const offsetLat = Math.sin((i / 4) * Math.PI * 2) / 20;
    const offsetLon = Math.cos((i / 4) * Math.PI * 2) / 20;
    otherMarker.setLngLat([10 + offsetLon, 50 + offsetLat]);
    map.addMarker(otherMarker);
  }

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

  function colorToHex(color: string): string {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#000000";
    ctx.fillStyle = color;
    return ctx.fillStyle;
  }

  // Values shown by the panel. Its handlers write to `markerOptions` as well as calling the setter.
  const params = {
    mapStyle: "streets" as keyof typeof mapStyles,
    shape: (marker.getShape() ?? "maptiler") as NonNullable<MapTilerMarkerOptions["shape"]>,
    size: markerOptions.size ?? "m",
    shadow: markerOptions.shadow ?? "none",
    outerColor: colorToHex(marker.getOuterColor()),
    innerColor: colorToHex(marker.getInnerColor()),
    contentColor: colorToHex(marker.getContentColor()),
    outlineColor: colorToHex(markerOptions.outlineColor ?? "#ffffff"),
    resetColors,
    outline: 0,
    contentMode: contentMode as ContentMode,
    content: "",
    icon,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    animate: animating,
    debug: marker.getDebug(),
  };

  const getters = { shape: "", size: "", scale: "", innerColor: "" };

  const gui = createGui("Marker 1");

  gui
    .add(params, "mapStyle", Object.keys(mapStyles))
    .name("map style")
    .onChange(() => map.setStyle(mapStyles[params.mapStyle]));

  const look = gui.addFolder("Shape");
  look.add(params, "shape", SHAPES).onChange(() => {
    markerOptions.shape = params.shape;
    marker.setShape(params.shape);
    syncStatus();
  });
  look.add(params, "size", SIZES).onChange(() => {
    markerOptions.size = params.size;
    marker.setSize(params.size);
    syncStatus();
  });
  look.add(params, "shadow", SHADOWS).onChange(() => {
    markerOptions.shadow = params.shadow;
    marker.setShadow(params.shadow);
    syncStatus();
  });

  const colors = gui.addFolder("Colors");
  colors
    .addColor(params, "outerColor")
    .name("outer")
    .onChange(() => {
      markerOptions.outerColor = params.outerColor;
      marker.setOuterColor(params.outerColor);
      syncStatus();
    });
  colors
    .addColor(params, "innerColor")
    .name("inner")
    .onChange(() => {
      // explicit innerColor pins the colour and pauses adaptation to the map style
      markerOptions.innerColor = params.innerColor;
      marker.setInnerColor(params.innerColor);
      syncStatus();
    });
  colors
    .addColor(params, "contentColor")
    .name("content")
    .onChange(() => {
      markerOptions.contentColor = params.contentColor;
      marker.setContentColor(params.contentColor);
      syncStatus();
    });
  colors
    .addColor(params, "outlineColor")
    .name("outline")
    .onChange(() => {
      markerOptions.outlineColor = params.outlineColor;
      marker.setOutlineColor(params.outlineColor);
      syncStatus();
    });
  colors.add(params, "resetColors").name("reset to map style default");
  colors
    .add(params, "outline", 0, 8, 0.5)
    .name("outline width (0 = off)")
    .onChange(() => {
      markerOptions.outline = params.outline === 0 ? undefined : params.outline;
      marker.setOutline(markerOptions.outline);
      syncStatus();
    });

  function resetColors() {
    markerOptions.outerColor = undefined;
    markerOptions.innerColor = undefined;
    markerOptions.contentColor = undefined;
    markerOptions.outlineColor = undefined;
    marker.setOuterColor(undefined);
    marker.setInnerColor(undefined);
    marker.setContentColor(undefined);
    marker.setOutlineColor(undefined);
    params.outerColor = colorToHex(marker.getOuterColor());
    params.innerColor = colorToHex(marker.getInnerColor());
    params.contentColor = colorToHex(marker.getContentColor());
    gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
    syncStatus();
  }

  const content = gui.addFolder("Content");
  content
    .add(params, "contentMode", CONTENT_MODES)
    .name("mode")
    .onChange(() => {
      contentMode = params.contentMode;
      rebuildMarker();
    });
  content.add(params, "content").onChange(() => {
    markerOptions.content = params.content;
    marker.setContent(params.content);
    syncStatus();
  });
  // picking an icon switches the marker to icon content
  content.add(params, "icon", MARKER_ICON_NAMES).onChange(() => {
    icon = params.icon;
    contentMode = params.contentMode = "icon";
    gui.controllersRecursive().forEach((controller) => controller.updateDisplay());
    rebuildMarker();
  });

  const transform = gui.addFolder("Transform");
  transform.add(params, "rotation", -180, 180, 1).onChange(() => {
    markerOptions.rotation = params.rotation;
    marker.setRotation(params.rotation);
    syncStatus();
  });
  transform
    .add(params, "scaleX", 0.25, 3, 0.05)
    .name("scale x")
    .onChange(() => {
      markerOptions.scale = [params.scaleX, params.scaleY];
      marker.setScale(markerOptions.scale);
      syncStatus();
    });
  transform
    .add(params, "scaleY", 0.25, 3, 0.05)
    .name("scale y")
    .onChange(() => {
      markerOptions.scale = [params.scaleX, params.scaleY];
      marker.setScale(markerOptions.scale);
      syncStatus();
    });

  gui
    .add(params, "animate")
    .name("animate camera")
    .onChange(() => {
      animating = params.animate;
      if (animating) loop();
    });
  gui
    .add(params, "debug")
    .name("debug: bounding box + center")
    .onChange(() => {
      markerOptions.debug = params.debug;
      marker.setDebug(params.debug);
    });

  const gettersFolder = gui.addFolder("Getters");
  gettersFolder.add(getters, "shape").name("getShape()").disable().listen();
  gettersFolder.add(getters, "size").name("getSize()").disable().listen();
  gettersFolder.add(getters, "scale").name("getScale()").disable().listen();
  gettersFolder.add(getters, "innerColor").name("getInnerColor()").disable().listen();

  function syncStatus() {
    const [sx, sy] = markerOptions.scale ?? [1, 1];
    getters.shape = marker.getShape() ?? "maptiler";
    getters.size = markerOptions.size ?? "m";
    getters.scale = `[${sx.toFixed(2)}, ${sy.toFixed(2)}]`;
    getters.innerColor = marker.getInnerColor();
  }

  syncStatus();
}

void main();
