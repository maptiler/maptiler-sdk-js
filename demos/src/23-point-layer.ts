// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { ColorRampCollection, Map, MapStyle, PointLayer, config, helpers } from "../../src/index";
import type { GeoJSONSource, MapStyleVariant, MapTilerMarkerShape, MarkerStyle, PointLayerCirclesStyling, PointLayerMarkersCollisionBehaviour } from "../../src/index";
import { el, setupMapTilerApiKey } from "./demo-utils";
import { MarkerInteraction, loadQuakes, type QuakeFeature } from "./point-layer-interaction";

setupMapTilerApiKey({ config });

// Parity check for the circles port: the left map re-runs the deprecated
// `addPoint` helper from scratch on every change, the right map updates one
// PointLayer in place. Same data, same options — they should match.

const EARTHQUAKES_URL = "https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson";

// addPoint's default maxzoom — pinned on both so the default opacity fade matches
const MAXZOOM = 23;

// one shared instance, so both maps get the exact same ramp
const magnitudeRamp = ColorRampCollection.TURBO.scale(1, 7);

const controls = {
  color: el<HTMLSelectElement>("color"),
  property: el<HTMLSelectElement>("property"),
  radiusAuto: el<HTMLInputElement>("radius-auto"),
  radius: el<HTMLInputElement>("radius"),
  outline: el<HTMLInputElement>("outline"),
  zoomCompensation: el<HTMLInputElement>("zoom-compensation"),
  alignViewport: el<HTMLInputElement>("align-viewport"),
  showLabel: el<HTMLInputElement>("show-label"),
  minzoom: el<HTMLInputElement>("minzoom"),
};

/** Every styling key is always present — `undefined` resets it to the default on the PointLayer side. */
function readStyling(): PointLayerCirclesStyling {
  return {
    pointColor: controls.color.value === "ramp" ? magnitudeRamp : controls.color.value,
    property: controls.property.value || undefined,
    pointRadius: controls.radiusAuto.checked ? undefined : Number(controls.radius.value),
    outline: controls.outline.checked,
    zoomCompensation: controls.zoomCompensation.checked,
    alignOnViewport: controls.alignViewport.checked,
    showLabel: controls.showLabel.checked ? true : undefined,
  };
}

async function main() {
  // every control is read at startup too, as the browser restores their values on reload
  const mapOptions = { style: MAP_STYLES[el<HTMLSelectElement>("map-style").value], center: [-120, 40] as [number, number], zoom: 2.5 };
  const helperMap = new Map({ ...mapOptions, container: el("map-helper") });
  const layerMap = new Map({ ...mapOptions, container: el("map-layer") });

  await Promise.all([helperMap.onReadyAsync(), layerMap.onReadyAsync()]);

  syncCameras(helperMap, layerMap);

  //#region addPoint side

  // this demo compares against the deprecated helper on purpose
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  let helperIds: ReturnType<typeof helpers.addPoint> | null = null;

  function rebuildHelper() {
    if (helperIds) {
      for (const id of [helperIds.labelLayerId, helperIds.pointLayerId, helperIds.clusterLayerId]) {
        if (id && helperMap.getLayer(id)) helperMap.removeLayer(id);
      }
      // gone already when a new style wiped it
      if (helperMap.getSource(helperIds.pointSourceId)) helperMap.removeSource(helperIds.pointSourceId);
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    helperIds = helpers.addPoint(helperMap, {
      data: EARTHQUAKES_URL,
      ...readStyling(),
      minzoom: Number(controls.minzoom.value),
      maxzoom: MAXZOOM,
    });
  }

  //#endregion

  //#region PointLayer side

  const layer = new PointLayer({
    data: EARTHQUAKES_URL,
    styling: readStyling(),
    minzoom: Number(controls.minzoom.value),
    maxzoom: MAXZOOM,
  });

  layer.on("click", (e) => {
    console.log("PointLayer click", e.features?.[0]?.properties);
  });

  function updateLayer() {
    layer.setStyling(readStyling()).setZoomRange(Number(controls.minzoom.value), MAXZOOM);

    // the layer flushes on the next frame — log after it
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        console.log("PointLayer sublayers:", layer.getSublayerIds(), "styling:", layer.getStyling());
      });
    });
  }

  //#endregion

  el("minzoom-val").textContent = controls.minzoom.value;
  rebuildHelper();
  layerMap.addLayer(layer);

  for (const control of Object.values(controls)) {
    control.addEventListener("input", () => {
      el("minzoom-val").textContent = controls.minzoom.value;
      rebuildHelper();
      updateLayer();
    });
  }

  addDrawOrderExperiment(layerMap, layer);
  addStyleSwitcher(helperMap, layerMap, rebuildHelper);
}

