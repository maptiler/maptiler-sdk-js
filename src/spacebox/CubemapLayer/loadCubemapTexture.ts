function loadCubemapTexture({
  gl,
  path,
  onLoadedCallback,
}: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  path: string;
  onLoadedCallback?: () => void;
}) {
  let amountOfLoadedTextures = 0;
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  const faces = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: `${path}/px.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: `${path}/nx.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: `${path}/py.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: `${path}/ny.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: `${path}/pz.jpg`,
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: `${path}/nz.jpg`,
    },
  ];

  for (const face of faces) {
    const { target, url } = face;
    const level = 0;
    const internalFormat = gl.RGBA;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    const image = new Image();

    image.crossOrigin = "anonymous";

    image.onload = () => {
      gl.texImage2D(target, level, internalFormat, format, type, image);

      amountOfLoadedTextures += 1;

      if (amountOfLoadedTextures === faces.length) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        if (onLoadedCallback !== undefined) {
          onLoadedCallback();
        }
      }
    };

    image.src = url;
  }

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
}

export { loadCubemapTexture };
