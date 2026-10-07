import { describe, expect, it, vi } from "vitest";
import {
  applyAltitudeHidden,
  applyAltitudeOccluded,
  applyCollisionCulled,
  applyCollisionHidden,
  applyLifecycleLift,
  applyMarkerStyleVariables,
  applyMinimizedDot,
  createMarkerElement,
  forwardPointerEvents,
  releaseCollisionFadeClass,
  resolveMarkerWrapper,
  updateMarkerElement,
  wrap,
} from "../../src/Marker/marker-dom-utils";
import type { MapTilerMarkerOptions } from "../../src/Marker/types";
import { ADAPTIVE_COLORS, COLLISION_FADE_DURATION_MS, GROUND_LINE_CLASSNAME, SHADOW_FILTER, SIZE_PX } from "../../src/Marker/marker-constants";
import { registerMarkerTemplate } from "../../src/Marker/marker-content-registry";
import { MARKER_ICON_NAMES } from "../../src/Marker/marker-icons";
import { getAdaptiveColors } from "../../src/Marker/marker-adaptive-colors";

function baseOptions(overrides: Partial<MapTilerMarkerOptions> = {}): MapTilerMarkerOptions {
  return { ...overrides } as MapTilerMarkerOptions;
}

// The real MapTilerMarkerOptions content fields are a discriminated union
// (setting one types the others as `never`); tests that deliberately set
// several at once to probe priority bypass that via this cast.
function multiContentOptions(overrides: Record<string, unknown>): MapTilerMarkerOptions {
  return { ...overrides } as unknown as MapTilerMarkerOptions;
}

//#region createMarkerElement

describe("createMarkerElement", () => {
  it("creates an outer element wrapping the transform wrapper", () => {
    const outer = createMarkerElement(baseOptions());
    const wrapper = outer.querySelector(".marker-transform-wrapper");
    expect(wrapper).not.toBeNull();
  });

  it("renders a dot svg at xs size", () => {
    const outer = createMarkerElement(baseOptions({ size: "xs" }));
    expect(outer.querySelector("svg.marker-dot")).not.toBeNull();
    expect(outer.querySelector("svg.marker-shape")).toBeNull();
  });

  it("renders a shape svg at non-xs sizes", () => {
    const outer = createMarkerElement(baseOptions({ size: "m" }));
    expect(outer.querySelector("svg.marker-shape")).not.toBeNull();
    expect(outer.querySelector("svg.marker-dot")).toBeNull();
  });

  it("stamps shape/size dataset attributes on the wrapper", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", size: "l" }));
    const wrapper = outer.querySelector<HTMLElement>(".marker-transform-wrapper")!;
    expect(wrapper.dataset.markerShape).toBe("circle");
    expect(wrapper.dataset.markerSize).toBe("l");
  });

  it("applies the name option as a CSS class", () => {
    const outer = createMarkerElement(baseOptions({ name: "my-marker" }));
    const wrapper = outer.querySelector<HTMLElement>(".marker-transform-wrapper")!;
    expect(wrapper.classList.contains("my-marker")).toBe(true);
  });

  it("applies the title attribute to the outer element", () => {
    const outer = createMarkerElement(baseOptions({ title: "hello" }));
    expect(outer.getAttribute("title")).toBe("hello");
  });

  it("does not set a title attribute when none is given", () => {
    const outer = createMarkerElement(baseOptions());
    expect(outer.hasAttribute("title")).toBe(false);
  });

  it("applies custom htmlAttributes to the outer element", () => {
    const outer = createMarkerElement(baseOptions({ htmlAttributes: { "data-test": "42" } }));
    expect(outer.getAttribute("data-test")).toBe("42");
  });

  it("applies the debug overlay when options.debug is true", () => {
    const outer = createMarkerElement(baseOptions({ debug: true }));
    expect(outer.querySelector(".marker-debug")).not.toBeNull();
  });

  it("sets opacity inline style when provided", () => {
    const outer = createMarkerElement(baseOptions({ opacity: 0.4 }));
    const wrapper = outer.querySelector<HTMLElement>(".marker-transform-wrapper")!;
    expect(wrapper.style.opacity).toBe("0.4");
  });

  it("renders text content when content is provided", () => {
    const outer = createMarkerElement(baseOptions({ content: "42" }));
    const text = outer.querySelector(".marker-content");
    expect(text?.textContent).toBe("42");
  });

  it("renders image content when url is provided", () => {
    const outer = createMarkerElement(baseOptions({ url: "https://example.com/pin.png" }));
    const image = outer.querySelector(".marker-content");
    expect(image?.tagName.toLowerCase()).toBe("image");
  });

  it("applies pointer-events forwarding: outer none, wrapper auto", () => {
    const outer = createMarkerElement(baseOptions());
    const wrapper = outer.querySelector<HTMLElement>(".marker-transform-wrapper")!;
    expect(outer.style.pointerEvents).toBe("none");
    expect(wrapper.style.pointerEvents).toBe("auto");
  });

  it("bakes scale and rotation into the wrapper transform", () => {
    const outer = createMarkerElement(baseOptions({ scale: [2, 3], rotation: 45 }));
    const wrapper = outer.querySelector<HTMLElement>(".marker-transform-wrapper")!;
    expect(wrapper.style.transform).toContain("scale(2, 3)");
    expect(wrapper.style.transform).toContain("rotate(45deg)");
  });
});

