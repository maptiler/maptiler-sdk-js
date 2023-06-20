import maplibregl from "maplibre-gl";
import { Base64 } from "js-base64";
import type {
  StyleSpecification,
  MapOptions as MapOptionsML,
  ControlPosition,
  StyleOptions,
  MapDataEvent,
  Tile,
  RasterDEMSourceSpecification,
  RequestTransformFunction,
} from "maplibre-gl";
import { ReferenceMapStyle, MapStyleVariant } from "@maptiler/client";
import { config, MAPTILER_SESSION_ID, SdkConfig } from "./config";
import { defaults } from "./defaults";
import { MaptilerLogoControl } from "./MaptilerLogoControl";
import { combineTransformRequest, enableRTL } from "./tools";
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

function sleepAsync(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type LoadWithTerrainEvent = {
  type: "loadWithTerrain";
  target: Map;
  terrain: {
    source: string;
    exaggeration: number;
  };
};

// StyleSwapOptions is not exported by Maplibre, but we can redefine it (used for setStyle)
export type TransformStyleFunction = (
  previous: StyleSpecification,
  next: StyleSpecification
) => StyleSpecification;

export type StyleSwapOptions = {
  diff?: boolean;
  transformStyle?: TransformStyleFunction;
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
  private primaryLanguage: LanguageString | null = null;
  private secondaryLanguage: LanguageString | null = null;
  private terrainGrowing = false;
  private terrainFlattening = false;

  constructor(options: MapOptions) {
    if (options.apiKey) {
      config.apiKey = options.apiKey;
    }

    const style = styleToStyle(options.style);
    const hashPreConstructor = location.hash;

    if (!config.apiKey) {
      console.warn(
        "MapTiler Cloud API key is not set. Visit https://maptiler.com and try Cloud for free!"
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
        console.warn(e.message);
      }

      // As a fallback, we want to center the map on the visitor. First with IP geolocation...
      let ipLocatedCameraHash = null;
      try {
        await this.centerOnIpPoint(options.zoom);
        ipLocatedCameraHash = this.getCameraHash();
      } catch (e) {
        // not raising
        console.warn(e.message);
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
          }
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
            (s: any) =>
              typeof s.url === "string" && s.url.includes("tiles.json")
          );

        const styleUrl = new URL(
          (possibleSources[0] as maplibregl.VectorTileSource).url
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
      if ("logo" in tileJsonContent && tileJsonContent.logo) {
        const logoURL: string = tileJsonContent.logo;

        this.addControl(
          new MaptilerLogoControl({ logoURL }),
          options.logoPosition
        );

        // if attribution in option is `false` but the the logo shows up in the tileJson, then the attribution must show anyways
        if (options.attributionControl === false) {
          this.addControl(
            new AttributionControl({
              customAttribution: options.customAttribution,
            })
          );
        }
      } else if (options.maptilerLogo) {
        this.addControl(new MaptilerLogoControl(), options.logoPosition);
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
          position
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
    let terrainEventData: LoadWithTerrainEvent = null;

    this.once("load", (_) => {
      loadEventTriggered = true;
      if (terrainEventTriggered) {
        this.fire("loadWithTerrain", terrainEventData);
      }
    });

    const terrainCallback = (evt) => {
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
        options.terrainExaggeration ?? this.terrainExaggeration
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
    return new Promise<Map>((resolve, reject) => {
      if (this.loaded()) {
        return resolve(this);
      }

      this.once("load", (_) => {
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
    return new Promise<Map>((resolve, reject) => {
      if (this.loaded() && this.terrain) {
        return resolve(this);
      }

      this.once("loadWithTerrain", (_) => {
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
   * @param style
   * @param options
   * @returns
   */
  setStyle(
    style: ReferenceMapStyle | MapStyleVariant | StyleSpecification | string,
    options?: StyleSwapOptions & StyleOptions
  ) {
    return super.setStyle(styleToStyle(style), options);
  }

  /**
   * Define the primary language of the map. Note that not all the languages shorthands provided are available.
   * This function is a short for `.setPrimaryLanguage()`
   * @param language
   */
  setLanguage(language: LanguageString = defaults.primaryLanguage) {
    if (language === Language.AUTO) {
      return this.setLanguage(getBrowserLanguage());
    }
    this.setPrimaryLanguage(language);
  }

  /**
   * Define the primary language of the map. Note that not all the languages shorthands provided are available.
   * @param language
   */
  setPrimaryLanguage(language: LanguageString = defaults.primaryLanguage) {
    if (this.primaryLanguage === Language.STYLE_LOCK) {
      console.warn(
        "The language cannot be changed because this map has been instantiated with the STYLE_LOCK language flag."
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

        if (!layout["text-field"]) {
          continue;
        }

        const textFieldLayoutProp = this.getLayoutProperty(
          layer.id,
          "text-field"
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
            textFieldLayoutProp.toString()
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
            textFieldLayoutProp.toString()
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
   * @param language
   */
  setSecondaryLanguage(language: LanguageString = defaults.secondaryLanguage) {
    // Using the lock flag as a primaty language also applies to the secondary
    if (this.primaryLanguage === Language.STYLE_LOCK) {
      console.warn(
        "The language cannot be changed because this map has been instantiated with the STYLE_LOCK language flag."
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

        if (!layout["text-field"]) {
          continue;
        }

        const textFieldLayoutProp = this.getLayoutProperty(
          layer.id,
          "text-field"
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
            textFieldLayoutProp.toString()
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
  getSecondaryLanguage(): LanguageString {
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

  private growTerrain(exaggeration, durationMs = 1000) {
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
   * @param exaggeration
   * @returns
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
        this.setTerrain(null);
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
   * @param exaggeration
   * @param animate
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
   * @param cb
   */
  private onStyleReady(cb) {
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
      }
    );
  }

  async centerOnIpPoint(zoom: number | undefined) {
    const ipGeolocateResult = await geolocation.info();
    this.jumpTo({
      center: [ipGeolocateResult.longitude, ipGeolocateResult.latitude],
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
   * @returns
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
  setTransformRequest(transformRequest: RequestTransformFunction) {
    super.setTransformRequest(combineTransformRequest(transformRequest));
    return this;
  }
}
