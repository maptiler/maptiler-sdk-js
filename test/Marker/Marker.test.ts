import { afterEach, describe, expect, it, vi } from "vitest";
import { Marker } from "../../src/Marker/Marker";
import { MarkerManager } from "../../src/Marker/MarkerManager";
import { ApplyAltitudeFrameSymbol, ApplyCollisionDisplayStateSymbol, CollisionFootprintSymbol, MeasuredElementSizeSymbol } from "../../src/Marker/marker-symbols";
import { SIZE_PX } from "../../src/Marker/marker-svg-config";
import { ADAPTIVE_COLORS } from "../../src/Marker/marker-adaptive-colors";
import type { mat4 } from "gl-matrix";
import { createMockMap, type MockMap } from "./mock-map";

function registeredMarker(map: MockMap, options: ConstructorParameters<typeof Marker>[0] = {}) {
  const marker = new Marker(options);
  marker.setLngLat([0, 0]);
  MarkerManager.register(marker, map);
  return marker;
}

afterEach(() => {
  vi.useRealTimers();
});

//#region Constructor

describe("Marker constructor", () => {
  it("defaults scale to [1, 1]", () => {
    const marker = new Marker({});
    expect(marker.getScale()).toEqual([1, 1]);
  });

  it("stores the construction-time options snapshot on .options", () => {
    const marker = new Marker({ shape: "circle", size: "l" });
    expect(marker.options.shape).toBe("circle");
    expect(marker.options.size).toBe("l");
  });

  it("computes a shape anchor offset automatically when no explicit offset or element is given", () => {
    const marker = new Marker({ shape: "bubble-square", size: "m" });
    const offset = marker.getOffset();
    expect(offset.x).toBe(0);
    expect(offset.y).toBeLessThan(0);
  });

  it("does not auto-manage offset when an explicit offset is given", () => {
    const marker = new Marker({ offset: [5, 5] });
    const offset = marker.getOffset();
    expect(offset.x).toBe(5);
    expect(offset.y).toBe(5);
  });

  it("does not auto-manage offset for a custom element marker", () => {
    const el = document.createElement("div");
    const marker = new Marker({ element: el });
    const offset = marker.getOffset();
    expect(offset.x).toBe(0);
    expect(offset.y).toBe(0);
  });

  it("seeds style variables directly on a custom element", () => {
    const el = document.createElement("div");
    const marker = new Marker({ element: el, outerColor: "red" });
    expect(el.style.getPropertyValue("--marker-outer-color")).toBe("red");
    void marker;
  });

  it("masks opacity to 0 when an enter animation is configured", () => {
    const marker = new Marker({ animations: { enter: { preset: "fade" } } });
    expect(marker.getElement().style.opacity).toBe("0");
  });

  it("does not mask opacity when no enter animation is configured", () => {
    const marker = new Marker({});
    expect(marker.getElement().style.opacity).not.toBe("0");
  });

  it("sets a static z-index when a numeric priority is given", () => {
    const marker = new Marker({ priority: 3 });
    expect(marker.getElement().style.zIndex).toBe("3");
  });

  it("assigns each marker a unique id", () => {
    const a = new Marker({});
    const b = new Marker({});
    expect(a.id).not.toBe(b.id);
  });
});

//#endregion

//#region Scale

describe("setScale / getScale", () => {
  it("sets and returns the 2D scale", () => {
    const marker = new Marker({});
    marker.setScale([2, 3]);
    expect(marker.getScale()).toEqual([2, 3]);
  });
});

//#endregion

//#region Shape / Size

describe("setShape / getShape", () => {
  it("sets the shape and recomputes the anchor offset", () => {
    const marker = new Marker({ shape: "circle" }); // center-anchored -> [0,0]
    expect(marker.getOffset()).toEqual({ x: 0, y: 0 });
    marker.setShape("bubble-square"); // bottom-anchored -> offset should shift
    expect(marker.getShape()).toBe("bubble-square");
    expect(marker.getOffset().y).toBeLessThan(0);
  });

  it("does not recompute offset when an explicit offset was given", () => {
    const marker = new Marker({ offset: [1, 2], shape: "circle" });
    marker.setShape("bubble-square");
    expect(marker.getOffset()).toEqual({ x: 1, y: 2 });
  });
});