//#endregion

//#region appendContent priority

describe("appendContent priority (icon > url > template > element > content)", () => {
  it("icon wins over url/template/element/content", () => {
    registerMarkerTemplate("priority-template", () => "T");
    const outer = createMarkerElement(
      multiContentOptions({
        icon: "cafe",
        url: "https://example.com/pin.png",
        template: "priority-template",
        element: document.createElement("span"),
        content: "X",
      }),
    );
    const content = outer.querySelector<SVGGElement>(".marker-content");
    expect(content?.dataset.icon).toBe("cafe");
  });

  it("url wins over template/element/content", () => {
    registerMarkerTemplate("priority-template", () => "T");
    const outer = createMarkerElement(
      multiContentOptions({
        url: "https://example.com/pin.png",
        template: "priority-template",
        element: document.createElement("span"),
        content: "X",
      }),
    );
    const content = outer.querySelector(".marker-content");
    expect(content?.tagName.toLowerCase()).toBe("image");
  });

  it("template wins over element/content", () => {
    registerMarkerTemplate("priority-template", () => "T");
    const outer = createMarkerElement(multiContentOptions({ template: "priority-template", element: document.createElement("span"), content: "X" }));
    const content = outer.querySelector(".marker-content");
    expect(content?.tagName.toLowerCase()).toBe("text");
    expect(content?.textContent).toBe("T");
  });

  it("element wins over content", () => {
    const custom = document.createElement("span");
    custom.textContent = "hi";
    const outer = createMarkerElement(multiContentOptions({ element: custom, content: "X" }));
    const content = outer.querySelector(".marker-content");
    expect(content?.tagName.toLowerCase()).toBe("foreignobject");
    expect(content?.contains(custom)).toBe(true);
  });
});

//#endregion

//#region dot

describe("xs dot", () => {
  it("is a 10px outer-colour disc with the inner-colour disc 2px inside it", () => {
    const outer = createMarkerElement(baseOptions({ size: "xs" }));
    const dot = outer.querySelector<SVGSVGElement>("svg.marker-dot")!;
    expect(dot.getAttribute("width")).toBe("10");
    expect(dot.getAttribute("viewBox")).toBe("0 0 10 10");
    const [ring, fill] = [...dot.querySelectorAll("circle")];
    expect(ring.getAttribute("r")).toBe("5");
    expect(ring.style.fill).toBe("var(--marker-outer-color)");
    expect(fill.getAttribute("r")).toBe("3");
    expect(fill.style.fill).toBe("var(--marker-inner-color)");
  });

  it("uses the marker shadow, soft by default", () => {
    const outer = createMarkerElement(baseOptions({ size: "xs" }));
    const dot = outer.querySelector<SVGSVGElement>("svg.marker-dot")!;
    expect(dot.style.filter).toBe("var(--marker-shadow)");
    expect(resolveMarkerWrapper(outer).style.getPropertyValue("--marker-shadow")).toBe(SHADOW_FILTER.soft);
  });
});

