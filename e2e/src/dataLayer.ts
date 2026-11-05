import "../../dist/maptiler-sdk.css";
import { Map as MapTiler, MapStyle, setWorkerUrl, type StyleSpecification } from "../../src/index";
import { DataLayer, type DataLayerConstructorOptions } from "../../src/data-layers/DataLayer";
import type { Map as SDKMap } from "../../src/Map";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// MapLibre v6 loads its worker as a separate module, bundlers need its URL set explicitly
setWorkerUrl(workerUrl);

// A minimal DataLayer on a real map, fed a dataset UUID (the test mocks the dataset request).
// Its event listeners are attached straight after addLayer, so the first dataloading must still reach them.
// Everything the test needs to check is recorded on window.__dataLayer.

const DATASET_ID = "0b1c6a2e-4f3d-4c8b-9a7e-2d5f8e1c3b4a";
const CIRCLE_COLOR: [number, number, number] = [255, 0, 0];

class CircleLayer extends DataLayer<Record<string, never>, "circles"> {
  constructor(options: DataLayerConstructorOptions<Record<string, never>>) {
    super("e2e-circle-layer", "circles", options);
  }

  protected addSublayers(map: SDKMap): void {
    this.addSublayer(map, {
      id: `${this.id}-circle`,
      type: "circle",
      source: this.getSourceId(),
      paint: { "circle-color": `rgb(${CIRCLE_COLOR.join(",")})`, "circle-radius": 16 },
    });
  }

  protected applyStyling(): boolean {
    return true;
  }

  protected resolveStyling(): Record<string, never> {
    return {};
  }
}

// a different style from the mocked one, set as an object so the SDK diffs it
const objectStyle: StyleSpecification = {
  version: 8,
  sources: {
    raster: {
      type: "raster",
      tiles: ["https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=DOESNT_MATTER"],
      tileSize: 256,
    },
  },
  projection: { type: "globe" },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#202020" } },
    { id: "raster", type: "raster", source: "raster" },
  ],
};

const map = new MapTiler({
  container: "map",
  apiKey: "DOESNT_MATTER",
  style: MapStyle.SATELLITE,
  zoom: 3,
  center: [0, 0],
});

window.__map = map;

const layer = new CircleLayer({ id: "e2e-data-layer", data: DATASET_ID });

const state = {
  datasetId: DATASET_ID,
  circleColor: CIRCLE_COLOR,
  point: [0, 0] as [number, number],
  layerId: layer.id,
  sourceId: layer.getSourceId(),
  events: [] as string[],
  loads: 0,
  idleLoads: 0,
  reset() {
    state.events.length = 0;
  },
  swapStyle(kind: "url" | "object") {
    map.setStyle(kind === "url" ? MapStyle.STREETS : objectStyle);
  },
  getSublayerIds() {
    return layer.getSublayerIds();
  },
};

window.__dataLayer = state;

map.on("load", () => {
  map.addLayer(layer);

  layer.on("dataloading", () => state.events.push("dataloading"));
  layer.on("error", (e) => state.events.push(`error:${e.error.message}`));
  layer.on("data", () => {
    state.events.push("data");
    state.loads += 1;
    const load = state.loads;
    void map.once("idle", () => {
      state.idleLoads = load;
    });
  });
});
