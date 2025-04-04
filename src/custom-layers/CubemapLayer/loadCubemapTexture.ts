import { CubemapFaceNames, CubemapFaces } from "./types";

export function loadCubemapTexture({ gl, faces, onLoadedCallback }: { gl: WebGLRenderingContext | WebGL2RenderingContext; faces?: CubemapFaces; onLoadedCallback?: () => void }) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  if (!faces) {
    console.warn("[CubemapLayer][loadCubemapTexture]: Faces are null");
    return;
  }

  Object.entries(faces as CubemapFaces).forEach(([key, face], faceIndex) => {
    if (face === undefined) {
      console.warn(`[CubemapLayer][loadCubemapTexture]: Face ${key} is undefined`);
      return;
    }
    const glCubemapTarget = getGlCubemapTarget(gl, key as CubemapFaceNames);

    if (glCubemapTarget) {
      const level = 0;
      const internalFormat = gl.RGBA;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;

      const image = new Image();

      image.crossOrigin = "anonymous";

      image.onload = () => {
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(glCubemapTarget, level, internalFormat, format, type, image);

        if (faceIndex === 5) {
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
          gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

          if (onLoadedCallback !== undefined) {
            onLoadedCallback();
          }
        }
      };

      image.src = face;
    }
  });

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
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
