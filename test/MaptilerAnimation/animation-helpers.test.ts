import {
  findNextEntryAndIndexWithValue,
  findPreviousEntryAndIndexWithValue,
  getAverageDistance,
  KeyframeableGeoJSONFeature,
  lerp,
  lerpArrayValues,
  parseGeoJSONFeatureToKeyframes,
  simplifyPath,
  stretchNumericalArray,
} from "../../src/MaptilerAnimation/animation-helpers";
import { math } from "@maptiler/client";
import { afterEach, describe, expect, test, vi } from "vitest";
import { fixtureOne, invalidGeometryFixture, validFixture, validFixtureExpectedKeyframes } from "../fixtures/animations/keyframes.fixture";
import validSmoothedKeyframes from "../fixtures/animations/smoothed-keyframes.json";
import { distancePoints, distancePointsTwo } from "../fixtures/animations/average-distance.fixture";
import { complexPath, simplifiedAt5Meters, simplifiedPathAt10Meters } from "../fixtures/animations/simplify-path.fixture";

describe("[animation-helpers]: lerp", () => {
  test("interpolates correctly", () => {
    const fixtures = [
      {
        a: 0,
        b: 10,
        alpha: 0,
        expected: 0,
      },
      {
        a: 0,
        b: 10,
        alpha: 0.5,
        expected: 5,
      },
      {
        a: 0,
        b: 10,
        alpha: 1,
        expected: 10,
      },
      {
        a: -10,
        b: 10,
        alpha: 0.5,
        expected: 0,
      },
      {
        a: -10,
        b: -20,
        alpha: 0.5,
        expected: -15,
      },
    ];

    fixtures.forEach(({ a, b, alpha, expected }) => {
      expect(lerp(a, b, alpha)).toBe(expected);
    });
  });
});

describe("[animation-helpers]: lerpArrayValues", () => {
  test("throws when an empty array is passed", () => {
    const testFn = () => {
      lerpArrayValues([]);
    };

    expect(testFn).toThrowError("[lerpArrayValues]: Array empty, nothing to interpolate");
  });

  test("throws when all values in the array are null", () => {
    const testFn = () => {
      lerpArrayValues([null, null, null]);
    };

    expect(testFn).toThrowError("[lerpArrayValues]: Cannot interpolate an array where all values are `null`");
  });

  test("interpolates null values between numerical values correctly", () => {
    const arr1 = [0, null, null, 100, null, 200];
    const expected = [0, 33.333333333, 66.666666666, 100, 150, 200];
    const result = lerpArrayValues(arr1);
    result.forEach((received, index) => {
      expect(received).toBeCloseTo(expected[index], 8);
    });
  });

  test("interpolates null values between numerical values correctly and `fills` null values at either end of the array", () => {
    const arr2 = [null, 0, null, 100, null, null, null];
    expect(lerpArrayValues(arr2)).toEqual([0, 0, 50, 100, 100, 100, 100]);

    const arr3 = [0, 1, null, 3, null, 4, null, null];
    expect(lerpArrayValues(arr3)).toEqual([0, 1, 2, 3, 3.5, 4, 4, 4]);
  });
});

describe("[animation-helpers]: findNextEntryAndIndexWithValue", () => {
  test("returns the next entry and index with a value", () => {
    const [nextIndex1, nextEntry1] = findNextEntryAndIndexWithValue([null, null, null, null, 5, null, 7, null], 1);
    expect(nextIndex1).toBe(4);
    expect(nextEntry1).toBe(5);

    const [nextIndex2, nextEntry2] = findNextEntryAndIndexWithValue([null, null, null, null, 5, null, 7, null], 3);
    expect(nextIndex2).toBe(4);
    expect(nextEntry2).toBe(5);

    const [nextIndex3, nextEntry3] = findNextEntryAndIndexWithValue([null, null, null, null, 5, null, 7, null], 5);
    expect(nextIndex3).toBe(6);
    expect(nextEntry3).toBe(7);
  });

  test("returns [null, null] if not found", () => {
    const [nextIndex1, nextEntry1] = findNextEntryAndIndexWithValue([5, null, null, null], 1);
    expect(nextIndex1).toBe(null);
    expect(nextEntry1).toBe(null);
  });
});

describe("[animation-helpers]: findPreviousEntryAndIndexWithValue", () => {
  test("returns the next entry and index with a value", () => {
    const [nextIndex1, nextEntry1] = findPreviousEntryAndIndexWithValue([null, 3, null, null, 5, null, 7, null], 2);
    expect(nextIndex1).toBe(1);
    expect(nextEntry1).toBe(3);

    const [nextIndex2, nextEntry2] = findPreviousEntryAndIndexWithValue([null, 3, null, null, 5, null, 7, null], 5);
    expect(nextIndex2).toBe(4);
    expect(nextEntry2).toBe(5);

    const [nextIndex3, nextEntry3] = findPreviousEntryAndIndexWithValue([null, 3, null, null, 5, null, 7, null], 8);
    expect(nextIndex3).toBe(6);
    expect(nextEntry3).toBe(7);
  });
});

