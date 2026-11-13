// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { ColorRampCollection, LineLayer, Map, MapStyle, PolygonLayer, config } from "@maptiler/sdk";
import type { DataLayerDash, DataLayerGlow, DataLayerLineCap, DataLayerLineJoin, LineLayerStyle, MapStyleVariant, PolygonLayerOutline, PolygonLayerStyle } from "@maptiler/sdk";
import type GUI from "lil-gui";
import { el, setupMapTilerApiKey } from "../../shared/demo-utils";
import { createGui } from "../../shared/gui";

setupMapTilerApiKey({ config });

// New York's boroughs as a PolygonLayer, and its subway as a LineLayer. The
// panel maps onto each layer's style key for key: the outline and glow take
// `false`, `true` (their defaults) or an object, whose fields show for `{ … }`.
// The code panel shows the style passed to `setStyle`.
//
// Data, simplified for the demo:
// - boroughs: NYC Department of Health, https://github.com/nycehs/NYC_geography (`code` is the borough code, 1–5)
// - subway: MTA subway service lines, https://data.ny.gov/d/s692-irgq (`color` is each service's MTA colour)

const BOROUGHS_URL = "/nyc/boroughs.geojson";
const SUBWAY_URL = "/nyc/subway-lines.geojson";
const PATTERN_URL = "/patterns/hatch.png";

/** Over the borough codes. */
const BOROUGH_RAMP = ColorRampCollection.VIRIDIS.scale(1, 5);
const BOROUGH_RAMP_CODE = "ColorRampCollection.VIRIDIS.scale(1, 5)";

/** By the map style select's values. */
const MAP_STYLES: Record<string, MapStyleVariant> = {
  "dataviz light": MapStyle.DATAVIZ.LIGHT,
  "dataviz dark": MapStyle.DATAVIZ.DARK,
  streets: MapStyle.STREETS.DEFAULT,
  "hybrid (satellite)": MapStyle.HYBRID.DEFAULT,
};

/** The forms `dash` takes, by label. */
const DASHES: Record<string, DataLayerDash> = {
  false: false,
  true: true,
  '"dashed"': "dashed",
  '"dotted"': "dotted",
  "[3, 1]": [3, 1],
  '"___ _ "': "___ _ ",
};

const EFFECT = ["false", "true", "{ … }"] as const;
type Effect = (typeof EFFECT)[number];

const CAPS: DataLayerLineCap[] = ["butt", "round", "square"];
const JOINS: DataLayerLineJoin[] = ["round", "bevel", "miter"];

//#region Params

const mapParams = { style: "dataviz light", belowLabels: true };

const polygonParams = {
  color: "CSS colour" as "CSS colour" | "ColorRamp",
  cssColor: "#4f7cff",
  property: "unset" as "unset" | "code",
  pattern: false,
  opacity: 0.5,
  outline: "true" as Effect,
  glow: "false" as Effect,
  visible: true,
};
const polygonOutline = {
  color: "#1f2a44",
  width: 2,
  opacity: 1,
  blur: 0,
  position: "center" as PolygonLayerOutline["position"],
  dash: "false",
  cap: "butt" as DataLayerLineCap,
  join: "round" as DataLayerLineJoin,
};
const polygonGlow = { setColor: false, color: "#ffd23f", width: 6, opacity: 1, setBlur: false, blur: 6 };

const lineParams = {
  color: 'expression ["get", "color"]' as 'expression ["get", "color"]' | "CSS colour",
  cssColor: "#ff5a36",
  width: 3,
  opacity: 1,
  blur: 0,
  gapWidth: 0,
  dash: "false",
  cap: "round" as DataLayerLineCap,
  join: "round" as DataLayerLineJoin,
  outline: "false" as Effect,
  glow: "false" as Effect,
  visible: true,
};
const lineOutline = { color: "#1f2a44", width: 1.5, opacity: 1, blur: 0 };
const lineGlow = { setColor: false, color: "#d83bff", width: 6, opacity: 1, setBlur: false, blur: 6 };

//#endregion

//#region Styles

/** An outline or glow setting: `false`, `true`, or the object `custom` builds. */
function effect<T>(value: Effect, custom: () => T): boolean | T {
  return value === "{ … }" ? custom() : value === "true";
}

/** A glow's fields — its colour and blur only when set, else left to their defaults. */
function glowOf(params: typeof polygonGlow): DataLayerGlow {
  return {
    ...(params.setColor && { color: params.color }),
    width: params.width,
    opacity: params.opacity,
    ...(params.setBlur && { blur: params.blur }),
  };
}

