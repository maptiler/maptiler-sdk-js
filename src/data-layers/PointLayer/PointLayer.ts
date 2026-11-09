import type { GeoJSONSourceSpecification, Map as MapLibreMap } from "maplibre-gl";
import type { Map as SDKMap } from "../../Map";
import { DataLayer, type SublayerSpecification } from "../DataLayer";
import { POINT_GEOMETRY_FILTER } from "../style";
import { buildCircleLayers, resolveCirclesStyle } from "./circles-renderer";
import { MarkerImages, buildMarkerLayers, resolveMarkersStyle } from "./markers-renderer";
import type {
  PointLayerCirclesStyle,
  PointLayerCollisionBehaviour,
  PointLayerConstructorOptions,
  PointLayerMarkersCollisionBehaviour,
  PointLayerMarkersStyle,
  PointLayerMode,
  PointLayerStyle,
} from "./types";

/**
 * A stateful layer of points — the successor to the `addPoint` helper. Add it
 * with `map.addLayer(layer, beforeId)`; its data, style and display can then
 * be changed at any time.
 *
 * Points render as GL circles (`mode: "circles"`, the default) or as MapTiler
 * marker images (`mode: "markers"`). The mode is fixed at construction.
 * Only Point and MultiPoint features are drawn — other geometries are skipped.
 *
 * @example
 * ```ts
 * const layer = new PointLayer({ data: "https://example.com/points.geojson", style: { color: "#ff0000" } });
 * map.addLayer(layer);
 * layer.setStyle({ radius: 12 }).setVisible(true);
 *
 * const markers = new PointLayer({ mode: "markers", data, style: { marker: { shape: "square" }, label: "name" } });
 * map.addLayer(markers);
 * ```
 */
export class PointLayer<TMode extends PointLayerMode = "circles"> extends DataLayer<PointLayerStyle<TMode>, TMode> {
  private collisionBehaviour: PointLayerCollisionBehaviour<TMode>;

  protected override readonly geometryFilter = POINT_GEOMETRY_FILTER;

  /** Images in markers mode: the markers, the dots minimized markers leave, and the cluster markers. */
  private readonly images = {
    marker: new MarkerImages(this.id, "marker"),
    dot: new MarkerImages(this.id, "dot"),
    cluster: new MarkerImages(this.id, "cluster"),
  };

  constructor(options: PointLayerConstructorOptions<TMode>) {
    super("maptiler-point-layer", options.mode ?? ("circles" as TMode), options);
    // for JavaScript callers — the types already require it
    if (!this.isMarkers() && !("color" in this.style)) {
      throw new Error("PointLayer: `style.color` is required in circles mode.");
    }
    // circles can't collide, so only markers default to colliding
    const defaultBehaviour = this.mode === "markers" ? "minimize-by-priority" : "always-show";
    this.collisionBehaviour = options.collisionBehaviour ?? (defaultBehaviour as PointLayerCollisionBehaviour<TMode>);
    if (this.isClustered() && this.isSharingSource()) throw new Error(`${this.id}: a layer sharing its source can't cluster, as clustering changes the source.`);
  }

  //#region Collision Behaviour

  /** Sets what happens where points overlap. Switching clustering on or off rebuilds the source, so a layer sharing its source can't cluster. */
  setCollisionBehaviour(collisionBehaviour: PointLayerCollisionBehaviour<TMode>): this {
    if (collisionBehaviour === this.collisionBehaviour) return this;
    if (collisionBehaviour === "cluster" && this.isSharingSource()) throw new Error(`${this.id}: a layer sharing its source can't cluster, as clustering changes the source.`);
    this.collisionBehaviour = collisionBehaviour;
    this.requestRebuild();
    return this;
  }

  getCollisionBehaviour(): PointLayerCollisionBehaviour<TMode> {
    return this.collisionBehaviour;
  }

  //#endregion

  //#region CustomLayerInterface

  override onAdd(map: MapLibreMap): void {
    // before the sublayers are added, so the first tiles find their images
    if (this.isMarkers()) (map as SDKMap).addMissingStyleImageResolver(this.resolveImage);
    super.onAdd(map);
  }

  override onRemove(): void {
    if (this.map) {
      this.map.removeMissingStyleImageResolver(this.resolveImage);
      for (const images of Object.values(this.images)) images.removeAll(this.map);
    }
    super.onRemove();
  }

  //#endregion

  //#region DataLayer

  protected override canShareSource(): boolean {
    return !this.isClustered();
  }

  protected override getSourceSpecification(): GeoJSONSourceSpecification {
    return { ...super.getSourceSpecification(), cluster: this.isClustered() };
  }

  protected addSublayers(map: SDKMap): void {
    for (const layer of this.buildSublayers()) this.addSublayer(map, layer);
  }

  /** Circles have no default colour yet, so `color` can't be reset. */
  protected override isRequiredStyleKey(key: keyof PointLayerStyle<TMode>): boolean {
    return !this.isMarkers() && key === "color";
  }

  protected applyStyle(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  /** The opacity fades in and out at the zoom range's edges, so a new range or fade restyles the sublayers. */
  protected override onZoomRangeChange(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  protected resolveStyle(): PointLayerStyle<TMode> {
    if (this.isMarkers()) {
      return resolveMarkersStyle(this.style as PointLayerMarkersStyle, this.map?.getStyleId()) as PointLayerStyle<TMode>;
    }
    return resolveCirclesStyle(this.style as PointLayerCirclesStyle, this.isClustered()) as PointLayerStyle<TMode>;
  }

  //#endregion

  //#region Internal

  private buildSublayers(): SublayerSpecification[] {
    if (this.isMarkers()) {
      const style = resolveMarkersStyle(this.style as PointLayerMarkersStyle, this.map?.getStyleId());
      return buildMarkerLayers(style, {
        layerId: this.id,
        sourceId: this.getSourceId(),
        collisionBehaviour: this.collisionBehaviour as PointLayerMarkersCollisionBehaviour,
        imagePrefixes: {
          marker: this.images.marker.setStyle(this.map, style.marker),
          dot: this.images.dot.setStyle(this.map, style.minimized),
          cluster: this.images.cluster.setStyle(this.map, style.clusterMarker),
        },
        fadeOpacity: this.fadeOpacity,
      });
    }

    return buildCircleLayers(this.resolveStyle() as PointLayerCirclesStyle, {
      layerId: this.id,
      sourceId: this.getSourceId(),
      cluster: this.isClustered(),
      fadeOpacity: this.fadeOpacity,
    });
  }

  private readonly resolveImage = async (id: string): Promise<void> => {
    const map = this.map;
    if (!map) return;
    // each set ignores ids that aren't its own
    await Promise.all(Object.values(this.images).map((images) => images.resolve(map, id)));
  };

  private isMarkers(): boolean {
    return (this.mode as PointLayerMode) === "markers";
  }

  private isClustered(): boolean {
    return this.collisionBehaviour === "cluster";
  }

  //#endregion
}
