import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { mat4 } from "gl-matrix";

import type { Map as MapSDK } from "../../Map";
import { createCubemap, loadCubemapTexture } from "./Cubemap";
import type { ChromaKeyDefinition, CubemapDefinition, CubemapObject3D } from "./types";

type Props = {
  cubemap: CubemapDefinition;
};

class CubemapLayer implements CustomLayerInterface {
  public id: string = "cubemap-layer";
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "3d";

  private map: MapSDK | null = null;
  private cubemapPath: string;
  private cubemapOpacity: number;
  private chromaKey?: ChromaKeyDefinition;

  private cubemap?: CubemapObject3D;
  private texture?: WebGLTexture;

  constructor({ cubemap }: Props) {
    this.cubemapPath = cubemap.path;
    this.cubemapOpacity = cubemap.opacity;
    this.chromaKey = cubemap.chromaKey;
  }

  public onAdd(map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.cubemap = createCubemap(gl);
    this.texture = loadCubemapTexture({
      gl,
      path: this.cubemapPath,
      onLoadedCallback: () => {
        this.map?.triggerRepaint();
      },
    });
  }

  public onRemove(_map: MapSDK, _gl: WebGLRenderingContext | WebGL2RenderingContext): void {}

  public prerender(_gl: WebGLRenderingContext | WebGL2RenderingContext, _options: CustomRenderMethodInput): void {}

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, _options: CustomRenderMethodInput): void {
    if (this.cubemap === undefined) {
      throw new Error("Cubemap is undefined");
    }

    if (this.texture === undefined) {
      throw new Error("Texture is undefined");
    }

    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(this.cubemap.shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubemap.positionBuffer);
    gl.vertexAttribPointer(this.cubemap.programInfo.attributesLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.cubemap.programInfo.attributesLocations.vertexPosition);

    const near = 0.1;
    const far = 10000.0;
    const canvas = gl.canvas as HTMLCanvasElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    if (!this.map) {
      throw new Error("Map is undefined");
    }
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
     * Chroma key
     */
    if (this.chromaKey !== undefined) {
      gl.uniform3fv(this.cubemap.programInfo.uniformsLocations.alphaColor, this.chromaKey.color);
      gl.uniform1f(this.cubemap.programInfo.uniformsLocations.alphaThreshold, this.chromaKey.threshold);
    }
    /* *** */

    /**
     * Global alpha
     */
    gl.uniform1f(this.cubemap.programInfo.uniformsLocations.alpha, this.cubemapOpacity);
    /* *** */

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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubemap.indexBuffer);
    gl.drawElements(gl.TRIANGLES, this.cubemap.indexBufferLength, gl.UNSIGNED_SHORT, 0);
    /* *** */
  }
}

export { CubemapLayer };
