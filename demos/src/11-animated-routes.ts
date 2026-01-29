import "../../build/maptiler-sdk.css";

import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";
import {
  AnimatedRouteLayer,
  AnimationEvent,
  Keyframe,
  KeyframeableGeoJSONFeature,
  LngLat,
  Map,
  MapStyle,
  MaptilerAnimation,
  config,
  parseGeoJSONFeatureToKeyframes,
  resamplePath,
  Marker,
  MercatorCoordinate,
} from "../../src";

const BORDER_COLOR = "#333333";
const FILL_COLOR = "#FFD600"; // High-visibility Sun Yellow
const INACTIVE_LINE_COLOR = [100, 116, 139, 1.0]; // Rocky Slate Blue
const ACTIVE_LINE_COLOR = [255, 87, 34, 1.0]; // Vibrant Safety Orange

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
  const data = (await response.json()) as GeoJSON.FeatureCollection<GeoJSON.LineString>;
  return data;
}

async function main() {
  const pathGeojson = await loadGeoJSON("/routes/seixal-funchal.geojson");

  const map = await createMap();

  const ROUTE_SOURCE_ID = "routes";

  map.addSource(ROUTE_SOURCE_ID, {
    type: "geojson",
    data: pathGeojson,
    lineMetrics: true, // this is needed for the animated route
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
      "line-color": `rgba(${INACTIVE_LINE_COLOR.join(",")})`,
      "line-width": 2,
      "line-gap-width": 1,
    },
  });

  const img = await map.loadImage("/routes/mt.png");

  map.on("click", (e) => {
    console.log(e.lngLat.toArray());
  });

  map.addImage("maptiler", img.data);

  await new Promise((resolve) => {
    map.on("idle", resolve);
  });

  const animatedRouteLayer = new AnimatedRouteLayer({
    source: {
      id: ROUTE_SOURCE_ID,
      layerID: ROUTE_SOURCE_ID,
    },
    duration: 150000,
    // delay: 1000,
    iterations: 1,
    pathStrokeAnimation: {
      activeColor: ACTIVE_LINE_COLOR as [number, number, number, number],
      inactiveColor: INACTIVE_LINE_COLOR as [number, number, number, number],
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

  const [playButton, pauseButton, fasterButton, slowerButton] = getElementsByIds(["play", "pause", "faster", "slower", "time"]);

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

  const { coordinates: pathCoordinates } = pathGeojson.features[0].geometry;

  const markerPathFeature: KeyframeableGeoJSONFeature = {
    type: "Feature",
    geometry: {
      type: "LineString",
      // we have to resample the path placing the points at approximately equal distances
      // to ensure that the marker movement is continuous and not jumpy
      coordinates: resamplePath(pathCoordinates as [number, number][], 10),
    },
    properties: {},
  };

  const markerMovementKeyframes = parseGeoJSONFeatureToKeyframes(markerPathFeature, {
    pathSmoothing: false,
  });

  // now we create the marker movement animation
  const markerMovementAnimation = new MaptilerAnimation({
    keyframes: markerMovementKeyframes,
    duration: 150000,
    iterations: 1,
  });

  // we're going to chain these animations together to create a loop
  prologueAnimation.addEventListener("animationend", () => {
    activeAnimation.pause();
    activeAnimation = animatedRouteLayer.animationInstance!;
    prologueAnimation.reset();
    animatedRouteLayer.animationInstance?.reset();
    activeAnimation.play();
    markerMovementAnimation.play();
  });

  animatedRouteLayer.addEventListener("animationend", (e: AnimationEvent) => {
    activeAnimation.pause();
    markerMovementAnimation.pause();
    markerMovementAnimation.reset();
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

  const element = createMarkerElement();

  const hikerMarker = new Marker({
    element,
    offset: [0, -20],
    subpixelPositioning: true,
  });

  hikerMarker.setLngLat(new LngLat(pathCoordinates[0][0], pathCoordinates[0][1]));

  hikerMarker.addTo(map);

  const poiMarkers = createPOIMarkers(map);

  markerMovementAnimation.addEventListener("timeupdate", (e) => {
    const { lng, lat } = e.props;

    hikerMarker.setLngLat(new LngLat(lng, lat));

    poiMarkers.forEach((marker) => {
      const markerPosition = marker.getLngLat();
      const distance = markerPosition.distanceTo(new LngLat(lng, lat));
      if (distance < 2000) {
        marker.setOpacity("1");
      } else {
        marker.setOpacity("0");
      }
    });
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

function createMarkerElement(): HTMLElement {
  const html = `
    <div style="width: 30px; height: 30px; border-radius: 50% 50% 50% 0%; border: 2px solid ${BORDER_COLOR}; background: ${FILL_COLOR}; color: ${BORDER_COLOR}; display: flex; justify-content: center; align-items: center; transform: rotateZ(-45deg);">
      <svg style="transform: rotateZ(45deg);" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 100 100">
        <title xmlns="">hiker</title>
        <path fill="currentColor" fill-rule="evenodd" d="M46.43 7.5c4.055 0 7.337 3.379 7.337 7.434s-3.282 7.433-7.337 7.433s-7.434-3.379-7.434-7.433S42.376 7.5 46.43 7.5m.483 15.543c2.79-.087 4.947 1.649 6.082 3.476l7.723 12.84l13.516 5.696c3.861 1.64 2.027 6.757-2.317 5.599a5 5 0 0 0-.483-.29l-9.075 20.08s2.896 6.662 6.565 14.193c3.572 7.626-5.117 10.909-8.303 3.861l-3.185-7.144l-4.634 10.137l-1.931-.869l5.406-11.778l-9.075-19.79c-.386.096-.772 0-1.255 0c0 0-10.523 23.941-13.42 30.217c-2.799 6.275-11.101 2.51-8.302-3.67c2.8-6.178 16.123-36.202 16.123-36.202l-9.903.162c-1.5.013-1.859-.226-1.954-1.35c-.153-2.97-.415-9.958.272-13.197c.886-4.175 1.415-8.77 4.344-10.137s8.013 2.414 8.013 2.414c.772-2.51 3.186-4.248 5.793-4.248m5.985 15.06V49.69l8.303 18.15l8.302-18.247l-12.067-5.02c-.58-.29-1.062-.676-1.449-1.255z" color="currentColor"/>
    </div>
  `;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();
  return wrapper;
}

const routePoints: { name: string; position: [number, number]; img: string }[] = [
  { name: "Seixal", position: [-17.108631134033203, 32.821253855363125], img: "/routes/img/seixal.jpg" },
  { name: "Seixal Jungle", position: [-17.116012573242188, 32.815627602890586], img: "/routes/img/seixal-jungle.jpg" },
  { name: "Fanal Forest", position: [-17.14094638824463, 32.80906319137108], img: "/routes/img/fanal.jpg" },
  { name: "Cascata das 25 Fontes", position: [-17.125368118286133, 32.765660959792896], img: "/routes/img/25-fontes.jpg" },
  { name: "Cascata do Risco", position: [-17.125303745269775, 32.761420620845456], img: "/routes/img/risco.jpg" },
  { name: "Levada do Paul", position: [-17.12618350982666, 32.74768775443496], img: "/routes/img/serra-paul.jpg" },
  { name: "Pico Ruivo", position: [-16.942806243896484, 32.75869587094758], img: "/routes/img/serra-paul-2.jpg" },
  { name: "Pico do Areeiro", position: [-16.928086280822754, 32.73555920531017], img: "/routes/img/areeiro.jpg" },
  { name: "Funchal", position: [-16.908952, 32.649586], img: "/routes/img/coral.jpg" },
];

function createPOIMarkerElement(name: string, img: string): HTMLElement {
  const id = name.replace(/ /g, "-").toLowerCase();
  const html = `
    <div id="marker-${id}" style="width: 6rem; transform: rotateZ(-45deg); height: 6rem; border-radius: 50% 50% 50% 0%; border: 2px solid ${BORDER_COLOR}; background: green; color: ${BORDER_COLOR}; display: flex; justify-content: center; align-items: center;">
      <div style="transform: rotateZ(45deg); border-radius: 50%; border: 0.5rem; width: 100%; height: 100%; background-image: url(${img}); background-size: contain; background-position: center; background-repeat: no-repeat;">
      </div>
    </div>
  `;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();
  wrapper.style.opacity = "0";
  return wrapper as HTMLElement;
}

function createPOIMarkers(map: Map) {
  return routePoints.map((point) => {
    const marker = new Marker({
      element: createPOIMarkerElement(point.name, point.img),
      offset: [0, -50],
      opacity: "0",
      subpixelPositioning: true,
    });
    marker.setLngLat(new LngLat(point.position[0], point.position[1]));
    marker.addTo(map);
    return marker;
  });
}
