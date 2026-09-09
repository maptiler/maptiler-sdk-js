import type { GeoJSONSource } from "maplibre-gl";
import { Map, MapStyle, Marker, config } from "../../src/index";
import { setupMapTilerApiKey } from "./demo-utils";

setupMapTilerApiKey({ config });

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} not found`);
  return found as T;
}

// Mercator only — see altitude-math.ts's projectLngLatAltitude doc comment.
// Don't switch this demo to `projection: "globe"`.
//
// Glencoe, Scotland — steep glen walls either side, good for checking
// altitude/ground-line behaviour against real terrain relief.
const zoom = 13;
const center: [number, number] = [-4.988, 56.678];

interface Drone {
  id: string;
  lngLat: [number, number];
  color: string;
  groundLineClass: string;
}

const drones: Drone[] = [
  { id: "alt1", lngLat: [-4.988, 56.678], color: "#e63946", groundLineClass: "groundline-red" },
  { id: "alt2", lngLat: [-4.978, 56.682], color: "#457b9d", groundLineClass: "groundline-blue" },
  { id: "alt3", lngLat: [-4.998, 56.674], color: "#2a9d8f", groundLineClass: "groundline-green" },
];

async function main() {
  const map = new Map({
    container: el("map"),
    style: MapStyle.HYBRID.DEFAULT,
    zoom,
    center,
    pitch: 55,
    bearing: -20,
    terrain: true,
    terrainExaggeration: 1.3,
  });

  await map.onLoadAsync();

  // Drop points: one added per marker each time a drag ends, at the lngLat
  // it was released over (altitude is a pixel offset only — it never
  // changes the marker's actual lngLat, so this is exactly "where dropped").
  const dropFeatures: GeoJSON.Feature<GeoJSON.Point, { color: string }>[] = [];

  map.addSource("altitude-drop-points", {
    type: "geojson",
    data: { type: "FeatureCollection", features: dropFeatures },
  });
  map.addLayer({
    id: "altitude-drop-points",
    type: "circle",
    source: "altitude-drop-points",
    paint: {
      "circle-radius": 5,
      "circle-color": ["get", "color"],
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#ffffff",
    },
  });

  function addDropPoint(lngLat: [number, number], color: string) {
    dropFeatures.push({ type: "Feature", geometry: { type: "Point", coordinates: lngLat }, properties: { color } });
    map.getSource<GeoJSONSource>("altitude-drop-points")?.setData({ type: "FeatureCollection", features: dropFeatures });
  }

  let altitudeReference: "ground" | "sea" = "ground";

  const markers = drones.map((drone) => {
    const marker = new Marker({ shape: "bulb", outerColor: drone.color, draggable: true }).setLngLat(drone.lngLat).setGroundLine(true, { className: drone.groundLineClass });
    map.addMarker(marker);
    marker.setAltitude(Number(el<HTMLInputElement>(drone.id).value), { relativeTo: altitudeReference });
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      addDropPoint([lngLat.lng, lngLat.lat], drone.color);
    });
    return marker;
  });

  drones.forEach((drone, i) => {
    const slider = el<HTMLInputElement>(drone.id);
    const valueLabel = el(`${drone.id}-val`);
    slider.addEventListener("input", () => {
      const meters = Number(slider.value);
      valueLabel.textContent = `${String(meters)}m`;
      markers[i].setAltitude(meters, { relativeTo: altitudeReference });
    });
  });

  document.querySelectorAll<HTMLInputElement>('input[name="altref"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      altitudeReference = radio.value as "ground" | "sea";
      markers.forEach((marker) => marker.setAltitude(marker.getAltitude(), { relativeTo: altitudeReference }));
    });
  });

  const pitchSlider = el<HTMLInputElement>("pitch");
  const pitchValue = el("pitch-val");
  pitchSlider.addEventListener("input", () => {
    const pitch = Number(pitchSlider.value);
    pitchValue.textContent = `${String(pitch)}°`;
    map.setPitch(pitch);
  });

  el<HTMLInputElement>("groundlines").addEventListener("change", (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    markers.forEach((marker, i) => marker.setGroundLine(checked, { className: drones[i].groundLineClass }));
  });
}

void main();
