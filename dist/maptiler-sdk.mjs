import * as ML from 'maplibre-gl';
import { GeolocateControl as GeolocateControl$1 } from 'maplibre-gl';
export * from 'maplibre-gl';
import { v4 } from 'uuid';
import { config as config$1 } from '@maptiler/client';
export { LanguageGeocoding, ServiceError, coordinates, data, geocoding, geolocation, staticMaps } from '@maptiler/client';
import Point$1 from '@mapbox/point-geometry';

const Language = {
  AUTO: "auto",
  LATIN: "latin",
  NON_LATIN: "nonlatin",
  LOCAL: "",
  ALBANIAN: "sq",
  AMHARIC: "am",
  ARABIC: "ar",
  ARMENIAN: "hy",
  AZERBAIJANI: "az",
  BASQUE: "eu",
  BELORUSSIAN: "be",
  BOSNIAN: "bs",
  BRETON: "br",
  BULGARIAN: "bg",
  CATALAN: "ca",
  CHINESE: "zh",
  CORSICAN: "co",
  CROATIAN: "hr",
  CZECH: "cs",
  DANISH: "da",
  DUTCH: "nl",
  ENGLISH: "en",
  ESPERANTO: "eo",
  ESTONIAN: "et",
  FINNISH: "fi",
  FRENCH: "fr",
  FRISIAN: "fy",
  GEORGIAN: "ka",
  GERMAN: "de",
  GREEK: "el",
  HEBREW: "he",
  HINDI: "hi",
  HUNGARIAN: "hu",
  ICELANDIC: "is",
  INDONESIAN: "id",
  IRISH: "ga",
  ITALIAN: "it",
  JAPANESE: "ja",
  JAPANESE_HIRAGANA: "ja-Hira",
  JAPANESE_KANA: "ja_kana",
  JAPANESE_LATIN: "ja_rm",
  JAPANESE_2018: "ja-Latn",
  KANNADA: "kn",
  KAZAKH: "kk",
  KOREAN: "ko",
  KOREAN_LATIN: "ko-Latn",
  KURDISH: "ku",
  ROMAN_LATIN: "la",
  LATVIAN: "lv",
  LITHUANIAN: "lt",
  LUXEMBOURGISH: "lb",
  MACEDONIAN: "mk",
  MALAYALAM: "ml",
  MALTESE: "mt",
  NORWEGIAN: "no",
  OCCITAN: "oc",
  POLISH: "pl",
  PORTUGUESE: "pt",
  ROMANIAN: "ro",
  ROMANSH: "rm",
  RUSSIAN: "ru",
  SCOTTISH_GAELIC: "gd",
  SERBIAN_CYRILLIC: "sr",
  SERBIAN_LATIN: "sr-Latn",
  SLOVAK: "sk",
  SLOVENE: "sl",
  SPANISH: "es",
  SWEDISH: "sv",
  TAMIL: "ta",
  TELUGU: "te",
  THAI: "th",
  TURKISH: "tr",
  UKRAINIAN: "uk",
  WELSH: "cy"
};
const languageCodeSet = new Set(Object.values(Language));
function getBrowserLanguage() {
  if (typeof navigator === "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0];
  }
  const canditatelangs = Array.from(
    new Set(navigator.languages.map((l) => l.split("-")[0]))
  ).filter((l) => languageCodeSet.has(l));
  return canditatelangs.length ? canditatelangs[0] : Language.LATIN;
}

class SdkConfig {
  constructor() {
    this.verbose = false;
    this.primaryLanguage = Language.AUTO;
    this.secondaryLanguage = null;
    this._apiKey = "Not defined yet.";
  }
  set apiKey(k) {
    this._apiKey = k;
    config$1.apiKey = k;
  }
  get apiKey() {
    return this._apiKey;
  }
  set fetch(f) {
    config$1.fetch = f;
  }
  get fetch() {
    return config$1.fetch;
  }
}
const config = new SdkConfig();

