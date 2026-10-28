import type { Map as SDKMap } from "../../Map";
import { DataLayer, type SublayerSpecification } from "../DataLayer";
import { POINT_GEOMETRY_FILTER } from "../styling";
import { buildHeatmapLayers, resolveHeatmapStyling } from "./heatmap-renderer";
import type { HeatmapLayerConstructorOptions, HeatmapLayerMode, HeatmapLayerStyling } from "./types";

/**
 * A stateful heatmap of points — the successor to the `addHeatmap` helper.
 * Add it with `map.addLayer(layer, beforeId)`; its data, styling and display
 * can then be changed at any time. Only Point and MultiPoint features are
 * drawn — other geometries are skipped.
 *
 * Pointer events report every point whose radius covers the pointer, faint
 * edges of the heatmap included.
 *
 * @example
 * ```ts
 * const heatmap = new HeatmapLayer({ data: "https://example.com/quakes.geojson", styling: { color: ColorRampCollection.MAGMA, property: "mag" } });
 * map.addLayer(heatmap);
 * heatmap.setStyling({ opacity: 0.8 }).setZoomRange(0, 10, 1);
 * ```
 */
export class HeatmapLayer extends DataLayer<HeatmapLayerStyling, HeatmapLayerMode> {
  protected override readonly geometryFilter = POINT_GEOMETRY_FILTER;

  constructor(options: HeatmapLayerConstructorOptions) {
    super("maptiler-heatmap-layer", "heatmap", options);
    // for JavaScript callers — the types already require it
    if (!("color" in this.styling)) throw new Error("HeatmapLayer: `styling.color` is required.");
  }

  //#region DataLayer

  /** The heatmap has no default colour yet, so `color` can't be reset. */
  protected override isRequiredStylingKey(key: keyof HeatmapLayerStyling): boolean {
    return key === "color";
  }

  protected addSublayers(map: SDKMap): void {
    for (const layer of this.buildSublayers()) this.addSublayer(map, layer);
  }

  protected applyStyling(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  /** The opacity fades in and out at the zoom range's edges, so a new range or fade restyles the sublayer. */
  protected override onZoomRangeChange(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  protected resolveStyling(): HeatmapLayerStyling {
    return resolveHeatmapStyling(this.styling);
  }

  //#endregion

  //#region Internal

  private buildSublayers(): SublayerSpecification[] {
    return buildHeatmapLayers(this.resolveStyling(), { layerId: this.id, sourceId: this.getSourceId(), fadeOpacity: this.fadeOpacity });
  }

  //#endregion
}
