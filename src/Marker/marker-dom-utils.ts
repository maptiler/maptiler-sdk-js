import type { MarkerOptions } from "maplibre-gl";
import type { MapTilerMarkerBaseOptions, MapTilerMarkerIcon, MapTilerMarkerOptions, PendingMarkerUpdates, MapTilerMarkerSize } from "./types";
import { SHAPES, getShapeGeometry, type ContentMetrics, type ShapeGeometry, type ShapePrimitive, type ShapeSize } from "./marker-svg-config";
import { getMarkerIcon, getMarkerTemplate } from "./marker-content-registry";
import { getAdaptiveColors, type AdaptiveColorSet } from "./marker-adaptive-colors";
import {
  ALTITUDE_HIDDEN_CLASSNAME,
  ALTITUDE_OCCLUDED_CLASSNAME,
  COLLISION_CULLED_CLASSNAME,
  COLLISION_FADE_CLASSNAME,
  COLLISION_HIDDEN_CLASSNAME,
  CONTENT_METRICS,
  CUSTOM_ELEMENT_CLASSNAME,
  DEBUG_COLOR,
  DEFAULT_CONTENT_CLASSNAME,
  DOT_RING_PX,
  DEFAULT_OUTLINE_WIDTH,
  DEFAULT_SHADOW_BY_SIZE,
  DEFAULT_SHAPE,
  DEFAULT_SIZE,
  GLYPH_VIEWBOX_SIZE,
  MARKER_FONT_CLASSNAME,
  MINIMIZED_DOT_CLASSNAME,
  SHADOW_FILTER,
  SHAPE_SVG_CLASSNAME,
  SIZE_PX,
  SVG_NS,
  TEXT_LETTER_SPACING_EM,
} from "./marker-constants";

//#region Layout

/** Everything content placement needs for one shape at one size. */
type MarkerLayout = { size: ShapeSize; geometry: ShapeGeometry; metrics: ContentMetrics; defaultIcon?: MapTilerMarkerIcon };

function getLayout(shapeKey: NonNullable<MapTilerMarkerBaseOptions["shape"]>, sizeKey: ShapeSize): MarkerLayout {
  return { size: sizeKey, geometry: getShapeGeometry(shapeKey, sizeKey), metrics: CONTENT_METRICS[sizeKey], defaultIcon: SHAPES[shapeKey].defaultIcon };
}

/** Size a shape SVG was built at (recorded on the SVG by {@link createShapeSvgTemplate}). */
function getSvgSize(svg: SVGSVGElement): ShapeSize {
  return (svg.dataset.size ?? "m") as ShapeSize;
}

/** Layout a shape SVG was built for — recorded on the SVG itself, so it stays right while the marker sits at `xs`. */
function getSvgLayout(svg: SVGSVGElement): MarkerLayout {
  return getLayout((svg.dataset.shape ?? DEFAULT_SHAPE) as NonNullable<MapTilerMarkerBaseOptions["shape"]>, getSvgSize(svg));
}

//#endregion

//#region svgEl

// helper to create namespaced svg element
function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag) as SVGElementTagNameMap[K];
}

//#endregion

//#region createMarkerElement

/**
 * Resolves the inner transform wrapper from a marker's outer root element
 * (or returns `element` itself when it already is the wrapper, or has none).
 * @param element - The marker's outer root element.
 */
export function resolveMarkerWrapper(element: HTMLElement): HTMLElement {
  return element.classList.contains(CUSTOM_ELEMENT_CLASSNAME) ? element : (element.querySelector<HTMLElement>(`.${CUSTOM_ELEMENT_CLASSNAME}`) ?? element);
}

/**
 * Seeds the CSS custom properties that drive marker colors and shadow.
 * Used on the generated wrapper, and on user-supplied custom elements so
 * their styles can consume the same variables.
 * @param element - Element to receive the custom properties.
 * @param options - Resolved marker options.
 */
export function applyMarkerStyleVariables(element: HTMLElement | SVGElement, options: MapTilerMarkerOptions): void {
  // unset colours can only resolve to the `base` defaults here — the marker
  // has no map yet; MarkerManager re-resolves on registration
  const defaults = getAdaptiveColors("");

  element.style.setProperty("--marker-outer-color", options.outerColor ?? defaults.outerColor);
  element.style.setProperty("--marker-inner-color", options.innerColor ?? defaults.innerColor);
  element.style.setProperty("--marker-content-color", options.contentColor ?? defaults.contentColor);
  element.style.setProperty("--marker-outline-color", options.outlineColor ?? defaults.outlineColor);
  applyShadow(element, options.shadow, options.size ?? DEFAULT_SIZE);
}

/**
 * Sets the shadow filter variable. An unset shadow follows the size's default
 * and is re-resolved whenever the size changes (an explicit one is tracked via `data-marker-shadow`).
 */
function applyShadow(element: HTMLElement | SVGElement, shadow: MapTilerMarkerBaseOptions["shadow"], size: MapTilerMarkerSize): void {
  if (shadow) element.dataset.markerShadow = shadow;
  else delete element.dataset.markerShadow;
  element.style.setProperty("--marker-shadow", SHADOW_FILTER[shadow ?? DEFAULT_SHADOW_BY_SIZE[size]]);
}

