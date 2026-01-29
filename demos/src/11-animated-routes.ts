import "../../build/maptiler-sdk.css";

import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";
import { AnimatedRouteLayer, AnimationEvent, Keyframe, KeyframeableGeoJSONFeature, Map, MapStyle, MaptilerAnimation, config, parseGeoJSONFeatureToKeyframes } from "../../src";
import { Marker, MarkerOptions } from "@maptiler/sdk";
import { type MapMLGL } from "@maptiler/sdk";

addPerformanceStats();
setupMapTilerApiKey({ config });

function getElementsByIds(ids: string[]) {
  return ids.map((id) => document.getElementById(id));
}

async function createMap() {
  const element = document.createElement("div");
  element.className = "map";
  document.body.appendChild(element);

  const map = new Map({
    container: element,
    style: MapStyle.OUTDOOR.DARK,
    hash: false,
    geolocateControl: false,
    navigationControl: false,
    terrain: true,
    bearing: 0,
    maxPitch: 65,
    pitch: 0,
    zoom: 8.59,
    centerClampedToGround: false,
    center: [-16.908952, 32.649586],
  });

  await map.onReadyAsync();

  return map;
}

async function loadGeoJSON(path: string) {
  const response = await fetch(path);
  const data = (await response.json()) as GeoJSON.FeatureCollection;
  return data;
}

