import type { GeoJSONSourceSpecification, Map as MapLibreMap } from "maplibre-gl";
import type { Map as SDKMap } from "../../Map";
import { getRandomColor } from "../../helpers/stylehelper";
import { DataLayer, type SublayerSpecification } from "../DataLayer";
import { buildCircleLayers, resolveCirclesStyling } from "./circles-renderer";
import { MarkerImages, buildMarkerLayers, resolveMarkersStyling } from "./markers-renderer";
import type {
  PointLayerCirclesCollisionBehaviour,
  PointLayerCirclesStyling,
  PointLayerCollisionBehaviour,
  PointLayerConstructorOptions,
  PointLayerMarkersCollisionBehaviour,
  PointLayerMarkersStyling,
  PointLayerMode,
  PointLayerStyling,
} from "./types";

/**
 * A stateful layer of points — the successor to the `addPoint` helper. Add it
 * with `map.addLayer(layer, beforeId)`; its data, styling and display can then
 * be changed at any time.
 *
 * Points render as GL circles (`mode: "circles"`, the default) or as MapTiler
 * marker images (`mode: "markers"`). The mode is fixed at construction.
 *
 * @example
 * ```ts
 * const layer = new PointLayer({ data: "https://example.com/points.geojson", styling: { pointColor: "#ff0000" } });
 * map.addLayer(layer);
 * layer.setStyling({ pointRadius: 12 }).setVisible(true);
 *
 * const markers = new PointLayer({ mode: "markers", data, styling: { marker: { shape: "square" }, label: "name" } });
 * map.addLayer(markers);
 * ```
 */
export class PointLayer<TMode extends PointLayerMode = "circles"> extends DataLayer<PointLayerStyling<TMode>, TMode> {
  private collisionBehaviour: PointLayerCollisionBehaviour<TMode>;

  /** Colour used while `pointColor` is unset in circles mode — picked once, so it's stable across rebuilds. */
  private readonly defaultColor = getRandomColor();

  /** Marker images in markers mode. */
  private readonly markerImages = new MarkerImages(this.id);

  constructor(options: PointLayerConstructorOptions<TMode>) {
    super("maptiler-point-layer", options.mode ?? ("circles" as TMode), options);
    this.collisionBehaviour = options.collisionBehaviour ?? ("always-show" as PointLayerCollisionBehaviour<TMode>);
  }

  //#region Collision Behaviour

  /** Sets what happens where points overlap. Switching clustering on or off rebuilds the source. */
  setCollisionBehaviour(collisionBehaviour: PointLayerCollisionBehaviour<TMode>): this {
    if (collisionBehaviour === this.collisionBehaviour) return this;
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
      this.markerImages.removeAll(this.map);
    }
    super.onRemove();
  }

  //#endregion

  //#region DataLayer

  protected override getSourceSpecification(): GeoJSONSourceSpecification {
    return { ...super.getSourceSpecification(), cluster: this.isClustered() };
  }

  protected addSublayers(map: SDKMap): void {
    for (const layer of this.buildSublayers()) this.addSublayer(map, layer);
  }

  protected applyStyling(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  // the default circle opacity fades in and out at the zoom range's edges
  protected override onZoomRangeChange(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  protected resolveStyling(): PointLayerStyling<TMode> {
    if (this.isMarkers()) {
      return resolveMarkersStyling(this.styling as PointLayerMarkersStyling, this.map?.getStyleId()) as PointLayerStyling<TMode>;
    }
    return resolveCirclesStyling(this.styling as PointLayerCirclesStyling, this.defaultColor, this.isClustered()) as PointLayerStyling<TMode>;
  }

  //#endregion

  //#region Internal

  private buildSublayers(): SublayerSpecification[] {
    if (this.isMarkers()) {
      const styling = resolveMarkersStyling(this.styling as PointLayerMarkersStyling, this.map?.getStyleId());
      return buildMarkerLayers(styling, {
        layerId: this.id,
        sourceId: this.getSourceId(),
        collisionBehaviour: this.collisionBehaviour as PointLayerMarkersCollisionBehaviour,
        imagePrefix: this.markerImages.setStyle(this.map, styling.marker),
      });
    }

    return buildCircleLayers(this.resolveStyling() as PointLayerCirclesStyling, {
      layerId: this.id,
      sourceId: this.getSourceId(),
      cluster: this.isClustered(),
      minzoom: this.minzoom,
      maxzoom: this.maxzoom,
    });
  }

  private readonly resolveImage = (id: string): Promise<void> | undefined => {
    return this.map ? this.markerImages.resolve(this.map, id) : undefined;
  };

  private isMarkers(): boolean {
    return (this.mode as PointLayerMode) === "markers";
  }

  private isClustered(): boolean {
    return !this.isMarkers() && (this.collisionBehaviour as PointLayerCirclesCollisionBehaviour) === "cluster";
  }

  //#endregion
}