/**
 * Creates the root wrapper `div` for a marker, seeding all CSS custom
 * properties and the initial `data-*` attributes used by {@link applyTransform}.
 * @param options - Resolved marker options.
 * @returns The outer root element, ready to be handed to MapLibre.
 */
export function createMarkerElement(options: MapTilerMarkerOptions): HTMLDivElement {
  const shapeKey = options.shape ?? DEFAULT_SHAPE;
  const sizeKey = options.size ?? DEFAULT_SIZE;

  // wrapper: carries transform, opacity, and all CSS custom properties
  const wrapper = document.createElement("div");
  wrapper.className = CUSTOM_ELEMENT_CLASSNAME;
  // scale/rotate around the shape's anchor point so it stays on the lngLat
  wrapper.style.transformOrigin = SHAPES[shapeKey].anchor === "center" ? "center" : "center bottom";
  wrapper.dataset.markerShape = shapeKey;
  wrapper.dataset.markerSize = sizeKey;

  applyMarkerStyleVariables(wrapper, options);

  const [sx, sy] = options.scale ?? [1, 1];

  // we pass scale & rotation via dataset and build the transform string
  // at DOM flush time to avoid awkward overwrites of rotation or other transforms.
  wrapper.dataset.scaleX = String(sx);
  wrapper.dataset.scaleY = String(sy);
  wrapper.dataset.rotation = String(options.rotation ?? 0);
  applyTransform(wrapper);

  // TODO: test if this conflicts with the MapLibre opacity...
  if (options.opacity !== undefined) wrapper.style.opacity = String(options.opacity);
  if (options.name) wrapper.classList.add(options.name);

  wrapper.appendChild(sizeKey === "xs" ? buildDotSvg() : buildShapeSvg(shapeKey, sizeKey, options));

  if (options.debug) applyDebug(wrapper, true);

  const outer = wrap(wrapper);
  if (options.title) outer.setAttribute("title", options.title);

  if (options.htmlAttributes) {
    for (const [attr, val] of Object.entries(options.htmlAttributes)) {
      outer.setAttribute(attr, String(val));
    }
  }

  forwardPointerEvents(outer);
  return outer;
}

//#endregion

//#region updateMarkerElement

/**
 * Commits a batch of pending property updates onto a live marker element.
 * Called by `Marker[FlushDOMUpdatesSymbol]()` when there are pending updates.
 * A key being present in `props` (even with an `undefined` value) means
 * "apply this property".
 * @param element - The marker's outer root element.
 * @param props - Pending property updates.
 * @param styleId - Current map style id, used to resolve unset colours to their map-style defaults.
 */
export function updateMarkerElement(element: HTMLElement, props: PendingMarkerUpdates, styleId?: string): void {
  // `element` is the outer MapLibre-positioned container; all marker state
  // (CSS custom properties, transform dataset, the SVG itself) lives on the
  // inner transform wrapper. Updates must target the wrapper — writing to the
  // outer element either gets masked by the wrapper's inline values (CSS vars)
  // or clobbered by MapLibre (transform).
  const wrapper = resolveMarkerWrapper(element);

  // an undefined colour means "use the map-style default"
  let defaults: AdaptiveColorSet | undefined;
  const getDefaults = () => (defaults ??= getAdaptiveColors(styleId ?? ""));

  if ("outerColor" in props) {
    wrapper.style.setProperty("--marker-outer-color", props.outerColor ?? getDefaults().outerColor);
  }

  if ("innerColor" in props) {
    wrapper.style.setProperty("--marker-inner-color", props.innerColor ?? getDefaults().innerColor);
  }

  if ("contentColor" in props) {
    wrapper.style.setProperty("--marker-content-color", props.contentColor ?? getDefaults().contentColor);
    const contentEl = wrapper.querySelector(".marker-content");
    if (contentEl) contentEl.setAttribute("fill", "var(--marker-content-color)");
  }

  if ("outlineColor" in props) {
    wrapper.style.setProperty("--marker-outline-color", props.outlineColor ?? getDefaults().outlineColor);
  }

  if ("outline" in props) {
    const outerPath = wrapper.querySelector<SVGGeometryElement>(".marker-outer");
    if (props.outline) {
      const width = props.outline === true ? DEFAULT_OUTLINE_WIDTH : props.outline;
      outerPath?.setAttribute("stroke-width", String(width));
    } else {
      outerPath?.removeAttribute("stroke-width");
    }
  }

  if ("shadow" in props) {
    applyShadow(wrapper, props.shadow, (props.size ?? wrapper.dataset.markerSize ?? DEFAULT_SIZE) as MapTilerMarkerSize);
  }

  if ("opacity" in props) {
    wrapper.style.opacity = props.opacity === undefined ? "" : String(props.opacity);
  }

  if ("title" in props) {
    // native tooltip on the outer root element — not the rendered content
    if (props.title) {
      element.setAttribute("title", props.title);
    } else {
      element.removeAttribute("title");
    }
  }

  if ("content" in props) {
    applyContent(wrapper, props.content);
  }

  if ("htmlAttributes" in props && props.htmlAttributes) {
    for (const [attr, attrVal] of Object.entries(props.htmlAttributes)) {
      element.setAttribute(attr, String(attrVal));
    }
  }

  if ("rotation" in props) {
    wrapper.dataset.rotation = String(props.rotation ?? 0);
    applyTransform(wrapper);
  }

  if ("scale" in props) {
    const [x, y] = props.scale ?? [1, 1];
    wrapper.dataset.scaleX = String(x);
    wrapper.dataset.scaleY = String(y);
    applyTransform(wrapper);
  }

  if ("size" in props) {
    const size = props.size ?? DEFAULT_SIZE;
    applySize(wrapper, size);
    // an unset shadow follows the new size's default
    if (!wrapper.dataset.markerShadow) applyShadow(wrapper, undefined, size);
  }

  if ("shape" in props) {
    applyShape(wrapper, props.shape ?? DEFAULT_SHAPE);
  }

  if ("debug" in props) {
    applyDebug(wrapper, Boolean(props.debug));
  }

  if ("priority" in props) {
    // z-index must sit on the outer MapLibre-positioned element (the
    // stacking sibling), not the inner wrapper — unlike the other props.
    // Expression-form priorities are resolved by the collision engine, not here.
    if (typeof props.priority === "number") {
      element.style.zIndex = String(props.priority);
    } else {
      element.style.removeProperty("z-index");
    }
  }
}

