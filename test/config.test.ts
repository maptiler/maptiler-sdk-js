import { describe, it, expect, afterEach } from "vitest";

import { config } from "../src/config";
import { maptilerCloudTransformRequest } from "../src/tools";

describe("config.useEuEndpoints", () => {
  afterEach(() => {
    config.useEuEndpoints = false;
  });

  it("defaults to the .com host", () => {
    expect(config.useEuEndpoints).toBe(false);
    expect(config.apiHost).toBe("api.maptiler.com");
    expect(config.apiURL).toBe("https://api.maptiler.com/");
  });

  it("switches to the .eu host and back", () => {
    config.useEuEndpoints = true;
    expect(config.useEuEndpoints).toBe(true);
    expect(config.apiHost).toBe("api.maptiler.eu");
    expect(config.apiURL).toBe("https://api.maptiler.eu/");

    config.useEuEndpoints = false;
    expect(config.useEuEndpoints).toBe(false);
    expect(config.apiHost).toBe("api.maptiler.com");
  });

  it("is honored by maptilerCloudTransformRequest when injecting the API key", () => {
    config.apiKey = "TEST_KEY";
    config.useEuEndpoints = true;

    const req = maptilerCloudTransformRequest("https://api.maptiler.eu/tiles/v3/tiles.json");
    const url = new URL(req.url);
    expect(url.searchParams.get("key")).toBe("TEST_KEY");
  });
});
