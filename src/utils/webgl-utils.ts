import colorConvert from "color-convert";
import { HSL, KEYWORD as NamedColor } from "color-convert/conversions";

import ColorName from "color-name";
// Note, we use these because they are already used by MapLibre
// Saving us an additional dep.

export type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

/**
 * Load a shader from a source string
 */
export function loadShader({ gl, type, source }: { gl: WebGLContext; type: GLenum; source: string }) {
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
export function createShadersSetProgram({ gl, vertexShaderSource, fragmentShaderSource }: { gl: WebGLContext; vertexShaderSource: string; fragmentShaderSource: string }) {
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
export function getUniformLocation(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);

  if (location === null) {
    throw new Error(`Cannot get uniform location for ${name}`);
  }

  return location;
}

export type Object3D<Attribute extends string, Uniform extends string> = {
  shaderProgram: WebGLProgram;
  programInfo: {
    attributesLocations: Record<Attribute, number>;
    uniformsLocations: Record<Uniform, WebGLUniformLocation>;
  };
  positionBuffer: WebGLBuffer;
  indexBuffer?: WebGLBuffer;
  indexBufferLength?: number;
};

export function createObject3D<Attribute extends string, Uniform extends string>({
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

  const attributesLocations = attributesKeys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = gl.getAttribLocation(shaderProgram, `a_${key}`);

    return acc;
  }, {});

  const uniformsLocations = uniformsKeys.reduce<Record<string, WebGLUniformLocation>>((acc, key) => {
    acc[key] = getUniformLocation(gl, shaderProgram, `u_${key}`);

    return acc;
  }, {});

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

export type Vec4 = [number, number, number, number];

export function parseColorStringToVec4(color?: string): Vec4 {
  if (!color) {
    return [1, 1, 1, 0];
  }

  if (color === "transparent") {
    return [1, 1, 1, 0];
  }

  try {
    // If the color is a named color eg 'rebeccapurple'
    if ((color as string) in ColorName) {
      return [...colorConvert.keyword.rgb(color as NamedColor).map((c) => c / 255), 1.0] as Vec4;
    }

    const isHexColor = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
    // if the color is a hex color eg #ff00ff or #ff00ff00
    if (isHexColor?.length) {
      const hasAlphaChannel = Boolean(isHexColor[4]);

      return [...colorConvert.hex.rgb(color).map((c) => c / 255), hasAlphaChannel ? parseInt(isHexColor[4], 16) / 255 : 1.0] as Vec4;
    }

    // extracts the numbers from an RGB(A) or HSL(A) color string
    const colorAsArray = color.match(/(\d\.\d(\d+)?|\d{3}|\d{2}|\d{1})/gi) ?? ["0", "0", "0"];
    // If the color is an RGB(A) color eg rgb(255, 0, 255) or rgba(255, 0, 255, 0.5)
    if (color.includes("rgb")) {
      const hasAlphaChannel = color.includes("rgba");
      const rgbArray = [
        ...colorAsArray.map((c) => parseFloat(c)).map((c, i) => (i < 3 ? c / 255 : c)), // because alpha is in the range 0 - 1, not 0 - 255
      ];

      if (!hasAlphaChannel) {
        rgbArray.push(1.0);
      }

      return rgbArray as Vec4;
    }

    // If the color is an HSL(A) color eg hsl(300deg, 100%, 50%) or hsla(1.4rad, 100%, 50%, 0.5)
    if (color.includes("hsl")) {
      const hasAlphaChannel = color.includes("hsla");

      const usesRadians = color.includes("rad");

      const RGBArray = [
        ...colorConvert.hsl.rgb(
          colorAsArray.map((c, i) => {
            const number = parseFloat(c);
            if (usesRadians && i === 0) {
              // because not everyone uses degrees,
              // but color convert expects degrees.
              // The first entry is the hue angle
              return (number * 180) / Math.PI;
            }
            return number;
          }) as HSL,
        ),
        hasAlphaChannel ? parseFloat(colorAsArray[3]) : 1.0,
      ];

      return RGBArray as Vec4;
    }
  } catch (e) {}

  // Because we are not supporting HWB, HSV or CMYK at the moment.
  console.warn([`[parseColorStringToVec4]: Color ${color} is either not a valid color or its type is not supported, defaulting to black`]);
  return [0, 0, 0, 1.0];
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
