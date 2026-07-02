import type { MapTilerMarkerBaseOptions, MapTilerMarkerOptions, HTMLElementUpdateCue, MapTilerMarkerSize } from "./types";
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

const SVG_NS = "http://www.w3.org/2000/svg";

//#region svgEl

// helper to create namespaced svg element
function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag) as SVGElementTagNameMap[K];
}

//#endregion

//#region createMarkerElement

/**
 * Creates the root wrapper `div` for a marker, seeding all CSS custom
 * properties and the initial `data-*` attributes used by {@link applyTransform}.
 * @param options - Resolved marker options.
 * @returns The wrapper element, ready to be passed to {@link wrap}.
 */
export function createMarkerElement(options: MapTilerMarkerOptions): HTMLDivElement {
  const shapeKey = options.shape ?? DEFAULT_SHAPE;
  const sizeKey = options.size ?? DEFAULT_SIZE;

  // wrapper: carries transform, opacity, and all CSS custom properties
  const wrapper = document.createElement("div");
  wrapper.className = "marker-scale-wrapper";
  wrapper.style.transformOrigin = "center bottom";
  wrapper.dataset.markerShape = shapeKey;
  wrapper.dataset.markerSize = sizeKey;

  // First pass CSS custom properties used for styling internally
  wrapper.style.setProperty("--marker-outer-color", options.outerColor ?? DEFAULT_OUTER_COLOR);
  wrapper.style.setProperty("--marker-inner-color", options.innerColor ?? DEFAULT_INNER_COLOR);
  wrapper.style.setProperty("--marker-content-color", options.contentColor ?? DEFAULT_CONTENT_COLOR);
  wrapper.style.setProperty("--marker-outline-color", options.outlineColor ?? "transparent");
  wrapper.style.setProperty("--marker-shadow", options.shadow ? SHADOW_FILTER[options.shadow] : "none");

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

  if (options.htmlAttributes) {
    for (const [attr, val] of Object.entries(options.htmlAttributes)) {
      wrapper.setAttribute(attr, String(val));
    }
  }

  wrapper.appendChild(sizeKey === "xs" ? buildDotSvg() : buildShapeSvg(shapeKey, sizeKey, options));
  return wrapper;
}

//#endregion

//#region updateMarkerElement

/**
 * Commits a batch of pending property updates onto a live marker element.
 * Called by `Marker[FlushDOMUpdatesSymbol]()` when there are pending updates.
 * @param element - The marker wrapper element (`.marker-scale-wrapper`).
 * @param props - Map of property keys to their new values.
 */
