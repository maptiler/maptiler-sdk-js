import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { mat4 } from "gl-matrix";

import type { Map as MapSDK } from "../../Map";
import { createObject3D, type WebGLContext, type Object3D, parseColorStringToVec4, Vec4 } from "../../utils/webgl-utils";

import { VERTICES, INDICES } from "./constants";
import vertexShaderSource from "./cubemap.vert.glsl?raw";
import fragmentShaderSource from "./cubemap.frag.glsl?raw";
import { loadCubemapTexture } from "./loadCubemapTexture";
import { cubemapPresets, type CubemapDefinition, type CubemapFaces, type CubemapLayerConstructorOptions } from "./types";
import { lerp, lerpVec4 } from "../../utils/math-utils";

const SPACE_IMAGES_BASE_URL = "https://api.maptiler.com/resources/space";

const ATTRIBUTES_KEYS = ["vertexPosition"] as const;
const UNIFORMS_KEYS = ["projectionMatrix", "modelViewMatrix", "cubeSampler", "bgColor", "fadeOpacity"] as const;

const GL_USE_TEXTURE_MACRO_MARKER = "%USE_TEXTURE_MACRO_MARKER%";
const GL_USE_TEXTURE_MACRO = "#define USE_TEXTURE";

const defaultConstructorOptions: CubemapLayerConstructorOptions = cubemapPresets.stars;

/**
 * Configures options for the CubemapLayer by merging defaults with provided options.
 *
 * @param inputOptions - Options to configure the cubemap layer. Can be a configuration object or `true` to use defaults.
 * @param defaults - Default configuration options to use as a base.
 * @returns The configured options with properly resolved properties.
 *
 * @remarks
 * The function applies the following priority rules:
 * 1. If `inputOptions` is `true`, returns the default options.
 * 2. If `inputOptions.faces` is defined, it takes precedence and `preset` is removed.
 * 3. If `inputOptions.path` is defined, it takes precedence over `preset`.
 * 4. If neither `faces` nor `path` is defined, the `preset` property is used and validated.
 *
 * @throws Error if an invalid preset name is provided.
 */
function configureOptions(inputOptions: CubemapLayerConstructorOptions | true, defaults: CubemapLayerConstructorOptions) {
  if (inputOptions === true) {
    return defaults;
  }

  const outputOptions = {
    ...defaults,
    ...inputOptions,
  };

  // if  input has faces defined, this takes precendence
  if (inputOptions.faces) {
    delete outputOptions.preset;
    return outputOptions as CubemapLayerConstructorOptions;
  }

  // - Use path if defined.
  // - Path takes precendence over preset.
  // - Because we would have returned faces if it was defined
  // we don't need to delete it
  if (inputOptions.path) {
    delete outputOptions.preset;
    return outputOptions as CubemapLayerConstructorOptions;
  }

  const presetName = inputOptions.preset!;

  // "Unnecessary conditional"
  // It _should_ be defined but we need to check anyway as the preset can come from an outside source
  const presetIsUndefined = presetName === undefined;

  if (!presetIsUndefined && !(presetName in cubemapPresets)) {
    throw new Error(`[CubemapLayer]: Invalid preset "${presetName}". Available presets: ${Object.keys(cubemapPresets).join(", ")}`);
  }

  // path / faces will not be defined at this point
  // so we don't need to delete them
  return {
    ...outputOptions,
    // this _could_ be nullish_
    color: outputOptions.color ?? cubemapPresets[presetName]?.color ?? "hsl(233,100%,92%)",
  } as CubemapLayerConstructorOptions;
}

class CubemapLayer implements CustomLayerInterface {
  public id: string = "Cubemap Layer";
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "3d";