var version$1 = 8;
var id = "f0e4ff8c-a9e4-414e-9f4d-7938762c948f";
var name = "Satellite no label";
var sources = {
	satellite: {
		url: "https://api.maptiler.com/tiles/satellite-v2/tiles.json?",
		tileSize: 512,
		type: "raster"
	},
	maptiler_attribution: {
		attribution: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		type: "vector"
	}
};
var layers = [
	{
		id: "satellite",
		type: "raster",
		source: "satellite",
		minzoom: 0,
		layout: {
			visibility: "visible"
		},
		paint: {
			"raster-opacity": 1
		},
		filter: [
			"all"
		]
	}
];
var metadata = {
	"maptiler:copyright": "This style was generated on MapTiler Cloud. Usage outside of MapTiler Cloud or MapTiler Server requires valid MapTiler Data package: https://www.maptiler.com/data/ -- please contact us."
};
var glyphs = "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?";
var bearing = 0;
var pitch = 0;
var center = [
	-78.55323097748868,
	24.03141891413972
];
var zoom = 5.066147709178387;
var satelliteBuiltin = {
	version: version$1,
	id: id,
	name: name,
	sources: sources,
	layers: layers,
	metadata: metadata,
	glyphs: glyphs,
	bearing: bearing,
	pitch: pitch,
	center: center,
	zoom: zoom
};

const MapStyle = {
  STREETS: "streets-v2",
  HYBRID: "hybrid",
  SATELLITE: "satellite",
  OUTDOOR: "outdoor",
  BASIC: "basic-v2",
  STREETS_DARK: "streets-v2-dark",
  STREETS_LIGHT: "streets-v2-light"
};
const builtInStyles = {};
builtInStyles[MapStyle.SATELLITE] = satelliteBuiltin;
function isBuiltinStyle(styleId) {
  return styleId in builtInStyles;
}
function getBuiltinStyle(styleId) {
  if (!isBuiltinStyle(styleId)) {
    return null;
  }
  return builtInStyles[styleId];
}

const defaults = {
  mapStyle: MapStyle.STREETS,
  maptilerLogoURL: "https://api.maptiler.com/resources/logo.svg",
  maptilerURL: "https://www.maptiler.com/",
  maptilerApiURL: "https://api.maptiler.com/",
  rtlPluginURL: "https://cdn.maptiler.com/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.min.js",
  primaryLanguage: Language.LATIN,
  secondaryLanguage: Language.NON_LATIN,
  terrainSourceURL: "https://api.maptiler.com/tiles/terrain-rgb/tiles.json",
  terrainSourceId: "maptiler-terrain"
};
Object.freeze(defaults);

class CustomLogoControl extends ML.LogoControl {
  constructor(options = {}) {
    var _a, _b;
    super(options);
    this.logoURL = "";
    this.linkURL = "";
    this.logoURL = (_a = options.logoURL) != null ? _a : defaults.maptilerLogoURL;
    this.linkURL = (_b = options.linkURL) != null ? _b : defaults.maptilerURL;
  }
  onAdd(map) {
    this._map = map;
    this._compact = this.options && this.options.compact;
    this._container = window.document.createElement("div");
    this._container.className = "maplibregl-ctrl";
    const anchor = window.document.createElement("a");
    anchor.style.backgroundRepeat = "no-repeat";
    anchor.style.cursor = "pointer";
    anchor.style.display = "block";
    anchor.style.height = "23px";
    anchor.style.margin = "0 0 -4px -4px";
    anchor.style.overflow = "hidden";
    anchor.style.width = "88px";
    anchor.style.backgroundImage = `url(${this.logoURL})`;
    anchor.style.backgroundSize = "100px 30px";
    anchor.style.width = "100px";
    anchor.style.height = "30px";
    anchor.target = "_blank";
    anchor.rel = "noopener nofollow";
    anchor.href = this.linkURL;
    anchor.setAttribute(
      "aria-label",
      this._map._getUIString("LogoControl.Title")
    );
    anchor.setAttribute("rel", "noopener nofollow");
    this._container.appendChild(anchor);
    this._container.style.display = "block";
    this._map.on("resize", this._updateCompact);
    this._updateCompact();
    return this._container;
  }
}

