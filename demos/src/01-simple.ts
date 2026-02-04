import { Map, MapStyle, StyleSpecificationWithMetaData, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map")!;

async function main() {
  const map = new Map({
    container,
    style: MapStyle.OUTDOOR.DARK,
    hash: true,
    geolocate: false,
    scaleControl: true,
    fullscreenControl: true,
    terrainControl: true,
    projectionControl: true,
    projection: "globe",
    // space: true,
    // halo: true,
    zoom: 1,
  });

  const styleDropDown = document.getElementById("mapstyles-picker") as HTMLOptionElement;

  styleDropDown.onchange = () => {
    if (styleDropDown.value === "json") {
      // @ts-expect-error we know that `id` is private.
      map.setStyle(getRandomJSON() as StyleSpecificationWithMetaData);
      return;
    }
    map.setStyle(styleDropDown.value);
  };

  await map.onReadyAsync();

  Object.keys(MapStyle).forEach((s) => {
    const variants = MapStyle[s as keyof typeof MapStyle].getVariants();
    variants.forEach((variant) => {
      const styleOption = document.createElement("option");
      // @ts-expect-error we know that `id` is private.
      styleOption.value = variant.id;
      styleOption.innerHTML = `${s} ${variant.getFullName()}`;
      styleDropDown.appendChild(styleOption);
    });
  });

  const styleOption = document.createElement("option");
  styleOption.value = "json";
  styleOption.innerHTML = "Random JSON";
  styleDropDown.appendChild(styleOption);
  const anotherStyleOption = document.createElement("option");
  anotherStyleOption.value = "d87d6c74-d29c-4cdd-87d8-b69ae7340dd6";
  anotherStyleOption.innerHTML = "Custom Style 1";
  styleDropDown.appendChild(anotherStyleOption);
}

void main();

function getRandomJSON() {
  return {
    version: 8,
    id: "satellite",
    name: "Satellite",
    sources: {
      maptiler_planet: { url: "https://api.maptiler.com/tiles/v3/tiles.json?key=NrHbzRcISmjG1VwSD6jh", type: "vector" },
      satellite: { url: "https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=NrHbzRcISmjG1VwSD6jh", type: "raster" },
    },
    layers: [{ id: "Satellite", type: "raster", source: "satellite", minzoom: 0, layout: { visibility: "visible" }, paint: { "raster-opacity": 1 }, filter: ["all"] }],
    metadata: {
      maptiler: {
        copyright:
          "You are licensed to use the style or its derivate for serving map tiles exclusively with MapTiler Server or MapTiler Cloud and in accordance with their licenses and terms. If you plan to use the style in a different way, contact us at sales@maptiler.com.",
        groups: [
          {
            icon: "administrative",
            id: "administrative",
            layers: [
              "Place labels",
              "State labels",
              "Country labels",
              "Continent labels",
              "Country border",
              "Country dark border",
              "Other border",
              "Disputed border",
              "Capital city labels",
              "City labels",
            ],
            name: "Administrative",
          },
          { icon: "transport", id: "transport", layers: ["Road", "Road labels", "Railway", "Path", "Tunnel", "Path minor"], name: "Transport" },
          { icon: "satellite", id: "satellite", layers: ["Satellite"], name: "Satellite" },
        ],
        space: {
          color: randomRGBA(),
        },
        halo: {
          stops: [
            [0, randomRGBA()],
            [0.5, randomRGBA()],
            [1.0, randomRGBA()],
          ],
          scale: 1.0 + Math.random(),
        },
      },
    },
    glyphs: "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=NrHbzRcISmjG1VwSD6jh",
    sprite: "https://api.maptiler.com/maps/satellite/sprite",
    bearing: 0,
    pitch: 0,
    center: [0, 0],
    zoom: 1,
  };
}

function randomRGBA() {
  return `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random()})`;
}