//#endregion

//#region icons

describe("icon content", () => {
  const iconGroup = (outer: HTMLElement) => outer.querySelector<SVGGElement>("g.marker-content[data-icon]");

  it("draws the built-in icon's design for the marker size, in the content colour", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", size: "l", icon: "star" }));
    const group = iconGroup(outer);
    expect(group?.getAttribute("fill")).toBe("var(--marker-content-color)");
    // L icon box is 16px, centred on the circle's content centre (20, 20)
    expect(group?.getAttribute("transform")).toBe("translate(12, 12)");
    const path = group?.querySelector("path");
    expect(path?.getAttribute("d")).toMatch(/^M7\.99953 0L/);
    // the design's own fill must not override the content colour
    expect(path?.hasAttribute("fill")).toBe(false);
  });

  it("draws the default maptiler marker's mark exactly like icon content", () => {
    for (const size of ["l", "m", "s"] as const) {
      const byDefault = createMarkerElement(baseOptions({ shape: "maptiler", size }));
      const asIcon = createMarkerElement(baseOptions({ shape: "maptiler", size, icon: "maptiler" }));
      const def = iconGroup(byDefault)!;
      const icon = iconGroup(asIcon)!;
      expect(def.dataset.icon).toBe("maptiler");
      expect(def.getAttribute("transform")).toBe(icon.getAttribute("transform"));
      expect(def.innerHTML).toBe(icon.innerHTML);
    }
    // L: 16px icon box around the maptiler content centre (20, 17)
    expect(iconGroup(createMarkerElement(baseOptions({ shape: "maptiler", size: "l" })))?.getAttribute("transform")).toBe("translate(12, 9)");
  });

  it("swaps the default mark for a label and brings it back when the label is cleared", () => {
    const outer = createMarkerElement(baseOptions({ shape: "maptiler" }));
    updateMarkerElement(outer, { content: "AB" });
    expect(iconGroup(outer)).toBeNull();
    updateMarkerElement(outer, { content: undefined });
    expect(iconGroup(outer)?.dataset.icon).toBe("maptiler");
  });

  it("every built-in icon has a source and renders at every marker size", () => {
    for (const name of MARKER_ICON_NAMES) {
      for (const size of ["s", "m", "l"] as const) {
        const outer = createMarkerElement(baseOptions({ shape: "circle", size, icon: name }));
        expect(iconGroup(outer)?.querySelector("path")).not.toBeNull();
      }
    }
  });

  it("scales the L design down to the new size's icon box when the size changes", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", size: "l", icon: "star" }));
    updateMarkerElement(outer, { size: "s" });
    const group = iconGroup(outer);
    // S icon box is 8px (half the 16px design) around the circle's S content centre (12, 12)
    expect(group?.getAttribute("transform")).toBe("translate(8, 8) scale(0.5)");
    expect(group?.querySelector("path")?.getAttribute("d")).toMatch(/^M7\.99953 0L/);
  });

  it("warns and renders nothing for an unknown icon", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const outer = createMarkerElement(baseOptions({ shape: "circle", icon: "nope" as never }));
    expect(outer.querySelector(".marker-content")).toBeNull();
    expect(warn).toHaveBeenCalledWith('Unknown marker icon "nope".');
    warn.mockRestore();
  });

  it("is replaced by a text label set later", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", icon: "star" }));
    updateMarkerElement(outer, { content: "AB" });
    expect(iconGroup(outer)).toBeNull();
    expect(outer.querySelector("text")?.textContent).toBe("AB");
  });
});

//#endregion

//#region applyMarkerStyleVariables

