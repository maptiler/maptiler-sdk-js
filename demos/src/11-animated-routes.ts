import "../../build/maptiler-sdk.css";

import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";
import { AnimatedRouteLayer, AnimationEvent, Keyframe, Map, MapStyle, config } from "../../src";

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
    bearing: -30,
    maxPitch: 65,
    pitch: 60,
    zoom: 17,
    center: [-7.453472539769251, 39.415519175998355],
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
  const pathGeojson = await loadGeoJSON("/routes/run.geojson");
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

  map.addLayer({
    id: MARKER_SOURCE_ID,
    type: "symbol",
    source: MARKER_SOURCE_ID,
    layout: {
      "icon-image": "maptiler",
      "icon-size": 0.2,
    },
    paint: {},
  });

  const animatedRouteLayer = new AnimatedRouteLayer({
    source: {
      id: ROUTE_SOURCE_ID,
      layerID: ROUTE_SOURCE_ID,
    },
    duration: 25000,
    iterations: 3,
    pathStrokeAnimation: {
      activeColor: [255, 123, 0, 0.75],
      inactiveColor: [0, 255, 0, 0.75],
    },
    cameraAnimation: {
      follow: true,
      pathSmoothing: {
        resolution: 20,
        epsilon: 10,
      },
    },
  });

  map.addLayer(animatedRouteLayer);

  const animatedMarkersLayer = new AnimatedRouteLayer({
    keyframes: getKeyframes() as Keyframe[],
    duration: 15000,
    delay: 1000,
    iterations: 5,
    cameraAnimation: {
      follow: true,
      pathSmoothing: false,
    },
  });

  const keyframeNameElement = document.getElementById("keyframeName");

  animatedRouteLayer.addEventListener("animationend", () => {
    if (!keyframeNameElement) return;
    map.removeLayer(animatedRouteLayer.id).addLayer(animatedMarkersLayer);

    keyframeNameElement.style.display = "block";

    animatedMarkersLayer.play();
  });

  animatedMarkersLayer.addEventListener("animationend", () => {
    if (!keyframeNameElement) return;
    map.removeLayer(animatedMarkersLayer.id).addLayer(animatedRouteLayer);

    keyframeNameElement.style.display = "none";

    animatedRouteLayer.play();
  });

  animatedMarkersLayer.addEventListener("keyframe", (e: AnimationEvent) => {
    const keyframeName = e.keyframe?.userData?.name;
    if (keyframeNameElement) keyframeNameElement.innerText = keyframeName;
  });

  animatedRouteLayer.addEventListener("playbackratechange", (e) => {
    const playbackRateElement = document.getElementById("playbackRate");
    if (!playbackRateElement) return;
    playbackRateElement.innerText = e.playbackRate.toFixed(1) + "x";
  });

  const [playButton, pauseButton, fasterButton, slowerButton] = getElementsByIds(["play", "pause", "faster", "slower"]);

  playButton?.addEventListener("click", () => {
    animatedRouteLayer.play();
  });

  pauseButton?.addEventListener("click", () => {
    animatedRouteLayer.pause();
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

function getKeyframes() {
  return [
    {
      delta: 0,
      easing: "ElasticOut",
      userData: {
        name: "Start",
      },
      props: {
        lng: -7.453472539769251,
        lat: 39.415519175998355,
        zoom: 16,
        pitch: 40,
        bearing: -30,
      },
    },
    {
      delta: 0.1,
      easing: "ElasticOut",
      userData: {
        name: "Nossa Senhora da Penha 1",
      },
      props: {
        lng: -7.464899329058538,
        lat: 39.41042140236023,
        zoom: 16,
        pitch: 60,
        bearing: -70,
      },
    },
    {
      delta: 0.3,
      easing: "ElasticOut",
      userData: {
        name: "Nossa Senhora da Penha 2",
      },
      props: {
        lng: -7.464899329058538,
        lat: 39.41042140236023,
        zoom: 16,
        pitch: 60,
        bearing: -70,
      },
    },
    {
      delta: 0.5,
      easing: "ElasticOut",
      userData: {
        name: "Farmland 1",
      },
      props: {
        lng: -7.445160082758153,
        lat: 39.41918918515162,
        zoom: 15,
        pitch: 90,
        bearing: -150,
      },
    },
    {
      delta: 0.7,
      easing: "BounceIn",
      userData: {
        name: "Farmland 2",
      },
      props: {
        lng: -7.445160082758153,
        lat: 39.41918918515162,
        zoom: 15,
      },
    },
    {
      delta: 0.8,
      easing: "BounceOut",
      userData: {
        name: "Castelo de Vide: Castelo 1",
      },
      props: {
        lng: -7.457803520606888,
        lat: 39.41755616216083,
        zoom: 16,
      },
    },
    {
      delta: 0.9,
      easing: "ElasticOut",
      userData: {
        name: "Castelo de Vide: Castelo 1",
      },
      props: {
        lng: -7.457803520606888,
        lat: 39.41755616216083,
        zoom: 16,
      },
    },
    {
      delta: 1,
      easing: "ElasticOut",
      userData: {
        name: "Finish",
      },
      props: {
        lng: -7.453472539769251,
        lat: 39.415519175998355,
        zoom: 17,
        pitch: 60,
        bearing: -330,
      },
    },
  ];
}
