import type { CustomLayerInterface, GeoJSONSource, GeoJSONSourceSpecification, LayerSpecification, Map as MapLibreMap, MapLayerMouseEvent, MapSourceDataEvent } from "maplibre-gl";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import { v4 as uuidv4 } from "uuid";
import type { Map as SDKMap } from "../Map";
import { config } from "../config";
import { isUUID } from "../tools";

//#region Types

/** GeoJSON data, a URL to GeoJSON, or the UUID of a MapTiler Cloud dataset. */
export type DataLayerData = FeatureCollection | Feature | Geometry | string;

/** Options shared by every data layer's constructor. */
export type DataLayerConstructorOptions<TStyling extends object> = {
  /** Layer id. Auto-generated when omitted. */
  id?: string;
  /** GeoJSON data, a URL to GeoJSON, or the UUID of a MapTiler Cloud dataset. */
  data: DataLayerData;
  /** Initial styling. Unset fields use the layer's defaults. */
  styling?: TStyling;
  /** Initial visibility. Defaults to `true`. */
  visible?: boolean;
  /** Zoom level from which the layer shows. Defaults to `0`. */
  minzoom?: number;
  /** Zoom level from which the layer no longer shows. Defaults to `24`. */
  maxzoom?: number;
};

/** Pointer events forwarded from the layer's sublayers. */
export type DataLayerMouseEventType = "click" | "mouseenter" | "mouseleave" | "mousemove";

/** Event payloads keyed by event type. `TTarget` is the layer firing them. */
export type DataLayerEventMap<TTarget> = Record<DataLayerMouseEventType, MapLayerMouseEvent> & {
  /** The source started loading data. */
  dataloading: { type: "dataloading"; target: TTarget };
  /** The source finished loading data. */
  data: { type: "data"; target: TTarget };
  /** The source failed to load data. */
  error: { type: "error"; target: TTarget; error: Error };
};

export type DataLayerEventType = keyof DataLayerEventMap<unknown>;

export type DataLayerEventListener<T extends DataLayerEventType, TTarget> = (event: DataLayerEventMap<TTarget>[T]) => void;

/** What changed since the last flush — see {@link DataLayer.flushUpdates}. */
type PendingDataLayerUpdates<TStyling> = {
  data: boolean;
  visibility: boolean;
  zoomRange: boolean;
  styling: Set<keyof TStyling>;
  rebuild: boolean;
};

/** A style layer managed by a data layer. Its zoom range and visibility are owned by the data layer, and applied on top. */
export type SublayerSpecification = Exclude<LayerSpecification, { type: "background" }>;

/** A map listener bound by the layer — `layerIds` set for layer-delegated pointer listeners. */
type BoundMapListener = { type: string; layerIds?: string[]; listener: (event: never) => void };

const MOUSE_EVENT_TYPES: readonly DataLayerMouseEventType[] = ["click", "mouseenter", "mouseleave", "mousemove"];

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
 * The layer survives `setStyle()`: it rebuilds its source and sublayers on
 * `style.load`, from its own state.
 */
export abstract class DataLayer<TStyling extends object, TMode extends string> implements CustomLayerInterface {
  readonly id: string;
  readonly type = "custom";
  readonly mode: TMode;

  //#region State

  protected map: SDKMap | null = null;

  /** Data as passed by the user — {@link getData} returns it unchanged. */
  protected data: DataLayerData;

  /** Styling as set by the user, without defaults — see {@link getStyling} for the resolved values. */
  protected styling: TStyling;

  protected visible: boolean;
  protected minzoom: number;
  protected maxzoom: number;

  /** Layer the controller sat beneath when last added, used to restore its position after a full style rebuild. */
  private beforeId: string | undefined;

  private pending: PendingDataLayerUpdates<TStyling> = createPendingUpdates();
  private animationFrameID: number | null = null;

  private readonly listeners = new Map<DataLayerEventType, Set<DataLayerEventListener<DataLayerEventType, this>>>();

  /** Map-level listeners currently bound, kept so they can be detached — layer-delegated ones are rebound on every rebuild, as sublayer ids may change. */
  private readonly boundMapListeners: BoundMapListener[] = [];

  /** Specs of the sublayers added by the last build (or last {@link syncSublayers}), bottom first. */
  private sublayerSpecs: SublayerSpecification[] = [];

  //#endregion

  //#region Constructor

  /**
   * @param idPrefix - Prefix for the auto-generated id, e.g. `"maptiler-point-layer"`.
   * @param mode - Rendering mode, fixed for the layer's lifetime.
   * @param options - Data, styling and display options.
   */
  protected constructor(idPrefix: string, mode: TMode, options: DataLayerConstructorOptions<TStyling>) {
    this.id = options.id ?? `${idPrefix}-${uuidv4()}`;
    this.mode = mode;
    this.data = options.data;
    this.styling = {} as TStyling;
    if (options.styling) this.setStyling(options.styling);
    this.visible = options.visible ?? true;
    this.minzoom = options.minzoom ?? 0;
    this.maxzoom = options.maxzoom ?? 24;
  }

