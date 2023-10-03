import maplibregl from "maplibre-gl";
import { Base64 } from "js-base64";
import type {
  StyleSpecification,
  MapOptions as MapOptionsML,
  ControlPosition,
  StyleSwapOptions,
  StyleOptions,
  MapDataEvent,
  Tile,
  RasterDEMSourceSpecification,
  RequestTransformFunction,
  Source,
} from "maplibre-gl";
import { ReferenceMapStyle, MapStyleVariant } from "@maptiler/client";
import { config, MAPTILER_SESSION_ID, SdkConfig } from "./config";
import { defaults } from "./defaults";
import { MaptilerLogoControl } from "./MaptilerLogoControl";
import {
  combineTransformRequest,
  enableRTL,
  isUUID,
  jsonParseNoThrow,
} from "./tools";
import {
  getBrowserLanguage,
  isLanguageSupported,
  Language,
  LanguageString,
} from "./language";
import { styleToStyle } from "./mapstyle";
import { MaptilerTerrainControl } from "./MaptilerTerrainControl";
import { MaptilerNavigationControl } from "./MaptilerNavigationControl";
import { geolocation } from "@maptiler/client";
import { MaptilerGeolocateControl } from "./MaptilerGeolocateControl";
import { AttributionControl } from "./AttributionControl";
import { ScaleControl } from "./ScaleControl";
import { FullscreenControl } from "./FullscreenControl";
import {
  computeRampedOutlineWidth,
  generateRandomLayerName,
  generateRandomSourceName,
  getRandomColor,
  lineColorOptionsToLineLayerPaintSpec,
  rampedOptionsToLineLayerPaintSpec,
  lineWidthOptionsToLineLayerPaintSpec,
  PolylineLayerOptions,
  dashArrayMaker,
} from "./stylehelper";
import { gpx, gpxOrKml, kml } from "./converters";
import Minimap from "./Minimap";

import type { MinimapOptionsInput } from "./Minimap";
import type { Geometry, FeatureCollection, GeoJsonProperties } from "geojson";

export type LoadWithTerrainEvent = {
  type: "loadWithTerrain";
  target: Map;
  terrain: {
    source: string;
    exaggeration: number;
  };
};

export const GeolocationType: {
  POINT: "POINT";
  COUNTRY: "COUNTRY";
} = {
  POINT: "POINT",
  COUNTRY: "COUNTRY",
} as const;

type MapTerrainDataEvent = MapDataEvent & {
  isSourceLoaded: boolean;
  tile: Tile;
  sourceId: string;
  source: RasterDEMSourceSpecification;
};

/**
 * Options to provide to the `Map` constructor
 */
export type MapOptions = Omit<MapOptionsML, "style" | "maplibreLogo"> & {
  /**
   * Style of the map. Can be:
   * - a full style URL (possibly with API key)
   * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
   * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
   */
  style?: ReferenceMapStyle | MapStyleVariant | StyleSpecification | string;

  /**
   * Define the language of the map. This can be done directly with a language ISO code (eg. "en")
   * or with a built-in shorthand (eg. Language.ENGLISH).
   * Note that this is equivalent to setting the `config.primaryLanguage` and will overwrite it.
   */
  language?: LanguageString;

  /**
   * Define the MapTiler Cloud API key to be used. This is strictly equivalent to setting
   * `config.apiKey` and will overwrite it.
   */
  apiKey?: string;

  /**
   * Shows or hides the MapTiler logo in the bottom left corner.
   *
   * For paid plans:
   * - `true` shows MapTiler logo
   * - `false` hodes MapTiler logo
   * - default: `false` (hide)
   *
   * For free plans: MapTiler logo always shows, regardless of the value.
   */
  maptilerLogo?: boolean;

  /**
   * Enables 3D terrain if `true`. (default: `false`)
   */
  terrain?: boolean;

  /**
   * Exaggeration factor of the terrain. (default: `1`, no exaggeration)
   */
  terrainExaggeration?: number;

  /**
   * Show the navigation control. (default: `true`, will hide if `false`)
   */
  navigationControl?: boolean | ControlPosition;

  /**
   * Show the terrain control. (default: `false`, will show if `true`)
   */
  terrainControl?: boolean | ControlPosition;

  /**
   * Show the geolocate control. (default: `true`, will hide if `false`)
   */
  geolocateControl?: boolean | ControlPosition;

  /**
   * Show the scale control. (default: `false`, will show if `true`)
   */
  scaleControl?: boolean | ControlPosition;

  /**
   * Show the full screen control. (default: `false`, will show if `true`)
   */
  fullscreenControl?: boolean | ControlPosition;

  /**
   * Display a minimap in a user defined corner of the map. (default: `bottom-left` corner)
   * If set to true, the map will assume it is a minimap and forego the attribution control.
   */
  minimap?: boolean | ControlPosition | MinimapOptionsInput;

  /**
   * attributionControl
   */
  forceNoAttributionControl?: boolean;

  /**
   * Method to position the map at a given geolocation. Only if:
   * - `hash` is `false`
   * - `center` is not provided
   *
   * If the value is `true` of `"POINT"` (given by `GeolocationType.POINT`) then the positionning uses the MapTiler Cloud
   * Geolocation to find the non-GPS location point.
   * The zoom level can be provided in the `Map` constructor with the `zoom` option or will be `13` if not provided.
   *
   * If the value is `"COUNTRY"` (given by `GeolocationType.COUNTRY`) then the map is centered around the bounding box of the country.
   * In this case, the `zoom` option will be ignored.
   *
   * If the value is `false`, no geolocation is performed and the map centering and zooming depends on other options or on
   * the built-in defaults.
   *
   * If this option is non-false and the options `center` is also provided, then `center` prevails.
   *
   * Default: `false`
   */
  geolocate?: (typeof GeolocationType)[keyof typeof GeolocationType] | boolean;
};

