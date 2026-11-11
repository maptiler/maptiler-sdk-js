import type {
  CustomLayerInterface,
  ExpressionSpecification,
  FilterSpecification,
  GeoJSONSource,
  GeoJSONSourceSpecification,
  LayerSpecification,
  Map as MapLibreMap,
  MapLayerMouseEvent,
  MapSourceDataEvent,
} from "maplibre-gl";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type { AllLayoutProperties, AllPaintProperties } from "@maplibre/maplibre-gl-style-spec";
import { v4 as uuidv4 } from "uuid";
import type { Map as SDKMap } from "../Map";
import { config } from "../config";
import { isUUID } from "../tools";
import { findSublayerOwner, registerDataLayer, unregisterDataLayer } from "./registry";
import { fadeAtZoomEdges, usesZoom } from "./style";

//#region Types

/** GeoJSON data, a URL to GeoJSON, or the UUID of a MapTiler Cloud dataset. */
export type DataLayerData = FeatureCollection | Feature | Geometry | string;

/** Any data layer, whatever its style and mode. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the class is invariant in both, and only the source is shared
export type AnyDataLayer = DataLayer<any, any>;

/** Data shared by layers drawing the same source — see {@link DataLayerConstructorOptions.data}. */
type SharedData = {
  sourceId: string;
  data: DataLayerData;
  /**
   * The layers drawing the source on a map — joined when added, left when
   * removed (or their map is). A layer off its map keeps the shared data, and
   * draws it again once added back.
   */
  layers: Set<AnyDataLayer>;
};

/** Options shared by every data layer's constructor. */
export type DataLayerConstructorOptions<TStyle extends object> = {
  /** Layer id. Auto-generated when omitted. */
  id?: string;
  /**
   * GeoJSON data, a URL to GeoJSON, or the UUID of a MapTiler Cloud dataset —
   * or another data layer, to draw its data from the same source. Layers
   * sharing a source share their data: `setData()` on either updates both,
   * on whichever maps they're on (each map loads its own copy), and both fire
   * the data events. The source stays on the map while any of
   * them does.
   *
   * On one map, a clustered layer can't draw a source with other layers, as
   * clustering changes the source: a layer can't be made from one that
   * clusters, nor cluster while another layer draws its source on its map,
   * and `map.addLayer` throws for a layer that would break this.
   */
  data: DataLayerData | AnyDataLayer;
  /** Initial style. Unset fields use the layer's defaults. */
  style?: TStyle;
  /** Initial visibility. Defaults to `true`. */
  visible?: boolean;
  /** Zoom level from which the layer shows. Defaults to `0`. */
  minzoom?: number;
  /** Zoom level from which the layer no longer shows. Defaults to `24`. */
  maxzoom?: number;
  /**
   * Zoom span over which the layer fades in after `minzoom` and out before
   * `maxzoom` — not at zoom `0` or `24`, the map's own limits. Defaults to
   * `0.25`, and `0` turns it off. Two layers whose zoom
   * ranges overlap by the fade cross-fade. An opacity zoom ramp or a
   * zoom-dependent opacity expression of the layer's own replaces the fade.
   */
  fade?: number;
};

/** Pointer events forwarded from the layer's sublayers. */
export type DataLayerMouseEventType = "click" | "mouseenter" | "mouseleave" | "mousemove";

/** The style type of a data layer. */
type StyleOf<TTarget> = TTarget extends { getStyle(): infer TStyle } ? TStyle : Record<string, unknown>;

/**
 * Event payloads keyed by event type. `TTarget` is the layer firing them.
 *
 * The change events (`stylechange`, `zoomrangechange`, `visibilitychange`)
 * fire once the change shows on the map — at the next animation frame, once
 * for all the changes made since — and not for changes made while the layer
 * isn't on a map.
 */
export type DataLayerEventMap<TTarget> = Record<DataLayerMouseEventType, MapLayerMouseEvent> & {
  /** The source started loading data. */
  dataloading: { type: "dataloading"; target: TTarget };
  /** The source finished loading data. */
  data: { type: "data"; target: TTarget };
  /** The source failed to load data. */
  error: { type: "error"; target: TTarget; error: Error };
  /** The style was applied. `keys` are the keys set since the last `stylechange`, `style` the style now in effect. */
  stylechange: { type: "stylechange"; target: TTarget; keys: (keyof StyleOf<TTarget>)[]; style: StyleOf<TTarget> };
  /** A different zoom range or fade was applied. */
  zoomrangechange: { type: "zoomrangechange"; target: TTarget; minzoom: number; maxzoom: number; fade: number };
  /** The layer was shown or hidden. */
  visibilitychange: { type: "visibilitychange"; target: TTarget; visible: boolean };
  /** The layer was moved in the map's layer order with `map.moveLayer`, which moves its sublayers too. `beforeId` is as passed to it. */
  move: { type: "move"; target: TTarget; beforeId: string | undefined };
  /** The layer was added to a map — not when it re-adds itself after `map.setStyle()`. */
  add: { type: "add"; target: TTarget; map: SDKMap };
  /** The layer was removed from its map, or the map was removed. */
  remove: { type: "remove"; target: TTarget; map: SDKMap };
};

