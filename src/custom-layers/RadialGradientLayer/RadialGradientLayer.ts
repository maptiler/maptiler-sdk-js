import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { mat4, vec3 } from "gl-matrix";

import type { Map as MapSDK } from "../../Map";
import { createObject3D, parseColorStringToVec4, type Object3D } from "../../utils/webgl-utils";

import vertexShaderSource from "./radialGradient.vert.glsl?raw";
import fragmentShaderSource from "./radialGradient.frag.glsl?raw";
import type { GradientDefinition, RadialGradientLayerConstructorOptions } from "./types";
import { lerp } from "../../utils/math-utils";

const HALO_MAX_DISTANCE = 2;
// 1 = globe radius

const ATTRIBUTES_KEYS = ["position"] as const;
const UNIFORMS_KEYS = ["matrix", "rotationMatrix", "stopsNumber", "stops", "colors", "maxDistance", "scale"] as const;
const VERTICES = [
  -HALO_MAX_DISTANCE,
  -HALO_MAX_DISTANCE,
  0,
  HALO_MAX_DISTANCE,
  -HALO_MAX_DISTANCE,
  0,
  -HALO_MAX_DISTANCE,
  HALO_MAX_DISTANCE,
  0,
  HALO_MAX_DISTANCE,
  HALO_MAX_DISTANCE,
  0,
];

const defaultConstructorOptions: RadialGradientLayerConstructorOptions = {
  scale: 0.9,
  stops: [
    [0.0, "rgba(176, 208, 240, 1)"],
    [0.1, "rgba(98, 168, 229, 0.3)"],
    [0.2, "rgba(98, 168, 229, 0.0)"],
  ],
};

const DELTA_CHANGE = 0.06;

/**
 * A custom map layer that renders a radial gradient effect, typically used as a halo around a globe.
 * This layer uses WebGL for rendering and provides animation capabilities.
 *
 * The layer is implemented as a 3D custom layer that renders a billboard quad with a radial gradient shader.
 * The gradient can be configured with multiple color stops and can be animated.
 *
 * @example
 * ```typescript
 * // Create a simple halo layer with default settings
 * const haloLayer = new RadialGradientLayer(true);
 * map.addLayer(haloLayer);
 *
 * // Create a customized halo layer
 * const customHalo = new RadialGradientLayer({
 *   scale: 1.5,
 *   stops: [
 *     [0, "rgba(255, 255, 255, 0.8)"],
 *     [1, "rgba(255, 255, 255, 0)"]
 *   ]
 * });
 * map.addLayer(customHalo);
 * ```
 * @remarks You shouldn't have to use this class directly.
 * Instead, use the `Map.setHalo` method to create and add a halo layer to the map.
 */
export class RadialGradientLayer implements CustomLayerInterface {
  public id: string = "Halo Layer";
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "3d";

  /**
   * The gradient definition used by this layer.
   * It contains the stops and scale for the radial gradient.
   * @private
   * @type {GradientDefinition}
   */
  private gradient: GradientDefinition;
  /**
   * The scale of the radial gradient, which determines its size.
   * This value is animated from 0 to the target scale during the layer's appearance.
   * @private
   * @type {number}
   */
  private scale: number = 0.0;

  /**
   * The animation delta value used to control the progress of the gradient's appearance animation.
   * It is incremented during each frame of the animation until it reaches 1.
   * @private
   * @type {number}
   */
  private animationDelta: number = 0.0;

  /**
   * The MapSDK instance to which this layer is added.
   * This is set when the layer is added to the map.
   * @private
   * @type {MapSDK}
   */
  private map!: MapSDK;

  /**
   * The 3D object representing the radial gradient plane.
   * This object is created when the layer is added to the map and contains the shader program and buffers.
   * It is used for rendering the radial gradient effect.
   * @private
   * @type {Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>}
   */
  private plane?: Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>;

  /**
   * Whether the halo should be animated in and out.
   * @private
   * @type {boolean}
   */
  private animationActive: boolean = true;

