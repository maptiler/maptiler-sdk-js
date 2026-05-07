/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";

import type { Map as SDKMap } from "../../src/Map";
import { addPolyline } from "../../src/helpers/vectorlayerhelpers";

describe("addPolyline()", () => {
  const mapMock: SDKMap = {
    getSource: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  it("throws when neither sourceId nor data is provided", async () => {
    await expect(addPolyline(mapMock, {} as any)).rejects.toThrow(/requires an existing/);
  });

  it("treats UUID string as dataset URL", async () => {
    await addPolyline(mapMock, { data: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6" });

    expect(mapMock.addSource).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.stringMatching(/api\.maptiler\.com\/data\/f81d4fae-7dec-11d0-a765-00a0c91e6bf6\/features\.json/),
      }),
    );
  });

  it("fetches URL if provided", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`<gpx></gpx>`),
    });

    await addPolyline(mapMock, { data: "https://example.com/file.gpx" });

    expect(global.fetch).toHaveBeenCalledOnce();
  });

  it("throws when fetching URL fails", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(addPolyline(mapMock, { data: "https://example.com/file.gpx" })).rejects.toThrow(/Failed to fetch polyline data/);
  });

  it("parses fetched data as GeoJSON", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`{"type":"FeatureCollection","features":[]}`),
    });

    await addPolyline(mapMock, { data: "https://example.com/file.geojson" });

    expect(global.fetch).toHaveBeenCalledOnce();
    expect(mapMock.addSource).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.objectContaining({
        data: {
          type: "FeatureCollection",
          features: expect.any(Array),
        },
      }),
    );
  });

  it("parses fetched data as GPX", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`<gpx></gpx>`),
    });

    await addPolyline(mapMock, { data: "https://example.com/file.gpx" });

    expect(global.fetch).toHaveBeenCalledOnce();
    expect(mapMock.addSource).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.objectContaining({
        data: {
          type: "FeatureCollection",
          features: expect.any(Array),
        },
      }),
    );
  });

  it("parses fetched data as KML", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`<kml></kml>`),
    });

    await addPolyline(mapMock, { data: "https://example.com/file.kml" });

    expect(global.fetch).toHaveBeenCalledOnce();
    expect(mapMock.addSource).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.objectContaining({
        data: {
          type: "FeatureCollection",
          features: expect.any(Array),
        },
      }),
    );
  });

  it("throws when fetched data cannot be parsed", async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`<foo></foo>`),
    });

    await expect(addPolyline(mapMock, { data: "https://example.com/file.foo" })).rejects.toThrow(/Failed to parse polyline data/);
  });

  it("parses provided string data as GeoJSON", async () => {
    await addPolyline(mapMock, { data: `{"type":"FeatureCollection","features":[]}` });

    expect(mapMock.addSource).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.objectContaining({
        data: {
          type: "FeatureCollection",
          features: expect.any(Array),
        },
      }),
    );
  });

  it("parses provided string data as GPX", async () => {
    await addPolyline(mapMock, { data: `<gpx></gpx>` });

    expect(mapMock.addSource).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.objectContaining({
        data: {
          type: "FeatureCollection",
          features: expect.any(Array),
        },
      }),
    );
  });

  it("parses provided string data as KML", async () => {
    await addPolyline(mapMock, { data: `<kml></kml>` });

    expect(mapMock.addSource).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      expect.objectContaining({
        data: {
          type: "FeatureCollection",
          features: expect.any(Array),
        },
      }),
    );
  });

  it("throws when string data cannot be parsed", async () => {
    await expect(addPolyline(mapMock, { data: "not valid" })).rejects.toThrow(/Failed to parse polyline data/);
  });

  it("passes through non-string data unchanged", async () => {
    const data = { type: "FeatureCollection" as const, features: [] };

    await addPolyline(mapMock, { data });

    expect(mapMock.addSource).toHaveBeenCalledExactlyOnceWith(expect.anything(), expect.objectContaining({ data }));
  });
});