  //#endregion

  //#region Subclass Hooks

  /** Adds the sublayers. The source already exists; each layer must be added via {@link addSublayer}. */
  protected abstract addSublayers(map: SDKMap): void;

  /**
   * Applies changed styling keys to the live sublayers.
   * @returns `false` when the change needs a full rebuild (e.g. a sublayer added or removed), `true` when applied in place.
   */
  protected abstract applyStyling(changed: Set<keyof TStyling>): boolean;

  /** The styling with every default filled in. */
  protected abstract resolveStyling(): TStyling;

  /**
   * Re-applies anything that depends on the zoom range beyond the sublayers'
   * own min/max zoom (which the base updates).
   * @returns `false` when that needs a full rebuild.
   */
  protected onZoomRangeChange(): boolean {
    return true;
  }

  /** Source specification. Override to add clustering etc. — changing what this returns needs a {@link requestRebuild}. */
  protected getSourceSpecification(): GeoJSONSourceSpecification {
    return { type: "geojson", data: this.resolveSourceData() };
  }

  //#endregion

  //#region CustomLayerInterface

  onAdd(map: MapLibreMap): void {
    this.map = map as SDKMap;

    // remember our position so a full style rebuild can restore it
    const order = this.map.getLayersOrder();
    this.beforeId = order[order.indexOf(this.id) + 1];

    this.bindMapListeners();
    this.build();
  }

  /** Only called when the user removes the layer — `setStyle()` never removes custom layers by diffing, and a full rebuild drops them without calling this. */
  onRemove(): void {
    this.cancelFlush();
    this.teardown();
    this.unbindMapListeners();
    this.map = null;
  }

  render(): void {
    // the controller draws nothing — its sublayers do the rendering
  }

  //#endregion

  //#region Data

  /** Replaces the layer's data. */
  setData(data: DataLayerData): this {
    this.data = data;
    this.pending.data = true;
    this.scheduleFlush();
    return this;
  }

  /** Returns the data as it was passed in — a URL or UUID is not resolved. */
  getData(): DataLayerData {
    return this.data;
  }

  /** Id of the GeoJSON source backing the layer. */
  getSourceId(): string {
    return `${this.id}-source`;
  }

  /** Ids of the style layers currently managed by this layer, bottom first. Empty until added to a map. */
  getSublayerIds(): string[] {
    return this.sublayerSpecs.map((spec) => spec.id);
  }

  //#endregion

  //#region Styling

  /**
   * Shallow-merges `styling` into the current styling. A key set to
   * `undefined` resets that property to its default.
   */
  setStyling(styling: Partial<TStyling>): this {
    for (const key of Object.keys(styling) as (keyof TStyling)[]) {
      if (styling[key] === undefined) {
        Reflect.deleteProperty(this.styling, key);
      } else {
        this.styling[key] = styling[key] as TStyling[keyof TStyling];
      }
      this.pending.styling.add(key);
    }
    this.scheduleFlush();
    return this;
  }

  /** Returns the styling in effect, with defaults filled in. */
  getStyling(): TStyling {
    return this.resolveStyling();
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

  setZoomRange(minzoom: number, maxzoom: number): this {
    this.minzoom = minzoom;
    this.maxzoom = maxzoom;
    this.pending.zoomRange = true;
    this.scheduleFlush();
    return this;
  }

  getZoomRange(): [number, number] {
    return [this.minzoom, this.maxzoom];
  }

  //#endregion

  //#region Events

  on<T extends DataLayerEventType>(type: T, listener: DataLayerEventListener<T, this>): this {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener as DataLayerEventListener<DataLayerEventType, this>);
    return this;
  }

  off<T extends DataLayerEventType>(type: T, listener: DataLayerEventListener<T, this>): this {
    this.listeners.get(type)?.delete(listener as DataLayerEventListener<DataLayerEventType, this>);
    return this;
  }

