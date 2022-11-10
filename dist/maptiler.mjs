import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

const config = {
  apiKey: "Not defined yet.",
  verbose: false,
  primaryLanguage: null,
  secondaryLanguage: null
};

var Language = /* @__PURE__ */ ((Language2) => {
  Language2["LATIN"] = "latin";
  Language2["NON_LATIN"] = "nonlatin";
  Language2["LOCAL"] = "";
  Language2["AFAR"] = "aa";
  Language2["ABKHAZIAN"] = "ab";
  Language2["AVESTAN"] = "ae";
  Language2["AFRIKAANS"] = "af";
  Language2["AKAN"] = "ak";
  Language2["AMHARIC"] = "am";
  Language2["ARAGONESE"] = "an";
  Language2["ARABIC"] = "ar";
  Language2["ASSAMESE"] = "as";
  Language2["AVARIC"] = "av";
  Language2["AYMARA"] = "ay";
  Language2["AZERBAIJANI"] = "az";
  Language2["BASHKIR"] = "ba";
  Language2["BELARUSIAN"] = "be";
  Language2["BULGARIAN"] = "bg";
  Language2["BIHARI"] = "bh";
  Language2["BISLAMA"] = "bi";
  Language2["BAMBARA"] = "bm";
  Language2["BENGALI"] = "bn";
  Language2["TIBETAN"] = "bo";
  Language2["BRETON"] = "br";
  Language2["BOSNIAN"] = "bs";
  Language2["CATALAN"] = "ca";
  Language2["CHECHEN"] = "ce";
  Language2["CHAMORRO"] = "ch";
  Language2["CORSICAN"] = "co";
  Language2["CREE"] = "cr";
  Language2["CZECH"] = "cs";
  Language2["CHURCH_SLAVIC"] = "cu";
  Language2["CHUVASH"] = "cv";
  Language2["WELSH"] = "cy";
  Language2["DANISH"] = "da";
  Language2["GERMAN"] = "de";
  Language2["MALDIVIAN"] = "dv";
  Language2["DZONGKHA"] = "dz";
  Language2["EWE"] = "ee";
  Language2["GREEK"] = "el";
  Language2["ENGLISH"] = "en";
  Language2["ESPERANTO"] = "eo";
  Language2["SPANISH"] = "es";
  Language2["ESTONIAN"] = "et";
  Language2["BASQUE"] = "eu";
  Language2["PERSIAN"] = "fa";
  Language2["FULAH"] = "ff";
  Language2["FINNISH"] = "fi";
  Language2["FIJIAN"] = "fj";
  Language2["FAROESE"] = "fo";
  Language2["FRENCH"] = "fr";
  Language2["WESTERN_FRISIAN"] = "fy";
  Language2["IRISH"] = "ga";
  Language2["GAELIC"] = "gd";
  Language2["GALICIAN"] = "gl";
  Language2["GUARANI"] = "gn";
  Language2["GUJARATI"] = "gu";
  Language2["MANX"] = "gv";
  Language2["HAUSA"] = "ha";
  Language2["HEBREW"] = "he";
  Language2["HINDI"] = "hi";
  Language2["HIRI_MOTU"] = "ho";
  Language2["CROATIAN"] = "hr";
  Language2["HAITIAN"] = "ht";
  Language2["HUNGARIAN"] = "hu";
  Language2["ARMENIAN"] = "hy";
  Language2["HERERO"] = "hz";
  Language2["INTERLINGUA"] = "ia";
  Language2["INDONESIAN"] = "id";
  Language2["INTERLINGUE"] = "ie";
  Language2["IGBO"] = "ig";
  Language2["SICHUAN_YI"] = "ii";
  Language2["INUPIAQ"] = "ik";
  Language2["IDO"] = "io";
  Language2["ICELANDIC"] = "is";
  Language2["ITALIAN"] = "it";
  Language2["INUKTITUT"] = "iu";
  Language2["JAPANESE"] = "ja";
  Language2["JAVANESE"] = "jv";
  Language2["GEORGIAN"] = "ka";
  Language2["KONGO"] = "kg";
  Language2["KIKUYU"] = "ki";
  Language2["KUANYAMA"] = "kj";
  Language2["KAZAKH"] = "kk";
  Language2["KALAALLISUT"] = "kl";
  Language2["CENTRAL_KHMER"] = "km";
  Language2["KANNADA"] = "kn";
  Language2["KOREAN"] = "ko";
  Language2["KANURI"] = "kr";
  Language2["KASHMIRI"] = "ks";
  Language2["KURDISH"] = "ku";
  Language2["KOMI"] = "kv";
  Language2["CORNISH"] = "kw";
  Language2["KIRGHIZ"] = "ky";
  Language2["LUXEMBOURGISH"] = "lb";
  Language2["GANDA"] = "lg";
  Language2["LIMBURGAN"] = "li";
  Language2["LINGALA"] = "ln";
  Language2["LAO"] = "lo";
  Language2["LITHUANIAN"] = "lt";
  Language2["LUBA_KATANGA"] = "lu";
  Language2["LATVIAN"] = "lv";
  Language2["MALAGASY"] = "mg";
  Language2["MARSHALLESE"] = "mh";
  Language2["MAORI"] = "mi";
  Language2["MACEDONIAN"] = "mk";
  Language2["MALAYALAM"] = "ml";
  Language2["MONGOLIAN"] = "mn";
  Language2["MARATHI"] = "mr";
  Language2["MALAY"] = "ms";
  Language2["MALTESE"] = "mt";
  Language2["BURMESE"] = "my";
  Language2["NAURU"] = "na";
  Language2["NORWEGIAN"] = "no";
  Language2["NORTH_NDEBELE"] = "nd";
  Language2["NEPALI"] = "ne";
  Language2["NDONGA"] = "ng";
  Language2["DUTCH"] = "nl";
  Language2["SOUTH_NDEBELE"] = "nr";
  Language2["NAVAJO"] = "nv";
  Language2["CHICHEWA"] = "ny";
  Language2["OCCITAN"] = "oc";
  Language2["OJIBWA"] = "oj";
  Language2["OROMO"] = "om";
  Language2["ORIYA"] = "or";
  Language2["OSSETIC"] = "os";
  Language2["PANJABI"] = "pa";
  Language2["PALI"] = "pi";
  Language2["POLISH"] = "pl";
  Language2["PUSHTO"] = "ps";
  Language2["PORTUGUESE"] = "pt";
  Language2["QUECHUA"] = "qu";
  Language2["ROMANSH"] = "rm";
  Language2["RUNDI"] = "rn";
  Language2["ROMANIAN"] = "ro";
  Language2["RUSSIAN"] = "ru";
  Language2["KINYARWANDA"] = "rw";
  Language2["SANSKRIT"] = "sa";
  Language2["SARDINIAN"] = "sc";
  Language2["SINDHI"] = "sd";
  Language2["NORTHERN_SAMI"] = "se";
  Language2["SANGO"] = "sg";
  Language2["SINHALA"] = "si";
  Language2["SLOVAK"] = "sk";
  Language2["SLOVENIAN"] = "sl";
  Language2["SAMOAN"] = "sm";
  Language2["SHONA"] = "sn";
  Language2["SOMALI"] = "so";
  Language2["ALBANIAN"] = "sq";
  Language2["SERBIAN"] = "sr";
  Language2["SWATI"] = "ss";
  Language2["SOTHO_SOUTHERN"] = "st";
  Language2["SUNDANESE"] = "su";
  Language2["SWEDISH"] = "sv";
  Language2["SWAHILI"] = "sw";
  Language2["TAMIL"] = "ta";
  Language2["TELUGU"] = "te";
  Language2["TAJIK"] = "tg";
  Language2["THAI"] = "th";
  Language2["TIGRINYA"] = "ti";
  Language2["TURKMEN"] = "tk";
  Language2["TAGALOG"] = "tl";
  Language2["TSWANA"] = "tn";
  Language2["TONGA"] = "to";
  Language2["TURKISH"] = "tr";
  Language2["TSONGA"] = "ts";
  Language2["TATAR"] = "tt";
  Language2["TWI"] = "tw";
  Language2["TAHITIAN"] = "ty";
  Language2["UIGHUR"] = "ug";
  Language2["UKRAINIAN"] = "uk";
  Language2["URDU"] = "ur";
  Language2["UZBEK"] = "uz";
  Language2["VENDA"] = "ve";
  Language2["VIETNAMESE"] = "vi";
  Language2["VOLAPUK"] = "vo";
  Language2["WALLOON"] = "wa";
  Language2["WOLOF"] = "wo";
  Language2["XHOSA"] = "xh";
  Language2["YIDDISH"] = "yi";
  Language2["YORUBA"] = "yo";
  Language2["ZHUANG"] = "za";
  Language2["CHINESE"] = "zh";
  Language2["ZULU"] = "zu";
  return Language2;
})(Language || {});

