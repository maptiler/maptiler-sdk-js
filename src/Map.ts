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
  LayerSpecification,
  SourceSpecification,
  CustomLayerInterface,
  FilterSpecification,
  StyleSetterOptions,
  DataDrivenPropertyValueSpecification,
  PropertyValueSpecification,
  ExpressionSpecification,
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
  paintColorOptionsToPaintSpec,
  rampedOptionsToLayerPaintSpec,
  PolylineLayerOptions,
  PolylgonLayerOptions,
  dashArrayMaker,
  PointLayerOptions,
  colorDrivenByProperty,
  radiusDrivenByProperty,
  DataDrivenStyle,
  opacityDrivenByProperty,
  HeatmapLayerOptions,
  heatmapIntensityFromColorRamp,
  rampedPropertyValueWeight,
  ZoomNumberValues,
  radiusDrivenByPropertyHeatmap,
  PropertyValues,
} from "./stylehelper";
import { gpx, gpxOrKml, kml } from "./converters";
import { ColorRampCollection } from "./colorramp";
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
  private terrainGrowing = false;
  private terrainFlattening = false;
  private minimap?: Minimap;
  private forceLanguageUpdate: boolean;
  private languageAlwaysBeenStyle: boolean;

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
    this.forceLanguageUpdate =
      this.primaryLanguage === Language.STYLE ||
      this.primaryLanguage === Language.STYLE_LOCK
        ? false
        : true;
    this.languageAlwaysBeenStyle = this.primaryLanguage === Language.STYLE;
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
      const { minimap } = options;
      if (typeof minimap === "object") {
        const {
          zoom,
          center,
          style,
          language,
          apiKey,
          maptilerLogo,
          antialias,
          refreshExpiredTiles,
          maxBounds,
          scrollZoom,
          minZoom,
          maxZoom,
          boxZoom,
          locale,
          fadeDuration,
          crossSourceCollisions,
          clickTolerance,
          bounds,
          fitBoundsOptions,
          pixelRatio,
          validateStyle,
        } = options;
        this.minimap = new Minimap(minimap, {
          zoom,
          center,
          style,
          language,
          apiKey,
          container: "null",
          maptilerLogo,
          antialias,
          refreshExpiredTiles,
          maxBounds,
          scrollZoom,
          minZoom,
          maxZoom,
          boxZoom,
          locale,
          fadeDuration,
          crossSourceCollisions,
          clickTolerance,
          bounds,
          fitBoundsOptions,
          pixelRatio,
          validateStyle,
        });
        this.addControl(this.minimap, minimap.position ?? "bottom-left");
      } else if (minimap === true) {
        this.minimap = new Minimap({}, options);
        this.addControl(this.minimap, "bottom-left");
      } else if (minimap !== undefined && minimap !== false) {
        this.minimap = new Minimap({}, options);
        this.addControl(this.minimap, minimap);
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
    this.forceLanguageUpdate = true;

    this.once("idle", () => {
      this.forceLanguageUpdate = false;
    });

    return super.setStyle(styleToStyle(style), options);
  }

  /**
   * Adds a [MapLibre style layer](https://maplibre.org/maplibre-style-spec/layers)
   * to the map's style.
   *
   * A layer defines how data from a specified source will be styled. Read more about layer types
   * and available paint and layout properties in the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/layers).
   *
   * @param layer - The layer to add,
   * conforming to either the MapLibre Style Specification's [layer definition](https://maplibre.org/maplibre-style-spec/layers) or,
   * less commonly, the {@link CustomLayerInterface} specification.
   * The MapLibre Style Specification's layer definition is appropriate for most layers.
   *
   * @param beforeId - The ID of an existing layer to insert the new layer before,
   * resulting in the new layer appearing visually beneath the existing layer.
   * If this argument is not specified, the layer will be appended to the end of the layers array
   * and appear visually above all other layers.
   *
   * @returns `this`
   */
  addLayer(
    layer:
      | (LayerSpecification & {
          source?: string | SourceSpecification;
        })
      | CustomLayerInterface,
    beforeId?: string,
  ): this {
    this.minimap?.addLayer(layer, beforeId);
    return super.addLayer(layer, beforeId);
  }

  /**
   * Moves a layer to a different z-position.
   *
   * @param id - The ID of the layer to move.
   * @param beforeId - The ID of an existing layer to insert the new layer before. When viewing the map, the `id` layer will appear beneath the `beforeId` layer. If `beforeId` is omitted, the layer will be appended to the end of the layers array and appear above all other layers on the map.
   * @returns `this`
   *
   * @example
   * Move a layer with ID 'polygon' before the layer with ID 'country-label'. The `polygon` layer will appear beneath the `country-label` layer on the map.
   * ```ts
   * map.moveLayer('polygon', 'country-label');
   * ```
   */
  moveLayer(id: string, beforeId?: string): this {
    this.minimap?.moveLayer(id, beforeId);
    return super.moveLayer(id, beforeId);
  }

  /**
   * Removes the layer with the given ID from the map's style.
   *
   * An {@link ErrorEvent} will be fired if the image parameter is invald.
   *
   * @param id - The ID of the layer to remove
   * @returns `this`
   *
   * @example
   * If a layer with ID 'state-data' exists, remove it.
   * ```ts
   * if (map.getLayer('state-data')) map.removeLayer('state-data');
   * ```
   */
  removeLayer(id: string): this {
    this.minimap?.removeLayer(id);
    return super.removeLayer(id);
  }

  /**
   * Sets the zoom extent for the specified style layer. The zoom extent includes the
   * [minimum zoom level](https://maplibre.org/maplibre-style-spec/layers/#minzoom)
   * and [maximum zoom level](https://maplibre.org/maplibre-style-spec/layers/#maxzoom))
   * at which the layer will be rendered.
   *
   * Note: For style layers using vector sources, style layers cannot be rendered at zoom levels lower than the
   * minimum zoom level of the _source layer_ because the data does not exist at those zoom levels. If the minimum
   * zoom level of the source layer is higher than the minimum zoom level defined in the style layer, the style
   * layer will not be rendered at all zoom levels in the zoom range.
   */
  setLayerZoomRange(layerId: string, minzoom: number, maxzoom: number): this {
    this.minimap?.setLayerZoomRange(layerId, minzoom, maxzoom);
    return super.setLayerZoomRange(layerId, minzoom, maxzoom);
  }

  /**
   * Sets the filter for the specified style layer.
   *
   * Filters control which features a style layer renders from its source.
   * Any feature for which the filter expression evaluates to `true` will be
   * rendered on the map. Those that are false will be hidden.
   *
   * Use `setFilter` to show a subset of your source data.
   *
   * To clear the filter, pass `null` or `undefined` as the second parameter.
   */
  setFilter(
    layerId: string,
    filter?: FilterSpecification | null,
    options?: StyleSetterOptions,
  ): this {
    this.minimap?.setFilter(layerId, filter, options);
    return super.setFilter(layerId, filter, options);
  }

  /**
   * Sets the value of a paint property in the specified style layer.
   *
   * @param layerId - The ID of the layer to set the paint property in.
   * @param name - The name of the paint property to set.
   * @param value - The value of the paint property to set.
   * Must be of a type appropriate for the property, as defined in the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/).
   * @param options - Options object.
   * @returns `this`
   * @example
   * ```ts
   * map.setPaintProperty('my-layer', 'fill-color', '#faafee');
   * ```
   */
  setPaintProperty(
    layerId: string,
    name: string,
    value: any,
    options?: StyleSetterOptions,
  ): this {
    this.minimap?.setPaintProperty(layerId, name, value, options);
    return super.setPaintProperty(layerId, name, value, options);
  }

  /**
   * Sets the value of a layout property in the specified style layer.
   * Layout properties define how the layer is styled.
   * Layout properties for layers of the same type are documented together.
   * Layers of different types have different layout properties.
   * See the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/) for the complete list of layout properties.
   * @param layerId - The ID of the layer to set the layout property in.
   * @param name - The name of the layout property to set.
   * @param value - The value of the layout property to set.
   * Must be of a type appropriate for the property, as defined in the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/).
   * @param options - Options object.
   * @returns `this`
   */
  setLayoutProperty(
    layerId: string,
    name: string,
    value: any,
    options?: StyleSetterOptions,
  ): this {
    this.minimap?.setLayoutProperty(layerId, name, value, options);
    return super.setLayoutProperty(layerId, name, value, options);
  }

  /**
   * Sets the value of the style's glyphs property.
   *
   * @param glyphsUrl - Glyph URL to set. Must conform to the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/glyphs/).
   * @param options - Options object.
   * @returns `this`
   * @example
   * ```ts
   * map.setGlyphs('https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf');
   * ```
   */
  setGlyphs(glyphsUrl: string | null, options?: StyleSetterOptions): this {
    this.minimap?.setGlyphs(glyphsUrl, options);
    return super.setGlyphs(glyphsUrl, options);
  }

  private getStyleLanguage(): string | null {
    if (!this.style.stylesheet.metadata) return null;
    if (typeof this.style.stylesheet.metadata !== "object") return null;

    if (
      "maptiler:language" in this.style.stylesheet.metadata &&
      typeof this.style.stylesheet.metadata["maptiler:language"] === "string"
    ) {
      return this.style.stylesheet.metadata["maptiler:language"];
    } else {
      return null;
    }
  }

  /**
   * Define the primary language of the map. Note that not all the languages shorthands provided are available.
   */
  setLanguage(language: LanguageString | string): void {
    this.minimap?.map?.setLanguage(language);
    this.onStyleReady(() => {
      this.setPrimaryLanguage(language);
    });
  }

  /**
   * Define the primary language of the map. Note that not all the languages shorthands provided are available.
   */

  private setPrimaryLanguage(language: LanguageString | string) {
    const styleLanguage = this.getStyleLanguage();

    // If the language is set to `STYLE` (which is the SDK default), but the language defined in
    // the style is `auto`, we need to bypass some verification and modify the languages anyway
    if (
      !(
        language === Language.STYLE &&
        (styleLanguage === Language.AUTO || styleLanguage === Language.VISITOR)
      )
    ) {
      if (language !== Language.STYLE) {
        this.languageAlwaysBeenStyle = false;
      }

      if (this.languageAlwaysBeenStyle) {
        return;
      }

      // No need to change the language
      if (this.primaryLanguage === language && !this.forceLanguageUpdate) {
        return;
      }
    }

    if (!isLanguageSupported(language as string)) {
      console.warn(`The language "${language}" is not supported.`);
      return;
    }

    if (this.primaryLanguage === Language.STYLE_LOCK) {
      console.warn(
        "The language cannot be changed because this map has been instantiated with the STYLE_LOCK language flag.",
      );
      return;
    }

    this.primaryLanguage = language as LanguageString;
    let languageNonStyle: LanguageString = language as LanguageString;

    // STYLE needs to be translated into one of the other language,
    // this is why it's addressed first
    if (language === Language.STYLE) {
      if (!styleLanguage) {
        console.warn("The style has no default languages.");
        return;
      }

      if (!isLanguageSupported(styleLanguage)) {
        console.warn("The language defined in the style is not valid.");
        return;
      }

      languageNonStyle = styleLanguage as LanguageString;
    }

    // may be overwritten below
    let langStr: string | LanguageString = Language.LOCAL;

    // will be overwritten below
    let replacer: ExpressionSpecification | string = `{${langStr}}`;

    if (languageNonStyle == Language.VISITOR) {
      langStr = getBrowserLanguage();
      replacer = [
        "case",
        ["all", ["has", langStr], ["has", Language.LOCAL]],
        [
          "case",
          ["==", ["get", langStr], ["get", Language.LOCAL]],
          ["get", Language.LOCAL],

          [
            "format",
            ["get", langStr],
            { "font-scale": 0.8 },
            "\n",
            ["get", Language.LOCAL],
            { "font-scale": 1.1 },
          ],
        ],

        ["get", Language.LOCAL],
      ];
    } else if (languageNonStyle == Language.VISITOR_ENGLISH) {
      langStr = Language.ENGLISH;
      replacer = [
        "case",
        ["all", ["has", langStr], ["has", Language.LOCAL]],
        [
          "case",
          ["==", ["get", langStr], ["get", Language.LOCAL]],
          ["get", Language.LOCAL],

          [
            "format",
            ["get", langStr],
            { "font-scale": 0.8 },
            "\n",
            ["get", Language.LOCAL],
            { "font-scale": 1.1 },
          ],
        ],
        ["get", Language.LOCAL],
      ];
    } else if (languageNonStyle === Language.AUTO) {
      langStr = getBrowserLanguage();
      replacer = [
        "case",
        ["has", langStr],
        ["get", langStr],
        ["get", Language.LOCAL],
      ];
    }

    // This is for using the regular names as {name}
    else if (languageNonStyle === Language.LOCAL) {
      langStr = Language.LOCAL;
      replacer = `{${langStr}}`;
    }

    // This section is for the regular language ISO codes
    else {
      langStr = languageNonStyle;
      replacer = [
        "case",
        ["has", langStr],
        ["get", langStr],
        ["get", Language.LOCAL],
      ];
    }

    const { layers } = this.getStyle();

    for (const { id, layout } of layers) {
      if (!layout) {
        continue;
      }

      if (!("text-field" in layout)) {
        continue;
      }

      const textFieldLayoutProp = this.getLayoutProperty(id, "text-field");

      // If the label is not about a name, then we don't translate it
      if (
        typeof textFieldLayoutProp === "string" &&
        (textFieldLayoutProp.toLowerCase().includes("ref") ||
          textFieldLayoutProp.toLowerCase().includes("housenumber"))
      ) {
        continue;
      }

      this.setLayoutProperty(id, "text-field", replacer);
    }
  }

  /**
   * Get the primary language
   * @returns
   */
  getPrimaryLanguage(): LanguageString {
    return this.primaryLanguage;
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

    return this.addGeoJSONPolyline({
      ...options,
      data,
    });
  }

  /**
   * Add a polyline witgh optional outline from a GeoJSON object
   */
  private addGeoJSONPolyline(
    // The data or data source is expected to contain LineStrings or MultiLineStrings
    options: PolylineLayerOptions,
  ): {
    /**
     * ID of the main line layer
     */
    polylineLayerId: string;

    /**
     * ID of the outline layer (will be `""` if no outline)
     */
    polylineOutlineLayerId: string;

    /**
     * ID of the data source
     */
    polylineSourceId: string;
  } {
    if (options.layerId && this.getLayer(options.layerId)) {
      throw new Error(
        `A layer already exists with the layer id: ${options.layerId}`,
      );
    }

    const sourceId = options.sourceId ?? generateRandomSourceName();
    const layerId = options.layerId ?? generateRandomLayerName();

    const returnedInfo = {
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
      returnedInfo.polylineOutlineLayerId = outlineLayerId;

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
                : rampedOptionsToLayerPaintSpec(outlineOpacity),
            "line-color":
              typeof outlineColor === "string"
                ? outlineColor
                : paintColorOptionsToPaintSpec(outlineColor),
            "line-width": computeRampedOutlineWidth(lineWidth, outlineWidth),
            "line-blur":
              typeof outlineBlur === "number"
                ? outlineBlur
                : rampedOptionsToLayerPaintSpec(outlineBlur),
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
              : rampedOptionsToLayerPaintSpec(lineOpacity),
          "line-color":
            typeof lineColor === "string"
              ? lineColor
              : paintColorOptionsToPaintSpec(lineColor),
          "line-width":
            typeof lineWidth === "number"
              ? lineWidth
              : rampedOptionsToLayerPaintSpec(lineWidth),

          "line-blur":
            typeof lineBlur === "number"
              ? lineBlur
              : rampedOptionsToLayerPaintSpec(lineBlur),

          "line-gap-width":
            typeof lineGapWidth === "number"
              ? lineGapWidth
              : rampedOptionsToLayerPaintSpec(lineGapWidth),

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

    return returnedInfo;
  }

  /**
   * Add a polygon with styling options.
   */
  addPolygon(
    // this Feature collection is expected to contain on LineStrings and MultiLinestrings
    options: PolylgonLayerOptions,
  ): {
    /**
     * ID of the fill layer
     */
    polygonLayerId: string;

    /**
     * ID of the outline layer (will be `""` if no outline)
     */
    polygonOutlineLayerId: string;

    /**
     * ID of the source that contains the data
     */
    polygonSourceId: string;
  } {
    if (options.layerId && this.getLayer(options.layerId)) {
      throw new Error(
        `A layer already exists with the layer id: ${options.layerId}`,
      );
    }

    const sourceId = options.sourceId ?? generateRandomSourceName();
    const layerId = options.layerId ?? generateRandomLayerName();

    const returnedInfo = {
      polygonLayerId: layerId,
      polygonOutlineLayerId: options.outline ? `${layerId}_outline` : "",
      polygonSourceId: sourceId,
    };

    // A new source is added if the map does not have this sourceId and the data is provided
    if (options.data && !this.getSource(sourceId)) {
      let data: string | FeatureCollection = options.data;

      // If is a UUID, we extend it to be the URL to a MapTiler Cloud hosted dataset
      if (typeof data === "string" && isUUID(data)) {
        data = `https://api.maptiler.com/data/${data}/features.json?key=${config.apiKey}`;
      }

      // Adding the source
      this.addSource(sourceId, {
        type: "geojson",
        data: data,
      });
    }

    let outlineDashArray = options.outlineDashArray ?? null;
    const outlineWidth = options.outlineWidth ?? 1;
    const outlineColor = options.outlineColor ?? "#FFFFFF";
    const outlineOpacity = options.outlineOpacity ?? 1;
    const outlineBlur = options.outlineBlur ?? 0;
    const fillColor = options.fillColor ?? getRandomColor();
    const fillOpacity = options.fillOpacity ?? 1;
    const outlinePosition = options.outlinePosition ?? "center";
    const pattern = options.pattern ?? null;

    if (typeof outlineDashArray === "string") {
      outlineDashArray = dashArrayMaker(outlineDashArray);
    }

    const addLayers = (patternImageId: string | null = null) => {
      this.addLayer(
        {
          id: layerId,
          type: "fill",
          source: sourceId,
          minzoom: options.minzoom ?? 0,
          maxzoom: options.maxzoom ?? 23,
          paint: {
            "fill-color":
              typeof fillColor === "string"
                ? fillColor
                : paintColorOptionsToPaintSpec(fillColor),

            "fill-opacity":
              typeof fillOpacity === "number"
                ? fillOpacity
                : rampedOptionsToLayerPaintSpec(fillOpacity),

            // Adding a pattern if provided
            ...(patternImageId && { "fill-pattern": patternImageId }),
          },
        },
        options.beforeId,
      );

      // We want to create an outline for this line layer
      if (options.outline === true) {
        let computedOutlineOffset:
          | DataDrivenPropertyValueSpecification<number>
          | number;

        if (outlinePosition === "inside") {
          if (typeof outlineWidth === "number") {
            computedOutlineOffset = 0.5 * outlineWidth;
          } else {
            computedOutlineOffset = rampedOptionsToLayerPaintSpec(
              outlineWidth.map(({ zoom, value }) => ({
                zoom,
                value: 0.5 * value,
              })),
            );
          }
        } else if (outlinePosition === "outside") {
          if (typeof outlineWidth === "number") {
            computedOutlineOffset = -0.5 * outlineWidth;
          } else {
            computedOutlineOffset = rampedOptionsToLayerPaintSpec(
              outlineWidth.map((el) => ({
                zoom: el.zoom,
                value: -0.5 * el.value,
              })),
            );
          }
        } else {
          computedOutlineOffset = 0;
        }

        this.addLayer(
          {
            id: returnedInfo.polygonOutlineLayerId,
            type: "line",
            source: sourceId,
            layout: {
              "line-join": options.outlineJoin ?? "round",
              "line-cap": options.outlineCap ?? "butt",
            },
            minzoom: options.minzoom ?? 0,
            maxzoom: options.maxzoom ?? 23,
            paint: {
              "line-opacity":
                typeof outlineOpacity === "number"
                  ? outlineOpacity
                  : rampedOptionsToLayerPaintSpec(outlineOpacity),
              "line-color":
                typeof outlineColor === "string"
                  ? outlineColor
                  : paintColorOptionsToPaintSpec(outlineColor),
              "line-width":
                typeof outlineWidth === "number"
                  ? outlineWidth
                  : rampedOptionsToLayerPaintSpec(outlineWidth),
              "line-blur":
                typeof outlineBlur === "number"
                  ? outlineBlur
                  : rampedOptionsToLayerPaintSpec(outlineBlur),

              "line-offset": computedOutlineOffset,

              // For some reasons passing "line-dasharray" with the value "undefined"
              // results in no showing the line while it should have the same behavior
              // of not adding the property "line-dasharray" as all.
              // As a workaround, we are inlining the addition of the prop with a conditional
              // which is less readable.
              ...(outlineDashArray && {
                "line-dasharray":
                  outlineDashArray as PropertyValueSpecification<number[]>,
              }),
            },
          },
          options.beforeId,
        );
      }
    };

    if (pattern) {
      if (this.hasImage(pattern)) {
        addLayers(pattern);
      } else {
        this.loadImage(
          pattern,

          // (error?: Error | null, image?: HTMLImageElement | ImageBitmap | null, expiry?: ExpiryData | null)
          (
            error: Error | null | undefined,
            image: HTMLImageElement | ImageBitmap | null | undefined,
          ) => {
            // Throw an error if something goes wrong.
            if (error) {
              console.error("Could not load the pattern image.", error.message);
              return addLayers();
            }

            if (!image) {
              console.error(
                `An image cannot be created from the pattern URL ${pattern}.`,
              );
              return addLayers();
            }

            // Add the image to the map style, using the image URL as an ID
            this.addImage(pattern, image);

            addLayers(pattern);
          },
        );
      }
    } else {
      addLayers();
    }

    return returnedInfo;
  }

  /**
   * Add a polyline witgh optional outline from a GeoJSON object
   */
  addPoint(
    // The data or data source is expected to contain LineStrings or MultiLineStrings
    options: PointLayerOptions,
  ): {
    /**
     * ID of the unclustered point layer
     */
    pointLayerId: string;

    /**
     * ID of the clustered point layer (empty if `cluster` options id `false`)
     */
    clusterLayerId: string;

    /**
     * ID of the layer that shows the count of elements in each cluster (empty if `cluster` options id `false`)
     */
    labelLayerId: string;

    /**
     * ID of the data source
     */
    pointSourceId: string;
  } {
    if (options.layerId && this.getLayer(options.layerId)) {
      throw new Error(
        `A layer already exists with the layer id: ${options.layerId}`,
      );
    }

    const minPointRadius = options.minPointRadius ?? 10;
    const maxPointRadius = options.maxPointRadius ?? 50;
    const cluster = options.cluster ?? false;
    const nbDefaultDataDrivenStyleSteps = 20;
    const colorramp = Array.isArray(options.pointColor)
      ? options.pointColor
      : ColorRampCollection.TURBO.scale(
          10,
          options.cluster ? 10000 : 1000,
        ).resample("ease-out-square");
    const colorRampBounds = colorramp.getBounds();
    const sourceId = options.sourceId ?? generateRandomSourceName();
    const layerId = options.layerId ?? generateRandomLayerName();
    const showLabel = options.showLabel ?? cluster;
    const alignOnViewport = options.alignOnViewport ?? true;
    const outline = options.outline ?? false;
    const outlineOpacity = options.outlineOpacity ?? 1;
    const outlineWidth = options.outlineWidth ?? 1;
    const outlineColor = options.outlineColor ?? "#FFFFFF";
    let pointOpacity;
    const zoomCompensation = options.zoomCompensation ?? true;
    const minzoom = options.minzoom ?? 0;
    const maxzoom = options.maxzoom ?? 23;

    if (typeof options.pointOpacity === "number") {
      pointOpacity = options.pointOpacity;
    } else if (Array.isArray(options.pointOpacity)) {
      pointOpacity = rampedOptionsToLayerPaintSpec(options.pointOpacity);
    } else if (options.cluster) {
      pointOpacity = opacityDrivenByProperty(colorramp, "point_count");
    } else if (options.property) {
      pointOpacity = opacityDrivenByProperty(colorramp, options.property);
    } else {
      pointOpacity = rampedOptionsToLayerPaintSpec([
        { zoom: minzoom, value: 0 },
        { zoom: minzoom + 0.25, value: 1 },
        { zoom: maxzoom - 0.25, value: 1 },
        { zoom: maxzoom, value: 0 },
      ]);
    }

    const returnedInfo = {
      pointLayerId: layerId,
      clusterLayerId: "",
      labelLayerId: "",
      pointSourceId: sourceId,
    };

    // A new source is added if the map does not have this sourceId and the data is provided
    if (options.data && !this.getSource(sourceId)) {
      let data: string | FeatureCollection = options.data;

      // If is a UUID, we extend it to be the URL to a MapTiler Cloud hosted dataset
      if (typeof data === "string" && isUUID(data)) {
        data = `https://api.maptiler.com/data/${data}/features.json?key=${config.apiKey}`;
      }

      // Adding the source
      this.addSource(sourceId, {
        type: "geojson",
        data: data,
        cluster,
      });
    }

    if (cluster) {
      // If using clusters, the size and color of the circles (clusters) are driven by the
      // numbner of elements they contain and cannot be driven by the zoom level or a property

      returnedInfo.clusterLayerId = `${layerId}_cluster`;

      const clusterStyle: DataDrivenStyle = Array.from(
        { length: nbDefaultDataDrivenStyleSteps },
        (_, i) => {
          const value =
            colorRampBounds.min +
            (i * (colorRampBounds.max - colorRampBounds.min)) /
              (nbDefaultDataDrivenStyleSteps - 1);
          return {
            value,
            pointRadius:
              minPointRadius +
              (maxPointRadius - minPointRadius) *
                Math.pow(i / (nbDefaultDataDrivenStyleSteps - 1), 0.5),
            color: colorramp.getColorHex(value),
          };
        },
      );

      this.addLayer(
        {
          id: returnedInfo.clusterLayerId,
          type: "circle",
          source: sourceId,
          filter: ["has", "point_count"],
          paint: {
            // 'circle-color': options.pointColor ?? colorDrivenByProperty(clusterStyle, "point_count"),
            "circle-color":
              typeof options.pointColor === "string"
                ? options.pointColor
                : colorDrivenByProperty(clusterStyle, "point_count"),

            "circle-radius":
              typeof options.pointRadius === "number"
                ? options.pointRadius
                : Array.isArray(options.pointRadius)
                ? rampedOptionsToLayerPaintSpec(options.pointRadius)
                : radiusDrivenByProperty(clusterStyle, "point_count", false),

            "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
            "circle-pitch-scale": "map", // scale with camera distance regardless of viewport/biewport alignement
            "circle-opacity": pointOpacity,
            ...(outline && {
              "circle-stroke-opacity":
                typeof outlineOpacity === "number"
                  ? outlineOpacity
                  : rampedOptionsToLayerPaintSpec(outlineOpacity),

              "circle-stroke-width":
                typeof outlineWidth === "number"
                  ? outlineWidth
                  : rampedOptionsToLayerPaintSpec(outlineWidth),

              "circle-stroke-color":
                typeof outlineColor === "string"
                  ? outlineColor
                  : paintColorOptionsToPaintSpec(outlineColor),
            }),
          },
          minzoom,
          maxzoom,
        },
        options.beforeId,
      );

      // Adding the layer of unclustered point (visible only when ungrouped)
      this.addLayer(
        {
          id: returnedInfo.pointLayerId,
          type: "circle",
          source: sourceId,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
            "circle-pitch-scale": "map", // scale with camera distance regardless of viewport/biewport alignement
            // 'circle-color':  options.pointColor ?? clusterStyle[0].color,
            "circle-color":
              typeof options.pointColor === "string"
                ? options.pointColor
                : colorramp.getColorHex(colorramp.getBounds().min),
            "circle-radius":
              typeof options.pointRadius === "number"
                ? options.pointRadius
                : Array.isArray(options.pointRadius)
                ? rampedOptionsToLayerPaintSpec(options.pointRadius)
                : clusterStyle[0].pointRadius * 0.75,
            "circle-opacity": pointOpacity,
            ...(outline && {
              "circle-stroke-opacity":
                typeof outlineOpacity === "number"
                  ? outlineOpacity
                  : rampedOptionsToLayerPaintSpec(outlineOpacity),

              "circle-stroke-width":
                typeof outlineWidth === "number"
                  ? outlineWidth
                  : rampedOptionsToLayerPaintSpec(outlineWidth),

              "circle-stroke-color":
                typeof outlineColor === "string"
                  ? outlineColor
                  : paintColorOptionsToPaintSpec(outlineColor),
            }),
          },
          minzoom,
          maxzoom,
        },
        options.beforeId,
      );
    }

    // Not displaying clusters
    else {
      let pointColor: DataDrivenPropertyValueSpecification<string> =
        typeof options.pointColor === "string"
          ? options.pointColor
          : Array.isArray(options.pointColor)
          ? options.pointColor.getColorHex(options.pointColor.getBounds().min) // if color ramp is given, we choose the first color of it, even if the property may not be provided
          : getRandomColor();

      let pointRadius: DataDrivenPropertyValueSpecification<number> =
        typeof options.pointRadius === "number"
          ? zoomCompensation
            ? rampedOptionsToLayerPaintSpec([
                { zoom: 0, value: options.pointRadius * 0.025 },
                { zoom: 2, value: options.pointRadius * 0.05 },
                { zoom: 4, value: options.pointRadius * 0.1 },
                { zoom: 8, value: options.pointRadius * 0.25 },
                { zoom: 16, value: options.pointRadius * 1 },
              ])
            : options.pointRadius
          : Array.isArray(options.pointRadius)
          ? rampedOptionsToLayerPaintSpec(options.pointRadius)
          : zoomCompensation
          ? rampedOptionsToLayerPaintSpec([
              { zoom: 0, value: minPointRadius * 0.05 },
              { zoom: 2, value: minPointRadius * 0.1 },
              { zoom: 4, value: minPointRadius * 0.2 },
              { zoom: 8, value: minPointRadius * 0.5 },
              { zoom: 16, value: minPointRadius * 1 },
            ])
          : minPointRadius;

      // If the styling depends on a property, then we build a custom style
      if (options.property && Array.isArray(options.pointColor)) {
        const dataDrivenStyle: DataDrivenStyle = Array.from(
          { length: nbDefaultDataDrivenStyleSteps },
          (_, i) => {
            const value =
              colorRampBounds.min +
              (i * (colorRampBounds.max - colorRampBounds.min)) /
                (nbDefaultDataDrivenStyleSteps - 1);
            return {
              value,
              pointRadius:
                typeof options.pointRadius === "number"
                  ? options.pointRadius
                  : minPointRadius +
                    (maxPointRadius - minPointRadius) *
                      Math.pow(i / (nbDefaultDataDrivenStyleSteps - 1), 0.5),
              color:
                typeof options.pointColor === "string"
                  ? options.pointColor
                  : colorramp.getColorHex(value),
            };
          },
        );
        pointColor = colorDrivenByProperty(dataDrivenStyle, options.property);
        pointRadius = radiusDrivenByProperty(
          dataDrivenStyle,
          options.property,
          zoomCompensation,
        );
      }

      // Adding the layer of unclustered point
      this.addLayer(
        {
          id: returnedInfo.pointLayerId,
          type: "circle",
          source: sourceId,
          layout: {
            // Contrary to labels, we want to see the small one in front. Weirdly "circle-sort-key" works in the opposite direction as "symbol-sort-key".
            "circle-sort-key": options.property
              ? ["/", 1, ["get", options.property]]
              : 0,
          },
          paint: {
            "circle-pitch-alignment": alignOnViewport ? "viewport" : "map",
            "circle-pitch-scale": "map", // scale with camera distance regardless of viewport/biewport alignement
            "circle-color": pointColor,
            "circle-opacity": pointOpacity,
            "circle-radius": pointRadius,

            ...(outline && {
              "circle-stroke-opacity":
                typeof outlineOpacity === "number"
                  ? outlineOpacity
                  : rampedOptionsToLayerPaintSpec(outlineOpacity),

              "circle-stroke-width":
                typeof outlineWidth === "number"
                  ? outlineWidth
                  : rampedOptionsToLayerPaintSpec(outlineWidth),

              "circle-stroke-color":
                typeof outlineColor === "string"
                  ? outlineColor
                  : paintColorOptionsToPaintSpec(outlineColor),
            }),
          },
          minzoom,
          maxzoom,
        },
        options.beforeId,
      );
    }

    if (showLabel !== false && (options.cluster || options.property)) {
      returnedInfo.labelLayerId = `${layerId}_label`;
      const labelColor = options.labelColor ?? "#fff";
      const labelSize = options.labelSize ?? 12;

      // With clusters, a layer with clouster count is also added
      this.addLayer(
        {
          id: returnedInfo.labelLayerId,
          type: "symbol",
          source: sourceId,
          filter: [
            "has",
            options.cluster ? "point_count" : (options.property as string),
          ],
          layout: {
            "text-field": options.cluster
              ? "{point_count_abbreviated}"
              : `{${options.property as string}}`,
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Medium"],
            "text-size": labelSize,
            "text-pitch-alignment": alignOnViewport ? "viewport" : "map",
            "symbol-sort-key": [
              "/",
              1,
              [
                "get",
                options.cluster ? "point_count" : (options.property as string),
              ],
            ], // so that the largest value goes on top
          },
          paint: {
            "text-color": labelColor,
            "text-opacity": pointOpacity,
          },
          minzoom,
          maxzoom,
        },
        options.beforeId,
      );
    }
    return returnedInfo;
  }

  /**
   * Loads an image. This is an async equivalent of `Map.loadImage`
   */
  async loadImageAsync(
    url: string,
  ): Promise<HTMLImageElement | ImageBitmap | null | undefined> {
    return new Promise((resolve, reject) => {
      this.loadImage(
        url,
        (
          error: Error | null | undefined,
          image: HTMLImageElement | ImageBitmap | null | undefined,
        ) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(image);
        },
      );
    });
  }

  /**
   * Add a polyline witgh optional outline from a GeoJSON object
   */
  addHeatmap(
    // The data or data source is expected to contain LineStrings or MultiLineStrings
    options: HeatmapLayerOptions,
  ): {
    /**
     * ID of the heatmap layer
     */
    heatmapLayerId: string;

    /**
     * ID of the data source
     */
    heatmapSourceId: string;
  } {
    if (options.layerId && this.getLayer(options.layerId)) {
      throw new Error(
        `A layer already exists with the layer id: ${options.layerId}`,
      );
    }

    const sourceId = options.sourceId ?? generateRandomSourceName();
    const layerId = options.layerId ?? generateRandomLayerName();
    const minzoom = options.minzoom ?? 0;
    const maxzoom = options.maxzoom ?? 23;
    const zoomCompensation = options.zoomCompensation ?? true;

    const opacity = options.opacity ?? [
      { zoom: minzoom, value: 0 },
      { zoom: minzoom + 0.25, value: 1 },
      { zoom: maxzoom - 0.25, value: 1 },
      { zoom: maxzoom, value: 0 },
    ];

    // const colorRamp = "colorRamp" in options
    let colorRamp = Array.isArray(options.colorRamp)
      ? options.colorRamp
      : ColorRampCollection.TURBO.transparentStart();

    // making sure the color ramp has [0, 1] bounds
    const crBounds = colorRamp.getBounds();
    if (crBounds.min !== 0 || crBounds.max !== 1) {
      colorRamp = colorRamp.scale(0, 1);
    }

    // making sure the color ramp has is transparent in 0
    if (!colorRamp.hasTransparentStart()) {
      colorRamp = colorRamp.transparentStart();
    }

    const intensity = options.intensity ?? [
      { zoom: 0, value: 0.01 },
      { zoom: 4, value: 0.2 },
      { zoom: 16, value: 1 },
    ];

    const property = options.property ?? null;
    const propertyValueWeight = options.weight ?? 1;

    let heatmapWeight: DataDrivenPropertyValueSpecification<number> = 1; // = typeof propertyValueWeights === "number" ? propertyValueWeights : 1;

    if (property) {
      if (typeof propertyValueWeight === "number") {
        heatmapWeight = propertyValueWeight;

        // In case this numerical weight was provided by the user and not be the default value:
        if (typeof options.weight === "number") {
          console.warn(
            "The option `.property` is ignored when `.propertyValueWeights` is not of type `PropertyValueWeights`",
          );
        }
      } else if (Array.isArray(propertyValueWeight)) {
        heatmapWeight = rampedPropertyValueWeight(
          propertyValueWeight,
          property,
        );
      } else {
        console.warn(
          "The option `.property` is ignored when `.propertyValueWeights` is not of type `PropertyValueWeights`",
        );
      }
    } else {
      if (typeof propertyValueWeight === "number") {
        heatmapWeight = propertyValueWeight;
      } else if (Array.isArray(propertyValueWeight)) {
        console.warn(
          "The options `.propertyValueWeights` can only be used when `.property` is provided.",
        );
      }
    }

    const defaultRadiusZoomRamping = [
      { zoom: 0, value: 50 * 0.025 },
      { zoom: 2, value: 50 * 0.05 },
      { zoom: 4, value: 50 * 0.1 },
      { zoom: 8, value: 50 * 0.25 },
      { zoom: 16, value: 50 },
    ];

    const radius =
      options.radius ?? (zoomCompensation ? defaultRadiusZoomRamping : 10);

    let radiusHeatmap: DataDrivenPropertyValueSpecification<number> = 1;

    if (typeof radius === "number") {
      radiusHeatmap = radius;
    }

    // Radius is provided as a zoom-ramping array
    else if (Array.isArray(radius) && "zoom" in radius[0]) {
      radiusHeatmap = rampedOptionsToLayerPaintSpec(radius as ZoomNumberValues);
    }

    // Radius is provided as data driven
    else if (
      property &&
      Array.isArray(radius) &&
      "propertyValue" in radius[0]
    ) {
      radiusHeatmap = radiusDrivenByPropertyHeatmap(
        radius as unknown as PropertyValues,
        property,
        zoomCompensation,
      );
    } else if (
      !property &&
      Array.isArray(radius) &&
      "propertyValue" in radius[0]
    ) {
      radiusHeatmap = rampedOptionsToLayerPaintSpec(
        defaultRadiusZoomRamping as ZoomNumberValues,
      );
      console.warn(
        "The option `.radius` can only be property-driven if the option `.property` is provided.",
      );
    } else {
      radiusHeatmap = rampedOptionsToLayerPaintSpec(
        defaultRadiusZoomRamping as ZoomNumberValues,
      );
    }

    const returnedInfo = {
      heatmapLayerId: layerId,
      heatmapSourceId: sourceId,
    };

    // A new source is added if the map does not have this sourceId and the data is provided
    if (options.data && !this.getSource(sourceId)) {
      let data: string | FeatureCollection = options.data;

      // If is a UUID, we extend it to be the URL to a MapTiler Cloud hosted dataset
      if (typeof data === "string" && isUUID(data)) {
        data = `https://api.maptiler.com/data/${data}/features.json?key=${config.apiKey}`;
      }

      // Adding the source
      this.addSource(sourceId, {
        type: "geojson",
        data: data,
      });
    }

    this.addLayer({
      id: layerId,
      type: "heatmap",
      source: sourceId,
      minzoom,
      maxzoom,
      paint: {
        "heatmap-weight": heatmapWeight,

        "heatmap-intensity":
          typeof intensity === "number"
            ? intensity
            : (rampedOptionsToLayerPaintSpec(
                intensity,
              ) as PropertyValueSpecification<number>),

        "heatmap-color": heatmapIntensityFromColorRamp(colorRamp),

        "heatmap-radius": radiusHeatmap,

        "heatmap-opacity":
          typeof opacity === "number"
            ? opacity
            : (rampedOptionsToLayerPaintSpec(
                opacity,
              ) as PropertyValueSpecification<number>),
      },
    });

    return returnedInfo;
  }
}
