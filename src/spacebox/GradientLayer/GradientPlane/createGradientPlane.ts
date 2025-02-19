import { createShadersSetProgram, getUniformLocation, type WebGLContext } from "../../../utils/webgl-utils";

import type { GradientPlaneObject3D } from "../types";

import { positions } from "./constants";
import vertexShaderSource from "./gradient.vert.glsl?raw";
import fragmentShaderSource from "./gradient.frag.glsl?raw";

function createGradientPlane(gl: WebGLContext): GradientPlaneObject3D {
  const shaderProgram = createShadersSetProgram({ gl, vertexShaderSource, fragmentShaderSource });

  const programInfo: GradientPlaneObject3D["programInfo"] = {
    attributesLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "a_position"),
    },
    uniformsLocations: {
      gradientType: getUniformLocation(gl, shaderProgram, "u_gradientType"),
      aspect: getUniformLocation(gl, shaderProgram, "u_aspect"),
      radius: getUniformLocation(gl, shaderProgram, "u_radius"),
      center: getUniformLocation(gl, shaderProgram, "u_center"),
      stops: getUniformLocation(gl, shaderProgram, "u_stops"),
      stopsNumber: getUniformLocation(gl, shaderProgram, "u_stopsNumber"),
      colors: getUniformLocation(gl, shaderProgram, "u_colors"),
    },
  };
  
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return {
    shaderProgram,
    programInfo,
    positionBuffer,
  };
}

export { createGradientPlane };