describe("setSize / getSize", () => {
  it("sets the size and recomputes the anchor offset", () => {
    const marker = new Marker({ shape: "bubble-square", size: "s" });
    const smallOffset = marker.getOffset().y;
    marker.setSize("l");
    expect(marker.getSize()).toBe("l");
    expect(Math.abs(marker.getOffset().y)).toBeGreaterThan(Math.abs(smallOffset));
  });
});

//#endregion

//#region Shadow / Outline

describe("setShadow / getShadow", () => {
  it("sets and returns the shadow preset", () => {
    const marker = new Marker({});
    marker.setShadow("strong");
    expect(marker.getShadow()).toBe("strong");
  });
});

describe("setOutline / getOutline", () => {
  it("sets and returns the outline value", () => {
    const marker = new Marker({});
    marker.setOutline(true);
    expect(marker.getOutline()).toBe(true);
    marker.setOutline(4);
    expect(marker.getOutline()).toBe(4);
  });
});

//#endregion

//#region Colors

describe("setOuterColor / getOuterColor", () => {
  it("sets and returns the outer color (no map -> applies immediately)", () => {
    const marker = new Marker({});
    marker.setOuterColor("red");
    expect(marker.getOuterColor()).toBe("red");
  });
});

describe("setInnerColor / getInnerColor", () => {
  it("getInnerColor returns the explicit innerColor when set, over the map-style default", () => {
    const marker = new Marker({});
    marker.setInnerColor("magenta");
    expect(marker.getInnerColor()).toBe("magenta");
  });

  it("setInnerColor(undefined) returns to the map-style default", () => {
    const marker = new Marker({ innerColor: "purple" });
    marker.setInnerColor(undefined);
    expect(marker.getInnerColor()).toBe(ADAPTIVE_COLORS.base.innerColor);
  });

  it("getInnerColor returns the base default when innerColor is not set and the marker has no map", () => {
    const marker = new Marker({});
    expect(marker.getInnerColor()).toBe(ADAPTIVE_COLORS.base.innerColor);
  });
});

describe("setContentColor / getContentColor", () => {
  it("sets and returns the content color", () => {
    const marker = new Marker({});
    marker.setContentColor("green");
    expect(marker.getContentColor()).toBe("green");
  });
});

describe("setOutlineColor / getOutlineColor", () => {
  it("sets and returns the outline color", () => {
    const marker = new Marker({});
    marker.setOutlineColor("black");
    expect(marker.getOutlineColor()).toBe("black");
  });
});

//#endregion

//#region Title / Content / Priority / Debug

describe("setTitle / getTitle", () => {
  it("sets and returns the title", () => {
    const marker = new Marker({});
    marker.setTitle("hello");
    expect(marker.getTitle()).toBe("hello");
  });
});

describe("setContent / getContent", () => {
  it("sets and returns the content", () => {
    const marker = new Marker({});
    marker.setContent("42");
    expect(marker.getContent()).toBe("42");
  });
});

describe("setPriority / getPriority", () => {
  it("sets and returns the priority", () => {
    const marker = new Marker({});
    marker.setPriority(9);
    expect(marker.getPriority()).toBe(9);
  });
});

describe("setDebug / getDebug", () => {
  it("defaults to false", () => {
    const marker = new Marker({});
    expect(marker.getDebug()).toBe(false);
  });

  it("sets and returns the debug flag", () => {
    const marker = new Marker({});
    marker.setDebug(true);
    expect(marker.getDebug()).toBe(true);
  });
});

//#endregion

//#region Rotation

describe("setRotation / getRotation", () => {
  it("defaults to 0", () => {
    const marker = new Marker({});
    expect(marker.getRotation()).toBe(0);
  });

  it("sets and returns rotation (no map -> applies immediately)", () => {
    const marker = new Marker({});
    marker.setRotation(45);
    expect(marker.getRotation()).toBe(45);
  });
});