describe("applyMarkerStyleVariables", () => {
  it("sets default colors when none are provided", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions());
    expect(el.style.getPropertyValue("--marker-outer-color")).toBe(ADAPTIVE_COLORS.base.outerColor);
    expect(el.style.getPropertyValue("--marker-inner-color")).toBe(ADAPTIVE_COLORS.base.innerColor);
    expect(el.style.getPropertyValue("--marker-content-color")).toBe(ADAPTIVE_COLORS.base.contentColor);
  });

  it("uses explicit outer/inner/content/outline colors when given", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions({ outerColor: "red", innerColor: "blue", contentColor: "green", outlineColor: "black" }));
    expect(el.style.getPropertyValue("--marker-outer-color")).toBe("red");
    expect(el.style.getPropertyValue("--marker-inner-color")).toBe("blue");
    expect(el.style.getPropertyValue("--marker-content-color")).toBe("green");
    expect(el.style.getPropertyValue("--marker-outline-color")).toBe("black");
  });

  it("defaults outline color to the base default", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions());
    expect(el.style.getPropertyValue("--marker-outline-color")).toBe(ADAPTIVE_COLORS.base.outlineColor);
  });

  it("uses an explicit innerColor over the map-style default", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions({ innerColor: "purple" }));
    expect(el.style.getPropertyValue("--marker-inner-color")).toBe("purple");
  });

  it("defaults the shadow per size, as in the design", () => {
    const shadowAt = (size: MapTilerMarkerOptions["size"]) => {
      const el = document.createElement("div");
      applyMarkerStyleVariables(el, baseOptions({ size }));
      return el.style.getPropertyValue("--marker-shadow");
    };
    expect(shadowAt("l")).toBe(SHADOW_FILTER.strong);
    expect(shadowAt("m")).toBe(SHADOW_FILTER.medium);
    expect(shadowAt("s")).toBe(SHADOW_FILTER.soft);
    expect(shadowAt("xs")).toBe(SHADOW_FILTER.soft);
  });

  it("sets shadow filter var for a shadow preset", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions({ shadow: "soft" }));
    expect(el.style.getPropertyValue("--marker-shadow")).toContain("drop-shadow");
  });
});

//#endregion

//#region resolveMarkerWrapper

describe("resolveMarkerWrapper", () => {
  it("returns the element itself when it is already the wrapper", () => {
    const outer = createMarkerElement(baseOptions());
    const wrapper = outer.querySelector<HTMLElement>(".marker-transform-wrapper")!;
    expect(resolveMarkerWrapper(wrapper)).toBe(wrapper);
  });

  it("finds the wrapper nested inside the outer element", () => {
    const outer = createMarkerElement(baseOptions());
    const wrapper = outer.querySelector<HTMLElement>(".marker-transform-wrapper")!;
    expect(resolveMarkerWrapper(outer)).toBe(wrapper);
  });

  it("returns the element itself when there is no wrapper at all (custom element)", () => {
    const custom = document.createElement("div");
    expect(resolveMarkerWrapper(custom)).toBe(custom);
  });
});

//#endregion

//#region updateMarkerElement