  /**
   * The map instance to which this layer is added.
   * @type {MapSDK}
   * @private
   */
  private map!: MapSDK;
  /**
   * The cubemap faces definition, which can be either a preset, path, or explicit face URLs.
   * @type {CubemapFaces | null}
   * @remarks
   * This property is set during the initialization of the layer and can be updated later.
   * If no faces are defined, it will be `null`.
   */
  private faces?: CubemapFaces | null;
  /**
   * Indicates whether to use a cubemap texture for rendering.
   * @type {boolean}
   * @private
   * @default true
   */
  private useCubemapTexture: boolean = true;
  /**
   * The current opacity of the fade effect applied to the cubemap image texture, used for fading in and out.
   * @type {number}
   * @private
   * @default 0.0
   */
  private currentFadeOpacity: number = 0.0;
  /**
   * Indicates whether the cubemap needs to be updated, typically when the faces or texture changes.
   * @type {boolean}
   * @private
   * @default false
   */
  private cubeMapNeedsUpdate: boolean = false;
  /**
   * The background color of the cubemap layer, represented as a Vec4 (RGBA).
   * @type {Vec4}
   * @private
   */
  private bgColor: Vec4;

  /**
   * The previous background color used for transition animations.
   * @type {Vec4}
   * @private
   */
  private previousBgColor: Vec4 = [0, 0, 0, 0];
  /**
   * The target background color to which the layer will transition.
   * @type {Vec4}
   * @private
   */
  private targetBgColor: Vec4 = [0, 0, 0, 0];

  /**
   * The delta value used for transitioning the background color. 0 = start of transition, 1 = end of transition.
   * This value is incremented over time to create a smooth transition effect.
   * @type {number}
   * @private
   */
  private transitionDelta: number = 0.0;

  /**
   * The WebGL context used for rendering the cubemap layer.
   * @type {WebGLContext}
   * @private
   */
  private gl!: WebGLContext;

  /**
   * The cubemap object that contains the shader program, buffers and uniform locations for rendering.
   * @type {Object3D}
   * @private
   */
  private cubemap?: Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>;
  /**
   * The WebGL texture used for the cubemap, which is created from the defined faces.
   * This texture is used to render the cubemap in the scene.
   * @type {WebGLTexture | undefined}
   * @private
   */
  private texture?: WebGLTexture;

  /**
   * The key representing the current faces definition, used to diff / track changes in the cubemap faces.
   * @type {string}
   */
  public currentFacesDefinitionKey: string = "";

  /**
   * The configuration options for the cubemap layer.
   * @type {CubemapLayerConstructorOptions}
   * @private
   */
  private options: CubemapLayerConstructorOptions;

  /**
   * Creates a new instance of CubemapLayer
   *
   * @param {CubemapLayerConstructorOptions | true} cubemapConfig - Configuration options for the cubemap layer or `true` to use default options.
   * Can specify faces, preset, path, and color properties to configure the cubemap.
   *
   * @remarks You shouldn't have to use this class directly.
   * Instead, use the `Map.setHalo` method to create and add a halo layer to the map.
   * The constructor initializes the cubemap with the provided configuration.
   * It processes the faces definition, sets up background colors, and determines
   * whether to use a cubemap texture based on the provided options.
   */
  constructor(cubemapConfig: CubemapLayerConstructorOptions | true) {
    const options = configureOptions(cubemapConfig, defaultConstructorOptions);
    this.options = options;
    this.currentFacesDefinitionKey = JSON.stringify(options.faces ?? options.preset ?? options.path);

    this.bgColor = [0, 0, 0, 0];
    this.targetBgColor = parseColorStringToVec4(options.color);

    this.faces = getCubemapFaces(options as CubemapDefinition);
    this.useCubemapTexture = this.faces !== null;
  }

