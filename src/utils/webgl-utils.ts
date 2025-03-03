type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

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

type Object3D<Attribute extends string, Uniform extends string> = {
  shaderProgram: WebGLProgram;
  programInfo: {
    attributesLocations: Record<Attribute, number>;
    uniformsLocations: Record<Uniform, WebGLUniformLocation>;
  };
  positionBuffer: WebGLBuffer;
  indexBuffer?: WebGLBuffer;
  indexBufferLength?: number;
};

function createObject3D<Attribute extends string, Uniform extends string>({
  gl,
  vertexShaderSource,
  fragmentShaderSource,
  attributesKeys,
  uniformsKeys,
  vertices,
  indices,
}: {
  gl: WebGLContext;
  vertexShaderSource: string;
  fragmentShaderSource: string;
  attributesKeys: readonly Attribute[];
  uniformsKeys: readonly Uniform[];
  vertices: Array<number>;
  indices?: Array<number>;
}): Object3D<Attribute, Uniform> {
  const shaderProgram = createShadersSetProgram({ gl, vertexShaderSource, fragmentShaderSource });

  const attributesLocations = attributesKeys.reduce(
    (acc, key) => {
      acc[key] = gl.getAttribLocation(shaderProgram, `a_${key}`);

      return acc;
    },
    {} as Record<string, number>,
  );

  const uniformsLocations = uniformsKeys.reduce(
    (acc, key) => {
      acc[key] = getUniformLocation(gl, shaderProgram, `u_${key}`);

      return acc;
    },
    {} as Record<string, WebGLUniformLocation>,
  );

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  let indexBuffer: WebGLBuffer | undefined;
  let indexBufferLength: number | undefined;

  if (indices !== undefined) {
    indexBuffer = gl.createBuffer();
    indexBufferLength = indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  }

  return {
    shaderProgram,
    programInfo: {
      attributesLocations,
      uniformsLocations,
    },
    positionBuffer,
    indexBuffer,
    indexBufferLength,
  };
}

export { loadShader, createShadersSetProgram, getUniformLocation, createObject3D };
export type { WebGLContext, Object3D };
