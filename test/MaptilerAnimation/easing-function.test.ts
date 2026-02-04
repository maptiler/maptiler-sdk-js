import { describe, expect, test } from "vitest";
import EasingFunctions from "../../src/MaptilerAnimation/easing";

import easingsDictionary from "../fixtures/animations/easings.json";

describe("Easing Function:", () => {
  test("Each easing function returns the expected values", () => {
    Object.entries(EasingFunctions).forEach(([key, fn]) => {
      const expected = easingsDictionary[key as keyof typeof easingsDictionary];
      Array.from({ length: 21 }, (_, i) => fn(i / 20)).forEach(
        (value, index) => {
          expect(value).toBeCloseTo(expected[index], 8);
        },
      );
    });
  });
});
