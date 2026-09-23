import { default as maplibregl, StyleSpecification, MapOptions as MapOptionsML, ControlPosition, StyleSwapOptions, StyleOptions, RequestTransformFunction, LayerSpecification, SourceSpecification, CustomLayerInterface, FilterSpecification, StyleSetterOptions, ProjectionSpecification, FlyToOptions, EaseToOptions, FitBoundsOptions, AnimationOptions, LngLatBoundsLike, LngLatLike } from 'maplibre-gl';
import { ReferenceMapStyle, MapStyleVariant } from '@maptiler/client';
import { SdkConfig } from './config';
import { LanguageInfo } from './language';
import { MinimapOptionsInput } from './controls/Minimap';
import { PreloadTilesForBoundsOptions, PreloadTilesForCameraPositionsOptions, PreloadTilesOptions, WithTilePreload } from './tile-preloading/types';
import { Telemetry } from './Telemetry';
import { CubemapDefinition, CubemapLayer, CubemapLayerConstructorOptions } from './custom-layers/CubemapLayer';
import { GradientDefinition, RadialGradientLayer, RadialGradientLayerConstructorOptions } from './custom-layers/RadialGradientLayer';
import { StyleSpecificationWithMetaData } from './custom-layers/extractCustomLayerStyle';
import { MapTilerMarkerOptions, Marker, MarkerCollisionOptions } from '.';
export type LoadWithTerrainEvent = {
    type: "loadWithTerrain";
    target: Map;
    terrain: {
        source: string;
        exaggeration: number;
    };
};
export declare const GeolocationType: {
    POINT: "POINT";
    COUNTRY: "COUNTRY";
};
/**
 * The type of projection, `undefined` means it's decided by the style and if the style does not contain any projection info,
 * if falls back to the default Mercator
 */
export type ProjectionTypes = "mercator" | "globe" | undefined;
/**
 * Default zoom at/above which a `"globe"` projection request switches to flat mercator — see
 * {@link MapOptions.globeMercatorSwitchZoom}.
 */
export declare const DEFAULT_GLOBE_MERCATOR_SWITCH_ZOOM = 11;
/**
 * The {@link AttributionControl} options object
 */
export interface AttributionControlOptions {
    /**
     * If `true`, the attribution control will always collapse when moving the map.
     * If `false` (default), use expanded attribution control that is always visible.
     * If `"auto"` or `undefined`, use responsive attribution that collapses when the user moves the map on maps less than 640 pixels wide.
     * **Attribution should not be collapsed if it can comfortably fit on the map. `compact` should only be used to modify default attribution when map size makes it impossible to fit default attribution. Always prefer `"auto"` to `true` to show the attribution uncollapsed on large maps.**
     */
    compact?: boolean | "auto";
    /**
     * Attributions to show in addition to any other attributions.
     */
    customAttribution?: string | Array<string>;
}
/**
 * Options to provide to the `Map` constructor
 */
