import * as maplibre from 'maplibre-gl';
export * from 'maplibre-gl';

const config = {
  apiToken: "Not defined yet.",
  verbose: false,
  primaryLanguage: null,
  secondaryLanguage: null
};

var languages = /* @__PURE__ */ ((languages2) => {
  languages2["LATIN"] = "latin";
  languages2["NON_LATIN"] = "nonlatin";
  languages2["LOCAL"] = "";
  languages2["AFAR"] = "aa";
  languages2["ABKHAZIAN"] = "ab";
  languages2["AVESTAN"] = "ae";
  languages2["AFRIKAANS"] = "af";
  languages2["AKAN"] = "ak";
  languages2["AMHARIC"] = "am";
  languages2["ARAGONESE"] = "an";
  languages2["ARABIC"] = "ar";
  languages2["ASSAMESE"] = "as";
  languages2["AVARIC"] = "av";
  languages2["AYMARA"] = "ay";
  languages2["AZERBAIJANI"] = "az";
  languages2["BASHKIR"] = "ba";
  languages2["BELARUSIAN"] = "be";
  languages2["BULGARIAN"] = "bg";
  languages2["BIHARI"] = "bh";
  languages2["BISLAMA"] = "bi";
  languages2["BAMBARA"] = "bm";
  languages2["BENGALI"] = "bn";
  languages2["TIBETAN"] = "bo";
  languages2["BRETON"] = "br";
  languages2["BOSNIAN"] = "bs";
  languages2["CATALAN"] = "ca";
  languages2["CHECHEN"] = "ce";
  languages2["CHAMORRO"] = "ch";
  languages2["CORSICAN"] = "co";
  languages2["CREE"] = "cr";
  languages2["CZECH"] = "cs";
  languages2["CHURCH_SLAVIC"] = "cu";
  languages2["CHUVASH"] = "cv";
  languages2["WELSH"] = "cy";
  languages2["DANISH"] = "da";
  languages2["GERMAN"] = "de";
  languages2["MALDIVIAN"] = "dv";
  languages2["DZONGKHA"] = "dz";
  languages2["EWE"] = "ee";
  languages2["GREEK"] = "el";
  languages2["ENGLISH"] = "en";
  languages2["ESPERANTO"] = "eo";
  languages2["SPANISH"] = "es";
  languages2["ESTONIAN"] = "et";
  languages2["BASQUE"] = "eu";
  languages2["PERSIAN"] = "fa";
  languages2["FULAH"] = "ff";
  languages2["FINNISH"] = "fi";
  languages2["FIJIAN"] = "fj";
  languages2["FAROESE"] = "fo";
  languages2["FRENCH"] = "fr";
  languages2["WESTERN_FRISIAN"] = "fy";
  languages2["IRISH"] = "ga";
  languages2["GAELIC"] = "gd";
  languages2["GALICIAN"] = "gl";
  languages2["GUARANI"] = "gn";
  languages2["GUJARATI"] = "gu";
  languages2["MANX"] = "gv";
  languages2["HAUSA"] = "ha";
  languages2["HEBREW"] = "he";
  languages2["HINDI"] = "hi";
  languages2["HIRI_MOTU"] = "ho";
  languages2["CROATIAN"] = "hr";
  languages2["HAITIAN"] = "ht";
  languages2["HUNGARIAN"] = "hu";
  languages2["ARMENIAN"] = "hy";
  languages2["HERERO"] = "hz";
  languages2["INTERLINGUA"] = "ia";
  languages2["INDONESIAN"] = "id";
  languages2["INTERLINGUE"] = "ie";
  languages2["IGBO"] = "ig";
  languages2["SICHUAN_YI"] = "ii";
  languages2["INUPIAQ"] = "ik";
  languages2["IDO"] = "io";
  languages2["ICELANDIC"] = "is";
  languages2["ITALIAN"] = "it";
  languages2["INUKTITUT"] = "iu";
  languages2["JAPANESE"] = "ja";
  languages2["JAVANESE"] = "jv";
  languages2["GEORGIAN"] = "ka";
  languages2["KONGO"] = "kg";
  languages2["KIKUYU"] = "ki";
  languages2["KUANYAMA"] = "kj";
  languages2["KAZAKH"] = "kk";
  languages2["KALAALLISUT"] = "kl";
  languages2["CENTRAL_KHMER"] = "km";
  languages2["KANNADA"] = "kn";
  languages2["KOREAN"] = "ko";
  languages2["KANURI"] = "kr";
  languages2["KASHMIRI"] = "ks";
  languages2["KURDISH"] = "ku";
  languages2["KOMI"] = "kv";
  languages2["CORNISH"] = "kw";
  languages2["KIRGHIZ"] = "ky";
  languages2["LUXEMBOURGISH"] = "lb";
  languages2["GANDA"] = "lg";
  languages2["LIMBURGAN"] = "li";
  languages2["LINGALA"] = "ln";
  languages2["LAO"] = "lo";
  languages2["LITHUANIAN"] = "lt";
  languages2["LUBA_KATANGA"] = "lu";
  languages2["LATVIAN"] = "lv";
  languages2["MALAGASY"] = "mg";
  languages2["MARSHALLESE"] = "mh";
  languages2["MAORI"] = "mi";
  languages2["MACEDONIAN"] = "mk";
  languages2["MALAYALAM"] = "ml";
  languages2["MONGOLIAN"] = "mn";
  languages2["MARATHI"] = "mr";
  languages2["MALAY"] = "ms";
  languages2["MALTESE"] = "mt";
  languages2["BURMESE"] = "my";
  languages2["NAURU"] = "na";
  languages2["NORWEGIAN"] = "no";
  languages2["NORTH_NDEBELE"] = "nd";
  languages2["NEPALI"] = "ne";
  languages2["NDONGA"] = "ng";
  languages2["DUTCH"] = "nl";
  languages2["SOUTH_NDEBELE"] = "nr";
  languages2["NAVAJO"] = "nv";
  languages2["CHICHEWA"] = "ny";
  languages2["OCCITAN"] = "oc";
  languages2["OJIBWA"] = "oj";
  languages2["OROMO"] = "om";
  languages2["ORIYA"] = "or";
  languages2["OSSETIC"] = "os";
  languages2["PANJABI"] = "pa";
  languages2["PALI"] = "pi";
  languages2["POLISH"] = "pl";
  languages2["PUSHTO"] = "ps";
  languages2["PORTUGUESE"] = "pt";
  languages2["QUECHUA"] = "qu";
  languages2["ROMANSH"] = "rm";
  languages2["RUNDI"] = "rn";
  languages2["ROMANIAN"] = "ro";
  languages2["RUSSIAN"] = "ru";
  languages2["KINYARWANDA"] = "rw";
  languages2["SANSKRIT"] = "sa";
  languages2["SARDINIAN"] = "sc";
  languages2["SINDHI"] = "sd";
  languages2["NORTHERN_SAMI"] = "se";
  languages2["SANGO"] = "sg";
  languages2["SINHALA"] = "si";
  languages2["SLOVAK"] = "sk";
  languages2["SLOVENIAN"] = "sl";
  languages2["SAMOAN"] = "sm";
  languages2["SHONA"] = "sn";
  languages2["SOMALI"] = "so";
  languages2["ALBANIAN"] = "sq";
  languages2["SERBIAN"] = "sr";
  languages2["SWATI"] = "ss";
  languages2["SOTHO_SOUTHERN"] = "st";
  languages2["SUNDANESE"] = "su";
  languages2["SWEDISH"] = "sv";
  languages2["SWAHILI"] = "sw";
  languages2["TAMIL"] = "ta";
  languages2["TELUGU"] = "te";
  languages2["TAJIK"] = "tg";
  languages2["THAI"] = "th";
  languages2["TIGRINYA"] = "ti";
  languages2["TURKMEN"] = "tk";
  languages2["TAGALOG"] = "tl";
  languages2["TSWANA"] = "tn";
  languages2["TONGA"] = "to";
  languages2["TURKISH"] = "tr";
  languages2["TSONGA"] = "ts";
  languages2["TATAR"] = "tt";
  languages2["TWI"] = "tw";
  languages2["TAHITIAN"] = "ty";
  languages2["UIGHUR"] = "ug";
  languages2["UKRAINIAN"] = "uk";
  languages2["URDU"] = "ur";
  languages2["UZBEK"] = "uz";
  languages2["VENDA"] = "ve";
  languages2["VIETNAMESE"] = "vi";
  languages2["VOLAPUK"] = "vo";
  languages2["WALLOON"] = "wa";
  languages2["WOLOF"] = "wo";
  languages2["XHOSA"] = "xh";
  languages2["YIDDISH"] = "yi";
  languages2["YORUBA"] = "yo";
  languages2["ZHUANG"] = "za";
  languages2["CHINESE"] = "zh";
  languages2["ZULU"] = "zu";
  return languages2;
})(languages || {});

