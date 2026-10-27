import type { ExpressionSpecification } from "maplibre-gl";
import type { Map as SDKMap } from "../../Map";
import type { MarkerStyle } from "../../Marker/types";
import { drawMarkerCanvas, getMarkerCanvasPadding } from "../../Marker/marker-canvas";
import { getAdaptiveColors } from "../../Marker/marker-adaptive-colors";
import { getShapeAnchorOffset } from "../../Marker/marker-svg-config";
import { onLabelFontLoad } from "../../Marker/marker-text-fit";
import { CONTENT_METRICS, DEFAULT_MINIMIZED_SIZE, DEFAULT_SHAPE, DEFAULT_SIZE } from "../../Marker/marker-constants";
import type { SublayerSpecification } from "../DataLayer";
import type { PointLayerMarkersCollisionBehaviour, PointLayerMarkersStyling } from "./types";

// Layer specs and images for `markers` mode. Every marker, label included, is
// one icon image drawn by marker-canvas.ts: MapLibre draws all of a layer's
// icons before any of its text, so a GL text label could never sit between two
// markers. As one image, a marker and its label are depth-sorted together.
//
// Images are requested by id through `icon-image` and drawn lazily by a
// missing-image resolver. The id is `<prefix><label>`, so MapLibre evaluates the
// label expression and the image is drawn from the label read back off the id.

//#region Types

/** The images each marker sublayer is drawn from. */
export type MarkerImageRole = "marker" | "dot" | "cluster";

/** Everything besides styling that the marker layers depend on. */
export type MarkersRenderContext = {
  layerId: string;
  sourceId: string;
  collisionBehaviour: PointLayerMarkersCollisionBehaviour;
  /** Image id prefix per role, for the current styles — see {@link MarkerImages.setStyle}. */
  imagePrefixes: Record<MarkerImageRole, string>;
};

/** Markers styling with every marker style's shape, size and colours filled in. */
export type ResolvedMarkersStyling = PointLayerMarkersStyling & {
  marker: MarkerStyle;
  /** The dot a `minimize-by-priority` marker shrinks to. */
  minimized: MarkerStyle;
  clusterMarker: MarkerStyle;
};

//#endregion

//#region Styling

/**
 * Fills in each marker style's shape and size, and resolves unset colours to
 * the adaptive defaults for the style — so a style change changes the marker
 * styles, and with them the images.
 * @param styling - Styling as set by the user.
 * @param styleId - Id of the map's current style, if any.
 */
export function resolveMarkersStyling(styling: PointLayerMarkersStyling, styleId: string | undefined): ResolvedMarkersStyling {
  const marker = resolveMarkerStyle(styling.marker ?? {}, styleId);

  // as on DOM markers: the marker's own colours at `xs`, under any minimized overrides — and no content, which a dot can't show
  const minimized: MarkerStyle = { ...marker, size: DEFAULT_MINIMIZED_SIZE, ...styling.minimized };
  delete minimized.content;

  return {
    ...styling,
    marker,
    minimized,
    clusterMarker: styling.clusterMarker ? resolveMarkerStyle(styling.clusterMarker, styleId) : marker,
  };
}

function resolveMarkerStyle(marker: MarkerStyle, styleId: string | undefined): MarkerStyle {
  const shape = marker.shape ?? DEFAULT_SHAPE;
  const defaults = getAdaptiveColors(styleId ?? "", shape);

  return {
    ...marker,
    shape,
    size: marker.size ?? DEFAULT_SIZE,
    outerColor: marker.outerColor ?? defaults.outerColor,
    innerColor: marker.innerColor ?? defaults.innerColor,
    contentColor: marker.contentColor ?? defaults.contentColor,
    outlineColor: marker.outlineColor ?? defaults.outlineColor,
  };
}

//#endregion

//#region Layers