  /**
   * Creates a new RadialGradientLayer instance.
   *
   * @param {RadialGradientLayerConstructorOptions | boolean} gradient - Configuration options for the radial gradient or a boolean value.
   * If a boolean is provided, default configuration options will be used.
   * If an `RadialGradientLayerConstructorOptions` is provided, it will be merged with default options.
   */
  constructor(gradient: RadialGradientLayerConstructorOptions | boolean) {
    if (typeof gradient === "boolean") {
      this.gradient = defaultConstructorOptions;
      return;
    }
    const errors = validateHaloSpecification(gradient);
    if (errors.length > 0) {
      throw new Error(`[RadialGradientLayer]: Invalid Halo specification:
 - ${errors.join("\n - ")}
    `);
    }

    this.gradient = {
      ...defaultConstructorOptions,
      ...gradient,
    };
  }

  /**
   * Adds the radial gradient layer to the specified map.
   * This method is called by the map when the layer is added to it.
   *
   * @param {MapSDK} map - The MapSDK instance to which this layer is being added
   * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL rendering context used for rendering the layer
   * @returns void
   */
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

    void this.animateIn();
  }

  /**
   * Returns the current gradient configuration of the radial gradient layer.
   *
   * @returns {GradientDefinition} The current gradient configuration.
   */
  public getConfig() {
    return this.gradient;
  }

  /**
   * Animates the radial gradient into view by gradually scaling from 0 to the target scale.
   *
   * This method uses requestAnimationFrame to create a smooth scaling animation effect.
   * During each frame, it:
   *   1. Interpolates the scale value between 0 and the target scale
   *   2. Increments the animation progress (animationDelta)
   *   3. Triggers a map repaint
   *
   * @private
   * @returns {Promise<void>} A promise that resolves when the animation completes
   */
  private async animateIn() {
    if (!this.animationActive) {
      this.scale = this.gradient.scale;
      this.animationDelta = 1;
      this.map.triggerRepaint();
      return;
    }

    return new Promise<void>((resolve) => {
      this.animationDelta = 0;
      const animate = () => {
        if (this.animationDelta < 1) {
          this.scale = lerp(0, this.gradient.scale, this.animationDelta);
          this.animationDelta += DELTA_CHANGE;
          this.map.triggerRepaint();
          requestAnimationFrame(animate);
          return;
        }
        resolve();
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Animates the radial gradient layer out by gradually reducing its scale to zero.
   *
   * This method creates a smooth transition effect by linearly interpolating the scale
   * from its current value to zero over multiple animation frames. During each frame,
   * the animation progresses by incrementing the internal animation delta value.
   *
   * The map is repainted after each animation step to reflect the updated scale.
   *
   * @private
   * @returns A Promise that resolves when the animation is complete.
   */
  private async animateOut() {
    if (!this.animationActive) {
      return;
    }

    this.animationDelta = 0;
    return new Promise<void>((resolve) => {
      const animate = () => {
        if (this.animationDelta < 1) {
          this.scale = lerp(this.gradient.scale, 0, this.animationDelta);
          this.animationDelta += DELTA_CHANGE;
          this.map.triggerRepaint();
          requestAnimationFrame(animate);
          return;
        }
        resolve();
      };
      animate();
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
      throw new Error("[RadialGradientLayer]: Map is undefined");
    }

    if (!this.map.isGlobeProjection()) {
      return;
    }

    if (this.plane === undefined) {
      throw new Error("[RadialGradientLayer]: Plane is undefined");
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    gl.useProgram(this.plane.shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.plane.positionBuffer);

    const positionLocation = this.plane.programInfo.attributesLocations.position;
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const scaleMatrix = mat4.create();

    // Since globe size is 1 we assume that the plane size is 2
    // This means that halo radius from origin is 3 * globe radius
    // and from the globe surface to end is 2 * globe radius
    const scale = this.scale;
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
    mat4.set(rotationMatrix, right[0], right[1], right[2], 0, billboardUp[0], billboardUp[1], billboardUp[2], 0, forward[0], forward[1], forward[2], 0, 0, 0, 0, 1);

    const rotationMatrixLocation = this.plane.programInfo.uniformsLocations.rotationMatrix;
    gl.uniformMatrix4fv(rotationMatrixLocation, false, rotationMatrix);

    const stopsNumber = this.gradient.stops.length;

    const stopsArray: Array<number> = [];
    const colorsArray: Array<number> = [];

    for (let i = 0; i <= stopsNumber; i++) {
      if (i < stopsNumber) {
        stopsArray[i] = this.gradient.stops[i][0];

        const color = parseColorStringToVec4(this.gradient.stops[i][1]);
        colorsArray.push(...color);
      }
    }

    gl.uniform1i(this.plane.programInfo.uniformsLocations.stopsNumber, stopsNumber);
    gl.uniform1fv(this.plane.programInfo.uniformsLocations.stops, new Float32Array(stopsArray));
    gl.uniform4fv(this.plane.programInfo.uniformsLocations.colors, new Float32Array(colorsArray));
    gl.uniform1f(this.plane.programInfo.uniformsLocations.maxDistance, HALO_MAX_DISTANCE);
    gl.uniform1f(this.plane.programInfo.uniformsLocations.scale, scale);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /**
   * Sets a new gradient for the radial gradient layer and animates the transition.
   *
   * This method first animates the current gradient out, then updates the gradient
   * property with the new gradient definition, and finally animates the new gradient in.
   *
   * @param {GradientDefinition} gradient - The new gradient definition to set for this layer.
   * @returns {Promise<void>} A promise that resolves when the new gradient is set and animated in.
   */
  public async setGradient(gradient: GradientDefinition | boolean): Promise<void> {
    if (gradient === false) {
      await this.animateOut();
      return;
    }

    await this.animateOut();

    const errors = validateHaloSpecification(gradient);
    if (errors.length > 0) {
      throw new Error(`[RadialGradientLayer]: Invalid Halo specification:
 - ${errors.join("\n - ")}
    `);
    }

    if (gradient === true) {
      this.gradient.scale = defaultConstructorOptions.scale;
      this.gradient.stops = defaultConstructorOptions.stops;
    } else {
      this.gradient.scale = gradient.scale ?? defaultConstructorOptions.scale;
      this.gradient.stops = gradient.stops ?? defaultConstructorOptions.stops;
    }

    await this.animateIn();
  }

  public setAnimationActive(active: boolean) {
    this.animationActive = active;
  }

  public show(): void {
    // TODO in future we can ease / animate this
    this.map.setLayoutProperty(this.id, "visibility", "visible");
  }

  public hide(): void {
    // TODO in future we can ease / animate this
    this.map.setLayoutProperty(this.id, "visibility", "none");
  }
}

const validKeys = ["scale", "stops"];

export function validateHaloSpecification(halo: RadialGradientLayerConstructorOptions | boolean): Array<string> {
  const errors: string[] = [];

  if (typeof halo === "boolean") {
    return [];
  }

  try {
    const additionalKeys = Object.keys(halo).filter((key) => !validKeys.includes(key));
    if (additionalKeys.length > 0) {
      errors.push(`Properties ${additionalKeys.map((key) => `\`${key}\``).join(", ")} are not supported.`);
    }
  } catch {
    errors.push("Halo specification is not an object.");
  }

  if (typeof halo.scale !== "number") {
    errors.push("Halo `scale` property is not a number.");
  }

  // this is testing external data so we need to check
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!halo.stops || halo.stops.length === 0) {
    errors.push("Halo `stops` property is not an array.");
  }

  // this is testing external data so we need to check
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (halo.stops?.some((stop) => typeof stop[0] !== "number" || typeof stop[1] !== "string")) {
    errors.push("Halo `stops` property is not an array of [number, string]");
  }

  return errors;
}
