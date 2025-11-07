import { Map } from "../src";

declare global {
  interface Window {
    __map: Map;
    __pageObjects: Record<string, any>;
    notifyScreenshotStateReady: (data: TTestTransferData) => Promise<void>;
    notifyTest: (data: TTestTransferData) => Promise<void>;
  }

  type TTestTransferData = string | number | boolean | string[] | number[] | boolean[] | null | Record<string, unknown> | [number, number];
}