const defaults = {
  mapStyle: "streets-v2",
  maptilerLogoURL: "https://api.maptiler.com/resources/logo.svg",
  maptilerURL: "https://www.maptiler.com/",
  maptilerApiURL: "https://api.maptiler.com/",
  rtlPluginURL: "https://cdn.maptiler.com/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.min.js",
  primaryLanguage: Language.LATIN,
  secondaryLanguage: Language.NON_LATIN
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

var Style = /* @__PURE__ */ ((Style2) => {
  Style2["STREETS"] = "streets-v2";
  Style2["HYBRID"] = "hybrid";
  Style2["SATELLITE"] = "satellite";
  Style2["OUTDOOR"] = "outdoor";
  Style2["BASIC"] = "basic-v2";
  Style2["DARK"] = "streets-v2-dark";
  Style2["LIGHT"] = "streets-v2-light";
  return Style2;
})(Style || {});
const builtInStyles = {};
builtInStyles["satellite" /* SATELLITE */] = satelliteBuiltin;
function isBuiltinStyle(styleId) {
  return styleId in builtInStyles;
}
function prepareBuiltinStyle(styleId, apiKey) {
  if (!isBuiltinStyle(styleId)) {
    return null;
  }
  const fullTextVersion = JSON.stringify(builtInStyles[styleId]).replace(/{key}/gi, apiKey);
  return JSON.parse(fullTextVersion);
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
var __async$4 = (__this, __arguments, generator) => {
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
    this.once("load", () => __async$4(this, null, function* () {
      enableRTL();
    }));
    this.once("load", () => __async$4(this, null, function* () {
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
        if (!options.attributionControl) {
          this.addControl(new maplibre.AttributionControl());
        }
      } else if (options.maptilerLogo) {
        this.addControl(new CustomLogoControl(), options.logoPosition);
      }
    }));
  }
  setStyle(style, options) {
    let tempStyle = style;
    console.log("DEBUG02");
    if (typeof style === "string" && isBuiltinStyle(style)) {
      tempStyle = prepareBuiltinStyle(style, config.apiKey);
    } else if (typeof style === "string") {
      tempStyle = expandMapStyle(style);
    }
    return super.setStyle(tempStyle, options);
  }
  setLanguage(language = defaults.primaryLanguage) {
    this.setPrimaryLanguage(language);
  }
  setPrimaryLanguage(language = defaults.primaryLanguage) {
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
}

class ServiceError extends Error {
  constructor(res, customMessage = "") {
    super(
      `Call to enpoint ${res.url} failed with the status code ${res.status}. ${customMessage}`
    );
    this.res = res;
  }
}

var __async$3 = (__this, __arguments, generator) => {
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
const customMessages$3 = {
  400: "Query too long / Invalid parameters",
  403: "Key is missing, invalid or restricted"
};
function forward(_0) {
  return __async$3(this, arguments, function* (query, options = {}) {
    const endpoint = new URL(
      `geocoding/${encodeURIComponent(query)}.json`,
      defaults.maptilerApiURL
    );
    endpoint.searchParams.set("key", config.apiKey);
    if ("bbox" in options) {
      endpoint.searchParams.set(
        "bbox",
        [
          options.bbox.southWest.lng,
          options.bbox.southWest.lat,
          options.bbox.northEast.lng,
          options.bbox.northEast.lat
        ].join(",")
      );
    }
    if ("proximity" in options) {
      endpoint.searchParams.set(
        "proximity",
        [options.proximity.lng, options.proximity.lat].join(",")
      );
    }
    if ("language" in options) {
      const languages = (Array.isArray(options.language) ? options.language : [options.language]).join(",");
      endpoint.searchParams.set("language", languages);
    }
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(
        res,
        res.status in customMessages$3 ? customMessages$3[res.status] : ""
      );
    }
    const obj = yield res.json();
    return obj;
  });
}
function reverse(_0) {
  return __async$3(this, arguments, function* (lngLat, options = {}) {
    const endpoint = new URL(
      `geocoding/${lngLat.lng},${lngLat.lat}.json`,
      defaults.maptilerApiURL
    );
    endpoint.searchParams.set("key", config.apiKey);
    if ("bbox" in options) {
      endpoint.searchParams.set(
        "bbox",
        [
          options.bbox.southWest.lng,
          options.bbox.southWest.lat,
          options.bbox.northEast.lng,
          options.bbox.northEast.lat
        ].join(",")
      );
    }
    if ("proximity" in options) {
      endpoint.searchParams.set(
        "proximity",
        [options.proximity.lng, options.proximity.lat].join(",")
      );
    }
    if ("language" in options) {
      const languages = (Array.isArray(options.language) ? options.language : [options.language]).join(",");
      endpoint.searchParams.set("language", languages);
    }
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(
        res,
        res.status in customMessages$3 ? customMessages$3[res.status] : ""
      );
    }
    const obj = yield res.json();
    return obj;
  });
}
const geocoder = {
  forward,
  reverse
};