function vlog(...args) {
  if (config.verbose) {
    console.log(...args);
  }
}
function expandMapStyle(style) {
  const maptilerDomainRegex = /^maptiler:\/\/(.*)/;
  let match;
  const trimmed = style.trim();
  let expandedStyle;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    expandedStyle = trimmed;
  } else if ((match = maptilerDomainRegex.exec(trimmed)) !== null) {
    expandedStyle = `https://api.maptiler.com/maps/${match[1]}/style.json`;
  } else {
    expandedStyle = `https://api.maptiler.com/maps/${trimmed}/style.json`;
  }
  return expandedStyle;
}
function enableRTL() {
  const maplibrePackage = ML;
  if (maplibrePackage.getRTLTextPluginStatus() === "unavailable") {
    maplibrePackage.setRTLTextPlugin(
      defaults.rtlPluginURL,
      null,
      true
    );
  }
}

const _DOM = class {
  static testProp(props) {
    if (!_DOM.docStyle)
      return props[0];
    for (let i = 0; i < props.length; i++) {
      if (props[i] in _DOM.docStyle) {
        return props[i];
      }
    }
    return props[0];
  }
  static create(tagName, className, container) {
    const el = window.document.createElement(tagName);
    if (className !== void 0)
      el.className = className;
    if (container)
      container.appendChild(el);
    return el;
  }
  static createNS(namespaceURI, tagName) {
    const el = window.document.createElementNS(namespaceURI, tagName);
    return el;
  }
  static disableDrag() {
    if (_DOM.docStyle && _DOM.selectProp) {
      _DOM.userSelect = _DOM.docStyle[_DOM.selectProp];
      _DOM.docStyle[_DOM.selectProp] = "none";
    }
  }
  static enableDrag() {
    if (_DOM.docStyle && _DOM.selectProp) {
      _DOM.docStyle[_DOM.selectProp] = _DOM.userSelect;
    }
  }
  static setTransform(el, value) {
    el.style[_DOM.transformProp] = value;
  }
  static addEventListener(target, type, callback, options = {}) {
    if ("passive" in options) {
      target.addEventListener(type, callback, options);
    } else {
      target.addEventListener(type, callback, options.capture);
    }
  }
  static removeEventListener(target, type, callback, options = {}) {
    if ("passive" in options) {
      target.removeEventListener(type, callback, options);
    } else {
      target.removeEventListener(type, callback, options.capture);
    }
  }
  static suppressClickInternal(e) {
    e.preventDefault();
    e.stopPropagation();
    window.removeEventListener("click", _DOM.suppressClickInternal, true);
  }
  static suppressClick() {
    window.addEventListener("click", _DOM.suppressClickInternal, true);
    window.setTimeout(() => {
      window.removeEventListener("click", _DOM.suppressClickInternal, true);
    }, 0);
  }
  static mousePos(el, e) {
    const rect = el.getBoundingClientRect();
    return new Point$1(
      e.clientX - rect.left - el.clientLeft,
      e.clientY - rect.top - el.clientTop
    );
  }
  static touchPos(el, touches) {
    const rect = el.getBoundingClientRect();
    const points = [];
    for (let i = 0; i < touches.length; i++) {
      points.push(
        new Point$1(
          touches[i].clientX - rect.left - el.clientLeft,
          touches[i].clientY - rect.top - el.clientTop
        )
      );
    }
    return points;
  }
  static mouseButton(e) {
    return e.button;
  }
  static remove(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
};
let DOM = _DOM;
DOM.docStyle = typeof window !== "undefined" && window.document && window.document.documentElement.style;
DOM.selectProp = _DOM.testProp([
  "userSelect",
  "MozUserSelect",
  "WebkitUserSelect",
  "msUserSelect"
]);
DOM.transformProp = _DOM.testProp(["transform", "WebkitTransform"]);
function bindAll(fns, context) {
  fns.forEach((fn) => {
    if (!context[fn]) {
      return;
    }
    context[fn] = context[fn].bind(context);
  });
}

class TerrainControl$1 {
  constructor() {
    bindAll(["_toggleTerrain", "_updateTerrainIcon"], this);
  }
  onAdd(map) {
    this._map = map;
    this._container = DOM.create(
      "div",
      "maplibregl-ctrl maplibregl-ctrl-group"
    );
    this._terrainButton = DOM.create(
      "button",
      "maplibregl-ctrl-terrain",
      this._container
    );
    DOM.create(
      "span",
      "maplibregl-ctrl-icon",
      this._terrainButton
    ).setAttribute("aria-hidden", "true");
    this._terrainButton.type = "button";
    this._terrainButton.addEventListener("click", this._toggleTerrain);
    this._updateTerrainIcon();
    this._map.on("terrain", this._updateTerrainIcon);
    return this._container;
  }
  onRemove() {
    DOM.remove(this._container);
    this._map.off("terrain", this._updateTerrainIcon);
    this._map = void 0;
  }
  _toggleTerrain() {
    if (this._map.hasTerrain()) {
      this._map.disableTerrain();
    } else {
      this._map.enableTerrain();
    }
    this._updateTerrainIcon();
  }
  _updateTerrainIcon() {
    this._terrainButton.classList.remove("maplibregl-ctrl-terrain");
    this._terrainButton.classList.remove("maplibregl-ctrl-terrain-enabled");
    if (this._map.hasTerrain()) {
      this._terrainButton.classList.add("maplibregl-ctrl-terrain-enabled");
      this._terrainButton.title = this._map._getUIString(
        "TerrainControl.disableTerrain"
      );
    } else {
      this._terrainButton.classList.add("maplibregl-ctrl-terrain");
      this._terrainButton.title = this._map._getUIString(
        "TerrainControl.enableTerrain"
      );
    }
  }
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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const MAPTILER_SESSION_ID = v4();
class Map extends ML.Map {
  constructor(options) {
    var _a;
    let style;
    if ("style" in options) {
      if (typeof style === "string" && isBuiltinStyle(style)) {
        style = getBuiltinStyle(style);
      } else if (typeof style === "string") {
        style = expandMapStyle(style);
      } else {
        style = options.style;
      }
    } else {
      style = expandMapStyle(defaults.mapStyle);
      vlog(`Map style not provided, backing up to ${defaults.mapStyle}`);
    }
    super(__spreadProps(__spreadValues({}, options), {
      style,
      maplibreLogo: false,
      transformRequest: (url) => {
        const reqUrl = new URL(url);
        if (!reqUrl.searchParams.has("key")) {
          reqUrl.searchParams.append("key", config.apiKey);
        }
        reqUrl.searchParams.append("mtsid", MAPTILER_SESSION_ID);
        return {
          url: reqUrl.href,
          headers: {}
        };
      }
    }));
    this.languageShouldUpdate = false;
    this.isStyleInitialized = false;
    this.isTerrainEnabled = false;
    this.terrainExaggeration = 1;
    this.on("styledataloading", () => {
      this.languageShouldUpdate = !!config.primaryLanguage || !!config.secondaryLanguage;
    });
    this.on("styledata", () => {
      if (config.primaryLanguage && (this.languageShouldUpdate || !this.isStyleInitialized)) {
        this.setPrimaryLanguage(config.primaryLanguage);
      }
      if (config.secondaryLanguage && (this.languageShouldUpdate || !this.isStyleInitialized)) {
        this.setSecondaryLanguage(config.secondaryLanguage);
      }
      this.languageShouldUpdate = false;
      this.isStyleInitialized = true;
    });
    this.on("styledata", () => {
      if (this.getTerrain() === null && this.isTerrainEnabled) {
        this.enableTerrain(this.terrainExaggeration);
      }
    });
    this.once("load", () => __async(this, null, function* () {
      enableRTL();
    }));
    this.once("load", () => __async(this, null, function* () {
      let tileJsonURL = null;
      try {
        tileJsonURL = this.getSource("openmaptiles").url;
      } catch (e) {
        return;
      }
      const tileJsonRes = yield fetch(tileJsonURL);
      const tileJsonContent = yield tileJsonRes.json();
      if ("logo" in tileJsonContent && tileJsonContent.logo) {
        const logoURL = tileJsonContent.logo;
        this.addControl(
          new CustomLogoControl({ logoURL }),
          options.logoPosition
        );
        if (options.attributionControl === false) {
          this.addControl(new ML.AttributionControl(options));
        }
      } else if (options.maptilerLogo) {
        this.addControl(new CustomLogoControl(), options.logoPosition);
      }
      if (options.navigationControl !== false) {
        const position = options.navigationControl === true || options.navigationControl === void 0 ? "top-right" : options.navigationControl;
        this.addControl(
          new ML.NavigationControl({
            showCompass: true,
            showZoom: true,
            visualizePitch: true
          }),
          position
        );
        this.addControl(new GeolocateControl$1({}), position);
      }
      if (options.terrainControl !== false) {
        const position = options.terrainControl === true || options.terrainControl === void 0 ? "top-right" : options.terrainControl;
        this.addControl(new TerrainControl$1(), position);
      }
    }));
    if (options.terrain) {
      this.enableTerrain(
        (_a = options.terrainExaggeration) != null ? _a : this.terrainExaggeration
      );
    }
  }
  setStyle(style, options) {
    let tempStyle = style;
    if (typeof style === "string" && isBuiltinStyle(style)) {
      tempStyle = getBuiltinStyle(style);
    } else if (typeof style === "string") {
      tempStyle = expandMapStyle(style);
    }
    return super.setStyle(tempStyle, options);
  }
  setLanguage(language = defaults.primaryLanguage) {
    if (language === Language.AUTO) {
      return this.setLanguage(getBrowserLanguage());
    }
    this.setPrimaryLanguage(language);
  }
  setPrimaryLanguage(language = defaults.primaryLanguage) {
    if (language === Language.AUTO) {
      return this.setPrimaryLanguage(getBrowserLanguage());
    }
    config.primaryLanguage = language;
    const layers = this.getStyle().layers;
    const strLanguageRegex = /^\s*{\s*name\s*(:\s*(\S*))?\s*}$/;
    const strLanguageInArrayRegex = /^\s*name\s*(:\s*(\S*))?\s*$/;
    const strBilingualRegex = /^\s*{\s*name\s*(:\s*(\S*))?\s*}(\s*){\s*name\s*(:\s*(\S*))?\s*}$/;
    const strMoreInfoRegex = /^(.*)({\s*name\s*(:\s*(\S*))?\s*})(.*)$/;
    const langStr = language ? `name:${language}` : "name";
    const replacer = [
      "case",
      ["has", langStr],
      ["get", langStr],
      ["get", "name:latin"]
    ];
    for (let i = 0; i < layers.length; i += 1) {
      const layer = layers[i];
      const layout = layer.layout;
      if (!layout) {
        continue;
      }
      if (!layout["text-field"]) {
        continue;
      }
      const textFieldLayoutProp = this.getLayoutProperty(
        layer.id,
        "text-field"
      );
      let regexMatch;
      if (Array.isArray(textFieldLayoutProp) && textFieldLayoutProp.length >= 2 && textFieldLayoutProp[0].trim().toLowerCase() === "concat") {
        const newProp = textFieldLayoutProp.slice();
        for (let j = 0; j < textFieldLayoutProp.length; j += 1) {
          const elem = textFieldLayoutProp[j];
          if ((typeof elem === "string" || elem instanceof String) && strLanguageRegex.exec(elem.toString())) {
            newProp[j] = replacer;
            break;
          } else if (Array.isArray(elem) && elem.length >= 2 && elem[0].trim().toLowerCase() === "get" && strLanguageInArrayRegex.exec(elem[1].toString())) {
            newProp[j] = replacer;
            break;
          } else if (Array.isArray(elem) && elem.length === 4 && elem[0].trim().toLowerCase() === "case") {
            newProp[j] = replacer;
            break;
          }
        }
        this.setLayoutProperty(layer.id, "text-field", newProp);
      } else if (Array.isArray(textFieldLayoutProp) && textFieldLayoutProp.length >= 2 && textFieldLayoutProp[0].trim().toLowerCase() === "get" && strLanguageInArrayRegex.exec(textFieldLayoutProp[1].toString())) {
        const newProp = replacer;
        this.setLayoutProperty(layer.id, "text-field", newProp);
      } else if ((typeof textFieldLayoutProp === "string" || textFieldLayoutProp instanceof String) && strLanguageRegex.exec(textFieldLayoutProp.toString())) {
        const newProp = replacer;
        this.setLayoutProperty(layer.id, "text-field", newProp);
      } else if (Array.isArray(textFieldLayoutProp) && textFieldLayoutProp.length === 4 && textFieldLayoutProp[0].trim().toLowerCase() === "case") {
        const newProp = replacer;
        this.setLayoutProperty(layer.id, "text-field", newProp);
      } else if ((typeof textFieldLayoutProp === "string" || textFieldLayoutProp instanceof String) && (regexMatch = strBilingualRegex.exec(
        textFieldLayoutProp.toString()
      )) !== null) {
        const newProp = `{${langStr}}${regexMatch[3]}{name${regexMatch[4] || ""}}`;
        this.setLayoutProperty(layer.id, "text-field", newProp);
      } else if ((typeof textFieldLayoutProp === "string" || textFieldLayoutProp instanceof String) && (regexMatch = strMoreInfoRegex.exec(textFieldLayoutProp.toString())) !== null) {
        const newProp = `${regexMatch[1]}{${langStr}}${regexMatch[5]}`;
        this.setLayoutProperty(layer.id, "text-field", newProp);
      }
    }
  }
  setSecondaryLanguage(language = defaults.secondaryLanguage) {
    if (language === Language.AUTO) {
      return this.setSecondaryLanguage(getBrowserLanguage());
    }
    config.secondaryLanguage = language;
    const layers = this.getStyle().layers;
    const strLanguageRegex = /^\s*{\s*name\s*(:\s*(\S*))?\s*}$/;
    const strLanguageInArrayRegex = /^\s*name\s*(:\s*(\S*))?\s*$/;
    const strBilingualRegex = /^\s*{\s*name\s*(:\s*(\S*))?\s*}(\s*){\s*name\s*(:\s*(\S*))?\s*}$/;
    let regexMatch;
    for (let i = 0; i < layers.length; i += 1) {
      const layer = layers[i];
      const layout = layer.layout;
      if (!layout) {
        continue;
      }
      if (!layout["text-field"]) {
        continue;
      }
      const textFieldLayoutProp = this.getLayoutProperty(
        layer.id,
        "text-field"
      );
      let newProp;
      if (Array.isArray(textFieldLayoutProp) && textFieldLayoutProp.length >= 2 && textFieldLayoutProp[0].trim().toLowerCase() === "concat") {
        newProp = textFieldLayoutProp.slice();
        let languagesAlreadyFound = 0;
        for (let j = 0; j < textFieldLayoutProp.length; j += 1) {
          const elem = textFieldLayoutProp[j];
          if ((typeof elem === "string" || elem instanceof String) && strLanguageRegex.exec(elem.toString())) {
            if (languagesAlreadyFound === 1) {
              newProp[j] = `{name:${language}}`;
              break;
            }
            languagesAlreadyFound += 1;
          } else if (Array.isArray(elem) && elem.length >= 2 && elem[0].trim().toLowerCase() === "get" && strLanguageInArrayRegex.exec(elem[1].toString())) {
            if (languagesAlreadyFound === 1) {
              newProp[j][1] = `name:${language}`;
              break;
            }
            languagesAlreadyFound += 1;
          } else if (Array.isArray(elem) && elem.length === 4 && elem[0].trim().toLowerCase() === "case") {
            if (languagesAlreadyFound === 1) {
              newProp[j] = ["get", `name:${language}`];
              break;
            }
            languagesAlreadyFound += 1;
          }
        }
        this.setLayoutProperty(layer.id, "text-field", newProp);
      } else if ((typeof textFieldLayoutProp === "string" || textFieldLayoutProp instanceof String) && (regexMatch = strBilingualRegex.exec(
        textFieldLayoutProp.toString()
      )) !== null) {
        const langStr = language ? `name:${language}` : "name";
        newProp = `{name${regexMatch[1] || ""}}${regexMatch[3]}{${langStr}}`;
        this.setLayoutProperty(layer.id, "text-field", newProp);
      }
    }
  }
  getTerrainExaggeration() {
    return this.terrainExaggeration;
  }
  hasTerrain() {
    return this.isTerrainEnabled;
  }
  enableTerrain(exaggeration = this.terrainExaggeration) {
    const terrainInfo = this.getTerrain();
    const addTerrain = () => {
      this.isTerrainEnabled = true;
      this.terrainExaggeration = exaggeration;
      this.addSource(defaults.terrainSourceId, {
        type: "raster-dem",
        url: defaults.terrainSourceURL
      });
      this.setTerrain({
        source: defaults.terrainSourceId,
        exaggeration
      });
    };
    if (terrainInfo) {
      this.setTerrain(__spreadProps(__spreadValues({}, terrainInfo), { exaggeration }));
      return;
    }
    if (this.loaded() || this.isTerrainEnabled) {
      addTerrain();
    } else {
      this.once("load", () => {
        if (this.getTerrain() && this.getSource(defaults.terrainSourceId)) {
          return;
        }
        addTerrain();
      });
    }
  }
  disableTerrain() {
    this.isTerrainEnabled = false;
    this.setTerrain(null);
    if (this.getSource(defaults.terrainSourceId)) {
      this.removeSource(defaults.terrainSourceId);
    }
  }
  setTerrainExaggeration(exaggeration) {
    this.enableTerrain(exaggeration);
  }
}

function Point(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype = {
  clone: function() {
    return new Point(this.x, this.y);
  },
  add: function(p) {
    return this.clone()._add(p);
  },
  sub: function(p) {
    return this.clone()._sub(p);
  },
  multByPoint: function(p) {
    return this.clone()._multByPoint(p);
  },
  divByPoint: function(p) {
    return this.clone()._divByPoint(p);
  },
  mult: function(k) {
    return this.clone()._mult(k);
  },
  div: function(k) {
    return this.clone()._div(k);
  },
  rotate: function(a) {
    return this.clone()._rotate(a);
  },
  rotateAround: function(a, p) {
    return this.clone()._rotateAround(a, p);
  },
  matMult: function(m) {
    return this.clone()._matMult(m);
  },
  unit: function() {
    return this.clone()._unit();
  },
  perp: function() {
    return this.clone()._perp();
  },
  round: function() {
    return this.clone()._round();
  },
  mag: function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  equals: function(other) {
    return this.x === other.x && this.y === other.y;
  },
  dist: function(p) {
    return Math.sqrt(this.distSqr(p));
  },
  distSqr: function(p) {
    const dx = p.x - this.x, dy = p.y - this.y;
    return dx * dx + dy * dy;
  },
  angle: function() {
    return Math.atan2(this.y, this.x);
  },
  angleTo: function(b) {
    return Math.atan2(this.y - b.y, this.x - b.x);
  },
  angleWith: function(b) {
    return this.angleWithSep(b.x, b.y);
  },
  angleWithSep: function(x, y) {
    return Math.atan2(this.x * y - this.y * x, this.x * x + this.y * y);
  },
  _matMult: function(m) {
    const x = m[0] * this.x + m[1] * this.y, y = m[2] * this.x + m[3] * this.y;
    this.x = x;
    this.y = y;
    return this;
  },
  _add: function(p) {
    this.x += p.x;
    this.y += p.y;
    return this;
  },
  _sub: function(p) {
    this.x -= p.x;
    this.y -= p.y;
    return this;
  },
  _mult: function(k) {
    this.x *= k;
    this.y *= k;
    return this;
  },
  _div: function(k) {
    this.x /= k;
    this.y /= k;
    return this;
  },
  _multByPoint: function(p) {
    this.x *= p.x;
    this.y *= p.y;
    return this;
  },
  _divByPoint: function(p) {
    this.x /= p.x;
    this.y /= p.y;
    return this;
  },
  _unit: function() {
    this._div(this.mag());
    return this;
  },
  _perp: function() {
    const y = this.y;
    this.y = this.x;
    this.x = -y;
    return this;
  },
  _rotate: function(angle) {
    const cos = Math.cos(angle), sin = Math.sin(angle), x = cos * this.x - sin * this.y, y = sin * this.x + cos * this.y;
    this.x = x;
    this.y = y;
    return this;
  },
  _rotateAround: function(angle, p) {
    const cos = Math.cos(angle), sin = Math.sin(angle), x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y), y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
    this.x = x;
    this.y = y;
    return this;
  },
  _round: function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }
};
Point.convert = function(a) {
  if (a instanceof Point) {
    return a;
  }
  if (Array.isArray(a)) {
    return new Point(a[0], a[1]);
  }
  return a;
};

var Unit = /* @__PURE__ */ ((Unit2) => {
  Unit2[Unit2["METRIC"] = 0] = "METRIC";
  Unit2[Unit2["IMPERIAL"] = 1] = "IMPERIAL";
  return Unit2;
})(Unit || {});

const supported = ML.default.supported;
const setRTLTextPlugin = ML.default.setRTLTextPlugin;
const getRTLTextPluginStatus = ML.default.getRTLTextPluginStatus;
const NavigationControl = ML.default.NavigationControl;
const GeolocateControl = ML.default.GeolocateControl;
const AttributionControl = ML.default.AttributionControl;
const LogoControl = ML.default.LogoControl;
const ScaleControl = ML.default.ScaleControl;
const FullscreenControl = ML.default.FullscreenControl;
const TerrainControl = ML.default.TerrainControl;
const Popup = ML.default.Popup;
const Marker = ML.default.Marker;
const Style = ML.default.Style;
const LngLat = ML.default.LngLat;
const LngLatBounds = ML.default.LngLatBounds;
const MercatorCoordinate = ML.default.MercatorCoordinate;
const Evented = ML.default.Evented;
const AJAXError = ML.default.AJAXError;
const CanvasSource = ML.default.CanvasSource;
const GeoJSONSource = ML.default.GeoJSONSource;
const ImageSource = ML.default.ImageSource;
const RasterDEMTileSource = ML.default.RasterDEMTileSource;
const RasterTileSource = ML.default.RasterTileSource;
const VectorTileSource = ML.default.VectorTileSource;
const VideoSource = ML.default.VideoSource;
const prewarm = ML.default.prewarm;
const clearPrewarmedResources = ML.default.clearPrewarmedResources;
const version = ML.default.version;
const workerCount = ML.default.workerCount;
const maxParallelImageRequests = ML.default.maxParallelImageRequests;
const clearStorage = ML.default.clearStorage;
const workerUrl = ML.default.workerUrl;
const addProtocol = ML.default.addProtocol;
const removeProtocol = ML.default.removeProtocol;

export { AJAXError, AttributionControl, CanvasSource, Evented, FullscreenControl, GeoJSONSource, GeolocateControl, ImageSource, Language, LngLat, LngLatBounds, LogoControl, Map, MapStyle, Marker, MercatorCoordinate, NavigationControl, Point, Popup, RasterDEMTileSource, RasterTileSource, ScaleControl, SdkConfig, Style, TerrainControl, Unit, VectorTileSource, VideoSource, addProtocol, clearPrewarmedResources, clearStorage, config, getRTLTextPluginStatus, maxParallelImageRequests, prewarm, removeProtocol, setRTLTextPlugin, supported, version, workerCount, workerUrl };
//# sourceMappingURL=maptiler-sdk.mjs.map
