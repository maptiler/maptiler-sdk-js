import type { Feature, FeatureCollection, Point } from "geojson";
import type { ExpressionSpecification, MapMouseEvent } from "maplibre-gl";
import { Marker, type Map, type PointLayer } from "../../src/index";

// Interaction for a markers mode PointLayer, with nothing added to the library:
// the GL markers can't change per feature on hover (`icon-image` is a layout
// property, so feature-state can't drive it), so the marker under the pointer,
// and the selected one, are swapped for real DOM markers — which have their own
// UI states, animations and events — and their GL twins hidden through a
// per-feature `icon-opacity`. Paint changes don't re-lay out tiles, so the swap
// is cheap however much data the layer holds.

//#region Data

export type QuakeProperties = {
  id: string;
  mag: number;
  /** Text drawn into the marker — the layer's `label` property. */
  label: string;
  /** Replaces the formatted magnitude as the label when set. */
  labelOverride?: string;
};

export type QuakeFeature = Feature<Point, QuakeProperties>;
export type QuakeCollection = FeatureCollection<Point, QuakeProperties>;

const magnitudeFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

/** Recomputes a feature's `label` from its data. */
export function updateLabel(properties: QuakeProperties): void {
  properties.label = properties.labelOverride ?? magnitudeFormat.format(properties.mag);
}

/** Fetches the earthquakes and gives every feature a `label`. */
export async function loadQuakes(url: string): Promise<QuakeCollection> {
  const response = await fetch(url);
  const data = (await response.json()) as QuakeCollection;
  for (const feature of data.features) updateLabel(feature.properties);
  return data;
}

//#endregion

//#region Interaction

export type MarkerInteractionOptions = {
  map: Map;
  layer: PointLayer<"markers">;
  data: QuakeCollection;
  /** Called with the selected feature, or `null` when the selection clears. */
  onSelect?: (feature: QuakeFeature | null) => void;
};

const SELECTED_COLOR = "#f59e0b";

export class MarkerInteraction {
  private readonly map: Map;
  private readonly layer: PointLayer<"markers">;
  private data: QuakeCollection;
  private readonly onSelect: (feature: QuakeFeature | null) => void;

  private featuresById = new globalThis.Map<string, QuakeFeature>();
  /** DOM markers standing in for GL ones, by feature id, and whether each was made with the selected look. */
  private readonly promoted = new globalThis.Map<string, { marker: Marker; selected: boolean }>();
  private hoveredId: string | null = null;
  private selectedId: string | null = null;
  private enabled = true;

  constructor({ map, layer, data, onSelect }: MarkerInteractionOptions) {
    this.map = map;
    this.layer = layer;
    this.data = data;
    this.onSelect = onSelect ?? (() => undefined);
    this.indexFeatures();

    layer.on("mousemove", (e) => {
      this.setHovered(featureId(this.topmost(e.features ?? [])));
    });
    layer.on("mouseleave", () => {
      this.setHovered(null);
    });
    // one map-level click covers both picking a GL marker (touch has no hover to promote it first) and clicking off to deselect
    map.on("click", this.onMapClick);
  }

  /** Turns the interaction off (e.g. while the layer is hidden), dropping hover and selection. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.hoveredId = null;
      this.select(null);
    }
  }

  select(id: string | null): void {
    if (id === this.selectedId) return;
    this.selectedId = id;
    this.sync();
    this.onSelect(id ? (this.featuresById.get(id) ?? null) : null);
  }

  getSelected(): QuakeFeature | null {
    return this.selectedId ? (this.featuresById.get(this.selectedId) ?? null) : null;
  }

  /**
   * Edits a feature's data and pushes it to the layer. A new label means a new
   * marker image, which the layer draws on demand.
   */
  updateFeature(id: string, changes: Partial<Pick<QuakeProperties, "mag" | "labelOverride">>): void {
    const feature = this.featuresById.get(id);
    if (!feature) return;

    Object.assign(feature.properties, changes);
    updateLabel(feature.properties);
    this.layer.setData(this.data);
    this.promoted.get(id)?.marker.setContent(feature.properties.label);
  }