//#endregion

//#region getShapeSvg

/** Returns the shape SVG of a marker wrapper, or `null` when the marker was constructed at `xs` size (dot only). */
function getShapeSvg(wrapper: HTMLElement): SVGSVGElement | null {
  return wrapper.querySelector<SVGSVGElement>(`svg.${SHAPE_SVG_CLASSNAME}`);
}

//#endregion

//#region applyContent

/**
 * Applies a text-content update to a live marker.
 * Only text content is managed here: an existing text label is updated or
 * removed; non-text content (glyph / image / element) is replaced by a text
 * label only when a non-empty value is given, never removed by a clear.
 * @param wrapper - The marker wrapper element.
 * @param value - Label string, or `undefined` to clear an existing text label.
 */
function applyContent(wrapper: HTMLElement, value: string | undefined): void {
  const svg = getShapeSvg(wrapper);
  if (!svg) return;

  const existing = svg.querySelector(".marker-content");
  const layout = getSvgLayout(svg);

  if (existing instanceof SVGTextElement) {
    if (value) {
      // the label's length can change its size (one character on S is larger)
      setTextLabel(existing, value, layout);
    } else {
      existing.remove();
      ensureDefaultContent(svg, layout);
    }
    return;
  }

  if (!value) return;

  existing?.remove();
  setInnerFillHidden(svg, false); // an image may have hidden it
  appendTextContent(svg, value, layout);
}

//#endregion

//#region applySize

/**
 * Rebuilds the shape SVG for the new size (each size has its own geometry),
 * or swaps it for the dot when entering `xs` (`xs` uses a dot SVG rather
 * than a shape SVG).
 * @param wrapper - The marker wrapper element.
 * @param size - The new size key.
 */
function applySize(wrapper: HTMLElement, size: MapTilerMarkerSize): void {
  const shapeSvg = getShapeSvg(wrapper);
  const dotSvg = wrapper.querySelector<SVGSVGElement>("svg.marker-dot");

  wrapper.dataset.markerSize = size;

  if (size === "xs") {
    // hide (don't remove) the shape SVG so its content/outline survive the
    // round-trip back out of xs
    if (shapeSvg) shapeSvg.style.display = "none";
    if (!dotSvg) wrapper.appendChild(buildDotSvg());
    return;
  }

  dotSvg?.remove();

  const shapeKey = (wrapper.dataset.markerShape ?? DEFAULT_SHAPE) as NonNullable<MapTilerMarkerBaseOptions["shape"]>;

  if (!shapeSvg) {
    // marker was constructed at xs size — no shape SVG to restore, build fresh
    // (content not reconstructed here)
    wrapper.appendChild(buildShapeSvg(shapeKey, size));
    return;
  }

  // restore (if hidden) at the new size's geometry
  replaceShapeSvg(shapeSvg, shapeKey, size).style.display = "block";
}

//#endregion

//#region applyDebug

/**
 * Attaches or removes the debug overlay: a dashed outline around the marker
 * element's bounding box plus a crosshair and dot at its center. Lives
 * inside the transform wrapper, so it follows scale and rotation.
 * @param wrapper - The marker wrapper element.
 * @param enabled - Whether the overlay should be shown.
 */
function applyDebug(wrapper: HTMLElement, enabled: boolean): void {
  // may be called with either the inner transform wrapper (creation) or the
  // outer MapLibre-positioned element (updates) — always attach to the inner
  // wrapper, and never touch the outer element's positioning.
  const target = wrapper.classList.contains(CUSTOM_ELEMENT_CLASSNAME) ? wrapper : wrapper.querySelector<HTMLElement>(`.${CUSTOM_ELEMENT_CLASSNAME}`);
  if (!target) return;

  const existing = target.querySelector(".marker-debug");

  if (!enabled) {
    existing?.remove();
    return;
  }

  if (existing) return;

  // anchor the absolutely-positioned overlay to the wrapper
  target.style.position = "relative";
  target.appendChild(buildDebugOverlay());
}

/**
 * Builds the debug overlay SVG (bounding box, center crosshair, center dot).
 * All strokes use `vector-effect: non-scaling-stroke`, so the overlay renders
 * at a constant on-screen weight no matter how far the wrapper is CSS-scaled.
 */
