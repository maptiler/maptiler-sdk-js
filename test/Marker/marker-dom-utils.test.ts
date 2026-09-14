import { describe, expect, it } from "vitest";
import {
  COLLISION_FADE_DURATION_MS,
  GROUND_LINE_CLASSNAME,
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
import { DEFAULT_INNER_COLOR, DEFAULT_OUTER_COLOR } from "../../src/Marker/marker-svg-config";

function baseOptions(overrides: Partial<MapTilerMarkerOptions> = {}): MapTilerMarkerOptions {
  return { ...overrides } as MapTilerMarkerOptions;
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

//#region applyMarkerStyleVariables

describe("applyMarkerStyleVariables", () => {
  it("sets default colors when none are provided", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions());
    expect(el.style.getPropertyValue("--marker-outer-color")).toBe(DEFAULT_OUTER_COLOR);
    expect(el.style.getPropertyValue("--marker-inner-color")).toBe(DEFAULT_INNER_COLOR);
  });

  it("uses explicit outer/inner/content/outline colors when given", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions({ outerColor: "red", innerColor: "blue", contentColor: "green", outlineColor: "black" }));
    expect(el.style.getPropertyValue("--marker-outer-color")).toBe("red");
    expect(el.style.getPropertyValue("--marker-inner-color")).toBe("blue");
    expect(el.style.getPropertyValue("--marker-content-color")).toBe("green");
    expect(el.style.getPropertyValue("--marker-outline-color")).toBe("black");
  });

  it("defaults outline color to transparent", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions());
    expect(el.style.getPropertyValue("--marker-outline-color")).toBe("transparent");
  });

  it("resolves an adaptive color's base bg color for the inner color", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions({ color: "green" }));
    expect(el.style.getPropertyValue("--marker-inner-color")).not.toBe(DEFAULT_INNER_COLOR);
  });

  it("sets shadow filter var to 'none' when no shadow is given", () => {
    const el = document.createElement("div");
    applyMarkerStyleVariables(el, baseOptions());
    expect(el.style.getPropertyValue("--marker-shadow")).toBe("none");
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

  it("innerColor takes precedence over color when both are in the same batch", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { color: "blue", innerColor: "purple" });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.style.getPropertyValue("--marker-inner-color")).toBe("purple");
  });

  it("resolves the adaptive color against the given styleId", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { color: "blue" }, "streets");
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.style.getPropertyValue("--marker-inner-color")).not.toBe("");
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

  it("sets shadow filter var, defaulting to 'none' when undefined", () => {
    const outer = createMarkerElement(baseOptions());
    updateMarkerElement(outer, { shadow: "strong" });
    const wrapper = resolveMarkerWrapper(outer);
    expect(wrapper.style.getPropertyValue("--marker-shadow")).toContain("drop-shadow");
    updateMarkerElement(outer, { shadow: undefined });
    expect(wrapper.style.getPropertyValue("--marker-shadow")).toBe("none");
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
    const outer = createMarkerElement(baseOptions({ content: "1" }));
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

    updateMarkerElement(outer, { size: "l" });
    expect(wrapper.querySelector("svg.marker-dot")).toBeNull();
    expect((shapeSvg.style as CSSStyleDeclaration).display).toBe("block");
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