//#endregion

//#region Collision footprint

describe("CollisionFootprintSymbol", () => {
  it("uses a centered square when collisionRadius is set", () => {
    const marker = new Marker({ offset: [0, 0], collisionRadius: 15 });
    const footprint = marker[CollisionFootprintSymbol]();
    expect(footprint.width).toBe(30);
    expect(footprint.height).toBe(30);
    expect(footprint.anchor).toBe("center");
  });

  it("uses the measured element size for a custom element marker", () => {
    const el = document.createElement("div");
    const marker = new Marker({ element: el, offset: [0, 0] });
    // simulate MarkerManager's registration-time measurement
    marker[MeasuredElementSizeSymbol] = [50, 60];
    const footprint = marker[CollisionFootprintSymbol]();
    expect(footprint.width).toBe(50);
    expect(footprint.height).toBe(60);
  });

  it("scales the footprint with the marker's 2D scale", () => {
    const marker = new Marker({ offset: [0, 0], collisionRadius: 10 });
    marker.setScale([2, 1]);
    const footprint = marker[CollisionFootprintSymbol]();
    // collisionRadius footprint ignores per-axis scale (fixed square from radius)
    expect(footprint.width).toBe(20);
  });

  it("derives width/height from the built-in shape and size when no radius is set", () => {
    const marker = new Marker({ shape: "circle", size: "m", offset: [0, 0] });
    const footprint = marker[CollisionFootprintSymbol]();
    expect(footprint.height).toBe(SIZE_PX.m);
    expect(footprint.width).toBe(SIZE_PX.m); // circle viewBox is square
  });

  it("uses a bottom pivot for a bottom-anchored shape", () => {
    const marker = new Marker({ shape: "bubble-square", size: "m", offset: [0, 0] });
    const footprint = marker[CollisionFootprintSymbol]();
    expect(footprint.pivot[1]).toBeGreaterThan(0);
  });

  it("uses a center pivot for a center-anchored shape", () => {
    const marker = new Marker({ shape: "circle", size: "m", offset: [0, 0] });
    const footprint = marker[CollisionFootprintSymbol]();
    expect(footprint.pivot).toEqual([0, 0]);
  });

  it("mapAligned reflects rotationAlignment 'map'", () => {
    const marker = new Marker({ rotationAlignment: "map", offset: [0, 0] });
    expect(marker[CollisionFootprintSymbol]().mapAligned).toBe(true);
  });
});

//#endregion

//#region UI States

describe("UI states", () => {
  it("applies hover overrides on pointerenter and restores on pointerleave", () => {
    const marker = new Marker({});
    marker.setUIState("hover", { opacity: 0.5 });
    const wrapper = marker.getElement().querySelector<HTMLElement>(".marker-transform-wrapper")!;

    wrapper.dispatchEvent(new Event("pointerenter"));
    expect(wrapper.style.opacity).toBe("0.5");

    wrapper.dispatchEvent(new Event("pointerleave"));
    expect(wrapper.style.opacity).not.toBe("0.5");
  });

  it("active state applies on pointerdown and clears on pointerup", () => {
    const marker = new Marker({});
    marker.setUIState("active", { opacity: 0.2 });
    const wrapper = marker.getElement().querySelector<HTMLElement>(".marker-transform-wrapper")!;

    wrapper.dispatchEvent(new Event("pointerdown"));
    expect(wrapper.style.opacity).toBe("0.2");

    wrapper.dispatchEvent(new Event("pointerup"));
    expect(wrapper.style.opacity).not.toBe("0.2");
  });

  it("dragging state activates on marker dragstart and clears on dragend", () => {
    const marker = new Marker({});
    marker.setUIState("dragging", { opacity: 0.1 });
    const wrapper = marker.getElement().querySelector<HTMLElement>(".marker-transform-wrapper")!;

    marker.fire("dragstart");
    expect(wrapper.style.opacity).toBe("0.1");

    marker.fire("dragend");
    expect(wrapper.style.opacity).not.toBe("0.1");
  });

  it("higher-priority active state overrides a lower one", () => {
    const marker = new Marker({});
    marker.setUIState("hover", { opacity: 0.5 });
    marker.setUIState("active", { opacity: 0.9 });
    const wrapper = marker.getElement().querySelector<HTMLElement>(".marker-transform-wrapper")!;

    wrapper.dispatchEvent(new Event("pointerenter"));
    wrapper.dispatchEvent(new Event("pointerdown"));
    expect(wrapper.style.opacity).toBe("0.9");

    wrapper.dispatchEvent(new Event("pointerup"));
    expect(wrapper.style.opacity).toBe("0.5"); // falls back to hover
  });

  it("registering a new spec while the state is active applies it immediately", () => {
    const marker = new Marker({});
    const wrapper = marker.getElement().querySelector<HTMLElement>(".marker-transform-wrapper")!;
    wrapper.dispatchEvent(new Event("pointerenter"));
    marker.setUIState("hover", { opacity: 0.33 });
    expect(wrapper.style.opacity).toBe("0.33");
  });
});