function buildDebugOverlay(): SVGSVGElement {
  const svg = svgEl("svg");
  svg.classList.add("marker-debug");
  svg.style.position = "absolute";
  svg.style.inset = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.overflow = "visible";
  svg.style.pointerEvents = "none";

  const box = svgEl("rect");
  box.setAttribute("x", "0");
  box.setAttribute("y", "0");
  box.setAttribute("width", "100%");
  box.setAttribute("height", "100%");
  box.setAttribute("fill", "none");
  box.setAttribute("stroke-dasharray", "4 4");
  svg.appendChild(box);

  const hLine = svgEl("line");
  hLine.setAttribute("x1", "0");
  hLine.setAttribute("y1", "50%");
  hLine.setAttribute("x2", "100%");
  hLine.setAttribute("y2", "50%");
  hLine.setAttribute("opacity", "0.5");
  svg.appendChild(hLine);

  const vLine = svgEl("line");
  vLine.setAttribute("x1", "50%");
  vLine.setAttribute("y1", "0");
  vLine.setAttribute("x2", "50%");
  vLine.setAttribute("y2", "100%");
  vLine.setAttribute("opacity", "0.5");
  svg.appendChild(vLine);

  // zero-length round-capped line renders as a fixed-size dot — unlike a
  // filled circle, its stroke is exempt from scaling via non-scaling-stroke
  const dot = svgEl("line");
  dot.setAttribute("x1", "50%");
  dot.setAttribute("y1", "50%");
  dot.setAttribute("x2", "50%");
  dot.setAttribute("y2", "50%");
  dot.setAttribute("stroke-linecap", "round");
  dot.setAttribute("stroke-width", "5");
  svg.appendChild(dot);

  for (const part of [box, hLine, vLine, dot]) {
    part.setAttribute("stroke", DEBUG_COLOR);
    if (!part.hasAttribute("stroke-width")) part.setAttribute("stroke-width", "1");
    part.setAttribute("vector-effect", "non-scaling-stroke");
  }

  return svg;
}

//#endregion

//#region applyShape

/**
 * Swaps the marker body to a new shape, rebuilding the SVG in place and
 * migrating any existing content (text / image / element) to the new
 * shape's content geometry.
 * @param wrapper - The marker wrapper element.
 * @param shape - The new shape key.
 */
function applyShape(wrapper: HTMLElement, shape: NonNullable<MapTilerMarkerBaseOptions["shape"]>): void {
  wrapper.dataset.markerShape = shape;
  wrapper.style.transformOrigin = SHAPES[shape].anchor === "center" ? "center" : "center bottom";

  // the shape SVG exists even at xs size (hidden behind the dot); a marker
  // constructed at xs size has none, and gets its SVG built on the next size change
  const existingSvg = getShapeSvg(wrapper);
  if (!existingSvg) return;

  // while hidden at xs size, keep the size the SVG was last built at — restoring rebuilds it anyway
  const sizeKey = (wrapper.dataset.markerSize ?? DEFAULT_SIZE) as MapTilerMarkerSize;
  replaceShapeSvg(existingSvg, shape, sizeKey === "xs" ? getSvgSize(existingSvg) : sizeKey);
}

/**
 * Swaps `existingSvg` for a freshly built shape SVG, carrying over the
 * outline width, content and visibility.
 * @returns The new SVG.
 */
function replaceShapeSvg(existingSvg: SVGSVGElement, shape: NonNullable<MapTilerMarkerBaseOptions["shape"]>, size: ShapeSize): SVGSVGElement {
  const newSvg = buildShapeSvg(shape, size);
  const layout = getLayout(shape, size);

  // preserve outline width (stored as an attribute on the outer path)
  const strokeWidth = existingSvg.querySelector(".marker-outer")?.getAttribute("stroke-width");
  if (strokeWidth) newSvg.querySelector(".marker-outer")?.setAttribute("stroke-width", strokeWidth);

  migrateContent(existingSvg, newSvg, layout);
  ensureDefaultContent(newSvg, layout);
  newSvg.style.display = existingSvg.style.display; // stay hidden while at xs size
  existingSvg.replaceWith(newSvg);
  return newSvg;
}

/**
 * Re-creates the `.marker-content` layer from `oldSvg` inside `newSvg`,
 * repositioned for the new shape/size's content geometry.
 */
function migrateContent(oldSvg: SVGSVGElement, newSvg: SVGSVGElement, layout: MarkerLayout): void {
  const content = oldSvg.querySelector(".marker-content");
  // the old shape's default glyph isn't user content — the new shape supplies its own
  if (!content || content.classList.contains(DEFAULT_CONTENT_CLASSNAME)) return;

  // icons are re-drawn for the new size's icon box and content centre
  if (content instanceof SVGGElement && content.dataset.icon) {
    appendIconContent(newSvg, content.dataset.icon, layout);
    return;
  }

  if (content instanceof SVGGElement) {
    // SVG-template glyph: move it and refit to the new icon box
    content.setAttribute("transform", glyphTransform(layout));
    newSvg.appendChild(content);
    return;
  }

  if (content instanceof SVGImageElement) {
    const href = content.getAttribute("href");
    if (href) appendImageContent(newSvg, href, layout);
    return;
  }

  if (content instanceof SVGForeignObjectElement) {
    const child = content.firstElementChild;
    if (child instanceof HTMLElement || child instanceof SVGElement) appendElementContent(newSvg, child, layout);
    return;
  }

  if (content instanceof SVGTextElement && content.textContent) {
    appendTextContent(newSvg, content.textContent, layout);
  }
}

