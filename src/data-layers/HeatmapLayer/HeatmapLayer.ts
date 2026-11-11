import type { Map as SDKMap } from "../../Map";
import { DataLayer, type SublayerSpecification } from "../DataLayer";
import { POINT_GEOMETRY_FILTER } from "../style";
import { buildHeatmapLayers, resolveHeatmapStyle } from "./heatmap-renderer";
import type { HeatmapLayerConstructorOptions, HeatmapLayerMode, HeatmapLayerStyle } from "./types";

/**
 * A stateful heatmap of points — the successor to the `addHeatmap` helper.
 * Add it with `map.addLayer(layer, beforeId)`; its data, style and display
 * can then be changed at any time. Only Point and MultiPoint features are
 * drawn — other geometries are skipped.
 *
 * Pointer events report every point whose radius covers the pointer, faint
 * edges of the heatmap included.
 *
 * @example
 * ```ts
 * const heatmap = new HeatmapLayer({ data: "https://example.com/quakes.geojson", style: { color: ColorRampCollection.MAGMA, property: "mag" } });
 * map.addLayer(heatmap);
 * heatmap.setStyle({ opacity: 0.8 }).setZoomRange(0, 10, 1);
 * ```
 */
export class HeatmapLayer extends DataLayer<HeatmapLayerStyle, HeatmapLayerMode> {
  protected override readonly geometryFilter = POINT_GEOMETRY_FILTER;

  /**
   * @param options - Data, style and display options. `style.color` is required.
   * @throws Error when `style.color` is missing, `undefined` or `null`.
   */
  constructor(options: HeatmapLayerConstructorOptions) {
    super("maptiler-heatmap-layer", "heatmap", HeatmapLayer.assertHasColor(options));
  }

  /**
   * Throws unless `options.style.color` is set. The types already require it,
   * so this is for JavaScript callers and casts.
   *
   * Why throw rather than warn and carry on: there's no default ramp to fall
   * back on yet (it will come from the map style, which the layer doesn't know
   * until it's added), and `heatmap-color` can't be built without one. Left
   * unchecked, the error would surface later and further from its cause — as a
   * `TypeError` inside `map.addLayer()`, or in a style flush on a later frame.
   * Throwing here points at the line that built the layer.
   *
   * It runs before the base constructor, which would otherwise warn first that
   * an `undefined` colour "can't be reset", a confusing message for a layer
   * that never had one. Once the layer exists, `setStyle({ color: undefined })`
   * only warns and keeps the colour, as the layer is still valid.
   */
  private static assertHasColor(options: HeatmapLayerConstructorOptions): HeatmapLayerConstructorOptions {
    // `== null` so an explicit `null` counts as missing too, not only `undefined`; and no options or style at all is missing too
    const style = (options as Partial<HeatmapLayerConstructorOptions> | undefined)?.style as Partial<HeatmapLayerStyle> | undefined;
    if (style?.color == null) {
      throw new Error("HeatmapLayer: `style.color` is required — a ColorRamp, such as `ColorRampCollection.MAGMA`.");
    }
    return options;
  }

  //#region DataLayer

  /** The heatmap has no default colour yet, so `color` can't be reset. */
  protected override isRequiredStyleKey(key: keyof HeatmapLayerStyle): boolean {
    return key === "color";
  }

  protected addSublayers(map: SDKMap): void {
    for (const layer of this.buildSublayers()) this.addSublayer(map, layer);
  }

  protected applyStyle(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  /** The opacity fades in and out at the zoom range's edges, so a new range or fade restyles the sublayer. */
  protected override onZoomRangeChange(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  protected resolveStyle(): HeatmapLayerStyle {
    return resolveHeatmapStyle(this.style);
  }

  //#endregion

  //#region Internal

  private buildSublayers(): SublayerSpecification[] {
    return buildHeatmapLayers(this.resolveStyle(), { layerId: this.id, sourceId: this.getSourceId(), fadeOpacity: this.fadeOpacity });
  }

  //#endregion
}