/** Ids of the marker sublayers. */
export function getMarkerLayerIds(layerId: string) {
  return {
    dot: `${layerId}-dot`,
    marker: `${layerId}-marker`,
    cluster: `${layerId}-cluster`,
  };
}

/**
 * Builds the marker sublayers, bottom first: minimized dots (under
 * `minimize-by-priority`), markers, then clusters (under `cluster`).
 * @param styling - Resolved styling (see {@link resolveMarkersStyling}).
 * @param context - Ids, collision behaviour and image prefixes.
 */
export function buildMarkerLayers(styling: ResolvedMarkersStyling, context: MarkersRenderContext): SublayerSpecification[] {
  const ids = getMarkerLayerIds(context.layerId);
  const behaviour = context.collisionBehaviour;
  const collides = behaviour === "hide-by-priority" || behaviour === "minimize-by-priority";
  const layers: SublayerSpecification[] = [];

  // every point gets a dot, always shown: a marker that wins its place covers its own dot, one that loses leaves it showing
  if (behaviour === "minimize-by-priority") {
    layers.push(symbolLayer(ids.dot, context.sourceId, styling.minimized, context.imagePrefixes.dot, { overlap: true }));
  }

  layers.push(
    symbolLayer(ids.marker, context.sourceId, styling.marker, getIconImage(styling.label, context.imagePrefixes.marker), {
      overlap: !collides,
      // placement goes by ascending sort key, so the highest priority is placed first
      sortKey: collides && styling.priority !== undefined ? negate(styling.priority) : undefined,
      filter: behaviour === "cluster" ? ["!", ["has", "point_count"]] : undefined,
    }),
  );

  if (behaviour === "cluster") {
    // the count is drawn into the image like a label, so clusters depth-sort with markers and use the marker font
    const count: ExpressionSpecification = ["concat", context.imagePrefixes.cluster, ["to-string", ["get", "point_count_abbreviated"]]];
    layers.push(symbolLayer(ids.cluster, context.sourceId, styling.clusterMarker, count, { overlap: true, filter: ["has", "point_count"] }));
  }

  return layers;
}

type SymbolLayerOptions = {
  /** Shows every symbol — no collision with each other or anything else. */
  overlap: boolean;
  sortKey?: number | ExpressionSpecification;
  filter?: ExpressionSpecification;
};

function symbolLayer(id: string, source: string, style: MarkerStyle, iconImage: string | ExpressionSpecification, options: SymbolLayerOptions): SublayerSpecification {
  const { shape = DEFAULT_SHAPE, size = DEFAULT_SIZE, opacity = 1 } = style;

  return {
    id,
    type: "symbol",
    source,
    ...(options.filter ? { filter: options.filter } : {}),
    layout: {
      "icon-image": iconImage,
      // the image is centred on the marker box, so the DOM marker's anchor offset applies as is
      "icon-offset": getShapeAnchorOffset(shape, size),
      "icon-pitch-alignment": "viewport",
      "icon-rotation-alignment": "viewport",
      "icon-allow-overlap": options.overlap,
      "icon-ignore-placement": options.overlap,
      // the collision box is the whole image, shadow margin included — trim it back to the marker, as DOM markers collide by theirs
      ...(options.overlap ? {} : { "icon-padding": [-getMarkerCanvasPadding(style)] }),
      ...(options.sortKey !== undefined ? { "symbol-sort-key": options.sortKey } : {}),
      // overlapping symbols sort by screen y, so nearer markers draw over further ones. Colliding
      // ones never overlap, and viewport-y would also make placement ignore the sort key.
      "symbol-z-order": options.overlap ? "viewport-y" : "auto",
    },
    paint: {
      "icon-opacity": opacity,
    },
  };
}

/** `<prefix><label>`, or just the prefix when there's no label. */
function getIconImage(label: PointLayerMarkersStyling["label"], prefix: string): string | ExpressionSpecification {
  if (label === undefined) return prefix;
  const labelExpression: ExpressionSpecification = typeof label === "string" ? ["get", label] : label;
  return ["concat", prefix, ["to-string", labelExpression]];
}

