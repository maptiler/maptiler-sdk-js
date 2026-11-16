import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import type { Map as MapSDK } from "../Map";
import { createObject3D, type Object3D } from "../utils/webgl-utils";
import type { ImageViewerCutline } from "./cutline";

import vertexShaderSource from "./outsideCutline.vert.glsl?raw";
import fragmentShaderSource from "./outsideCutline.frag.glsl?raw";

const ATTRIBUTES_KEYS = ["position"] as const;
const UNIFORMS_KEYS = ["matrix", "color"] as const;

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
  /** The premultiplied color to draw over the image with, or `null` to hide the image. */
  color: [number, number, number, number] | null;
};

/**
 * A custom layer, drawn right above the image, that hides the image outside of the cutline or draws a color over it.
 * It is managed by the ImageViewer, see `ImageViewer.setCutline`.
 *
 * The cutline is not triangulated. The layer marks the inside of the cutline in the stencil buffer by drawing it
 * as a fan of triangles from its first point, each of them flipping the pixels it covers: the pixels inside
 * the cutline end up flipped an odd number of times, whatever its shape. It then draws over the image
 * where the pixels are not marked.
 *
 * @internal
 */
export class OutsideCutlineLayer implements CustomLayerInterface {
  public id = OUTSIDE_CUTLINE_LAYER_ID;
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "2d";

  private data: OutsideCutlineLayerData;

  private map?: MapSDK;

  /** The program, and the cutline in its position buffer. */
  private mesh?: Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>;

  /** The rectangle of the image, drawn over where the cutline is not. */
  private imageRectBuffer?: WebGLBuffer;

  /**
   * Whether the cutline changed since it was last uploaded. It is uploaded on the next render
   * rather than on every change, so a cutline changed several times within a frame,
   * e.g. while it is dragged, is only uploaded once.
   */
  private geometryNeedsUpdate = true;

  constructor(data: OutsideCutlineLayerData) {
    this.data = data;
  }

  /**
   * Updates what the layer draws. The map has to be repainted afterwards, the cutline is uploaded then.
   *
   * @param {Partial<OutsideCutlineLayerData>} data - The data to update.
   */
  public setData(data: Partial<OutsideCutlineLayerData>) {
    // the viewer passes all the data on every change, so the geometry is compared to only upload it when it changed
    const { cutline, paddedSize } = this.data;
    if ((data.cutline !== undefined && data.cutline !== cutline) || (data.paddedSize !== undefined && data.paddedSize !== paddedSize)) {
      this.geometryNeedsUpdate = true;
    }

    this.data = { ...this.data, ...data };
  }

  public onAdd(map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.mesh = createObject3D({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      attributesKeys: ATTRIBUTES_KEYS,
      uniformsKeys: UNIFORMS_KEYS,
      // filled on the first render
      vertices: [],
    });
    this.imageRectBuffer = gl.createBuffer();
    this.geometryNeedsUpdate = true;
  }

  public onRemove(_map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    if (this.mesh) {
      gl.deleteProgram(this.mesh.shaderProgram);
      gl.deleteBuffer(this.mesh.positionBuffer);
    }
    if (this.imageRectBuffer) {
      gl.deleteBuffer(this.imageRectBuffer);
    }

    this.mesh = undefined;
    this.imageRectBuffer = undefined;
    this.map = undefined;
  }

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, options: CustomRenderMethodInput): void {
    if (!this.map || !this.mesh || !this.imageRectBuffer) {
      return;
    }

    if (this.geometryNeedsUpdate) {
      this.uploadCutline(gl, this.mesh);
      this.geometryNeedsUpdate = false;
    }

    const { shaderProgram, programInfo, positionBuffer } = this.mesh;
    const { cutline, color, imageSize, paddedSize } = this.data;
    const isHidden = color === null;

    // The tiles end on the edge of the image, and are not rasterized exactly like this layer,
    // which can leave some of their pixels on that edge. Hiding the image reaches one CSS pixel
    // further to cover them, there is nothing beyond to hide. An overlay stops at the edge.
    const margin = isHidden ? 1 / (WORLD_SIZE_AT_ZOOM_0 * 2 ** this.map.getZoom()) : 0;
    const [left, top, right, bottom] = [-margin, -margin, imageSize[0] / paddedSize + margin, imageSize[1] / paddedSize + margin];

    gl.useProgram(shaderProgram);
    gl.uniformMatrix4fv(programInfo.uniformsLocations.matrix, false, options.defaultProjectionData.mainMatrix);
    // hiding draws transparent pixels without blending, which erases the image
    gl.uniform4fv(programInfo.uniformsLocations.color, color ?? [0, 0, 0, 0]);
    gl.enableVertexAttribArray(programInfo.attributesLocations.position);

    // MapLibre resets the GL state it changed after custom layers.
    // Its depth test is kept: opaque layers above, e.g. a drawing, are drawn before this one, which must not draw over them
    gl.enable(gl.STENCIL_TEST);
    gl.stencilMask(0xff);
    gl.clearStencil(0);
    gl.clear(gl.STENCIL_BUFFER_BIT);

    // marks the inside of the cutline, without drawing it
    gl.colorMask(false, false, false, false);
    gl.stencilFunc(gl.ALWAYS, 0, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(programInfo.attributesLocations.position, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, cutline.length);

    // draws over the image where it is not marked
    gl.colorMask(true, true, true, true);
    gl.stencilFunc(gl.EQUAL, 0, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    if (isHidden) {
      // writes transparent pixels over the image instead of blending with it, which would leave it untouched
      gl.disable(gl.BLEND);
    } else {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.imageRectBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([left, top, right, top, right, bottom, left, bottom]), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(programInfo.attributesLocations.position, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // MapLibre keeps the tile clipping masks it drew in the stencil buffer for the next layers of the same source.
    // They are gone now, so it has to draw them again for the next layer that needs them
    gl.clear(gl.STENCIL_BUFFER_BIT);
    (this.map.painter as { currentStencilSource?: string }).currentStencilSource = undefined;
  }

  /**
   * Uploads the cutline, in the mercator coordinates of the image source.
   */
  private uploadCutline(gl: WebGLRenderingContext | WebGL2RenderingContext, mesh: NonNullable<typeof this.mesh>) {
    const { cutline, paddedSize } = this.data;

    // image pixels to the mercator coordinates of the image source, as `ImageViewer.pxToLngLat` does
    const positions = new Float32Array(cutline.length * 2);
    for (let i = 0; i < cutline.length; i++) {
      positions[i * 2] = cutline[i][0] / paddedSize;
      positions[i * 2 + 1] = cutline[i][1] / paddedSize;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
  }
}
