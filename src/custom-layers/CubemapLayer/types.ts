export enum CubemapImagesPresets {
  UNIVERSE_DARK = "universe-dark",
}

export type CubemapLayerConstructorOptions = CubemapDefinition & {};

export const cubemapPresets: Record<string, CubemapDefinition> = {
  stars: {
    color: "black",
    preset: "stars",
  },
  space: {
    color: "hsl(210, 100%, 4%)",
    preset: "space",
  },
  milkyway: {
    color: "hsl(233,100%,92%)",
    preset: "milkyway",
  },
  "milkyway-subtle": {
    color: "hsl(233,100%,92%)",
    preset: "milkyway-subtle",
  },
  "milkyway-bright": {
    color: "hsl(233,100%,92%)",
    preset: "milkyway-bright",
  },
};

// This is not the most elegant but it's more readable than some of the alternatives.
// see here for additional options:
// https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
export type CubemapDefinition =
  | {
      path: {
        baseUrl: string;
        format?: "png" | "jpg" | "webp";
      };
      faces?: never;
      preset?: never;
      color?: string;
    }
  | {
      faces: CubemapFaces;
      path?: never;
      preset?: never;
      color?: string;
    }
  | {
      preset: keyof typeof cubemapPresets;
      path?: never;
      faces?: never;
      color?: string;
    }
  | {
      color: string;
      path?: never;
      faces?: never;
      preset?: never;
    };

export enum CubemapFaceNames {
  POSITIVE_X = "pX",
  NEGATIVE_X = "nX",
  POSITIVE_Y = "pY",
  NEGATIVE_Y = "nY",
  POSITIVE_Z = "pZ",
  NEGATIVE_Z = "nZ",
}

export type CubemapFaces = Record<CubemapFaceNames, string>;