/**
 * The Map class can be instanciated to display a map in a `<div>`
 */
export class Map extends maplibregl.Map {
  private isTerrainEnabled = false;
  private terrainExaggeration = 1;
  private primaryLanguage: LanguageString;
  private secondaryLanguage?: LanguageString;
  private terrainGrowing = false;
  private terrainFlattening = false;
  private minimap?: Minimap;

  constructor(options: MapOptions) {
    if (options.apiKey) {
      config.apiKey = options.apiKey;
    }

    const style = styleToStyle(options.style);
    const hashPreConstructor = location.hash;

    if (!config.apiKey) {
      console.warn(
        "MapTiler Cloud API key is not set. Visit https://maptiler.com and try Cloud for free!",
      );
    }

    // calling the map constructor with full length style
    super({
      ...options,
      style,
      maplibreLogo: false,
      transformRequest: combineTransformRequest(options.transformRequest),
    });

    this.primaryLanguage = options.language ?? config.primaryLanguage;
    this.secondaryLanguage = config.secondaryLanguage;
    this.terrainExaggeration =
      options.terrainExaggeration ?? this.terrainExaggeration;

    // Map centering and geolocation
    this.once("styledata", async () => {
      // Not using geolocation centering if...

      // the geolcoate option is not provided or is falsy
      if (!options.geolocate) {
        return;
      }

      // ... a center is provided in options
      if (options.center) {
        return;
      }

      // ... the hash option is enabled and a hash is present in the URL
      if (options.hash && !!hashPreConstructor) {
        return;
      }

      // If the geolocation is set to COUNTRY:
      try {
        if (options.geolocate === GeolocationType.COUNTRY) {
          await this.fitToIpBounds();
          return;
        }
      } catch (e) {
        // not raising
        console.warn((e as Error).message);
      }

      // As a fallback, we want to center the map on the visitor. First with IP geolocation...
      let ipLocatedCameraHash: string;
      try {
        await this.centerOnIpPoint(options.zoom);
        ipLocatedCameraHash = this.getCameraHash();
      } catch (e) {
        // not raising
        console.warn((e as Error).message);
      }

      // A more precise localization

      // This more advanced localization is commented out because the easeTo animation
      // triggers an error if the terrain grow is enabled (due to being nable to project the center while moving)

      // Then, the get a more precise location, we rely on the browser location, but only if it was already granted
      // before (we don't want to ask wih a popup at launch time)
      const locationResult = await navigator.permissions.query({
        name: "geolocation",
      });

      if (locationResult.state === "granted") {
        navigator.geolocation.getCurrentPosition(
          // success callback
          (data) => {
            // If the user has already moved since the ip location, then we no longer want to move the center
            if (ipLocatedCameraHash !== this.getCameraHash()) {
              return;
            }

            if (this.terrain) {
              this.easeTo({
                center: [data.coords.longitude, data.coords.latitude],
                zoom: options.zoom || 12,
                duration: 2000,
              });
            } else {
              this.once("terrain", () => {
                this.easeTo({
                  center: [data.coords.longitude, data.coords.latitude],
                  zoom: options.zoom || 12,
                  duration: 2000,
                });
              });
            }
          },

          // error callback
          null,

          // options
          {
            maximumAge: 24 * 3600 * 1000, // a day in millisec
            timeout: 5000, // milliseconds
            enableHighAccuracy: false,
          },
        );
      }
    });

    // If the config includes language changing, we must update the map language
    this.on("styledata", () => {
      this.setPrimaryLanguage(this.primaryLanguage);
      this.setSecondaryLanguage(this.secondaryLanguage);
    });

    // this even is in charge of reaplying the terrain elevation after the
    // style has changed because depending on the src/tgt style,
    // the style logic is not always able to resolve the application of terrain
    this.on("styledata", () => {
      // the styling resolver did no manage to reaply the terrain,
      // so let's reload it
      if (this.getTerrain() === null && this.isTerrainEnabled) {
        this.enableTerrain(this.terrainExaggeration);
      }
    });

    // load the Right-to-Left text plugin (will happen only once)
    this.once("load", async () => {
      enableRTL();
    });

    // Update logo and attibution
    this.once("load", async () => {
      let tileJsonContent = { logo: null };

      try {
        const possibleSources = Object.keys(this.style.sourceCaches)
          .map((sourceName) => this.getSource(sourceName))
          .filter(
            (s: Source | undefined) =>
              s &&
              "url" in s &&
              typeof s.url === "string" &&
              s?.url.includes("tiles.json"),
          );

        const styleUrl = new URL(
          (possibleSources[0] as maplibregl.VectorTileSource).url,
        );

        if (!styleUrl.searchParams.has("key")) {
          styleUrl.searchParams.append("key", config.apiKey);
        }

        const tileJsonRes = await fetch(styleUrl.href);
        tileJsonContent = await tileJsonRes.json();
      } catch (e) {
        // No tiles.json found (should not happen on maintained styles)
      }

      // The attribution and logo must show when required
      if (options.forceNoAttributionControl !== true) {
        if ("logo" in tileJsonContent && tileJsonContent.logo) {
          const logoURL: string = tileJsonContent.logo;

          this.addControl(
            new MaptilerLogoControl({ logoURL }),
            options.logoPosition,
          );

          // if attribution in option is `false` but the the logo shows up in the tileJson, then the attribution must show anyways
          if (options.attributionControl === false) {
            this.addControl(
              new AttributionControl({
                customAttribution: options.customAttribution,
              }),
            );
          }
        } else if (options.maptilerLogo) {
          this.addControl(new MaptilerLogoControl(), options.logoPosition);
        }
      }

      // the other controls at init time but be after
      // (due to the async nature of logo control)

      // By default, no scale control
      if (options.scaleControl) {
        // default position, if not provided, is top left corner
        const position = (
          options.scaleControl === true || options.scaleControl === undefined
            ? "bottom-right"
            : options.scaleControl
        ) as ControlPosition;

        const scaleControl = new ScaleControl({ unit: config.unit });
        this.addControl(scaleControl, position);
        config.on("unit", (unit) => {
          scaleControl.setUnit(unit);
        });
      }

      if (options.navigationControl !== false) {
        // default position, if not provided, is top left corner
        const position = (
          options.navigationControl === true ||
          options.navigationControl === undefined
            ? "top-right"
            : options.navigationControl
        ) as ControlPosition;
        this.addControl(new MaptilerNavigationControl(), position);
      }

      if (options.geolocateControl !== false) {
        // default position, if not provided, is top left corner
        const position = (
          options.geolocateControl === true ||
          options.geolocateControl === undefined
            ? "top-right"
            : options.geolocateControl
        ) as ControlPosition;

        this.addControl(
          // new maplibregl.GeolocateControl({
          new MaptilerGeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 6000 /* 6 sec */,
            },
            fitBoundsOptions: {
              maxZoom: 15,
            },
            trackUserLocation: true,
            showAccuracyCircle: true,
            showUserLocation: true,
          }),
          position,
        );
      }