describe("updateMarkerElement", () => {
  it("updates outer/inner/content/outline colors", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { outerColor: "red", innerColor: "blue", contentColor: "green", outlineColor: "black" });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.style.getPropertyValue("--marker-outer-color")).toBe("red");
    expect(wrapper.style.getPropertyValue("--marker-inner-color")).toBe("blue");
    expect(wrapper.style.getPropertyValue("--marker-content-color")).toBe("green");
    expect(wrapper.style.getPropertyValue("--marker-outline-color")).toBe("black");
  });

  it("resolves undefined colours against the given styleId", () => {
    const outer = createMarkerElement(baseOptions({ outerColor: "red", innerColor: "purple", contentColor: "green", outlineColor: "black" }));
    updateMarkerElement(outer, { outerColor: undefined, innerColor: undefined, contentColor: undefined, outlineColor: undefined }, "streets-dark");
    const wrapper = resolveMarkerWrapper(outer);
    const expected = getAdaptiveColors("streets-dark");
    expect(wrapper.style.getPropertyValue("--marker-outer-color")).toBe(expected.outerColor);
    expect(wrapper.style.getPropertyValue("--marker-inner-color")).toBe(expected.innerColor);
    expect(wrapper.style.getPropertyValue("--marker-content-color")).toBe(expected.contentColor);
    expect(wrapper.style.getPropertyValue("--marker-outline-color")).toBe(expected.outlineColor);
  });

  it("sets and removes the outline stroke-width", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { outline: true });
    const wrapper = resolveMarkerWrapper(outer);
    const outerPath = wrapper.querySelector(".marker-outer")!;
    expect(outerPath.getAttribute("stroke-width")).toBe("2");

    updateMarkerElement(outer, { outline: 5 });
    expect(outerPath.getAttribute("stroke-width")).toBe("5");

    updateMarkerElement(outer, { outline: undefined });
    expect(outerPath.hasAttribute("stroke-width")).toBe(false);
  });

  it("sets the shadow filter var, falling back to the size's default when unset", () => {
    const outer = createMarkerElement(baseOptions({ size: "m" }));
    updateMarkerElement(outer, { shadow: "strong" });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.style.getPropertyValue("--marker-shadow")).toBe(SHADOW_FILTER.strong);
    updateMarkerElement(outer, { shadow: undefined });
    expect(wrapper.style.getPropertyValue("--marker-shadow")).toBe(SHADOW_FILTER.medium);
  });

  it("re-resolves an unset shadow on size change, but keeps an explicit one", () => {
    const unset = createMarkerElement(baseOptions({ size: "m" }));
    updateMarkerElement(unset, { size: "l" });
    expect(resolveMarkerWrapper(unset).style.getPropertyValue("--marker-shadow")).toBe(SHADOW_FILTER.strong);

    const explicit = createMarkerElement(baseOptions({ size: "m", shadow: "none" }));
    updateMarkerElement(explicit, { size: "l" });
    expect(resolveMarkerWrapper(explicit).style.getPropertyValue("--marker-shadow")).toBe("none");
  });

  it("sets and clears opacity", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { opacity: 0.3 });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.style.opacity).toBe("0.3");
    updateMarkerElement(outer, { opacity: undefined });
    expect(wrapper.style.opacity).toBe("");
  });

  it("sets and removes the title attribute on the outer element", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { title: "tip" });
    expect(outer.getAttribute("title")).toBe("tip");
    updateMarkerElement(outer, { title: undefined });
    expect(outer.hasAttribute("title")).toBe(false);
  });

  it("updates text content, and removes it when set to undefined", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", content: "1" }));
    updateMarkerElement(outer, { content: "2" });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.querySelector(".marker-content")?.textContent).toBe("2");
    updateMarkerElement(outer, { content: undefined });
    expect(wrapper.querySelector(".marker-content")).toBeNull();
  });

  it("adds a text label to a marker with no existing content", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { content: "new" });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.querySelector(".marker-content")?.textContent).toBe("new");
  });

  it("does not remove non-text content (image) when content is cleared", () => {
    const outer = createMarkerElement(baseOptions({ url: "https://example.com/pin.png" }));
    updateMarkerElement(outer, { content: undefined });
    const wrapper = resolveMarkerWrapper(outer);
    const content = wrapper.querySelector(".marker-content");
    expect(content?.tagName.toLowerCase()).toBe("image");
  });

  it("applies custom htmlAttributes to the outer element", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { htmlAttributes: { "aria-label": "test" } });
    expect(outer.getAttribute("aria-label")).toBe("test");
  });

  it("updates rotation via the wrapper's transform", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { rotation: 30 });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.dataset.rotation).toBe("30");
    expect(wrapper.style.transform).toContain("rotate(30deg)");
  });

  it("updates scale via the wrapper's transform", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { scale: [1.5, 0.5] });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.style.transform).toContain("scale(1.5, 0.5)");
  });

  it("defaults scale to [1, 1] when set to undefined", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { scale: undefined });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.style.transform).toContain("scale(1, 1)");
  });

  it("swaps to the dot svg when size changes to xs, and restores the shape svg on the way back", () => {
    const outer = createMarkerElement(baseOptions({ size: "m" }));
    const wrapper = resolveMarkerWrapper(outer);
    const shapeSvg = wrapper.querySelector<SVGElement>("svg.marker-shape")!;

    updateMarkerElement(outer, { size: "xs" });
    expect(wrapper.querySelector("svg.marker-dot")).not.toBeNull();
    expect((shapeSvg.style as CSSStyleDeclaration).display).toBe("none");

    // each size has its own geometry, so the shape svg is rebuilt for the new size
    updateMarkerElement(outer, { size: "l" });
    expect(wrapper.querySelector("svg.marker-dot")).toBeNull();
    const restored = wrapper.querySelector<SVGSVGElement>("svg.marker-shape")!;
    expect(restored.style.display).toBe("block");
    expect(restored.getAttribute("height")).toBe(String(SIZE_PX.l));
    expect(restored.getAttribute("viewBox")).toBe(`0 0 ${String(SIZE_PX.l)} ${String(SIZE_PX.l)}`);
  });

  it("runs a photo through the bubble-square tail, as the design's image mask does", () => {
    const outer = createMarkerElement(baseOptions({ shape: "bubble-square", size: "l", url: "https://example.com/a.png" }));
    const image = outer.querySelector("image")!;
    // body 9..33 plus the tail down to 36.5
    expect(image.getAttribute("y")).toBe("9");
    expect(image.getAttribute("height")).toBe("27.5");
    const clipId = /url\(#(.+)\)/.exec(image.getAttribute("clip-path") ?? "")?.[1];
    const clipPath = outer.querySelector(`clipPath[id="${String(clipId)}"] path`);
    expect(clipPath?.getAttribute("d")).toContain("L20 36.5");
    // nothing is painted over the photo any more
    expect(image.nextElementSibling).toBeNull();
  });

  it("hides the inner fill under image content and restores it when the image is replaced by text", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", size: "l", url: "https://example.com/a.png" }));
    const wrapper = resolveMarkerWrapper(outer);
    const inner = () => wrapper.querySelector<SVGElement>(".marker-inner")!;
    expect(inner().style.visibility).toBe("hidden");

    updateMarkerElement(outer, { content: "AB" });
    expect(wrapper.querySelector("image")).toBeNull();
    expect(inner().style.visibility).toBe("");
  });

  it("rebuilds the shape at the new size's geometry and keeps text content at that size's font size", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", size: "l", content: "AB" }));
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.querySelector("text")?.getAttribute("font-size")).toBe("14");

    updateMarkerElement(outer, { size: "s" });
    const svg = wrapper.querySelector<SVGSVGElement>("svg.marker-shape")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg.querySelector(".marker-inner")?.getAttribute("r")).toBe("8");
    const text = svg.querySelector("text");
    expect(text?.textContent).toBe("AB");
    expect(text?.getAttribute("font-size")).toBe("8");
  });

  it("builds a fresh shape svg when growing past xs on a marker constructed at xs", () => {
    const outer = createMarkerElement(baseOptions({ size: "xs", shape: "circle" }));
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.querySelector("svg.marker-shape")).toBeNull();

    updateMarkerElement(outer, { size: "l" });
    expect(wrapper.querySelector("svg.marker-dot")).toBeNull();
    const shapeSvg = wrapper.querySelector<SVGSVGElement>("svg.marker-shape");
    expect(shapeSvg).not.toBeNull();
    expect(shapeSvg?.getAttribute("height")).toBe(String(SIZE_PX.l));
  });

  it("swaps shape and preserves outline width on the new svg", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", outline: 3 }));
    updateMarkerElement(outer, { shape: "square" });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.dataset.markerShape).toBe("square");
    expect(wrapper.querySelector(".marker-outer")?.getAttribute("stroke-width")).toBe("3");
  });

  it("migrates text content to the new shape when shape changes", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", content: "AB" }));
    updateMarkerElement(outer, { shape: "square" });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.querySelector(".marker-content")?.textContent).toBe("AB");
  });

  it("migrates glyph content (template returning an SVGElement) to the new shape when shape changes", () => {
    registerMarkerTemplate("test-glyph", () => document.createElementNS("http://www.w3.org/2000/svg", "circle"));
    const outer = createMarkerElement(baseOptions({ shape: "circle", template: "test-glyph" }));
    const wrapper = resolveMarkerWrapper(outer);
    const before = wrapper.querySelector(".marker-content");
    expect(before?.tagName.toLowerCase()).toBe("g");

    updateMarkerElement(outer, { shape: "square" });
    expect(wrapper.dataset.markerShape).toBe("square");
    const after = wrapper.querySelector(".marker-content");
    expect(after?.tagName.toLowerCase()).toBe("g");
    expect(after?.querySelector("circle")).not.toBeNull();
  });

  it("migrates image content to the new shape when shape changes", () => {
    const outer = createMarkerElement(baseOptions({ shape: "circle", url: "https://example.com/pin.png" }));
    updateMarkerElement(outer, { shape: "square" });
    const wrapper = resolveMarkerWrapper(outer);
    const content = wrapper.querySelector(".marker-content");
    expect(content?.tagName.toLowerCase()).toBe("image");
    expect(content?.getAttribute("href")).toBe("https://example.com/pin.png");
  });

  it("migrates element (foreignObject) content to the new shape when shape changes", () => {
    const custom = document.createElement("span");
    custom.textContent = "hi";
    const outer = createMarkerElement(multiContentOptions({ shape: "circle", element: custom }));
    updateMarkerElement(outer, { shape: "square" });
    const wrapper = resolveMarkerWrapper(outer);
    const content = wrapper.querySelector(".marker-content");
    expect(content?.tagName.toLowerCase()).toBe("foreignobject");
    expect(content?.contains(custom)).toBe(true);
  });

  it("adds and removes the debug overlay", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { debug: true });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.querySelector(".marker-debug")).not.toBeNull();
    updateMarkerElement(outer, { debug: false });
    expect(wrapper.querySelector(".marker-debug")).toBeNull();
  });

  it("sets and removes z-index for the priority prop", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { priority: 4 });
    expect(outer.style.zIndex).toBe("4");
    updateMarkerElement(outer, { priority: undefined });
    expect(outer.style.zIndex).toBe("");
  });

  it("no-ops entirely when the batch is empty", () => {
    const outer = createMarkerElement(baseOptions());
    const wrapper = resolveMarkerWrapper(outer);
    const before = wrapper.getAttribute("style");
    updateMarkerElement(outer, {});
    expect(wrapper.getAttribute("style")).toBe(before);
  });
});