describe("[animation-helpers]: parseGeoJSONFeatureToKeyframes", () => {
  const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  afterEach(() => {
    consoleSpy.mockClear();
  });

  test("warns when no @easing or @delta props are provided in the geoJSON is provided", () => {
    fixtureOne.geometry = {
      coordinates: [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
        [6, 6],
        [7, 7],
        [8, 8],
        [9, 9],
        [10, 10],
      ],
      type: "LineString",
    };
    parseGeoJSONFeatureToKeyframes(fixtureOne);
    expect(consoleSpy).toHaveBeenCalledWith("[parseGeoJSONFeatureToKeyframes]: No '@easing' property found in GeoJSON properties, using default easing Linear");
    expect(consoleSpy).toHaveBeenCalledWith(
      "[parseGeoJSONFeatureToKeyframes]: No '@delta' property found in GeoJSON properties, delta for each frame will default to its index divided by the total",
    );
    expect(consoleSpy).toHaveBeenCalledTimes(2);
  });

  test("throws when the geometry is invalid", () => {
    const testFn = () => {
      parseGeoJSONFeatureToKeyframes(invalidGeometryFixture);
    };

    expect(testFn).toThrowError("[parseGeoJSONFeatureToKeyframes]: No geometry found in feature");
  });

  test("throws when the an unsupported geometry type is passed", () => {
    const testFn = () => {
      // @ts-expect-error this is an invalid geometry type to invoke an error
      parseGeoJSONFeatureToKeyframes({
        ...invalidGeometryFixture,
        geometry: {
          ...invalidGeometryFixture.geometry,
          type: "UnsupportedGeometryType",
        },
      } as KeyframeableGeoJSONFeature);
    };

    expect(testFn).toThrowError(
      "[parseGeoJSONFeatureToKeyframes]: Geometry type 'UnsupportedGeometryType' is not supported. Accepted types are: MultiPoint, LineString, MultiLineString, Polygon",
    );
  });

  test("parses the fixture to the expected keyframes (no-smoothing)", () => {
    const receviedKeyframes = parseGeoJSONFeatureToKeyframes(validFixture, { pathSmoothing: false });
    expect(receviedKeyframes).toEqual(validFixtureExpectedKeyframes);
  });

  test("parses the fixture to the expected keyframes (with smoothing)", () => {
    const receviedKeyframes = parseGeoJSONFeatureToKeyframes(validFixture, {
      pathSmoothing: {
        resolution: 10,
        epsilon: 0.5,
      },
    });
    expect(receviedKeyframes).toEqual(validSmoothedKeyframes);
  });
});

describe("[animation-helpers]: stretchNumericalArray", () => {
  test("stretches an array of numbers to a given length, inserting null in the new indices, placing the old values in the closest appropriate index", () => {
    const stretched1 = stretchNumericalArray([0, 1, 2], 10);
    expect(stretched1).toEqual([0, null, null, null, null, 1, null, null, null, 2]);

    const stretched2 = stretchNumericalArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 50);
    expect(stretched2).toEqual([
      0,
      null,
      null,
      null,
      null,
      1,
      null,
      null,
      null,
      null,
      2,
      null,
      null,
      null,
      null,
      3,
      null,
      null,
      null,
      null,
      4,
      null,
      null,
      null,
      null,
      5,
      null,
      null,
      null,
      6,
      null,
      null,
      null,
      null,
      7,
      null,
      null,
      null,
      null,
      8,
      null,
      null,
      null,
      null,
      9,
      null,
      null,
      null,
      null,
      10,
    ]);
  });
});

describe("[animation-helpers]: getAverageDistance", () => {
  test("given an array of lnglat points, it calculates the correct average distance (haversine) in meters between these points to within 10m", () => {
    const avg = getAverageDistance(distancePoints);
    expect(avg).toBeCloseTo(40.7978395);

    const avgAtEquator = getAverageDistance(distancePointsTwo);

    expect(avgAtEquator).toBeCloseTo(math.EARTH_CIRCUMFERENCE / distancePointsTwo.length, -1); // expect the answer to be within 10m
  });
});

describe("[animation-helpers]: simplifyPath", () => {
  test(() => {
    const received = simplifyPath(complexPath, 10);
    expect(received).toEqual(simplifiedPathAt10Meters);
    expect(received).not.toEqual(complexPath);

    const received2 = simplifyPath(complexPath, 5);
    expect(received2).toEqual(simplifiedAt5Meters);
    expect(received2).not.toEqual(complexPath);
  });
});