  /** Replaces the data, keeping the selection when its feature is still there. */
  setData(data: QuakeCollection): void {
    this.data = data;
    this.indexFeatures();
    this.layer.setData(data);
    if (this.selectedId && !this.featuresById.has(this.selectedId)) this.select(null);
    this.sync();
  }

  private readonly onMapClick = (e: MapMouseEvent) => {
    if (!this.enabled) return;
    const features = this.map.queryRenderedFeatures(e.point, { layers: this.layer.getSublayerIds() });
    this.select(featureId(this.topmost(features)));
  };

  /**
   * The marker drawn on top among overlapping hits. Hits don't come back in
   * draw order, and `symbol-z-order: viewport-y` draws the lowest on screen
   * last — so that's the one under the pointer.
   */
  private topmost<T extends { geometry: GeoJSON.Geometry }>(features: T[]): T | undefined {
    let top: T | undefined;
    let topY = -Infinity;
    for (const feature of features) {
      if (feature.geometry.type !== "Point") continue;
      const { y } = this.map.project(feature.geometry.coordinates as [number, number]);
      if (y > topY) {
        top = feature;
        topY = y;
      }
    }
    return top;
  }

  private setHovered(id: string | null): void {
    if (!this.enabled || id === this.hoveredId) return;
    this.hoveredId = id;
    this.map.getCanvas().style.cursor = id ? "pointer" : "";
    this.sync();
  }

  /** Brings the DOM stand-ins and the hidden GL markers in line with hover and selection. */
  private sync(): void {
    const wanted = new Set([this.hoveredId, this.selectedId].filter((id): id is string => id !== null));

    for (const [id, { marker, selected }] of this.promoted) {
      // the selected look is baked in at creation, so a marker changing role is recreated
      if (!wanted.has(id) || selected !== (id === this.selectedId)) {
        marker.remove();
        this.promoted.delete(id);
      }
    }

    for (const id of wanted) {
      if (!this.promoted.has(id)) {
        const marker = this.createMarker(id);
        if (marker) this.promoted.set(id, { marker, selected: id === this.selectedId });
      }
    }

    this.hideGLMarkers([...this.promoted.keys()]);
  }

  private createMarker(id: string): Marker | null {
    const feature = this.featuresById.get(id);
    if (!feature) return null;

    // the layer's resolved style, colours included, so the stand-in matches the GL marker exactly
    const style = this.layer.getStyling().marker ?? {};
    const isSelected = id === this.selectedId;
    const marker = new Marker({
      ...style,
      content: feature.properties.label,
      ...(isSelected ? { outerColor: SELECTED_COLOR, scale: [1.2, 1.2] } : {}),
      states: { hover: { scale: isSelected ? [1.3, 1.3] : [1.2, 1.2], shadow: "strong" } },
    });
    marker.setLngLat(feature.geometry.coordinates as [number, number]);
    marker.getElement().addEventListener("click", (event) => {
      // the map underneath mustn't treat this as a click on empty map
      event.stopPropagation();
      this.select(id);
    });
    this.map.addMarker(marker);
    return marker;
  }

  /** Hides the GL markers that have a DOM stand-in. Paint only — no re-layout. */
  private hideGLMarkers(ids: string[]): void {
    const opacity = this.layer.getStyling().marker?.opacity ?? 1;
    const value: number | ExpressionSpecification = ids.length === 0 ? opacity : ["case", ["in", ["get", "id"], ["literal", ids]], 0, opacity];
    for (const layerId of this.layer.getSublayerIds()) {
      if (this.map.getLayer(layerId)) this.map.setPaintProperty(layerId, "icon-opacity", value);
    }
  }

  private indexFeatures(): void {
    this.featuresById = new globalThis.Map(this.data.features.map((feature) => [feature.properties.id, feature]));
  }
}

function featureId(feature: { properties: unknown } | undefined): string | null {
  const id = (feature?.properties as { id?: unknown } | undefined)?.id;
  return typeof id === "string" ? id : null;
}

//#endregion