export type MapOptions = Omit<MapOptionsML, "style" | "maplibreLogo" | "attributionControl"> & {
    /**
     * Style of the map. Can be:
     * - a full style URL (possibly with API key)
     * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
     * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
     */
    style?: ReferenceMapStyle | MapStyleVariant | StyleSpecification | string;
    /**
     * Define the language of the map. This can be done directly with a language ISO code (eg. "en"),
     * the ISO code prepended with the OSM flag (eg. "name:en" or even just "name"),
     * or with a built-in shorthand (eg. Language.ENGLISH).
     * Note that this is equivalent to setting the `config.primaryLanguage` and will overwrite it.
     */
    language?: LanguageInfo | string;
    /**
     * Define the MapTiler Cloud API key to be used. This is strictly equivalent to setting
     * `config.apiKey` and will overwrite it.
     */
    apiKey?: string;
    /**
     * Shows or hides the MapTiler logo in the bottom left corner (only for paid plans).
     * Default is `false` for paid plans.
     *
     * For free plans the MapTiler logo is always visible, and cannot be disabled.
     * @example
     * ```ts
     * mapTilerLogo: false // hides the logo
     * ```
     * @example
     * ```ts
     * mapTilerLogo: true // shows the logo
     * ```
     */
    maptilerLogo?: boolean;
    /**
     * Options for an {@link AttributionControl}.
     */
    attributionControl?: AttributionControlOptions;
    /**
     * Attributions to show in addition to any other attributions in an {@link AttributionControl}.
     */
    customAttribution?: string | Array<string>;
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
     * Detect custom external controls. (default: `false`, will detect automatically if `true`)
     */
    customControls?: boolean | string;
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
    /**
     * Show the projection control. (default: `false`, will show if `true`)
     */
    projectionControl?: boolean | ControlPosition;
    /**
     * Whether the projection should be "mercator" or "globe".
     * If not provided, the style takes precedence. If provided, overwrite the style.
     */
    projection?: ProjectionTypes;
    /**
     * MapLibre's plain `type: "globe"` already resolves to
     * `["interpolate", ["linear"], ["zoom"], 11, "vertical-perspective", 12, "mercator"]` —
     * vertical-perspective below zoom 11, linearly blended into flat mercator between 11 and 12.
     * That blend is a MapLibre bug for anything that places objects via its per-projection model
     * matrix (marker altitude, `maptiler-3d-js`): the matrix isn't well-defined mid-blend, only
     * once it's settled fully at one end, so objects placed while zooming through 11-12 jump
     * around.
     *
     * Whenever a projection change resolves to `"globe"` (constructor option, `setProjection`, or
     * the {@link MaptilerProjectionControl}), the SDK requests
     * `{ type: ["step", ["zoom"], "vertical-perspective", globeMercatorSwitchZoom, "mercator"] }`
     * instead of the literal string — spherical below this zoom, flat mercator at and above it,
     * snapping instantly at the threshold instead of blending across that zoom band.
     *
     * Set to `false` to request MapLibre's own `"globe"` literally instead, blend bug and all.
     *
     * Default: `11`
     */
    globeMercatorSwitchZoom?: number | false;
    /**
     * Turn on/off spacebox.
     *
     * Default: { color: "#1D29F1" }
     */
    space?: CubemapLayerConstructorOptions | boolean;
    halo?: RadialGradientLayerConstructorOptions | boolean;
    /**
     * Whether to log the SDK version to the console.
     * Default: Unless this is set explicitly to false, the SDK version will be logged to the console.
     */
    logSDKVersion?: boolean;
    /**
     * Whether to enable the RTL plugin or import a different one.
     * Default is undefined, which means the plugin is enabled by default.
     */
    rtlTextPlugin?: boolean | string;
    /**
     * Whether to enable the experimental tile preloading feature.
     * Default is false.
     * @experimental
     * @remarks
     * **API Key Usage**: Each tile request counts against your MapTiler Cloud API key quota. Use with caution.
     */
    useExperimentalTilePreloading?: boolean;
};
/**
 * Options to provide to the {@link Map.setProjection} method
 */
export interface ProjectionChangeOptions {
    /**
     * Whether the new projection should be persisted for any future style changes.
     *
     * If `true`, the new projection is persisted and is applied after all future style changes.
     * If `false` or not specified, the new projection will be used only until the next style change, when it will get replaced with the first applicable value from this list:
     * - a previously persisted projection
     * - a projection specified in {@link Map} constructor options ({@link MapOptions})
     * - a projection specified in `projection` property of the style itself
     * - the Mercator projection
     */
    persist?: boolean;
}
/**
 * The Map class can be instanciated to display a map in a `<div>`
 */
