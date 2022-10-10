import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

class LngLat extends maplibre.LngLat {
  constructor(lng, lat) {
    super(lng, lat);
  }
  setToNull() {
    this.lng = 0;
    this.lat = 0;
  }
}

const config = {
  accessToken: "Not defined yet."
};

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
const maptilerStyles = {
  "basic": "https://api.maptiler.com/maps/basic-v2/style.json",
  "bright": "https://api.maptiler.com/maps/bright/style.json",
  "openstreetmap": "https://api.maptiler.com/maps/openstreetmap/style.json",
  "outdoor": "https://api.maptiler.com/maps/outdoor/style.json",
  "pastel": "https://api.maptiler.com/maps/pastel/style.json",
  "satellite Hybrid": "https://api.maptiler.com/maps/hybrid/style.json",
  "streets": "https://api.maptiler.com/maps/streets/style.json",
  "toner": "https://api.maptiler.com/maps/toner/style.json",
  "topo": "https://api.maptiler.com/maps/topo/style.json",
  "topographique": "https://api.maptiler.com/maps/topographique/style.json",
  "voyager": "https://api.maptiler.com/maps/voyager/style.json",
  "winter": "https://api.maptiler.com/maps/winter/style.json"
};
class Map extends maplibre.Map {
  constructor(options) {
    console.log("hello");
    let style = options.style.trim().toLowerCase();
    if (style in maptilerStyles) {
      style = maptilerStyles[style];
    }
    if (!style.includes("key=")) {
      style = `${style}?key=${config.accessToken}`;
    }
    super(__spreadProps(__spreadValues({}, options), { style }));
  }
}

export { LngLat, Map, config };
//# sourceMappingURL=maptiler.mjs.map
