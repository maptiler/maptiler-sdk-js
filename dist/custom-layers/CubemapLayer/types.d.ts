export declare enum CubemapImagesPresets {
    UNIVERSE_DARK = "universe-dark"
}
/**
 * Constructor options for the CubemapLayer.
 * This type is equivalent to {@link CubemapDefinition} with no additional properties.
 */
export type CubemapLayerConstructorOptions = CubemapDefinition & {};
export declare const cubemapPresets: Record<string, CubemapDefinition>;
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
export type CubemapDefinition = {
    path: {
        baseUrl: string;
        format?: "png" | "jpg" | "webp";
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
    preset: keyof typeof cubemapPresets;
    path?: never;
    faces?: never;
    color?: string;
} | {
    color: string;
    path?: never;
    faces?: never;
    preset?: never;
};
export declare enum CubemapFaceNames {
    POSITIVE_X = "pX",
    NEGATIVE_X = "nX",
    POSITIVE_Y = "pY",
    NEGATIVE_Y = "nY",
    POSITIVE_Z = "pZ",
    NEGATIVE_Z = "nZ"
}
export type CubemapFaces = Record<CubemapFaceNames, string>;