//#endregion

//#region buildDotSvg

/** Built once and cloned per marker — never attached or mutated itself. */
let dotSvgTemplate: SVGSVGElement | undefined;

/** Builds the minimal dot SVG used for the `xs` size. */
function buildDotSvg(): SVGSVGElement {
  dotSvgTemplate ??= createDotSvgTemplate();
  return dotSvgTemplate.cloneNode(true) as SVGSVGElement;
}

function createDotSvgTemplate(): SVGSVGElement {
  const svg = svgEl("svg");
  svg.classList.add("marker-dot");
  const diameter = SIZE_PX.xs;
  svg.setAttribute("viewBox", `0 0 ${String(diameter)} ${String(diameter)}`);
  svg.setAttribute("width", String(diameter));
  svg.setAttribute("height", String(diameter));
  svg.style.display = "block";
  svg.style.overflow = "visible";
  svg.style.filter = "var(--marker-shadow)";

  // the outer-colour disc with the inner-colour disc DOT_RING_PX inside it
  const center = diameter / 2;
  const outer = buildPrimitive({ type: "circle", cx: center, cy: center, r: center });
  outer.style.fill = "var(--marker-outer-color)";
  const inner = buildPrimitive({ type: "circle", cx: center, cy: center, r: center - DOT_RING_PX });
  inner.style.fill = "var(--marker-inner-color)";
  svg.append(outer, inner);

  return svg;
}

//#endregion

//#region applyCollisionHidden

/** Toggles the collision-hidden fade (rules live in the SDK stylesheet). */
export function applyCollisionHidden(element: HTMLElement, hidden: boolean): void {
  element.classList.add(COLLISION_FADE_CLASSNAME);
  element.classList.toggle(COLLISION_HIDDEN_CLASSNAME, hidden);
}

/** Removes the fade class — only call once no fade/dip is in flight, or it cuts the animation short. */
export function releaseCollisionFadeClass(element: HTMLElement): void {
  element.classList.remove(COLLISION_FADE_CLASSNAME);
}

/**
 * `display: none`s a collision-hidden marker once its fade completes. Un-culling doesn't flush
 * layout itself — {@link MarkerManagerImpl} batches that once per pass.
 * @returns `true` when the call actually changed the culled state.
 */
export function applyCollisionCulled(element: HTMLElement, culled: boolean): boolean {
  if (culled) {
    if (element.classList.contains(COLLISION_CULLED_CLASSNAME)) return false;
    element.classList.add(COLLISION_CULLED_CLASSNAME);
    return true;
  }
  if (!element.classList.contains(COLLISION_CULLED_CLASSNAME)) return false;
  element.classList.remove(COLLISION_CULLED_CLASSNAME);
  return true;
}

//#endregion

//#region applyAltitudeHidden

/** Hides a marker with no valid altitude-projected position this frame (off-screen/behind camera). Not the below-ground case — see {@link applyAltitudeOccluded}. */
export function applyAltitudeHidden(element: HTMLElement, hidden: boolean): void {
  element.classList.toggle(ALTITUDE_HIDDEN_CLASSNAME, hidden);
}

//#endregion

//#region applyAltitudeOccluded

/** Fades a below-ground marker (DOM markers aren't depth-tested against terrain) — position and pointer events stay real, only opacity changes. */
export function applyAltitudeOccluded(element: HTMLElement, occluded: boolean): void {
  element.classList.toggle(ALTITUDE_OCCLUDED_CLASSNAME, occluded);
}

//#endregion

//#region applyMinimizedDot

/** Minimized rendering for custom `element` markers: hides its content via `visibility` (keeps the layout box for positioning) and overlays a dot on the anchor point. SVG-root elements get hidden without a dot. */
export function applyMinimizedDot(element: HTMLElement | SVGElement, anchor: NonNullable<MarkerOptions["anchor"]>, enabled: boolean): void {
  const existing = element.querySelector<SVGSVGElement>(`svg.${MINIMIZED_DOT_CLASSNAME}`);

  if (!enabled) {
    existing?.remove();
    element.style.visibility = "";
    return;
  }

  // children inherit `hidden` but can override it — the dot opts back in
  element.style.visibility = "hidden";

  if (existing || !(element instanceof HTMLElement)) return;

  const dot = buildDotSvg();
  dot.classList.add(MINIMIZED_DOT_CLASSNAME);
  dot.style.visibility = "visible";
  dot.style.position = "absolute";
  dot.style.left = anchor.includes("left") ? "0%" : anchor.includes("right") ? "100%" : "50%";
  dot.style.top = anchor.includes("top") ? "0%" : anchor.includes("bottom") ? "100%" : "50%";
  dot.style.transform = "translate(-50%, -50%)";

  element.style.position = "relative";
  element.appendChild(dot);
}

//#endregion

//#region buildShapeSvg

/** Bare shape SVGs (no outline or content) keyed by shape and size — built once, cloned per marker, never attached or mutated themselves. */
const shapeSvgTemplates = new Map<string, SVGSVGElement>();

