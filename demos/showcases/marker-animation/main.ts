// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, Marker, MaptilerAnimation, config } from "@maptiler/sdk";
import type { Keyframe, LngLatLike } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../shared/demo-utils";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.HYBRID.DEFAULT;

addPerformanceStats();
setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

// Waypoints of a rally loop around the Erg Chebbi dunes, in the Moroccan Sahara (approximate positions)
const WAYPOINTS: { name: string; lngLat: [number, number] }[] = [
  { name: "Merzouga", lngLat: [-4.013, 31.099] },
  { name: "Hassilabied", lngLat: [-4.028, 31.136] },
  { name: "Erg Chebbi north", lngLat: [-3.985, 31.18] },
  { name: "Dunes east", lngLat: [-3.955, 31.12] },
  { name: "Khamlia", lngLat: [-3.977, 31.035] },
];

/**
 * One keyframe per waypoint. A keyframe can hold any number of numeric props, so both cars share
 * a single animation: the red car drives the loop clockwise, the blue one anticlockwise.
 * The last keyframe repeats the first, so the animation loops seamlessly.
 */
function getKeyframes(): Keyframe[] {
  const stops = WAYPOINTS.length;
  return Array.from({ length: stops + 1 }, (_, i) => {
    const red = WAYPOINTS[i % stops];
    const blue = WAYPOINTS[(stops - i) % stops];
    return {
      delta: i / stops,
      // the easing applies from this keyframe to the next one: slow down at each waypoint
      easing: "SinusoidalInOut",
      props: {
        redLng: red.lngLat[0],
        redLat: red.lngLat[1],
        blueLng: blue.lngLat[0],
        blueLat: blue.lngLat[1],
      },
      // free-form data, handed back with the `keyframe` event
      userData: { red: red.name, blue: blue.name },
    };
  });
}

function createCar(color: string, title: string, lngLat: LngLatLike) {
  return new Marker({
    lngLat,
    title,
    icon: "car",
    shape: "circle",
    size: "l",
    innerColor: "#ffffff",
    outerColor: color,
    contentColor: color,
    subpixelPositioning: true,
  });
}

function getElementsByIds(ids: string[]) {
  return ids.map((id) => document.getElementById(id));
}

async function main() {
  const map = new Map({
    container: "map",
    style: MAP_STYLE,
    center: [-3.99, 31.107],
    zoom: 11,
  });

  await map.onReadyAsync();

  const redCar = createCar("#e5372b", "Red car", WAYPOINTS[0].lngLat);
  const blueCar = createCar("#1f6fe5", "Blue car", WAYPOINTS[0].lngLat);
  map.addMarker(redCar);
  map.addMarker(blueCar);

  const animation = new MaptilerAnimation({
    keyframes: getKeyframes(),
    duration: 20000,
    iterations: Infinity,
  });

  // `timeupdate` fires on every frame with the interpolated props
  animation.addEventListener("timeupdate", ({ props }) => {
    redCar.setLngLat([props.redLng, props.redLat]);
    blueCar.setLngLat([props.blueLng, props.blueLat]);
  });

  // `keyframe` fires when a keyframe is reached
  const [keyframeNameElement, playbackRateElement] = getElementsByIds(["keyframeName", "playbackRate"]);
  animation.addEventListener("keyframe", ({ keyframe }) => {
    if (!keyframeNameElement || !keyframe?.userData) return;
    keyframeNameElement.style.display = "inline-flex";
    const { red, blue } = keyframe.userData as { red: string; blue: string };
    keyframeNameElement.innerText = `Red at ${red}, blue at ${blue}`;
  });

  animation.addEventListener("playbackratechange", (e) => {
    if (!playbackRateElement) return;
    playbackRateElement.innerText = e.playbackRate.toFixed(1) + "x";
  });

  const [playButton, pauseButton, fasterButton, slowerButton, frameAdvanceButton] = getElementsByIds(["play", "pause", "faster", "slower", "frame-advance"]);

  playButton?.addEventListener("click", () => {
    animation.play();
  });

  pauseButton?.addEventListener("click", () => {
    animation.pause();
  });

  fasterButton?.addEventListener("click", () => {
    const currentSpeed = animation.getPlaybackRate();
    animation.setPlaybackRate(currentSpeed + 0.2);
  });

  slowerButton?.addEventListener("click", () => {
    const currentSpeed = animation.getPlaybackRate();
    animation.setPlaybackRate(currentSpeed - 0.2);
  });

  frameAdvanceButton?.addEventListener("click", () => {
    animation.setCurrentDelta(animation.getCurrentDelta() + 0.01);
  });

  animation.play();
}

void main();