export declare class Map extends maplibregl.Map {
    readonly telemetry: Telemetry;
    private space?;
    private halo?;
    getSpace(): CubemapLayer | undefined;
    /**
     * Sets the space for the map.
     * @param {CubemapDefinition} space the `CubemapDefinition` options to set.
     * @remarks This method, at present, ** overwrites ** the current config.
     * If an option is not set it will internally revert to the default option
     * unless explicitly set when calling.
     */
    setSpace(space: CubemapDefinition | boolean, updateOptions?: boolean): void;
    /**
     * Enables the animations for the space layer.
     */
    enableSpaceAnimations(): void;
    /**
     * Disables the animations for the space layer.
     */
    disableSpaceAnimations(): void;
    /**
     * Enables the animations for the halo layer.
     */
    enableHaloAnimations(): void;
    /**
     * Disables the animations for the halo layer.
     */
    disableHaloAnimations(): void;
    /**
     * Sets whether the halo layer should be animated in and out.
     * @param active - Whether the animation should be active.
     */
    setHaloAnimationActive(active: boolean): void;
    /**
     * Sets whether the space layer should be animated in and out.
     * @param active - Whether the animation should be active.
     */
    setSpaceAnimationActive(active: boolean): void;
    private setSpaceFromStyle;
    private setHaloFromStyle;
    private initSpace;
    private initHalo;
    getHalo(): RadialGradientLayer | undefined;
    setHalo(halo: GradientDefinition): void;
    private options;
    private tilePreloader?;
    private isTerrainEnabled;
    private terrainExaggeration;
    private primaryLanguage;
    private terrainGrowing;
    private terrainFlattening;
    private minimap?;
    private forceLanguageUpdate;
    private languageAlwaysBeenStyle;
    private isReady;
    private terrainAnimationDuration;
    private monitoredStyleUrls;
    private styleInProcess;
    private currentStyleId?;
    private curentProjection;
    private originalLabelStyle;
    private isStyleLocalized;
    private languageIsUpdated;
    constructor(options: MapOptions);
    /**
     * Recreates the map instance with the same options.
     * Useful for WebGL context loss.
     */
    recreate(): void;
    /**
     * Set the duration (millisec) of the terrain animation for growing or flattening.
     * Must be positive. (Built-in default: `1000` milliseconds)
     */
    setTerrainAnimationDuration(d: number): void;
    /**
     * Awaits for _this_ Map instance to be "loaded" and returns a Promise to the Map.
     * If _this_ Map instance is already loaded, the Promise is resolved directly,
     * otherwise, it is resolved as a result of the "load" event.
     * @returns
     */
    onLoadAsync(): Promise<Map>;
    /**
     * Awaits for _this_ Map instance to be "ready" and returns a Promise to the Map.
     * If _this_ Map instance is already ready, the Promise is resolved directly,
     * otherwise, it is resolved as a result of the "ready" event.
     * A map instance is "ready" when all the controls that can be managed by the contructor are
     * dealt with. This happens after the "load" event, due to the asynchronous nature
     * of some built-in controls.
     */
    onReadyAsync(): Promise<Map>;
    /**
     * Awaits for _this_ Map instance to be "loaded" as well as with terrain being non-null for the first time
     * and returns a Promise to the Map.
     * If _this_ Map instance is already loaded with terrain, the Promise is resolved directly,
     * otherwise, it is resolved as a result of the "loadWithTerrain" event.
     * @returns
     */
    onLoadWithTerrainAsync(): Promise<Map>;
    private monitorStyleUrl;
    /**
     * Update the style of the map.
     * Can be:
     * - a full style URL (possibly with API key)
     * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
     * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
     */
    setStyle(style: null | ReferenceMapStyle | MapStyleVariant | StyleSpecification | StyleSpecificationWithMetaData | string, options?: StyleSwapOptions & StyleOptions): this;
    private spaceboxLoadingState;
    /**
     * Returns the id of the current MapTiler style (e.g. `"streets-v4-dark"`),
     * derived from the value passed to the constructor or `setStyle`.
     * `undefined` when the style is a custom `StyleSpecification` or a URL that
     * doesn't follow the MapTiler Cloud `/maps/<id>/style.json` shape.
     */
    getStyleId(): string | undefined;
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
    addLayer(layer: (LayerSpecification & {
        source?: string | SourceSpecification;
    }) | CustomLayerInterface, beforeId?: string): this;
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
    moveLayer(id: string, beforeId?: string): this;
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
    removeLayer(id: string): this;
    /**
     * TODO document this
     */
    addMarker(markerOrMarkerConfig: Marker | MapTilerMarkerOptions): this;
    removeMarker(id: string): this;
    addMarkers(markers: (Marker | MapTilerMarkerOptions)[]): this;
    removeMarkers(markerIds?: string[]): this;
    getMarkers(): Marker[];
    getMarker(id: string): Marker | undefined;
    /**
     * Configures marker collision detection for this map.
     * @param options.proximityPadding - Distance in CSS px within which two
     *   markers count as "in proximity". Overlap always uses 0.
     * @param options.accuracy - `high` (default) tests rotated markers with
     *   their actual rotated box; `low` uses the upright box enclosing it,
     *   which is cheaper per pair but over-reports collisions for rotated
     *   markers (it never misses a real one).
     * @param options.behaviour - Default collision behaviour applied to every
     *   marker on this map (`always-show` | `hide-by-priority` |
     *   `minimize-by-priority`). A marker's own `collisionBehaviour` option
     *   overrides it. Defaults to `always-show`.
     * @param options.transitionDuration - Duration in ms of the hide/show/minimize fade. Defaults to `150`.
     * @param options.transitionEasing - CSS easing function for the fade. Defaults to `"ease"`.
     */
    setMarkerCollisionOptions(options: MarkerCollisionOptions): this;
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
    setLayerZoomRange(layerId: string, minzoom: number, maxzoom: number): this;
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
    setFilter(layerId: string, filter?: FilterSpecification | null, options?: StyleSetterOptions): this;
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
    setPaintProperty(layerId: string, name: string, value: any, options?: StyleSetterOptions): this;
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
    setLayoutProperty(layerId: string, name: string, value: any, options?: StyleSetterOptions): this;
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
    setGlyphs(glyphsUrl: string | null, options?: StyleSetterOptions): this;
    private getStyleLanguage;
    /**
     * Define the primary language of the map. Note that not all the languages shorthands provided are available.
     */
    setLanguage(language: LanguageInfo | string): void;
    /**
     * Define the primary language of the map. Note that not all the languages shorthands provided are available.
     */
    private setPrimaryLanguage;
    /**
     * Get the primary language
     * @returns
     */
    getPrimaryLanguage(): LanguageInfo;
    /**
     * Get the exaggeration factor applied to the terrain
     * @returns
     */
    getTerrainExaggeration(): number;
    /**
     * Know if terrian is enabled or not
     * @returns
     */
    hasTerrain(): boolean;
    private growTerrain;
    /**
     * Enables the 3D terrain visualization
     */
    enableTerrain(exaggeration?: number): void;
    /**
     * Disable the 3D terrain visualization
     */
    disableTerrain(): void;
    /**
     * Sets the 3D terrain exageration factor.
     * If the terrain was not enabled prior to the call of this method,
     * the method `.enableTerrain()` will be called.
     * If `animate` is `true`, the terrain transformation will be animated in the span of 1 second.
     * If `animate` is `false`, no animated transition to the newly defined exaggeration.
     */
    setTerrainExaggeration(exaggeration: number, animate?: boolean): void;
    /**
     * Perform an action when the style is ready. It could be at the moment of calling this method
     * or later.
     */
    private onStyleReady;
    fitToIpBounds(): Promise<void>;
    centerOnIpPoint(zoom: number | undefined): Promise<void>;
    getCameraHash(): string;
    /**
     * Get the SDK config object.
     * This is convenient to dispatch the SDK configuration to externally built layers
     * that do not directly have access to the SDK configuration but do have access to a Map instance.
     */
    getSdkConfig(): SdkConfig;
    /**
     * Get the MapTiler session ID. Convenient to dispatch to externaly built component
     * that do not directly have access to the SDK configuration but do have access to a Map instance.
     * @returns
     */
    getMaptilerSessionId(): string;
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
    setTransformRequest(transformRequest: RequestTransformFunction): this;
    /**
     * Gets the {@link ProjectionSpecification}.
     * @returns the projection specification.
     * @example
     * ```ts
     * let projection = map.getProjection();
     * ```
     */
    getProjection(): ProjectionSpecification;
    /**
     * Returns whether a globe-family projection is currently configured — `"globe"`,
     * `"vertical-perspective"`, or the `globeMercatorSwitchZoom` step expression this class
     * requests for `"globe"` (see {@link MapOptions.globeMercatorSwitchZoom}). This reflects the
     * configured projection, not the instantaneous rendered state — under the step expression it
     * stays `true` even after zooming past the switch threshold into flat mercator rendering.
     */
    isGlobeProjection(): boolean;
    /**
     * Sets the projection to one of {@linkcode ProjectionTypes}.
     * @param projection - the projection type to set
     * @param options - configure behaviour of the projection change
     */
    setProjection(projection: NonNullable<ProjectionTypes>, options?: ProjectionChangeOptions): this;
    /**
     * Sets the projection to one of {@linkcode ProjectionTypes}.
     * @param projection - the projection type to set, wrapped in {@link ProjectionSpecification}
     * @param options - configure behaviour of the projection change
     */
    setProjection(projection: {
        type: NonNullable<ProjectionTypes>;
    }, options?: ProjectionChangeOptions): this;
    /**
     * Sets the projection to a {@linkcode ProjectionSpecification}.
     * @param projection - the projection specification to set
     */
    setProjection(projection: maplibregl.ProjectionSpecification): this;
    /**
     * Forget the persisted projection - from both constructor option and result of any `map.setProjection(..., { persist: true })` calls.
     */
    forgetPersistedProjection(): this;
    /**
     * Returns `true` is the language was ever updated, meaning changed
     * from what is delivered in the style.
     * Returns `false` if language in use is the language from the style
     * and has never been changed.
     */
    isLanguageUpdated(): boolean;
    /**
     * Preloads all tiles within a geographic bounds across a range of zoom levels,
     * storing them in the SDK tile cache so subsequent renders are served instantly.
     *
     * @remarks
     * **API Key Usage**: This method issues one tile request per tile per active source.
     * Tile count grows exponentially with zoom level — a wide zoom range over a large
     * area can trigger thousands of requests, each counting against your MapTiler Cloud
     * API key quota. Use narrow zoom ranges and small bounds wherever possible, and
     * monitor consumption via the `onProgress` callback.
     * @experimental
     * @param {PreloadTilesForBoundsOptions} options - The options for the preload.
     * @returns A promise that resolves when the preload is complete.
     * @example
     * ```ts
     * await map.experimental_preloadTilesForBounds({
     *   bounds: map.getBounds(),
     *   minZoom: 8,
     *   maxZoom: 12,
     * });
     * ```
     */
    experimental_preloadTilesForBounds(options: PreloadTilesForBoundsOptions): Promise<void>;
    /**
     * Preloads tiles visible from each of the given camera positions, storing them
     * in the SDK tile cache so renders at those viewpoints are served instantly.
     *
     * Use this method before a planned `flyTo` or `panTo` to ensure tiles along
     * the path are ready when the animation reaches them.
     * @experimental
     * @param {PreloadTilesForCameraPositionsOptions} options - The options for the preload.
     * @returns A promise that resolves when the preload is complete.
     * @remarks
     * **API Key Usage**: Each position triggers one request per visible tile per
     * active source. More positions at higher zoom levels significantly increase
     * API usage, each request counting against your MapTiler Cloud API key quota.
     *
     * @example
     * ```ts
     * await map.preloadTilesForCameraPositions({
     *   positions: [
     *     { lng: -74.006, lat: 40.7128, zoom: 12 },
     *     { lng: -73.935, lat: 40.730,  zoom: 14 },
     *   ],
     *   onProgress: (done, total, tileID) => console.log(tileID),
     * });
     * ```
     */
    experimental_preloadTilesForCameraPositions(options: PreloadTilesForCameraPositionsOptions): Promise<void>;
    /**
     * Preloads a specific set of tiles identified by their `"z/x/y"` tile IDs,
     * storing them in the SDK tile cache.
     *
     * @experimental
     * @param {PreloadTilesOptions} options - The options for the preload.
     * @returns A promise that resolves when the preload is complete.
     * @remarks
     * **API Key Usage**: Each tile ID results in one request per active source,
     * counting against your MapTiler Cloud API key quota.
     *
     * @example
     * ```ts
     * await map.preloadTiles({
     *   tileIDs: ["12/1205/1540", "12/1206/1540"],
     *   onError: (err) => console.error(err),
     * });
     * ```
     */
    experimental_preloadTiles(options: PreloadTilesOptions): Promise<void>;
    /**
     * Changes any combination of center, zoom, bearing, and pitch, animating the
     * transition along a curve that evokes flight. The animation seamlessly incorporates
     * zooming and panning to help the user maintain her bearings even after traversing
     * a great distance.
     *
     * If `options.experimental_preload` is provided, tiles along the flight path are fetched and
     * cached before the animation begins so they are ready when rendered.
     *
     * @remarks
     * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for positions
     * sampled along the flight path. These count against your MapTiler Cloud API key quota.
     */
    flyTo(options: WithTilePreload<FlyToOptions>, eventData?: object): this;
    /**
     * Pans the map to the specified location with an animated transition.
     *
     * If `options.experimental_preload` is provided, tiles along the pan path are fetched and
     * cached before the animation begins.
     *
     * @remarks
     * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for positions
     * sampled along the pan path. These count against your MapTiler Cloud API key quota.
     */
    panTo(lnglat: LngLatLike, options?: WithTilePreload<AnimationOptions & {
        pitch?: number;
    }>, eventData?: object): this;
    /**
     * Changes any combination of center, zoom, bearing, pitch, and roll, with an
     * animated transition between old and new values.
     *
     * If `options.experimental_preload` is provided, tiles along the ease path are fetched and
     * cached before the animation begins.
     *
     * @remarks
     * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for positions
     * sampled along the ease path. These count against your MapTiler Cloud API key quota.
     */
    easeTo(options: WithTilePreload<EaseToOptions>, eventData?: object): this;
    /**
     * Pans and zooms the map to contain its visible area within the specified
     * geographical bounds. This function will also reset the map's bearing to 0
     * if options.bearing is not specified.
     *
     * If `options.experimental_preload` is provided, tiles for the target view are fetched and
     * cached before the animation begins.
     *
     * @remarks
     * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for the
     * destination viewport. These count against your MapTiler Cloud API key quota.
     */
    fitBounds(bounds: LngLatBoundsLike, options?: WithTilePreload<FitBoundsOptions>, eventData?: object): this;
    /**
     * Zooms the map to the specified zoom level, with an animated transition.
     *
     * If `options.experimental_preload` is provided, tiles for the target zoom level are fetched
     * and cached before the animation begins.
     *
     * @remarks
     * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for the
     * target zoom. These count against your MapTiler Cloud API key quota.
     */
    zoomTo(zoom: number, options?: WithTilePreload<AnimationOptions> | null, eventData?: object): this;
    /**
     * Returns the map's current camera state as a {@link CameraPosition}.
     */
    private currentCameraPosition;
    /**
     * Resolves camera method options into a {@link CameraPosition}, filling in
     * current map state for any properties not specified in the options.
     */
    private resolveCameraPosition;
}