//#endregion

//#region applyLifecycleLift

describe("applyLifecycleLift", () => {
  it("sets the lift as a translateY offset without disturbing scale/rotation", () => {
    const outer = createMarkerElement(baseOptions({ scale: [2, 2], rotation: 10 }));
    applyLifecycleLift(outer, -20);
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.style.transform).toContain("translateY(-20px)");
    expect(wrapper.style.transform).toContain("scale(2, 2)");
    expect(wrapper.style.transform).toContain("rotate(10deg)");
  });
});

//#endregion

//#region Collision / altitude DOM flags

describe("applyCollisionHidden / releaseCollisionFadeClass", () => {
  it("adds the fade class and toggles the hidden class", () => {
    const el = document.createElement("div");
    applyCollisionHidden(el, true);
    expect(el.classList.contains("maptiler-marker-collision-fade")).toBe(true);
    expect(el.classList.contains("maptiler-marker-collision-hidden")).toBe(true);

    applyCollisionHidden(el, false);
    expect(el.classList.contains("maptiler-marker-collision-hidden")).toBe(false);
    expect(el.classList.contains("maptiler-marker-collision-fade")).toBe(true);
  });

  it("releaseCollisionFadeClass removes the fade class", () => {
    const el = document.createElement("div");
    applyCollisionHidden(el, true);
    releaseCollisionFadeClass(el);
    expect(el.classList.contains("maptiler-marker-collision-fade")).toBe(false);
  });
});

