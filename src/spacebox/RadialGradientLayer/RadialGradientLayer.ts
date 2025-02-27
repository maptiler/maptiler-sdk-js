import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { mat4, vec3 } from "gl-matrix";

import type { Map as MapSDK } from "../../Map";
import { createObject3D, type Object3D } from "../../utils/webgl-utils";

import vertexShaderSource from "./radialGradient.vert.glsl?raw";
import fragmentShaderSource from "./radialGradient.frag.glsl?raw";
import type { GradientDefinition } from "./types";

type Props = {
  gradient: GradientDefinition;
};

const ATTRIBUTES_KEYS = ["position"] as const;
const UNIFORMS_KEYS = ["matrix", "rotationMatrix", "stopsNumber", "stops", "colors", "maxDistance"] as const;
const VERTICES = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];

class RadialGradientLayer implements CustomLayerInterface {
  public id: string = "gradient-layer";
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "3d";

  private gradient: GradientDefinition;

  private map?: MapSDK;
  private plane?: Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>;

  constructor({ gradient }: Props) {
    this.gradient = gradient;
  }

  public onAdd(map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.plane = createObject3D({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      attributesKeys: ATTRIBUTES_KEYS,
      uniformsKeys: UNIFORMS_KEYS,
      vertices: VERTICES,
    });
  }

  public onRemove(_map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    if (this.plane !== undefined) {
      gl.deleteProgram(this.plane.shaderProgram);
      gl.deleteBuffer(this.plane.positionBuffer);
    }
  }

  public prerender(_gl: WebGLRenderingContext | WebGL2RenderingContext, _options: CustomRenderMethodInput): void {}

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, options: CustomRenderMethodInput): void {
    if (this.map === undefined) {
      throw new Error("Map is undefined");
    }

    if (this.plane === undefined) {
      throw new Error("Plane is undefined");
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFuncSeparate(gl.SRC_COLOR, gl.ONE_MINUS_SRC_COLOR, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.DST_ALPHA);

    // Left here for future experiments
    // gl.blendEquation(gl.FUNC_ADD);
    // gl.blendEquation(gl.FUNC_SUBTRACT);
    // gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);

    gl.useProgram(this.plane.shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.plane.positionBuffer);

    const positionLocation = this.plane.programInfo.attributesLocations.position;
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const scaleMatrix = mat4.create();
    const scale = this.gradient.scale + 1; // Since globe size is 1 we assume that the plane size is 2
    mat4.scale(scaleMatrix, scaleMatrix, [scale, scale, scale]);

    const matrix = mat4.create();
    mat4.multiply(matrix, options.defaultProjectionData.mainMatrix, scaleMatrix);

    const matrixLocation = this.plane.programInfo.uniformsLocations.matrix;
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    /**
     * Billboard
     */
    const rotationMatrix = mat4.create();
    const cameraPos = this.map.transform.cameraPosition;
    const forward = vec3.normalize(vec3.create(), cameraPos);
    const up = vec3.fromValues(0, 1, 0);
    const right = vec3.create();
    vec3.cross(right, up, forward);
    vec3.normalize(right, right);

    const billboardUp = vec3.create();
    vec3.cross(billboardUp, forward, right);
    vec3.normalize(billboardUp, billboardUp);

    /**
     * Rotation matrix
     *
     * Collumn 1: right
     * Collumn 2: up
     * Collumn 3: forward
     */
    mat4.set(
      rotationMatrix,
      right[0],
      right[1],
      right[2],
      0,
      billboardUp[0],
      billboardUp[1],
      billboardUp[2],
      0,
      forward[0],
      forward[1],
      forward[2],
      0,
      0,
      0,
      0,
      1,
    );

    const rotationMatrixLocation = this.plane.programInfo.uniformsLocations.rotationMatrix;
    gl.uniformMatrix4fv(rotationMatrixLocation, false, rotationMatrix);

    const stopsNumber = this.gradient.stops.length;
    const stopsArray = new Float32Array(stopsNumber);
    const colorsArray = new Float32Array(stopsNumber * 4);

    for (let i = 0; i < stopsNumber; i++) {
      if (i < stopsNumber) {
        stopsArray[i] = this.gradient.stops[i][0];

        const color = this.gradient.stops[i][1];
        colorsArray[i * 4 + 0] = color[0];
        colorsArray[i * 4 + 1] = color[1];
        colorsArray[i * 4 + 2] = color[2];
        colorsArray[i * 4 + 3] = color[3];
      } else {
        // Last stop is repeated to fill the array
        stopsArray[i] = this.gradient.stops[stopsNumber - 1][0];

        const color = this.gradient.stops[stopsNumber - 1][1];
        colorsArray[i * 4 + 0] = color[0];
        colorsArray[i * 4 + 1] = color[1];
        colorsArray[i * 4 + 2] = color[2];
        colorsArray[i * 4 + 3] = color[3];
      }
    }

    gl.uniform1i(this.plane.programInfo.uniformsLocations.stopsNumber, stopsNumber);
    gl.uniform1fv(this.plane.programInfo.uniformsLocations.stops, stopsArray);
    gl.uniform4fv(this.plane.programInfo.uniformsLocations.colors, colorsArray);
    gl.uniform1f(this.plane.programInfo.uniformsLocations.maxDistance, 1);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /**
   * Value settings methods
   */

  public setGradient(gradient: GradientDefinition): void {
    this.gradient = gradient;
  }

  /* *** */
}

export { RadialGradientLayer };
