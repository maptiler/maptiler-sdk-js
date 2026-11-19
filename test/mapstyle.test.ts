import { describe, it, expect } from "vitest";
import type { StyleSpecification } from "maplibre-gl";
import { defaultMapStyle } from "@maptiler/client";

import { styleToStyle, styleToStyleId } from "../src/mapstyle";

const DEFAULT_STYLE_URL = "https://api.maptiler.com/maps/streets-v4/style.json";

describe("default map style", () => {
  it("is the client's default, Streets v4", () => {
    expect(defaultMapStyle.getDefaultVariant().getId()).toBe("streets-v4");
  });

  it("is used when no style is provided", () => {
    for (const style of [undefined, null]) {
      expect(styleToStyle(style)).toEqual({ style: DEFAULT_STYLE_URL, requiresUrlMonitoring: false, isFallback: true });
      expect(styleToStyleId(style)).toBe("streets-v4");
    }
  });

  it("is used when the style is a JSON string that is not a valid style", () => {
    expect(styleToStyle('{"foo": 1}')).toEqual({ style: DEFAULT_STYLE_URL, requiresUrlMonitoring: false, isFallback: true });
  });

  it("is used when the style is an object that is not a valid style", () => {
    expect(styleToStyle({ foo: 1 } as unknown as StyleSpecification)).toEqual({ style: DEFAULT_STYLE_URL, requiresUrlMonitoring: false, isFallback: true });
  });
});
