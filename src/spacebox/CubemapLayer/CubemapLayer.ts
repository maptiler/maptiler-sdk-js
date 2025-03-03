import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { mat4 } from "gl-matrix";

import type { Map as MapSDK } from "../../Map";
import { createObject3D, type WebGLContext, type Object3D } from "../../utils/webgl-utils";

import { VERTICES, INDICES } from "./constants";
import vertexShaderSource from "./cubemap.vert.glsl?raw";
import fragmentShaderSource from "./cubemap.frag.glsl?raw";
import { loadCubemapTexture } from "./loadCubemapTexture";
import type { CubemapDefinition } from "./types";

type Props = {
  cubemap: CubemapDefinition;
};

const ATTRIBUTES_KEYS = ["vertexPosition"] as const;
const UNIFORMS_KEYS = [
  "projectionMatrix",
  "modelViewMatrix",
  "cubeSampler",
] as const;

class CubemapLayer implements CustomLayerInterface {
  public id: string = "cubemap-layer";
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "3d";

  private map?: MapSDK;
  private cubemapPath: string;
  private cubeMapNeedsUpdate: boolean = false;

  private cubemap?: Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>;
  private texture?: WebGLTexture;

  constructor({ cubemap }: Props) {
    this.cubemapPath = cubemap.path;
  }

  public onAdd(map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.cubemap = createObject3D({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      attributesKeys: ATTRIBUTES_KEYS,
      uniformsKeys: UNIFORMS_KEYS,
      vertices: VERTICES,
      indices: INDICES,
    });

    this.cubeMapNeedsUpdate = true;
  }

  public onRemove(_map: MapSDK, _gl: WebGLRenderingContext | WebGL2RenderingContext): void {}

  public prerender(gl: WebGLContext, _options: CustomRenderMethodInput): void {
    if (this.cubeMapNeedsUpdate === true) {
      this.cubeMapNeedsUpdate = false;

      this.texture = loadCubemapTexture({
        gl,
        path: this.cubemapPath,
        onLoadedCallback: () => {
          this.map?.triggerRepaint();
        },
      });
    }
  }

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, _options: CustomRenderMethodInput): void {
    if (this.map === undefined) {
      throw new Error("Map is undefined");
    }

    if (this.cubemap === undefined) {
      throw new Error("Cubemap is undefined");
    }

    if (this.texture === undefined) {
      throw new Error("Texture is undefined");
    }

    gl.useProgram(this.cubemap.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubemap.positionBuffer);
    gl.vertexAttribPointer(this.cubemap.programInfo.attributesLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.cubemap.programInfo.attributesLocations.vertexPosition);

    const near = 0.1;
    const far = 10000.0;
    const canvas = gl.canvas as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;

    const transform = this.map.transform;
    const fov = transform.fov * (Math.PI / 180);

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fov, aspect, near, far);

    mat4.rotateZ(projectionMatrix, projectionMatrix, transform.rollInRadians);
    mat4.rotateX(projectionMatrix, projectionMatrix, -transform.pitchInRadians);
    mat4.rotateZ(projectionMatrix, projectionMatrix, transform.bearingInRadians);

    const latRad = (transform.center.lat * Math.PI) / 180.0;
    const lngRad = (transform.center.lng * Math.PI) / 180.0;

    mat4.rotateX(projectionMatrix, projectionMatrix, latRad);
    mat4.rotateY(projectionMatrix, projectionMatrix, -lngRad);

    gl.uniformMatrix4fv(this.cubemap.programInfo.uniformsLocations.projectionMatrix, false, projectionMatrix);

    const modelViewMatrix = mat4.create();
    gl.uniformMatrix4fv(this.cubemap.programInfo.uniformsLocations.modelViewMatrix, false, modelViewMatrix);

    /**
     * Texture
     */
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    gl.uniform1i(this.cubemap.programInfo.uniformsLocations.cubeSampler, 0);
    /* *** */

    /**
     * Draw
     */
    if (this.cubemap.indexBuffer === undefined) {
      throw new Error("Index buffer is undefined");
    }

    if (this.cubemap.indexBufferLength === undefined) {
      throw new Error("Index buffer length is undefined");
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubemap.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.cubemap.indexBufferLength, gl.UNSIGNED_SHORT, 0);
    /* *** */
  }

  public setCubemap(cubemap: CubemapDefinition): void {
    this.cubemapPath = cubemap.path;
    this.cubeMapNeedsUpdate = true;
  }
}

export { CubemapLayer };
