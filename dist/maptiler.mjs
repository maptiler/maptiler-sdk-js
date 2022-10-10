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
  apiToken: "Not defined yet.",
  verbose: false
};

const defaults = {
  mapStyle: "streets"
};

function vlog(...args) {
  if (config.verbose) {
    console.log(...arguments);
  }
}
function expandMapStyle(style) {
  const trimmed = style.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const maptilerDomainRegex = /^maptiler:\/\/(.*)/;
  const match = maptilerDomainRegex.exec(trimmed);
  if (match) {
    return `https://api.maptiler.com/maps/${match[1]}/style.json`;
  }
  return `https://api.maptiler.com/maps/${trimmed}/style.json`;
}

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
class Map extends maplibre.Map {
  constructor(options) {
    let style = expandMapStyle(defaults.mapStyle);
    if ("style" in options) {
      style = expandMapStyle(options.style);
    } else {
      vlog(`Map style not provided, backing up to ${defaults.mapStyle}`);
    }
    if (!style.includes("key=")) {
      style = `${style}?key=${config.apiToken}`;
    }
    super(__spreadProps(__spreadValues({}, options), { style }));
  }
}

export { LngLat, Map, config };
//# sourceMappingURL=maptiler.mjs.map