/** By the map style select's values. */
const MAP_STYLES: Record<string, MapStyleVariant> = {
  "dataviz-light": MapStyle.DATAVIZ.LIGHT,
  "dataviz-dark": MapStyle.DATAVIZ.DARK,
  streets: MapStyle.STREETS.DEFAULT,
  base: MapStyle.BASE.DEFAULT,
  topo: MapStyle.TOPO.DEFAULT,
  hybrid: MapStyle.HYBRID.DEFAULT,
};

/** Switches both maps' style. PointLayers rebuild themselves; the helper's layers are re-added on `style.load`. */
function addStyleSwitcher(helperMap: Map, layerMap: Map, rebuildHelper: () => void) {
  const select = el<HTMLSelectElement>("map-style");
  helperMap.on("style.load", rebuildHelper);

  select.addEventListener("input", () => {
    const style = MAP_STYLES[select.value];
    helperMap.setStyle(style);
    layerMap.setStyle(style);
  });
}

//#region Draw order experiment

// Circles are drawn in source (or circle-sort-key) order, so with the camera
// pitched far points can draw over near ones. Symbols with
// `symbol-z-order: viewport-y` are sorted by screen y instead — lower on
// screen means nearer the camera for points on the ground.

const EXPERIMENT_ID = "draw-order-experiment";
const DOT_IMAGE_ID = `${EXPERIMENT_ID}-dot`;
const DOT_PIXEL_RATIO = 2;

/** A filled dot with a thick white outline, so it's obvious which of two overlapping dots is in front. */
function drawDotImage(): ImageData {
  const radius = 24 * DOT_PIXEL_RATIO;
  const outline = 3 * DOT_PIXEL_RATIO;
  const size = 2 * (radius + outline);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#e63946";
  ctx.fill();
  ctx.lineWidth = outline;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}

function addDrawOrderExperiment(map: Map, circlesLayer: PointLayer) {
  const renderer = el<HTMLSelectElement>("renderer");
  const zOrder = el<HTMLSelectElement>("z-order");
  const markersCollision = el<HTMLSelectElement>("markers-collision");
  const markerControls = {
    shape: el<HTMLSelectElement>("marker-shape"),
    outerAuto: el<HTMLInputElement>("marker-outer-auto"),
    outer: el<HTMLInputElement>("marker-outer"),
    innerAuto: el<HTMLInputElement>("marker-inner-auto"),
    inner: el<HTMLInputElement>("marker-inner"),
  };

  const readMarkerStyle = (): MarkerStyle => ({
    shape: markerControls.shape.value as MapTilerMarkerShape,
    size: "m",
    outline: true,
    // unset colours fall back to the style's adaptive defaults
    outerColor: markerControls.outerAuto.checked ? undefined : markerControls.outer.value,
    innerColor: markerControls.innerAuto.checked ? undefined : markerControls.inner.value,
  });

  // the real thing: a markers mode PointLayer, labels drawn into each marker image.
  // Its data is loaded below, as an object, so single features can be edited.
  const markersLayer = new PointLayer({
    mode: "markers",
    data: { type: "FeatureCollection", features: [] },
    styling: {
      marker: readMarkerStyle(),
      // a property per feature, computed from `mag` unless overridden — see point-layer-interaction.ts
      label: "label",
      // bigger quakes win where markers collide
      priority: ["get", "mag"],
      // so a cluster's count can't be mistaken for a magnitude
      clusterMarker: { shape: "circle", size: "l", outline: true },
    },
    collisionBehaviour: markersCollision.value as PointLayerMarkersCollisionBehaviour,
    visible: renderer.value === "markers",
  });
  map.addLayer(markersLayer);

  const interaction = setupMarkerInteraction(map, markersLayer);
  interaction.setEnabled(renderer.value === "markers");

  for (const control of Object.values(markerControls)) {
    control.addEventListener("input", () => {
      // the DOM stand-ins were built from the old style
      interaction.select(null);
      markersLayer.setStyling({ marker: readMarkerStyle() });
    });
  }

  markersCollision.addEventListener("input", () => {
    // the sublayers are rebuilt, dropping the interaction's hidden-marker override with them
    interaction.select(null);
    markersLayer.setCollisionBehaviour(markersCollision.value as PointLayerMarkersCollisionBehaviour);
  });

  // clicking a cluster zooms in until it splits
  markersLayer.on("click", (e) => {
    const clusterId = e.features?.[0]?.properties.cluster_id as number | undefined;
    if (clusterId === undefined) return;
    const feature = e.features?.[0];
    void map
      .getSource<GeoJSONSource>(markersLayer.getSourceId())
      ?.getClusterExpansionZoom(clusterId)
      .then((zoom) => {
        if (feature?.geometry.type === "Point") map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom });
      });
  });

  // the raw experiment: plain dots sized by magnitude, so there's plenty of overlap to judge the order by
  const addExperiment = () => {
    if (!map.hasImage(DOT_IMAGE_ID)) map.addImage(DOT_IMAGE_ID, drawDotImage(), { pixelRatio: DOT_PIXEL_RATIO });
    if (!map.getSource(EXPERIMENT_ID)) map.addSource(EXPERIMENT_ID, { type: "geojson", data: EARTHQUAKES_URL });
    if (map.getLayer(EXPERIMENT_ID)) return;
    map.addLayer({
      id: EXPERIMENT_ID,
      type: "symbol",
      source: EXPERIMENT_ID,
      layout: {
        "icon-image": DOT_IMAGE_ID,
        "icon-size": ["interpolate", ["linear"], ["get", "mag"], 1, 0.3, 7, 1.2],
        "icon-pitch-alignment": "viewport",
        // viewport-y only sorts when symbols are allowed to overlap
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "symbol-z-order": zOrder.value as "viewport-y" | "source",
        visibility: "none",
      },
    });
  };
  addExperiment();

  const apply = () => {
    circlesLayer.setVisible(renderer.value === "circles");
    markersLayer.setVisible(renderer.value === "markers");
    interaction.setEnabled(renderer.value === "markers");
    map.setLayoutProperty(EXPERIMENT_ID, "visibility", renderer.value === "symbols" ? "visible" : "none");
    map.setLayoutProperty(EXPERIMENT_ID, "symbol-z-order", zOrder.value as "viewport-y" | "source");
  };

  apply();
  renderer.addEventListener("input", apply);
  zOrder.addEventListener("input", apply);
  // a new style wipes the experiment — the PointLayers rebuild themselves
  map.on("style.load", () => {
    // the marker sublayers are rebuilt too, dropping the interaction's hidden-marker override
    interaction.select(null);
    addExperiment();
    apply();
  });
}

