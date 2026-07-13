import type { MapTilerMarkerBaseOptions, MapTilerMarkerOptions, PendingMarkerUpdates, MapTilerMarkerSize } from "./types";
import {
  DEFAULT_CONTENT_COLOR,
  DEFAULT_INNER_COLOR,
  DEFAULT_OUTER_COLOR,
  DEFAULT_OUTLINE_WIDTH,
  DEFAULT_SHAPE,
  DEFAULT_SIZE,
  SHADOW_FILTER,
  SHAPES,
  SIZE_PX,
  type ShapeDescriptor,
} from "./marker-svg-config";
import { getMarkerTemplate, GLYPH_VIEWBOX_SIZE } from "./marker-content-registry";
import { getAdaptiveBgColor, resolveAdaptiveColor } from "./marker-adaptive-colors";

const SVG_NS = "http://www.w3.org/2000/svg";

//#region svgEl

// helper to create namespaced svg element
function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag) as SVGElementTagNameMap[K];
}

//#endregion

//#region createMarkerElement

const CUSTOM_ELEMENT_CLASSNAME = "marker-transform-wrapper";

/**
 * Seeds the CSS custom properties that drive marker colors and shadow.
 * Used on the generated wrapper, and on user-supplied custom elements so
 * their styles can consume the same variables.
 * @param element - Element to receive the custom properties.
 * @param options - Resolved marker options.
 */
