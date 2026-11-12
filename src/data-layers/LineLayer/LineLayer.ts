import type { Map as SDKMap } from "../../Map";
import { DataLayer, type SublayerSpecification } from "../DataLayer";
import { LINE_AND_POLYGON_GEOMETRY_FILTER } from "../style";
import { buildLineLayers, resolveLineStyle } from "./line-renderer";
import type { LineLayerConstructorOptions, LineLayerMode, LineLayerStyle } from "./types";

/**
 * A stateful layer of lines — the successor to the `addPolyline` helper. Add
 * it with `map.addLayer(layer, beforeId)`; its data, style and display can
 * then be changed at any time.
 *
 * It draws its data as lines, whatever the geometry: lines as they are, and
 * polygons as their rings — their edges. Points are skipped. To draw the same
 * data another way too, such as filling the polygons, add another layer
 * drawing the same source: `new PolygonLayer({ data: lines, … })`.
 *
 * Data can also be GPX or KML, such as a recorded track — see `DataLayerData`.
 *
 * @example
 * ```ts
 * const route = new LineLayer({ data: "https://example.com/route.gpx", style: { color: "#3366ff", width: 4, outline: true } });
 * map.addLayer(route);
 * route.setStyle({ dashArray: "__ " });
 * ```
 */
export class LineLayer extends DataLayer<LineLayerStyle, LineLayerMode> {
  protected override readonly geometryFilter = LINE_AND_POLYGON_GEOMETRY_FILTER;

  /**
   * @param options - Data, style and display options. `style.color` is required.
   * @throws Error when `style.color` is missing, `undefined` or `null`.
   */
  constructor(options: LineLayerConstructorOptions) {
    super("maptiler-line-layer", "line", LineLayer.assertHasColor(options));
  }

  /**
   * Throws unless `options.style.color` is set. The types already require it,
   * so this is for JavaScript callers and casts. There's no default colour to
   * fall back on yet — throwing here points at the line that built the layer,
   * rather than at black lines later.
   */
  private static assertHasColor(options: LineLayerConstructorOptions): LineLayerConstructorOptions {
    // `== null` so an explicit `null` counts as missing too; and no options or style at all is missing too
    const style = (options as Partial<LineLayerConstructorOptions> | undefined)?.style as Partial<LineLayerStyle> | undefined;
    if (style?.color == null) {
      throw new Error("LineLayer: `style.color` is required.");
    }
    return options;
  }

  //#region DataLayer

  /** There's no default colour yet, so `color` can't be reset. */
  protected override isRequiredStyleKey(key: keyof LineLayerStyle): boolean {
    return key === "color";
  }

  protected addSublayers(map: SDKMap): void {
    for (const layer of this.buildSublayers()) this.addSublayer(map, layer);
  }

  protected applyStyle(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  /** The opacities fade in and out at the zoom range's edges, so a new range or fade restyles the sublayers. */
  protected override onZoomRangeChange(): boolean {
    return this.syncSublayers(this.buildSublayers());
  }

  protected resolveStyle(): LineLayerStyle {
    return resolveLineStyle(this.style);
  }

  //#endregion

  //#region Internal

  private buildSublayers(): SublayerSpecification[] {
    return buildLineLayers(this.resolveStyle(), { layerId: this.id, sourceId: this.getSourceId(), fadeOpacity: this.fadeOpacity });
  }

  //#endregion
}