var __async$2 = (__this, __arguments, generator) => {
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
const customMessages$2 = {
  403: "Key is missing, invalid or restricted"
};
function info() {
  return __async$2(this, null, function* () {
    const endpoint = new URL(`geolocation/ip.json`, defaults.maptilerApiURL);
    endpoint.searchParams.set("key", config.apiKey);
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(
        res,
        res.status in customMessages$2 ? customMessages$2[res.status] : ""
      );
    }
    const obj = yield res.json();
    return obj;
  });
}
const geolocation = {
  info
};

var __async$1 = (__this, __arguments, generator) => {
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
const customMessages$1 = {
  403: "Key is missing, invalid or restricted"
};
function search(_0) {
  return __async$1(this, arguments, function* (query, options = {}) {
    const endpoint = new URL(
      `coordinates/search/${query}.json`,
      defaults.maptilerApiURL
    );
    endpoint.searchParams.set("key", config.apiKey);
    if ("limit" in options) {
      endpoint.searchParams.set("limit", options.limit.toString());
    }
    if ("transformations" in options) {
      endpoint.searchParams.set(
        "transformations",
        options.transformations.toString()
      );
    }
    if ("exports" in options) {
      endpoint.searchParams.set("exports", options.exports.toString());
    }
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(
        res,
        res.status in customMessages$1 ? customMessages$1[res.status] : ""
      );
    }
    const obj = yield res.json();
    return obj;
  });
}
function transform(_0) {
  return __async$1(this, arguments, function* (coordinates2, options = {}) {
    const coordinatesStr = (Array.isArray(coordinates2) ? coordinates2 : [coordinates2]).map((coord) => `${coord.lng},${coord.lat}`).join(";");
    const endpoint = new URL(
      `coordinates/transform/${coordinatesStr}.json`,
      defaults.maptilerApiURL
    );
    endpoint.searchParams.set("key", config.apiKey);
    if ("sourceCrs" in options) {
      endpoint.searchParams.set("s_srs", options.sourceCrs.toString());
    }
    if ("targetCrs" in options) {
      endpoint.searchParams.set("t_srs", options.targetCrs.toString());
    }
    if ("operations" in options) {
      endpoint.searchParams.set(
        "ops",
        (Array.isArray(options.operations) ? options.operations : [options.operations]).join("|")
      );
    }
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(
        res,
        res.status in customMessages$1 ? customMessages$1[res.status] : ""
      );
    }
    const obj = yield res.json();
    return obj;
  });
}
const coordinates = {
  search,
  transform
};

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
const customMessages = {
  403: "Key is missing, invalid or restricted"
};
function get(dataId) {
  return __async(this, null, function* () {
    const endpoint = new URL(
      `data/${encodeURIComponent(dataId)}/features.json`,
      defaults.maptilerApiURL
    );
    endpoint.searchParams.set("key", config.apiKey);
    const urlWithParams = endpoint.toString();
    const res = yield fetch(urlWithParams);
    if (!res.ok) {
      throw new ServiceError(
        res,
        res.status in customMessages ? customMessages[res.status] : ""
      );
    }
    const obj = yield res.json();
    return obj;
  });
}
const data = {
  get
};

