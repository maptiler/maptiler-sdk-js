import type { CustomLayerInterface, CustomRenderMethodInput, Map as MapLibreMap } from "maplibre-gl";
import { createObject3D, type Object3D } from "../utils/webgl-utils";
import { triangulateOutsideCutline, type ImageViewerCutline } from "./cutline";

import vertexShaderSource from "./outsideCutline.vert.glsl?raw";
import fragmentShaderSource from "./outsideCutline.frag.glsl?raw";

const ATTRIBUTES_KEYS = ["position"] as const;
const UNIFORMS_KEYS = ["matrix", "color", "imageRect"] as const;

// the size of the world in CSS pixels at zoom 0, as MapLibre renders it
const WORLD_SIZE_AT_ZOOM_0 = 512;

export const OUTSIDE_CUTLINE_LAYER_ID = "image-outside-cutline";

/**
 * What the layer draws.
 *
 * @internal
 */
export type OutsideCutlineLayerData = {
  /** A valid cutline, in image pixels. */
  cutline: ImageViewerCutline;
  /** The width and height of the image, in image pixels. */
  imageSize: [number, number];
  /** The size the image is padded to, in image pixels. Dividing by it gives the mercator coordinates the image source uses. */
  paddedSize: number;
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

  private mesh?: Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>;

  /**
   * Whether the cutline or the image changed since the triangles were last uploaded.
   * They are rebuilt on the next render rather than on every change, so a cutline changed
   * several times within a frame, e.g. while it is dragged, is only triangulated once.
   */
  private geometryNeedsUpdate = true;

  constructor(data: OutsideCutlineLayerData) {
    this.data = data;
  }

  /**
   * Updates what the layer draws. The map has to be repainted afterwards, the triangles are rebuilt then.
   *
   * @param {Partial<OutsideCutlineLayerData>} data - The data to update.
   */
  public setData(data: Partial<OutsideCutlineLayerData>) {
    this.data = { ...this.data, ...data };

    if (data.cutline !== undefined || data.imageSize !== undefined || data.paddedSize !== undefined) {
      this.geometryNeedsUpdate = true;
    }
  }

  public onAdd(map: MapLibreMap, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.mesh = createObject3D({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      attributesKeys: ATTRIBUTES_KEYS,
      uniformsKeys: UNIFORMS_KEYS,
      // filled on the first render
      vertices: [],
      indices: [],
    });
    this.geometryNeedsUpdate = true;
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
  }

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, options: CustomRenderMethodInput): void {
    if (!this.map || !this.mesh?.indexBuffer) {
      return;
    }

    if (this.geometryNeedsUpdate) {
      this.uploadGeometry(gl, this.mesh);
      this.geometryNeedsUpdate = false;
    }

    const { shaderProgram, programInfo, positionBuffer, indexBuffer, indexBufferLength } = this.mesh;
    if (!indexBufferLength) {
      return;
    }

    const { color, imageSize, paddedSize } = this.data;
    const isHidden = color[3] === 0;

    // The tiles end on the edge of the image, and are not rasterized exactly like this layer,
    // which can leave some of their pixels on that edge. Hiding the image reaches one CSS pixel
    // further to cover them, there is nothing beyond to hide. An overlay stops at the edge.
    const margin = isHidden ? 1 / (WORLD_SIZE_AT_ZOOM_0 * 2 ** this.map.getZoom()) : 0;
    const imageRect = [-margin, -margin, imageSize[0] / paddedSize + margin, imageSize[1] / paddedSize + margin];

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

  /**
   * Triangulates the outside of the cutline and uploads the triangles.
   */
  private uploadGeometry(gl: WebGLRenderingContext | WebGL2RenderingContext, mesh: NonNullable<typeof this.mesh>) {
    const { cutline, imageSize, paddedSize } = this.data;
    const { vertices, indices } = triangulateOutsideCutline(cutline, imageSize);

    // image pixels to the mercator coordinates of the image source, as `ImageViewer.pxToLngLat` does
    const positions = new Float32Array(vertices.length);
    for (let i = 0; i < vertices.length; i++) {
      positions[i] = vertices[i] / paddedSize;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

    if (mesh.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);
    }
    mesh.indexBufferLength = indices.length;
  }
}