  /**
   * Updates the cubemap object with the current faces and shader configuration.
   * This method is called when the cubemap faces change or when the layer is initialized.
   * @returns {void}
   * @remarks
   * It creates a new Object3D instance with the specified vertex and fragment shaders,
   * attributes, and uniforms. The cubemap will be rendered using this configuration.
   */
  public updateCubemap(): void {
    this.useCubemapTexture = this.faces !== null;
    const uniformsKeys = UNIFORMS_KEYS.filter((uniformKey) => {
      if (uniformKey === "cubeSampler" || uniformKey === "fadeOpacity") {
        return this.useCubemapTexture;
      }

      return true;
    });

    this.cubemap = createObject3D({
      gl: this.gl,
      vertexShaderSource,
      // Because we only want to use the read the texture in gl if we're supposed to
      fragmentShaderSource: this.useCubemapTexture
        ? fragmentShaderSource.replace(GL_USE_TEXTURE_MACRO_MARKER, GL_USE_TEXTURE_MACRO)
        : fragmentShaderSource.replace(GL_USE_TEXTURE_MACRO_MARKER, ""),
      attributesKeys: ATTRIBUTES_KEYS,
      uniformsKeys,
      vertices: VERTICES,
      indices: INDICES,
    });

    this.cubeMapNeedsUpdate = true;

    this.animateColorChange();
  }

  /**
   * Called when the layer is added to the map.
   * Initializes the cubemap and sets up the WebGL context.
   *
   * @param {MapSDK} map - The map instance to which this layer is added.
   * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL context used for rendering.
   */
  public onAdd(map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;

    this.gl = gl;
    this.updateCubemap();
  }

  /**
   * Called when the layer is removed from the map.
   * Cleans up the cubemap resources and WebGL buffers.
   *
   * @param {MapSDK} _map - The map instance from which this layer is removed.
   * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL context used for rendering.
   */
  public onRemove(_map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    if (this.cubemap) {
      gl.deleteProgram(this.cubemap.shaderProgram);
      gl.deleteBuffer(this.cubemap.positionBuffer);
    }
  }

  /**
   * Updates the cubemap texture with the provided faces.
   * This method is called when the cubemap faces change or when the layer is initialized.
   *
   * @param {WebGLContext} gl - The WebGL context used for rendering.
   * @param {CubemapFaces} faces - The cubemap faces to be loaded into the texture.
   */
  public updateTexture(gl: WebGLContext, faces: CubemapFaces): void {
    if (this.cubeMapNeedsUpdate === true) {
      this.cubeMapNeedsUpdate = false;
      if (!this.useCubemapTexture) {
        return;
      }

      this.texture = loadCubemapTexture({
        gl,
        faces,
        onLoadedCallback: () => {
          this.animateIn();
        },
      });
    }
  }

  /**
   * Called before the layer is rendered.
   * Updates the cubemap texture with the current faces.
   *
   * @param {WebGLContext} gl - The WebGL context used for rendering.
   * @param {CustomRenderMethodInput} _options - Additional options for the render method.
   */
  public prerender(gl: WebGLContext, _options: CustomRenderMethodInput): void {
    if (this.faces) this.updateTexture(gl, this.faces!);
  }

  /**
   * Lerps the background color transition of the cubemap layer.
   * This method smoothly transitions the background color from the previous color to the target color.
   *
   * @private
   */
  private animateColorChange() {
    const animateColorChange = () => {
      if (this.transitionDelta < 1.0) {
        requestAnimationFrame(animateColorChange);
        this.bgColor = lerpVec4(this.previousBgColor, this.targetBgColor, this.transitionDelta);
        this.transitionDelta += 0.075;

        this.map.triggerRepaint();
      }
    };
    requestAnimationFrame(animateColorChange);
  }

  /**
   * Animates the cubemap image fading in.
   * This method gradually increases the opacity of the cubemap image to create a fade-in effect.
   *
   * @private
   */
  private imageIsAnimating: boolean = false;
  /**
   * The delta value used for the image fade-in animation.
   * This value is incremented over time to create a smooth fade-in effect.
   * @type {number}
   * @private
   */
  private imageFadeInDelta: number = 0.0;

