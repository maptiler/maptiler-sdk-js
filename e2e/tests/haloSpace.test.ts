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

test.describe("Halo Tests", () => {
  test("if catalogue style has no halo config and halo === true in constructor, the default is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
      await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
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
  });

  test("if remote style has a halo config and halo === true in constructor, that remote style is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
      await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-true",
        options: {
          container: "map",
          halo: true,
          zoom: 3,
        },
      });
    });
  });

  test("if remote style has halo config, but halo config is passed to constructor, the remote constructor config is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
      await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-override",
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
  });

  test("if json passed to setStyle has halo config, that config is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
      await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-json",
        options: {
          container: "map",
          zoom: 3,
        },
      });

      await window.setFixtureMapStyle(window.__pageObjects.basicStyleSpec);
    });
  });

  test("if json passed to setStyle has no halo config, the default halo is rendered", async ({ browser }) => {
    const page = await setupPage(browser);

    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
      await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-json-default",
        options: {
          container: "map",
          zoom: 3,
          halo: true,
        },
      });

      await window.setFixtureMapStyle(window.__pageObjects.basicStyleSpec);
    });
  });

  test("if remote style has halo config, but halo === false in constructor, no halo is rendered", async ({ browser }) => {
    const page = await setupPage(browser, {
      mockStyle: "maptiler-style-space-halo.json",
    });

    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
      await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-override",
        options: {
          container: "map",
          halo: false,
          zoom: 3,
        },
      });
    });
  });

  test("if a valid json halo config is passed to setStyle, but halo === true or unset in constructor, the halo is rendered", async ({ browser }) => {
    // Test implementation
    const page = await setupPage(browser);

    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
      await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
    });

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-json-default",
        options: {
          container: "map",
          zoom: 3,
          halo: false,
        },
      });
    });
  });

  test("if a valid json halo config is passed to setStyle, but halo === false in constructor, the halo is not rendered", async ({ browser }) => {
    // Test implementation
    const page = await setupPage(browser);

    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
      await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
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
  });

  test.describe("when halo is set to valid halo spec in the constructor", () => {
    test("it overrides remote style halo spec", async ({ browser }) => {
      const page = await setupPage(browser);

      await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
        await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
      });

      await page.evaluate(async () => {
        await window.setFixtureWithConfig({
          id: "halo-style-config-halo-remote-override",
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
    });

    test("it overrides json to setStyle halo spec", async ({ browser }) => {
      const page = await setupPage(browser);

      await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
        await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
      });

      await page.evaluate(async () => {
        await window.setFixtureWithConfig({
          id: "halo-style-config-halo-json-false",
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
    });
  });

  test.describe("when halo constructor option is left undefined", () => {
    test("if remote style that includes halo config is selected, it is rendered", async ({ browser }) => {
      const page = await setupPage(browser, {
        mockStyle: "maptiler-style-space-halo.json",
      });

      await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
        await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
      });

      await page.evaluate(async () => {
        await window.setFixtureWithConfig({
          id: "halo-style-config-halo-remote-valid",
          options: {
            container: "map",
            zoom: 3,
          },
        });
      });
    });

    test("if json with valid halo config is passed to setStyle, it is rendered", async ({ browser }) => {
      const page = await setupPage(browser);

      await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
        await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
      });

      await page.evaluate(async () => {
        await window.setFixtureWithConfig({
          id: "halo-style-config-halo-json-valid",
          options: {
            container: "map",
            zoom: 3,
          },
        });
      });
    });
  });

  test("when an invalid spec is passed to the constructor the console notifies the user of the incorrect spec", async ({ browser }) => {
    const page = await setupPage(browser, { debug: true });

    await page.exposeFunction("notifyScreenshotStateReady", async (data: Record<string, TTestTransferData>) => {
      await expect(page).toHaveScreenshot(`haloSpace-${data.id}.png`, { timeout: 10000 });
    });

    const consolePromise = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && msg.text().includes(expectedErrorMessage),
    });

    const expectedErrorMessage = `[RadialGradientLayer]: Invalid Halo specification:
 - Properties \`hi\` are not supported.
 - Halo \`scale\` property is not a number.
 - Halo \`stops\` property is not an array of [number, string]`;

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-invalid",
        options: {
          container: "map",
          zoom: 3,
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

    // this is just to prevent the fixutre from breaking
    await page.exposeFunction("notifyScreenshotStateReady", async (_: Record<string, TTestTransferData>) => {});

    const consolePromise = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && msg.text().includes(expectedErrorMessage),
    });

    const expectedErrorMessage = `[RadialGradientLayer]: Invalid Halo specification:
 - Halo \`scale\` property is not a number.
 - Halo \`stops\` property is not an array.`;

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-invalid",
        options: {
          container: "map",
          zoom: 3,
        },
      });
    });

    const consoleMsg = await consolePromise;
    expect(consoleMsg.type()).toBe("error");
    expect(consoleMsg.text()).toContain(expectedErrorMessage);
  });

  test("when an invalid spec is included in a json style the console notifies the user of the incorrect spec", async ({ browser }) => {
    const page = await setupPage(browser);

    // this is just to prevent the fixutre from breaking
    await page.exposeFunction("notifyScreenshotStateReady", async (_: Record<string, TTestTransferData>) => {});

    const consolePromise = page.waitForEvent("console", {
      predicate: (msg) => msg.type() === "error" && msg.text().includes(expectedErrorMessage),
    });

    const expectedErrorMessage = `[RadialGradientLayer]: Invalid Halo specification:
 - Halo \`scale\` property is not a number.
 - Halo \`stops\` property is not an array.`;

    await page.evaluate(async () => {
      await window.setFixtureWithConfig({
        id: "halo-style-config-halo-json-invalid",
        options: {
          container: "map",
          zoom: 3,
        },
      });

      await window.setFixtureMapStyle(window.__pageObjects.styleSpecWithHaloSpaceInvalid);
    });

    const consoleMsg = await consolePromise;
    expect(consoleMsg.type()).toBe("error");
    expect(consoleMsg.text()).toContain(expectedErrorMessage);
  });
});

