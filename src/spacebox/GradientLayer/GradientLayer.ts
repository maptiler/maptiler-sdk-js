import type { Map as MapSDK } from "../../Map";
import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";

import { createGradientPlane } from "./GradientPlane";
import type { GradientDefinition, GradientPlaneObject3D } from "./types";
import { getAntipode } from "./utils";

type Props = {
  gradient: GradientDefinition;
};

class GradientLayer implements CustomLayerInterface {
  public id: string = "gradient-layer";
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "2d";

  private map?: MapSDK;
  private gradient: GradientDefinition;
  private gradientPlane?: GradientPlaneObject3D;

  constructor({ gradient }: Props) {
    this.gradient = gradient;
  }

  public onAdd(map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.gradientPlane = createGradientPlane(gl);
  }

  public onRemove(_map: MapSDK, _gl: WebGLRenderingContext | WebGL2RenderingContext): void {}

  public prerender(_gl: WebGLRenderingContext | WebGL2RenderingContext, _options: CustomRenderMethodInput): void {}

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, _options?: CustomRenderMethodInput): void {
    if (this.map === undefined) {
      throw new Error("Map is not initialized");
    }

    if (this.gradientPlane === undefined) {
      throw new Error("Gradient plane is undefined");
    }

    gl.useProgram(this.gradientPlane.shaderProgram);

    /**
     * Gradient type: 0 - linear, 1 - radial
     */
    const gradientType = this.gradient.type === "radial" ? 1 : 0;
    gl.uniform1i(this.gradientPlane.programInfo.uniformsLocations.gradientType, gradientType);
    /* *** */

    /**
     * Gradient stops and colors
     */
    const gradient = this.gradient.stops;
    const stops = gradient.map((item) => item[0]);
    const colors = gradient.map((item) => item[1]);
    gl.uniform1i(this.gradientPlane.programInfo.uniformsLocations.stopsNumber, stops.length);
    gl.uniform1fv(this.gradientPlane.programInfo.uniformsLocations.stops, new Float32Array(stops));

    const flatColors = colors.reduce((acc, item) => acc.concat(item), [] as Array<number>);
    gl.uniform4fv(this.gradientPlane.programInfo.uniformsLocations.colors, new Float32Array(flatColors));
    /* *** */

    /**
     * Aspect ratio
     */
    const canvas = this.map.getCanvas();
    const aspect = canvas.width / canvas.height;
    gl.uniform1f(this.gradientPlane.programInfo.uniformsLocations.aspect, aspect);

    /**
     * Radial only
     */
    if (this.gradient.type === "radial") {
      // Radius
      gl.uniform1f(this.gradientPlane.programInfo.uniformsLocations.radius, this.gradient.radius);
      //

      // Center of gradient following the globe center
      const center = this.map.getCenter();
      const centerInPixels = this.map.project(center);

      const antipode = getAntipode(center);
      const antipodeInPixels = this.map.project(antipode);
      const yDifferece = Math.abs(centerInPixels.y - antipodeInPixels.y);

      const pixelRatio = this.map.getPixelRatio();
      const midpoint = {
        x: centerInPixels.x * pixelRatio,
        y: (centerInPixels.y * pixelRatio + antipodeInPixels.y * pixelRatio * (1 + yDifferece * 0.0001)) / 2,
      };
      const normalizedMidpoint = [midpoint.x / canvas.width, 1 - midpoint.y / canvas.height];

      gl.uniform2fv(this.gradientPlane.programInfo.uniformsLocations.center, new Float32Array(normalizedMidpoint));
      //
    }
    /* *** */

    /**
     * Geometry
     */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.gradientPlane.positionBuffer);
    gl.vertexAttribPointer(this.gradientPlane.programInfo.attributesLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.gradientPlane.programInfo.attributesLocations.vertexPosition);
    /* *** */

    /**
     * Draw
     */
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    /* *** */
  }
}

export { GradientLayer };