//#endregion

//#region Transitions

describe("setTransitionForProperty / getTransitions", () => {
  it("stores and returns configured transitions", () => {
    const marker = new Marker({});
    marker.setTransitionForProperty("rotation", [300, "Linear"]);
    expect(marker.getTransitions()).toEqual({ rotation: [300, "Linear"] });
  });

  it("clears a transition when passed null", () => {
    const marker = new Marker({});
    marker.setTransitionForProperty("rotation", [300]);
    marker.setTransitionForProperty("rotation", null);
    expect(marker.getTransitions()).toEqual({});
  });

  it("applies a change immediately when no map is attached, even with a transition configured", () => {
    const marker = new Marker({});
    marker.setTransitionForProperty("rotation", [1000]);
    marker.setRotation(90);
    expect(marker.getRotation()).toBe(90);
  });

  it("eases a property change and fires transitionstart/transitionend when on a map", async () => {
    vi.useFakeTimers();
    const map = createMockMap();
    const marker = registeredMarker(map);
    marker.setTransitionForProperty("rotation", [30]);

    const start = vi.fn();
    const end = vi.fn();
    marker.on("transitionstart", start);
    marker.on("transitionend", end);

    marker.setRotation(90);
    // mid-flight the value hasn't necessarily reached 90 yet
    expect(start).toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(200);
    expect(end).toHaveBeenCalled();
    expect(marker.getRotation()).toBe(90);
  });
});

//#endregion

//#region Lifecycle animations

describe("Lifecycle animations", () => {
  it("plays the enter animation on addTo and fires enteranimationstart/end", async () => {
    vi.useFakeTimers();
    const map = createMockMap();
    const marker = new Marker({ animations: { enter: { preset: "fade", duration: 30 } } });
    marker.setLngLat([0, 0]);

    const start = vi.fn();
    const end = vi.fn();
    marker.on("enteranimationstart", start);
    marker.on("enteranimationend", end);

    MarkerManager.register(marker, map);
    expect(start).toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(200);
    expect(end).toHaveBeenCalled();
    expect(marker.getElement().style.opacity).not.toBe("0");
  });

  it("plays the exit animation on remove, deferring DOM detach until it completes", async () => {
    vi.useFakeTimers();
    const map = createMockMap();
    const marker = new Marker({ animations: { exit: { preset: "fade", duration: 30 } } });
    marker.setLngLat([0, 0]);
    MarkerManager.register(marker, map);

    const end = vi.fn();
    marker.on("exitanimationend", end);

    marker.remove();
    // still attached while the exit animation plays
    expect(marker.getElement().isConnected).toBe(true);

    await vi.advanceTimersByTimeAsync(200);
    expect(end).toHaveBeenCalled();
    expect(marker.getElement().isConnected).toBe(false);
  });

  it("removes immediately with no exit animation configured", () => {
    const map = createMockMap();
    const marker = registeredMarker(map);
    marker.remove();
    expect(marker.getElement().isConnected).toBe(false);
  });

  it("starts the idle animation after the enter animation completes", async () => {
    vi.useFakeTimers();
    const map = createMockMap();
    const marker = new Marker({
      animations: { enter: { preset: "fade", duration: 20 }, idle: { preset: "pulsescale", duration: 20 } },
    });
    marker.setLngLat([0, 0]);

    const idleStart = vi.fn();
    marker.on("idleanimationstart", idleStart);

    MarkerManager.register(marker, map);
    await vi.advanceTimersByTimeAsync(200);
    expect(idleStart).toHaveBeenCalled();
    // the idle preset loops forever (Infinity iterations) — stop it, or it
    // keeps running in the shared AnimationManager singleton across tests
    marker.remove();
  });

  it("invokes a custom enter animation callback with an eased 0->1 alpha", async () => {
    vi.useFakeTimers();
    const map = createMockMap();
    const seen: number[] = [];
    const marker = new Marker({
      animations: {
        enter: {
          duration: 20,
          custom: (alpha) => {
            seen.push(alpha);
          },
        },
      },
    });
    marker.setLngLat([0, 0]);

    const end = vi.fn();
    marker.on("enteranimationend", end);
    MarkerManager.register(marker, map);

    await vi.advanceTimersByTimeAsync(200);
    expect(end).toHaveBeenCalled();
    expect(seen.length).toBeGreaterThan(0);
    expect(seen[seen.length - 1]).toBe(1);
  });
});

