// the shaders are not compiled, the layer only needs the program and the buffer to bind
vi.mock("../src/utils/webgl-utils", () => ({
  createObject3D: vi.fn(() => ({
    shaderProgram: { name: "program" },
    programInfo: {
      attributesLocations: { position: 0 },
      uniformsLocations: { matrix: { name: "matrix" }, color: { name: "color" } },
    },
    positionBuffer: { name: "cutline" },
  })),
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CustomRenderMethodInput } from "maplibre-gl";
import type { Map as MapSDK } from "../src/Map";
import { OutsideCutlineLayer, type OutsideCutlineLayerData } from "../src/ImageViewer/OutsideCutlineLayer";
import type { ImageViewerCutline } from "../src/ImageViewer/cutline";

type Buffer = { name: string };

/** A WebGL context recording the calls the layer makes, and which buffer each upload and draw uses. */
function createGL() {
  let boundBuffer: Buffer | undefined;

  const gl = {
    ARRAY_BUFFER: "ARRAY_BUFFER",
    DYNAMIC_DRAW: "DYNAMIC_DRAW",
    FLOAT: "FLOAT",
    TRIANGLE_FAN: "TRIANGLE_FAN",
    DEPTH_TEST: "DEPTH_TEST",
    STENCIL_TEST: "STENCIL_TEST",
    STENCIL_BUFFER_BIT: "STENCIL_BUFFER_BIT",
    BLEND: "BLEND",
    ONE: "ONE",
    ONE_MINUS_SRC_ALPHA: "ONE_MINUS_SRC_ALPHA",
    ALWAYS: "ALWAYS",
    EQUAL: "EQUAL",
    KEEP: "KEEP",
    INVERT: "INVERT",
    /** The uploads, by the buffer they went to. */
    uploads: [] as { buffer?: string; values: number[] }[],
    /** The draws, by the buffer they used. */
    draws: [] as { buffer?: string; mode: string; count: number }[],
    /** The order of the calls that set up and run the stencil passes. */
    log: [] as string[],
    createBuffer: vi.fn(() => ({ name: "imageRect" })),
    useProgram: vi.fn(),
    bindBuffer: vi.fn((_target: string, buffer: Buffer) => {
      boundBuffer = buffer;
    }),
    bufferData: vi.fn((_target: string, values: Float32Array) => {
      gl.uploads.push({ buffer: boundBuffer?.name, values: Array.from(values) });
    }),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    uniform4fv: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    blendFunc: vi.fn(),
    stencilMask: vi.fn(),
    clearStencil: vi.fn(),
    clear: vi.fn(() => gl.log.push("clear")),
    colorMask: vi.fn((...mask: boolean[]) => gl.log.push(`colorMask ${mask.join(",")}`)),
    stencilFunc: vi.fn((func: string) => gl.log.push(`stencilFunc ${func}`)),
    stencilOp: vi.fn((...ops: string[]) => gl.log.push(`stencilOp ${ops.join(",")}`)),
    drawArrays: vi.fn((mode: string, _first: number, count: number) => {
      gl.draws.push({ buffer: boundBuffer?.name, mode, count });
      gl.log.push(`draw ${String(boundBuffer?.name)}`);
    }),
    deleteProgram: vi.fn(),
    deleteBuffer: vi.fn(),
  };

  return gl;
}

type GL = ReturnType<typeof createGL>;

const renderOptions = { defaultProjectionData: { mainMatrix: new Float32Array(16) } } as unknown as CustomRenderMethodInput;

const square: ImageViewerCutline = [
  [256, 256],
  [3840, 256],
  [3840, 1792],
  [256, 1792],
];

const triangle: ImageViewerCutline = [
  [0, 0],
  [100, 0],
  [100, 100],
];

const data: OutsideCutlineLayerData = {
  cutline: square,
  imageSize: [4096, 2048],
  paddedSize: 4096,
  color: null,
};

describe("OutsideCutlineLayer", () => {
  let gl: GL;
  let map: { getZoom: () => number; painter: { currentStencilSource?: string } };
  let layer: OutsideCutlineLayer;

  function addLayer(layerData = data) {
    layer = new OutsideCutlineLayer(layerData);
    layer.onAdd(map as unknown as MapSDK, gl as unknown as WebGL2RenderingContext);
  }

  function render() {
    layer.render(gl as unknown as WebGL2RenderingContext, renderOptions);
  }

  function getUploads(buffer: "cutline" | "imageRect") {
    return gl.uploads.filter((upload) => upload.buffer === buffer).map(({ values }) => values);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    gl = createGL();
    map = { getZoom: () => 0, painter: { currentStencilSource: "image" } };
  });

  it("does not upload the cutline when it is added, only when it is drawn", () => {
    addLayer();

    expect(getUploads("cutline")).toHaveLength(0);

    render();

    expect(getUploads("cutline")).toHaveLength(1);
  });

  it("uploads the cutline in the mercator coordinates of the image source", () => {
    addLayer();
    render();

    expect(getUploads("cutline")[0]).toEqual(square.flat().map((value) => Math.fround(value / 4096)));
  });

  it("uploads the latest cutline once, however often it changed since the last frame", () => {
    addLayer();
    render();

    layer.setData({ cutline: triangle });
    layer.setData({ cutline: square });
    layer.setData({ cutline: triangle });

    expect(getUploads("cutline")).toHaveLength(1);

    render();

    expect(getUploads("cutline")).toHaveLength(2);
    expect(getUploads("cutline")[1]).toEqual(triangle.flat().map((value) => Math.fround(value / 4096)));
  });

  it("does not upload the cutline again while nothing changes, and draws it on every frame", () => {
    addLayer();
    render();
    render();
    render();

    expect(getUploads("cutline")).toHaveLength(1);
    expect(gl.draws.filter(({ buffer }) => buffer === "cutline")).toHaveLength(3);
  });

  it("does not upload the cutline again when given the same cutline and image, as the viewer does on a style change", () => {
    addLayer();
    render();

    layer.setData({ ...data, imageSize: [4096, 2048], color: [0, 0, 0, 0.5] });
    render();

    expect(getUploads("cutline")).toHaveLength(1);
    expect(gl.uniform4fv).toHaveBeenLastCalledWith({ name: "color" }, [0, 0, 0, 0.5]);
  });

  it("uploads the cutline again when the image is padded to another size", () => {
    addLayer();
    render();

    layer.setData({ imageSize: [2048, 1024], paddedSize: 2048 });
    render();

    expect(getUploads("cutline")).toHaveLength(2);
    expect(getUploads("cutline")[1]).toEqual(square.flat().map((value) => Math.fround(value / 2048)));
  });

  it("marks the inside of the cutline in the stencil buffer, then draws over the image where it is not marked", () => {
    addLayer();
    render();

    expect(gl.log).toEqual([
      // starts from an empty stencil buffer
      "clear",
      // flips the stencil of the pixels each triangle of the fan covers, without drawing them
      "colorMask false,false,false,false",
      "stencilFunc ALWAYS",
      "stencilOp KEEP,KEEP,INVERT",
      "draw cutline",
      // draws the rectangle of the image where the stencil was flipped an even number of times
      "colorMask true,true,true,true",
      "stencilFunc EQUAL",
      "stencilOp KEEP,KEEP,KEEP",
      "draw imageRect",
      "clear",
    ]);
    expect(gl.draws).toEqual([
      { buffer: "cutline", mode: "TRIANGLE_FAN", count: 4 },
      { buffer: "imageRect", mode: "TRIANGLE_FAN", count: 4 },
    ]);
    expect(gl.stencilFunc).toHaveBeenLastCalledWith("EQUAL", 0, 0xff);
  });

  it("keeps the depth test MapLibre sets, so it does not draw over the opaque layers above", () => {
    addLayer();
    render();

    expect(gl.disable).not.toHaveBeenCalledWith("DEPTH_TEST");
  });

  it("draws an overlay over the image, up to its edges, in mercator coordinates", () => {
    addLayer({ ...data, color: [0, 0, 0, 0.5] });
    render();

    expect(getUploads("imageRect")).toEqual([[-0, -0, 1, -0, 1, 0.5, -0, 0.5]]);
  });

  it("hides the image up to one CSS pixel past its edges, to cover the edges of the tiles", () => {
    addLayer();
    render();

    // at zoom 0 the world is 512 CSS pixels wide
    const m = Math.fround(1 / 512);
    const [right, bottom] = [Math.fround(1 + 1 / 512), Math.fround(0.5 + 1 / 512)];
    expect(getUploads("imageRect")).toEqual([[-m, -m, right, -m, right, bottom, -m, bottom]]);
  });

  it("erases without blending when hidden, and blends an overlay", () => {
    addLayer();
    render();

    expect(gl.disable).toHaveBeenCalledWith("BLEND");
    expect(gl.enable).not.toHaveBeenCalledWith("BLEND");
    expect(gl.uniform4fv).toHaveBeenLastCalledWith({ name: "color" }, [0, 0, 0, 0]);

    layer.setData({ color: [0, 0, 0, 0.5] });
    render();

    expect(gl.enable).toHaveBeenCalledWith("BLEND");
    expect(gl.blendFunc).toHaveBeenCalledWith("ONE", "ONE_MINUS_SRC_ALPHA");
  });

  it("blends a fully transparent overlay, which leaves the image as it is, rather than hiding it", () => {
    addLayer({ ...data, color: [0, 0, 0, 0] });
    render();

    expect(gl.enable).toHaveBeenCalledWith("BLEND");
    expect(gl.disable).not.toHaveBeenCalledWith("BLEND");
    // up to the edges of the image, as an overlay
    expect(getUploads("imageRect")).toEqual([[-0, -0, 1, -0, 1, 0.5, -0, 0.5]]);
  });

  it("clears the stencil buffer when done, and has MapLibre draw its tile clipping masks again", () => {
    addLayer();
    render();

    expect(gl.log.at(-1)).toBe("clear");
    expect(gl.clear).toHaveBeenLastCalledWith("STENCIL_BUFFER_BIT");
    expect(map.painter.currentStencilSource).toBeUndefined();
  });

  it("deletes its program and buffers when removed, and uploads the cutline again when added back", () => {
    addLayer();
    render();

    layer.onRemove(map as unknown as MapSDK, gl as unknown as WebGL2RenderingContext);
    expect(gl.deleteProgram).toHaveBeenCalledWith({ name: "program" });
    expect(gl.deleteBuffer).toHaveBeenCalledWith({ name: "cutline" });
    expect(gl.deleteBuffer).toHaveBeenCalledWith({ name: "imageRect" });

    render();
    expect(gl.draws).toHaveLength(2);

    layer.onAdd(map as unknown as MapSDK, gl as unknown as WebGL2RenderingContext);
    render();

    expect(getUploads("cutline")).toHaveLength(2);
    expect(gl.draws).toHaveLength(4);
  });
});