export function applyMarkerStyleVariables(element: HTMLElement | SVGElement, options: MapTilerMarkerOptions): void {
  // the adaptive `color` can only resolve to its `base` value here — the
  // marker has no map yet; MarkerManager re-resolves on registration
  const adaptive = options.color !== undefined ? resolveAdaptiveColor(options.color) : undefined;
  const innerColor = options.innerColor ?? (adaptive ? getAdaptiveBgColor(adaptive, "") : undefined) ?? DEFAULT_INNER_COLOR;

  element.style.setProperty("--marker-outer-color", options.outerColor ?? DEFAULT_OUTER_COLOR);
  element.style.setProperty("--marker-inner-color", innerColor);
  element.style.setProperty("--marker-content-color", options.contentColor ?? DEFAULT_CONTENT_COLOR);
  element.style.setProperty("--marker-outline-color", options.outlineColor ?? "transparent");
  element.style.setProperty("--marker-shadow", options.shadow ? SHADOW_FILTER[options.shadow] : "none");
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
 * @param styleId - Current map style id, used to resolve the adaptive `color`.
 */
export function updateMarkerElement(element: HTMLElement, props: PendingMarkerUpdates, styleId?: string): void {
  // `element` is the outer MapLibre-positioned container; all marker state
  // (CSS custom properties, transform dataset, the SVG itself) lives on the
  // inner transform wrapper. Updates must target the wrapper — writing to the
  // outer element either gets masked by the wrapper's inline values (CSS vars)
  // or clobbered by MapLibre (transform).
  const wrapper = element.classList.contains(CUSTOM_ELEMENT_CLASSNAME) ? element : (element.querySelector<HTMLElement>(`.${CUSTOM_ELEMENT_CLASSNAME}`) ?? element);

  if ("outerColor" in props) {
    wrapper.style.setProperty("--marker-outer-color", props.outerColor ?? DEFAULT_OUTER_COLOR);
  }

  // before `innerColor`: an explicit innerColor in the same batch wins
  if ("color" in props) {
    const adaptive = props.color !== undefined ? resolveAdaptiveColor(props.color) : undefined;
    wrapper.style.setProperty("--marker-inner-color", adaptive ? getAdaptiveBgColor(adaptive, styleId ?? "") : DEFAULT_INNER_COLOR);
  }

  if ("innerColor" in props) {
    wrapper.style.setProperty("--marker-inner-color", props.innerColor ?? DEFAULT_INNER_COLOR);
  }

  if ("contentColor" in props) {
    wrapper.style.setProperty("--marker-content-color", props.contentColor ?? DEFAULT_CONTENT_COLOR);
    const contentEl = wrapper.querySelector(".marker-content");
    if (contentEl) contentEl.setAttribute("fill", "var(--marker-content-color)");
  }

  if ("outlineColor" in props) {
    wrapper.style.setProperty("--marker-outline-color", props.outlineColor ?? "transparent");
  }

  if ("outline" in props) {
    const outerPath = wrapper.querySelector<SVGPathElement>(".marker-outer");
    if (props.outline) {
      const width = props.outline === true ? DEFAULT_OUTLINE_WIDTH : props.outline;
      outerPath?.setAttribute("stroke-width", String(width));
    } else {
      outerPath?.removeAttribute("stroke-width");
    }
  }

  if ("shadow" in props) {
    wrapper.style.setProperty("--marker-shadow", props.shadow ? SHADOW_FILTER[props.shadow] : "none");
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
    applySize(wrapper, props.size ?? DEFAULT_SIZE);
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

const SHAPE_SVG_CLASSNAME = "marker-shape";

/** Returns the shape SVG of a marker wrapper, or `null` when the marker was constructed at `xs` (dot only). */
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

  if (existing instanceof SVGTextElement) {
    if (value) {
      existing.textContent = value;
    } else {
      existing.remove();
    }
    return;
  }

  if (!value) return;

  existing?.remove();
  const shapeKey = (wrapper.dataset.markerShape ?? DEFAULT_SHAPE) as NonNullable<MapTilerMarkerBaseOptions["shape"]>;
  appendTextContent(svg, value, SHAPES[shapeKey]);
}

//#endregion

//#region applySize

/**
 * Resizes the child SVG, or swaps it out entirely when crossing the `xs`
 * boundary (`xs` uses a dot SVG rather than a shape SVG).
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

  if (!shapeSvg) {
    // marker was constructed at xs — no shape SVG to restore, build fresh
    // (content not reconstructed here)
    const shapeKey = (wrapper.dataset.markerShape ?? DEFAULT_SHAPE) as NonNullable<MapTilerMarkerBaseOptions["shape"]>;
    wrapper.appendChild(buildShapeSvg(shapeKey, size));
    return;
  }

  // restore (if hidden) and resize via the viewBox aspect ratio
  shapeSvg.style.display = "block";

  const viewBoxRaw = shapeSvg.getAttribute("viewBox");

  if (!viewBoxRaw) return;
  const parts = viewBoxRaw.split(" ").map(Number);
  const viewBoxW = parts[2];
  const viewBoxH = parts[3];

  const h = SIZE_PX[size];
  const w = h * (viewBoxW / viewBoxH);
  shapeSvg.setAttribute("width", String(w));
  shapeSvg.setAttribute("height", String(h));
}

//#endregion

//#region applyDebug

const DEBUG_COLOR = "#ff00ff";

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
  box.setAttribute("stroke-dasharray", "0.1");
  box.setAttribute("stroke-width", "0.1");
  svg.appendChild(box);

  const hLine = svgEl("line");
  hLine.setAttribute("x1", "0");
  hLine.setAttribute("y1", "50%");
  hLine.setAttribute("x2", "100%");
  hLine.setAttribute("y2", "50%");
  hLine.setAttribute("opacity", "0.5");
  hLine.setAttribute("stroke-width", "0.1");
  svg.appendChild(hLine);

  const vLine = svgEl("line");
  vLine.setAttribute("x1", "50%");
  vLine.setAttribute("y1", "0");
  vLine.setAttribute("x2", "50%");
  vLine.setAttribute("y2", "100%");
  vLine.setAttribute("opacity", "0.5");
  vLine.setAttribute("stroke-width", "0.1");
  svg.appendChild(vLine);

  // zero-length round-capped line renders as a fixed-size dot — unlike a
  // filled circle, its stroke is exempt from scaling via non-scaling-stroke
  const dot = svgEl("line");
  dot.setAttribute("x1", "50%");
  dot.setAttribute("y1", "50%");
  dot.setAttribute("x2", "50%");
  dot.setAttribute("y2", "50%");
  dot.setAttribute("stroke-linecap", "round");
  dot.setAttribute("stroke-width", "1");
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
  // constructed at xs has none, and gets its SVG built on the next size change
  const existingSvg = getShapeSvg(wrapper);
  if (!existingSvg) return;

  // while hidden at xs the build size is nominal — restoring recomputes it
  const sizeKey = (wrapper.dataset.markerSize ?? DEFAULT_SIZE) as MapTilerMarkerSize;
  const newSvg = buildShapeSvg(shape, sizeKey === "xs" ? DEFAULT_SIZE : sizeKey);

  // preserve outline width (stored as an attribute on the outer path)
  const strokeWidth = existingSvg.querySelector(".marker-outer")?.getAttribute("stroke-width");
  if (strokeWidth) newSvg.querySelector(".marker-outer")?.setAttribute("stroke-width", strokeWidth);

  migrateContent(existingSvg, newSvg, SHAPES[shape]);
  newSvg.style.display = existingSvg.style.display; // stay hidden while at xs
  existingSvg.replaceWith(newSvg);
}

/**
 * Re-creates the `.marker-content` layer from `oldSvg` inside `newSvg`,
 * repositioned for the new shape's content geometry.
 */
function migrateContent(oldSvg: SVGSVGElement, newSvg: SVGSVGElement, shape: ShapeDescriptor): void {
  const content = oldSvg.querySelector(".marker-content");
  if (!content) return;

  if (content instanceof SVGGElement) {
    // icon / SVG-template glyph: move it and refit to the new content circle
    content.setAttribute("transform", glyphTransform(shape));
    newSvg.appendChild(content);
    return;
  }

  if (content instanceof SVGImageElement) {
    const href = content.getAttribute("href");
    if (href) appendImageContent(newSvg, href, shape);
    return;
  }

  if (content instanceof SVGForeignObjectElement) {
    const child = content.firstElementChild;
    if (child instanceof HTMLElement || child instanceof SVGElement) appendElementContent(newSvg, child, shape);
    return;
  }

  if (content instanceof SVGTextElement && content.textContent) {
    appendTextContent(newSvg, content.textContent, shape);
  }
}

//#endregion

//#region buildDotSvg

/** Builds the minimal dot SVG used for the `xs` size. */
function buildDotSvg(): SVGSVGElement {
  const svg = svgEl("svg");
  svg.classList.add("marker-dot");
  svg.setAttribute("viewBox", "0 0 5 5");
  svg.setAttribute("width", "5");
  svg.setAttribute("height", "5");
  svg.style.display = "block";
  svg.style.overflow = "visible";
  svg.style.filter = "none";

  const circle = svgEl("circle");
  circle.setAttribute("cx", "2.5");
  circle.setAttribute("cy", "2.5");
  circle.setAttribute("r", "2.5");
  circle.setAttribute("stroke-width", "1");
  circle.setAttribute("vector-effect", "non-scaling-stroke");
  circle.style.fill = "var(--marker-inner-color)";
  circle.style.stroke = "var(--marker-outer-color)";
  svg.appendChild(circle);

  return svg;
}

//#endregion

//#region buildShapeSvg

/**
 * Builds the full shape SVG for sizes `s` through `XL`.
 * @param shapeKey - Shape variant to render.
 * @param sizeKey - Target pixel height; drives `width`/`height` attributes via aspect ratio.
 * @param options - When provided, applies outline and appends the content layer.
 */
function buildShapeSvg(shapeKey: NonNullable<MapTilerMarkerBaseOptions["shape"]>, sizeKey: MapTilerMarkerSize, options?: MapTilerMarkerOptions): SVGSVGElement {
  const shapeDesc = SHAPES[shapeKey];
  const heightPx = SIZE_PX[sizeKey];
  const [viewBoxW, viewBoxH] = shapeDesc.viewBox;
  const widthPx = heightPx * (viewBoxW / viewBoxH);

  const svg = svgEl("svg");
  svg.classList.add(SHAPE_SVG_CLASSNAME);
  svg.setAttribute("viewBox", `0 0 ${String(viewBoxW)} ${String(viewBoxH)}`);
  svg.setAttribute("width", String(widthPx));
  svg.setAttribute("height", String(heightPx));
  svg.style.display = "block";
  svg.style.overflow = "visible";
  svg.style.filter = "var(--marker-shadow)";

  const outerPath = svgEl("path");
  outerPath.classList.add("marker-outer");
  outerPath.setAttribute("d", shapeDesc.outerPath);
  // stroke width in screen pixels — viewBox unit scales vary wildly between shapes
  outerPath.setAttribute("vector-effect", "non-scaling-stroke");
  outerPath.style.fill = "var(--marker-outer-color)";
  outerPath.style.stroke = "var(--marker-outline-color)";
  if (options) applyOutlineToPath(outerPath, options);
  svg.appendChild(outerPath);

  const innerEl = buildInnerElement(shapeDesc.inner);
  innerEl.classList.add("marker-inner");
  innerEl.style.fill = "var(--marker-inner-color)";
  svg.appendChild(innerEl);

  if (options) appendContent(svg, options, shapeDesc);

  return svg;
}

//#endregion

//#region buildInnerElement

/**
 * Builds the inner (fill) element of a shape — a `<circle>` or a `<path>`
 * depending on the shape descriptor.
 * @param inner - Inner region descriptor.
 */
function buildInnerElement(inner: ShapeDescriptor["inner"]): SVGCircleElement | SVGPathElement {
  if (inner.type === "circle") {
    const circle = svgEl("circle");
    circle.setAttribute("cx", String(inner.cx));
    circle.setAttribute("cy", String(inner.cy));
    circle.setAttribute("r", String(inner.r));
    return circle;
  }

  const path = svgEl("path");
  path.setAttribute("d", inner.d);
  return path;
}

//#endregion

//#region applyTransform

/**
 * Composes `data-scaleX`, `data-scaleY`, and `data-rotation` into a single
 * CSS `transform` string on the wrapper. Reading from dataset rather than
 * accepting individual arguments ensures scale and rotation never clobber
 * each other when only one property changes at a time.
 * @param wrapper - The marker wrapper element.
 */
function applyTransform(wrapper: HTMLElement): void {
  const sx = wrapper.dataset.scaleX ?? "1";
  const sy = wrapper.dataset.scaleY ?? "1";
  const rot = wrapper.dataset.rotation ?? "0";
  wrapper.style.transform = `scale(${sx}, ${sy}) rotate(${rot}deg)`;
}

//#endregion

//#region applyOutlineToPath

/**
 * Sets `stroke-width` on the outer path when `options.outline` is truthy.
 * @param path - The `.marker-outer` path element.
 * @param options - Marker options carrying the `outline` value.
 */
function applyOutlineToPath(path: SVGPathElement, options: MapTilerMarkerOptions): void {
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
 * @param shape - Shape descriptor supplying the content circle and optional image clip region.
 */
function appendContent(svg: SVGSVGElement, options: MapTilerMarkerOptions, shape: ShapeDescriptor): void {
  if ("icon" in options && options.icon) {
    appendIconContent(svg, options.icon, shape);
    return;
  }

  if ("url" in options && options.url) {
    appendImageContent(svg, options.url, shape);
    return;
  }

  if ("template" in options && options.template) {
    appendTemplateContent(svg, options.template, options.templateParams, shape);
    return;
  }

  if ("element" in options && options.element) {
    appendElementContent(svg, options.element, shape);
    return;
  }

  if (options.content) {
    appendTextContent(svg, options.content, shape);
  }
}

/**
 * Placeholder for built-in icon content.
 * TODO(icons): resolve the identifier to an icon glyph and append it scaled
 * into the content circle. Renders nothing for now.
 */
function appendIconContent(svg: SVGSVGElement, icon: string, shape: ShapeDescriptor): void {
  // intentionally empty — icons not implemented yet
  void svg;
  void icon;
  void shape;
}

/**
 * Appends content produced by a registered template factory. Strings render
 * as marker text, HTML elements in a foreignObject, SVG elements as glyphs.
 * Unknown identifiers warn and render nothing.
 */
function appendTemplateContent(svg: SVGSVGElement, template: string, params: Record<string, number | string> | undefined, shape: ShapeDescriptor): void {
  const factory = getMarkerTemplate(template);

  if (!factory) {
    console.warn(`Unknown marker template "${template}" — register it with registerMarkerTemplate().`);
    return;
  }

  const produced = factory(params);

  if (typeof produced === "string") {
    appendTextContent(svg, produced, shape);
  } else if (produced instanceof SVGElement) {
    appendGlyphContent(svg, produced, shape);
  } else {
    appendElementContent(svg, produced, shape);
  }
}

/**
 * Wraps an SVG glyph (designed in a {@link GLYPH_VIEWBOX_SIZE}-unit square)
 * in a `<g>` scaled and centered on the shape's content circle.
 */
function appendGlyphContent(svg: SVGSVGElement, glyph: SVGElement, shape: ShapeDescriptor): void {
  const g = svgEl("g");
  g.classList.add("marker-content");
  g.setAttribute("fill", "var(--marker-content-color)");
  g.setAttribute("transform", glyphTransform(shape));
  g.appendChild(glyph);
  svg.appendChild(g);
}

/** Transform that fits the glyph design box into the shape's content circle. */
function glyphTransform(shape: ShapeDescriptor): string {
  const { cx, cy, r } = shape.content;
  const scale = (r * 1.4) / GLYPH_VIEWBOX_SIZE;
  const half = (GLYPH_VIEWBOX_SIZE / 2) * scale;
  return `translate(${String(cx - half)}, ${String(cy - half)}) scale(${String(scale)})`;
}

/**
 * Appends image content, clipped to the shape's `imageClip` region when
 * defined (full-bleed) or to the circular content area otherwise.
 */
function appendImageContent(svg: SVGSVGElement, href: string, shape: ShapeDescriptor): void {
  const img = svgEl("image");
  img.classList.add("marker-content");
  img.setAttribute("href", href);
  img.setAttribute("preserveAspectRatio", "xMidYMid slice");

  if (shape.imageClip) {
    // full-bleed: image fills the inner body, clipped to its outline
    const clipId = `maptiler-marker-clip-${String(++clipIdCounter)}`;
    const clip = svgEl("clipPath");
    clip.setAttribute("id", clipId);

    const clipShape = svgEl("path");
    clipShape.setAttribute("d", shape.imageClip.d);
    clip.appendChild(clipShape);
    svg.appendChild(clip);

    img.setAttribute("clip-path", `url(#${clipId})`);
    img.setAttribute("x", String(shape.imageClip.x));
    img.setAttribute("y", String(shape.imageClip.y));
    img.setAttribute("width", String(shape.imageClip.w));
    img.setAttribute("height", String(shape.imageClip.h));
  } else {
    // no dedicated clip region: fill the circular content area
    const { cx, cy, r } = shape.content;
    img.setAttribute("clip-path", appendContentClip(svg, shape));
    img.setAttribute("x", String(cx - r));
    img.setAttribute("y", String(cy - r));
    img.setAttribute("width", String(r * 2));
    img.setAttribute("height", String(r * 2));
  }

  svg.appendChild(img);

  // re-paint the pointer/tail over the image so it stays in the inner color
  if (shape.pointerPath) {
    const pointer = svgEl("path");
    pointer.setAttribute("d", shape.pointerPath);
    pointer.style.fill = "var(--marker-inner-color)";
    svg.appendChild(pointer);
  }
}

/**
 * Appends a `<clipPath>` for the shape's content circle and returns its
 * `url(#…)` reference — used to hide content that overflows the circle.
 */
function appendContentClip(svg: SVGSVGElement, shape: ShapeDescriptor): string {
  const { cx, cy, r } = shape.content;

  const clipId = `maptiler-marker-clip-${String(++clipIdCounter)}`;
  const clip = svgEl("clipPath");
  clip.setAttribute("id", clipId);

  const clipShape = svgEl("circle");
  clipShape.setAttribute("cx", String(cx));
  clipShape.setAttribute("cy", String(cy));
  clipShape.setAttribute("r", String(r));
  clip.appendChild(clipShape);
  svg.appendChild(clip);

  return `url(#${clipId})`;
}

/** Appends a foreignObject wrapping `element`, sized to the content circle. */
function appendElementContent(svg: SVGSVGElement, element: HTMLElement | SVGElement, shape: ShapeDescriptor): void {
  const { cx, cy, r } = shape.content;
  const size = r * 1.4;

  const fo = svgEl("foreignObject");
  fo.classList.add("marker-content");
  fo.setAttribute("x", String(cx - size / 2));
  fo.setAttribute("y", String(cy - size / 2));
  fo.setAttribute("width", String(size));
  fo.setAttribute("height", String(size));
  fo.setAttribute("clip-path", appendContentClip(svg, shape));
  fo.appendChild(element);
  svg.appendChild(fo);
}

/** Appends a text label centred on the content circle. */
function appendTextContent(svg: SVGSVGElement, title: string, shape: ShapeDescriptor): void {
  const { cx, cy, r } = shape.content;
  const fontSize = r * 1.4;

  const text = svgEl("text");
  text.classList.add("marker-content");
  text.setAttribute("clip-path", appendContentClip(svg, shape));
  text.setAttribute("x", String(cx));
  text.setAttribute("y", String(cy));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "central");
  text.setAttribute("font-family", "Inter, system-ui, sans-serif");
  text.setAttribute("font-weight", "700");
  text.setAttribute("font-size", String(fontSize));
  text.style.fill = "var(--marker-content-color)";
  text.style.userSelect = "none";
  text.style.fontVariantNumeric = "tabular-nums";
  text.textContent = title;
  svg.appendChild(text);
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