/**
 * Builds the full shape SVG for every size except `xs`, by cloning a cached
 * per-shape-and-size template. Only the per-marker parts (outline, content)
 * are applied to the clone.
 * @param shapeKey - Shape variant to render.
 * @param sizeKey - Target pixel height; drives `width`/`height` attributes via aspect ratio.
 * @param options - When provided, applies outline and appends the content layer.
 */
function buildShapeSvg(shapeKey: NonNullable<MapTilerMarkerBaseOptions["shape"]>, sizeKey: ShapeSize, options?: MapTilerMarkerOptions): SVGSVGElement {
  const cacheKey = `${shapeKey}:${sizeKey}`;
  let template = shapeSvgTemplates.get(cacheKey);
  if (!template) {
    template = createShapeSvgTemplate(shapeKey, sizeKey);
    shapeSvgTemplates.set(cacheKey, template);
  }

  const svg = template.cloneNode(true) as SVGSVGElement;

  if (options) {
    // the outer path is always the template's first child
    applyOutlineToPath(svg.firstElementChild as SVGGeometryElement, options);
    appendContent(svg, options, getLayout(shapeKey, sizeKey));
  }

  return svg;
}

function createShapeSvgTemplate(shapeKey: NonNullable<MapTilerMarkerBaseOptions["shape"]>, sizeKey: ShapeSize): SVGSVGElement {
  const geometry = getShapeGeometry(shapeKey, sizeKey);
  const sizePx = SIZE_PX[sizeKey];

  const svg = svgEl("svg");
  svg.classList.add(SHAPE_SVG_CLASSNAME);
  // the viewBox is the marker box itself — geometry is in px, 1 unit = 1px
  svg.setAttribute("viewBox", `0 0 ${String(sizePx)} ${String(sizePx)}`);
  svg.setAttribute("width", String(sizePx));
  svg.setAttribute("height", String(sizePx));
  svg.style.display = "block";
  svg.style.overflow = "visible";
  svg.style.filter = "var(--marker-shadow)";
  svg.dataset.shape = shapeKey;
  svg.dataset.size = sizeKey;

  const outer = buildPrimitive(geometry.outer);
  outer.classList.add("marker-outer");
  // stroke width in screen pixels, unaffected by the wrapper's scale transform
  outer.setAttribute("vector-effect", "non-scaling-stroke");
  outer.style.fill = "var(--marker-outer-color)";
  outer.style.stroke = "var(--marker-outline-color)";
  svg.appendChild(outer);

  // separate elements, like the design — merging them would change edge anti-aliasing where they overlap
  for (const primitive of geometry.inner) {
    const inner = buildPrimitive(primitive);
    inner.classList.add("marker-inner");
    inner.style.fill = "var(--marker-inner-color)";
    svg.appendChild(inner);
  }

  return svg;
}

//#endregion

//#region buildPrimitive

/** Builds the SVG element for a shape primitive — `<path>`, `<circle>` or `<rect>`. */
function buildPrimitive(primitive: ShapePrimitive): SVGGeometryElement {
  switch (primitive.type) {
    case "circle": {
      const circle = svgEl("circle");
      circle.setAttribute("cx", String(primitive.cx));
      circle.setAttribute("cy", String(primitive.cy));
      circle.setAttribute("r", String(primitive.r));
      return circle;
    }
    case "rect": {
      const rect = svgEl("rect");
      rect.setAttribute("x", String(primitive.x));
      rect.setAttribute("y", String(primitive.y));
      rect.setAttribute("width", String(primitive.w));
      rect.setAttribute("height", String(primitive.h));
      rect.setAttribute("rx", String(primitive.rx));
      return rect;
    }
    case "path": {
      const path = svgEl("path");
      path.setAttribute("d", primitive.d);
      return path;
    }
  }
}

//#endregion

//#region applyTransform

/** Composes `data-scaleX/scaleY/rotation/lift` into one CSS `transform`, so setting one never clobbers the others. `translateY` first (outermost) keeps lift a fixed px offset unaffected by scale. */
function applyTransform(wrapper: HTMLElement): void {
  const sx = wrapper.dataset.scaleX ?? "1";
  const sy = wrapper.dataset.scaleY ?? "1";
  const rot = wrapper.dataset.rotation ?? "0";
  const lift = wrapper.dataset.lift ?? "0";
  wrapper.style.transform = `translateY(${lift}px) scale(${sx}, ${sy}) rotate(${rot}deg)`;
}

/** Sets the lifecycle-animation vertical offset in CSS px. Animation-only, bypasses {@link updateMarkerElement}'s batching. */
export function applyLifecycleLift(element: HTMLElement, liftPx: number): void {
  const wrapper = resolveMarkerWrapper(element);
  wrapper.dataset.lift = String(liftPx);
  applyTransform(wrapper);
}

//#endregion

//#region applyOutlineToPath

/**
 * Sets `stroke-width` on the outer path when `options.outline` is truthy.
 * @param path - The `.marker-outer` path element.
 * @param options - Marker options carrying the `outline` value.
 */
function applyOutlineToPath(path: SVGGeometryElement, options: MapTilerMarkerOptions): void {
  if (!options.outline) return;
  const width = options.outline === true ? DEFAULT_OUTLINE_WIDTH : options.outline;
  path.setAttribute("stroke-width", String(width));
}

