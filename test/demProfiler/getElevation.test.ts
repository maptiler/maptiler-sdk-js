import { describe, it, expect } from "vitest";
import getElevation from "../../src/demProfiler/getElevation";
import sharp from "sharp";

const pngTile = await sharp("test/fixtures/12-775-1538.png").raw().toBuffer();
const webpTile = await sharp("test/fixtures/13-1548-3076.webp")
  .raw()
  .toBuffer();

describe("getElevation", () => {
  it("png: returns the elevation of a point", async () => {
    const coord: [lon: number, lat: number] = [
      -111.8408203125, 40.81380923056976,
    ];
    const tile: [zoom: number, x: number, y: number] = [12, 775, 1538];
    const tileSize = 512;
    // convert to a Uint8Array
    const tileImage = {
      channels: 3 as const,
      image: new Uint8ClampedArray(pngTile),
    };
    const elevation = getElevation(coord, tile, tileSize, tileImage);
    expect(elevation).toBeCloseTo(1657.4);
  });

  // repeat the last test but with a custom elevation parser
  it("png: returns the elevation of a point with a custom elevation parser", async () => {
    const coord: [lon: number, lat: number] = [
      -111.8408203125, 40.81380923056976,
    ];
    const tile: [zoom: number, x: number, y: number] = [12, 775, 1538];
    const tileSize = 512;
    // convert to a Uint8Array
    const tileImage = {
      channels: 3 as const,
      image: new Uint8ClampedArray(pngTile),
    };
    const elevation = getElevation(
      coord,
      tile,
      tileSize,
      tileImage,
      (r, g, b, a) => {
        return r + g + b + a;
      },
    );
    expect(elevation).toEqual(294);
  });

  it("webp: returns the elevation of a point", async () => {
    const coord: [lon: number, lat: number] = [
      -111.95068359375, 40.8304347933204,
    ];
    const tile: [zoom: number, x: number, y: number] = [13, 1548, 3076];
    const tileSize = 512;
    // convert to a Uint8Array
    const tileImage = {
      channels: 3 as const,
      image: new Uint8ClampedArray(webpTile),
    };
    const elevation = getElevation(coord, tile, tileSize, tileImage);
    expect(elevation).toBeCloseTo(1287.7);
  });
});
