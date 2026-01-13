import { Map } from "../src";

declare global {
  interface Window {
    __map: Map;
    __pageObjects: Record<string, any>;
    __pageLoadTimeout: number;
    notifyScreenshotStateReady: (data: TTestTransferData) => Promise<void>;
    notifyTest: (data: TTestTransferData) => Promise<void>;
    __MT_SDK_VERSION__: string;
    __MT_NODE_ENV__: string | undefined;
  }

  type TTestTransferData = string | number | boolean | string[] | number[] | boolean[] | null | Record<string, unknown> | [number, number];
}

export {};
