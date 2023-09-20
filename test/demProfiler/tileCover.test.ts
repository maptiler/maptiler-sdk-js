import fs from "fs";
import { promisify } from "util";
import { expect, test } from "vitest";
import tileCover from "../../src/demProfiler/tileCover";

const readFileAsync = promisify(fs.readFile);

test('Find "tileCover" for a simple line at zooms 13, 14, 15 and 16', async () => {
  // path up the mountain in SLC
  const coordinates: GeoJSON.Position[] = [
    [-111.88811277644503, 40.79618409829391],
    [-111.88645596614953, 40.797821596351326],
    [-111.88857300152719, 40.79938937578956],
    [-111.88811277644503, 40.80168871865277],
    [-111.88502926839493, 40.80350026602076],
    [-111.88553551598517, 40.80482405782945],
  ];

  expect(tileCover(coordinates, 13, 512)).toEqual(
    JSON.parse(
      await readFileAsync("test/fixtures/tileCoverSimple13.json", "utf-8"),
    ),
  );
  expect(tileCover(coordinates, 14, 512)).toEqual(
    JSON.parse(
      await readFileAsync("test/fixtures/tileCoverSimple14.json", "utf-8"),
    ),
  );
  expect(tileCover(coordinates, 15, 512)).toEqual(
    JSON.parse(
      await readFileAsync("test/fixtures/tileCoverSimple15.json", "utf-8"),
    ),
  );
  expect(tileCover(coordinates, 16, 512)).toEqual(
    JSON.parse(
      await readFileAsync("test/fixtures/tileCoverSimple16.json", "utf-8"),
    ),
  );
});

test('Find "tileCover" for long lines that need to be reduced line at zooms 13, 14, 15 and 16', async () => {
  // path up the mountain in SLC
  const coordinates: GeoJSON.Position[] = [
    [-111.88858788961196, 40.79298969416331],
    [-111.8906434126717, 40.813447493739915],
    [-111.85333947566436, 40.818575361886644],
    [-111.85419686695758, 40.821268092050104],
    [-111.85061873422427, 40.82363013913786],
    [-111.84848708068107, 40.821152868089484],
    [-111.80737661948963, 40.83780065510172],
  ];

  expect(tileCover(coordinates, 13, 512)).toEqual(
    JSON.parse(
      await readFileAsync("test/fixtures/tileCoverLong13.json", "utf-8"),
    ),
  );
  expect(tileCover(coordinates, 14, 512)).toEqual(
    JSON.parse(
      await readFileAsync("test/fixtures/tileCoverLong14.json", "utf-8"),
    ),
  );
  expect(tileCover(coordinates, 15, 512)).toEqual(
    JSON.parse(
      await readFileAsync("test/fixtures/tileCoverLong15.json", "utf-8"),
    ),
  );
  expect(tileCover(coordinates, 16, 512)).toEqual(
    JSON.parse(
      await readFileAsync("test/fixtures/tileCoverLong16.json", "utf-8"),
    ),
  );
});