//#endregion

//#region appendContent

let clipIdCounter = 0;

/**
 * Appends the content layer to a shape SVG.
 * Priority: `icon` → `url` → `template` → `element` → `content` text.
 * Renders nothing when none of those fields is provided
 * ({@link MarkerContentTypeNone} without `content`).
 * @param svg - Target SVG element.
 * @param options - Marker options carrying the content variant.
 * @param layout - Shape geometry and content metrics for the marker's shape and size.
 */
function appendContent(svg: SVGSVGElement, options: MapTilerMarkerOptions, layout: MarkerLayout): void {
  if ("icon" in options && options.icon) {
    appendIconContent(svg, options.icon, layout);
    return;
  }

  if ("url" in options && options.url) {
    appendImageContent(svg, options.url, layout);
    return;
  }

  if ("template" in options && options.template) {
    appendTemplateContent(svg, options.template, options.templateParams, layout);
    return;
  }

  if ("element" in options && options.element) {
    appendElementContent(svg, options.element, layout);
    return;
  }

  if (options.content) {
    appendTextContent(svg, options.content, layout);
    return;
  }

  appendDefaultContent(svg, layout);
}

/**
 * Appends the shape's default icon, when it has one — drawn exactly like
 * `icon` content, plus a marker class so shape changes know not to migrate it.
 */
function appendDefaultContent(svg: SVGSVGElement, layout: MarkerLayout): void {
  if (!layout.defaultIcon) return;
  appendIconContent(svg, layout.defaultIcon, layout)?.classList.add(DEFAULT_CONTENT_CLASSNAME);
}

/** Restores the shape's default glyph when the SVG has no content layer. */
function ensureDefaultContent(svg: SVGSVGElement, layout: MarkerLayout): void {
  if (!svg.querySelector(".marker-content")) appendDefaultContent(svg, layout);
}

/** Parsed icon sources, keyed by the SVG markup itself — parsed once, cloned per marker. */
const iconTemplates = new Map<string, SVGSVGElement>();

function parseIconSvg(source: string): SVGSVGElement | null {
  let parsed = iconTemplates.get(source);
  if (!parsed) {
    const root = new DOMParser().parseFromString(source, "image/svg+xml").documentElement;
    if (!(root instanceof SVGSVGElement)) return null;
    parsed = root;
    iconTemplates.set(source, parsed);
  }
  return parsed;
}

/**
 * Appends a registered icon in the content colour, scaled to the size's icon
 * box and centred on the content box. Unknown identifiers warn and render nothing.
 */
function appendIconContent(svg: SVGSVGElement, icon: string, layout: MarkerLayout): SVGGElement | null {
  const source = getMarkerIcon(icon);
  const iconSvg = source ? parseIconSvg(source) : null;

  if (!iconSvg) {
    console.warn(`Unknown marker icon "${icon}".`);
    return null;
  }

  const { cx, cy } = layout.geometry.content;
  const box = layout.metrics.icon;
  // built-in sources are designed at the L icon box (16px) and scaled down for M and S
  const viewBoxWidth = iconSvg.viewBox.baseVal.width || box;
  const scale = box / viewBoxWidth;

  const g = svgEl("g");
  g.classList.add("marker-content");
  g.dataset.icon = icon;
  g.setAttribute("fill", "var(--marker-content-color)");
  g.setAttribute("transform", `translate(${String(cx - box / 2)}, ${String(cy - box / 2)})${scale === 1 ? "" : ` scale(${String(scale)})`}`);

  for (const child of iconSvg.children) {
    const node = document.importNode(child, true);
    // the design's own fill (e.g. black) gives way to the content colour inherited from the group
    for (const el of [node, ...node.querySelectorAll("*")]) {
      if (el.getAttribute("fill") !== "none") el.removeAttribute("fill");
    }
    g.appendChild(node);
  }

  svg.appendChild(g);
  return g;
}

/**
 * Appends content produced by a registered template factory. Strings render
 * as marker text, HTML elements in a foreignObject, SVG elements as glyphs.
 * Unknown identifiers warn and render nothing.
 */
function appendTemplateContent(svg: SVGSVGElement, template: string, params: Record<string, number | string> | undefined, layout: MarkerLayout): void {
  const factory = getMarkerTemplate(template);

  if (!factory) {
    console.warn(`Unknown marker template "${template}".`);
    return;
  }

  const produced = factory(params);

  if (typeof produced === "string") {
    appendTextContent(svg, produced, layout);
  } else if (produced instanceof SVGElement) {
    appendGlyphContent(svg, produced, layout);
  } else {
    appendElementContent(svg, produced, layout);
  }
}

/**
 * Wraps an SVG glyph (designed in a {@link GLYPH_VIEWBOX_SIZE}-unit square)
 * in a `<g>` scaled to the icon box and centred on the content box.
 */
function appendGlyphContent(svg: SVGSVGElement, glyph: SVGElement, layout: MarkerLayout): void {
  const g = svgEl("g");
  g.classList.add("marker-content");
  g.setAttribute("fill", "var(--marker-content-color)");
  g.setAttribute("transform", glyphTransform(layout));
  g.appendChild(glyph);
  svg.appendChild(g);
}

