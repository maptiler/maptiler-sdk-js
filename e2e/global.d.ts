import { Map } from "@maptiler/sdk";

declare global {
  interface Window {
    __map: Map;
    __pageLoadTimeout: number;
    notifyScreenshotStateReady: (data: TTestTransferData) => Promise<void>;
    __pageObjects: Record<string, unknown>;
  }

  type TTestTransferData = string | number | boolean | string[] | number[] | boolean[] | null | Record<string, unknown> | [number, number];
}
