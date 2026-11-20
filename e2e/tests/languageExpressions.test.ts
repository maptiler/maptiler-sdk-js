import { expect, test, type Page } from "@playwright/test";
import path from "path";
import loadFixtureAndGetMapHandle from "./helpers/loadFixtureAndGetMapHandle";
import languageExpressionsStyle from "./mocks/maptiler-style-language-expressions.json" assert { type: "json" };
import type { ExpressionSpecification } from "../../src";

type TextFields = Record<string, unknown>;

// The symbol layers of mocks/maptiler-style-language-expressions.json
const LABEL_LAYER_IDS = languageExpressionsStyle.layers.filter((layer) => layer.type === "symbol").map((layer) => layer.id);

// The text-fields as they are in the style
const ORIGINAL_TEXT_FIELDS: TextFields = Object.fromEntries(
  languageExpressionsStyle.layers.filter((layer) => layer.type === "symbol").map((layer) => [layer.id, (layer.layout as { "text-field": unknown })["text-field"]]),
);

const ENGLISH: ExpressionSpecification = ["coalesce", ["get", "name:en"], ["get", "name"]];
const GERMAN: ExpressionSpecification = ["coalesce", ["get", "name:de"], ["get", "name"]];
const LOCAL: ExpressionSpecification = ["get", "name"];

// The English label of Language.VISITOR_ENGLISH, with the local name below it when they differ
const VISITOR_ENGLISH: ExpressionSpecification = [
  "case",
  ["all", ["has", "name:en"], ["has", "name"]],
  ["case", ["==", ["get", "name:en"], ["get", "name"]], ["get", "name"], ["format", ["get", "name:en"], { "font-scale": 0.8 }, "\n", ["get", "name"], { "font-scale": 1.1 }]],
  ["get", "name"],
];

/**
 * The text-fields expected after a language change.
 * - `label`: the language expression where the name is the label itself, which can be a `format` (visitor modes)
 * - `inString`: the language expression where only a string is valid, e.g. inside `concat` or `format`
 */
function expectedTextFields(label: ExpressionSpecification, inString: ExpressionSpecification): TextFields {
  return {
    // The airport code is kept, at every zoom level
    airport: ["step", ["zoom"], ["coalesce", ["get", "iata"], ["get", "icao"]], 12, ["concat", inString, "\n", ["coalesce", ["get", "iata"], ["get", "icao"]]]],
    // The elevation is kept, the condition is not localized
    peak_name_ele: ["case", ["has", "ele"], ["concat", inString, " ", ["to-string", ["get", "ele"]], " m"], label],
    // The elevation and the formatting are kept
    peak_format: ["format", inString, {}, "\n", {}, ["concat", ["to-string", ["get", "ele"]], " m"], { "font-scale": 0.8 }],
    // The input and the labels of the match are kept, the coalesce of names becomes a single language expression
    place_match: ["match", ["get", "class"], "city", label, "country", label, label],
    // The condition is kept, the label in two languages becomes a single language one
    water_bilingual: ["case", ["==", ["get", "name:en"], ["get", "name"]], label, label],
    // The non-name fallback of the coalesce is kept between the name lookups
    poi_ref_fallback: ["coalesce", label, ["get", "ref"], label],
    // No name lookup, not modified
    road_shield: ORIGINAL_TEXT_FIELDS.road_shield,
    // Not a MapTiler source, not modified
    custom_label: ORIGINAL_TEXT_FIELDS.custom_label,
  };
}

async function loadFixture(page: Page) {
  // The vector source of the style, without any feature: the text-fields are checked, not their rendering
  await page.route("https://api.maptiler.com/tiles/v3/*/*/*.pbf*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/x-protobuf",
      body: Buffer.alloc(0),
    }),
  );

  await page.route("https://api.maptiler.com/tiles/v3/tiles.json*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      path: path.resolve(import.meta.dirname, "mocks/maptiler-tilejson-vector.json"),
    }),
  );

  const { mapHandle } = await loadFixtureAndGetMapHandle({
    fixture: "languageExpressions",
    page,
    mockStyle: "maptiler-style-language-expressions.json",
    mockTiles: false,
  });

  expect(mapHandle).not.toBeNull();
  expect(await page.title()).toBe("MapTiler E2E Language Expressions");
}

async function getTextFields(page: Page) {
  return page.evaluate((layerIds) => {
    const map = window.__map;
    return {
      textFields: Object.fromEntries(layerIds.map((id) => [id, map.getLayoutProperty(id, "text-field") as unknown])),
      errors: [...(window.__pageObjects.errors as string[])],
    };
  }, LABEL_LAYER_IDS);
}

// The style is loaded when the fixture is, so the language is changed synchronously
async function setLanguage(page: Page, language: string) {
  const primaryLanguage = await page.evaluate((language) => {
    window.__map.setLanguage(language);
    return window.__map.getPrimaryLanguage().flag;
  }, language);

  expect(primaryLanguage).toBe(language);

  return getTextFields(page);
}

test.describe("setLanguage with text-field expressions", () => {
  test.beforeEach(async ({ page }) => {
    await loadFixture(page);
  });

  test("the text-fields are as in the style while the language has not been changed", async ({ page }) => {
    const { textFields, errors } = await getTextFields(page);

    expect(textFields).toEqual(ORIGINAL_TEXT_FIELDS);
    expect(errors).toEqual([]);
  });

  test("only the name lookups are replaced when setting a language", async ({ page }) => {
    const { textFields, errors } = await setLanguage(page, "name:en");

    expect(textFields).toEqual(expectedTextFields(ENGLISH, ENGLISH));
    expect(errors).toEqual([]);
  });

  test("a second language change starts from the text-fields of the style", async ({ page }) => {
    await setLanguage(page, "name:en");
    const { textFields, errors } = await setLanguage(page, "name:de");

    expect(textFields).toEqual(expectedTextFields(GERMAN, GERMAN));
    expect(errors).toEqual([]);
  });

  test("the local language replaces every name lookup by the local name", async ({ page }) => {
    const { textFields, errors } = await setLanguage(page, "name");

    expect(textFields).toEqual(expectedTextFields(LOCAL, LOCAL));
    expect(errors).toEqual([]);
  });

  test("a visitor mode uses its two-language format only where the name is the label itself", async ({ page }) => {
    const { textFields, errors } = await setLanguage(page, "visitor_en");

    // Inside concat or format, the two-language format isn't valid: the English name, with the local name as fallback
    expect(textFields).toEqual(expectedTextFields(VISITOR_ENGLISH, ENGLISH));
    expect(errors).toEqual([]);
  });

  test("switching back to a language gives the same text-fields as setting it first", async ({ page }) => {
    await setLanguage(page, "visitor_en");
    await setLanguage(page, "name");
    const { textFields, errors } = await setLanguage(page, "name:en");

    expect(textFields).toEqual(expectedTextFields(ENGLISH, ENGLISH));
    expect(errors).toEqual([]);
  });
});