export type DataLayerEventType = keyof DataLayerEventMap<unknown>;

export type DataLayerEventListener<T extends DataLayerEventType, TTarget> = (event: DataLayerEventMap<TTarget>[T]) => void;

/** What changed since the last flush — see {@link DataLayer.flushUpdates}. */
type PendingDataLayerUpdates<TStyle> = {
  data: boolean;
  visibility: boolean;
  zoomRange: boolean;
  style: Set<keyof TStyle>;
  rebuild: boolean;
};

/** A style layer managed by a data layer. Its zoom range and visibility are owned by the data layer, and applied on top. */
export type SublayerSpecification = Exclude<LayerSpecification, { type: "background" }>;

/** A map listener bound by the layer — `layerIds` set for layer-delegated pointer listeners. */
type BoundMapListener = { type: string; layerIds?: string[]; listener: (event: never) => void };

const MOUSE_EVENT_TYPES: readonly DataLayerMouseEventType[] = ["click", "mouseenter", "mouseleave", "mousemove"];

const DEFAULT_FADE = 0.25;

//#endregion

/**
 * Base class for stateful data layers (`PointLayer`, …). Added to the map as a
 * custom layer (`map.addLayer(layer, beforeId)`) that acts as a controller: it
 * renders nothing itself, and manages a GeoJSON source plus ordinary style
 * layers ("sublayers") placed directly beneath it.
 *
 * Setters update the layer's state immediately and are applied to the map
 * once per animation frame, through the cheapest path available (source data,
 * paint/layout properties, or a full sublayer rebuild).
 *
 * The layer survives `map.setStyle()`: it rebuilds its source and sublayers on
 * `style.load`, from its own state. A new style may share none of the old
 * one's layer ids, so where it goes is decided in two steps (see
 * `prepareDataLayersForStyleChange` in `registry.ts`):
 * - it goes back beneath the layer it sat beneath if the new style has a layer
 *   with that id — a best-effort hint, as between variants of one style — else
 *   on top;
 * - then the map's data layers are put back in their previous order among
 *   themselves, which wins over the hint.
 */
export abstract class DataLayer<TStyle extends object, TMode extends string> implements CustomLayerInterface {
  readonly id: string;
  readonly type = "custom";
  readonly mode: TMode;

  //#region State

  protected map: SDKMap | null = null;

  /** Data as passed by the user — {@link getData} returns it unchanged — shared with the layers drawing the same source. */
  private readonly shared: SharedData;

  /** Style as set by the user, without defaults — see {@link getStyle} for the resolved values. */
  protected style: TStyle;

  protected visible: boolean;
  protected minzoom: number;
  protected maxzoom: number;
  protected fade: number;

  /** Whether the user set the fade, so is told when an opacity of their own replaces it. */
  private isFadeSet: boolean;
  private hasWarnedFadeReplaced = false;

  /**
   * Layer the controller sat beneath when last added or moved by the user, or
   * just before the last `map.setStyle()`. Only a hint for where to put itself
   * back on the new style — used if a layer with this id is in it. Putting
   * itself back doesn't update it, so a hint missing from one style still
   * applies to a later style that has it.
   */
  private beforeId: string | undefined;

  /** Display state as the last change events reported it, so applying an unchanged value fires nothing. */
  private notified = { visible: true, minzoom: 0, maxzoom: 24, fade: DEFAULT_FADE };

  /**
   * Style keys set while on a map and not yet reported by a `stylechange`.
   * Kept apart from `pending.style`, which only says what's left to apply —
   * a rebuild, such as the one after `map.setStyle()`, applies and clears it
   * before the flush that reports it.
   */
  private readonly unreportedStyleKeys = new Set<keyof TStyle>();

  /** True while the layer puts itself back after `map.setStyle()` — no `add` or `move` then, as nothing changed for the user. */
  private isRestoring = false;

  private pending: PendingDataLayerUpdates<TStyle> = createPendingUpdates();
  private animationFrameID: number | null = null;

