// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import type { FeatureCollection, Point } from "geojson";
import { Map, MapStyle, config } from "../../src/index";
import type { Map as SDKMap } from "../../src/Map";
import { DataLayer, type DataLayerConstructorOptions } from "../../src/data-layers/DataLayer";
import { el, setupMapTilerApiKey } from "./demo-utils";

setupMapTilerApiKey({ config });

// Exercises the DataLayer base through a throwaway subclass: two paint-path
// styling props (`color`, `radius`) and one structural prop (`halo`, which
// adds a sublayer and so forces a rebuild). Everything else — data, display,
// events, style swaps — is the base class's own behaviour.

//#region DemoCircleLayer

type DemoStyling = {
  color?: string;
  radius?: number;
  halo?: boolean;
};

class DemoCircleLayer extends DataLayer<DemoStyling, "circles"> {
  constructor(options: DataLayerConstructorOptions<DemoStyling>) {
    super("demo-circle-layer", "circles", options);
  }

  protected addSublayers(map: SDKMap): void {
    const styling = this.resolveStyling();

    if (styling.halo) {
      this.addSublayer(map, {
        id: `${this.id}-halo`,
        type: "circle",
        source: this.getSourceId(),
        paint: { "circle-color": styling.color, "circle-radius": (styling.radius ?? 0) * 2.5, "circle-opacity": 0.25 },
      });
    }

    this.addSublayer(map, {
      id: `${this.id}-circle`,
      type: "circle",
      source: this.getSourceId(),
      paint: { "circle-color": styling.color, "circle-radius": styling.radius, "circle-stroke-color": "#fff", "circle-stroke-width": 1 },
    });
  }

  protected applyStyling(changed: Set<keyof DemoStyling>): boolean {
    // adding/removing the halo sublayer is structural
    if (changed.has("halo")) return false;

    const map = this.map;
    if (!map) return true;

    const styling = this.resolveStyling();
    for (const layerId of this.getSublayerIds()) {
      const isHalo = layerId.endsWith("-halo");
      map.setPaintProperty(layerId, "circle-color", styling.color);
      map.setPaintProperty(layerId, "circle-radius", (styling.radius ?? 0) * (isHalo ? 2.5 : 1));
    }
    return true;
  }

  protected resolveStyling(): DemoStyling {
    return { color: "#e63946", radius: 6, halo: false, ...this.styling };
  }
}

//#endregion

//#region Data

function randomPoints(count: number): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: Array.from({ length: count }, (_, i) => ({
      type: "Feature",
      properties: { index: i },
      geometry: { type: "Point", coordinates: [Math.random() * 300 - 150, Math.random() * 120 - 60] },
    })),
  };
}

const EARTHQUAKES_URL = "https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson";

//#endregion

//#region UI

const logEl = el("log");
const stateEl = el("state");

function log(message: string) {
  const time = new Date().toLocaleTimeString([], { hour12: false });
  logEl.textContent = `${time}  ${message}\n${logEl.textContent ?? ""}`.split("\n").slice(0, 60).join("\n");
}

//#endregion