function getSqSegDist(p, p1, p2) {
  let x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}
function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  let maxSqDist = sqTolerance, index;
  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }
  if (maxSqDist > sqTolerance) {
    if (index - first > 1) {
      simplifyDPStep(points, first, index, sqTolerance, simplified);
    }
    simplified.push(points[index]);
    if (last - index > 1) {
      simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }
}
function simplifyDouglasPeucker(points, sqTolerance) {
  const last = points.length - 1;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);
  return simplified;
}
function simplify(points, tolerance) {
  if (points.length <= 2) {
    return points;
  }
  const sqTolerance = tolerance !== void 0 ? tolerance * tolerance : 1;
  const simplePoints = simplifyDouglasPeucker(points, sqTolerance);
  return simplePoints;
}

function staticMapMarkerToString(marker, includeColor = true) {
  let str = `${marker.lng},${marker.lat}`;
  if (marker.color && includeColor) {
    str += `,${marker.color}`;
  }
  return str;
}
function simplifyAndStringify(path, maxNbChar = 3e3) {
  let str = path.map((point) => point.join(",")).join("|");
  let tolerance = 5e-6;
  const toleranceStep = 1e-5;
  while (str.length > maxNbChar) {
    const simplerPath = simplify(path, tolerance);
    str = simplerPath.map((point) => `${point[0]},${point[1]}`).join("|");
    tolerance += toleranceStep;
  }
  return str;
}
function centered(center, zoom, options = {}) {
  var _a, _b, _c, _d, _e;
  const style = (_a = options.style) != null ? _a : defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = (_b = options.format) != null ? _b : "png";
  let width = ~~((_c = options.width) != null ? _c : 1024);
  let height = ~~((_d = options.height) != null ? _d : 1024);
  if (options.hiDPI) {
    width = ~~(width / 2);
    height = ~~(height / 2);
  }
  const endpoint = new URL(
    `maps/${encodeURIComponent(style)}/static/${center.lng},${center.lat},${zoom}/${width}x${height}${scale}.${format}`,
    defaults.maptilerApiURL
  );
  if ("attribution" in options) {
    endpoint.searchParams.set("attribution", options.attribution.toString());
  }
  if ("marker" in options) {
    let markerStr = "";
    const hasIcon = "markerIcon" in options;
    if (hasIcon) {
      markerStr += `icon:${options.markerIcon}|`;
    }
    if (hasIcon && "markerAnchor" in options) {
      markerStr += `anchor:${options.markerAnchor}|`;
    }
    if (hasIcon && options.hiDPI) {
      markerStr += `scale:2|`;
    }
    const markerList = Array.isArray(options.marker) ? options.marker : [options.marker];
    markerStr += markerList.map((m) => staticMapMarkerToString(m, !hasIcon)).join("|");
    endpoint.searchParams.set("markers", markerStr);
  }
  if ("path" in options) {
    let pathStr = "";
    pathStr += `fill:${(_e = options.pathFillColor) != null ? _e : "none"}|`;
    if ("pathStrokeColor" in options) {
      pathStr += `stroke:${options.pathStrokeColor}|`;
    }
    if ("pathWidth" in options) {
      const pathWidth = options.pathWidth / (options.hiDPI ? 2 : 1);
      pathStr += `width:${pathWidth.toString()}|`;
    }
    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }
  endpoint.searchParams.set("key", config.apiKey);
  return endpoint.toString();
}
function bounded(boundingBox, options = {}) {
  var _a, _b, _c, _d, _e;
  const style = (_a = options.style) != null ? _a : defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = (_b = options.format) != null ? _b : "png";
  let width = ~~((_c = options.width) != null ? _c : 1024);
  let height = ~~((_d = options.height) != null ? _d : 1024);
  if (options.hiDPI) {
    width = ~~(width / 2);
    height = ~~(height / 2);
  }
  const endpoint = new URL(
    `maps/${encodeURIComponent(style)}/static/${boundingBox.southWest.lng},${boundingBox.southWest.lat},${boundingBox.northEast.lng},${boundingBox.northEast.lat}/${width}x${height}${scale}.${format}`,
    defaults.maptilerApiURL
  );
  if ("attribution" in options) {
    endpoint.searchParams.set("attribution", options.attribution.toString());
  }
  if ("padding" in options) {
    endpoint.searchParams.set("padding", options.padding.toString());
  }
  if ("marker" in options) {
    let markerStr = "";
    const hasIcon = "markerIcon" in options;
    if (hasIcon) {
      markerStr += `icon:${options.markerIcon}|`;
    }
    if (hasIcon && "markerAnchor" in options) {
      markerStr += `anchor:${options.markerAnchor}|`;
    }
    if (hasIcon && options.hiDPI) {
      markerStr += `scale:2|`;
    }
    const markerList = Array.isArray(options.marker) ? options.marker : [options.marker];
    markerStr += markerList.map((m) => staticMapMarkerToString(m, !hasIcon)).join("|");
    endpoint.searchParams.set("markers", markerStr);
  }
  if ("path" in options) {
    let pathStr = "";
    pathStr += `fill:${(_e = options.pathFillColor) != null ? _e : "none"}|`;
    if ("pathStrokeColor" in options) {
      pathStr += `stroke:${options.pathStrokeColor}|`;
    }
    if ("pathWidth" in options) {
      const pathWidth = options.pathWidth / (options.hiDPI ? 2 : 1);
      pathStr += `width:${pathWidth.toString()}|`;
    }
    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }
  endpoint.searchParams.set("key", config.apiKey);
  return endpoint.toString();
}
function automatic(options = {}) {
  var _a, _b, _c, _d, _e;
  if (!("marker" in options) && !("path" in options)) {
    throw new Error(
      "Automatic static maps require markers and/or path to be created."
    );
  }
  const style = (_a = options.style) != null ? _a : defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = (_b = options.format) != null ? _b : "png";
  let width = ~~((_c = options.width) != null ? _c : 1024);
  let height = ~~((_d = options.height) != null ? _d : 1024);
  if (options.hiDPI) {
    width = ~~(width / 2);
    height = ~~(height / 2);
  }
  const endpoint = new URL(
    `maps/${encodeURIComponent(
      style
    )}/static/auto/${width}x${height}${scale}.${format}`,
    defaults.maptilerApiURL
  );
  if ("attribution" in options) {
    endpoint.searchParams.set("attribution", options.attribution.toString());
  }
  if ("padding" in options) {
    endpoint.searchParams.set("padding", options.padding.toString());
  }
  if ("marker" in options) {
    let markerStr = "";
    const hasIcon = "markerIcon" in options;
    if (hasIcon) {
      markerStr += `icon:${options.markerIcon}|`;
    }
    if (hasIcon && "markerAnchor" in options) {
      markerStr += `anchor:${options.markerAnchor}|`;
    }
    if (hasIcon && options.hiDPI) {
      markerStr += `scale:2|`;
    }
    const markerList = Array.isArray(options.marker) ? options.marker : [options.marker];
    markerStr += markerList.map((m) => staticMapMarkerToString(m, !hasIcon)).join("|");
    endpoint.searchParams.set("markers", markerStr);
  }
  if ("path" in options) {
    let pathStr = "";
    pathStr += `fill:${(_e = options.pathFillColor) != null ? _e : "none"}|`;
    if ("pathStrokeColor" in options) {
      pathStr += `stroke:${options.pathStrokeColor}|`;
    }
    if ("pathWidth" in options) {
      const pathWidth = options.pathWidth / (options.hiDPI ? 2 : 1);
      pathStr += `width:${pathWidth.toString()}|`;
    }
    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }
  endpoint.searchParams.set("key", config.apiKey);
  return endpoint.toString();
}
const staticMaps = {
  centered,
  bounded,
  automatic
};

var Unit = /* @__PURE__ */ ((Unit2) => {
  Unit2[Unit2["METRIC"] = 0] = "METRIC";
  Unit2[Unit2["IMPERIAL"] = 1] = "IMPERIAL";
  return Unit2;
})(Unit || {});

export { Language, Map, ServiceError, Style, Unit, config, coordinates, data, geocoder, geolocation, staticMaps };
//# sourceMappingURL=maptiler.mjs.map