  /** Between a `dataloading` and its `data` (or `error`), so each load fires one of each. */
  private isLoadingData = false;

  /** True while {@link onAdd} runs — data events raised then are held back, see {@link emitDataEvent}. */
  private isAdding = false;

  /** Data events held back until the `addLayer` call that raised them has returned — `null` when not holding. */
  private heldDataEvents: (() => void)[] | null = null;

  /** Listeners by event type — typed loosely, as one typed by `this` would tie the base class to each subclass, and layers sharing a source must be one type. */
  private readonly listeners = new Map<DataLayerEventType, Set<(event: never) => void>>();

  /** Map-level listeners currently bound, kept so they can be detached — layer-delegated ones are rebound on every rebuild, as sublayer ids may change. */
  private readonly boundMapListeners: BoundMapListener[] = [];

  /** Specs of the sublayers added by the last build (or last {@link syncSublayers}), bottom first, without the {@link geometryFilter}. */
  private sublayerSpecs: SublayerSpecification[] = [];

  /**
   * Filter combined with every sublayer's own, to keep only the geometry
   * types the layer draws — circle and heatmap layers otherwise draw every
   * vertex of a line or polygon. Unset, every feature reaches the sublayers.
   * Sublayer filters combined with it must use expression syntax, not the legacy filter syntax.
   */
  protected readonly geometryFilter?: ExpressionSpecification;

  //#endregion

  //#region Constructor

  /**
   * @param idPrefix - Prefix for the auto-generated id, e.g. `"maptiler-point-layer"`.
   * @param mode - Rendering mode, fixed for the layer's lifetime.
   * @param options - Data, style and display options.
   */
  protected constructor(idPrefix: string, mode: TMode, options: DataLayerConstructorOptions<TStyle>) {
    this.id = options.id ?? `${idPrefix}-${uuidv4()}`;
    this.mode = mode;
    if (options.data instanceof DataLayer) {
      if (!options.data.canShareSource()) throw new Error(`${this.id}: "${options.data.id}" can't share its source, as it clusters.`);
      this.shared = options.data.shared;
    } else {
      this.shared = { sourceId: `${this.id}-source`, data: options.data, layers: new Set() };
    }
    this.style = {} as TStyle;
    if (options.style) this.setStyle(options.style);
    this.visible = options.visible ?? true;
    this.minzoom = options.minzoom ?? 0;
    this.maxzoom = options.maxzoom ?? 24;
    this.fade = options.fade ?? DEFAULT_FADE;
    this.isFadeSet = options.fade !== undefined;
  }

  //#endregion

  //#region Subclass Hooks

  /** Adds the sublayers. The source already exists; each layer must be added via {@link addSublayer}. */
  protected abstract addSublayers(map: SDKMap): void;

  /**
   * Applies changed style keys to the live sublayers.
   * @returns `false` when the change needs a full rebuild (e.g. a sublayer added or removed), `true` when applied in place.
   */
  protected abstract applyStyle(changed: Set<keyof TStyle>): boolean;

  /** The style with every default filled in. */
  protected abstract resolveStyle(): TStyle;

  /**
   * Re-applies anything that depends on the zoom range beyond the sublayers'
   * own min/max zoom (which the base updates).
   * @returns `false` when that needs a full rebuild.
   */
  protected onZoomRangeChange(): boolean {
    return true;
  }

  /**
   * Whether a style key has no default, so {@link setStyle} won't reset it.
   * Unset, every key can be reset. Called from the constructor, so it can't rely on the subclass's fields.
   */
  protected isRequiredStyleKey?(key: keyof TStyle): boolean;

  /** Whether other layers can draw this layer's source — not when its source is set up for this layer alone, such as clustered. */
  protected canShareSource(): boolean {
    return true;
  }

  /** Whether other layers draw this layer's source on its map, so the source can't change to suit this one. `false` while the layer is off its map — {@link assertCanBeAddedTo} checks again when it's added. */
  protected isSharingSource(): boolean {
    const map = this.map;
    return map !== null && this.isSourceDrawnByOthers(map);
  }

  /** Source specification. Override to add clustering etc. — changing what this returns needs a {@link requestRebuild}. */
  protected getSourceSpecification(): GeoJSONSourceSpecification {
    return { type: "geojson", data: this.resolveSourceData() };
  }

  //#endregion

  //#region CustomLayerInterface