      if (options.terrainControl) {
        // default position, if not provided, is top left corner
        const position = (
          options.terrainControl === true ||
          options.terrainControl === undefined
            ? "top-right"
            : options.terrainControl
        ) as ControlPosition;
        this.addControl(new MaptilerTerrainControl(), position);
      }

      // By default, no fullscreen control
      if (options.fullscreenControl) {
        // default position, if not provided, is top left corner
        const position = (
          options.fullscreenControl === true ||
          options.fullscreenControl === undefined
            ? "top-right"
            : options.fullscreenControl
        ) as ControlPosition;

        this.addControl(new FullscreenControl({}), position);
      }
    });

    // Creating a custom event: "loadWithTerrain"
    // that fires only once when both:
    // - the map has full loaded (corresponds to the the "load" event)
    // - the terrain has loaded (corresponds to the "terrain" event with terrain beion non-null)
    // This custom event is necessary to wait for when the map is instanciated with `terrain: true`
    // and some animation (flyTo, easeTo) are running from the begining.
    let loadEventTriggered = false;
    let terrainEventTriggered = false;
    let terrainEventData: LoadWithTerrainEvent;

    this.once("load", () => {
      loadEventTriggered = true;
      if (terrainEventTriggered) {
        this.fire("loadWithTerrain", terrainEventData);
      }
    });

    this.once("style.load", () => {
      if (typeof options.minimap === "object") {
        this.minimap = new Minimap(options.minimap, options);
        this.addControl(
          this.minimap,
          options.minimap.position ?? "bottom-left",
        );
      } else if (options.minimap === true) {
        this.minimap = new Minimap({}, options);
        this.addControl(this.minimap, "bottom-left");
      } else if (options.minimap !== undefined && options.minimap !== false) {
        this.minimap = new Minimap({}, options);
        this.addControl(this.minimap, options.minimap);
      }
    });

    const terrainCallback = (evt: LoadWithTerrainEvent) => {
      if (!evt.terrain) return;
      terrainEventTriggered = true;
      terrainEventData = {
        type: "loadWithTerrain",
        target: this,
        terrain: evt.terrain,
      };
      this.off("terrain", terrainCallback);

      if (loadEventTriggered) {
        this.fire("loadWithTerrain", terrainEventData as LoadWithTerrainEvent);
      }
    };

    this.on("terrain", terrainCallback);

    // enable 3D terrain if provided in options
    if (options.terrain) {
      this.enableTerrain(
        options.terrainExaggeration ?? this.terrainExaggeration,
      );
    }
  }

  /**
   * Awaits for _this_ Map instance to be "loaded" and returns a Promise to the Map.
   * If _this_ Map instance is already loaded, the Promise is resolved directly,
   * otherwise, it is resolved as a result of the "load" event.
   * @returns
   */
  async onLoadAsync() {
    return new Promise<Map>((resolve) => {
      if (this.loaded()) {
        return resolve(this);
      }

      this.once("load", () => {
        resolve(this);
      });
    });
  }

  /**
   * Awaits for _this_ Map instance to be "loaded" as well as with terrain being non-null for the first time
   * and returns a Promise to the Map.
   * If _this_ Map instance is already loaded with terrain, the Promise is resolved directly,
   * otherwise, it is resolved as a result of the "loadWithTerrain" event.
   * @returns
   */
  async onLoadWithTerrainAsync() {
    return new Promise<Map>((resolve) => {
      if (this.loaded() && this.terrain) {
        return resolve(this);
      }

      this.once("loadWithTerrain", () => {
        resolve(this);
      });
    });
  }

  /**
   * Update the style of the map.
   * Can be:
   * - a full style URL (possibly with API key)
   * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
   * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
   */
  override setStyle(
    style:
      | null
      | ReferenceMapStyle
      | MapStyleVariant
      | StyleSpecification
      | string,
    options?: StyleSwapOptions & StyleOptions,
  ): this {
    this.minimap?.setStyle(style);
    return super.setStyle(styleToStyle(style), options);
  }

  /**
   * Define the primary language of the map. Note that not all the languages shorthands provided are available.
   * This function is a short for `.setPrimaryLanguage()`
   */
  setLanguage(language: LanguageString = defaults.primaryLanguage): void {
    if (language === Language.AUTO) {
      return this.setLanguage(getBrowserLanguage());
    }
    this.setPrimaryLanguage(language);
  }

  /**
   * Define the primary language of the map. Note that not all the languages shorthands provided are available.
   */
  setPrimaryLanguage(language: LanguageString = defaults.primaryLanguage) {
    if (this.primaryLanguage === Language.STYLE_LOCK) {
      console.warn(
        "The language cannot be changed because this map has been instantiated with the STYLE_LOCK language flag.",
      );
      return;
    }

    if (!isLanguageSupported(language as string)) {
      return;
    }

    this.primaryLanguage = language;

    this.onStyleReady(() => {
      if (language === Language.AUTO) {
        return this.setPrimaryLanguage(getBrowserLanguage());
      }

      const layers = this.getStyle().layers;

      // detects pattern like "{name:somelanguage}" with loose spacing
      const strLanguageRegex = /^\s*{\s*name\s*(:\s*(\S*))?\s*}$/;

      // detects pattern like "name:somelanguage" with loose spacing
      const strLanguageInArrayRegex = /^\s*name\s*(:\s*(\S*))?\s*$/;

      // for string based bilingual lang such as "{name:latin}  {name:nonlatin}" or "{name:latin}  {name}"
      const strBilingualRegex =
        /^\s*{\s*name\s*(:\s*(\S*))?\s*}(\s*){\s*name\s*(:\s*(\S*))?\s*}$/;

      // Regex to capture when there are more info, such as mountains elevation with unit m/ft
      const strMoreInfoRegex = /^(.*)({\s*name\s*(:\s*(\S*))?\s*})(.*)$/;

      const langStr = language ? `name:${language}` : "name"; // to handle local lang
      const replacer = [
        "case",
        ["has", langStr],
        ["get", langStr],
        ["get", "name"],
      ];

      for (let i = 0; i < layers.length; i += 1) {
        const layer = layers[i];
        const layout = layer.layout;

        if (!layout) {
          continue;
        }

        if (!("text-field" in layout)) {
          continue;
        }

        const textFieldLayoutProp = this.getLayoutProperty(
          layer.id,
          "text-field",
        );

        // Note:
        // The value of the 'text-field' property can take multiple shape;
        // 1. can be an array with 'concat' on its first element (most likely means bilingual)
        // 2. can be an array with 'get' on its first element (monolingual)
        // 3. can be a string of shape '{name:latin}'
        // 4. can be a string referencing another prop such as '{housenumber}' or '{ref}'
        //
        // The case 1, 2 and 3 will be updated while maintaining their original type and shape.
        // The case 3 will not be updated

        let regexMatch;

        // This is case 1
        if (
          Array.isArray(textFieldLayoutProp) &&
          textFieldLayoutProp.length >= 2 &&
          textFieldLayoutProp[0].trim().toLowerCase() === "concat"
        ) {
          const newProp = textFieldLayoutProp.slice(); // newProp is Array
          // The style could possibly have defined more than 2 concatenated language strings but we only want to edit the first
          // The style could also define that there are more things being concatenated and not only languages

          for (let j = 0; j < textFieldLayoutProp.length; j += 1) {
            const elem = textFieldLayoutProp[j];

            // we are looking for an elem of shape '{name:somelangage}' (string) of `["get", "name:somelanguage"]` (array)

            // the entry of of shape '{name:somelangage}', possibly with loose spacing
            if (
              (typeof elem === "string" || elem instanceof String) &&
              strLanguageRegex.exec(elem.toString())
            ) {
              newProp[j] = replacer;
              break; // we just want to update the primary language
            }
            // the entry is of an array of shape `["get", "name:somelanguage"]`
            else if (
              Array.isArray(elem) &&
              elem.length >= 2 &&
              elem[0].trim().toLowerCase() === "get" &&
              strLanguageInArrayRegex.exec(elem[1].toString())
            ) {
              newProp[j] = replacer;
              break; // we just want to update the primary language
            } else if (
              Array.isArray(elem) &&
              elem.length === 4 &&
              elem[0].trim().toLowerCase() === "case"
            ) {
              newProp[j] = replacer;
              break; // we just want to update the primary language
            }
          }

          this.setLayoutProperty(layer.id, "text-field", newProp);
        }

        // This is case 2
        else if (
          Array.isArray(textFieldLayoutProp) &&
          textFieldLayoutProp.length >= 2 &&
          textFieldLayoutProp[0].trim().toLowerCase() === "get" &&
          strLanguageInArrayRegex.exec(textFieldLayoutProp[1].toString())
        ) {
          const newProp = replacer;
          this.setLayoutProperty(layer.id, "text-field", newProp);
        }

        // This is case 3
        else if (
          (typeof textFieldLayoutProp === "string" ||
            textFieldLayoutProp instanceof String) &&
          strLanguageRegex.exec(textFieldLayoutProp.toString())
        ) {
          const newProp = replacer;
          this.setLayoutProperty(layer.id, "text-field", newProp);
        } else if (
          Array.isArray(textFieldLayoutProp) &&
          textFieldLayoutProp.length === 4 &&
          textFieldLayoutProp[0].trim().toLowerCase() === "case"
        ) {
          const newProp = replacer;
          this.setLayoutProperty(layer.id, "text-field", newProp);
        } else if (
          (typeof textFieldLayoutProp === "string" ||
            textFieldLayoutProp instanceof String) &&
          (regexMatch = strBilingualRegex.exec(
            textFieldLayoutProp.toString(),
          )) !== null
        ) {
          const newProp = `{${langStr}}${regexMatch[3]}{name${
            regexMatch[4] || ""
          }}`;
          this.setLayoutProperty(layer.id, "text-field", newProp);
        } else if (
          (typeof textFieldLayoutProp === "string" ||
            textFieldLayoutProp instanceof String) &&
          (regexMatch = strMoreInfoRegex.exec(
            textFieldLayoutProp.toString(),
          )) !== null
        ) {
          const newProp = `${regexMatch[1]}{${langStr}}${regexMatch[5]}`;
          this.setLayoutProperty(layer.id, "text-field", newProp);
        }
      }
    });
  }

  /**
   * Define the secondary language of the map. Note that this is not supported by all the map styles
   * Note that most styles do not allow a secondary language and this function only works if the style allows (no force adding)
   */
  setSecondaryLanguage(language: LanguageString = defaults.secondaryLanguage) {
    // Using the lock flag as a primaty language also applies to the secondary
    if (this.primaryLanguage === Language.STYLE_LOCK) {
      console.warn(
        "The language cannot be changed because this map has been instantiated with the STYLE_LOCK language flag.",
      );
      return;
    }

    if (!isLanguageSupported(language as string)) {
      return;
    }

    this.secondaryLanguage = language;

    this.onStyleReady(() => {
      if (language === Language.AUTO) {
        return this.setSecondaryLanguage(getBrowserLanguage());
      }

      const layers = this.getStyle().layers;

      // detects pattern like "{name:somelanguage}" with loose spacing
      const strLanguageRegex = /^\s*{\s*name\s*(:\s*(\S*))?\s*}$/;

      // detects pattern like "name:somelanguage" with loose spacing
      const strLanguageInArrayRegex = /^\s*name\s*(:\s*(\S*))?\s*$/;

      // for string based bilingual lang such as "{name:latin}  {name:nonlatin}" or "{name:latin}  {name}"
      const strBilingualRegex =
        /^\s*{\s*name\s*(:\s*(\S*))?\s*}(\s*){\s*name\s*(:\s*(\S*))?\s*}$/;

      let regexMatch;

      for (let i = 0; i < layers.length; i += 1) {
        const layer = layers[i];
        const layout = layer.layout;

        if (!layout) {
          continue;
        }

        if (!("text-field" in layout)) {
          continue;
        }

        const textFieldLayoutProp = this.getLayoutProperty(
          layer.id,
          "text-field",
        );

        let newProp;

        // Note:
        // The value of the 'text-field' property can take multiple shape;
        // 1. can be an array with 'concat' on its first element (most likely means bilingual)
        // 2. can be an array with 'get' on its first element (monolingual)
        // 3. can be a string of shape '{name:latin}'
        // 4. can be a string referencing another prop such as '{housenumber}' or '{ref}'
        //
        // Only the case 1 will be updated because we don't want to change the styling (read: add a secondary language where the original styling is only displaying 1)

        // This is case 1
        if (
          Array.isArray(textFieldLayoutProp) &&
          textFieldLayoutProp.length >= 2 &&
          textFieldLayoutProp[0].trim().toLowerCase() === "concat"
        ) {
          newProp = textFieldLayoutProp.slice(); // newProp is Array
          // The style could possibly have defined more than 2 concatenated language strings but we only want to edit the first
          // The style could also define that there are more things being concatenated and not only languages

          let languagesAlreadyFound = 0;

          for (let j = 0; j < textFieldLayoutProp.length; j += 1) {
            const elem = textFieldLayoutProp[j];

            // we are looking for an elem of shape '{name:somelangage}' (string) of `["get", "name:somelanguage"]` (array)

            // the entry of of shape '{name:somelangage}', possibly with loose spacing
            if (
              (typeof elem === "string" || elem instanceof String) &&
              strLanguageRegex.exec(elem.toString())
            ) {
              if (languagesAlreadyFound === 1) {
                newProp[j] = `{name:${language}}`;
                break; // we just want to update the secondary language
              }

              languagesAlreadyFound += 1;
            }
            // the entry is of an array of shape `["get", "name:somelanguage"]`
            else if (
              Array.isArray(elem) &&
              elem.length >= 2 &&
              elem[0].trim().toLowerCase() === "get" &&
              strLanguageInArrayRegex.exec(elem[1].toString())
            ) {
              if (languagesAlreadyFound === 1) {
                newProp[j][1] = `name:${language}`;
                break; // we just want to update the secondary language
              }

              languagesAlreadyFound += 1;
            } else if (
              Array.isArray(elem) &&
              elem.length === 4 &&
              elem[0].trim().toLowerCase() === "case"
            ) {
              if (languagesAlreadyFound === 1) {
                newProp[j] = ["get", `name:${language}`]; // the situation with 'case' is supposed to only happen with the primary lang
                break; // but in case a styling also does that for secondary...
              }

              languagesAlreadyFound += 1;
            }
          }

          this.setLayoutProperty(layer.id, "text-field", newProp);
        }

        // the language (both first and second) are defined into a single string model
        else if (
          (typeof textFieldLayoutProp === "string" ||
            textFieldLayoutProp instanceof String) &&
          (regexMatch = strBilingualRegex.exec(
            textFieldLayoutProp.toString(),
          )) !== null
        ) {
          const langStr = language ? `name:${language}` : "name"; // to handle local lang
          newProp = `{name${regexMatch[1] || ""}}${regexMatch[3]}{${langStr}}`;
          this.setLayoutProperty(layer.id, "text-field", newProp);
        }
      }
    });
  }

  /**
   * Get the primary language
   * @returns
   */
  getPrimaryLanguage(): LanguageString {
    return this.primaryLanguage;
  }

  /**
   * Get the secondary language
   * @returns
   */
  getSecondaryLanguage(): LanguageString | undefined {
    return this.secondaryLanguage;
  }

  /**
   * Get the exaggeration factor applied to the terrain
   * @returns
   */
  getTerrainExaggeration(): number {
    return this.terrainExaggeration;
  }

  /**
   * Know if terrian is enabled or not
   * @returns
   */
  hasTerrain(): boolean {
    return this.isTerrainEnabled;
  }

  private growTerrain(exaggeration: number, durationMs = 1000) {
    // This method assumes the terrain is already built
    if (!this.terrain) {
      return;
    }

    const startTime = performance.now();
    // This is supposedly 0, but it could be something else (e.g. already in the middle of growing, or user defined other)
    const currentExaggeration = this.terrain.exaggeration;
    const deltaExaggeration = exaggeration - currentExaggeration;

    // This is again called in a requestAnimationFrame ~loop, until the terrain has grown enough
    // that it has reached the target
    const updateExaggeration = () => {
      if (!this.terrain) {
        return;
      }

      // If the flattening animation is triggered while the growing animation
      // is running, then the flattening animation is stopped
      if (this.terrainFlattening) {
        return;
      }

      // normalized value in interval [0, 1] of where we are currently in the animation loop
      const positionInLoop = (performance.now() - startTime) / durationMs;

      // The animation goes on until we reached 99% of the growing sequence duration
      if (positionInLoop < 0.99) {
        const exaggerationFactor = 1 - Math.pow(1 - positionInLoop, 4);
        const newExaggeration =
          currentExaggeration + exaggerationFactor * deltaExaggeration;
        this.terrain.exaggeration = newExaggeration;
        requestAnimationFrame(updateExaggeration);
      } else {
        this.terrainGrowing = false;
        this.terrainFlattening = false;
        this.terrain.exaggeration = exaggeration;
      }

      this.triggerRepaint();
    };

    this.terrainGrowing = true;
    this.terrainFlattening = false;
    requestAnimationFrame(updateExaggeration);
  }

  /**
   * Enables the 3D terrain visualization
   */
  enableTerrain(exaggeration = this.terrainExaggeration) {
    if (exaggeration < 0) {
      console.warn("Terrain exaggeration cannot be negative.");
      return;
    }

    // This function is mapped to a map "data" event. It checks that the terrain
    // tiles are loaded and when so, it starts an animation to make the terrain grow
    const dataEventTerrainGrow = async (evt: MapTerrainDataEvent) => {
      if (!this.terrain) {
        return;
      }

      if (
        evt.type !== "data" ||
        evt.dataType !== "source" ||
        !("source" in evt)
      ) {
        return;
      }

      if (evt.sourceId !== "maptiler-terrain") {
        return;
      }

      const source = evt.source;

      if (source.type !== "raster-dem") {
        return;
      }

      if (!evt.isSourceLoaded) {
        return;
      }

      // We shut this event off because we want it to happen only once.
      // Yet, we cannot use the "once" method because only the last event of the series
      // has `isSourceLoaded` true
      this.off("data", dataEventTerrainGrow);

      this.growTerrain(exaggeration);
    };

    // This is put into a function so that it can be called regardless
    // of the loading state of _this_ the map instance
    const addTerrain = () => {
      // When style is changed,
      this.isTerrainEnabled = true;
      this.terrainExaggeration = exaggeration;

      // Mapping it to the "data" event so that we can check that the terrain
      // growing starts only when terrain tiles are loaded (to reduce glitching)
      this.on("data", dataEventTerrainGrow);

      this.addSource(defaults.terrainSourceId, {
        type: "raster-dem",
        url: defaults.terrainSourceURL,
      });

      // Setting up the terrain with a 0 exaggeration factor
      // so it loads ~seamlessly and then can grow from there
      this.setTerrain({
        source: defaults.terrainSourceId,
        exaggeration: 0,
      });
    };

    // The terrain has already been loaded,
    // we just update the exaggeration.
    if (this.getTerrain()) {
      this.isTerrainEnabled = true;
      this.growTerrain(exaggeration);
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

  /**
   * Disable the 3D terrain visualization
   */
  disableTerrain() {
    // It could be disabled already
    if (!this.terrain) {
      return;
    }

    this.isTerrainEnabled = false;
    // this.stopFlattening = false;

    // Duration of the animation in millisec
    const animationLoopDuration = 1 * 1000;
    const startTime = performance.now();
    // This is supposedly 0, but it could be something else (e.g. already in the middle of growing, or user defined other)
    const currentExaggeration = this.terrain.exaggeration;

    // This is again called in a requestAnimationFrame ~loop, until the terrain has grown enough
    // that it has reached the target
    const updateExaggeration = () => {
      if (!this.terrain) {
        return;
      }

      // If the growing animation is triggered while flattening,
      // then we exist the flatening
      if (this.terrainGrowing) {
        return;
      }

      // normalized value in interval [0, 1] of where we are currently in the animation loop
      const positionInLoop =
        (performance.now() - startTime) / animationLoopDuration;

      // The animation goes on until we reached 99% of the growing sequence duration
      if (positionInLoop < 0.99) {
        const exaggerationFactor = Math.pow(1 - positionInLoop, 4);
        const newExaggeration = currentExaggeration * exaggerationFactor;
        this.terrain.exaggeration = newExaggeration;
        requestAnimationFrame(updateExaggeration);
      } else {
        this.terrain.exaggeration = 0;
        this.terrainGrowing = false;
        this.terrainFlattening = false;
        // @ts-expect-error - https://github.com/maplibre/maplibre-gl-js/issues/2992
        this.setTerrain();
        if (this.getSource(defaults.terrainSourceId)) {
          this.removeSource(defaults.terrainSourceId);
        }
      }

      this.triggerRepaint();
    };

    this.terrainGrowing = false;
    this.terrainFlattening = true;
    requestAnimationFrame(updateExaggeration);
  }

  /**
   * Sets the 3D terrain exageration factor.
   * If the terrain was not enabled prior to the call of this method,
   * the method `.enableTerrain()` will be called.
   * If `animate` is `true`, the terrain transformation will be animated in the span of 1 second.
   * If `animate` is `false`, no animated transition to the newly defined exaggeration.
   */
  setTerrainExaggeration(exaggeration: number, animate = true) {
    if (!animate && this.terrain) {
      this.terrainExaggeration = exaggeration;
      this.terrain.exaggeration = exaggeration;
      this.triggerRepaint();
    } else {
      this.enableTerrain(exaggeration);
    }
  }

  /**
   * Perform an action when the style is ready. It could be at the moment of calling this method
   * or later.
   */
  private onStyleReady(cb: () => void) {
    if (this.isStyleLoaded()) {
      cb();
    } else {
      this.once("styledata", () => {
        cb();
      });
    }
  }

  async fitToIpBounds() {
    const ipGeolocateResult = await geolocation.info();
    this.fitBounds(
      ipGeolocateResult.country_bounds as [number, number, number, number],
      {
        duration: 0,
        padding: 100,
      },
    );
  }

  async centerOnIpPoint(zoom: number | undefined) {
    const ipGeolocateResult = await geolocation.info();
    this.jumpTo({
      center: [
        ipGeolocateResult?.longitude ?? 0,
        ipGeolocateResult?.latitude ?? 0,
      ],
      zoom: zoom || 11,
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

  /**
   * Get the SDK config object.
   * This is convenient to dispatch the SDK configuration to externally built layers
   * that do not directly have access to the SDK configuration but do have access to a Map instance.
   */
  getSdkConfig(): SdkConfig {
    return config;
  }

  /**
   * Get the MapTiler session ID. Convenient to dispatch to externaly built component
   * that do not directly have access to the SDK configuration but do have access to a Map instance.
   * @returns
   */
  getMaptilerSessionId(): string {
    return MAPTILER_SESSION_ID;
  }

  /**
   *  Updates the requestManager's transform request with a new function.
   *
   * @param transformRequest A callback run before the Map makes a request for an external URL. The callback can be used to modify the url, set headers, or set the credentials property for cross-origin requests.
   *    Expected to return an object with a `url` property and optionally `headers` and `credentials` properties
   *
   * @returns {Map} `this`
   *
   *  @example
   *  map.setTransformRequest((url: string, resourceType: string) => {});
   */
  override setTransformRequest(
    transformRequest: RequestTransformFunction,
  ): this {
    super.setTransformRequest(combineTransformRequest(transformRequest));
    return this;
  }

  /**
   * Add a polyline to the map from various sources and with builtin styling.
   * Compatible sources:
   * - gpx content as string
   * - gpx file from URL
   * - kml content from string
   * - kml from url
   * - geojson from url
   * - geojson content as string
   * - geojson content as JS object
   * - uuid of a MapTiler Cloud dataset
   *
   * The method also gives the possibility to add an outline layer (if `options.outline` is `true`)
   * and if so , the returned property `polylineOutlineLayerId` will be a string. As a result, two layers
   * would be added.
   *
   * The default styling creates a line layer of constant width of 3px, the color will be randomly picked
   * from a curated list of colors and the opacity will be 1.
   * If the outline is enabled, the outline width is of 1px at all zoom levels, the color is white and
   * the opacity is 1.
   *
   * Those style properties can be changed and ramped according to zoom level using an easier syntax.
   *
   */
  async addPolyline(
    options: PolylineLayerOptions,
    fetchOptions: RequestInit = {},
  ): Promise<{
    polylineLayerId: string;
    polylineOutlineLayerId: string;
    polylineSourceId: string;
  }> {
    // We need to have the sourceId of the sourceData
    if (!options.sourceId && !options.data) {
      throw new Error(
        "Creating a polyline layer requires an existing .sourceId or a valid .data property",
      );
    }

    // We are going to evaluate the content of .data, if provided
    let data = options.data;

    if (typeof data === "string") {
      // if options.data exists and is a uuid string, we consider that it points to a MapTiler Dataset
      if (isUUID(data)) {
        data = `https://api.maptiler.com/data/${options.data}/features.json?key=${config.apiKey}`;
      }

      // options.data could be a url to a .gpx file
      else if (data.split(".").pop()?.toLowerCase().trim() === "gpx") {
        // fetch the file
        const res = await fetch(data, fetchOptions);
        const gpxStr = await res.text();
        // Convert it to geojson. Will throw is invalid GPX content
        data = gpx(gpxStr);
      }

      // options.data could be a url to a .kml file
      else if (data.split(".").pop()?.toLowerCase().trim() === "kml") {
        // fetch the file
        const res = await fetch(data, fetchOptions);
        const kmlStr = await res.text();
        // Convert it to geojson. Will throw is invalid GPX content
        data = kml(kmlStr);
      } else {
        // From this point, we consider that the string content provided could
        // be the string content of one of the compatible format (GeoJSON, KML, GPX)
        const tmpData =
          jsonParseNoThrow<FeatureCollection<Geometry, GeoJsonProperties>>(
            data,
          ) ?? gpxOrKml(data);
        if (tmpData) data = tmpData;
      }

      if (!data) {
        throw new Error(
          "Polyline data was provided as string but is incompatible with valid formats.",
        );
      }
    }

    // Data was provided as a non-string but it's not a valid GeoJSON either => throw
    // else if (data && !geojsonValidation.valid(data)) {
    // else if (data && !isValidGeoJSON(data)) {

    //   throw new Error(
    //     "Polyline data was provided as an object but object is not of a valid GeoJSON format",
    //   );
    // }

    return this.addGeoJSONPolyline({
      ...options,
      data,
    });
  }

  /**
   * Add a polyline witgh optional outline from a GeoJSON object
   */
  private addGeoJSONPolyline(
    // this Feature collection is expected to contain on LineStrings and MultilLinestrings
    options: PolylineLayerOptions,
  ): {
    polylineLayerId: string;
    polylineOutlineLayerId: string;
    polylineSourceId: string;
  } {
    if (options.layerId && this.getLayer(options.layerId)) {
      throw new Error(
        `A layer already exists with the layer id: ${options.layerId}`,
      );
    }

    const sourceId = options.sourceId ?? generateRandomSourceName();
    const layerId = options.layerId ?? generateRandomLayerName();

    const retunedInfo = {
      polylineLayerId: layerId,
      polylineOutlineLayerId: "",
      polylineSourceId: sourceId,
    };

    // A new source is added if the map does not have this sourceId and the data is provided
    if (options.data && !this.getSource(sourceId)) {
      // Adding the source
      this.addSource(sourceId, {
        type: "geojson",
        data: options.data,
      });
    }

    const lineWidth = options.lineWidth ?? 3;
    const lineColor = options.lineColor ?? getRandomColor();
    const lineOpacity = options.lineOpacity ?? 1;
    const lineBlur = options.lineBlur ?? 0;
    const lineGapWidth = options.lineGapWidth ?? 0;
    let lineDashArray = options.lineDashArray ?? null;
    const outlineWidth = options.outlineWidth ?? 1;
    const outlineColor = options.outlineColor ?? "#FFFFFF";
    const outlineOpacity = options.outlineOpacity ?? 1;
    const outlineBlur = options.outlineBlur ?? 0;

    if (typeof lineDashArray === "string") {
      lineDashArray = dashArrayMaker(lineDashArray);
    }

    // We want to create an outline for this line layer
    if (options.outline === true) {
      const outlineLayerId = `${layerId}_outline`;
      retunedInfo.polylineOutlineLayerId = outlineLayerId;

      this.addLayer(
        {
          id: outlineLayerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": options.lineJoin ?? "round",
            "line-cap": options.lineCap ?? "round",
          },
          minzoom: options.minzoom ?? 0,
          maxzoom: options.maxzoom ?? 23,
          paint: {
            "line-opacity":
              typeof outlineOpacity === "number"
                ? outlineOpacity
                : rampedOptionsToLineLayerPaintSpec(outlineOpacity),
            "line-color":
              typeof outlineColor === "string"
                ? outlineColor
                : lineColorOptionsToLineLayerPaintSpec(outlineColor),
            "line-width": computeRampedOutlineWidth(lineWidth, outlineWidth),
            "line-blur":
              typeof outlineBlur === "number"
                ? outlineBlur
                : rampedOptionsToLineLayerPaintSpec(outlineBlur),
          },
        },
        options.beforeId,
      );
    }

    this.addLayer(
      {
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": options.lineJoin ?? "round",
          "line-cap": options.lineCap ?? "round",
        },
        minzoom: options.minzoom ?? 0,
        maxzoom: options.maxzoom ?? 23,
        paint: {
          "line-opacity":
            typeof lineOpacity === "number"
              ? lineOpacity
              : rampedOptionsToLineLayerPaintSpec(lineOpacity),
          "line-color":
            typeof lineColor === "string"
              ? lineColor
              : lineColorOptionsToLineLayerPaintSpec(lineColor),
          "line-width":
            typeof lineWidth === "number"
              ? lineWidth
              : lineWidthOptionsToLineLayerPaintSpec(lineWidth),

          "line-blur":
            typeof lineBlur === "number"
              ? lineBlur
              : rampedOptionsToLineLayerPaintSpec(lineBlur),

          "line-gap-width":
            typeof lineGapWidth === "number"
              ? lineGapWidth
              : rampedOptionsToLineLayerPaintSpec(lineGapWidth),

          // For some reasons passing "line-dasharray" with the value "undefined"
          // results in no showing the line while it should have the same behavior
          // of not adding the property "line-dasharray" as all.
          // As a workaround, we are inlining the addition of the prop with a conditional
          // which is less readable.
          ...(lineDashArray && { "line-dasharray": lineDashArray }),
        },
      },
      options.beforeId,
    );

    return retunedInfo;
  }
}
