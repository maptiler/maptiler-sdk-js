// eslint-disable @typescript-eslint/no-unsafe-argument
import { Browser, expect, test } from "@playwright/test";
import loadFixtureAndGetMapHandle, { LoadFixtureAndGetMapHandleOptions } from "./helpers/loadFixtureAndGetMapHandle";
import maptilerBaseStyle from "./mocks/maptiler-style.json" assert { type: "json" };
import maptilerStyleSpaceHalo from "./mocks/maptiler-style-space-halo.json" assert { type: "json" };
import maptilerStyleSpaceHaloInvalid from "./mocks/maptiler-style-space-halo-invalid.json" assert { type: "json" };
import { StyleSpecificationWithMetaData } from "../../src";

const basicStyleSpec: StyleSpecificationWithMetaData = maptilerBaseStyle as unknown as StyleSpecificationWithMetaData;
const styleSpecWithHaloSpace: StyleSpecificationWithMetaData = maptilerStyleSpaceHalo as unknown as StyleSpecificationWithMetaData;
const styleSpecWithHaloSpaceInvalid: StyleSpecificationWithMetaData = maptilerStyleSpaceHaloInvalid as unknown as StyleSpecificationWithMetaData;

test.setTimeout(60000);

async function setupPage(browser: Browser, fixtureOptions: Partial<LoadFixtureAndGetMapHandleOptions> = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();

  // @ts-expect-error - "Type instantiation is excessively deep and possibly infinite"
  await page.addInitScript(
    (styles: Record<string, StyleSpecificationWithMetaData>) => {
      window.__pageObjects = {
        ...window.__pageObjects,
        ...styles,
      };
    },
    { styleSpecWithHaloSpace, styleSpecWithHaloSpaceInvalid, basicStyleSpec },
  );

  await loadFixtureAndGetMapHandle({
    fixture: "haloSpace",
    page,
    lazy: true,
    ...fixtureOptions,
  });

  expect(await page.title()).toBe("MapTiler E2E Halo Space");

  return page;
}