  /**
   * Called by `map.addLayer` before adding the layer, so a layer that can't
   * go on `map` is refused before MapLibre adds anything: on one map, a
   * clustered layer can't draw a source with other layers.
   * @internal
   */
  assertCanBeAddedTo(map: object): void {
    const others = [...this.shared.layers].filter((layer) => layer !== this && layer.map === map);
    if (others.length === 0) return;

    if (!this.canShareSource()) {
      throw new Error(`${this.id}: can't be added while "${others[0].id}" draws its source on this map, as it clusters.`);
    }
    const clustered = others.find((layer) => !layer.canShareSource());
    if (clustered) {
      throw new Error(`${this.id}: can't be added while "${clustered.id}" clusters its source on this map.`);
    }
  }

  onAdd(map: MapLibreMap): void {
    const sdkMap = map as SDKMap;
    this.map = sdkMap;
    this.shared.layers.add(this);
    // putting itself back after map.setStyle keeps the hint it had — wherever it lands now is no position of the user's
    if (!this.isRestoring) this.rememberPosition();
    registerDataLayer(sdkMap, this.id, {
      getSublayerIds: () => this.getSublayerIds(),
      onMove: (beforeId) => {
        this.onMove(beforeId);
      },
      rememberPosition: () => {
        this.rememberPosition();
      },
      restoreBeneath: (beforeId) => {
        this.restoreBeneath(beforeId);
      },
    });

    this.isAdding = true;
    try {
      this.bindMapListeners();
      this.build();
    } finally {
      this.isAdding = false;
    }

    // changes made before now are part of the add, not changes of their own — but putting itself back after
    // map.setStyle isn't an add, so changes made since the last flush are still reported by the next one
    if (!this.isRestoring) {
      this.notified = { visible: this.visible, minzoom: this.minzoom, maxzoom: this.maxzoom, fade: this.fade };
      this.unreportedStyleKeys.clear();
      this.fire("add", { type: "add", target: this, map: sdkMap });
    }
  }

  /** Only called when the user removes the layer — `map.setStyle()` never removes custom layers by diffing, and a full rebuild drops them without calling this. */
  onRemove(): void {
    const map = this.map;
    this.cancelFlush();
    this.heldDataEvents = null;
    this.unreportedStyleKeys.clear();
    this.teardown();
    this.unbindMapListeners();
    this.map = null;
    this.shared.layers.delete(this);
    if (map) {
      unregisterDataLayer(map, this.id);
      this.fire("remove", { type: "remove", target: this, map });
    }
  }

  render(): void {
    // the controller draws nothing — its sublayers do the rendering
  }

  //#endregion

  //#region Data

  /** Replaces the layer's data — and that of the layers sharing its source. */
  setData(data: DataLayerData): this {
    this.shared.data = data;
    // every layer on a map is told — so the data still arrives if one is removed before its frame, and on each map
    // the layers sharing the source are on. The first to flush on each map applies it for the rest there (see markDataApplied).
    for (const layer of this.shared.layers) {
      if (!layer.map) continue;
      layer.pending.data = true;
      layer.scheduleFlush();
    }
    return this;
  }

  /** Returns the data as it was passed in — a URL or UUID is not resolved. Layers sharing a source return the same data. */
  getData(): DataLayerData {
    return this.shared.data;
  }

  /** Id of the GeoJSON source backing the layer — the first layer's, for layers sharing a source. */
  getSourceId(): string {
    return this.shared.sourceId;
  }

  /** Ids of the style layers currently managed by this layer, bottom first. Empty until added to a map. */
  getSublayerIds(): string[] {
    return this.sublayerSpecs.map((spec) => spec.id);
  }

  //#endregion

  //#region Style

  /**
   * Shallow-merges `style` into the current style. A key set to
   * `undefined` resets that property to its default — except a required
   * one, which has no default, so it keeps its value.
   */
  setStyle(style: Partial<TStyle>): this {
    for (const key of Object.keys(style) as (keyof TStyle)[]) {
      if (style[key] === undefined) {
        if (this.isRequiredStyleKey?.(key)) {
          console.warn(`"${String(key)}" is required and can't be reset, so it keeps its value.`);
          continue;
        }
        Reflect.deleteProperty(this.style, key);
      } else {
        this.style[key] = style[key] as TStyle[keyof TStyle];
      }
      this.pending.style.add(key);
      // changes made before the layer is added are part of the add, so fire nothing
      if (this.map) this.unreportedStyleKeys.add(key);
    }
    this.scheduleFlush();
    return this;
  }

  /** Returns the style in effect, with defaults filled in. */
  getStyle(): TStyle {
    return this.resolveStyle();
  }

  //#endregion

  //#region Display

