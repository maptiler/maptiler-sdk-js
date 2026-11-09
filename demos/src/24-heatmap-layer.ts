// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { ColorRampCollection, HeatmapLayer, Map, MapStyle, PointLayer, config } from "../../src/index";
import type { HeatmapLayerStyle, MapStyleVariant, PointLayerMode } from "../../src/index";
import { el, setupMapTilerApiKey } from "./demo-utils";

setupMapTilerApiKey({ config });

// A HeatmapLayer of earthquakes, optionally handing over to a PointLayer when
// zoomed in. The two are separate layers: the points draw from the heatmap's
// source (`data: heatmap`), and cross-fade with it through their zoom ranges
// and fades. Style and zoom changes are applied in place.

const EARTHQUAKES_URL = "https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson";

/** By the map style select's values. */
const MAP_STYLES: Record<string, MapStyleVariant> = {
  "dataviz-light": MapStyle.DATAVIZ.LIGHT,
  "dataviz-dark": MapStyle.DATAVIZ.DARK,
  streets: MapStyle.STREETS.DEFAULT,
  hybrid: MapStyle.HYBRID.DEFAULT,
};

/** Scaled to the quakes' magnitudes, so circles coloured and sized by `mag` read along them. The heatmap rescales its ramp to its density. */
const RAMPS = {
  TURBO: ColorRampCollection.TURBO.scale(0, 8),
  MAGMA: ColorRampCollection.MAGMA.scale(0, 8),
  VIRIDIS: ColorRampCollection.VIRIDIS.scale(0, 8),
  INFERNO: ColorRampCollection.INFERNO.scale(0, 8),
  PORTLAND: ColorRampCollection.PORTLAND.scale(0, 8),
};

/** The circles' default radii, at zoom 16, which the circle size scales. */
const DEFAULT_MIN_RADIUS = 10;
const DEFAULT_MAX_RADIUS = 50;

const controls = {
  mapStyle: el<HTMLSelectElement>("map-style"),
  belowLabels: el<HTMLInputElement>("below-labels"),
  color: el<HTMLSelectElement>("color"),
  weight: el<HTMLSelectElement>("weight"),
  radiusAuto: el<HTMLInputElement>("radius-auto"),
  radius: el<HTMLInputElement>("radius"),
  intensityAuto: el<HTMLInputElement>("intensity-auto"),
  intensity: el<HTMLInputElement>("intensity"),
  opacity: el<HTMLInputElement>("opacity"),
  points: el<HTMLSelectElement>("points"),
  circleSize: el<HTMLInputElement>("circle-size"),
  transitionZoom: el<HTMLInputElement>("transition-zoom"),
  transitionSpan: el<HTMLInputElement>("transition-span"),
  visible: el<HTMLInputElement>("visible"),
};

function readRamp() {
  return RAMPS[controls.color.value as keyof typeof RAMPS];
}

/** Every style key is always present — `undefined` resets it to the default. */
function readStyle(): HeatmapLayerStyle {
  const weight = controls.weight.value;
  return {
    color: readRamp(),
    property: weight === "none" ? undefined : "mag",
    weight:
      weight === "ramp"
        ? [
            { propertyValue: 0, value: 0 },
            { propertyValue: 8, value: 1 },
          ]
        : undefined,
    radius: controls.radiusAuto.checked ? undefined : Number(controls.radius.value),
    intensity: controls.intensityAuto.checked ? undefined : Number(controls.intensity.value),
    opacity: Number(controls.opacity.value),
  };
}

/** The circles' radius range, scaled by the circle size — the smallest and largest `mag` get these. */
function readCircleRadii() {
  const factor = Number(controls.circleSize.value);
  return { minRadius: DEFAULT_MIN_RADIUS * factor, maxRadius: DEFAULT_MAX_RADIUS * factor };
}

/** Where the heatmap stops and the points start: the transition zoom, plus and minus half its span, cross-fading over the span. */
function readTransition() {
  const zoom = Number(controls.transitionZoom.value);
  const span = Number(controls.transitionSpan.value);
  return { heatmapMaxzoom: zoom + span / 2, pointsMinzoom: zoom - span / 2, fade: span };
}

