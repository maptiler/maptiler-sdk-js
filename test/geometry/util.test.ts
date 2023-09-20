import { describe, it, expect, test } from "vitest";
import {
  earthRadius,
  xyzToTileID,
  mToFt,
  degToRad,
  getZoomLevelResolution,
} from "../../src/geometry";

test("earthRadius", () => {
  expect(earthRadius).toEqual(6371008.8);
});

describe("xyzToTileID", () => {
  it("managing tile x-y-z to ID", () => {
    expect(xyzToTileID(0, 0, 0)).toEqual(0);
    expect(xyzToTileID(0, 0, 1)).toEqual(1);
    expect(xyzToTileID(1, 0, 1)).toEqual(33);
    expect(xyzToTileID(1, 1, 1)).toEqual(97);
    expect(xyzToTileID(1048575, 1048575, 20)).toEqual(35184372088820);
  });

  it("xyzToTileID for all zooms 1-7", () => {
    const idCache = new Set<number>();
    for (let z = 1; z <= 7; z++) {
      for (let x = 0; x < 2 ** z; x++) {
        for (let y = 0; y < 2 ** z; y++) {
          const id = xyzToTileID(x, y, z);
          if (idCache.has(id)) throw new Error(`duplicate id ${id}`);
          idCache.add(id);
        }
      }
    }
  });
});

// test mToFt
describe("mToFt", () => {
  it("converts km to miles", () => {
    expect(mToFt(1)).toEqual(3.28084);
    expect(mToFt(10)).toEqual(32.8084);
    expect(mToFt(100)).toEqual(328.084);
    expect(mToFt(1000)).toEqual(3280.84);
  });
});

// test degToRad
describe("degToRad", () => {
  it("converts degrees to radians", () => {
    expect(degToRad(0)).toEqual(0);
    expect(degToRad(180)).toEqual(Math.PI);
    expect(degToRad(360)).toEqual(0);
    expect(degToRad(90)).toEqual(Math.PI / 2);
    expect(degToRad(270)).toEqual((3 * Math.PI) / 2);
  });
});

// test getZoomLevelResolution
describe("getZoomLevelResolution", () => {
  it("calculates resolution of a zoom level", () => {
    expect(getZoomLevelResolution(0, 0)).toBeCloseTo(78271.51696402048);
    expect(getZoomLevelResolution(0, 1)).toBeCloseTo(39135.75848201024);
    expect(getZoomLevelResolution(0, 2)).toBeCloseTo(19567.87924100512);
    expect(getZoomLevelResolution(0, 3)).toBeCloseTo(9783.93962050256);
    expect(getZoomLevelResolution(0, 4)).toBeCloseTo(4891.96981025128);
    expect(getZoomLevelResolution(0, 5)).toBeCloseTo(2445.98490512564);
    expect(getZoomLevelResolution(0, 6)).toBeCloseTo(1222.99245256282);
    expect(getZoomLevelResolution(0, 7)).toBeCloseTo(611.49622628141);
    expect(getZoomLevelResolution(0, 8)).toBeCloseTo(305.7481131407048);
    expect(getZoomLevelResolution(0, 9)).toBeCloseTo(152.8740565703525);
    expect(getZoomLevelResolution(0, 10)).toBeCloseTo(76.43702828517625);
    expect(getZoomLevelResolution(0, 11)).toBeCloseTo(38.21851414258813);
    expect(getZoomLevelResolution(0, 12)).toBeCloseTo(19.109257071294063);
    expect(getZoomLevelResolution(0, 13)).toBeCloseTo(9.554628535647032);
    expect(getZoomLevelResolution(0, 14)).toBeCloseTo(4.777314267823516);
    expect(getZoomLevelResolution(0, 15)).toBeCloseTo(2.388657133911758);
    expect(getZoomLevelResolution(0, 16)).toBeCloseTo(1.194328566955879);
    expect(getZoomLevelResolution(0, 17)).toBeCloseTo(0.5971642834779395);
    expect(getZoomLevelResolution(0, 18)).toBeCloseTo(0.29858214173896974);
    expect(getZoomLevelResolution(0, 19)).toBeCloseTo(0.14929107086948487);
  });

  it("calcuates resolution of the zoom level 15 at various latitudes", () => {
    expect(getZoomLevelResolution(0, 15)).toBeCloseTo(2.388657133911758);
    expect(getZoomLevelResolution(45, 15)).toBeCloseTo(1.6890356573186271);
    expect(getZoomLevelResolution(60, 15)).toBeCloseTo(1.194328566955879);
    expect(getZoomLevelResolution(75, 15)).toBeCloseTo(0.6182299584763652);
    expect(getZoomLevelResolution(85, 15)).toBeCloseTo(0.20818518667557157);
  });
});