//#endregion

//#region Marker interaction

/**
 * Hover and selection for the markers layer, plus an editor for the selected
 * feature's data — each edit is a `setData`, and a new label a new image.
 */
function setupMarkerInteraction(map: Map, layer: PointLayer<"markers">): MarkerInteraction {
  const editor = el("selection-editor");
  const empty = el("selection-empty");
  const magInput = el<HTMLInputElement>("sel-mag");
  const labelInput = el<HTMLInputElement>("sel-label");

  // per role, so dot and cluster images show up too
  const renderImageCount = () => {
    const images = map.listImages();
    el("image-count").textContent = (["marker", "dot", "cluster"] as const)
      .map((role) => `${role} ${String(images.filter((id) => id.startsWith(`${layer.id}-${role}-`)).length)}`)
      .join(", ");
  };

  const renderSelection = (feature: QuakeFeature | null) => {
    editor.hidden = !feature;
    empty.hidden = Boolean(feature);
    if (!feature) return;
    el("sel-id").textContent = feature.properties.id;
    magInput.value = String(feature.properties.mag);
    labelInput.value = feature.properties.labelOverride ?? "";
    // the image id the layer requests for this feature: `["concat", prefix, label]`, evaluated
    const [sublayerId] = layer.getSublayerIds();
    const iconImage = sublayerId ? map.getLayoutProperty(sublayerId, "icon-image") : undefined;
    const prefix = Array.isArray(iconImage) ? String(iconImage[1]) : "";
    el("sel-image").textContent = `${prefix}${feature.properties.label}`;
  };

  const interaction = new MarkerInteraction({ map, layer, data: { type: "FeatureCollection", features: [] }, onSelect: renderSelection });

  const editSelected = (changes: Parameters<MarkerInteraction["updateFeature"]>[1]) => {
    const feature = interaction.getSelected();
    if (!feature) return;
    interaction.updateFeature(feature.properties.id, changes);
    renderSelection(feature);
  };

  magInput.addEventListener("input", () => {
    if (magInput.value !== "") editSelected({ mag: Number(magInput.value) });
  });
  labelInput.addEventListener("input", () => {
    editSelected({ labelOverride: labelInput.value || undefined });
  });
  el("sel-clear").addEventListener("click", () => {
    interaction.select(null);
  });

  map.on("idle", renderImageCount);
  void loadQuakes(EARTHQUAKES_URL).then((data) => {
    interaction.setData(data);
  });

  return interaction;
}

//#endregion

/** Mirrors camera moves between the two maps. */
function syncCameras(a: Map, b: Map) {
  let syncing = false;

  const mirror = (from: Map, to: Map) => () => {
    if (syncing) return;
    syncing = true;
    to.jumpTo({ center: from.getCenter(), zoom: from.getZoom(), bearing: from.getBearing(), pitch: from.getPitch() });
    syncing = false;
  };

  a.on("move", mirror(a, b));
  b.on("move", mirror(b, a));
}

void main();