describe("applyCollisionCulled", () => {
  it("adds the culled class and reports a change", () => {
    const el = document.createElement("div");
    expect(applyCollisionCulled(el, true)).toBe(true);
    expect(el.classList.contains("maptiler-marker-collision-culled")).toBe(true);
  });

  it("reports no change when already in the requested state", () => {
    const el = document.createElement("div");
    applyCollisionCulled(el, true);
    expect(applyCollisionCulled(el, true)).toBe(false);
    applyCollisionCulled(el, false);
    expect(applyCollisionCulled(el, false)).toBe(false);
  });
});

describe("applyAltitudeHidden / applyAltitudeOccluded", () => {
  it("toggles the hidden class", () => {
    const el = document.createElement("div");
    applyAltitudeHidden(el, true);
    expect(el.classList.contains("maptiler-marker-altitude-hidden")).toBe(true);
    applyAltitudeHidden(el, false);
    expect(el.classList.contains("maptiler-marker-altitude-hidden")).toBe(false);
  });

  it("toggles the occluded class", () => {
    const el = document.createElement("div");
    applyAltitudeOccluded(el, true);
    expect(el.classList.contains("maptiler-marker-altitude-occluded")).toBe(true);
    applyAltitudeOccluded(el, false);
    expect(el.classList.contains("maptiler-marker-altitude-occluded")).toBe(false);
  });
});

