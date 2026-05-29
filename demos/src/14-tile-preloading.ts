import "../../build/maptiler-sdk.css";

import { LngLatBoundsLike, Map, MapStyle, config } from "../../src/index";
import { setupMapTilerApiKey } from "./demo-utils";

setupMapTilerApiKey({ config });

const progressBar = document.getElementById("progress-bar") as HTMLDivElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const preloadToggle = document.getElementById("preload-toggle") as HTMLInputElement;

type DataOption = {
  label: string;
  bounds: LngLatBoundsLike;
  minZoom: number;
  maxZoom: number;
};

const data: DataOption[] = [
  {
    label: "Scotland",
    bounds: [-5.998213657132084, 56.07739533738746, -4.7864188317924174, 55.126391218029596],
    minZoom: 9,
    maxZoom: 10,
  },
  {
    label: "US Northeast",
    bounds: [-77.01937270814145, 43.71560543660081, -72.09144046264676, 38.61293092283313],
    minZoom: 7,
    maxZoom: 8,
  },
];

function setProgress(done: number, total: number) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  progressBar.style.width = `${pct}%`;
  statusEl.textContent = `Preloading tiles… ${done} / ${total}`;
}

function setStatus(text: string) {
  progressBar.style.width = "0%";
  statusEl.textContent = text;
}

async function main() {
  const map = new Map({
    container: document.getElementById("map")!,
    style: MapStyle.STREETS.DEFAULT,
    center: [0, 20],
    zoom: 2,
    geolocateControl: false,
    useExperimentalTilePreloading: true,
  });

  await map.onReadyAsync();

  for (const d of data) {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.textContent = d.label;
    btn.addEventListener("click", async () => {
      btn.disabled = true;

      if (preloadToggle.checked) {
        setStatus(`Preloading ${d.label} (z${d.minZoom}–${d.maxZoom})…`);
        await map.preloadTilesForBounds({
          bounds: d.bounds,
          minZoom: d.minZoom,
          maxZoom: d.maxZoom,
          onProgress: (done, total) => setProgress(done, total),
          onError: (err) => console.warn("Tile preload error:", err),
        });
        setStatus(`Preloaded ${d.label}. Fitting bounds…`);
      } else {
        setStatus(`Fitting bounds for ${d.label} (no preload)…`);
      }

      map.fitBounds(d.bounds, { duration: 0 });
      btn.disabled = false;
    });
    document.getElementById("panel")!.appendChild(btn);
  }

  map.on("click", (e) => {
    console.log("Clicked", e.lngLat.lng, e.lngLat.lat, map.getZoom());
  });
}

void main();
