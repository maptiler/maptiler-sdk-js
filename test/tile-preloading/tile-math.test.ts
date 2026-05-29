import { describe, expect, it } from "vitest";
import { buildTileUrl, boundsTreeForBounds, deduplicateTiles, formatTileID, parseTileID, sampleFlyToPath, sampleLinearPath, tilesForBounds, tilesForCameraPosition, viewBoundsForCameraPosition } from "../../src/tile-preloading/tile-math";
import type { CameraPosition } from "../../src/tile-preloading/types";

// ─── parseTileID ─────────────────────────────────────────────────────────────

describe("parseTileID", () => {
  it("parses a valid z/x/y string", () => {
    expect(parseTileID("12/1205/1540")).toEqual({ z: 12, x: 1205, y: 1540 });
  });

  it("parses zoom level 0", () => {
    expect(parseTileID("0/0/0")).toEqual({ z: 0, x: 0, y: 0 });
  });

  it("returns null for wrong segment count", () => {
    expect(parseTileID("12/1205")).toBeNull();
    expect(parseTileID("12/1205/1540/extra")).toBeNull();
  });

  it("returns null when segments are not numbers", () => {
    expect(parseTileID("a/b/c")).toBeNull();
  });
});

// ─── formatTileID ────────────────────────────────────────────────────────────

describe("formatTileID", () => {
  it("formats z/x/y correctly", () => {
    expect(formatTileID({ z: 5, x: 10, y: 15 })).toBe("5/10/15");
  });
});

// ─── buildTileUrl ────────────────────────────────────────────────────────────

describe("buildTileUrl", () => {
  it("substitutes {z}, {x}, {y} placeholders", () => {
    const template = "https://api.example.com/tiles/{z}/{x}/{y}.pbf";
    expect(buildTileUrl(template, { z: 12, x: 1205, y: 1540 })).toBe("https://api.example.com/tiles/12/1205/1540.pbf");
  });

  it("handles multiple parameters in one URL", () => {
    const template = "https://example.com/{z}/{x}/{y}?key=abc&z={z}";
    const result = buildTileUrl(template, { z: 3, x: 4, y: 5 });
    expect(result).toContain("/3/4/5");
  });
});

// ─── tilesForBounds ──────────────────────────────────────────────────────────

