import { Page } from "@playwright/test";
import packagejson from "../../../package.json" assert { type: "json" };

export async function injectGlobalVariables(page: Page) {
  console.log("injecting global variables");
  await page.addInitScript(
    ({ version, nodeEnv }) => {
      window.__MT_SDK_VERSION__ = version;
      window.__MT_NODE_ENV__ = nodeEnv;
    },
    { version: packagejson.version, nodeEnv: process.env.NODE_ENV },
  );
}
