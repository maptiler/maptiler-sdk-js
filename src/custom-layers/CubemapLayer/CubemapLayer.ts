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

  if (!(presetName in cubemapPresets)) {
    throw new Error(`[CubemapLayer]: Invalid preset "${presetName}". Available presets: ${Object.keys(cubemapPresets).join(", ")}`);
  }

  // path / faces will not be defined at this point
  // so we don't need to delete them
  return outputOptions as CubemapLayerConstructorOptions;
}

class CubemapLayer implements CustomLayerInterface {
  public id: string = "Cubemap Layer";
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "3d";

  private map!: MapSDK;
  private faces?: CubemapFaces | null;
  private useCubemapTexture: boolean = true;
  private currentFadeOpacity: number = 0.0;
  private cubeMapNeedsUpdate: boolean = false;
  private bgColor: Vec4;

  private previousBgColor: Vec4 = [0, 0, 0, 0];
  private targetBgColor: Vec4 = [0, 0, 0, 0];

  private transitionDelta: number = 0.0;

  private gl!: WebGLContext;

  private cubemap?: Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>;
  private texture?: WebGLTexture;

  public currentFacesDefinitionKey: string = "";

  constructor(cubemapConfig: CubemapLayerConstructorOptions | true) {
    const options = configureOptions(cubemapConfig, defaultConstructorOptions);

    this.currentFacesDefinitionKey = JSON.stringify(options.faces ?? options.preset ?? options.path);

    this.bgColor = [0, 0, 0, 0];
    this.targetBgColor = parseColorStringToVec4(options.color);

    this.faces = getCubemapFaces(options as CubemapDefinition);
    this.useCubemapTexture = this.faces !== null;
  }

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

  public onAdd(map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.gl = gl;
    this.updateCubemap();
  }

  public onRemove(_map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    if (this.cubemap) {
      gl.deleteProgram(this.cubemap.shaderProgram);
      gl.deleteBuffer(this.cubemap.positionBuffer);
    }
  }

  updateTexture(gl: WebGLContext, faces: CubemapFaces): void {
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

  public prerender(gl: WebGLContext, _options: CustomRenderMethodInput): void {
    this.updateTexture(gl, this.faces!);
  }

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

  private imageIsAnimating: boolean = false;
  private imageFadeInDelta: number = 0.0;

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
    };

    requestAnimationFrame(animateIn);
  }

  private animateOut(): Promise<void> {
    if (this.imageIsAnimating) {
      return Promise.resolve(); // If already animating, just resolve
    }
    return new Promise((resolve) => {
      const animateIn = () => {
        this.imageFadeInDelta = Math.min(this.imageFadeInDelta + 0.05, 1.0);
        this.currentFadeOpacity = lerp(1.0, 0.0, this.imageFadeInDelta);
        this.map.triggerRepaint();

        if (this.imageFadeInDelta >= 1.0) {
          this.imageIsAnimating = false;
          this.imageFadeInDelta = 0.0;
          resolve();
          return;
        }
        requestAnimationFrame(animateIn);
      };

      requestAnimationFrame(animateIn);
    });
  }

  public render(gl: WebGLRenderingContext | WebGL2RenderingContext, _options: CustomRenderMethodInput): void {
    if (this.map === undefined) {
      throw new Error("[CubemapLayer]: Map is undefined");
    }

    if (this.cubemap === undefined) {
      throw new Error("[CubemapLayer]: Cubemap is undefined");
    }

    if (this.texture === undefined) {
      console.warn("[CubemapLayer]: Texture is undefined, no teture will be rendered to cubemap");
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

    /**
     * Texture
     */
    if (this.texture === undefined) {
      console.warn("[CubemapLayer]: Texture is undefined, no texture will be rendered to cubemap");
    }

    if (this.useCubemapTexture && this.texture) {
      gl.uniform1f(this.cubemap.programInfo.uniformsLocations.fadeOpacity, this.currentFadeOpacity);
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

  private async setCubemapFaces(cubemap: CubemapDefinition): Promise<void> {
    await this.animateOut();

    this.faces = getCubemapFaces(cubemap);
    this.currentFacesDefinitionKey = JSON.stringify(cubemap.faces ?? cubemap.preset ?? cubemap.path);
  }

  public async setCubemap(cubemap: CubemapDefinition): Promise<void> {
    const color = parseColorStringToVec4(cubemap.color);
    if (cubemap.color && this.targetBgColor.toString() !== color.toString()) {
      this.setBgColor(color);
    }

    const facesKey = JSON.stringify(cubemap.faces ?? cubemap.preset ?? cubemap.path);
    console.log(cubemap)
    if (facesKey && this.currentFacesDefinitionKey !== facesKey) {
      await this.setCubemapFaces(cubemap);
    }

    this.updateCubemap();
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