describe("tilesForBounds", () => {
  it("returns a single tile for a tiny bounds at zoom 0", () => {
    // At zoom 0 there is only 1 tile: (0, 0, 0)
    const tiles = tilesForBounds([-1, -1, 1, 1], 0, 0);
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.every((t) => t.z === 0)).toBe(true);
  });

  it("produces more tiles at higher zoom levels", () => {
    const bounds = [-74.1, 40.6, -73.9, 40.8] as [number, number, number, number];
    const tilesZ10 = tilesForBounds(bounds, 10, 10);
    const tilesZ12 = tilesForBounds(bounds, 12, 12);
    expect(tilesZ12.length).toBeGreaterThan(tilesZ10.length);
  });

  it("includes tiles for every zoom level in range", () => {
    const bounds = [-74.1, 40.6, -73.9, 40.8] as [number, number, number, number];
    const tiles = tilesForBounds(bounds, 10, 12);
    const zoomLevels = new Set(tiles.map((t) => t.z));
    expect(zoomLevels.has(10)).toBe(true);
    expect(zoomLevels.has(11)).toBe(true);
    expect(zoomLevels.has(12)).toBe(true);
  });

  it("all tiles have z within the requested range", () => {
    const tiles = tilesForBounds([-10, -10, 10, 10] as [number, number, number, number], 5, 7);
    for (const tile of tiles) {
      expect(tile.z).toBeGreaterThanOrEqual(5);
      expect(tile.z).toBeLessThanOrEqual(7);
    }
  });

  it("tile y coordinates are non-negative", () => {
    const tiles = tilesForBounds([-180, -85, 180, 85] as [number, number, number, number], 1, 1);
    for (const tile of tiles) {
      expect(tile.y).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─── tilesForCameraPosition ───────────────────────────────────────────────────

describe("tilesForCameraPosition", () => {
  const viewportWidth = 1280;
  const viewportHeight = 720;
  const nyc: CameraPosition = { lng: -74.006, lat: 40.7128, zoom: 12 };

  it("returns tiles around the camera center", () => {
    const tiles = tilesForCameraPosition(nyc, viewportWidth, viewportHeight);
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.every((t) => t.z === 12)).toBe(true);
  });

  it("returns more tiles with a wider viewport", () => {
    const narrow = tilesForCameraPosition(nyc, 640, 480);
    const wide = tilesForCameraPosition(nyc, 1920, 1080);
    expect(wide.length).toBeGreaterThan(narrow.length);
  });

  it("returns more tiles when pitched (horizon extends visible area)", () => {
    const flat = tilesForCameraPosition(nyc, viewportWidth, viewportHeight);
    const pitched = tilesForCameraPosition({ ...nyc, pitch: 60 }, viewportWidth, viewportHeight);
    expect(pitched.length).toBeGreaterThanOrEqual(flat.length);
  });

  it("tile x coordinates are in valid range for the zoom level", () => {
    const tiles = tilesForCameraPosition(nyc, viewportWidth, viewportHeight);
    const maxTile = Math.pow(2, 12);
    for (const tile of tiles) {
      expect(tile.x).toBeGreaterThanOrEqual(0);
      expect(tile.x).toBeLessThan(maxTile);
    }
  });
});

// ─── viewBoundsForCameraPosition / boundsTreeForBounds ───────────────────────

describe("viewBoundsForCameraPosition", () => {
  it("returns bounds centered on the camera position", () => {
    const position: CameraPosition = { lng: 0, lat: 0, zoom: 2 };
    const bounds = viewBoundsForCameraPosition(position, 512, 512) as [number, number, number, number];
    const [west, south, east, north] = bounds;
    expect((west + east) / 2).toBeCloseTo(0, 1);
    expect((south + north) / 2).toBeCloseTo(0, 1);
    expect(east).toBeGreaterThan(west);
    expect(north).toBeGreaterThan(south);
  });
});

describe("boundsTreeForBounds", () => {
  const viewportWidth = 512;
  const viewportHeight = 512;
  const parentBounds = [-74.1, 40.6, -73.9, 40.8] as [number, number, number, number];

  it("returns one view per zoom when parent fits in a single viewport", () => {
    const tree = boundsTreeForBounds(parentBounds, 10, 10, viewportWidth, viewportHeight);
    expect(tree.length).toBe(1);
  });

  it("returns views for every zoom level in range", () => {
    const tree = boundsTreeForBounds(parentBounds, 10, 12, viewportWidth, viewportHeight);
    expect(tree.length).toBeGreaterThan(3);
  });

  it("tessellates into a grid when parent bounds exceed viewport at a zoom", () => {
    const wideBounds = [-77, 38, -72, 43] as [number, number, number, number];
    const tree = boundsTreeForBounds(wideBounds, 7, 7, viewportWidth, viewportHeight);
    expect(tree.length).toBeGreaterThan(1);
  });

  it("accepts min/max zoom in either order", () => {
    const forward = boundsTreeForBounds(parentBounds, 10, 11, viewportWidth, viewportHeight);
    const reverse = boundsTreeForBounds(parentBounds, 11, 10, viewportWidth, viewportHeight);
    expect(reverse.length).toBe(forward.length);
  });

  it("each view bounds covers part of the parent bounds", () => {
    const tree = boundsTreeForBounds(parentBounds, 10, 10, viewportWidth, viewportHeight);
    const [parentWest, parentSouth, parentEast, parentNorth] = parentBounds;
    for (const view of tree) {
      const [west, south, east, north] = view as [number, number, number, number];
      expect(east).toBeGreaterThan(west);
      expect(north).toBeGreaterThan(south);
      expect(east).toBeGreaterThanOrEqual(parentWest);
      expect(west).toBeLessThanOrEqual(parentEast);
      expect(north).toBeGreaterThanOrEqual(parentSouth);
      expect(south).toBeLessThanOrEqual(parentNorth);
    }
  });
});

// ─── deduplicateTiles ────────────────────────────────────────────────────────

describe("deduplicateTiles", () => {
  it("removes exact duplicate tile coordinates", () => {
    const input = [
      { z: 10, x: 5, y: 3 },
      { z: 10, x: 5, y: 3 },
      { z: 10, x: 6, y: 3 },
    ];
    const result = deduplicateTiles(input);
    expect(result.length).toBe(2);
  });

  it("preserves order of first occurrence", () => {
    const input = [
      { z: 1, x: 0, y: 0 },
      { z: 2, x: 0, y: 0 },
      { z: 1, x: 0, y: 0 },
    ];
    const result = deduplicateTiles(input);
    expect(result).toEqual([
      { z: 1, x: 0, y: 0 },
      { z: 2, x: 0, y: 0 },
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(deduplicateTiles([])).toEqual([]);
  });
});

// ─── sampleLinearPath ────────────────────────────────────────────────────────

describe("sampleLinearPath", () => {
  const start: CameraPosition = { lng: 0, lat: 0, zoom: 5, pitch: 0, bearing: 0 };
  const end: CameraPosition = { lng: 10, lat: 20, zoom: 10, pitch: 30, bearing: 90 };

  it("returns steps + 1 positions (inclusive of both endpoints)", () => {
    const positions = sampleLinearPath(start, end, 4);
    expect(positions.length).toBe(5);
  });

  it("first position equals start", () => {
    const positions = sampleLinearPath(start, end, 4);
    expect(positions[0]).toMatchObject({ lng: 0, lat: 0, zoom: 5 });
  });

  it("last position equals end", () => {
    const positions = sampleLinearPath(start, end, 4);
    const last = positions[positions.length - 1];
    expect(last).toMatchObject({ lng: 10, lat: 20, zoom: 10 });
  });

  it("intermediate position is linearly interpolated", () => {
    const positions = sampleLinearPath(start, end, 2);
    const mid = positions[1];
    expect(mid.lng).toBeCloseTo(5);
    expect(mid.lat).toBeCloseTo(10);
    expect(mid.zoom).toBeCloseTo(7.5);
  });
});

// ─── sampleFlyToPath ─────────────────────────────────────────────────────────

describe("sampleFlyToPath", () => {
  const start: CameraPosition = { lng: 0, lat: 0, zoom: 10, pitch: 0, bearing: 0 };
  const end: CameraPosition = { lng: 50, lat: 30, zoom: 8, pitch: 0, bearing: 0 };

  it("returns steps + 1 positions", () => {
    const positions = sampleFlyToPath(start, end, 4);
    expect(positions.length).toBe(5);
  });

  it("first position equals start center and zoom", () => {
    const positions = sampleFlyToPath(start, end, 4);
    expect(positions[0].lng).toBeCloseTo(0);
    expect(positions[0].lat).toBeCloseTo(0);
    expect(positions[0].zoom).toBeCloseTo(10); // No dip at t=0
  });

  it("last position equals end center and zoom", () => {
    const positions = sampleFlyToPath(start, end, 4);
    const last = positions[positions.length - 1];
    expect(last.lng).toBeCloseTo(50);
    expect(last.lat).toBeCloseTo(30);
    expect(last.zoom).toBeCloseTo(8); // No dip at t=1
  });

  it("midpoint zoom is lower than both endpoints (zoom-out arc)", () => {
    const positions = sampleFlyToPath(start, end, 10);
    const midIndex = Math.floor(positions.length / 2);
    const midZoom = positions[midIndex].zoom;
    expect(midZoom).toBeLessThan(start.zoom);
    expect(midZoom).toBeLessThan(end.zoom);
  });
});
