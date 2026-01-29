import "../../build/maptiler-sdk.css";

import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";
import { AnimatedRouteLayer, AnimationEvent, Keyframe, Map, MapStyle, MaptilerAnimation, config } from "../../src";

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

  prologueAnimation.addEventListener("animationend", () => {
    activeAnimation.pause();
    activeAnimation = animatedRouteLayer.animationInstance!;
    animatedRouteLayer.animationInstance?.reset();
    animatedRouteLayer.play();
  });

  animatedRouteLayer.addEventListener("animationend", (e: AnimationEvent) => {
    activeAnimation.pause();
    console.log({
      delta: animatedRouteLayer.animationInstance?.getCurrentDelta(),
      center: map.getCenter(),
      elevation: map.getCenterElevation(),
      bearing: map.getBearing(),
      props: e.props,
    });
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
        elevation: 32.35,
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

// const mypoints = [{"delta":0.061960000000000084,"bearing":-171.50543205677653,"zoom":13.117340623215423,"pitch":39.5992891259068},{"delta":0.12344,"bearing":54.96458019542047,"zoom":13.581422218649983,"pitch":39.9340470619825},{"delta":0.21557333333333242,"bearing":127.29447285703202,"zoom":14.351410440742471,"pitch":63.57212173955401},{"delta":0.2846533333333321,"bearing":28.605724880156686,"zoom":13.450601557426998,"pitch":50},{"delta":0.3668399999999984,"bearing":0,"zoom":12.264375778407253,"pitch":47.30034637299098},{"delta":0.4561199999999981,"bearing":-73.6064725687109,"zoom":12.95688067812632,"pitch":44.334295438261506},{"delta":0.49803999999999815,"bearing":-158.6689545581767,"zoom":13.883302499065564,"pitch":49.49999999999999},{"delta":0.5812933333333319,"bearing":84.68328562335931,"zoom":12.905923436921514,"pitch":60.99999999999999},{"delta":0.645506666666664,"bearing":3.832185863346922,"zoom":12.879782611011592,"pitch":51.78504402295421},{"delta":0.7245333333333299,"bearing":-159.7396721677124,"zoom":12.847611374473363,"pitch":38.9299389019653},{"delta":0.7769199999999963,"bearing":-88.32820434318954,"zoom":12.415005562442978,"pitch":45.363090914726385},{"delta":0.8032933333333296,"bearing":-86.55279838734833,"zoom":14.455996347119342,"pitch":35.52472019881997},{"delta":0.9414533333333287,"bearing":-48.26245912693906,"zoom":12.759304668342025,"pitch":50.5827640726472},{"delta":0.9953733333333288,"bearing":-35.240997486619506,"zoom":13.075306851078034,"pitch":63.50000000000001}]
// mypoints.reduce((acc, curr) => {
//   if (Object.keys(acc).length === 0) {
//     Object.keys(curr).forEach(key => {
//       acc[key] = [];
//     });
//   }

//   Object.keys(curr).forEach(key => {
//     acc[key].push(curr[key]);
//   });

//   return acc;
// }, {});
