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
  geocoding: {
    forward: vi.fn(),
    reverse: vi.fn(),
    byId: vi.fn(),
    batch: vi.fn(),
  },
}));

import { geocoding } from "../src/geocoding";
import * as client from "@maptiler/client";
import { config } from "../src/config";

const forwardMock = client.geocoding.forward as Mock;
const reverseMock = client.geocoding.reverse as Mock;
const byIdMock = client.geocoding.byId as Mock;
const batchMock = client.geocoding.batch as Mock;

describe("geocoding wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates to the correct client implementation", () => {
    geocoding.forward("brno");
    geocoding.reverse([10, 20]);
    geocoding.byId("123");
    geocoding.batch(["a", "b"]);

    expect(forwardMock).toHaveBeenCalledExactlyOnceWith("brno", expect.any(Object));
    expect(reverseMock).toHaveBeenCalledExactlyOnceWith([10, 20], expect.any(Object));
    expect(byIdMock).toHaveBeenCalledExactlyOnceWith("123", expect.any(Object));
    expect(batchMock).toHaveBeenCalledExactlyOnceWith(["a", "b"], expect.any(Object));
  });

  it("keeps original adjustSearchParams", () => {
    const original = vi.fn((sp: URLSearchParams) => {
      sp.append("foo", "bar");
    });
    const options = { adjustSearchParams: original };

    geocoding.forward("brno", options);

    const passedOptions = forwardMock.mock.calls[0][1];
    const sp = new URLSearchParams();

    passedOptions.adjustSearchParams(sp);

    expect(original).toHaveBeenCalled();
    expect(sp.get("foo")).toBe("bar");
    expect(sp.get("mtsid")).toBe("TEST_SESSION_ID");
  });

  it("removes session option before delegating to client implementation", () => {
    const options = { session: true };

    geocoding.forward("brno", options);

    const passedOptions = forwardMock.mock.calls[0][1];
    expect(passedOptions.session).toBeUndefined();
  });

  describe("config.session = true (default)", () => {
    it("adds session param on default options", () => {
      geocoding.forward("brno");

      const passedOptions = forwardMock.mock.calls[0][1];
      const sp = new URLSearchParams();

      passedOptions.adjustSearchParams(sp);

      expect(sp.get("mtsid")).toBe("TEST_SESSION_ID");
    });

    it("skips adding session param if session option is false", () => {
      const options = {
        session: false,
      };

      geocoding.forward("brno", options);

      const passedOptions = forwardMock.mock.calls[0][1];

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
      geocoding.forward("brno");

      const passedOptions = forwardMock.mock.calls[0][1];

      expect(passedOptions.adjustSearchParams).toBeUndefined();
    });

    it("adds session param if session option is true", () => {
      geocoding.forward("brno", { session: true });

      const passedOptions = forwardMock.mock.calls[0][1];
      const sp = new URLSearchParams();

      passedOptions.adjustSearchParams(sp);

      expect(sp.get("mtsid")).toBe("TEST_SESSION_ID");
    });
  });
});
