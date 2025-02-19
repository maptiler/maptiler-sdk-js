type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

type ProgramInfo<AttributeKey extends string, UniformKey extends string> = {
  attributesLocations: Record<AttributeKey, number>;
  uniformsLocations: Record<UniformKey, WebGLUniformLocation>;
};

type Object3D<AttributeKey extends string, UniformKey extends string> = {
  shaderProgram: WebGLProgram;
  programInfo: ProgramInfo<AttributeKey, UniformKey>;
  positionBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  indexBufferLength: number;
};

/**
 * Load a shader from a source string
 */
function loadShader({ gl, type, source }: { gl: WebGLContext; type: GLenum; source: string }) {
  const shader = gl.createShader(type);

  if (shader === null) {
    throw new Error("Cannot create shader");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);

    throw new Error("Cannot compile shader");
  }

  return shader;
}

/**
 * Create a set of shaders (vertex and fragment) and link them into a program
 *
 * @param gl WebGL context
 * @param vertexShaderSource Vertex shader source code
 * @param fragmentShaderSource Fragment shader source code
 *
 * @returns WebGL program
 */
function createShadersSetProgram({
  gl,
  vertexShaderSource,
  fragmentShaderSource,
}: { gl: WebGLContext; vertexShaderSource: string; fragmentShaderSource: string }) {
  const vertexShader = loadShader({
    gl,
    type: gl.VERTEX_SHADER,
    source: vertexShaderSource,
  });
  const fragmentShader = loadShader({ gl, type: gl.FRAGMENT_SHADER, source: fragmentShaderSource });

  const shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("Error: ", gl.getProgramInfoLog(shaderProgram));

    throw new Error("Cannot link shader program");
  }

  return shaderProgram;
}

/**
 * null-free version of getUniformLocation
 */
function getUniformLocation(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);

  if (location === null) {
    throw new Error(`Cannot get uniform location for ${name}`);
  }

  return location;
}

export { loadShader, createShadersSetProgram, getUniformLocation };
export type { WebGLContext, ProgramInfo, Object3D };
