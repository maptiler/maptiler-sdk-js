import { describe, expect, it } from "vitest";
import { UI_STATE_PRIORITY, flattenUIStates } from "../../src/Marker/marker-state-helpers";
import type { MapTilerMarkerUIStates } from "../../src/Marker/types";

describe("UI_STATE_PRIORITY", () => {
  it("orders hover < focus < active < dragging", () => {
    expect(UI_STATE_PRIORITY).toEqual(["hover", "focus", "active", "dragging"]);
  });
});

describe("flattenUIStates", () => {
  it("returns an empty object when no states are active", () => {
    const states: MapTilerMarkerUIStates = { hover: { opacity: 0.5 } };
    expect(flattenUIStates(states, new Set())).toEqual({});
  });

  it("returns the spec of a single active state", () => {
    const states: MapTilerMarkerUIStates = { hover: { opacity: 0.5 } };
    expect(flattenUIStates(states, new Set(["hover"]))).toEqual({ opacity: 0.5 });
  });

  it("ignores an active state with no configured spec", () => {
    const states: MapTilerMarkerUIStates = {};
    expect(flattenUIStates(states, new Set(["hover"]))).toEqual({});
  });

  it("merges multiple active states, later-priority states overriding earlier ones", () => {
    const states: MapTilerMarkerUIStates = {
      hover: { opacity: 0.5, shape: "circle" },
      active: { opacity: 0.8 },
    };
    // active outranks hover, so its opacity wins, but hover's shape (untouched by active) survives
    expect(flattenUIStates(states, new Set(["hover", "active"]))).toEqual({ opacity: 0.8, shape: "circle" });
  });

  it("priority order is independent of Set insertion order", () => {
    const states: MapTilerMarkerUIStates = {
      dragging: { opacity: 0.2 },
      hover: { opacity: 0.9 },
    };
    // inserted "dragging" first, but priority order still makes it win
    expect(flattenUIStates(states, new Set(["dragging", "hover"]))).toEqual({ opacity: 0.2 });
  });

  it("highest-priority active state (dragging) wins over all others", () => {
    const states: MapTilerMarkerUIStates = {
      hover: { opacity: 0.1 },
      focus: { opacity: 0.2 },
      active: { opacity: 0.3 },
      dragging: { opacity: 0.4 },
    };
    expect(flattenUIStates(states, new Set(["hover", "focus", "active", "dragging"]))).toEqual({ opacity: 0.4 });
  });
});
