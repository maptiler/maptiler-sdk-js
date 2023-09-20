import fs from "fs";
import { promisify } from "util";
import { describe, it, expect } from "vitest";
import { profileLineString } from "../../src/demProfiler";
import sharp from "sharp";

const readFileAsync = promisify(fs.readFile);

describe("profile", () => {
  it("simple line at zoom 13", async () => {
    const coordinates: GeoJSON.Position[] = [
      [-111.88811277644503, 40.79618409829391],
      [-111.88645596614953, 40.797821596351326],
      [-111.88857300152719, 40.79938937578956],
      [-111.88811277644503, 40.80168871865277],
      [-111.88502926839493, 40.80350026602076],
      [-111.88553551598517, 40.80482405782945],
    ];

    const path = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates,
      },
    };

    const options = {
      metric: "m" as "m" | "ft",
      zoom: 13,
      tileSize: 512,
      tileRequest: async (x: number, y: number, z: number) => {
        const buf = await sharp(`test/fixtures/${z}-${x}-${y}.webp`)
          .raw()
          .toBuffer({ resolveWithObject: true });
        return {
          channels: buf.info.channels,
          image: new Uint8ClampedArray(buf.data),
        };
      },
    };

    expect(await profileLineString(path, options)).toEqual(
      JSON.parse(
        await readFileAsync("test/fixtures/profileSimple13m.json", "utf-8"),
      ),
    );

    options.metric = "ft" as const;

    expect(await profileLineString(path, options)).toEqual(
      JSON.parse(
        await readFileAsync("test/fixtures/profileSimple13ft.json", "utf-8"),
      ),
    );
  });

  it("simple line at zoom 14", async () => {
    const coordinates: GeoJSON.Position[] = [
      [-111.88811277644503, 40.79618409829391],
      [-111.88645596614953, 40.797821596351326],
      [-111.88857300152719, 40.79938937578956],
      [-111.88811277644503, 40.80168871865277],
      [-111.88502926839493, 40.80350026602076],
      [-111.88553551598517, 40.80482405782945],
    ];

    const path = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates,
      },
    };

    const options = {
      metric: "m" as "m" | "ft",
      zoom: 13,
      tileSize: 512,
      tileRequest: async (x: number, y: number, z: number) => {
        const buf = await sharp(`test/fixtures/${z}-${x}-${y}.webp`)
          .raw()
          .toBuffer({ resolveWithObject: true });
        return {
          channels: buf.info.channels,
          image: new Uint8ClampedArray(buf.data),
        };
      },
    };

    expect(await profileLineString(path, options)).toEqual(
      JSON.parse(
        await readFileAsync("test/fixtures/profileSimple14m.json", "utf-8"),
      ),
    );

    options.metric = "ft" as const;

    expect(await profileLineString(path, options)).toEqual(
      JSON.parse(
        await readFileAsync("test/fixtures/profileSimple14ft.json", "utf-8"),
      ),
    );
  });
});
