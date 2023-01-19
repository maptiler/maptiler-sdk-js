import maplibregl__default from 'maplibre-gl';
export * from 'maplibre-gl';
import { Base64 } from 'js-base64';
import { v4 } from 'uuid';
import EventEmitter from 'events';
import { config as config$1, geolocation } from '@maptiler/client';
export { LanguageGeocoding, ServiceError, coordinates, data, geocoding, geolocation, staticMaps } from '@maptiler/client';

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
const languagesIsoSet = new Set(Object.values(Language));
function isLanguageSupported(lang) {
  return languagesIsoSet.has(lang);
}
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

class SdkConfig extends EventEmitter {
  constructor() {
    super();
    this.primaryLanguage = Language.AUTO;
    this.secondaryLanguage = null;
    this._unit = "metric";
    this._apiKey = "";
  }
  set unit(u) {
    this._unit = u;
    this.emit("unit", u);
  }
  get unit() {
    return this._unit;
  }
  set apiKey(k) {
    this._apiKey = k;
    config$1.apiKey = k;
    this.emit("apiKey", k);
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

const defaults = {
  maptilerLogoURL: "https://api.maptiler.com/resources/logo.svg",
  maptilerURL: "https://www.maptiler.com/",
  maptilerApiHost: "api.maptiler.com",
  rtlPluginURL: "https://cdn.maptiler.com/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.min.js",
  primaryLanguage: Language.LATIN,
  secondaryLanguage: Language.NON_LATIN,
  terrainSourceURL: "https://api.maptiler.com/tiles/terrain-rgb/tiles.json",
  terrainSourceId: "maptiler-terrain"
};
Object.freeze(defaults);

class CustomLogoControl extends maplibregl__default.LogoControl {
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

function enableRTL() {
  if (maplibregl__default.getRTLTextPluginStatus() === "unavailable") {
    maplibregl__default.setRTLTextPlugin(
      defaults.rtlPluginURL,
      null,
      true
    );
  }
}
function bindAll(fns, context) {
  fns.forEach((fn) => {
    if (!context[fn]) {
      return;
    }
    context[fn] = context[fn].bind(context);
  });
}
function DOMcreate(tagName, className, container) {
  const el = window.document.createElement(tagName);
  if (className !== void 0)
    el.className = className;
  if (container)
    container.appendChild(el);
  return el;
}
function DOMremove(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

var version$2 = 8;
var id$1 = "f0e4ff8c-a9e4-414e-9f4d-7938762c948f";
var name$1 = "Satellite no label";
var sources$1 = {
	satellite: {
		url: "https://api.maptiler.com/tiles/satellite-v2/tiles.json",
		tileSize: 512,
		type: "raster"
	},
	maptiler_attribution: {
		attribution: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		type: "vector"
	}
};
var layers$1 = [
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
var metadata$1 = {
	"maptiler:copyright": "This style was generated on MapTiler Cloud. Usage outside of MapTiler Cloud or MapTiler Server requires valid MapTiler Data package: https://www.maptiler.com/data/ -- please contact us."
};
var glyphs$1 = "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?";
var bearing$1 = 0;
var pitch$1 = 0;
var center$1 = [
	-78.55323097748868,
	24.03141891413972
];
var zoom$1 = 5.066147709178387;
var satelliteBuiltin = {
	version: version$2,
	id: id$1,
	name: name$1,
	sources: sources$1,
	layers: layers$1,
	metadata: metadata$1,
	glyphs: glyphs$1,
	bearing: bearing$1,
	pitch: pitch$1,
	center: center$1,
	zoom: zoom$1
};

var version$1 = 8;
var id = "stage-dark";
var name = "Stage Dark";
var sources = {
	maptiler_planet: {
		url: "https://api.maptiler.com/tiles/v3/tiles.json",
		type: "vector"
	},
	maptiler_attribution: {
		attribution: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		type: "vector"
	}
};
var layers = [
	{
		id: "background",
		type: "background",
		layout: {
			visibility: "visible"
		},
		paint: {
			"background-color": "hsl(0, 0%, 16%)",
			"background-opacity": 1
		}
	},
	{
		id: "residential",
		type: "fill",
		source: "maptiler_planet",
		"source-layer": "landuse",
		minzoom: 13,
		maxzoom: 13,
		layout: {
			visibility: "visible"
		},
		paint: {
			"fill-color": {
				stops: [
					[
						13,
						"hsl(330, 0%, 15%)"
					]
				]
			},
			"fill-opacity": 1,
			"fill-antialias": false
		},
		filter: [
			"any",
			[
				"in",
				"class",
				"residential"
			]
		]
	},
	{
		id: "landcover",
		type: "fill",
		source: "maptiler_planet",
		"source-layer": "landcover",
		layout: {
			visibility: "visible"
		},
		paint: {
			"fill-color": "hsl(0, 0%, 16%)",
			"fill-opacity": {
				stops: [
					[
						8,
						0.2
					],
					[
						9,
						0.25
					],
					[
						11,
						0.35
					]
				]
			},
			"fill-antialias": false
		},
		filter: [
			"any",
			[
				"in",
				"class",
				"wood",
				"grass",
				"wetland"
			]
		]
	},
	{
		id: "stadium",
		type: "fill",
		source: "maptiler_planet",
		"source-layer": "landuse",
		minzoom: 10,
		maxzoom: 24,
		layout: {
			visibility: "visible"
		},
		paint: {
			"fill-color": "hsl(0, 0%, 18%)",
			"fill-opacity": {
				stops: [
					[
						10,
						0.25
					],
					[
						14,
						0.55
					]
				]
			},
			"fill-antialias": true,
			"fill-outline-color": "hsl(0, 0%, 16%)"
		},
		filter: [
			"any",
			[
				"in",
				"class",
				"stadium",
				"pitch"
			]
		]
	},
	{
		id: "cemetery",
		type: "fill",
		source: "maptiler_planet",
		"source-layer": "landuse",
		minzoom: 10,
		maxzoom: 24,
		layout: {
			visibility: "visible"
		},
		paint: {
			"fill-color": "hsl(330, 0%, 15%)",
			"fill-opacity": 1,
			"fill-antialias": true
		},
		filter: [
			"any",
			[
				"in",
				"class",
				"cemetery"
			]
		]
	},
	{
		id: "waterway",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "waterway",
		layout: {
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 11%)",
			"line-width": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				8,
				0.5,
				9,
				1,
				15,
				1.5,
				16,
				2.5
			]
		}
	},
	{
		id: "water",
		type: "fill",
		source: "maptiler_planet",
		"source-layer": "water",
		minzoom: 0,
		layout: {
			visibility: "visible"
		},
		paint: {
			"fill-color": "hsl(0, 0%, 11%)",
			"fill-opacity": 1,
			"fill-antialias": true,
			"fill-translate": {
				stops: [
					[
						0,
						[
							0,
							2
						]
					],
					[
						6,
						[
							0,
							3
						]
					],
					[
						12,
						[
							0,
							2
						]
					],
					[
						14,
						[
							0,
							0
						]
					]
				]
			},
			"fill-translate-anchor": "map"
		},
		filter: [
			"all",
			[
				"==",
				"$type",
				"Polygon"
			],
			[
				"!=",
				"brunnel",
				"tunnel"
			]
		]
	},
	{
		id: "aeroway",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "aeroway",
		minzoom: 12,
		layout: {
			"line-cap": "round",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 17%)",
			"line-width": [
				"interpolate",
				[
					"linear",
					1
				],
				[
					"zoom"
				],
				11,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"runway"
					],
					3,
					0.5
				],
				15,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"runway"
					],
					15,
					6
				],
				16,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"runway"
					],
					20,
					6
				]
			]
		},
		metadata: {
		},
		filter: [
			"all",
			[
				"==",
				"$type",
				"LineString"
			]
		]
	},
	{
		id: "tunnel-casing",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 11,
		maxzoom: 24,
		layout: {
			"line-cap": "round",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 17%)",
			"line-width": [
				"interpolate",
				[
					"linear",
					2
				],
				[
					"zoom"
				],
				4,
				0.5,
				7,
				0.5,
				10,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						0,
						2.5
					],
					[
						"trunk",
						"primary"
					],
					2.4,
					0
				],
				12,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						2,
						6
					],
					[
						"trunk",
						"primary"
					],
					3,
					[
						"secondary",
						"tertiary"
					],
					2,
					[
						"minor",
						"service",
						"track"
					],
					1,
					0.5
				],
				14,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						5,
						8
					],
					[
						"trunk"
					],
					4,
					[
						"primary"
					],
					6,
					[
						"secondary"
					],
					6,
					[
						"tertiary"
					],
					4,
					[
						"minor",
						"service",
						"track"
					],
					3,
					3
				],
				16,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					10,
					[
						"secondary"
					],
					9,
					[
						"tertiary"
					],
					8,
					[
						"minor",
						"service",
						"track"
					],
					6,
					6
				],
				20,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					26,
					[
						"secondary"
					],
					26,
					[
						"tertiary"
					],
					26,
					[
						"minor",
						"service",
						"track"
					],
					18,
					18
				]
			],
			"line-opacity": [
				"step",
				[
					"zoom"
				],
				1,
				5,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk"
					],
					0.5,
					0
				],
				6,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk"
					],
					0.5,
					0
				],
				7,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk"
					],
					1,
					0
				],
				8,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					1,
					0
				],
				11,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary",
						"secondary",
						"tertiary"
					],
					1,
					0
				],
				13,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary",
						"secondary",
						"tertiary",
						"minor"
					],
					1,
					0
				],
				15,
				1
			]
		},
		filter: [
			"all",
			[
				"in",
				"class",
				"motorway",
				"trunk",
				"primary",
				"secondary",
				"tertiary",
				"minor",
				"service"
			],
			[
				"==",
				"brunnel",
				"tunnel"
			]
		]
	},
	{
		id: "tunnel_path",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 15,
		maxzoom: 24,
		layout: {
			"line-cap": "round",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 18%)",
			"line-width": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				14,
				0.7,
				16,
				0.8,
				18,
				1,
				22,
				2
			],
			"line-opacity": 1,
			"line-dasharray": [
				0.5,
				2
			]
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"path"
			],
			[
				"==",
				"brunnel",
				"tunnel"
			]
		]
	},
	{
		id: "tunnel",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 11,
		maxzoom: 24,
		layout: {
			"line-cap": "square",
			"line-join": "miter",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 19%)",
			"line-width": [
				"interpolate",
				[
					"linear",
					2
				],
				[
					"zoom"
				],
				5,
				0.5,
				6,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"brunnel"
						],
						[
							"bridge"
						],
						0,
						1
					],
					[
						"trunk",
						"primary"
					],
					0,
					0
				],
				10,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						0,
						2.5
					],
					[
						"trunk",
						"primary"
					],
					1.5,
					1
				],
				12,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						1,
						4
					],
					[
						"trunk"
					],
					2.5,
					[
						"primary"
					],
					2.5,
					[
						"secondary",
						"tertiary"
					],
					1.5,
					[
						"minor",
						"service",
						"track"
					],
					1,
					1
				],
				14,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						5,
						6
					],
					[
						"trunk"
					],
					3,
					[
						"primary"
					],
					5,
					[
						"secondary"
					],
					4,
					[
						"tertiary"
					],
					3,
					[
						"minor",
						"service",
						"track"
					],
					2,
					2
				],
				16,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					8,
					[
						"secondary"
					],
					7,
					[
						"tertiary"
					],
					6,
					[
						"minor",
						"service",
						"track"
					],
					4,
					4
				],
				20,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					24,
					[
						"secondary"
					],
					24,
					[
						"tertiary"
					],
					24,
					[
						"minor",
						"service",
						"track"
					],
					16,
					16
				]
			],
			"line-opacity": [
				"step",
				[
					"zoom"
				],
				1,
				10,
				[
					"match",
					[
						"get",
						"class"
					],
					"motorway",
					1,
					0
				],
				11,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					1,
					0
				],
				13,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary",
						"secondary",
						"tertiary"
					],
					1,
					0
				],
				15,
				1
			]
		},
		filter: [
			"all",
			[
				"in",
				"class",
				"motorway",
				"trunk",
				"primary",
				"secondary",
				"tertiary",
				"minor",
				"service"
			],
			[
				"==",
				"brunnel",
				"tunnel"
			]
		]
	},
	{
		id: "tunnel_rail",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 13,
		layout: {
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 16%)",
			"line-width": {
				base: 1.3,
				stops: [
					[
						13,
						0.5
					],
					[
						14,
						1
					],
					[
						15,
						1
					],
					[
						16,
						3
					],
					[
						21,
						7
					]
				]
			},
			"line-opacity": 0.5
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"rail"
			],
			[
				"==",
				"brunnel",
				"tunnel"
			]
		]
	},
	{
		id: "tunnel_rail-dash",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 15,
		layout: {
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 19%)",
			"line-width": {
				base: 1.3,
				stops: [
					[
						15,
						0.5
					],
					[
						16,
						1
					],
					[
						20,
						5
					]
				]
			},
			"line-dasharray": [
				2,
				2
			]
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"rail"
			],
			[
				"==",
				"brunnel",
				"tunnel"
			]
		]
	},
	{
		id: "road_area_pier",
		type: "fill",
		source: "maptiler_planet",
		"source-layer": "transportation",
		layout: {
			visibility: "visible"
		},
		paint: {
			"fill-color": "hsl(8, 0%, 16%)",
			"fill-antialias": true
		},
		metadata: {
		},
		filter: [
			"all",
			[
				"==",
				"$type",
				"Polygon"
			],
			[
				"==",
				"class",
				"pier"
			]
		]
	},
	{
		id: "road_pier",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		layout: {
			"line-cap": "round",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 16%)",
			"line-width": {
				base: 1.2,
				stops: [
					[
						15,
						1
					],
					[
						17,
						4
					]
				]
			}
		},
		metadata: {
		},
		filter: [
			"all",
			[
				"==",
				"$type",
				"LineString"
			],
			[
				"in",
				"class",
				"pier"
			]
		]
	},
	{
		id: "road_area_bridge",
		type: "fill",
		source: "maptiler_planet",
		"source-layer": "transportation",
		layout: {
			visibility: "visible"
		},
		paint: {
			"fill-color": "hsl(0, 0%, 16%)",
			"fill-opacity": 0.5,
			"fill-antialias": true
		},
		metadata: {
		},
		filter: [
			"all",
			[
				"==",
				"$type",
				"Polygon"
			],
			[
				"in",
				"brunnel",
				"bridge"
			]
		]
	},
	{
		id: "road_network-casing",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 6,
		layout: {
			"line-cap": "butt",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 17%)",
			"line-width": [
				"interpolate",
				[
					"linear",
					2
				],
				[
					"zoom"
				],
				4,
				0.5,
				7,
				0.5,
				10,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						0,
						2.5
					],
					[
						"trunk",
						"primary"
					],
					2.4,
					0
				],
				12,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						2,
						6
					],
					[
						"trunk",
						"primary"
					],
					3,
					[
						"secondary",
						"tertiary"
					],
					2,
					[
						"minor",
						"service",
						"track"
					],
					0,
					0.5
				],
				14,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						5,
						8
					],
					[
						"trunk"
					],
					4,
					[
						"primary"
					],
					6,
					[
						"secondary"
					],
					6,
					[
						"tertiary"
					],
					4,
					[
						"minor",
						"service",
						"track"
					],
					3,
					3
				],
				16,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					10,
					[
						"secondary"
					],
					9,
					[
						"tertiary"
					],
					8,
					[
						"minor",
						"service",
						"track"
					],
					6,
					6
				],
				20,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					26,
					[
						"secondary"
					],
					26,
					[
						"tertiary"
					],
					26,
					[
						"minor",
						"service",
						"track"
					],
					18,
					18
				]
			],
			"line-opacity": 1
		},
		metadata: {
		},
		filter: [
			"all",
			[
				"!in",
				"brunnel",
				"tunnel"
			],
			[
				"!in",
				"class",
				"bridge",
				"ferry",
				"rail",
				"transit",
				"pier",
				"path",
				"aerialway",
				"motorway_construction",
				"trunk_construction",
				"primary_construction",
				"secondary_construction",
				"tertiary_construction",
				"minor_construction",
				"service_construction",
				"track_construction"
			]
		]
	},
	{
		id: "road_network",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 6,
		layout: {
			"line-cap": "butt",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 20%)",
			"line-width": [
				"interpolate",
				[
					"linear",
					2
				],
				[
					"zoom"
				],
				5,
				0.5,
				6,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"brunnel"
						],
						[
							"bridge"
						],
						0,
						1
					],
					[
						"trunk",
						"primary"
					],
					0,
					0
				],
				10,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						0,
						2.5
					],
					[
						"trunk",
						"primary"
					],
					1.5,
					1
				],
				12,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						1,
						4
					],
					[
						"trunk"
					],
					2.5,
					[
						"primary"
					],
					2.5,
					[
						"secondary",
						"tertiary"
					],
					1.5,
					[
						"minor",
						"service",
						"track"
					],
					0,
					1
				],
				14,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway"
					],
					[
						"match",
						[
							"get",
							"ramp"
						],
						1,
						5,
						6
					],
					[
						"trunk"
					],
					3,
					[
						"primary"
					],
					5,
					[
						"secondary"
					],
					4,
					[
						"tertiary"
					],
					3,
					[
						"minor",
						"service",
						"track"
					],
					2,
					2
				],
				16,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					8,
					[
						"secondary"
					],
					7,
					[
						"tertiary"
					],
					6,
					[
						"minor",
						"service",
						"track"
					],
					4,
					4
				],
				20,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"motorway",
						"trunk",
						"primary"
					],
					24,
					[
						"secondary"
					],
					24,
					[
						"tertiary"
					],
					24,
					[
						"minor",
						"service",
						"track"
					],
					16,
					16
				]
			]
		},
		metadata: {
		},
		filter: [
			"all",
			[
				"!=",
				"brunnel",
				"tunnel"
			],
			[
				"!in",
				"class",
				"ferry",
				"rail",
				"transit",
				"pier",
				"bridge",
				"path",
				"aerialway",
				"motorway_construction",
				"trunk_construction",
				"primary_construction",
				"secondary_construction",
				"tertiary_construction",
				"minor_construction",
				"service_construction",
				"track_construction"
			]
		]
	},
	{
		id: "road_path-casing",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 16,
		maxzoom: 24,
		layout: {
			"line-cap": "round",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-blur": {
				stops: [
					[
						16,
						1
					],
					[
						22,
						2
					]
				]
			},
			"line-color": "hsl(0, 0%, 20%)",
			"line-width": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				15,
				1.5,
				16,
				2,
				18,
				6,
				22,
				12
			],
			"line-opacity": {
				stops: [
					[
						15,
						0
					],
					[
						22,
						0.5
					]
				]
			}
		},
		filter: [
			"all",
			[
				"in",
				"class",
				"path",
				"track"
			],
			[
				"!has",
				"brunnel"
			]
		]
	},
	{
		id: "road_path",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 14,
		maxzoom: 24,
		layout: {
			"line-cap": "round",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 16%)",
			"line-width": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				14,
				0.7,
				16,
				0.8,
				18,
				1,
				22,
				2
			],
			"line-opacity": 1,
			"line-dasharray": [
				0.5,
				2
			]
		},
		filter: [
			"all",
			[
				"in",
				"class",
				"path",
				"track"
			],
			[
				"!has",
				"brunnel"
			]
		]
	},
	{
		id: "rail",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 10,
		layout: {
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 16%)",
			"line-width": {
				base: 1.3,
				stops: [
					[
						13,
						0.5
					],
					[
						14,
						1
					],
					[
						15,
						1
					],
					[
						16,
						3
					],
					[
						21,
						7
					]
				]
			}
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"rail"
			],
			[
				"!=",
				"brunnel",
				"tunnel"
			]
		]
	},
	{
		id: "rail-dash",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "transportation",
		minzoom: 15,
		layout: {
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 20%)",
			"line-width": {
				base: 1.3,
				stops: [
					[
						15,
						0.5
					],
					[
						16,
						1
					],
					[
						20,
						5
					]
				]
			},
			"line-dasharray": [
				2,
				2
			]
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"rail"
			],
			[
				"!=",
				"brunnel",
				"tunnel"
			]
		]
	},
	{
		id: "building-top",
		type: "fill",
		source: "maptiler_planet",
		"source-layer": "building",
		layout: {
			visibility: "visible"
		},
		paint: {
			"fill-color": "rgba(0, 0, 0, 0.1)",
			"fill-opacity": {
				base: 1,
				stops: [
					[
						13,
						0
					],
					[
						16,
						1
					]
				]
			},
			"fill-translate": {
				base: 1,
				stops: [
					[
						14,
						[
							0,
							0
						]
					],
					[
						16,
						[
							-2,
							-2
						]
					]
				]
			}
		}
	},
	{
		id: "border_other",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "boundary",
		minzoom: 5,
		maxzoom: 8,
		layout: {
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(2, 0%, 28%)",
			"line-width": [
				"interpolate",
				[
					"linear",
					1
				],
				[
					"zoom"
				],
				3,
				[
					"case",
					[
						"<=",
						[
							"get",
							"admin_level"
						],
						6
					],
					0.5,
					0
				],
				4,
				[
					"case",
					[
						"<=",
						[
							"get",
							"admin_level"
						],
						6
					],
					0.75,
					0
				],
				8,
				[
					"case",
					[
						"<=",
						[
							"get",
							"admin_level"
						],
						6
					],
					1.1,
					0
				],
				12,
				[
					"case",
					[
						"<=",
						[
							"get",
							"admin_level"
						],
						6
					],
					2,
					1.5
				],
				16,
				[
					"case",
					[
						"<=",
						[
							"get",
							"admin_level"
						],
						6
					],
					3,
					2
				]
			],
			"line-opacity": 0.5
		},
		filter: [
			"all",
			[
				">=",
				"admin_level",
				4
			],
			[
				"==",
				"maritime",
				0
			]
		]
	},
	{
		id: "border_disputed",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "boundary",
		minzoom: 0,
		layout: {
			"line-cap": "round",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": "hsl(0, 0%, 30%)",
			"line-width": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				1,
				0.75,
				3,
				1,
				6,
				1.5,
				12,
				5
			],
			"line-offset": 0,
			"line-opacity": 0.5,
			"line-dasharray": [
				2,
				3
			]
		},
		filter: [
			"all",
			[
				"==",
				"admin_level",
				2
			],
			[
				"==",
				"maritime",
				0
			],
			[
				"==",
				"disputed",
				1
			]
		]
	},
	{
		id: "border_country",
		type: "line",
		source: "maptiler_planet",
		"source-layer": "boundary",
		minzoom: 0,
		layout: {
			"line-cap": "round",
			"line-join": "round",
			visibility: "visible"
		},
		paint: {
			"line-color": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				4,
				"hsl(0, 0%, 30%)",
				6,
				"hsl(2, 0%, 29%)"
			],
			"line-width": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				1,
				0.75,
				3,
				1.5,
				7,
				2.2,
				12,
				3.5,
				22,
				8
			],
			"line-offset": 0,
			"line-opacity": 0.5
		},
		filter: [
			"all",
			[
				"==",
				"admin_level",
				2
			],
			[
				"==",
				"maritime",
				0
			],
			[
				"==",
				"disputed",
				0
			]
		]
	},
	{
		id: "water_point",
		type: "symbol",
		source: "maptiler_planet",
		"source-layer": "water_name",
		minzoom: 0,
		maxzoom: 24,
		layout: {
			"text-font": [
				"Metropolis Semi Bold Italic",
				"Noto Sans Bold"
			],
			"text-size": [
				"interpolate",
				[
					"linear",
					1
				],
				[
					"zoom"
				],
				1,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"ocean"
					],
					11,
					0
				],
				4,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"ocean"
					],
					14,
					9
				],
				9,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"ocean"
					],
					18,
					16
				],
				14,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"lake"
					],
					14,
					[
						"sea"
					],
					20,
					24
				]
			],
			"text-field": "{name}",
			visibility: "visible",
			"text-padding": 2,
			"text-max-width": 6,
			"text-transform": "uppercase",
			"symbol-placement": "point",
			"text-line-height": 1.2,
			"text-allow-overlap": false,
			"text-letter-spacing": 0.1,
			"text-pitch-alignment": "auto",
			"text-ignore-placement": false,
			"text-rotation-alignment": "auto"
		},
		paint: {
			"text-color": "hsl(344, 0%, 34%)",
			"text-opacity": [
				"step",
				[
					"zoom"
				],
				0,
				1,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"ocean"
					],
					1,
					0
				],
				4,
				1
			],
			"text-halo-blur": 0,
			"text-halo-width": 0
		},
		filter: [
			"all",
			[
				"==",
				"$type",
				"Point"
			],
			[
				"in",
				"class",
				"ocean",
				"sea"
			],
			[
				"has",
				"name"
			]
		]
	},
	{
		id: "water_line",
		type: "symbol",
		source: "maptiler_planet",
		"source-layer": "water_name",
		layout: {
			"text-font": [
				"Metropolis Semi Bold Italic",
				"Noto Sans Bold"
			],
			"text-size": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				9,
				12,
				14,
				16,
				18,
				20
			],
			"text-field": "{name}",
			visibility: "visible",
			"symbol-spacing": 350,
			"symbol-placement": "line",
			"text-line-height": 1.2,
			"text-pitch-alignment": "auto",
			"text-rotation-alignment": "auto"
		},
		paint: {
			"text-color": "hsl(344, 0%, 34%)"
		},
		filter: [
			"all",
			[
				"has",
				"name"
			],
			[
				"==",
				"$type",
				"LineString"
			]
		]
	},
	{
		id: "road",
		type: "symbol",
		source: "maptiler_planet",
		"source-layer": "transportation_name",
		minzoom: 14,
		layout: {
			"text-font": [
				"Metropolis Semi Bold",
				"Noto Sans Bold"
			],
			"text-size": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				14,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"primary"
					],
					10,
					7
				],
				15,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"primary"
					],
					10,
					[
						"secondary",
						"tertiary"
					],
					9,
					7
				],
				16,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"primary",
						"secondary",
						"tertiary"
					],
					11,
					10
				],
				18,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"primary",
						"secondary",
						"tertiary"
					],
					13,
					12
				]
			],
			"text-field": "{name}",
			visibility: "visible",
			"text-justify": "center",
			"symbol-spacing": {
				stops: [
					[
						6,
						200
					],
					[
						16,
						250
					]
				]
			},
			"symbol-placement": "line",
			"symbol-avoid-edges": false,
			"text-letter-spacing": [
				"interpolate",
				[
					"linear",
					1
				],
				[
					"zoom"
				],
				13,
				0,
				16,
				[
					"match",
					[
						"get",
						"class"
					],
					"primary",
					0.2,
					0.1
				]
			],
			"text-pitch-alignment": "auto",
			"text-rotation-alignment": "auto"
		},
		paint: {
			"text-color": "hsl(358, 0%, 49%)",
			"text-opacity": [
				"step",
				[
					"zoom"
				],
				1,
				14,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"primary"
					],
					1,
					0
				],
				15,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"primary",
						"secondary",
						"tertiary"
					],
					1,
					0
				],
				16,
				1
			],
			"text-halo-blur": 0,
			"text-halo-color": "hsl(154, 0%, 0%)",
			"text-halo-width": 0
		},
		filter: [
			"all",
			[
				"in",
				"class",
				"primary",
				"secondary",
				"tertiary",
				"minor",
				"service"
			]
		]
	},
	{
		id: "place",
		type: "symbol",
		source: "maptiler_planet",
		"source-layer": "place",
		minzoom: 12,
		maxzoom: 24,
		layout: {
			"icon-size": 1,
			"text-font": [
				"Metropolis Semi Bold",
				"Noto Sans Bold"
			],
			"text-size": [
				"interpolate",
				[
					"linear",
					1
				],
				[
					"zoom"
				],
				12,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"village"
					],
					12,
					10
				],
				13,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"suburb",
						"neighborhood",
						"neighbourhood",
						"village"
					],
					12,
					11
				],
				14,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"village"
					],
					14,
					[
						"suburb",
						"neighborhood",
						"neighbourhood"
					],
					12,
					11
				],
				16,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"village",
						"suburb",
						"neighborhood",
						"neighbourhood"
					],
					14,
					13
				]
			],
			"icon-image": "",
			"text-field": "{name}",
			visibility: "visible",
			"text-anchor": "center",
			"text-offset": [
				0.2,
				0.2
			],
			"text-max-width": 10,
			"text-transform": "none",
			"text-keep-upright": true
		},
		paint: {
			"text-color": "hsl(358, 0%, 49%)",
			"text-opacity": [
				"step",
				[
					"zoom"
				],
				0,
				12,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"village"
					],
					1,
					0
				],
				13,
				[
					"match",
					[
						"get",
						"class"
					],
					[
						"village",
						"suburb",
						"neighborhood",
						"neighbourhood"
					],
					1,
					0
				],
				14,
				1
			],
			"text-halo-blur": 0,
			"text-halo-color": "hsl(154, 0%, 0%)",
			"text-halo-width": 0,
			"icon-translate-anchor": "map"
		},
		filter: [
			"any",
			[
				"!in",
				"class",
				"continent",
				"country",
				"state",
				"region",
				"province",
				"city",
				"town"
			]
		]
	},
	{
		id: "town",
		type: "symbol",
		source: "maptiler_planet",
		"source-layer": "place",
		minzoom: 11,
		maxzoom: 16,
		layout: {
			"icon-size": 1,
			"text-font": [
				"Metropolis Semi Bold",
				"Noto Sans Bold"
			],
			"text-size": [
				"interpolate",
				[
					"linear"
				],
				[
					"zoom"
				],
				10,
				11,
				13,
				14,
				14,
				15
			],
			"text-field": "{name}",
			visibility: "visible",
			"text-anchor": "center",
			"text-offset": [
				0.2,
				0.2
			],
			"text-max-width": 10,
			"text-transform": "none",
			"text-keep-upright": true
		},
		paint: {
			"icon-color": "hsl(4, 0%, 41%)",
			"text-color": "hsl(358, 0%, 49%)",
			"text-halo-blur": 0,
			"text-halo-color": "hsl(154, 0%, 0%)",
			"text-halo-width": 0,
			"icon-translate-anchor": "map"
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"town"
			]
		]
	},
	{
		id: "state",
		type: "symbol",
		source: "maptiler_planet",
		"source-layer": "place",
		minzoom: 5,
		maxzoom: 8,
		layout: {
			"text-font": [
				"Metropolis Semi Bold",
				"Noto Sans Bold"
			],
			"text-size": [
				"interpolate",
				[
					"linear",
					1
				],
				[
					"zoom"
				],
				5,
				[
					"match",
					[
						"get",
						"rank"
					],
					1,
					10,
					10
				],
				11,
				[
					"match",
					[
						"get",
						"rank"
					],
					1,
					16,
					16
				]
			],
			"text-field": "{name}",
			visibility: "visible",
			"text-max-width": 9,
			"text-transform": "uppercase",
			"text-allow-overlap": false
		},
		paint: {
			"text-color": "hsl(358, 0%, 49%)",
			"text-opacity": [
				"step",
				[
					"zoom"
				],
				0,
				3,
				[
					"match",
					[
						"get",
						"rank"
					],
					1,
					0.85,
					0
				],
				4,
				[
					"case",
					[
						"<=",
						[
							"get",
							"rank"
						],
						1
					],
					0.75,
					0
				],
				5,
				[
					"case",
					[
						"<=",
						[
							"get",
							"rank"
						],
						3
					],
					0.75,
					0
				],
				8,
				[
					"match",
					[
						"get",
						"rank"
					],
					4,
					0.75,
					0
				],
				11,
				0
			],
			"text-halo-color": "hsl(184, 0%, 2%)",
			"text-halo-width": 1
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"state"
			],
			[
				"==",
				"rank",
				1
			]
		]
	},
	{
		id: "city",
		type: "symbol",
		source: "maptiler_planet",
		"source-layer": "place",
		minzoom: 5,
		maxzoom: 14,
		layout: {
			"icon-size": 1,
			"text-font": [
				"Metropolis Semi Bold",
				"Noto Sans Bold"
			],
			"text-size": [
				"interpolate",
				[
					"linear",
					1
				],
				[
					"zoom"
				],
				5,
				[
					"case",
					[
						">=",
						[
							"get",
							"rank"
						],
						6
					],
					11,
					12
				],
				9,
				[
					"case",
					[
						">=",
						[
							"get",
							"rank"
						],
						6
					],
					12,
					14
				],
				13,
				[
					"case",
					[
						">=",
						[
							"get",
							"rank"
						],
						6
					],
					16,
					18
				],
				14,
				[
					"case",
					[
						">=",
						[
							"get",
							"rank"
						],
						6
					],
					20,
					22
				]
			],
			"icon-image": "",
			"text-field": "{name}",
			visibility: "visible",
			"text-anchor": "center",
			"text-offset": [
				0.2,
				0.2
			],
			"text-max-width": 10,
			"text-transform": "none",
			"text-keep-upright": false
		},
		paint: {
			"text-color": "hsl(358, 0%, 49%)",
			"text-halo-blur": 0,
			"text-halo-color": "hsl(154, 0%, 0%)",
			"text-halo-width": 0,
			"icon-translate-anchor": "map"
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"city"
			],
			[
				"has",
				"rank"
			]
		]
	},
	{
		id: "country",
		type: "symbol",
		source: "maptiler_planet",
		"source-layer": "place",
		minzoom: 2,
		maxzoom: 10,
		layout: {
			"text-font": [
				"Metropolis Semi Bold",
				"Noto Sans Bold"
			],
			"text-size": [
				"interpolate",
				[
					"linear",
					1
				],
				[
					"zoom"
				],
				2,
				[
					"case",
					[
						"<=",
						[
							"get",
							"rank"
						],
						2
					],
					11,
					0
				],
				3,
				[
					"case",
					[
						"<=",
						[
							"get",
							"rank"
						],
						2
					],
					11,
					9
				],
				4,
				[
					"case",
					[
						"<=",
						[
							"get",
							"rank"
						],
						2
					],
					12,
					10
				],
				5,
				[
					"case",
					[
						"<=",
						[
							"get",
							"rank"
						],
						2
					],
					13,
					11
				],
				6,
				[
					"case",
					[
						"<=",
						[
							"get",
							"rank"
						],
						2
					],
					14,
					12
				],
				7,
				[
					"case",
					[
						"<=",
						[
							"get",
							"rank"
						],
						2
					],
					14,
					13
				]
			],
			"text-field": "{name}",
			visibility: "visible",
			"text-transform": "uppercase"
		},
		paint: {
			"text-color": "hsl(358, 0%, 49%)",
			"text-opacity": [
				"step",
				[
					"zoom"
				],
				1,
				2,
				[
					"case",
					[
						"<=",
						[
							"get",
							"rank"
						],
						2
					],
					1,
					0
				],
				3,
				1
			],
			"text-halo-blur": 0,
			"text-halo-color": "hsl(154, 0%, 0%)",
			"text-halo-width": 0
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"country"
			],
			[
				"has",
				"iso_a2"
			]
		]
	},
	{
		id: "continent",
		type: "symbol",
		source: "maptiler_planet",
		"source-layer": "place",
		minzoom: 0,
		maxzoom: 2,
		layout: {
			"text-font": [
				"Metropolis Semi Bold",
				"Noto Sans Bold"
			],
			"text-size": 13,
			"text-field": "{name}",
			visibility: "visible",
			"text-justify": "center",
			"text-max-width": 9,
			"text-transform": "uppercase",
			"text-keep-upright": false,
			"text-letter-spacing": 0.1
		},
		paint: {
			"text-color": "hsl(358, 0%, 49%)",
			"text-halo-blur": 0,
			"text-halo-color": "hsl(154, 0%, 0%)",
			"text-halo-width": 0
		},
		filter: [
			"all",
			[
				"==",
				"class",
				"continent"
			]
		]
	}
];
var metadata = {
	"maptiler:copyright": "This style was generated on MapTiler Cloud. Usage outside of MapTiler Cloud or MapTiler Server requires valid MapTiler Data package: https://www.maptiler.com/data/ -- please contact us."
};
var glyphs = "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf";
var bearing = 0;
var pitch = 0;
var center = [
	6.819865920094799,
	16.696957491527186
];
var zoom = 1.1914447034606275;
var stageDarkCustomBuiltin = {
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

const mapStylePresetList = [
  {
    referenceStyleID: "STREETS",
    name: "Streets",
    description: "",
    variants: [
      {
        id: "streets-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      },
      {
        id: "streets-v2-dark",
        name: "Dark",
        variantType: "DARK",
        description: "",
        imageURL: ""
      },
      {
        id: "streets-v2-light",
        name: "Light",
        variantType: "LIGHT",
        description: "",
        imageURL: ""
      },
      {
        id: "streets-v2-pastel",
        name: "Pastel",
        variantType: "PASTEL",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "OUTDOOR",
    name: "Outdoor",
    description: "",
    variants: [
      {
        id: "outdoor-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "WINTER",
    name: "Winter",
    description: "",
    variants: [
      {
        id: "winter-v2",
        name: "Winter",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "SATELLITE",
    name: "Satellite",
    description: "",
    variants: [
      {
        id: "satellite",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "HYBRID",
    name: "Hybrid",
    description: "",
    variants: [
      {
        id: "hybrid",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "BASIC",
    name: "Basic",
    description: "",
    variants: [
      {
        id: "basic-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      },
      {
        id: "basic-v2-dark",
        name: "Dark",
        variantType: "DARK",
        description: "",
        imageURL: ""
      },
      {
        id: "basic-v2-light",
        name: "Light",
        variantType: "LIGHT",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "BRIGHT",
    name: "Bright",
    description: "",
    variants: [
      {
        id: "bright-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      },
      {
        id: "bright-v2-dark",
        name: "Dark",
        variantType: "DARK",
        description: "",
        imageURL: ""
      },
      {
        id: "bright-v2-light",
        name: "Light",
        variantType: "LIGHT",
        description: "",
        imageURL: ""
      },
      {
        id: "bright-v2-pastel",
        name: "Pastel",
        variantType: "PASTEL",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "OPENSTREETMAP",
    name: "OpenStreetMap",
    description: "",
    variants: [
      {
        id: "openstreetmap",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "TOPO",
    name: "Topo",
    description: "",
    variants: [
      {
        id: "topo-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      },
      {
        id: "topo-v2-shiny",
        name: "Shiny",
        variantType: "SHINY",
        description: "",
        imageURL: ""
      },
      {
        id: "topo-v2-pastel",
        name: "Pastel",
        variantType: "PASTEL",
        description: "",
        imageURL: ""
      },
      {
        id: "topo-v2-topographique",
        name: "Topographique",
        variantType: "TOPOGRAPHIQUE",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "VOYAGER",
    name: "Voyager",
    description: "",
    variants: [
      {
        id: "voyager-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      },
      {
        id: "voyager-v2-darkmatter",
        name: "Darkmatter",
        variantType: "DARK",
        description: "",
        imageURL: ""
      },
      {
        id: "voyager-v2-positron",
        name: "Positron",
        variantType: "LIGHT",
        description: "",
        imageURL: ""
      },
      {
        id: "voyager-v2-vintage",
        name: "Vintage",
        variantType: "VINTAGE",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "TONER",
    name: "Toner",
    description: "",
    variants: [
      {
        id: "toner-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      },
      {
        id: "toner-v2-background",
        name: "Background",
        variantType: "BACKGROUND",
        description: "",
        imageURL: ""
      },
      {
        id: "toner-v2-lite",
        name: "Lite",
        variantType: "LITE",
        description: "",
        imageURL: ""
      },
      {
        id: "toner-v2-lines",
        name: "Lines",
        variantType: "LINES",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "STAGE",
    name: "Stage",
    description: "",
    variants: [
      {
        id: "stage",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      },
      {
        id: "stage-dark",
        name: "Dark",
        variantType: "DARK",
        description: "",
        imageURL: ""
      },
      {
        id: "stage-light",
        name: "Light",
        variantType: "LIGHT",
        description: "",
        imageURL: ""
      }
    ]
  },
  {
    referenceStyleID: "OCEAN",
    name: "Ocean",
    description: "",
    variants: [
      {
        id: "ocean",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: ""
      }
    ]
  }
];

const builtInStyles = {
  satellite: satelliteBuiltin,
  "stage-dark-custom": stageDarkCustomBuiltin
};
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
function makeReferenceStyleProxy(referenceStyle) {
  return new Proxy(referenceStyle, {
    get(target, prop, receiver) {
      if (target.hasVariant(prop)) {
        return target.getVariant(prop);
      }
      if (prop.toString().toUpperCase() === prop) {
        return referenceStyle.getDefaultVariant();
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
class MapStyleVariant {
  constructor(name, variantType, id, referenceStyle, description, imageURL) {
    this.name = name;
    this.variantType = variantType;
    this.id = id;
    this.referenceStyle = referenceStyle;
    this.description = description;
    this.imageURL = imageURL;
  }
  getName() {
    return this.name;
  }
  getFullName() {
    return `${this.referenceStyle.getName()} ${this.name}`;
  }
  getType() {
    return this.variantType;
  }
  getUsableStyle() {
    if (this.id in builtInStyles) {
      return builtInStyles[this.id];
    }
    return expandMapStyle(this.id);
  }
  getId() {
    return this.id;
  }
  getDescription() {
    return this.description;
  }
  getReferenceStyle() {
    return this.referenceStyle;
  }
  hasVariant(variantType) {
    return this.referenceStyle.hasVariant(variantType);
  }
  getVariant(variantType) {
    return this.referenceStyle.getVariant(variantType);
  }
  getVariants() {
    return this.referenceStyle.getVariants().filter((v) => v !== this);
  }
  getImageURL() {
    return this.imageURL;
  }
}
class ReferenceMapStyle {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.variants = {};
    this.orderedVariants = [];
  }
  getName() {
    return this.name;
  }
  getId() {
    return this.id;
  }
  addVariant(v) {
    this.variants[v.getType()] = v;
    this.orderedVariants.push(v);
  }
  hasVariant(variantType) {
    return variantType in this.variants;
  }
  getVariant(variantType) {
    return variantType in this.variants ? this.variants[variantType] : this.orderedVariants[0];
  }
  getVariants() {
    return Object.values(this.variants);
  }
  getDefaultVariant() {
    return this.orderedVariants[0];
  }
}
function buildMapStyles() {
  const mapStyle = {};
  for (let i = 0; i < mapStylePresetList.length; i += 1) {
    const refStyleInfo = mapStylePresetList[i];
    const refStyle = makeReferenceStyleProxy(
      new ReferenceMapStyle(refStyleInfo.name, refStyleInfo.referenceStyleID)
    );
    for (let j = 0; j < refStyleInfo.variants.length; j += 1) {
      const variantInfo = refStyleInfo.variants[j];
      const variant = new MapStyleVariant(
        variantInfo.name,
        variantInfo.variantType,
        variantInfo.id,
        refStyle,
        variantInfo.description,
        variantInfo.imageURL
      );
      refStyle.addVariant(variant);
    }
    mapStyle[refStyleInfo.referenceStyleID] = refStyle;
  }
  return mapStyle;
}
const MapStyle = buildMapStyles();
function styleToStyle(style) {
  if (!style) {
    return MapStyle[mapStylePresetList[0].referenceStyleID].getDefaultVariant().getUsableStyle();
  }
  if (typeof style === "string" && style.toLowerCase() in builtInStyles) {
    return builtInStyles[style.toLowerCase()];
  }
  if (typeof style === "string" || style instanceof String) {
    return expandMapStyle(style);
  }
  if (style instanceof MapStyleVariant) {
    return style.getUsableStyle();
  }
  if (style instanceof ReferenceMapStyle) {
    return style.getDefaultVariant().getUsableStyle();
  }
  return style;
}

class TerrainControl$1 {
  constructor() {
    bindAll(["_toggleTerrain", "_updateTerrainIcon"], this);
  }
  onAdd(map) {
    this._map = map;
    this._container = DOMcreate("div", "maplibregl-ctrl maplibregl-ctrl-group");
    this._terrainButton = DOMcreate(
      "button",
      "maplibregl-ctrl-terrain",
      this._container
    );
    DOMcreate("span", "maplibregl-ctrl-icon", this._terrainButton).setAttribute(
      "aria-hidden",
      "true"
    );
    this._terrainButton.type = "button";
    this._terrainButton.addEventListener("click", this._toggleTerrain);
    this._updateTerrainIcon();
    this._map.on("terrain", this._updateTerrainIcon);
    return this._container;
  }
  onRemove() {
    DOMremove(this._container);
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

class MaptilerNavigationControl extends maplibregl__default.NavigationControl {
  constructor() {
    super({
      showCompass: true,
      showZoom: true,
      visualizePitch: true
    });
    this._compass.removeEventListener(
      "click",
      this._compass.clickFunction
    );
    this._compass.addEventListener("click", (e) => {
      {
        const currentPitch = this._map.getPitch();
        if (currentPitch === 0) {
          this._map.easeTo({ pitch: Math.min(this._map.getMaxPitch(), 80) });
        } else {
          if (this.options.visualizePitch) {
            this._map.resetNorthPitch({}, { originalEvent: e });
          } else {
            this._map.resetNorth({}, { originalEvent: e });
          }
        }
      }
    });
  }
  _createButton(className, fn) {
    const button = super._createButton(className, fn);
    button.clickFunction = fn;
    return button;
  }
  _rotateCompassArrow() {
    const rotate = this.options.visualizePitch ? `scale(${Math.min(
      1.5,
      1 / Math.pow(Math.cos(this._map.transform.pitch * (Math.PI / 180)), 0.5)
    )}) rotateX(${Math.min(70, this._map.transform.pitch)}deg) rotateZ(${this._map.transform.angle * (180 / Math.PI)}deg)` : `rotate(${this._map.transform.angle * (180 / Math.PI)}deg)`;
    this._compassIcon.style.transform = rotate;
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
const GeolocationType = {
  POINT: "POINT",
  COUNTRY: "COUNTRY"
};
class Map extends maplibregl__default.Map {
  constructor(options) {
    var _a;
    const style = styleToStyle(options.style);
    const hashPreConstructor = location.hash;
    if (!config.apiKey) {
      console.warn(
        "MapTiler Cloud API key is not set. Visit https://maptiler.com and try Cloud for free!"
      );
    }
    super(__spreadProps(__spreadValues({}, options), {
      style,
      maplibreLogo: false,
      transformRequest: (url) => {
        const reqUrl = new URL(url);
        if (reqUrl.host === defaults.maptilerApiHost) {
          if (!reqUrl.searchParams.has("key")) {
            reqUrl.searchParams.append("key", config.apiKey);
          }
          reqUrl.searchParams.append("mtsid", MAPTILER_SESSION_ID);
        }
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
    this.once("styledata", () => __async(this, null, function* () {
      if (options.geolocate === false) {
        return;
      }
      if (options.center) {
        return;
      }
      if (options.hash && !!hashPreConstructor) {
        return;
      }
      try {
        if (options.geolocate === GeolocationType.COUNTRY) {
          yield this.fitToIpBounds();
          return;
        }
      } catch (e) {
        console.warn(e.message);
      }
      let ipLocatedCameraHash = null;
      try {
        yield this.centerOnIpPoint(options.zoom);
        ipLocatedCameraHash = this.getCameraHash();
      } catch (e) {
        console.warn(e.message);
      }
      const locationResult = yield navigator.permissions.query({
        name: "geolocation"
      });
      if (locationResult.state === "granted") {
        navigator.geolocation.getCurrentPosition(
          (data) => {
            if (ipLocatedCameraHash !== this.getCameraHash()) {
              return;
            }
            this.easeTo({
              center: [data.coords.longitude, data.coords.latitude],
              zoom: options.zoom || 12,
              duration: 2e3
            });
          },
          null,
          {
            maximumAge: 24 * 3600 * 1e3,
            timeout: 5e3,
            enableHighAccuracy: false
          }
        );
      }
    }));
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
      let tileJsonContent = { logo: null };
      try {
        const possibleSources = Object.keys(this.style.sourceCaches).map((sourceName) => this.getSource(sourceName)).filter(
          (s) => typeof s.url === "string" && s.url.includes("tiles.json")
        );
        const styleUrl = new URL(
          possibleSources[0].url
        );
        if (!styleUrl.searchParams.has("key")) {
          styleUrl.searchParams.append("key", config.apiKey);
        }
        const tileJsonRes = yield fetch(styleUrl.href);
        tileJsonContent = yield tileJsonRes.json();
      } catch (e) {
      }
      if ("logo" in tileJsonContent && tileJsonContent.logo) {
        const logoURL = tileJsonContent.logo;
        this.addControl(
          new CustomLogoControl({ logoURL }),
          options.logoPosition
        );
        if (options.attributionControl === false) {
          this.addControl(new maplibregl__default.AttributionControl(options));
        }
      } else if (options.maptilerLogo) {
        this.addControl(new CustomLogoControl(), options.logoPosition);
      }
      if (options.scaleControl) {
        const position = options.scaleControl === true || options.scaleControl === void 0 ? "bottom-right" : options.scaleControl;
        const scaleControl = new maplibregl__default.ScaleControl({ unit: config.unit });
        this.addControl(scaleControl, position);
        config.on("unit", (unit) => {
          scaleControl.setUnit(unit);
        });
      }
      if (options.navigationControl !== false) {
        const position = options.navigationControl === true || options.navigationControl === void 0 ? "top-right" : options.navigationControl;
        this.addControl(new MaptilerNavigationControl(), position);
      }
      if (options.geolocateControl !== false) {
        const position = options.geolocateControl === true || options.geolocateControl === void 0 ? "top-right" : options.geolocateControl;
        this.addControl(
          new maplibregl__default.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 6e3
            },
            fitBoundsOptions: {
              maxZoom: 15
            },
            trackUserLocation: true,
            showAccuracyCircle: true,
            showUserLocation: true
          }),
          position
        );
      }
      if (options.terrainControl) {
        const position = options.terrainControl === true || options.terrainControl === void 0 ? "top-right" : options.terrainControl;
        this.addControl(new TerrainControl$1(), position);
      }
      if (options.fullscreenControl) {
        const position = options.fullscreenControl === true || options.fullscreenControl === void 0 ? "top-right" : options.fullscreenControl;
        this.addControl(new maplibregl__default.FullscreenControl({}), position);
      }
    }));
    if (options.terrain) {
      this.enableTerrain(
        (_a = options.terrainExaggeration) != null ? _a : this.terrainExaggeration
      );
    }
  }
  setStyle(style, options) {
    return super.setStyle(styleToStyle(style), options);
  }
  setLanguage(language = defaults.primaryLanguage) {
    if (language === Language.AUTO) {
      return this.setLanguage(getBrowserLanguage());
    }
    this.setPrimaryLanguage(language);
  }
  setPrimaryLanguage(language = defaults.primaryLanguage) {
    if (!isLanguageSupported(language)) {
      return;
    }
    this.onStyleReady(() => {
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
        } else if ((typeof textFieldLayoutProp === "string" || textFieldLayoutProp instanceof String) && (regexMatch = strMoreInfoRegex.exec(
          textFieldLayoutProp.toString()
        )) !== null) {
          const newProp = `${regexMatch[1]}{${langStr}}${regexMatch[5]}`;
          this.setLayoutProperty(layer.id, "text-field", newProp);
        }
      }
    });
  }
  setSecondaryLanguage(language = defaults.secondaryLanguage) {
    if (!isLanguageSupported(language)) {
      return;
    }
    this.onStyleReady(() => {
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
    });
  }
  getTerrainExaggeration() {
    return this.terrainExaggeration;
  }
  hasTerrain() {
    return this.isTerrainEnabled;
  }
  enableTerrain(exaggeration = this.terrainExaggeration) {
    if (exaggeration < 0) {
      console.warn("Terrain exaggeration cannot be negative.");
      return;
    }
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
  onStyleReady(cb) {
    if (this.isStyleLoaded()) {
      cb();
    } else {
      this.once("styledata", () => {
        cb();
      });
    }
  }
  fitToIpBounds() {
    return __async(this, null, function* () {
      const ipGeolocateResult = yield geolocation.info();
      this.fitBounds(
        ipGeolocateResult.country_bounds,
        {
          duration: 0,
          padding: 100
        }
      );
    });
  }
  centerOnIpPoint(zoom) {
    return __async(this, null, function* () {
      const ipGeolocateResult = yield geolocation.info();
      this.jumpTo({
        center: [ipGeolocateResult.longitude, ipGeolocateResult.latitude],
        zoom: zoom || 11
      });
    });
  }
  getCameraHash() {
    const hashBin = new Float32Array(5);
    const center = this.getCenter();
    hashBin[0] = center.lng;
    hashBin[1] = center.lat;
    hashBin[2] = this.getZoom();
    hashBin[3] = this.getPitch();
    hashBin[4] = this.getBearing();
    return Base64.fromUint8Array(new Uint8Array(hashBin.buffer));
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

const {
  supported,
  setRTLTextPlugin,
  getRTLTextPluginStatus,
  NavigationControl,
  GeolocateControl,
  AttributionControl,
  LogoControl,
  ScaleControl,
  FullscreenControl,
  TerrainControl,
  Popup,
  Marker,
  Style,
  LngLat,
  LngLatBounds,
  MercatorCoordinate,
  Evented,
  AJAXError,
  CanvasSource,
  GeoJSONSource,
  ImageSource,
  RasterDEMTileSource,
  RasterTileSource,
  VectorTileSource,
  VideoSource,
  prewarm,
  clearPrewarmedResources,
  version,
  workerCount,
  maxParallelImageRequests,
  clearStorage,
  workerUrl,
  addProtocol,
  removeProtocol
} = maplibregl__default;

export { AJAXError, AttributionControl, CanvasSource, Evented, FullscreenControl, GeoJSONSource, GeolocateControl, GeolocationType, ImageSource, Language, LngLat, LngLatBounds, LogoControl, Map, MapStyle, MapStyleVariant, Marker, MercatorCoordinate, NavigationControl, Point, Popup, RasterDEMTileSource, RasterTileSource, ReferenceMapStyle, ScaleControl, SdkConfig, Style, TerrainControl, VectorTileSource, VideoSource, addProtocol, clearPrewarmedResources, clearStorage, config, getRTLTextPluginStatus, maxParallelImageRequests, prewarm, removeProtocol, setRTLTextPlugin, supported, version, workerCount, workerUrl };
//# sourceMappingURL=maptiler-sdk.mjs.map
