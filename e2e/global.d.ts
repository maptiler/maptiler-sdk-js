import { Map, StyleSpecificationWithMetaData, type MapOptions } from "../src";

declare global {
  interface Window {
    __map: Map;
    __pageObjects: Record<string, any>;
    __pageLoadTimeout: number;
    notifyScreenshotStateReady: (data: TTestTransferData) => Promise<void>;
    notifyTest: (data: TTestTransferData) => Promise<void>;
    setFixtureWithConfig: (config: { id: string; options: MapOptions; requiresScreenShot?: boolean }) => Promise<void>;
    setFixtureMapStyle: (style: string | StyleSpecificationWithMetaData) => Promise<void>;
    __MT_SDK_VERSION__: string;
    __MT_NODE_ENV__: string | undefined;
    __testUtils?: {
      getHaloConfig: () => any;
      getSpaceConfig: () => any;
      hasHalo: () => boolean;
      hasSpace: () => boolean;
    };
  }

  type TTestTransferData = string | number | boolean | string[] | number[] | boolean[] | null | Record<string, unknown> | [number, number];
}

export {};
