import type { GeoJSONSourceSpecification } from "maplibre-gl";
import type { Map as SDKMap } from "../../Map";
import { getRandomColor } from "../../helpers/stylehelper";
import { DataLayer, type SublayerSpecification } from "../DataLayer";
import { buildCircleLayers, resolveCirclesStyling } from "./circles-renderer";
import type { PointLayerCirclesCollisionBehaviour, PointLayerCirclesStyling, PointLayerConstructorOptions, PointLayerMode } from "./types";

/**
 * A stateful layer of points, rendered as GL circles — the successor to the
 * `addPoint` helper. Add it with `map.addLayer(layer, beforeId)`; its data,
 * styling and display can then be changed at any time.
 *
 * @example
 * ```ts
 * const layer = new PointLayer({ data: "https://example.com/points.geojson", styling: { pointColor: "#ff0000" } });
 * map.addLayer(layer);
 * layer.setStyling({ pointRadius: 12 }).setVisible(true);
 * ```
 */
export class PointLayer extends DataLayer<PointLayerCirclesStyling, PointLayerMode> {
  private collisionBehaviour: PointLayerCirclesCollisionBehaviour;

  /** Colour used while `pointColor` is unset — picked once, so it's stable across rebuilds. */
  private readonly defaultColor = getRandomColor();

  constructor(options: PointLayerConstructorOptions) {
    super("maptiler-point-layer", options.mode ?? "circles", options);
    this.collisionBehaviour = options.collisionBehaviour ?? "always-show";
  }

  //#region Collision Behaviour

  /** Sets what happens where points overlap. Switching clustering on or off rebuilds the source. */
  setCollisionBehaviour(collisionBehaviour: PointLayerCirclesCollisionBehaviour): this {
    if (collisionBehaviour === this.collisionBehaviour) return this;
    this.collisionBehaviour = collisionBehaviour;
    this.requestRebuild();
    return this;
  }

  getCollisionBehaviour(): PointLayerCirclesCollisionBehaviour {
    return this.collisionBehaviour;
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

  // the default opacity fades in and out at the zoom range's edges
  protected override onZoomRangeChange(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  protected resolveStyling(): PointLayerCirclesStyling {
    return resolveCirclesStyling(this.styling, this.defaultColor, this.isClustered());
  }

  //#endregion

  //#region Internal

  private buildSublayers(): SublayerSpecification[] {
    return buildCircleLayers(this.resolveStyling(), {
      layerId: this.id,
      sourceId: this.getSourceId(),
      cluster: this.isClustered(),
      minzoom: this.minzoom,
      maxzoom: this.maxzoom,
    });
  }

  private isClustered(): boolean {
    return this.collisionBehaviour === "cluster";
  }

  //#endregion
}
