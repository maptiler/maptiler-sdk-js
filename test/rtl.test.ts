/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-argument,
  @typescript-eslint/no-extraneous-class,
  @typescript-eslint/no-empty-function,
  @typescript-eslint/unbound-method,
*/

import { vi, describe, it, expect, beforeEach } from "vitest";
import { Map as SDKMap } from "../src/index";
import { enableRTL } from "../src/tools";

vi.mock("../src/tools", async () => {
  const actual: any = await vi.importActual("../src/tools");
  return {
    ...actual,
    enableRTL: vi.fn(),
    displayNoWebGlWarning: vi.fn(),
  };
});

vi.mock("maplibre-gl", async () => {
  const actual: any = await vi.importActual("maplibre-gl");
  return {
    default: {
      ...actual.default,
      Map: class extends actual.default.Evented {
        constructor(options: any) {
          super();
          this._container = options.container;
        }
        setStyle = vi.fn();
      },
    },
  };
});

describe("RTL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should be enabled by default", () => {
    const map = new SDKMap({
      container: "map",
    });

    map.fire("style.load");

    expect(enableRTL).toHaveBeenCalledWith(undefined);
  });

  it("should be disabled if rtlTextPlugin is false", () => {
    const map = new SDKMap({
      container: "map",
      rtlTextPlugin: false,
    });
    map.fire("style.load");
    expect(enableRTL).not.toHaveBeenCalled();
  });

  it("should be enabled if rtlTextPlugin is a string", () => {
    const map = new SDKMap({
      container: "map",
      rtlTextPlugin: "https://example.com/rtl-text-plugin.js",
    });

    map.fire("style.load");

    expect(enableRTL).toHaveBeenCalledWith("https://example.com/rtl-text-plugin.js");
  });
});
