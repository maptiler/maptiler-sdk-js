
export enum CubemapImagesPresets {
  UNIVERSE_DARK = "universe-dark",
}

export type CubemapLayerConstructorOptions = CubemapDefinition & {};

// This is not the most elegant but it's more readable than some of the alternatives.
// see here for additional options:
// https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
export type CubemapDefinition = {
  path: {
    baseUrl: string;
    format?: string | "png";
  };
  faces?: never;
  preset?: never;
  color?: string;
} | {
  faces: CubemapFaces;
  path?: never;
  preset?: never;
  color?: string;
} | {
  // TODO we might need to change this once cloud decides to support more presets
  preset: "universe-dark" | string;
  // This will probably require and update to the `MapStyle` types in the client-js repo
  path?: never;
  faces?: never;
  color?: string;
} | {
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
