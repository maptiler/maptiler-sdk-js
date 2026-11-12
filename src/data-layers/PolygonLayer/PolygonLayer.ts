import type { Map as MapLibreMap } from "maplibre-gl";
import type { Map as SDKMap } from "../../Map";
import { DataLayer, type SublayerSpecification } from "../DataLayer";
import { LINE_AND_POLYGON_GEOMETRY_FILTER } from "../style";
import { buildPolygonLayers, resolvePolygonStyle } from "./polygon-renderer";
import type { PolygonLayerConstructorOptions, PolygonLayerMode, PolygonLayerStyle } from "./types";

/**
 * A stateful layer of polygons — the successor to the `addPolygon` helper.
 * Add it with `map.addLayer(layer, beforeId)`; its data, style and display can
 * then be changed at any time.
 *
 * It draws its data as polygons, whatever the geometry: polygons are filled,
 * and lines are filled as rings closed back to their start. Points are
 * skipped. To draw the same data another way too, such as a polygon's edges
 * as lines, add another layer drawing the same source:
 * `new LineLayer({ data: polygons, … })`.
 *
 * Data can also be GPX or KML — see `DataLayerData`.
 *
 * @example
 * ```ts
 * const countries = new PolygonLayer({ data: countriesUrl, style: { color: ColorRampCollection.VIRIDIS.scale(0, 1e8), property: "population", outline: true } });
 * map.addLayer(countries);
 * countries.setStyle({ opacity: 0.6, outlinePosition: "inside" });
 * ```
 */
export class PolygonLayer extends DataLayer<PolygonLayerStyle, PolygonLayerMode> {
  protected override readonly geometryFilter = LINE_AND_POLYGON_GEOMETRY_FILTER;

  /** Pattern URLs that failed to load, filled with `color` instead. */
  private readonly failedPatterns = new Set<string>();

  /** Pattern images added to the map, removed with the layer. */
  private readonly addedPatternImages = new Set<string>();

  /** Pattern images loading, by image id, so each loads once. */
  private readonly loadingPatterns = new Map<string, Promise<void>>();

  /**
   * @param options - Data, style and display options. `style.color` is required, or `style.pattern` in its place.
   * @throws Error when both `style.color` and `style.pattern` are missing.
   */
  constructor(options: PolygonLayerConstructorOptions) {
    super("maptiler-polygon-layer", "fill", PolygonLayer.assertHasFill(options));
  }

  /**
   * Throws unless the style has a colour or a pattern. The types already
   * require one, so this is for JavaScript callers and casts. There's no
   * default colour to fall back on yet — throwing here points at the line that
   * built the layer, rather than at a black fill later.
   */
  private static assertHasFill(options: PolygonLayerConstructorOptions): PolygonLayerConstructorOptions {
    // `== null` so an explicit `null` counts as missing too; and no options or style at all is missing too
    const style = (options as Partial<PolygonLayerConstructorOptions> | undefined)?.style as Partial<PolygonLayerStyle> | undefined;
    if (style?.color == null && style?.pattern == null) {
      throw new Error("PolygonLayer: `style.color` or `style.pattern` is required.");
    }
    return options;
  }

  //#region CustomLayerInterface

  override onAdd(map: MapLibreMap): void {
    // before the sublayers are added, so the first tiles find their pattern
    (map as SDKMap).addMissingStyleImageResolver(this.resolveImage);
    super.onAdd(map);
  }

  override onRemove(): void {
    const map = this.map;
    if (map) {
      map.removeMissingStyleImageResolver(this.resolveImage);
      for (const id of this.addedPatternImages) {
        if (map.hasImage(id)) map.removeImage(id);
      }
      this.addedPatternImages.clear();
    }
    super.onRemove();
  }

  //#endregion

  //#region DataLayer

  /** There's no default colour yet, so one of `color` and `pattern` must stay set — whichever is the only one can't be reset. */
  protected override isRequiredStyleKey(key: keyof PolygonLayerStyle): boolean {
    if (key === "color") return this.style.pattern === undefined;
    if (key === "pattern") return this.style.color === undefined;
    return false;
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

  protected resolveStyle(): PolygonLayerStyle {
    return resolvePolygonStyle(this.style);
  }

  //#endregion

  //#region Pattern

  private buildSublayers(): SublayerSpecification[] {
    const style = this.resolveStyle();
    const { pattern } = style;
    const patternImageId = pattern !== undefined && !this.failedPatterns.has(pattern) ? this.getPatternImageId(pattern) : undefined;
    return buildPolygonLayers(style, { layerId: this.id, sourceId: this.getSourceId(), fadeOpacity: this.fadeOpacity, patternImageId });
  }

  private getPatternImageId(url: string): string {
    return `${this.id}-pattern:${url}`;
  }

  /** Loads and adds the pattern image for `id`, if it's this layer's — also after `map.setStyle()`, which drops the images. */
  private readonly resolveImage = (id: string): Promise<void> => {
    const map = this.map;
    const prefix = this.getPatternImageId("");
    if (!map || !id.startsWith(prefix) || map.hasImage(id)) return Promise.resolve();

    let loading = this.loadingPatterns.get(id);
    if (!loading) {
      loading = this.loadPattern(map, id, id.slice(prefix.length)).finally(() => this.loadingPatterns.delete(id));
      this.loadingPatterns.set(id, loading);
    }
    return loading;
  };

  /** On failure, falls back to `color`, as `addPolygon` does. */
  private async loadPattern(map: SDKMap, id: string, url: string): Promise<void> {
    try {
      const { data } = await map.loadImage(url);
      // the layer may have left the map, or the image been added, while it loaded
      if (this.map !== map || map.hasImage(id)) return;
      map.addImage(id, data);
      this.addedPatternImages.add(id);
    } catch (error) {
      console.error(`${this.id}: couldn't load the pattern image "${url}", so the colour is used.`, error);
      this.failedPatterns.add(url);
      this.requestRebuild();
    }
  }

  //#endregion
}
