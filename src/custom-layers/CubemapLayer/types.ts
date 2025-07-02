export enum CubemapImagesPresets {
  UNIVERSE_DARK = "universe-dark",
}

/**
 * Constructor options for the CubemapLayer.
 * This type is equivalent to {@link CubemapDefinition} with no additional properties.
 */
export type CubemapLayerConstructorOptions = CubemapDefinition & {};

export const cubemapPresets: Record<string, CubemapDefinition> = {
  stars: {
    color: "hsl(233,100%,92%)",
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
  "milkyway-colored": {
    color: "black",
    preset: "milkyway-colored",
  },
};

// This is not the most elegant but it's more readable than some of the alternatives.
// see here for additional options:
// https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
/**
 * Defines how a cubemap should be constructed from source materials.
 * This is a discriminated union type with four possible formats:
 *
 * 1. Path-based: Specify a base URL and optional format for cube face images
 * 2. Faces-based: Provide explicit URLs for each cube face
 * 3. Preset-based: Use a predefined cubemap from available presets
 * 4. Color-based: Use a single color for all faces
 *
 * Only one of `path`, `faces`, `preset`, or `color` should be provided.
 *
 * @example
 * // Path-based cubemap
 * const pathCubemap: CubemapDefinition = {
 *   path: {
 *     baseUrl: 'https://example.com/cubemap',
 *     format: 'png'
 *   }
 * };
 *
 * // Color-based cubemap
 * const colorCubemap: CubemapDefinition = {
 *   color: '#ff0000'
 * };
 */
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
