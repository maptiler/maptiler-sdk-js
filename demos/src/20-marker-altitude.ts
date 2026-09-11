import type { GeoJSONSource } from "maplibre-gl";
import { Map, MapStyle, Marker, config } from "../../src/index";
import { setupMapTilerApiKey } from "./demo-utils";

setupMapTilerApiKey({ config });

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} not found`);
  return found as T;
}

/** Throws instead of returning null — for required lookups inside a cloned `<template>`, where a miss means the template markup itself is wrong. */
function must<T>(value: T | null): T {
  if (!value) throw new Error("expected element not found in #drone-controls-template");
  return value;
}

// Altitude/ground-line math works under both mercator and globe (see
// altitude-math.ts's projectLngLatAltitude doc comment) — the sanctioned
// MaptilerProjectionControl (top-right) switches freely between the two.
// Terrain still gets disabled on globe (see the "projectiontransition"
// handler below), but that's an unrelated MapLibre globe+terrain+drag bug,
// not an altitude-math limitation.
//
// Glencoe, Scotland — steep glen walls either side, good for checking
// altitude/ground-line behaviour against real terrain relief.
const zoom = 13;
const center: [number, number] = [-4.988, 56.678];
const terrainExaggeration = 1.3;

interface Drone {
  id: string;
  label: string;
  lngLat: [number, number];
  color: string;
  groundLineClass: string;
  defaultAltitude: number;
}

const drones: Drone[] = [
  { id: "alt1", label: "Drone 1 altitude", lngLat: [-4.988, 56.678], color: "#e63946", groundLineClass: "groundline-red", defaultAltitude: 400 },
  { id: "alt2", label: "Drone 2 altitude", lngLat: [-4.978, 56.682], color: "#457b9d", groundLineClass: "groundline-blue", defaultAltitude: 900 },
  { id: "alt3", label: "Drone 3 altitude", lngLat: [-4.998, 56.674], color: "#2a9d8f", groundLineClass: "groundline-green", defaultAltitude: 150 },
];

async function main() {
  const map = new Map({
    container: el("map"),
    style: MapStyle.HYBRID.DEFAULT,
    zoom,
    center,
    pitch: 55,
    maxPitch: 90,
    bearing: -20,
    terrain: true,
    terrainExaggeration,
    terrainControl: true,
    projectionControl: true,
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

  // Each drone gets its own control block (slider + ground/sea radios),
  // cloned from the <template> in the HTML (#drone-controls-template) —
  // the radios get a unique `name` per drone below so each pair only
  // groups with its own drone, not the other two.
  const template = el<HTMLTemplateElement>("drone-controls-template");
  const controlsContainer = el("drone-controls");

  const markers = drones.map((drone) => {
    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const label = must(fragment.querySelector<HTMLElement>(".drone-label"));
    const slider = must(fragment.querySelector<HTMLInputElement>(".drone-altitude"));
    const valueLabel = must(fragment.querySelector<HTMLElement>(".drone-altitude-val"));
    const altrefRadios = Array.from(fragment.querySelectorAll<HTMLInputElement>(".drone-altref"));
    const unsetCheckbox = must(fragment.querySelector<HTMLInputElement>(".drone-unset"));

    label.textContent = drone.label;
    slider.value = String(drone.defaultAltitude);
    valueLabel.textContent = `${String(drone.defaultAltitude)}m`;
    altrefRadios.forEach((radio) => {
      radio.name = `altref-${drone.id}`; // unique per drone, or every drone's radios would fight over one shared selection
      radio.checked = radio.value === "ground";
    });

    // appendChild moves the fragment's nodes into the document — the
    // references above stay valid, they just now point at attached elements.
    controlsContainer.appendChild(fragment);

    const marker = new Marker({ shape: "bulb", outerColor: drone.color, draggable: true }).setLngLat(drone.lngLat).setGroundLine(true, { className: drone.groundLineClass });
    map.addMarker(marker);
    marker.setAltitude(drone.defaultAltitude, { relativeTo: "ground" });
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      addDropPoint([lngLat.lng, lngLat.lat], drone.color);
    });

    function currentAltitudeReference(): "ground" | "sea" {
      const checked = altrefRadios.find((radio) => radio.checked);
      return checked?.value === "sea" ? "sea" : "ground";
    }

    // Slider/radio changes are no-ops while unset — re-engaging altitude is
    // the checkbox's job (below), not theirs, so these just skip out early
    // rather than fighting over what the marker's altitude currently means.
    slider.addEventListener("input", () => {
      const meters = Number(slider.value);
      valueLabel.textContent = `${String(meters)}m`;
      if (unsetCheckbox.checked) return;
      marker.setAltitude(meters, { relativeTo: currentAltitudeReference() });
    });

    altrefRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!radio.checked || unsetCheckbox.checked) return;
        marker.setAltitude(Number(slider.value), { relativeTo: currentAltitudeReference() });
      });
    });

    unsetCheckbox.addEventListener("change", () => {
      slider.disabled = unsetCheckbox.checked;
      altrefRadios.forEach((radio) => (radio.disabled = unsetCheckbox.checked));
      if (unsetCheckbox.checked) {
        // Skips all per-frame altitude tracking — the marker drapes onto
        // MapLibre's own native (terrain-following, if the map has terrain)
        // position, same as a marker that never called setAltitude() at all.
        marker.setAltitude(false);
      } else {
        marker.setAltitude(Number(slider.value), { relativeTo: currentAltitudeReference() });
      }
    });

    return marker;
  });

  map.on("projectiontransition", () => {
    // Globe + terrain + a pitch/rotate drag currently throws inside
    // MapLibre itself (globe's camera-drag helper calls
    // getRayDirectionFromPixel, which mercator_transform.ts only stubs as
    // "Not implemented" — a MapLibre bug, nothing to do with this SDK's
    // altitude code, but it kills map interaction entirely). Side-step it
    // by disabling terrain while on globe, restoring it back on mercator.
    if (map.isGlobeProjection()) map.disableTerrain();
    else map.enableTerrain(terrainExaggeration);
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
