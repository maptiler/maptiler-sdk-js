import fs from "fs";
import { promisify } from "util";
import { test, expect } from "vitest";
import { gpx, kml } from "../../src/converters";
import { DOMParser, XMLSerializer } from "@xmldom/xmldom";

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

test("GPX", async () => {
  // get list of gpx files in "../fixtures"
  const files = (await readDir("./test/fixtures")).filter((f) =>
    f.endsWith(".gpx"),
  );
  // for each file, check against its equivalent .geojson
  for (const file of files) {
    const xml = new DOMParser().parseFromString(
      await readFile(`./test/fixtures/${file}`, "utf8"),
    );
    const json = JSON.parse(
      await readFile(`./test/fixtures/${file}.geojson`, "utf8"),
    );
    expect(gpx(xml)).toEqual(json);
  }
});

test("KML", async () => {
  // get list of kml files in "../fixtures"
  const files = (await readDir("./test/fixtures")).filter((f) =>
    f.endsWith(".kml"),
  );
  // for each file, check against its equivalent .geojson
  for (const file of files) {
    const xml = new DOMParser().parseFromString(
      await readFile(`./test/fixtures/${file}`, "utf8"),
    );
    const json = JSON.parse(
      await readFile(`./test/fixtures/${file}.geojson`, "utf8"),
    );
    expect(kml(xml, xml2str)).toEqual(json);
  }
});

// Node variation of xml2str
function xml2str(node: Node): string {
  return new XMLSerializer().serializeToString(node);
}