//#endregion

//#region Altitude

describe("Altitude", () => {
  it("defaults to 0 meters, ground reference, not engaged", () => {
    const marker = new Marker({});
    expect(marker.getAltitude()).toBe(0);
    expect(marker.getAltitudeReference()).toBe("ground");
    expect(marker.hasActiveAltitude()).toBe(false);
  });

  it("setAltitude engages altitude tracking and registers with MarkerManager when on a map", () => {
    const map = createMockMap();
    const marker = registeredMarker(map);
    marker.setAltitude(50);
    expect(marker.hasActiveAltitude()).toBe(true);
    expect(marker.getAltitude()).toBe(50);
    expect(map.triggerRepaint).toHaveBeenCalled();
  });

  it("setAltitude(false) disengages and restores native offset", () => {
    const map = createMockMap();
    const marker = registeredMarker(map, { offset: [3, 4] });
    marker.setAltitude(20);
    marker.setAltitude(false);
    expect(marker.hasActiveAltitude()).toBe(false);
    expect(marker.getAltitude()).toBe(0);
    expect(marker.getOffset()).toEqual({ x: 3, y: 4 });
  });

  it("setAltitude(false) is a no-op when altitude was never engaged", () => {
    const marker = new Marker({ offset: [1, 1] });
    expect(() => marker.setAltitude(false)).not.toThrow();
    expect(marker.getOffset()).toEqual({ x: 1, y: 1 });
  });

  it("relativeTo option is stored and returned", () => {
    const marker = new Marker({});
    marker.setAltitude(10, { relativeTo: "sea" });
    expect(marker.getAltitudeReference()).toBe("sea");
  });

  it("stamps altitude data onto drag events", () => {
    const marker = new Marker({});
    marker.setAltitude(25, { relativeTo: "sea" });
    const listener = vi.fn();
    marker.on("dragstart", listener);
    marker.fire("dragstart");
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        altitude: 25,
        altitudeReference: "sea",
        altitudeEngaged: true,
      }),
    );
  });

  it("does not stamp altitude data onto unrelated events", () => {
    const marker = new Marker({});
    const listener = vi.fn();
    marker.on("click", listener);
    marker.fire("click");
    expect(listener).toHaveBeenCalled();
    const [event] = listener.mock.calls[0] as [Record<string, unknown>];
    expect(event.altitude).toBeUndefined();
  });
});

//#endregion

//#region Ground line