//#endregion

//#region applyMinimizedDot

describe("applyMinimizedDot", () => {
  it("hides content and adds a dot overlay when enabled", () => {
    const el = document.createElement("div");
    applyMinimizedDot(el, "center", true);
    expect(el.style.visibility).toBe("hidden");
    expect(el.querySelector("svg.marker-minimized-dot")).not.toBeNull();
  });

  it("restores visibility and removes the dot when disabled", () => {
    const el = document.createElement("div");
    applyMinimizedDot(el, "center", true);
    applyMinimizedDot(el, "center", false);
    expect(el.style.visibility).toBe("");
    expect(el.querySelector("svg.marker-minimized-dot")).toBeNull();
  });

  it("does not add a duplicate dot when called twice while enabled", () => {
    const el = document.createElement("div");
    applyMinimizedDot(el, "center", true);
    applyMinimizedDot(el, "center", true);
    expect(el.querySelectorAll("svg.marker-minimized-dot")).toHaveLength(1);
  });

  it("positions the dot according to the anchor", () => {
    const el = document.createElement("div");
    applyMinimizedDot(el, "top-left", true);
    const dot = el.querySelector<SVGElement>("svg.marker-minimized-dot")!;
    expect(dot.style.left).toBe("0%");
    expect(dot.style.top).toBe("0%");
  });
});

//#endregion

//#region wrap / forwardPointerEvents

describe("wrap", () => {
  it("wraps the element in a new container div", () => {
    const inner = document.createElement("span");
    const outer = wrap(inner);
    expect(outer.tagName.toLowerCase()).toBe("div");
    expect(outer.firstElementChild).toBe(inner);
  });
});

describe("forwardPointerEvents", () => {
  it("disables pointer events on the parent and enables them on the wrapper child", () => {
    const parent = document.createElement("div");
    const wrapper = document.createElement("div");
    wrapper.className = "marker-transform-wrapper";
    parent.appendChild(wrapper);
    forwardPointerEvents(parent);
    expect(parent.style.pointerEvents).toBe("none");
    expect(wrapper.style.pointerEvents).toBe("auto");
  });

  it("does nothing when there is no wrapper child", () => {
    const parent = document.createElement("div");
    forwardPointerEvents(parent);
    expect(parent.style.pointerEvents).toBe("");
  });
});

//#endregion

//#region Constants

describe("constants", () => {
  it("COLLISION_FADE_DURATION_MS is 150", () => {
    expect(COLLISION_FADE_DURATION_MS).toBe(150);
  });

  it("GROUND_LINE_CLASSNAME is stable", () => {
    expect(GROUND_LINE_CLASSNAME).toBe("maptiler-marker-groundline");
  });
});

//#endregion
