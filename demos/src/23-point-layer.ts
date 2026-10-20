// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { ColorRampCollection, Map, MapStyle, PointLayer, config, helpers } from "../../src/index";
import type { PointLayerCirclesCollisionBehaviour, PointLayerCirclesStyling } from "../../src/index";
import { el, setupMapTilerApiKey } from "./demo-utils";

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
  collision: el<HTMLSelectElement>("collision"),
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

function readCollisionBehaviour(): PointLayerCirclesCollisionBehaviour {
  return controls.collision.value as PointLayerCirclesCollisionBehaviour;
}

async function main() {
  const mapOptions = { style: MapStyle.DATAVIZ.LIGHT, center: [-120, 40] as [number, number], zoom: 2.5 };
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
      helperMap.removeSource(helperIds.pointSourceId);
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    helperIds = helpers.addPoint(helperMap, {
      data: EARTHQUAKES_URL,
      ...readStyling(),
      cluster: readCollisionBehaviour() === "cluster",
      minzoom: Number(controls.minzoom.value),
      maxzoom: MAXZOOM,
    });
  }

  //#endregion

  //#region PointLayer side

  const layer = new PointLayer({
    data: EARTHQUAKES_URL,
    styling: readStyling(),
    collisionBehaviour: readCollisionBehaviour(),
    minzoom: Number(controls.minzoom.value),
    maxzoom: MAXZOOM,
  });

  layer.on("click", (e) => {
    console.log("PointLayer click", e.features?.[0]?.properties);
  });

  function updateLayer() {
    layer.setStyling(readStyling()).setCollisionBehaviour(readCollisionBehaviour()).setZoomRange(Number(controls.minzoom.value), MAXZOOM);

    // the layer flushes on the next frame — log after it
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        console.log("PointLayer sublayers:", layer.getSublayerIds(), "styling:", layer.getStyling());
      });
    });
  }

  //#endregion

  rebuildHelper();
  layerMap.addLayer(layer);

  for (const control of Object.values(controls)) {
    control.addEventListener("input", () => {
      el("minzoom-val").textContent = controls.minzoom.value;
      rebuildHelper();
      updateLayer();
    });
  }
}

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