describe("setGroundLine", () => {
  it("creates a ground-line element in the shared container once altitude projects a position", () => {
    const map = createMockMap();
    const marker = registeredMarker(map);
    marker.setGroundLine(true);
    marker.setAltitude(10);

    const identity: mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as unknown as mat4;
    const depth = marker[ApplyAltitudeFrameSymbol](identity, map);

    expect(depth).not.toBeNull();
    expect(MarkerManager.getGroundLineContainer(map).children.length).toBe(1);
  });

  it("hides the marker (returns null depth) when the projected point is behind the camera", () => {
    const map = createMockMap();
    const marker = registeredMarker(map);
    marker.setGroundLine(true);
    marker.setAltitude(10);

    const negativeW: mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1] as unknown as mat4;
    const depth = marker[ApplyAltitudeFrameSymbol](negativeW, map);

    expect(depth).toBeNull();
    expect(MarkerManager.getGroundLineContainer(map).children.length).toBe(0);
  });

  it("removes the ground-line element when disabled", () => {
    const map = createMockMap();
    const marker = registeredMarker(map);
    marker.setGroundLine(true);
    marker.setGroundLine(false);
    expect(MarkerManager.getGroundLineContainer(map).children.length).toBe(0);
  });
});

//#endregion

//#region getCollisionDisplayState

describe("getCollisionDisplayState", () => {
  it("defaults to visible", () => {
    const marker = new Marker({});
    expect(marker.getCollisionDisplayState()).toBe("visible");
  });
});

//#endregion

//#region ApplyCollisionDisplayStateSymbol (fade/timer state machine)

const COLLISION_HIDDEN_CLASS = "maptiler-marker-collision-hidden";
const COLLISION_CULLED_CLASS = "maptiler-marker-collision-culled";

describe("ApplyCollisionDisplayStateSymbol", () => {
  it("visible -> hidden fades out immediately, then culls (display:none) once the transition duration elapses", () => {
    vi.useFakeTimers();
    const marker = new Marker({});
    const el = marker.getElement();

    marker[ApplyCollisionDisplayStateSymbol]("hidden");

    expect(marker.getCollisionDisplayState()).toBe("hidden");
    expect(el.classList.contains(COLLISION_HIDDEN_CLASS)).toBe(true);
    expect(el.classList.contains(COLLISION_CULLED_CLASS)).toBe(false); // not culled yet — still fading

    vi.advanceTimersByTime(200);
    expect(el.classList.contains(COLLISION_CULLED_CLASS)).toBe(true);
  });

  it("re-entering from hidden un-culls immediately and fades back to visible", () => {
    vi.useFakeTimers();
    const marker = new Marker({});
    const el = marker.getElement();

    marker[ApplyCollisionDisplayStateSymbol]("hidden");
    vi.advanceTimersByTime(200);
    expect(el.classList.contains(COLLISION_CULLED_CLASS)).toBe(true);

    marker[ApplyCollisionDisplayStateSymbol]("visible");
    expect(el.classList.contains(COLLISION_CULLED_CLASS)).toBe(false);
    expect(el.classList.contains(COLLISION_HIDDEN_CLASS)).toBe(false);
  });

  it("re-entering from hidden into minimized swaps the appearance while still invisible", () => {
    vi.useFakeTimers();
    const marker = new Marker({});
    const el = marker.getElement();

    marker[ApplyCollisionDisplayStateSymbol]("hidden");
    vi.advanceTimersByTime(200);

    marker[ApplyCollisionDisplayStateSymbol]("minimized");

    expect(marker.getCollisionDisplayState()).toBe("minimized");
    expect(el.classList.contains(COLLISION_CULLED_CLASS)).toBe(false); // re-entered rendering
    expect(el.querySelector("svg.marker-dot")).not.toBeNull(); // minimized appearance already applied
  });

  it("visible -> minimized fades out, swaps the DOM at the invisible midpoint, then fades back in", () => {
    vi.useFakeTimers();
    const marker = new Marker({});
    const el = marker.getElement();

    marker[ApplyCollisionDisplayStateSymbol]("minimized");
    // fading out first — the swap hasn't happened yet
    expect(el.classList.contains(COLLISION_HIDDEN_CLASS)).toBe(true);
    expect(el.querySelector("svg.marker-dot")).toBeNull();

    vi.advanceTimersByTime(200);
    // swapped at the midpoint, then faded back in
    expect(el.querySelector("svg.marker-dot")).not.toBeNull();
    expect(el.classList.contains(COLLISION_HIDDEN_CLASS)).toBe(false);
  });

  it("reversing before the pending minimize swap fires cancels it and takes the no-swap fast path", () => {
    vi.useFakeTimers();
    const marker = new Marker({});
    const el = marker.getElement();

    marker[ApplyCollisionDisplayStateSymbol]("minimized"); // schedules the swap timer; not applied yet
    marker[ApplyCollisionDisplayStateSymbol]("visible"); // reversed before the timer fires

    expect(marker.getCollisionDisplayState()).toBe("visible");
    expect(el.classList.contains(COLLISION_HIDDEN_CLASS)).toBe(false);
    expect(el.querySelector("svg.marker-dot")).toBeNull();

    // the cancelled timer must not fire later and re-apply the minimized swap
    vi.advanceTimersByTime(200);
    expect(el.querySelector("svg.marker-dot")).toBeNull();
  });
});

