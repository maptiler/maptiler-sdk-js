import { describe, expect, it } from "vitest";
import { getMarkerTemplate, registerMarkerTemplate } from "../../src/Marker/marker-content-registry";

describe("marker-content-registry", () => {
  it("returns undefined for an unregistered template", () => {
    expect(getMarkerTemplate("unregistered-template-xyz")).toBeUndefined();
  });

  it("registers and retrieves a template factory", () => {
    const factory = () => "hello";
    registerMarkerTemplate("test-template-1", factory);
    expect(getMarkerTemplate("test-template-1")).toBe(factory);
  });

  it("overrides an existing registration with the same name", () => {
    const first = () => "first";
    const second = () => "second";
    registerMarkerTemplate("test-template-2", first);
    registerMarkerTemplate("test-template-2", second);
    expect(getMarkerTemplate("test-template-2")).toBe(second);
  });

  it("factory can return a string, HTMLElement, or SVGElement", () => {
    registerMarkerTemplate("test-template-string", () => "text");
    registerMarkerTemplate("test-template-html", () => document.createElement("div"));
    registerMarkerTemplate("test-template-svg", () => document.createElementNS("http://www.w3.org/2000/svg", "g"));

    expect(getMarkerTemplate("test-template-string")?.()).toBe("text");
    expect(getMarkerTemplate("test-template-html")?.()).toBeInstanceOf(HTMLElement);
    expect(getMarkerTemplate("test-template-svg")?.() instanceof SVGElement).toBe(true);
  });

  it("passes params through to the factory", () => {
    registerMarkerTemplate("test-template-params", (params) => `count:${String(params?.count ?? "none")}`);
    expect(getMarkerTemplate("test-template-params")?.({ count: 5 })).toBe("count:5");
  });
});