async function main() {
  // every control is read at startup too, as the browser restores their values on reload
  const map = new Map({ container: el("map"), style: MAP_STYLES[controls.mapStyle.value], center: [-120, 40], zoom: 3 });
  await map.onReadyAsync();

  const heatmap = new HeatmapLayer({ data: EARTHQUAKES_URL, style: readStyle(), visible: controls.visible.checked });
  heatmap.on("click", (e) => {
    showClick("heatmap", e.features?.length ?? 0, e.features?.[0]?.properties);
  });

  let points = createPoints();

  /** The points the heatmap hands over to, drawn from its source — `null` for a plain heatmap. */
  function createPoints(): PointLayer<PointLayerMode> | null {
    const mode = controls.points.value;
    if (mode === "none") return null;

    const common = { id: "quake-points", data: heatmap, visible: controls.visible.checked };
    const created: PointLayer<PointLayerMode> =
      mode === "markers"
        ? new PointLayer({ ...common, mode: "markers", style: { marker: { shape: "circle", size: "xs" } }, collisionBehaviour: "always-show" })
        : new PointLayer({ ...common, style: { color: readRamp(), property: "mag", outline: true, ...readCircleRadii() } });
    created.on("click", (e) => {
      showClick("point", e.features?.length ?? 0, e.features?.[0]?.properties);
    });
    return created;
  }

  /** Splits the zoom range at the transition — a plain heatmap keeps the whole range. */
  function applyTransition() {
    const { heatmapMaxzoom, pointsMinzoom, fade } = readTransition();
    if (!points) {
      heatmap.setZoomRange(0, 24);
      return;
    }
    heatmap.setZoomRange(0, heatmapMaxzoom, fade);
    points.setZoomRange(pointsMinzoom, 24, fade);
  }

  /** Beneath the style's labels, or on top, the points above the heatmap. Data layers manage layers beneath themselves, so they're moved by re-adding them. */
  function place() {
    for (const layer of [points, heatmap]) {
      if (layer && map.getLayer(layer.id)) map.removeLayer(layer.id);
    }
    const firstSymbol = controls.belowLabels.checked ? map.getStyle().layers.find((styleLayer) => styleLayer.type === "symbol")?.id : undefined;
    map.addLayer(heatmap, firstSymbol);
    if (points) map.addLayer(points, firstSymbol);
  }

  function replacePoints() {
    if (points && map.getLayer(points.id)) map.removeLayer(points.id);
    points = createPoints();
    applyTransition();
    place();
  }

  applyTransition();
  place();

  //#region Controls

  for (const control of [controls.color, controls.weight, controls.radiusAuto, controls.radius, controls.intensityAuto, controls.intensity, controls.opacity]) {
    control.addEventListener("input", () => {
      showValues();
      heatmap.setStyle(readStyle());
      // the circles follow the heatmap's ramp — by hand, as they're a layer of their own
      if (points?.mode === "circles") (points as PointLayer).setStyle({ color: readRamp() });
    });
  }

  controls.circleSize.addEventListener("input", () => {
    showValues();
    if (points?.mode === "circles") (points as PointLayer).setStyle(readCircleRadii());
  });

  for (const control of [controls.transitionZoom, controls.transitionSpan]) {
    control.addEventListener("input", () => {
      showValues();
      applyTransition();
    });
  }

  controls.points.addEventListener("input", () => {
    showValues();
    replacePoints();
  });

  controls.visible.addEventListener("input", () => {
    heatmap.setVisible(controls.visible.checked);
    points?.setVisible(controls.visible.checked);
  });
  controls.belowLabels.addEventListener("input", place);

  controls.mapStyle.addEventListener("input", () => {
    map.setStyle(MAP_STYLES[controls.mapStyle.value]);
  });

  // the layers rebuild themselves on a new style, but its labels layer may not be in it, so they're placed again
  map.on("style.load", place);

  //#endregion

  //#region State

  function showValues() {
    el("radius-val").textContent = controls.radius.value;
    el("intensity-val").textContent = controls.intensity.value;
    el("opacity-val").textContent = controls.opacity.value;
    el("circle-size-val").textContent = `×${controls.circleSize.value}`;
    el("transition-zoom-val").textContent = controls.transitionZoom.value;
    el("transition-span-val").textContent = controls.transitionSpan.value;
    controls.circleSize.disabled = controls.points.value !== "circles";
    controls.transitionZoom.disabled = controls.points.value === "none";
    controls.transitionSpan.disabled = controls.points.value === "none";
  }

  function showState() {
    const zoomRangeOf = (id: string) => {
      const styleLayer = map.getLayer(id);
      return styleLayer ? `${String(styleLayer.minzoom)}–${String(styleLayer.maxzoom)}` : "—";
    };
    const sublayerIds = [...heatmap.getSublayerIds(), ...(points?.getSublayerIds() ?? [])];

    el("state").textContent = [
      `zoom ${map.getZoom().toFixed(2)}`,
      `heatmap ${heatmap.getZoomRange().join("–")}, fade ${String(heatmap.getFade())}`,
      points ? `points ${points.mode} ${points.getZoomRange().join("–")}, fade ${String(points.getFade())}` : "no points",
      `sublayers ${sublayerIds.map(zoomRangeOf).join(", ")}`,
      `source ${heatmap.getSourceId()}${points ? `, shared: ${String(points.getSourceId() === heatmap.getSourceId())}` : ""}`,
    ].join("\n");
  }

  function showClick(from: string, count: number, properties: unknown) {
    el("click").textContent = `${from}: ${String(count)} feature(s) hit\nfirst: ${JSON.stringify(properties)}`;
  }

  showValues();
  showState();
  map.on("zoom", showState);
  map.on("idle", showState);

  //#endregion
}

void main();
