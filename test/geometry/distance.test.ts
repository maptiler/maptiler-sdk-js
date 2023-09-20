import { describe, it, expect } from "vitest";
import { pointDistance, lineDistance } from "../../src/geometry";

// test distance
describe("pointDistance", () => {
  it("calculates pointDistance between two points", () => {
    expect(pointDistance([0, 0], [0, 0])).toEqual(0);
    expect(pointDistance([0, 0], [0, 1])).toBeCloseTo(111195.0802335329);
    expect(pointDistance([0, 0], [1, 0])).toBeCloseTo(111195.0802335329);
    expect(pointDistance([0, 0], [1, 1])).toBeCloseTo(157249.5984740402);
    expect(pointDistance([0, 0], [0, 85])).toBeCloseTo(9451581.81985029);
    expect(pointDistance([0, 0], [85, 0])).toBeCloseTo(9451581.81985029);
    expect(pointDistance([0, 0], [80, 80])).toBeCloseTo(9815418.67483913);
  });
});

describe("lineDistance", () => {
  it("calculates lineDistance between two points", () => {
    expect(
      lineDistance([
        [0, 0],
        [0, 0],
      ]),
    ).toEqual(0);
    expect(
      lineDistance([
        [0, 0],
        [0, 1],
      ]),
    ).toBeCloseTo(111195.0802335329);
    expect(
      lineDistance([
        [0, 0],
        [1, 0],
      ]),
    ).toBeCloseTo(111195.0802335329);
    expect(
      lineDistance([
        [0, 0],
        [1, 1],
      ]),
    ).toBeCloseTo(157249.5984740402);
    expect(
      lineDistance([
        [0, 0],
        [0, 85],
      ]),
    ).toBeCloseTo(9451581.81985029);
    expect(
      lineDistance([
        [0, 0],
        [85, 0],
      ]),
    ).toBeCloseTo(9451581.81985029);
    expect(
      lineDistance([
        [0, 0],
        [80, 80],
      ]),
    ).toBeCloseTo(9815418.67483913);
  });

  it("calculates lineDistance between ten points", () => {
    expect(
      lineDistance([
        [0, 0],
        [10, 10],
        [20, 20],
        [30, 30],
        [40, 40],
        [50, 50],
        [60, 60],
        [70, 70],
        [80, 80],
        [90, 90],
      ]),
    ).toBeCloseTo(12145778.91731941);
  });
});
