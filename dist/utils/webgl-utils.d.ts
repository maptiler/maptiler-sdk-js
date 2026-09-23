export type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;
/**
 * Load a shader from a source string
 */
export declare function loadShader({ gl, type, source }: {
    gl: WebGLContext;
    type: GLenum;
    source: string;
}): WebGLShader;
/**
 * Create a set of shaders (vertex and fragment) and link them into a program
 *
 * @param gl WebGL context
 * @param vertexShaderSource Vertex shader source code
 * @param fragmentShaderSource Fragment shader source code
 *
 * @returns WebGL program
 */
export declare function createShaderProgram({ gl, vertexShaderSource, fragmentShaderSource }: {
    gl: WebGLContext;
    vertexShaderSource: string;
    fragmentShaderSource: string;
}): WebGLProgram;
/**
 * null-free version of getUniformLocation
 */
export declare function getUniformLocation(gl: WebGLRenderingContext | WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation;
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
export declare function createObject3D<Attribute extends string, Uniform extends string>({ gl, vertexShaderSource, fragmentShaderSource, attributesKeys, uniformsKeys, vertices, indices, }: {
    gl: WebGLContext;
    vertexShaderSource: string;
    fragmentShaderSource: string;
    attributesKeys: readonly Attribute[];
    uniformsKeys: readonly Uniform[];
    vertices: Array<number>;
    indices?: Array<number>;
}): Object3D<Attribute, Uniform>;
export type Vec4 = [number, number, number, number];
export declare function parseColorStringToVec4(color?: string): Vec4;
export declare function degreesToRadians(degrees: number): number;