/** Every key is present — `undefined` resets it to its default. */
function readPolygonStyle(): PolygonLayerStyle {
  return {
    color: polygonParams.color === "ColorRamp" ? BOROUGH_RAMP : polygonParams.cssColor,
    property: polygonParams.property === "code" ? "code" : undefined,
    pattern: polygonParams.pattern ? PATTERN_URL : undefined,
    opacity: polygonParams.opacity,
    outline: effect(polygonParams.outline, () => ({ ...polygonOutline, dash: DASHES[polygonOutline.dash] })),
    glow: effect(polygonParams.glow, () => glowOf(polygonGlow)),
  };
}

/** Every key is present — `undefined` resets it to its default. */
function readLineStyle(): LineLayerStyle {
  return {
    color: lineParams.color === "CSS colour" ? lineParams.cssColor : ["get", "color"],
    width: lineParams.width,
    opacity: lineParams.opacity,
    blur: lineParams.blur,
    gapWidth: lineParams.gapWidth,
    dash: DASHES[lineParams.dash],
    cap: lineParams.cap,
    join: lineParams.join,
    outline: effect(lineParams.outline, () => ({ ...lineOutline })),
    glow: effect(lineParams.glow, () => glowOf(lineGlow)),
  };
}

//#endregion

async function main() {
  const map = new Map({
    container: el("map"),
    style: MAP_STYLES[mapParams.style],
    bounds: [
      [-74.26, 40.49],
      [-73.7, 40.92],
    ],
  });
  await map.onReadyAsync();

  const boroughs = new PolygonLayer({ id: "boroughs", data: BOROUGHS_URL, style: readPolygonStyle() });
  const subway = new LineLayer({ id: "subway", data: SUBWAY_URL, style: readLineStyle() });

  let lastClick = "click a borough or a line";
  boroughs.on("click", (e) => {
    lastClick = `boroughs: ${String(e.features?.[0]?.properties.name)}`;
    showCode();
  });
  subway.on("click", (e) => {
    lastClick = `subway: ${(e.features ?? []).map((feature) => String(feature.properties.service)).join(", ")}`;
    showCode();
  });

  // the subway on top, so it crosses the boroughs
  map.addLayer(boroughs);
  map.addLayer(subway);
  place();

  /** Beneath the style's labels, or on top. `map.moveLayer` moves each layer's sublayers with it. */
  function place() {
    const firstSymbol = mapParams.belowLabels ? map.getStyle().layers.find((styleLayer) => styleLayer.type === "symbol")?.id : undefined;
    map.moveLayer(boroughs.id, firstSymbol);
    map.moveLayer(subway.id, firstSymbol);
  }

  // the layers put themselves back on a new style, but its labels layer may differ, so they're placed again
  map.on("style.load", place);

  //#region GUI

  const gui = createGui("Polygon and line layers");

  const mapFolder = gui.addFolder("Map");
  mapFolder
    .add(mapParams, "style", Object.keys(MAP_STYLES))
    .name("map style")
    .onChange(() => map.setStyle(MAP_STYLES[mapParams.style]));
  mapFolder.add(mapParams, "belowLabels").name("below the style's labels").onChange(place);

  const updateBoroughs = () => {
    boroughs.setStyle(readPolygonStyle());
    showCode();
  };
  const updateSubway = () => {
    subway.setStyle(readLineStyle());
    showCode();
  };

  // PolygonLayer
  const polygonFolder = gui.addFolder("PolygonLayer — boroughs");
  polygonFolder.add(polygonParams, "color", ["CSS colour", "ColorRamp"]).onChange(updateBoroughs);
  polygonFolder.addColor(polygonParams, "cssColor").name("  CSS colour").onChange(updateBoroughs);
  polygonFolder.add(polygonParams, "property", ["unset", "code"]).onChange(updateBoroughs);
  polygonFolder.add(polygonParams, "pattern").name("pattern (hatch.png)").onChange(updateBoroughs);
  polygonFolder.add(polygonParams, "opacity", 0, 1, 0.05).onChange(updateBoroughs);
  addEffect(polygonFolder, polygonParams, "outline", updateBoroughs, (folder) => {
    folder.addColor(polygonOutline, "color");
    folder.add(polygonOutline, "width", 0.5, 10, 0.5);
    folder.add(polygonOutline, "opacity", 0, 1, 0.05);
    folder.add(polygonOutline, "blur", 0, 10, 0.5);
    folder.add(polygonOutline, "position", ["center", "inside", "outside"]);
    folder.add(polygonOutline, "dash", Object.keys(DASHES));
    folder.add(polygonOutline, "cap", CAPS);
    folder.add(polygonOutline, "join", JOINS);
  });
  addEffect(polygonFolder, polygonParams, "glow", updateBoroughs, (folder) => {
    addGlowFields(folder, polygonGlow, "fill");
  });
  polygonFolder
    .add(polygonParams, "visible")
    .name("setVisible()")
    .onChange(() => boroughs.setVisible(polygonParams.visible));

  // LineLayer
  const lineFolder = gui.addFolder("LineLayer — subway");
  lineFolder.add(lineParams, "color", ['expression ["get", "color"]', "CSS colour"]).onChange(updateSubway);
  lineFolder.addColor(lineParams, "cssColor").name("  CSS colour").onChange(updateSubway);
  lineFolder.add(lineParams, "width", 0.5, 16, 0.5).onChange(updateSubway);
  lineFolder.add(lineParams, "opacity", 0, 1, 0.05).onChange(updateSubway);
  lineFolder.add(lineParams, "blur", 0, 10, 0.5).onChange(updateSubway);
  lineFolder.add(lineParams, "gapWidth", 0, 10, 0.5).onChange(updateSubway);
  lineFolder.add(lineParams, "dash", Object.keys(DASHES)).onChange(updateSubway);
  lineFolder.add(lineParams, "cap", CAPS).onChange(updateSubway);
  lineFolder.add(lineParams, "join", JOINS).onChange(updateSubway);
  addEffect(lineFolder, lineParams, "outline", updateSubway, (folder) => {
    folder.addColor(lineOutline, "color");
    folder.add(lineOutline, "width", 0.5, 10, 0.5);
    folder.add(lineOutline, "opacity", 0, 1, 0.05);
    folder.add(lineOutline, "blur", 0, 10, 0.5);
  });
  addEffect(lineFolder, lineParams, "glow", updateSubway, (folder) => {
    addGlowFields(folder, lineGlow, "line");
  });
  lineFolder
    .add(lineParams, "visible")
    .name("setVisible()")
    .onChange(() => subway.setVisible(lineParams.visible));

  /**
   * An outline or glow: its `false` / `true` / `{ … }` select, and a folder of
   * the object's fields, shown only for `{ … }`. Any change restyles the layer.
   */
  function addEffect<K extends "outline" | "glow">(parent: GUI, params: Record<K, Effect>, key: K, update: () => void, addFields: (folder: GUI) => void) {
    // the select first, as lil-gui lays out children in the order they're added
    const select = parent.add(params, key, [...EFFECT]);
    const fields = parent.addFolder(`${key}: { … }`);
    addFields(fields);
    fields.onChange(update);

    const showFields = () => fields.show(params[key] === "{ … }");
    select.onChange(() => {
      showFields();
      update();
    });
    showFields();
  }

  /** A glow's fields — the colour and blur each with a box to set it, else left to their defaults. */
  function addGlowFields(folder: GUI, params: typeof polygonGlow, colorOf: string) {
    folder.add(params, "setColor").name(`color (unset: the ${colorOf}'s)`);
    folder.addColor(params, "color").name("  color");
    folder.add(params, "width", 1, 30, 1);
    folder.add(params, "opacity", 0, 1, 0.05);
    folder.add(params, "setBlur").name("blur (unset: the width)");
    folder.add(params, "blur", 0, 30, 1).name("  blur");
  }

  //#endregion

  //#region Code

  function showCode() {
    el("code-panel").textContent = [`boroughs.setStyle(${toCode(readPolygonStyle())});`, "", `subway.setStyle(${toCode(readLineStyle())});`, "", `// ${lastClick}`].join("\n");
  }

  showCode();

  //#endregion
}

/** A style as code: unset keys left out, the ramp by name, keys unquoted. */
function toCode(style: object): string {
  return JSON.stringify(style, (_key, value: unknown) => (value === BOROUGH_RAMP ? BOROUGH_RAMP_CODE : value), 2)
    .replaceAll(`"${BOROUGH_RAMP_CODE}"`, BOROUGH_RAMP_CODE)
    .replace(/"(\w+)":/g, "$1:");
}

void main();