//#region Halo tests
test.describe("Halo", () => {
  test("if catalogue style has no halo config and halo === true in constructor, the default is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-no-style-config-halo-true",
        options: {
          container: "map",
          halo: true,
          zoom: 3,
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("if remote style has a halo config and halo === true in constructor, that remote style is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-remote-style-config-halo-true",
        options: {
          style: "doesnt-matter",
          container: "map",
          halo: true,
          zoom: 3,
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("if remote style has halo config, but halo config is passed to constructor, the constructor option config is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-remote-style-config-halo-constructor-override",
        options: {
          container: "map",
          halo: {
            scale: 2,
            stops: [
              [0.2, "transparent"],
              [0.2, "blue"],
              [0.4, "blue"],
              [0.4, "transparent"],
            ],
          },
          zoom: 3,
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("if json passed to setStyle has halo config, that config is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-json-style-config-halo-rendered",
        options: {
          container: "map",
          zoom: 3,
        },
        requiresScreenShot: false,
      });

      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpace);
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("if json passed to setStyle has no halo config, but constructor option is set to `true`, the default halo is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-json-default",
        options: {
          style: "doesnt-matter",
          container: "map",
          zoom: 3,
          halo: true,
        },
      });

      await window.setFixtureMapStyle(window.__pageObjects.basicStyleSpec);
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("if remote style has halo config, but halo === false in constructor, no halo is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-remote-style-config-halo-false",
        options: {
          container: "map",
          halo: false,
          zoom: 3,
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("if a valid json halo config is passed to setStyle, but halo === true or unset in constructor, the halo is rendered", async ({ browser }) => {
    // Test implementation
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-json-style-config-halo-true",
        options: {
          container: "map",
          zoom: 3,
          halo: true,
        },
      });

      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpace);
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("if a valid json halo config is passed to setStyle, but halo === false in constructor, the halo is not rendered", async ({ browser }) => {
    // Test implementation
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-json-false",
        options: {
          container: "map",
          zoom: 3,
          halo: false,
        },
      });

      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpace);
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("when halo is set to valid halo spec in constructor, it overrides remote style halo spec", async ({ browser }) => {
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-catalogue-style-halo-constructor-override",
        options: {
          container: "map",
          zoom: 3,
          halo: {
            scale: 2,
            stops: [
              [0.2, "transparent"],
              [0.2, "blue"],
              [0.4, "blue"],
              [0.4, "transparent"],
            ],
          },
          style: "streets-v4",
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("when halo is set to valid halo spec in constructor, it overrides json to setStyle halo spec", async ({ browser }) => {
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-json-style-config-halo-constructor-override",
        options: {
          container: "map",
          zoom: 3,
          halo: {
            scale: 2,
            stops: [
              [0.2, "transparent"],
              [0.2, "blue"],
              [0.4, "blue"],
              [0.4, "transparent"],
            ],
          },
          style: window.__pageObjects.styleSpecWithHaloSpace,
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("when halo constructor option is left undefined, if remote style that includes halo config is selected, it is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-remote-valid",
        options: {
          container: "map",
          zoom: 3,
        },
      });

      await window.setFixtureMapStyle("doesnt-matter-as-it-will-be-mocked");
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("when halo constructor option is left undefined, if json with valid halo config is passed to setStyle, it is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-json-valid",
        options: {
          container: "map",
          zoom: 3,
        },
      });

      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpace);
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`halo-${data.id}.png`, { timeout: 10000 });
  });

  test("when an invalid spec is passed to the constructor the console notifies the user of the incorrect spec", async ({ browser }) => {
    const page = await setupPage(browser);

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {});

    const expectedErrorMessage = `[RadialGradientLayer]: Invalid Halo specification:
 - Properties \`hi\` are not supported.
 - Halo \`scale\` property is not a number.
 - Halo \`stops\` property is not an array of [number, string]`;

    const consolePromise = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && msg.text().includes(expectedErrorMessage),
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-invalid",
        options: {
          container: "map",
          zoom: 3,
          space: false,
          halo: {
            hi: "there",
            // @ts-expect-error - invalid spec
            stops: [0.2, "transparent"],
          },
        },
      });
    });

    const consoleMsg = await consolePromise;
    expect(consoleMsg.type()).toBe("error");
    expect(consoleMsg.text()).toContain(expectedErrorMessage);
  });

  test("when an invalid spec is included in a catalogue style the console notifies the user of the incorrect spec", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo-invalid.json",
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    await page.exposeFunction("notifyScreenshotStateReady", async (_: Record<string, TTestTransferData>) => {});

    const expectedErrorMessage = `[RadialGradientLayer]: Invalid Halo specification:
 - Halo \`scale\` property is not a number.
 - Halo \`stops\` property is not an array.`;

    const consolePromise = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && msg.text().includes(expectedErrorMessage),
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-catalogue-style-config-halo-invalid",
        options: {
          container: "map",
          zoom: 3,
          space: false,
        },
      });
    });

    const consoleMsg = await consolePromise;
    expect(consoleMsg.type()).toBe("error");
    expect(consoleMsg.text()).toContain(expectedErrorMessage);
  });

  test("when an invalid spec is included in a json style the console notifies the user of the incorrect spec", async ({ browser }) => {
    const page = await setupPage(browser);

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    await page.exposeFunction("notifyScreenshotStateReady", async (_: Record<string, TTestTransferData>) => {});

    const expectedErrorMessage = `[RadialGradientLayer]: Invalid Halo specification:
 - Halo \`scale\` property is not a number.
 - Halo \`stops\` property is not an array.`;

    const consolePromise = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && msg.text().includes(expectedErrorMessage),
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-json-invalid",
        options: {
          container: "map",
          zoom: 3,
          space: false,
        },
      });

      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpaceInvalid);
    });

    const consoleMsg = await consolePromise;
    expect(consoleMsg.type()).toBe("error");
    expect(consoleMsg.text()).toContain(expectedErrorMessage);
  });
});

