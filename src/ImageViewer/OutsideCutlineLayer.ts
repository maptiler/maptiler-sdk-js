import type { CustomLayerInterface, CustomRenderMethodInput, Map as MapLibreMap } from "maplibre-gl";
import { createObject3D, type Object3D } from "../utils/webgl-utils";

import vertexShaderSource from "./outsideCutline.vert.glsl?raw";
import fragmentShaderSource from "./outsideCutline.frag.glsl?raw";

const ATTRIBUTES_KEYS = ["position"] as const;
const UNIFORMS_KEYS = ["matrix", "color", "imageRect"] as const;

// the size of the world in CSS pixels at zoom 0, as MapLibre renders it
const WORLD_SIZE_AT_ZOOM_0 = 512;

export const OUTSIDE_CUTLINE_LAYER_ID = "image-outside-cutline";

/**
 * What the layer draws. Coordinates are mercator coordinates, between 0 and 1, as the image source uses.
 *
 * @internal
 */
export type OutsideCutlineLayerData = {
  /** Flat `[x, y, ...]` vertices of the area outside of the cutline. */
  vertices: number[];
  /** The indices of the triangles of the area outside of the cutline. */
  indices: number[];
  /** minX, minY, maxX, maxY of the image. */
  imageRect: [number, number, number, number];
  /** The premultiplied color to draw with. Fully transparent erases the image, as blending is then disabled. */
  color: [number, number, number, number];
};

/**
 * A custom layer, drawn right above the image, that hides the image outside of the cutline or draws a color over it.
 * It is managed by the ImageViewer, see `ImageViewer.setCutline`.
 *
 * @internal
 */
export class OutsideCutlineLayer implements CustomLayerInterface {
  public id = OUTSIDE_CUTLINE_LAYER_ID;
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "2d";

  private data: OutsideCutlineLayerData;

  private map?: MapLibreMap;

  private gl?: WebGLRenderingContext | WebGL2RenderingContext;

  private mesh?: Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>;

  constructor(data: OutsideCutlineLayerData) {
    this.data = data;
  }

  /**
   * Updates what the layer draws. The map has to be repainted afterwards.
   *
   * @param {Partial<OutsideCutlineLayerData>} data - The data to update.
   */
  public setData(data: Partial<OutsideCutlineLayerData>) {
    const geometryChanged = data.vertices !== undefined || data.indices !== undefined;
    this.data = { ...this.data, ...data };

    if (geometryChanged && this.gl && this.mesh) {
      this.uploadGeometry(this.gl, this.mesh);
    }
  }

  public onAdd(map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.gl = gl;
    this.mesh = createObject3D({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      attributesKeys: ATTRIBUTES_KEYS,
      uniformsKeys: UNIFORMS_KEYS,
      vertices: this.data.vertices,
      indices: this.data.indices,
    });
  }

  public onRemove(_map: unknown, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    if (this.mesh) {
      gl.deleteProgram(this.mesh.shaderProgram);
      gl.deleteBuffer(this.mesh.positionBuffer);
      if (this.mesh.indexBuffer) {
        gl.deleteBuffer(this.mesh.indexBuffer);
      }
    }

    this.mesh = undefined;
    this.map = undefined;
    this.gl = undefined;
  }

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, options: CustomRenderMethodInput): void {
    if (!this.map || !this.mesh?.indexBuffer || !this.mesh.indexBufferLength) {
      return;
    }

    const { shaderProgram, programInfo, positionBuffer, indexBuffer, indexBufferLength } = this.mesh;
    const { color } = this.data;
    const isHidden = color[3] === 0;

    // The tiles end on the edge of the image, and are not rasterized exactly like this layer,
    // which can leave some of their pixels on that edge. Hiding the image reaches one CSS pixel
    // further to cover them, there is nothing beyond to hide. An overlay stops at the edge.
    const margin = isHidden ? 1 / (WORLD_SIZE_AT_ZOOM_0 * 2 ** this.map.getZoom()) : 0;
    const [minX, minY, maxX, maxY] = this.data.imageRect;
    const imageRect = [minX - margin, minY - margin, maxX + margin, maxY + margin];

    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(programInfo.attributesLocations.position);
    gl.vertexAttribPointer(programInfo.attributesLocations.position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.uniformMatrix4fv(programInfo.uniformsLocations.matrix, false, options.defaultProjectionData.mainMatrix);
    gl.uniform4fv(programInfo.uniformsLocations.color, color);
    gl.uniform4fv(programInfo.uniformsLocations.imageRect, imageRect);

    // MapLibre resets the GL state it changed after custom layers
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);

    if (isHidden) {
      // writes transparent pixels over the image instead of blending with it, which would leave it untouched
      gl.disable(gl.BLEND);
    } else {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }

    gl.drawElements(gl.TRIANGLES, indexBufferLength, gl.UNSIGNED_SHORT, 0);
  }

  private uploadGeometry(gl: WebGLRenderingContext | WebGL2RenderingContext, mesh: NonNullable<typeof this.mesh>) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.vertices), gl.STATIC_DRAW);

    if (mesh.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.data.indices), gl.STATIC_DRAW);
    }
    mesh.indexBufferLength = this.data.indices.length;
  }
}
