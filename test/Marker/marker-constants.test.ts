import { describe, expect, it } from "vitest";
import { SHADOW_FILTER, SHADOW_PARAMS } from "../../src/Marker/marker-constants";

describe("SHADOW_FILTER", () => {
  it("is the CSS drop-shadow of each SHADOW_PARAMS preset", () => {
    expect(SHADOW_FILTER).toEqual({
      none: "none",
      soft: "drop-shadow(0px 1px 0px rgba(0, 0, 0, 0.2))",
      medium: "drop-shadow(0px 2px 2px rgba(29, 29, 29, 0.2))",
      strong: "drop-shadow(0px 2px 4px rgba(29, 29, 29, 0.2))",
    });
  });

  it("has an entry for every preset", () => {
    expect(Object.keys(SHADOW_FILTER).sort()).toEqual(Object.keys(SHADOW_PARAMS).sort());
  });
});
