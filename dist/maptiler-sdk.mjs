import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';
import { config as config$1 } from '@maptiler/client';
export { Language as LanguageGeocoding, ServiceError, coordinates, data, geocoding, geolocation, staticMaps } from '@maptiler/client';

class SdkConfig {
  constructor() {
    this.verbose = false;
    this.primaryLanguage = null;
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

var version = 8;
var id = "f0e4ff8c-a9e4-414e-9f4d-7938762c948f";
var name = "Satellite no label";
var sources = {
	satellite: {
		url: "https://api.maptiler.com/tiles/satellite-v2/tiles.json?key={key}",
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
var glyphs = "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key={key}";
var bearing = 0;
var pitch = 0;
var center = [
	-78.55323097748868,
	24.03141891413972
];
var zoom = 5.066147709178387;
var satelliteBuiltin = {
	version: version,
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

const Style = {
  STREETS: "streets-v2",
  HYBRID: "hybrid",
  SATELLITE: "satellite",
  OUTDOOR: "outdoor",
  BASIC: "basic-v2",
  DARK: "streets-v2-dark",
  LIGHT: "streets-v2-light"
};
const builtInStyles = {};
builtInStyles[Style.SATELLITE] = satelliteBuiltin;
function isBuiltinStyle(styleId) {
  return styleId in builtInStyles;
}
function prepareBuiltinStyle(styleId, apiKey) {
  if (!isBuiltinStyle(styleId)) {
    return null;
  }
  const fullTextVersion = JSON.stringify(builtInStyles[styleId]).replace(
    /{key}/gi,
    apiKey
  );
  return JSON.parse(fullTextVersion);
}

const defaults = {
  mapStyle: Style.STREETS,
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

class CustomLogoControl extends maplibre.LogoControl {
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
  if (!expandedStyle.includes("key=")) {
    expandedStyle = `${expandedStyle}?key=${config.apiKey}`;
  }
  return expandedStyle;
}
function enableRTL() {
  const maplibrePackage = maplibre;
  if (maplibrePackage.getRTLTextPluginStatus() === "unavailable") {
    maplibrePackage.setRTLTextPlugin(
      defaults.rtlPluginURL,
      null,
      true
    );
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
class Map extends maplibre.Map {
  constructor(options) {
    var _a;
    let style;
    if ("style" in options) {
      if (typeof style === "string" && isBuiltinStyle(style)) {
        style = prepareBuiltinStyle(style, config.apiKey);
      } else if (typeof style === "string") {
        style = expandMapStyle(style);
      } else {
        style = options.style;
      }
    } else {
      style = expandMapStyle(defaults.mapStyle);
      vlog(`Map style not provided, backing up to ${defaults.mapStyle}`);
    }
    super(__spreadProps(__spreadValues({}, options), { style, maplibreLogo: false }));
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
          this.addControl(new maplibre.AttributionControl(options));
        }
      } else if (options.maptilerLogo) {
        this.addControl(new CustomLogoControl(), options.logoPosition);
      }
    }));
    if (options.enableTerrain) {
      this.enableTerrain((_a = options.terrainExaggeration) != null ? _a : 1);
    }
  }
  setStyle(style, options) {
    let tempStyle = style;
    if (typeof style === "string" && isBuiltinStyle(style)) {
      tempStyle = prepareBuiltinStyle(style, config.apiKey);
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
    console.log("language", language);
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
  enableTerrain(exaggeration = 1) {
    const terrainInfo = this.getTerrain();
    const addTerrain = () => {
      this.isTerrainEnabled = true;
      this.terrainExaggeration = exaggeration;
      this.addSource(defaults.terrainSourceId, {
        type: "raster-dem",
        url: `${defaults.terrainSourceURL}?key=${config.apiKey}`
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

var Unit = /* @__PURE__ */ ((Unit2) => {
  Unit2[Unit2["METRIC"] = 0] = "METRIC";
  Unit2[Unit2["IMPERIAL"] = 1] = "IMPERIAL";
  return Unit2;
})(Unit || {});

export { Language, Map, SdkConfig, Style, Unit, config };
//# sourceMappingURL=maptiler-sdk.mjs.map