test.describe("Space Option Tests", () => {
  test.describe("when space is set to true in constructor", () => {
    test("if catalogue style has no space config, the default is rendered", async ({ page }) => {
      // Test implementation
    });

    test("if catalogue has a space config, that config is rendered", async ({ page }) => {
      // Test implementation
    });

    test("if json passed to setStyle has space config, that config is rendered", async ({ page }) => {
      // Test implementation
    });

    test("if json passed to setStyle has no space config, the default space is rendered", async ({ page }) => {
      // Test implementation
    });
  });

  test.describe("when space is set to false in constructor", () => {
    test("if catalogue style has space config, it is ignored and no space is rendered", async ({ page }) => {
      // Test implementation
    });

    test("if json is passed to setStyle, it is ignored and no space is rendered", async ({ page }) => {
      // Test implementation
    });

    test("if custom style from cloud is set and has space config, it is ignored and no space is rendered", async ({ page }) => {
      // Test implementation
    });
  });

  test.describe("when space is set to valid space spec in the constructor", () => {
    test("it overrides catalogue space spec", async ({ page }) => {
      // Test implementation
    });

    test("it overrides json to setStyle space spec", async ({ page }) => {
      // Test implementation
    });

    test("it overrides custom style from cloud space spec", async ({ page }) => {
      // Test implementation
    });
  });

  test.describe("when space constructor option is left undefined", () => {
    test("if catalogue style is selected, it is rendered", async ({ page }) => {
      // Test implementation
    });

    test("if custom style is selected, it is rendered", async ({ page }) => {
      // Test implementation
    });

    test("if json passed to setStyle, it is rendered", async ({ page }) => {
      // Test implementation
    });
  });

  test.describe("when an invalid spec is passed to the constructor", () => {
    test("the console notifies the user of the incorrect spec", async ({ page }) => {
      // Test implementation
    });
  });

  test.describe("when an invalid spec is included in a catalogue style", () => {
    test("the console notifies the user of the incorrect spec", async ({ page }) => {
      // Test implementation
    });
  });

  test.describe("when an invalid spec is included in a custom style", () => {
    test("the console notifies the user of the incorrect spec", async ({ page }) => {
      // Test implementation
    });
  });
});