async function main() {
  const pathGeojson = await loadGeoJSON("/routes/seixal-funchal.geojson");
  const markersGeojson = await loadGeoJSON("/routes/markers.geojson");

  const map = await createMap();

  const ROUTE_SOURCE_ID = "routes";
  const MARKER_SOURCE_ID = "markers";

  map.addSource(ROUTE_SOURCE_ID, {
    type: "geojson",
    data: pathGeojson,
    lineMetrics: true, // this is needed for the animated route
  });

  map.addSource(MARKER_SOURCE_ID, {
    type: "geojson",
    data: markersGeojson,
  });

  map.addLayer({
    id: ROUTE_SOURCE_ID,
    type: "line",
    source: ROUTE_SOURCE_ID,
    layout: {
      "line-join": "round",
      "line-cap": "round",
      visibility: "visible",
    },
    paint: {
      "line-color": `rgba(0, 255, 0, 0.75)`,
      "line-width": 8,
      "line-opacity": 0.75,
    },
  });

  const img = await map.loadImage("/routes/mt.png");

  map.addImage("maptiler", img.data);

  await new Promise((resolve) => {
    map.on("idle", resolve);
  });

  const animatedRouteLayer = new AnimatedRouteLayer({
    source: {
      id: ROUTE_SOURCE_ID,
      layerID: ROUTE_SOURCE_ID,
    },
    duration: 75000,
    // delay: 1000,
    iterations: 1,
    pathStrokeAnimation: {
      activeColor: [255, 123, 0, 0.75],
      inactiveColor: [0, 255, 0, 0.75],
    },
    cameraAnimation: {
      follow: true,
      pathSmoothing: {
        resolution: 1000,
        epsilon: 100,
      },
    },
  });

  map.addLayer(animatedRouteLayer);

  animatedRouteLayer.addEventListener("playbackratechange", (e) => {
    const playbackRateElement = document.getElementById("playbackRate");
    if (!playbackRateElement) return;
    playbackRateElement.innerText = e.playbackRate.toFixed(1) + "x";
  });

  const [playButton, pauseButton, fasterButton, slowerButton, timeButton] = getElementsByIds(["play", "pause", "faster", "slower", "time"]);

  (window as any).myPoints = [];

  const prologueAnimation = new MaptilerAnimation({
    keyframes: getPrologueKeyframes(),
    duration: 10000,
    iterations: 1,
  });

  const epilogueAnimation = new MaptilerAnimation({
    keyframes: getEpilogueKeyframes(),
    duration: 10000,
    iterations: 1,
  });

  let activeAnimation: MaptilerAnimation = prologueAnimation;

  // we're going to chain these animations together to create a loop
  prologueAnimation.addEventListener("animationend", () => {
    activeAnimation.pause();
    activeAnimation = animatedRouteLayer.animationInstance!;
    prologueAnimation.reset();
    animatedRouteLayer.animationInstance?.reset();
    activeAnimation.play();
  });

  animatedRouteLayer.addEventListener("animationend", (e: AnimationEvent) => {
    activeAnimation.pause();
    activeAnimation = epilogueAnimation;
    epilogueAnimation.reset();
    epilogueAnimation.play();
  });

  epilogueAnimation.addEventListener("animationend", () => {
    activeAnimation.pause();
    activeAnimation = prologueAnimation;
    prologueAnimation.reset();
    prologueAnimation.play();
  });

  animatedRouteLayer.addEventListener("timeupdate", (e: AnimationEvent) => {
    if (!timeButton) return;
    timeButton.innerText = e?.currentDelta.toString() ?? "0";
  });

  // update the map on every frame
  prologueAnimation.addEventListener("timeupdate", (e) => {
    const { lng, lat, zoom, bearing, pitch, elevation } = e.props;
    map.jumpTo({
      center: [lng, lat],
      zoom,
      bearing,
      pitch,
      elevation,
    });
  });

  // update the map on every frame
  epilogueAnimation.addEventListener("timeupdate", (e) => {
    const { lng, lat, zoom, bearing, pitch, elevation } = e.props;
    map.jumpTo({
      center: [lng, lat],
      zoom,
      bearing,
      pitch,
      elevation,
    });
  });

  const markerMovementKeyframes = parseGeoJSONFeatureToKeyframes(markersGeojson.features[0] as KeyframeableGeoJSONFeature, {
    pathSmoothing: false,
  });

  // now we create the marker movement animation
  const markerMovementAnimation = new MaptilerAnimation({
    keyframes: markerMovementKeyframes,
    duration: 10000,
    iterations: 1,
  });

  const element = document.createElement("div");
  element.style.width = "10px";
  element.style.height = "10px";
  element.style.background = "green";

  const whereAmIMarker = new Marker({
    element,
  }).addTo(map);

  markerMovementAnimation.addEventListener("timeupdate", (e) => {
    const { lng, lat } = e.props;
    whereAmIMarker.setLngLat(new LngLat(lng, lat));
  });

  timeButton?.addEventListener("click", () => {
    console.log(animatedRouteLayer.animationInstance?.getCurrentDelta());
    console.log(map.getBearing());
  });

  playButton?.addEventListener("click", () => {
    activeAnimation.play();
  });

  pauseButton?.addEventListener("click", () => {
    activeAnimation.pause();
  });

  fasterButton?.addEventListener("click", () => {
    if (!animatedRouteLayer.animationInstance) return;
    const currentSpeed = animatedRouteLayer.animationInstance.getPlaybackRate();
    animatedRouteLayer.animationInstance.setPlaybackRate(currentSpeed + 0.2);
  });

  slowerButton?.addEventListener("click", () => {
    if (!animatedRouteLayer.animationInstance) return;
    const currentSpeed = animatedRouteLayer.animationInstance.getPlaybackRate();
    animatedRouteLayer.animationInstance.setPlaybackRate(currentSpeed - 0.2);
  });
}

void main();

function getPrologueKeyframes(): Keyframe[] {
  return [
    {
      delta: 0,
      easing: "QuadraticInOut",
      props: {
        pitch: 0,
        bearing: 0,
        zoom: 8.59,
        lng: -16.908952,
        lat: 32.649586,
        elevation: 0,
      },
    },
    {
      delta: 1,
      props: {
        bearing: -156.49466366292853,
        zoom: 13.14256413193706,
        pitch: 58.769725012060896,
        lng: -17.107004,
        lat: 32.824355,
        elevation: 0,
      },
    },
  ];
}

function getEpilogueKeyframes(): Keyframe[] {
  return [
    {
      delta: 0,
      easing: "QuadraticInOut",
      props: {
        bearing: -35.240997486619506,
        zoom: 13.0753,
        pitch: 63.5,
        lng: -16.908952,
        lat: 32.649586,
        elevation: 1276,
      },
    },
    {
      delta: 1,
      props: {
        pitch: 0,
        bearing: 0,
        zoom: 8.59,
        lng: -16.908952,
        lat: 32.649586,
        elevation: 0,
      },
    },
  ];
}
