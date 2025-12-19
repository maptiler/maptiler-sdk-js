import "../../build/maptiler-sdk.css";
import { Layer3D } from "@maptiler/3d";
import { CustomLayerInterface, Map, MapStyle, config, Keyframe, MaptilerAnimation } from "../../src";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

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
    style: MapStyle.STREETS.DARK,
    hash: false,
    geolocateControl: false,
    navigationControl: false,
    terrain: true,
    bearing: -30,
    maxPitch: 60,
    minPitch: 60,
    pitch: 60,
    zoom: 16.3,
    maxZoom: 16.3,
    minZoom: 16.3,
    center: [55.2743164, 25.1973882],
  });

  await map.onReadyAsync();

  return map;
}

async function main() {
  const map = await createMap();

  const animation = new MaptilerAnimation({
    keyframes: getKeyframes() as Keyframe[],
    duration: 2500,
    iterations: Infinity,
  });

  const layer3D = new Layer3D("3d-scene");
  map.addLayer(layer3D as CustomLayerInterface);

  await layer3D.addMeshFromURL(
    // ID to give to this mesh, unique within this Layer3D instance
    "khalifa",

    // The URL of the mesh
    "/models/burj_khalifa/scene.gltf",

    // A set of options, these can be modified later
    {
      lngLat: [55.2743164, 25.1973882],
      heading: -2,
      scale: 0.013,
    },
  );

  await layer3D.addMeshFromURL(
    // ID to give to this mesh, unique within this Layer3D instance
    "ufo",

    // The URL of the mesh
    "/models/ufo/scene.gltf",

    // A set of options, these can be modified later
    {
      lngLat: [55.273, 25.197],
      altitude: 500,
      scale: 10,
    },
  );

  animation.addEventListener("timeupdate", (e) => {
    map.setBearing(map.getBearing() + 0.1);
    const ufo = layer3D.getItem3D("ufo");
    ufo?.modify({
      lngLat: [e.props.lng, e.props.lat],
      altitude: e.props.altitude,
    });
  });

  animation.addEventListener("playbackratechange", (e) => {
    const playbackRateElement = document.getElementById("playbackRate");
    if (!playbackRateElement) return;
    playbackRateElement.innerText = e.playbackRate.toFixed(1) + "x";
  });

  const [playButton, pauseButton, fasterButton, slowerButton] = getElementsByIds(["play", "pause", "faster", "slower"]);

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
}

void main();

function getKeyframes() {
  return [
    {
      delta: 0,
      easing: "ElasticInOut",
      props: {
        lng: 55.273,
        lat: 25.197,
        altitude: 300,
      },
    },
    {
      delta: 0.33333,
      easing: "ElasticInOut",
      props: {
        lng: 55.27439873444448,
        lat: 25.198719685352263,
        altitude: 250,
      },
    },
    {
      delta: 0.666666,
      easing: "ElasticInOut",
      props: {
        lng: 55.2753633312754,
        lat: 25.195489657613702,
        altitude: 350,
      },
    },
    {
      delta: 1.0,
      easing: "ElasticInOut",
      props: {
        lng: 55.273,
        lat: 25.197,
        altitude: 300,
      },
    },
  ];
}