  /**
   * Animates the cubemap image fading in.
   * This method gradually increases the opacity of the cubemap image to create a fade-in effect.
   * @private
   */
  private animateIn() {
    if (this.imageIsAnimating) {
      return;
    }

    const animateIn = () => {
      this.imageFadeInDelta = Math.min(this.imageFadeInDelta + 0.05, 1.0);
      this.currentFadeOpacity = lerp(0.0, 1.0, this.imageFadeInDelta);
      this.map.triggerRepaint();

      if (this.imageFadeInDelta < 1.0) {
        this.imageIsAnimating = true;
        requestAnimationFrame(animateIn);
        return;
      }
      this.imageIsAnimating = false;
      this.imageFadeInDelta = 0.0;
      return;
    };

    requestAnimationFrame(animateIn);
  }

  /**
   * Animates the cubemap image fading out.
   * This method gradually decreases the opacity of the cubemap image to create a fade-out effect.
   * @returns {Promise<void>} A promise that resolves when the animation is complete.
   * @private
   */
  private animateOut(): Promise<void> {
    if (this.imageIsAnimating) {
      return Promise.resolve(); // If already animating, just resolve
    }
    return new Promise((resolve) => {
      const animateOut = () => {
        this.imageFadeInDelta = Math.min(this.imageFadeInDelta + 0.05, 1.0);
        this.currentFadeOpacity = lerp(1.0, 0.0, this.imageFadeInDelta);
        this.map.triggerRepaint();
        if (this.imageFadeInDelta >= 1.0) {
          this.imageIsAnimating = false;
          this.imageFadeInDelta = 0.0;
          resolve();
          return;
        }
        requestAnimationFrame(animateOut);
      };

      requestAnimationFrame(animateOut);
    });
  }

  /**
   * Renders the cubemap layer to the WebGL context.
   * This method is called internally during the rendering phase of the map.
   *
   * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL context used for rendering.
   * @param {CustomRenderMethodInput} _options - Additional options for the render method.
   * @throws Error if the map, cubemap, or texture is undefined.
   */
  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, _options: CustomRenderMethodInput): void {
    if (this.map === undefined) {
      throw new Error("[CubemapLayer]: Map is undefined");
    }

    if (this.cubemap === undefined) {
      throw new Error("[CubemapLayer]: Cubemap is undefined");
    }

    if (this.texture === undefined) {
      console.warn("[CubemapLayer]: Texture is undefined, no texture will be rendered to cubemap");
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);

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
     * Background color
     */
    gl.uniform4fv(this.cubemap.programInfo.uniformsLocations.bgColor, new Float32Array(this.bgColor));

    gl.uniform1f(this.cubemap.programInfo.uniformsLocations.fadeOpacity, this.currentFadeOpacity);


    if (this.useCubemapTexture && this.texture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
      gl.uniform1i(this.cubemap.programInfo.uniformsLocations.cubeSampler, 0);
    }
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

  private setBgColor(color: Vec4): void {
    this.targetBgColor = color;
    this.previousBgColor = this.bgColor;
    this.transitionDelta = 0.0;
  }

  /**
   * Returns the current configuration options for the cubemap layer.
   * @returns {CubemapLayerConstructorOptions} The current configuration options.
   */
  public getConfig() {
    return this.options;
  }

  private async setCubemapFaces(cubemap: CubemapDefinition): Promise<void> {
    await this.animateOut();

    if (!cubemap.faces && !cubemap.preset && !cubemap.path) {
      this.faces = null;
      this.useCubemapTexture = false;
      this.currentFacesDefinitionKey = "";
      this.animateIn();
      return;
    }

    this.faces = getCubemapFaces(cubemap);
    this.currentFacesDefinitionKey = JSON.stringify(cubemap.faces ?? cubemap.preset ?? cubemap.path);
  }

  /**
   * Sets the cubemap for the layer based on the provided definition.
   * This method updates the cubemap faces, background color, and triggers a repaint of the map.
   *
   * @param {CubemapDefinition} cubemap - The cubemap definition containing faces, preset, path, or color.
   * @returns {Promise<void>} A promise that resolves when the cubemap is set and the map is updated.
   * @remarks
   * This method checks if the provided cubemap definition has a color, and if so, it updates the background color.
   * It also checks if the faces definition has changed compared to the current one,
   * and if so, it updates the cubemap faces.
   * Finally, it calls `updateCubemap` to apply the changes and trigger a repaint of the map.
   */
  public async setCubemap(cubemap: CubemapDefinition): Promise<void> {
    this.options = cubemap;

    const facesKey = JSON.stringify(cubemap.faces ?? cubemap.preset ?? cubemap.path);

    if (this.currentFacesDefinitionKey !== facesKey) {
      await this.setCubemapFaces(cubemap);
    }

    const color = parseColorStringToVec4(cubemap.color);

    if (cubemap.color && this.targetBgColor.toString() !== color.toString()) {
      this.setBgColor(color);
    } else if (cubemap.preset && cubemap.preset in cubemapPresets) {
      const preset = cubemapPresets[cubemap.preset];
      this.setBgColor(parseColorStringToVec4(preset.color));
    }

    this.updateCubemap();
  }

  /**
   * Shows the cubemap layer by setting its visibility to "visible".
   * This method is used to make the cubemap layer visible on the map.
   */
  public show(): void {
    // TODO in future we can ease / animate this
    this.map.setLayoutProperty(this.id, "visibility", "visible");
  }

  /**
   * Hides the cubemap layer by setting its visibility to "none".
   * This method is used to remove the cubemap layer from the map without deleting it.
   */
  public hide(): void {
    // TODO in future we can ease / animate this
    this.map.setLayoutProperty(this.id, "visibility", "none");
  }
}

