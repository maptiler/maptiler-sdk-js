import { CubemapFaces } from './types';
type WebGLCtx = WebGLRenderingContext | WebGL2RenderingContext;
interface LoadCubemapTextureOptions {
    gl: WebGLCtx;
    faces?: CubemapFaces;
    onReady: (texture: WebGLTexture, images?: HTMLImageElement[]) => void;
    forceRefresh?: boolean;
}
export declare function deleteMemoizedTexture(gl: WebGLCtx): void;
/**
 * Loads a cubemap texture from a set of image URLs.
 *
 * This function creates and configures a WebGL cubemap texture from a set of images.
 * It memoizes the created texture to avoid redundant loading of the same faces,
 * unless the `forceRefresh` flag is set.
 *
 * @param {Object} options - The options object.
 * @param {WebGLRenderingContext | WebGL2RenderingContext} options.gl - The WebGL rendering context.
 * @param {CubemapFaces} options.faces - An object containing URLs for each face of the cubemap.
 *                                        Must contain exactly 6 faces.
 * @param {Function} [options.onReady] - Optional callback function to be called when all faces are loaded.
 * @param {boolean} [options.forceRefresh] - If true, forces creation of a new texture instead of returning the memoized one.
 *
 * @returns {WebGLTexture | undefined} The created WebGL cubemap texture, or undefined if there was an error.
 *
 * @see {@link facesKey}
 * @see {@link memoizedReturnValue}
 * @example
 * const texture = loadCubemapTexture({
 *   gl: webglContext,
 *   faces: {
 *     px: 'right.jpg',
 *     nx: 'left.jpg',
 *     py: 'top.jpg',
 *     ny: 'bottom.jpg',
 *     pz: 'front.jpg',
 *     nz: 'back.jpg'
 *   },
 *   onReady: () => console.log('Cubemap loaded')
 * });
 */
export declare function loadCubemapTexture({ gl, faces, onReady, forceRefresh }: LoadCubemapTextureOptions): void;
export {};