//#region Space tests
test.describe("Space", () => {
  test("when space is set to true in constructor, if catalogue style has no space config, the default is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-style-config-space-true-no-style-config",
        options: {
          container: "map",
          space: true,
          halo: false,
          zoom: 3,
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when space is set to true in constructor, if catalogue has a space config, that config is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-catalogue-style-config-space-true",
        options: {
          container: "map",
          space: true,
          halo: false,
          zoom: 3,
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when space is set to true in constructor, if json passed to setStyle has space config, that config is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-json-style-config-space-true",
        options: {
          container: "map",
          space: true,
          halo: false,
          zoom: 3,
        },
      });
      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpace);
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when space is set to true in constructor, if json passed to setStyle has no space config, the default space is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-json-style-config-space-true-default",
        options: {
          container: "map",
          space: true,
          halo: false,
          zoom: 3,
        },
      });
      await window.setFixtureMapStyle(window.__pageObjects.basicStyleSpec);
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when space is set to false in constructor, if catalogue style has space config, it is ignored and no space is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-style-config-space-false-with-style-config",
        options: {
          container: "map",
          space: false,
          halo: false,
          zoom: 3,
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when space is set to false in constructor, if json is passed to setStyle, it is ignored and no space is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-style-config-space-false-with-json-style-config",
        options: {
          container: "map",
          space: false,
          halo: false,
          zoom: 3,
        },
      });
      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpace);
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when space is set to valid space spec in constructor, it overrides catalogue space spec", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-style-config-space-constructor-with-catalogue-style-config",
        options: {
          container: "map",
          space: {
            color: "red",
            preset: "stars",
          },
          halo: false,
          zoom: 3,
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when space is set to valid space spec in constructor, it overrides json to setStyle space spec", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-style-config-space-constructor-with-json-space-config",
        options: {
          container: "map",
          space: {
            color: "red",
            preset: "stars",
          },
          halo: false,
          zoom: 3,
        },
      });
      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpace);
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when space constructor option is left undefined, if catalogue style is selected, it is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-catalogue-style-config-space-undefined",
        options: {
          container: "map",
          zoom: 3,
          halo: false,
          style: "doesnt-matter-as-it-will-be-mocked",
        },
      });
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when space constructor option is left undefined, if json passed to setStyle, it is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style.json",
    });

    const screenshotPromise = new Promise<Record<string, TTestTransferData>>((resolve) => {
      void page.exposeFunction("notifyScreenshotStateReady", resolve);
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-style-config-constructor-undefined-with-json-style-config",
        options: {
          container: "map",
          zoom: 3,
          halo: false,
        },
        requiresScreenShot: false,
      });
      await window.setFixtureMapStyle("doesnt-matter-as-it-will-be-mocked");
    });

    const data = await screenshotPromise;
    await expect(page).toHaveScreenshot(`space-${data.id}.png`, { timeout: 10000 });
  });

  test("when an invalid spec is passed to the constructor, the console notifies the user of the incorrect spec", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style.json",
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {});

    const expectedErrorMessage = `Error: [CubemapLayer]: Invalid cubemap specification:
- Space specification contains unsupported properties: \`not\`. Supported properties: \`color\`, \`preset\`, \`path\`, \`faces\`.`;

    const consolePromise = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && msg.text().includes(expectedErrorMessage),
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-constructor-config-space-invalid",
        options: {
          container: "map",
          halo: false,
          style: "doesn't-matter-as-it-will-be-mocked",
          space: {
            not: "a valid spec",
            // @ts-expect-error - invalid spec
            color: ["not", "an array"],
          },
        },
      });
    });
    const consoleMsg = await consolePromise;
    expect(consoleMsg.type()).toBe("error");
    expect(consoleMsg.text()).toContain(expectedErrorMessage);
  });

  test("when an invalid spec is included in a catalogue style, the console notifies the user of the incorrect spec", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo-invalid.json",
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {});

    const expectedErrorMessage = `Error: [CubemapLayer]: Invalid cubemap specification:
- Space preset "3" is not a valid preset. Available presets: stars, space, milkyway, milkyway-subtle, milkyway-bright, milkyway-colored`;

    const consolePromise = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && msg.text().includes(expectedErrorMessage),
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-catalogue-style-config-space-invalid",
        options: {
          container: "map",
          halo: false,
          style: "doesn't-matter-as-it-will-be-mocked",
        },
      });
    });
    const consoleMsg = await consolePromise;
    expect(consoleMsg.type()).toBe("error");
    expect(consoleMsg.text()).toContain(expectedErrorMessage);
  });

  test("when an invalid spec is included in a json style, the console notifies the user of the incorrect spec", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style.json",
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {});

    const expectedErrorMessage = `Error: [CubemapLayer]: Invalid cubemap specification:
- Space preset "3" is not a valid preset. Available presets: stars, space, milkyway, milkyway-subtle, milkyway-bright, milkyway-colored`;

    const consolePromise = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && msg.text().includes(expectedErrorMessage),
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "space-json-style-config-space-invalid",
        options: {
          container: "map",
          halo: false,
          style: "doesn't-matter-as-it-will-be-mocked",
        },
      });
      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpaceInvalid);
    });
    const consoleMsg = await consolePromise;
    expect(consoleMsg.type()).toBe("error");
    expect(consoleMsg.text()).toContain(expectedErrorMessage);
  });
});