/**
 * Retrieves the cubemap faces based on the provided options.
 * This function checks if the faces are explicitly defined, uses a preset, or constructs the faces from a path.
 *
 * @param {CubemapDefinition} options - The cubemap definition containing faces, preset, or path.
 * @returns {CubemapFaces | null} The cubemap faces object containing URLs for each face, or null if no faces are defined.
 * @remarks
 * - If `options.faces` is defined, it returns the provided faces.
 * - If `options.preset` is defined, it constructs the faces URLs based on the preset name.
 * - If `options.path` is defined, it constructs the faces URLs based on the base URL and format.
 * - If none of the above are defined, it returns null.
 * @throws Error if an invalid preset name is provided.
 */
function getCubemapFaces(options: CubemapDefinition): CubemapFaces | null {
  if (options.faces) {
    return options.faces;
  }

  if (options.preset) {
    return {
      pX: `${SPACE_IMAGES_BASE_URL}/${options.preset}/px.webp`,
      nX: `${SPACE_IMAGES_BASE_URL}/${options.preset}/nx.webp`,
      pY: `${SPACE_IMAGES_BASE_URL}/${options.preset}/py.webp`,
      nY: `${SPACE_IMAGES_BASE_URL}/${options.preset}/ny.webp`,
      pZ: `${SPACE_IMAGES_BASE_URL}/${options.preset}/pz.webp`,
      nZ: `${SPACE_IMAGES_BASE_URL}/${options.preset}/nz.webp`,
    };
  }

  if (options.path) {
    const baseUrl = options.path.baseUrl;
    const format = options.path.format ?? "png";

    return {
      pX: `${baseUrl}/px.${format}`,
      nX: `${baseUrl}/nx.${format}`,
      pY: `${baseUrl}/py.${format}`,
      nY: `${baseUrl}/ny.${format}`,
      pZ: `${baseUrl}/pz.${format}`,
      nZ: `${baseUrl}/nz.${format}`,
    };
  }

  return null;
}

export { CubemapLayer };
