import "../../build/maptiler-sdk.css";

import { Map, MapStyle, config, setMaxParallelImageRequests, setWorkerCount } from "../../src/index";
import { setupMapTilerApiKey } from "./demo-utils";

setupMapTilerApiKey({ config });

const progressBar = document.getElementById("progress-bar") as HTMLDivElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const preloadToggle = document.getElementById("preload-toggle") as HTMLInputElement;
const preprocessToggle = document.getElementById("preprocess-toggle") as HTMLInputElement;
const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(".destination-btn"));

setWorkerCount(4);
setMaxParallelImageRequests(16);

const map = new Map({
  container: document.getElementById("map")!,
  style: MapStyle.STREETS.DEFAULT,
  center: [0, 20],
  zoom: 2,
  geolocateControl: false,
  useExperimentalTilePreloading: true,
});

function setProgress(done: number, total: number) {
  progressBar.style.width = total > 0 ? `${(done / total) * 100}%` : "0%";
  statusEl.textContent = `Preloading… ${done} / ${total} tiles`;
}

function setStatus(text: string) {
  progressBar.style.width = "0%";
  statusEl.textContent = text;
}

function setButtonsDisabled(disabled: boolean) {
  buttons.forEach((btn) => (btn.disabled = disabled));
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const lng = parseFloat(btn.dataset.lng!);
    const lat = parseFloat(btn.dataset.lat!);
    const zoom = parseFloat(btn.dataset.zoom!);
    const label = btn.textContent!.trim();

    setButtonsDisabled(true);

    if (preloadToggle.checked) {
      setStatus(`Preloading tiles for ${label}…`);

      map.flyTo({
        center: [lng, lat],
        zoom,
        duration: 4000,
        experimental_preload: {
          preprocessTiles: preprocessToggle.checked,
          onProgress: (done, total) => setProgress(done, total),
          onError: (err) => console.warn("Preload error:", err),
        },
      });
    } else {
      setStatus(`Flying to ${label}…`);
      map.flyTo({ center: [lng, lat], zoom, duration: 4000 });
    }

    map.once("moveend", () => {
      setStatus(`Arrived at ${label}.`);
      setButtonsDisabled(false);
    });
  });
});