  setVisible(visible: boolean): this {
    this.visible = visible;
    this.pending.visibility = true;
    this.scheduleFlush();
    return this;
  }

  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Sets the zoom range the layer shows in.
   * @param fade - Zoom span to fade in and out over at the range's edges — see {@link DataLayerConstructorOptions.fade}. Unchanged when omitted.
   */
  setZoomRange(minzoom: number, maxzoom: number, fade?: number): this {
    this.minzoom = minzoom;
    this.maxzoom = maxzoom;
    if (fade !== undefined) {
      this.fade = fade;
      this.isFadeSet = true;
    }
    this.pending.zoomRange = true;
    this.scheduleFlush();
    return this;
  }

  getZoomRange(): [number, number] {
    return [this.minzoom, this.maxzoom];
  }

  /** Zoom span the layer fades in and out over at the edges of its zoom range. */
  getFade(): number {
    return this.fade;
  }

  //#endregion

  //#region Events

  on<T extends DataLayerEventType>(type: T, listener: DataLayerEventListener<T, this>): this {
    let typeListeners = this.listeners.get(type);
    if (!typeListeners) {
      typeListeners = new Set();
      this.listeners.set(type, typeListeners);
    }
    typeListeners.add(listener);
    return this;
  }

  off<T extends DataLayerEventType>(type: T, listener: DataLayerEventListener<T, this>): this {
    this.listeners.get(type)?.delete(listener);
    return this;
  }

  protected fire<T extends DataLayerEventType>(type: T, event: DataLayerEventMap<this>[T]): void {
    const typeListeners = this.listeners.get(type);
    if (!typeListeners) return;
    for (const listener of [...typeListeners]) (listener as DataLayerEventListener<T, this>)(event);
  }

  //#endregion

  //#region Build

  /** Queues a full rebuild of the source and sublayers for the next flush. */
  protected requestRebuild(): void {
    this.pending.rebuild = true;
    this.scheduleFlush();
  }

  /**
   * Adds a sublayer directly beneath the controller, with the shared
   * visibility and zoom range applied.
   */
  protected addSublayer(map: SDKMap, layer: SublayerSpecification): void {
    // listed first, so the map knows it for ours and places it straight beneath the controller
    this.sublayerSpecs.push(layer);
    try {
      map.addLayer(
        {
          ...layer,
          ...this.withGeometryFilter(layer.filter),
          minzoom: this.minzoom,
          maxzoom: this.maxzoom,
          layout: { ...layer.layout, visibility: this.visible ? "visible" : "none" },
        } as LayerSpecification,
        this.id,
      );
    } catch (error) {
      this.sublayerSpecs.pop();
      throw error;
    }
  }

  /**
   * Brings the live sublayers in line with `next` through paint, layout and
   * filter updates only — the cheap path for style changes.
   * @param next - The sublayer specs as {@link addSublayers} would build them now.
   * @returns `false` when the sublayers themselves differ (added, removed or retyped), which needs a rebuild.
   */
  protected syncSublayers(next: SublayerSpecification[]): boolean {
    const map = this.map;
    if (!map) return true;

    const prev = this.sublayerSpecs;
    if (prev.length !== next.length || prev.some((prevSpec, i) => prevSpec.id !== next[i].id || prevSpec.type !== next[i].type)) return false;

    next.forEach((nextSpec, i) => {
      const prevSpec = prev[i];

      forEachChangedKey(prevSpec.paint, nextSpec.paint, (key, value) => {
        map.setPaintProperty(nextSpec.id, key as keyof AllPaintProperties, value as AllPaintProperties[keyof AllPaintProperties]);
      });
      forEachChangedKey(prevSpec.layout, nextSpec.layout, (key, value) => {
        map.setLayoutProperty(nextSpec.id, key as keyof AllLayoutProperties, value as AllLayoutProperties[keyof AllLayoutProperties]);
      });
      if (!isEqualValue(prevSpec.filter, nextSpec.filter)) map.setFilter(nextSpec.id, this.withGeometryFilter(nextSpec.filter).filter ?? null);
    });

    this.sublayerSpecs = next;
    return true;
  }

  /**
   * `opacity` with the layer's fade at the edges of its zoom range. An opacity
   * that already reads the zoom can't be nested in it, so is kept as is,
   * replacing the fade.
   */
  // an arrow, so renderers can be handed it
  protected readonly fadeOpacity = (opacity: number | ExpressionSpecification): number | ExpressionSpecification => {
    if (!usesZoom(opacity)) return fadeAtZoomEdges(opacity, this.minzoom, this.maxzoom, this.fade);

    if (this.isFadeSet && this.fade > 0 && !this.hasWarnedFadeReplaced) {
      this.hasWarnedFadeReplaced = true;
      console.warn(`${this.id}: the opacity depends on the zoom, so it replaces the layer's fade.`);
    }
    return opacity;
  };