export function updateMarkerElement(element: HTMLElement, props: HTMLElementUpdateCue): void {
  for (const [prop, value] of props) {
    if (prop === "outerColor") {
      element.style.setProperty("--marker-outer-color", value as string);
    }

    if (prop === "innerColor") {
      element.style.setProperty("--marker-inner-color", value as string);
    }

    if (prop === "contentColor") {
      element.style.setProperty("--marker-content-color", value as string);
      const contentEl = element.querySelector(".marker-content");
      if (contentEl) contentEl.setAttribute("fill", `var(--marker-content-color)`);
    }

    if (prop === "outlineColor") {
      element.style.setProperty("--marker-outline-color", value as string);
    }

    if (prop === "outline") {
      const width = value === true ? DEFAULT_OUTLINE_WIDTH : (value as number);
      const outerPath = element.querySelector<SVGPathElement>(".marker-outer");
      outerPath?.setAttribute("stroke-width", String(width));
    }

    if (prop === "shadow") {
      const filter = value ? SHADOW_FILTER[value as NonNullable<MapTilerMarkerBaseOptions["shadow"]>] : "none";
      element.style.setProperty("--marker-shadow", filter);
    }

    if (prop === "opacity") {
      element.style.opacity = String(value as number);
    }

    if (prop === "title") {
      const contentEl = element.querySelector(".marker-content");
      if (contentEl) contentEl.textContent = value as string;
    }

    if (prop === "htmlAttributes") {
      const attrs = value as Record<string, string | number>;
      for (const [attr, attrVal] of Object.entries(attrs)) {
        element.setAttribute(attr, String(attrVal));
      }
    }

    if (prop === "rotation") {
      element.dataset.rotation = String(value as number);
      applyTransform(element);
    }

    if (prop === "scale") {
      const [x, y] = value as [number, number];
      element.dataset.scaleX = String(x);
      element.dataset.scaleY = String(y);
      applyTransform(element);
    }

    if (prop === "size") {
      applySize(element, value as MapTilerMarkerSize);
    }
  }
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
  const existingSvg = wrapper.querySelector("svg");
  const wasXs = existingSvg?.classList.contains("marker-dot") ?? false;

  wrapper.dataset.markerSize = size;

  if (size === "xs") {
    existingSvg?.remove();
    wrapper.appendChild(buildDotSvg());
    return;
  }

  if (wasXs) {
    // XS → non-XS: rebuild shape SVG (content not reconstructed here)
    const shapeKey = (wrapper.dataset.markerShape ?? DEFAULT_SHAPE) as NonNullable<MapTilerMarkerBaseOptions["shape"]>;
    existingSvg?.remove();
    wrapper.appendChild(buildShapeSvg(shapeKey, size));
    return;
  }

  // non-XS → non-XS: just resize the existing SVG
  if (!existingSvg) return;

  const viewBoxRaw = existingSvg.getAttribute("viewBox");

  if (!viewBoxRaw) return;
  const parts = viewBoxRaw.split(" ").map(Number);
  const viewBoxW = parts[2];
  const viewBoxH = parts[3];

  const h = SIZE_PX[size];
  const w = h * (viewBoxW / viewBoxH);
  existingSvg.setAttribute("width", String(w));
  existingSvg.setAttribute("height", String(h));
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
  circle.style.fill = "var(--marker-inner-color)";
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
  svg.setAttribute("viewBox", `0 0 ${String(viewBoxW)} ${String(viewBoxH)}`);
  svg.setAttribute("width", String(widthPx));
  svg.setAttribute("height", String(heightPx));
  svg.style.display = "block";
  svg.style.overflow = "visible";
  svg.style.filter = "var(--marker-shadow)";

  const outerPath = svgEl("path");
  outerPath.classList.add("marker-outer");
  outerPath.setAttribute("d", shapeDesc.outerPath);
  outerPath.style.fill = "var(--marker-outer-color)";
  outerPath.style.stroke = "var(--marker-outline-color)";
  if (options) applyOutlineToPath(outerPath, options);
  svg.appendChild(outerPath);

  const innerPath = svgEl("path");
  innerPath.classList.add("marker-inner");
  innerPath.setAttribute("d", shapeDesc.innerPath);
  innerPath.style.fill = "var(--marker-inner-color)";
  svg.appendChild(innerPath);

  if (options) appendContent(svg, options, shapeDesc);

  return svg;
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

/**
 * Appends the content layer to a shape SVG. Priority: `url` → `element` → `title`.
 * Renders nothing when none of those fields is provided.
 * @param svg - Target SVG element.
 * @param options - Marker options carrying the content variant.
 * @param shape - Shape descriptor supplying layout constants (`contentCenter`, `contentAreaHeight`).
 */
function appendContent(svg: SVGSVGElement, options: MapTilerMarkerOptions, shape: ShapeDescriptor): void {
  const [cx, cy] = shape.contentCenter;
  const fontSize = shape.contentAreaHeight * 0.53;

  if ("url" in options && options.url) {
    const size = shape.contentAreaHeight * 0.6;
    const img = svgEl("image");
    img.classList.add("marker-content");
    img.setAttribute("href", options.url);
    img.setAttribute("x", String(cx - size / 2));
    img.setAttribute("y", String(cy - size / 2));
    img.setAttribute("width", String(size));
    img.setAttribute("height", String(size));
    img.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.appendChild(img);
    return;
  }

  if ("element" in options && options.element) {
    const size = shape.contentAreaHeight * 0.7;
    const fo = svgEl("foreignObject");
    fo.classList.add("marker-content");
    fo.setAttribute("x", String(cx - size / 2));
    fo.setAttribute("y", String(cy - size / 2));
    fo.setAttribute("width", String(size));
    fo.setAttribute("height", String(size));
    fo.appendChild(options.element);
    svg.appendChild(fo);
    return;
  }

  if (options.title) {
    const text = svgEl("text");
    text.classList.add("marker-content");
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
    text.textContent = options.title;
    svg.appendChild(text);
  }
}

//#endregion

//#region wrap

/**
 * Wraps `element` in a new container element.
 * MapLibre requires a single root element per marker; this outer wrapper
 * lets MapLibre apply its own transforms without interfering with the
 * inner wrapper's scale/rotation transform.
 * @param element - Element to wrap.
 * @param wrapperType - Tag name for the container. Defaults to `"div"`.
 */
export function wrap(element: HTMLElement, wrapperType: string = "div") {
  const div = document.createElement(wrapperType);
  div.appendChild(element);
  return div;
}

//#endregion