async function main() {
  const map = new Map({
    container: el("map"),
    style: MapStyle.STREETS,
    center: [0, 20],
    zoom: 1.5,
  });

  await map.onReadyAsync();

  const layer = new DemoCircleLayer({ data: randomPoints(200), styling: { color: el<HTMLInputElement>("color").value } });

  //#region Events

  layer
    .on("click", (e) => {
      log(`click — ${String(e.features?.length ?? 0)} feature(s), first: ${JSON.stringify(e.features?.[0]?.properties)}`);
    })
    .on("mouseenter", () => {
      map.getCanvas().style.cursor = "pointer";
      log("mouseenter");
    })
    .on("mouseleave", () => {
      map.getCanvas().style.cursor = "";
      log("mouseleave");
    })
    .on("dataloading", () => {
      log("dataloading");
    })
    .on("data", () => {
      log("data");
    })
    .on("error", (e) => {
      log(`error — ${e.error.message}`);
    });

  //#endregion

  //#region State Panel

  // rendered after the layer's own flush (next frame) so it shows applied state
  function renderState() {
    requestAnimationFrame(() => {
      const order = map.getLayersOrder();
      const ownIds = [layer.id, ...layer.getSublayerIds()];
      const positions = ownIds.map((id) => `  ${String(order.indexOf(id)).padStart(3)}  ${id.replace(layer.id, "<id>")}`);
      const data = layer.getData();

      stateEl.textContent = [
        `id: ${layer.id}`,
        `on map: ${String(Boolean(map.getLayer(layer.id)))}`,
        `source: ${String(Boolean(map.getSource(layer.getSourceId())))}`,
        `visible: ${String(layer.isVisible())}  zoom range: ${JSON.stringify(layer.getZoomRange())}`,
        `data: ${typeof data === "string" ? data : `${data.type} (object)`}`,
        `styling: ${JSON.stringify(layer.getStyling())}`,
        `layer order (of ${String(order.length)}):`,
        ...positions,
      ].join("\n");
    });
  }

  map.on("styledata", renderState);
  for (const input of document.querySelectorAll("button, input")) {
    input.addEventListener("click", renderState);
    input.addEventListener("input", renderState);
  }

  //#endregion

  //#region Controls

  el("add").addEventListener("click", () => {
    if (map.getLayer(layer.id)) {
      log("already added");
      return;
    }
    map.addLayer(layer);
    log("map.addLayer(layer)");
  });

  el("add-below-labels").addEventListener("click", () => {
    if (map.getLayer(layer.id)) map.removeLayer(layer.id);
    const firstSymbol = map.getStyle().layers.find((l) => l.type === "symbol")?.id;
    map.addLayer(layer, firstSymbol);
    log(`map.addLayer(layer, "${firstSymbol ?? "—"}")`);
  });

  el("remove").addEventListener("click", () => {
    if (!map.getLayer(layer.id)) {
      log("not on map");
      return;
    }
    map.removeLayer(layer.id);
    log("map.removeLayer(layer.id)");
  });

  el("data-random").addEventListener("click", () => {
    layer.setData(randomPoints(200));
    log("setData(200 random points)");
  });

  el("data-url").addEventListener("click", () => {
    layer.setData(EARTHQUAKES_URL);
    log("setData(earthquakes URL)");
  });

  el("data-bad-url").addEventListener("click", () => {
    layer.setData("https://example.invalid/nothing.geojson");
    log("setData(bad URL) — expect an error event");
  });

  el("data-burst").addEventListener("click", () => {
    for (let i = 0; i < 100; i++) layer.setData(randomPoints(50 + i));
    log("100× setData in one tick — expect one dataloading/data pair");
  });

  el<HTMLInputElement>("color").addEventListener("input", (e) => {
    layer.setStyling({ color: (e.target as HTMLInputElement).value });
  });

  el<HTMLInputElement>("radius").addEventListener("input", (e) => {
    layer.setStyling({ radius: Number((e.target as HTMLInputElement).value) });
  });

  el("reset-styling").addEventListener("click", () => {
    layer.setStyling({ color: undefined, radius: undefined });
    log("setStyling({ color: undefined, radius: undefined })");
  });

  el<HTMLInputElement>("halo").addEventListener("change", (e) => {
    const halo = (e.target as HTMLInputElement).checked;
    layer.setStyling({ halo });
    log(`setStyling({ halo: ${String(halo)} }) — rebuild`);
  });

  el<HTMLInputElement>("visible").addEventListener("change", (e) => {
    layer.setVisible((e.target as HTMLInputElement).checked);
  });

  el<HTMLInputElement>("minzoom").addEventListener("input", (e) => {
    const minzoom = Number((e.target as HTMLInputElement).value);
    el("minzoom-val").textContent = String(minzoom);
    layer.setZoomRange(minzoom, 24);
  });

  // alternate between two styles so every swap is a real change
  let urlToggle = false;
  el("style-url").addEventListener("click", () => {
    urlToggle = !urlToggle;
    map.setStyle(urlToggle ? MapStyle.DATAVIZ : MapStyle.STREETS);
    log(`setStyle(${urlToggle ? "DATAVIZ" : "STREETS"}) — URL, full rebuild`);
  });

  let objectToggle = false;
  el("style-object").addEventListener("click", () => {
    objectToggle = !objectToggle;
    const styleId = objectToggle ? "dataviz" : "streets-v2";
    void fetch(`https://api.maptiler.com/maps/${styleId}/style.json?key=${config.apiKey}`)
      .then((response) => response.json())
      .then((style: Parameters<typeof map.setStyle>[0]) => {
        map.setStyle(style);
        log(`setStyle(${styleId} JSON) — object, diff`);
      });
  });

  //#endregion

  map.addLayer(layer);
  log("map.addLayer(layer)");
  renderState();
}

void main();
