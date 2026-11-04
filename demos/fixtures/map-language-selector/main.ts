// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Language, Map, MapStyle, StyleSpecification, config } from "@maptiler/sdk";
import { addPerformanceStats, setupMapTilerApiKey } from "../../shared/demo-utils";
import { createGui } from "../../shared/gui";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.STREETS.DEFAULT;

addPerformanceStats();
setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

const container = document.getElementById("map")!;
const RANDOM_JSON = "json";

async function main() {
  const map = new Map({
    container,
    style: MAP_STYLE,
    hash: true,
    geolocate: true,
    language: Language.AUTO,
    scaleControl: true,
    fullscreenControl: true,
    terrainControl: true,
    projectionControl: true,
    projection: "globe",
    zoom: 14,
  });

  await map.onReadyAsync();

  // label → style id or other value given to `setStyle`
  const styles: Record<string, string> = {};
  Object.keys(MapStyle).forEach((s) => {
    MapStyle[s as keyof typeof MapStyle].getVariants().forEach((variant) => {
      styles[`${s} ${variant.getFullName()}`] = variant.getId();
    });
  });
  styles["Random JSON"] = RANDOM_JSON;
  styles["Custom Style 1"] = "d87d6c74-d29c-4cdd-87d8-b69ae7340dd6";

  // label → key of `Language`
  const languages: Record<string, string> = {};
  Object.entries(Language).forEach(([key, language]) => {
    languages[language.name in languages ? `${language.name} (${key})` : language.name] = key;
  });

  const params = { style: MAP_STYLE.getId(), language: "AUTO" };
  const gui = createGui("Map");

  gui.add(params, "style", styles).onChange(() => {
    if (params.style === RANDOM_JSON) {
      map.setStyle(getRandomJSON() as StyleSpecification);
      return;
    }
    map.setStyle(params.style);
  });

  gui.add(params, "language", languages).onChange(() => {
    const newLanguage = Language[params.language as keyof typeof Language];
    console.log(newLanguage, params.language);
    map.setLanguage(newLanguage);
  });
}

void main();

function getRandomJSON() {
  return {
    version: 8,
    id: "satellite",
    name: "Satellite",
    sources: {
      maptiler_planet: { url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${config.apiKey}`, type: "vector" },
      satellite: { url: `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${config.apiKey}`, type: "raster" },
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
    glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${config.apiKey}`,
    sprite: "https://api.maptiler.com/maps/satellite/sprite",
    bearing: 0,
    pitch: 0,
    zoom: 1,
  };
}

function randomRGBA() {
  return `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random()})`;
}
