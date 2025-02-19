import { createShadersSetProgram, getUniformLocation } from "../../../utils/webgl-utils";
import type { CubemapObject3D } from "../types";

import { indices, positions } from "./constants";
import vertexShaderSource from "./cubemap.vert.glsl?raw";
import fragmentShaderSource from "./cubemap.frag.glsl?raw";

function createCubemap(gl: WebGLRenderingContext | WebGL2RenderingContext): CubemapObject3D {
  const shaderProgram = createShadersSetProgram({ gl, vertexShaderSource, fragmentShaderSource });

  const programInfo: CubemapObject3D["programInfo"] = {
    attributesLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aPosition"),
    },
    uniformsLocations: {
      projectionMatrix: getUniformLocation(gl, shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: getUniformLocation(gl, shaderProgram, "uModelViewMatrix"),
      cubeSampler: getUniformLocation(gl, shaderProgram, "uCubeSampler"),
      alpha: getUniformLocation(gl, shaderProgram, "uAlpha"),
      alphaColor: getUniformLocation(gl, shaderProgram, "uAlphaColor"),
      alphaThreshold: getUniformLocation(gl, shaderProgram, "uAlphaThreshold"),
    },
  };

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    shaderProgram,
    programInfo,
    positionBuffer,
    indexBuffer,
    indexBufferLength: indices.length,
  };
}

export { createCubemap };