function negate(value: number | ExpressionSpecification): number | ExpressionSpecification {
  return typeof value === "number" ? -value : ["-", value];
}

//#endregion

//#region Images

/**
 * The marker images of one layer. Each image is the current marker style with
 * one label drawn in; a new style gets a new id prefix, so the layer requests
 * fresh images rather than reusing ones drawn for the old style.
 *
 * Images are drawn in a missing-image resolver (see `Map.addMissingStyleImageResolver`),
 * which MapLibre awaits before handing a tile its images — so every tile gets them.
 */
export class MarkerImages {
  private readonly layerId: string;
  private readonly role: MarkerImageRole;
  private style: MarkerStyle = {};
  private styleKey: string | null = null;
  private revision = 0;
  private readonly added = new Set<string>();
  /** Images being drawn, so tiles asking for the same image at once share one draw. */
  private readonly pending = new Map<string, Promise<void>>();

  /**
   * @param layerId - Id of the layer the images belong to.
   * @param role - What the images are for, kept in their ids so each role's images are told apart.
   */
  constructor(layerId: string, role: MarkerImageRole = "marker") {
    this.layerId = layerId;
    this.role = role;
  }

  /**
   * Sets the marker style the images are drawn with. A changed style removes
   * the images drawn for the old one.
   * @returns The image id prefix for the style.
   */
  setStyle(map: SDKMap | null, style: MarkerStyle): string {
    // opacity is applied by the layer, not baked in
    const imageStyle: MarkerStyle = { ...style };
    delete imageStyle.opacity;
    const key = JSON.stringify(imageStyle);

    if (key !== this.styleKey) {
      if (map) this.removeAll(map);
      this.style = imageStyle;
      this.styleKey = key;
      this.revision++;
    }

    return this.getPrefix();
  }

  /**
   * Draws and adds the image for `id`, if it's one of this layer's. Waits for
   * the marker font first, so labels are fitted and drawn in it.
   */
  resolve(map: SDKMap, id: string): Promise<void> {
    const prefix = this.getPrefix();
    if (!id.startsWith(prefix) || map.hasImage(id)) return Promise.resolve();

    let drawing = this.pending.get(id);
    if (!drawing) {
      drawing = this.drawAndAdd(map, id, prefix).finally(() => this.pending.delete(id));
      this.pending.set(id, drawing);
    }
    return drawing;
  }

  /** Removes every image added for this layer. */
  removeAll(map: SDKMap): void {
    for (const id of this.added) {
      if (map.hasImage(id)) map.removeImage(id);
    }
    this.added.clear();
  }

  private async drawAndAdd(map: SDKMap, id: string, prefix: string): Promise<void> {
    const label = id.slice(prefix.length);
    // the xs dot has no label
    const size = this.style.size ?? DEFAULT_SIZE;
    // nothing to redo once the font loads — awaiting it is the point
    if (label && size !== "xs") await onLabelFontLoad(label, CONTENT_METRICS[size].font, () => undefined);

    // the style may have changed, or the image been added, while the font loaded
    if (this.getPrefix() !== prefix || map.hasImage(id)) return;

    const { image, pixelRatio } = this.draw(label);
    map.addImage(id, image, { pixelRatio });
    this.added.add(id);
  }

  private getPrefix(): string {
    return `${this.layerId}-${this.role}-${String(this.revision)}:`;
  }

  private draw(label: string): { image: ImageData; pixelRatio: number } {
    // colours are already resolved, so no style id is needed here
    // a label replaces the marker's own content
    const { canvas, pixelRatio } = drawMarkerCanvas(label ? { ...this.style, content: label } : this.style);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    return { image: ctx.getImageData(0, 0, canvas.width, canvas.height), pixelRatio };
  }
}

//#endregion
