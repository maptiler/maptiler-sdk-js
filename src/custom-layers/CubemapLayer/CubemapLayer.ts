import type { CustomLayerInterface, CustomRenderMethodInput } from "maplibre-gl";
import { mat4 } from "gl-matrix";

import type { Map as MapSDK } from "../../Map";
import { createObject3D, type WebGLContext, type Object3D, parseColorStringToVec4, Vec4 } from "../../utils/webgl-utils";

import { VERTICES, INDICES } from "./constants";
import vertexShaderSource from "./cubemap.vert.glsl?raw";
import fragmentShaderSource from "./cubemap.frag.glsl?raw";
import { loadCubemapTexture } from "./loadCubemapTexture";
import type { CubemapDefinition, CubemapFaces, CubemapLayerConstructorOptions } from "./types";

const SPACE_IMAGES_BASE_URL = "api.maptiler.com/resources/space";

const ATTRIBUTES_KEYS = ["vertexPosition"] as const;
const UNIFORMS_KEYS = ["projectionMatrix", "modelViewMatrix", "cubeSampler", "bgColor", "fadeOpacity"] as const;

const GL_USE_TEXTURE_MACRO_MARKER = "%USE_TEXTURE_MACRO_MARKER%";
const GL_USE_TEXTURE_MACRO = "#define USE_TEXTURE";

const defaultConstructorOptions: CubemapLayerConstructorOptions = {
  color: "black",
  preset: "universe-dark",
};

class CubemapLayer implements CustomLayerInterface {
  public id: string = "Cubemap Layer";
  public type: CustomLayerInterface["type"] = "custom";
  public renderingMode: CustomLayerInterface["renderingMode"] = "3d";

  private map!: MapSDK;
  private faces?: CubemapFaces;
  private useCubemapTexture: boolean = true;
  private currentFadeOpacity: number = 0.0;
  private cubeMapNeedsUpdate: boolean = false;
  private bgColor: Vec4;
  private gl!: WebGLContext;

  private cubemap?: Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>;
  private texture?: WebGLTexture;

  constructor(cubemapConfig: CubemapLayerConstructorOptions | boolean) {
    const options =
      typeof cubemapConfig === "boolean"
        ? defaultConstructorOptions
        : {
            ...defaultConstructorOptions,
            ...cubemapConfig,
          };

    this.bgColor = parseColorStringToVec4(options.color);
    this.faces = getCubemapFaces(options as CubemapDefinition);
    this.useCubemapTexture = this.faces !== null;
  }

  public updateCubemap(): void {
    this.useCubemapTexture = this.faces !== null;

    const uniformsKeys = UNIFORMS_KEYS.filter((uniformKey) => {
      if (uniformKey === "cubeSampler") {
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

  public prerender(gl: WebGLContext, _options: CustomRenderMethodInput): void {
    if (this.cubeMapNeedsUpdate === true) {
      this.cubeMapNeedsUpdate = false;
      if (!this.useCubemapTexture) {
        return;
      }

      this.texture = loadCubemapTexture({
        gl,
        faces: this.faces,
        onLoadedCallback: () => {
          this.animateIn();
        },
      });
    }
  }

  private animateIn(): void {
    const animateIn = () => {
      if (this.currentFadeOpacity < 1.0) {
        requestAnimationFrame(animateIn);
        this.currentFadeOpacity += 0.05;
        this.map.triggerRepaint();
      }
    };
    requestAnimationFrame(animateIn);
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
     * Background color
     */
    gl.uniform4fv(this.cubemap.programInfo.uniformsLocations.bgColor, new Float32Array(this.bgColor));

    /**
     * Texture
     */
    if (this.useCubemapTexture) {
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

  public setCubemap(cubemap: CubemapDefinition): void {
    console.log("Setting cubemap", cubemap);
    this.faces = getCubemapFaces(cubemap);
    this.updateCubemap();
    this.cubeMapNeedsUpdate = true;
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

function getCubemapFaces(options: CubemapDefinition): CubemapFaces | undefined {
  if (options.faces) {
    return options.faces;
  }

  if (options.preset) {
    return {
      pX: `//${SPACE_IMAGES_BASE_URL}/${options.preset}/px.webp`,
      nX: `//${SPACE_IMAGES_BASE_URL}/${options.preset}/nx.webp`,
      pY: `//${SPACE_IMAGES_BASE_URL}/${options.preset}/py.webp`,
      nY: `//${SPACE_IMAGES_BASE_URL}/${options.preset}/ny.webp`,
      pZ: `//${SPACE_IMAGES_BASE_URL}/${options.preset}/pz.webp`,
      nZ: `//${SPACE_IMAGES_BASE_URL}/${options.preset}/nz.webp`,
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

  return;
}

export { CubemapLayer };