  /** Whether another layer sharing the source is on `map`, so still draws it. */
  private isSourceDrawnByOthers(map: SDKMap): boolean {
    return [...this.shared.layers].some((layer) => layer !== this && layer.map === map && map.getLayer(layer.id) !== undefined);
  }

  /** A sublayer's `filter` combined with the {@link geometryFilter} — as an object to spread, so an unfiltered sublayer of an unfiltered layer gets no `filter` key. */
  private withGeometryFilter(filter: FilterSpecification | undefined): { filter?: FilterSpecification } {
    const geometryFilter = this.geometryFilter;
    if (!geometryFilter) return filter ? { filter } : {};
    return { filter: filter ? ["all", geometryFilter, filter as ExpressionSpecification] : geometryFilter };
  }

  /** The data to hand to the source — a UUID becomes its MapTiler Cloud dataset URL. */
  protected resolveSourceData(): GeoJSONSourceSpecification["data"] {
    const { data } = this.shared;
    if (typeof data === "string" && isUUID(data)) {
      return `${config.apiURL}data/${data}/features.json?key=${config.apiKey}`;
    }
    return data as GeoJSONSourceSpecification["data"];
  }

  /**
   * (Re)creates the source and sublayers from the current state. Idempotent — leftovers from a previous build are removed first.
   * @returns Whether the source was added with the current data — `false` when a layer sharing it kept it on the map, with whatever data it held.
   */
  private build(): boolean {
    const map = this.map;
    if (!map) return false;

    this.unbindLayerListeners();
    this.teardown();

    // a layer sharing the source may have added it already, or kept it through teardown
    const addSource = !map.getSource(this.getSourceId());
    if (addSource) map.addSource(this.getSourceId(), this.getSourceSpecification());
    this.addSublayers(map);
    this.bindLayerListeners();

    // everything pending is reflected in a fresh build — but for the data of a source kept for the layers sharing it, see flushUpdates
    this.pending = createPendingUpdates();
    return addSource;
  }

  /** Hands the current data to the live source — one `setData` updates every layer drawing it on `map`. */
  private updateSourceData(map: SDKMap): void {
    void map.getSource<GeoJSONSource>(this.getSourceId())?.setData(this.resolveSourceData());
  }

  /**
   * The source on `map` now holds the current data, so the other layers
   * drawing it there have none left to apply — see {@link setData}. Layers
   * sharing the source on other maps still apply it to theirs.
   */
  private markDataApplied(map: SDKMap): void {
    for (const layer of this.shared.layers) {
      if (layer !== this && layer.map === map) layer.pending.data = false;
    }
  }