//#endregion

//#region Minimize / restore appearance cycle

describe("minimize/restore appearance cycle", () => {
  it("applies minimizedOptions overrides while minimized, and restores the original props after", () => {
    vi.useFakeTimers();
    const marker = new Marker({ shape: "circle", size: "l", outerColor: "red", minimizedOptions: { outerColor: "blue" } });
    const wrapper = marker.getElement().querySelector<HTMLElement>(".marker-transform-wrapper")!;

    marker[ApplyCollisionDisplayStateSymbol]("minimized");
    vi.advanceTimersByTime(200);

    expect(wrapper.style.getPropertyValue("--marker-outer-color")).toBe("blue");
    expect(marker.getSize()).toBe("l"); // getSize() reflects props, unaffected by the DOM-only minimized override

    marker[ApplyCollisionDisplayStateSymbol]("visible");
    vi.advanceTimersByTime(200);

    expect(wrapper.style.getPropertyValue("--marker-outer-color")).toBe("red");
  });

  it("restoring a minimized 'innerColor' override when the live prop is an explicit innerColor restores the explicit value", () => {
    vi.useFakeTimers();
    // minimizedOptions overrides innerColor, but the marker's own live color is a different explicit `innerColor` — restoreUpdates must restore the *live* one.
    const marker = new Marker({ innerColor: "purple", minimizedOptions: { innerColor: "red" } });
    const wrapper = marker.getElement().querySelector<HTMLElement>(".marker-transform-wrapper")!;

    marker[ApplyCollisionDisplayStateSymbol]("minimized");
    vi.advanceTimersByTime(200);
    expect(wrapper.style.getPropertyValue("--marker-inner-color")).not.toBe("purple"); // minimized override applied

    marker[ApplyCollisionDisplayStateSymbol]("visible");
    vi.advanceTimersByTime(200);

    expect(wrapper.style.getPropertyValue("--marker-inner-color")).toBe("purple");
  });

  it("restoring a minimized 'innerColor' override when the live prop is unset re-resolves the map-style default", () => {
    vi.useFakeTimers();
    // minimizedOptions overrides innerColor directly, but the marker's own live color is the map-style default — restoreUpdates must re-resolve it, not reuse the raw override.
    const marker = new Marker({ minimizedOptions: { innerColor: "black" } });
    const wrapper = marker.getElement().querySelector<HTMLElement>(".marker-transform-wrapper")!;

    marker[ApplyCollisionDisplayStateSymbol]("minimized");
    vi.advanceTimersByTime(200);
    expect(wrapper.style.getPropertyValue("--marker-inner-color")).toBe("black");

    marker[ApplyCollisionDisplayStateSymbol]("visible");
    vi.advanceTimersByTime(200);

    expect(wrapper.style.getPropertyValue("--marker-inner-color")).not.toBe("black");
    expect(wrapper.style.getPropertyValue("--marker-inner-color")).toBe(marker.getInnerColor());
  });
});

//#endregion
