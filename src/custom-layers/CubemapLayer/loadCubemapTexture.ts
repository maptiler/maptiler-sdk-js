import { CubemapFaceNames, CubemapFaces } from "./types";

interface LoadCubemapTextureOptions {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  faces?: CubemapFaces;
  onReady: (texture: WebGLTexture, images?: HTMLImageElement[]) => void;
  forceRefresh?: boolean;
}

/**
 * Stores the result of the last successful execution of {@link loadCubemapTexture}.
 * @type {WebGLTexture | undefined}
 * @private
 */
let memoizedTexture: WebGLTexture | undefined = undefined;

let memoizedImages: HTMLImageElement[] | undefined = undefined;
/**
 * Stores the stringified content of the 'faces' object from the last successful execution.
 * Used for memoization by {@link loadCubemapTexture}.
 * @type {string | undefined}
 * @private
 */
let facesKey: string | undefined = undefined;

interface ImageLoadingPromiseReturnValue {
  image: HTMLImageElement;
  key: CubemapFaceNames;
}

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
export function loadCubemapTexture({ gl, faces, onReady, forceRefresh }: LoadCubemapTextureOptions) {
  if (memoizedTexture && !forceRefresh && facesKey === JSON.stringify(faces)) {
    onReady(memoizedTexture, memoizedImages);
  }

  facesKey = JSON.stringify(faces);

  const texture = memoizedTexture ?? gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  if (!faces) {
    console.warn("[CubemapLayer][loadCubemapTexture]: Faces are null");
    return;
  }

  const numFaces = Object.keys(faces).length;

  if (numFaces !== 6) {
    console.warn(`[CubemapLayer][loadCubemapTexture]: Faces should contain exactly 6 images, but found ${numFaces}`);
    return;
  }

  const imageLoadingPromises = Object.entries(faces).map(([key, face]) => {
    return new Promise<ImageLoadingPromiseReturnValue>((resolve, reject) => {
      const keyEnum = key as CubemapFaceNames;
      if (face === undefined) {
        reject(new Error(`[CubemapLayer][loadCubemapTexture]: Face ${key} is undefined`));
        return;
      }

      const image = new Image();

      image.crossOrigin = "anonymous";

      const handleLoad = () => {
        resolve({ image, key: keyEnum });
      };

      image.src = face;

      // in case the image is loaded from the cache.
      if (image.complete && image.naturalWidth > 0) {
        handleLoad();
      } else {
        image.onload = handleLoad;
      }

      image.onerror = () => {
        reject(new Error(`[CubemapLayer][loadCubemapTexture]: Error loading image ${face}`));
      };
    });
  });

  void Promise.all(imageLoadingPromises)
    .then((imagesAndFaceKeys) => {
      for (let i = 0; i < imagesAndFaceKeys.length; i++) {
        const lod = 0;
        const internalFormat = gl.RGBA;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        const { image, key } = imagesAndFaceKeys[i] ?? {};

        if (!image || !key) {
          console.warn(`[CubemapLayer][loadCubemapTexture]: Image or key is null`);
          continue;
        }

        const glCubemapTarget = getGlCubemapTarget(gl, key);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(glCubemapTarget, lod, internalFormat, format, type, image);
      }

      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const imageElements = imagesAndFaceKeys.map((image) => image.image);

      onReady(texture, imageElements);

      memoizedImages = imageElements;
      memoizedTexture = texture;
    })
    .catch((error) => {
      console.error(`[CubemapLayer][loadCubemapTexture]: Error loading cubemap texture`, error);
    });
}

function getGlCubemapTarget(gl: WebGLRenderingContext | WebGL2RenderingContext, key: CubemapFaceNames): number {
  // Why are we being explicit here instead of dynamically creating the key?
  // The problem is that if we create a key to access the gl enum, eg key = `TEXTURE_CUBE_MAP_${imageKey}`,
  // typescript will not be able to infer the type of the key.
  // So, we need to be explicit here.

  if (key === CubemapFaceNames.POSITIVE_X) {
    return gl.TEXTURE_CUBE_MAP_POSITIVE_X;
  }

  if (key === CubemapFaceNames.NEGATIVE_X) {
    return gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
  }

  if (key === CubemapFaceNames.POSITIVE_Y) {
    return gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
  }

  if (key === CubemapFaceNames.NEGATIVE_Y) {
    return gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
  }

  if (key === CubemapFaceNames.POSITIVE_Z) {
    return gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
  }

  if (key === CubemapFaceNames.NEGATIVE_Z) {
    return gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;
  }

  throw new Error(`[CubemapLayer][loadCubemapTexture]: Invalid key ${key}`);
}