  /** Removes the sublayers and source, whichever of them exist. */
  private teardown(): void {
    const map = this.map;
    if (!map) return;

    for (const layerId of this.getSublayerIds()) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    }
    this.sublayerSpecs = [];
    if (map.getSource(this.getSourceId()) && !this.isSourceDrawnByOthers(map)) map.removeSource(this.getSourceId());
    // a load in flight is abandoned with its source
    this.isLoadingData = false;
  }

  /**
   * `map.setStyle()` wipes the source and sublayers. A diffed style keeps the
   * controller (custom layers aren't part of the diff), but wherever the diff
   * left it — usually near the bottom, under the new style's fills — so it's
   * moved back first, then only the sublayers need rebuilding. A full rebuild
   * (what the SDK does for any style given by URL or `MapStyle`) drops the
   * controller too, so it re-adds itself — and `onAdd` builds the rest.
   *
   * Either way it goes beneath its {@link beforeId} hint if the new style has a
   * layer with that id, else on top. The map then puts its data layers back in
   * their previous order among themselves, once they've all put themselves
   * back — see `prepareDataLayersForStyleChange` in `registry.ts`.
   */
  private readonly onStyleLoad = (): void => {
    const map = this.map;
    if (!map) return;

    const beforeId = this.beforeId && map.getLayer(this.beforeId) ? this.beforeId : undefined;

    this.restore(() => {
      if (map.getLayer(this.id)) {
        map.moveLayer(this.id, beforeId);
        this.build();
        return;
      }

      // detach first — onAdd rebinds everything
      this.unbindMapListeners();
      map.addLayer(this, beforeId);
    });
  };

  /** Called by the map to put its data layers back in order after `map.setStyle()` — moves the layer and its sublayers beneath `beforeId`, without a `move` event. */
  private restoreBeneath(beforeId: string): void {
    const map = this.map;
    if (!map) return;
    this.restore(() => map.moveLayer(this.id, beforeId));
  }

  /** Runs `restore` as part of putting the layer back after `map.setStyle()`, which fires no `add` or `move` and keeps the {@link beforeId} hint. */
  private restore(restore: () => void): void {
    this.isRestoring = true;
    try {
      restore();
    } finally {
      this.isRestoring = false;
    }
  }

  /** Notes the layer the controller now sits beneath — a data layer's id rather than one of its sublayers, which a map style change rebuilds. */
  private rememberPosition(): void {
    const map = this.map;
    if (!map) return;
    const order = map.getLayersOrder();
    const above = order.at(order.indexOf(this.id) + 1);
    this.beforeId = above === undefined ? undefined : (findSublayerOwner(map, above) ?? above);
  }

  /** Called by the map once `map.moveLayer` has moved the controller and its sublayers. */
  private onMove(beforeId: string | undefined): void {
    // putting itself back after map.setStyle isn't a move — and the remembered position must survive it
    if (this.isRestoring) return;
    this.rememberPosition();
    this.fire("move", { type: "move", target: this, beforeId });
  }

  //#endregion

  //#region Flush

  private scheduleFlush(): void {
    // nothing to apply until added — onAdd builds from the current state
    if (!this.map || this.animationFrameID !== null) return;
    this.animationFrameID = requestAnimationFrame(() => {
      this.animationFrameID = null;
      this.flushUpdates();
    });
  }

  private cancelFlush(): void {
    if (this.animationFrameID === null) return;
    cancelAnimationFrame(this.animationFrameID);
    this.animationFrameID = null;
  }

  /** Applies everything changed since the last flush, through the cheapest path for each change. */
  private flushUpdates(): void {
    const map = this.map;
    if (!map) return;

    const pending = this.pending;
    this.pending = createPendingUpdates();

    const needsRebuild = pending.rebuild || (pending.style.size > 0 && !this.applyStyle(pending.style)) || (pending.zoomRange && !this.onZoomRangeChange());

    if (needsRebuild) {
      const sourceAdded = this.build();
      // a source kept on the map for the layers sharing it still holds the old data — a re-added one already has the new
      if (pending.data && !sourceAdded) this.updateSourceData(map);
      if (pending.data || sourceAdded) this.markDataApplied(map);
    } else {
      if (pending.data) {
        this.updateSourceData(map);
        this.markDataApplied(map);
      }

      for (const layerId of this.getSublayerIds()) {
        if (!map.getLayer(layerId)) continue;
        if (pending.visibility) map.setLayoutProperty(layerId, "visibility", this.visible ? "visible" : "none");
        if (pending.zoomRange) map.setLayerZoomRange(layerId, this.minzoom, this.maxzoom);
      }
    }

    this.fireChangeEvents();
  }

  /**
   * Reports what's been applied since the last report — style whenever keys
   * were set, display state only when it differs from what was last reported.
   * Reads its own bookkeeping rather than the flush's pending updates, so
   * changes applied by a rebuild in between (after `map.setStyle()`) are
   * still reported.
   */
  private fireChangeEvents(): void {
    if (this.unreportedStyleKeys.size > 0) {
      const keys = [...this.unreportedStyleKeys];
      this.unreportedStyleKeys.clear();
      this.fire("stylechange", {
        type: "stylechange",
        target: this,
        keys,
        style: this.getStyle(),
      } as unknown as DataLayerEventMap<this>["stylechange"]);
    }

    const { minzoom, maxzoom, fade, visible } = this;
    const notified = this.notified;

    if (minzoom !== notified.minzoom || maxzoom !== notified.maxzoom || fade !== notified.fade) {
      this.notified = { ...this.notified, minzoom, maxzoom, fade };
      this.fire("zoomrangechange", { type: "zoomrangechange", target: this, minzoom, maxzoom, fade });
    }

    if (visible !== notified.visible) {
      this.notified = { ...this.notified, visible };
      this.fire("visibilitychange", { type: "visibilitychange", target: this, visible });
    }
  }

  //#endregion

  //#region Map Listeners

  /** Binds the listeners that live for as long as the layer is on the map. */
  private bindMapListeners(): void {
    const map = this.map;
    if (!map) return;

    const onDataLoading = (event: MapSourceDataEvent) => {
      // tiles fire `sourcedataloading` too — only the source's own load counts
      if (event.sourceId !== this.getSourceId() || event.tile || this.isLoadingData) return;
      this.isLoadingData = true;
      this.emitDataEvent(() => {
        this.fire("dataloading", { type: "dataloading", target: this });
      });
    };

    const onData = (event: MapSourceDataEvent) => {
      // the metadata event reports loaded before the tiles have reloaded — wait for the content or the last tile
      if (event.sourceId !== this.getSourceId() || !this.isLoadingData || !event.isSourceLoaded || event.sourceDataType === "metadata") return;
      this.isLoadingData = false;
      this.emitDataEvent(() => {
        this.fire("data", { type: "data", target: this });
      });
    };

    const onError = (event: { error: Error; sourceId?: string }) => {
      if (event.sourceId !== this.getSourceId()) return;
      this.isLoadingData = false;
      this.emitDataEvent(() => {
        this.fire("error", { type: "error", target: this, error: event.error });
      });
    };

    // the map is going away — nothing to tear down, just stop touching it
    const onMapRemove = () => {
      this.cancelFlush();
      this.heldDataEvents = null;
      this.unreportedStyleKeys.clear();
      this.boundMapListeners.length = 0;
      this.sublayerSpecs = [];
      this.map = null;
      this.shared.layers.delete(this);
      unregisterDataLayer(map, this.id);
      this.fire("remove", { type: "remove", target: this, map });
    };

    this.bindMapListener("style.load", this.onStyleLoad);
    this.bindMapListener("remove", onMapRemove);
    this.bindMapListener("sourcedataloading", onDataLoading);
    this.bindMapListener("sourcedata", onData);
    this.bindMapListener("error", onError);
  }

  /**
   * Fires a data event, unless it's raised inside `addLayer`: MapLibre starts
   * the source's first load synchronously, before a listener attached straight
   * after `addLayer` exists. That event, and any that follow it, are then held
   * until the next microtask, keeping their order.
   */
  private emitDataEvent(fire: () => void): void {
    if (this.isAdding && !this.heldDataEvents) {
      const held: (() => void)[] = [];
      this.heldDataEvents = held;
      queueMicrotask(() => {
        // dropped if the layer or map was removed in the meantime
        if (this.heldDataEvents !== held) return;
        this.heldDataEvents = null;
        for (const fireHeld of held) fireHeld();
      });
    }

    if (this.heldDataEvents) {
      this.heldDataEvents.push(fire);
    } else {
      fire();
    }
  }

  /** Forwards pointer events on the current sublayers. */
  private bindLayerListeners(): void {
    const map = this.map;
    if (!map) return;

    const layerIds = this.getSublayerIds();
    if (layerIds.length === 0) return;
    for (const type of MOUSE_EVENT_TYPES) {
      const listener = (event: MapLayerMouseEvent) => {
        this.fire(type, event);
      };
      map.on(type, layerIds, listener);
      this.boundMapListeners.push({ type, layerIds, listener });
    }
  }

  private bindMapListener<T>(type: string, listener: (event: T) => void): void {
    (this.map as unknown as { on(type: string, listener: (event: T) => void): void }).on(type, listener);
    this.boundMapListeners.push({ type, listener });
  }

  private unbindLayerListeners(): void {
    this.unbind((entry) => entry.layerIds !== undefined);
  }

  private unbindMapListeners(): void {
    this.unbind(() => true);
  }

  private unbind(predicate: (entry: BoundMapListener) => boolean): void {
    const map = this.map as unknown as { off(type: string, layerIdsOrListener: unknown, listener?: unknown): void } | null;

    for (let i = this.boundMapListeners.length - 1; i >= 0; i--) {
      const entry = this.boundMapListeners[i];
      if (!predicate(entry)) continue;

      if (entry.layerIds) {
        map?.off(entry.type, entry.layerIds, entry.listener);
      } else {
        map?.off(entry.type, entry.listener);
      }
      this.boundMapListeners.splice(i, 1);
    }
  }

  //#endregion
}

/** Calls `apply` for every key whose value differs between two paint/layout objects — removed keys get `undefined`, which resets them. */
function forEachChangedKey(before: object | undefined, after: object | undefined, apply: (key: string, value: unknown) => void): void {
  const prev = (before ?? {}) as Record<string, unknown>;
  const next = (after ?? {}) as Record<string, unknown>;

  for (const key of new Set([...Object.keys(prev), ...Object.keys(next)])) {
    // visibility belongs to the data layer, not the sublayer spec
    if (key === "visibility") continue;
    if (!isEqualValue(prev[key], next[key])) apply(key, next[key]);
  }
}

/** Structural equality for style values (JSON-compatible by definition). */
function isEqualValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function createPendingUpdates<TStyle>(): PendingDataLayerUpdates<TStyle> {
  return { data: false, visibility: false, zoomRange: false, style: new Set(), rebuild: false };
}