  protected fire<T extends DataLayerEventType>(type: T, event: DataLayerEventMap<this>[T]): void {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const listener of [...set]) listener(event);
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
    map.addLayer(
      {
        ...layer,
        minzoom: this.minzoom,
        maxzoom: this.maxzoom,
        layout: { ...layer.layout, visibility: this.visible ? "visible" : "none" },
      } as LayerSpecification,
      this.id,
    );
    this.sublayerSpecs.push(layer);
  }

  /**
   * Brings the live sublayers in line with `next` through paint, layout and
   * filter updates only — the cheap path for styling changes.
   * @param next - The sublayer specs as {@link addSublayers} would build them now.
   * @returns `false` when the sublayers themselves differ (added, removed or retyped), which needs a rebuild.
   */
  protected syncSublayers(next: SublayerSpecification[]): boolean {
    const map = this.map;
    if (!map) return true;

    const prev = this.sublayerSpecs;
    if (prev.length !== next.length || prev.some((spec, i) => spec.id !== next[i].id || spec.type !== next[i].type)) return false;

    next.forEach((spec, i) => {
      const before = prev[i];

      forEachChangedKey(before.paint, spec.paint, (key, value) => {
        map.setPaintProperty(spec.id, key, value);
      });
      forEachChangedKey(before.layout, spec.layout, (key, value) => {
        map.setLayoutProperty(spec.id, key, value);
      });
      if (!isEqualValue(before.filter, spec.filter)) map.setFilter(spec.id, spec.filter ?? null);
    });

    this.sublayerSpecs = next;
    return true;
  }

  /** The data to hand to the source — a UUID becomes its MapTiler Cloud dataset URL. */
  protected resolveSourceData(): GeoJSONSourceSpecification["data"] {
    if (typeof this.data === "string" && isUUID(this.data)) {
      return `https://api.maptiler.com/data/${this.data}/features.json?key=${config.apiKey}`;
    }
    return this.data as GeoJSONSourceSpecification["data"];
  }

  /** (Re)creates the source and sublayers from the current state. Idempotent — leftovers from a previous build are removed first. */
  private build(): void {
    const map = this.map;
    if (!map) return;

    this.unbindLayerListeners();
    this.teardown();

    map.addSource(this.getSourceId(), this.getSourceSpecification());
    this.addSublayers(map);
    this.bindLayerListeners();

    // everything pending is reflected in a fresh build
    this.pending = createPendingUpdates();
  }

  /** Removes the sublayers and source, whichever of them exist. */
  private teardown(): void {
    const map = this.map;
    if (!map) return;

    for (const layerId of this.getSublayerIds()) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    }
    this.sublayerSpecs = [];
    if (map.getSource(this.getSourceId())) map.removeSource(this.getSourceId());
  }

  /**
   * `setStyle()` wipes the source and sublayers. A diffed style keeps the
   * controller (custom layers aren't part of the diff), so only the sublayers
   * need rebuilding; a full rebuild drops the controller too, so it re-adds
   * itself — and `onAdd` builds the rest.
   */
  private readonly onStyleLoad = (): void => {
    const map = this.map;
    if (!map) return;

    if (map.getLayer(this.id)) {
      this.build();
      return;
    }

    // detach first — onAdd rebinds everything
    this.unbindMapListeners();
    map.addLayer(this, this.beforeId && map.getLayer(this.beforeId) ? this.beforeId : undefined);
  };

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

    const needsRebuild = pending.rebuild || (pending.styling.size > 0 && !this.applyStyling(pending.styling)) || (pending.zoomRange && !this.onZoomRangeChange());

    if (needsRebuild) {
      this.build();
      return;
    }

    if (pending.data) {
      map.getSource<GeoJSONSource>(this.getSourceId())?.setData(this.resolveSourceData());
    }

    for (const layerId of this.getSublayerIds()) {
      if (!map.getLayer(layerId)) continue;
      if (pending.visibility) map.setLayoutProperty(layerId, "visibility", this.visible ? "visible" : "none");
      if (pending.zoomRange) map.setLayerZoomRange(layerId, this.minzoom, this.maxzoom);
    }
  }

  //#endregion

  //#region Map Listeners

  /** Binds the listeners that live for as long as the layer is on the map. */
  private bindMapListeners(): void {
    const map = this.map;
    if (!map) return;

    const onDataLoading = (event: MapSourceDataEvent) => {
      if (event.sourceId === this.getSourceId()) this.fire("dataloading", { type: "dataloading", target: this });
    };

    const onData = (event: MapSourceDataEvent) => {
      // `sourcedata` fires for metadata and per tile too — only report once loaded
      if (event.sourceId === this.getSourceId() && event.isSourceLoaded) this.fire("data", { type: "data", target: this });
    };

    const onError = (event: { error: Error; sourceId?: string }) => {
      if (event.sourceId === this.getSourceId()) this.fire("error", { type: "error", target: this, error: event.error });
    };

    // the map is going away — nothing to tear down, just stop touching it
    const onMapRemove = () => {
      this.cancelFlush();
      this.boundMapListeners.length = 0;
      this.sublayerSpecs = [];
      this.map = null;
    };

    this.bindMapListener("style.load", this.onStyleLoad);
    this.bindMapListener("remove", onMapRemove);
    this.bindMapListener("sourcedataloading", onDataLoading);
    this.bindMapListener("sourcedata", onData);
    this.bindMapListener("error", onError);
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

function createPendingUpdates<TStyling>(): PendingDataLayerUpdates<TStyling> {
  return { data: false, visibility: false, zoomRange: false, styling: new Set(), rebuild: false };
}