/** Transform that fits the glyph design box into the icon box. */
function glyphTransform(layout: MarkerLayout): string {
  const { cx, cy } = layout.geometry.content;
  const { icon } = layout.metrics;
  const scale = icon / GLYPH_VIEWBOX_SIZE;
  return `translate(${String(cx - icon / 2)}, ${String(cy - icon / 2)}) scale(${String(scale)})`;
}

/**
 * Appends image content filling the shape's inner body edge to edge, clipped
 * to its outline.
 */
function appendImageContent(svg: SVGSVGElement, href: string, layout: MarkerLayout): void {
  const { clip } = layout.geometry;

  // the image covers the whole inner fill, edge to edge — painting the fill
  // underneath would let it bleed through the image's anti-aliased edge as a
  // hairline between the photo and the outer ring
  setInnerFillHidden(svg, true);

  const img = svgEl("image");
  img.classList.add("marker-content");
  img.setAttribute("href", href);
  img.setAttribute("preserveAspectRatio", "xMidYMid slice");
  img.setAttribute("clip-path", appendContentClip(svg, layout));
  img.setAttribute("x", String(clip.x));
  img.setAttribute("y", String(clip.y));
  img.setAttribute("width", String(clip.w));
  img.setAttribute("height", String(clip.h));
  svg.appendChild(img);
}

/** Hides (or restores) the inner-colour fill elements of a shape SVG. */
function setInnerFillHidden(svg: SVGSVGElement, hidden: boolean): void {
  for (const inner of svg.querySelectorAll<SVGElement>(".marker-inner")) {
    inner.style.visibility = hidden ? "hidden" : "";
  }
}

/**
 * Appends a `<clipPath>` for the shape's inner body and returns its
 * `url(#…)` reference — used to keep content inside the inner fill.
 */
function appendContentClip(svg: SVGSVGElement, layout: MarkerLayout): string {
  const clipId = `maptiler-marker-clip-${String(++clipIdCounter)}`;
  const clip = svgEl("clipPath");
  clip.setAttribute("id", clipId);

  clip.appendChild(buildPrimitive(layout.geometry.clip.shape));
  svg.appendChild(clip);

  return `url(#${clipId})`;
}

/** Appends a foreignObject wrapping `element`, sized to the content box. */
function appendElementContent(svg: SVGSVGElement, element: HTMLElement | SVGElement, layout: MarkerLayout): void {
  const { cx, cy } = layout.geometry.content;
  const { box } = layout.metrics;

  const fo = svgEl("foreignObject");
  fo.classList.add("marker-content");
  fo.setAttribute("x", String(cx - box / 2));
  fo.setAttribute("y", String(cy - box / 2));
  fo.setAttribute("width", String(box));
  fo.setAttribute("height", String(box));
  fo.setAttribute("clip-path", appendContentClip(svg, layout));
  fo.appendChild(element);
  svg.appendChild(fo);
}

/** Appends a text label centred on the content box, at the size's font size, baseline and letter spacing. */
function appendTextContent(svg: SVGSVGElement, title: string, layout: MarkerLayout, className = "marker-content"): SVGTextElement {
  const text = svgEl("text");
  text.classList.add(className, MARKER_FONT_CLASSNAME);
  text.setAttribute("clip-path", appendContentClip(svg, layout));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-weight", "500");
  text.setAttribute("letter-spacing", `${String(TEXT_LETTER_SPACING_EM)}em`);
  text.style.fill = "var(--marker-content-color)";
  text.style.userSelect = "none";
  setTextLabel(text, title, layout);
  svg.appendChild(text);
  return text;
}

/** Sets a label's text, with the font size and position that go with its length. */
function setTextLabel(text: SVGTextElement, label: string, layout: MarkerLayout): void {
  const { cx, cy } = layout.geometry.content;
  // one letter or digit (a single UTF-16 unit)
  const { font, baseline } = (label.length === 1 ? layout.metrics.singleChar : undefined) ?? layout.metrics;
  // SVG adds letter-spacing after the last glyph too, which shifts middle-anchored
  // text by half a spacing; the design centres the glyphs themselves
  text.setAttribute("x", String(cx + (TEXT_LETTER_SPACING_EM * font) / 2));
  text.setAttribute("y", String(cy + baseline));
  text.setAttribute("font-size", String(font));
  text.textContent = label;
}

//#endregion

//#region wrap

/**
 * Wraps `element` in a new container `div`.
 * MapLibre requires a single root element per marker; this outer wrapper
 * lets MapLibre apply its own transforms without interfering with the
 * inner wrapper's scale/rotation transform.
 * @param element - Element to wrap.
 */
export function wrap(element: HTMLElement) {
  const div = document.createElement("div");
  div.appendChild(element);
  return div;
}

//#endregion

//#region forwardPointerEvents
/**
 * Prevents MapLibre element events from firing when the outer root element
 * is clicked but the inner wrapper is not — e.g. whitespace within the
 * MapLibre-positioned container.
 * @param parent - The marker's outer root element.
 */
export function forwardPointerEvents(parent: HTMLElement) {
  const child = parent.querySelector<HTMLElement>(`.${CUSTOM_ELEMENT_CLASSNAME}`);
  if (child) {
    parent.style.pointerEvents = "none";
    child.style.pointerEvents = "auto";
  }
}
//#endregion