const defaults = {
  mapStyle: "streets-v2",
  maptilerLogoURL: "https://api.maptiler.com/resources/logo.svg",
  maptilerURL: "https://www.maptiler.com/",
  maptilerApiURL: "https://api.maptiler.com/",
  rtlPluginURL: "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js",
  primaryLanguage: languages.LATIN,
  secondaryLanguage: languages.NON_LATIN
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
  const trimmed = style.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const maptilerDomainRegex = /^maptiler:\/\/(.*)/;
  const match = maptilerDomainRegex.exec(trimmed);
  if (match) {
    return `https://api.maptiler.com/maps/${match[1]}/style.json`;
  }
  let expandedStyle = `https://api.maptiler.com/maps/${trimmed}/style.json`;
  if (!expandedStyle.includes("key=")) {
    expandedStyle = `${expandedStyle}?key=${config.apiToken}`;
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
    let style = expandMapStyle(defaults.mapStyle);
    if ("style" in options) {
      style = expandMapStyle(options.style);
    } else {
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
    const expandedStyle = style ? expandMapStyle(style) : null;
    return super.setStyle(expandedStyle, options);
  }
  setlanguage(language = defaults.primaryLanguage) {
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
    endpoint.searchParams.set("key", config.apiToken);
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
    endpoint.searchParams.set("key", config.apiToken);
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
    endpoint.searchParams.set("key", config.apiToken);
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
    endpoint.searchParams.set("key", config.apiToken);
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
    endpoint.searchParams.set("key", config.apiToken);
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
    endpoint.searchParams.set("key", config.apiToken);
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
  endpoint.searchParams.set("key", config.apiToken);
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
  endpoint.searchParams.set("key", config.apiToken);
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
    if (hasIcon && "markerScale" in options) {
      markerStr += `scale:2}|`;
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
  endpoint.searchParams.set("key", config.apiToken);
  return endpoint.toString();
}
const staticMaps = {
  centered,
  bounded,
  automatic
};

var units = /* @__PURE__ */ ((units2) => {
  units2[units2["METRIC"] = 0] = "METRIC";
  units2[units2["IMPERIAL"] = 1] = "IMPERIAL";
  return units2;
})(units || {});

export { Map, ServiceError, config, coordinates, data, geocoder, geolocation, languages, staticMaps, units };
//# sourceMappingURL=maptiler.mjs.map
