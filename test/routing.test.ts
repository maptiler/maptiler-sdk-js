/* eslint-disable
  @typescript-eslint/no-floating-promises,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
*/

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";

vi.mock("../src/config", () => ({
  config: { session: true },
  MAPTILER_SESSION_ID: "TEST_SESSION_ID",
}));

vi.mock("@maptiler/client", () => ({
  routing: {
    directionsPost: vi.fn(),
    directionsGet: vi.fn(),
  },
}));

import { routing } from "../src/routing";
import * as client from "@maptiler/client";
import { config } from "../src/config";

const directionsPostMock = client.routing.directionsPost as Mock;
const directionsGetMock = client.routing.directionsGet as Mock;

const request = {
  locations: [
    { lat: 49.2, lon: 16.6 },
    { lat: 50.08, lon: 14.44 },
  ],
  profile: "car",
} as client.RoutingRequest;

describe("routing wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to the correct client implementation", () => {
    routing.directionsPost(request);
    routing.directionsGet(request);

    expect(directionsPostMock).toHaveBeenCalledExactlyOnceWith(request, expect.any(Object));
    expect(directionsGetMock).toHaveBeenCalledExactlyOnceWith(request, expect.any(Object));
  });

  it("keeps original adjustSearchParams", () => {
    const original = vi.fn((sp: URLSearchParams) => {
      sp.append("foo", "bar");
    });
    const options = { adjustSearchParams: original };

    routing.directionsPost(request, options);

    const passedOptions = directionsPostMock.mock.calls[0][1];
    const sp = new URLSearchParams();

    passedOptions.adjustSearchParams(sp);

    expect(original).toHaveBeenCalled();
    expect(sp.get("foo")).toBe("bar");
    expect(sp.get("mtsid")).toBe("TEST_SESSION_ID");
  });

  it("removes session option before delegating to client implementation", () => {
    const options = { session: true };

    routing.directionsPost(request, options);

    const passedOptions = directionsPostMock.mock.calls[0][1];
    expect(passedOptions.session).toBeUndefined();
  });

  describe("config.session = true (default)", () => {
    it("adds session param on default options", () => {
      routing.directionsPost(request);

      const passedOptions = directionsPostMock.mock.calls[0][1];
      const sp = new URLSearchParams();

      passedOptions.adjustSearchParams(sp);

      expect(sp.get("mtsid")).toBe("TEST_SESSION_ID");
    });

    it("skips adding session param if session option is false", () => {
      const options = {
        session: false,
      };

      routing.directionsPost(request, options);

      const passedOptions = directionsPostMock.mock.calls[0][1];

      expect(passedOptions.adjustSearchParams).toBeUndefined();
    });
  });

  describe("config.session = false", () => {
    beforeEach(() => {
      config.session = false;
    });

    afterEach(() => {
      config.session = true;
    });

    it("skips adding session param on default options", () => {
      routing.directionsPost(request);

      const passedOptions = directionsPostMock.mock.calls[0][1];

      expect(passedOptions.adjustSearchParams).toBeUndefined();
    });

    it("adds session param if session option is true", () => {
      routing.directionsPost(request, { session: true });

      const passedOptions = directionsPostMock.mock.calls[0][1];
      const sp = new URLSearchParams();

      passedOptions.adjustSearchParams(sp);

      expect(sp.get("mtsid")).toBe("TEST_SESSION_ID");
    });
  });
});
