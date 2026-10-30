vi.mock("../src/ImageViewer/cutline", async () => {
  const actual = await vi.importActual<typeof import("../src/ImageViewer/cutline")>("../src/ImageViewer/cutline");
  return {
    ...actual,
    triangulateOutsideCutline: vi.fn(actual.triangulateOutsideCutline),
  };
});

// the shaders are not compiled, the layer only needs the program and buffers to bind
vi.mock("../src/utils/webgl-utils", () => ({
  createObject3D: vi.fn(() => ({
    shaderProgram: { name: "program" },
    programInfo: {
      attributesLocations: { position: 0 },
      uniformsLocations: { matrix: { name: "matrix" }, color: { name: "color" }, imageRect: { name: "imageRect" } },
    },
    positionBuffer: { name: "positions" },
    indexBuffer: { name: "indices" },
    indexBufferLength: 0,
  })),
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CustomRenderMethodInput, Map as MapLibreMap } from "maplibre-gl";
import { OutsideCutlineLayer, type OutsideCutlineLayerData } from "../src/ImageViewer/OutsideCutlineLayer";
import { triangulateOutsideCutline, type ImageViewerCutline } from "../src/ImageViewer/cutline";

/** A WebGL context recording the calls the layer makes. */
function createGL() {
  return {
    ARRAY_BUFFER: "ARRAY_BUFFER",
    ELEMENT_ARRAY_BUFFER: "ELEMENT_ARRAY_BUFFER",
    DYNAMIC_DRAW: "DYNAMIC_DRAW",
    FLOAT: "FLOAT",
    TRIANGLES: "TRIANGLES",
    UNSIGNED_SHORT: "UNSIGNED_SHORT",
    DEPTH_TEST: "DEPTH_TEST",
    STENCIL_TEST: "STENCIL_TEST",
    BLEND: "BLEND",
    ONE: "ONE",
    ONE_MINUS_SRC_ALPHA: "ONE_MINUS_SRC_ALPHA",
    useProgram: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    uniform4fv: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    blendFunc: vi.fn(),
    drawElements: vi.fn(),
    deleteProgram: vi.fn(),
    deleteBuffer: vi.fn(),
  };
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
  color: [0, 0, 0, 0],
};

describe("OutsideCutlineLayer", () => {
  let gl: GL;
  let layer: OutsideCutlineLayer;

  function addLayer(layerData = data) {
    layer = new OutsideCutlineLayer(layerData);
    layer.onAdd({ getZoom: () => 0 } as unknown as MapLibreMap, gl as unknown as WebGL2RenderingContext);
  }

  function render() {
    layer.render(gl as unknown as WebGL2RenderingContext, renderOptions);
  }

  function getUploads(target: "ARRAY_BUFFER" | "ELEMENT_ARRAY_BUFFER") {
    return gl.bufferData.mock.calls.filter(([bufferTarget]) => bufferTarget === target).map(([, values]) => values as Float32Array | Uint16Array);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    gl = createGL();
  });

  it("does not triangulate when it is added, only when it is drawn", () => {
    addLayer();

    expect(triangulateOutsideCutline).not.toHaveBeenCalled();

    render();

    expect(triangulateOutsideCutline).toHaveBeenCalledTimes(1);
    expect(triangulateOutsideCutline).toHaveBeenCalledWith(square, [4096, 2048]);
  });

  it("triangulates the latest cutline once, however often it changed since the last frame", () => {
    addLayer();
    render();

    layer.setData({ cutline: triangle });
    layer.setData({ cutline: square });
    layer.setData({ cutline: triangle });

    expect(triangulateOutsideCutline).toHaveBeenCalledTimes(1);

    render();

    expect(triangulateOutsideCutline).toHaveBeenCalledTimes(2);
    expect(triangulateOutsideCutline).toHaveBeenLastCalledWith(triangle, [4096, 2048]);
  });

  it("does not triangulate again while nothing changes", () => {
    addLayer();
    render();
    render();
    render();

    expect(triangulateOutsideCutline).toHaveBeenCalledTimes(1);
    expect(getUploads("ARRAY_BUFFER")).toHaveLength(1);
    expect(gl.drawElements).toHaveBeenCalledTimes(3);
  });

  it("does not triangulate again when only the color changes", () => {
    addLayer();
    render();

    layer.setData({ color: [0, 0, 0, 0.5] });
    render();

    expect(triangulateOutsideCutline).toHaveBeenCalledTimes(1);
    expect(gl.uniform4fv).toHaveBeenCalledWith({ name: "color" }, [0, 0, 0, 0.5]);
  });

  it("does not triangulate again when given the same cutline and image, as the viewer does on a style change", () => {
    addLayer();
    render();

    layer.setData({ ...data, imageSize: [4096, 2048], color: [0, 0, 0, 0.5] });
    render();

    expect(triangulateOutsideCutline).toHaveBeenCalledTimes(1);
  });

  it("triangulates again when the image changes", () => {
    addLayer();
    render();

    layer.setData({ imageSize: [2048, 1024], paddedSize: 2048 });
    render();

    expect(triangulateOutsideCutline).toHaveBeenCalledTimes(2);
    expect(triangulateOutsideCutline).toHaveBeenLastCalledWith(square, [2048, 1024]);
  });

  it("uploads the triangles in mercator coordinates, and draws all of them", () => {
    addLayer();
    render();

    const { vertices, indices } = triangulateOutsideCutline(square, [4096, 2048]);
    const [positions] = getUploads("ARRAY_BUFFER");
    const [uploadedIndices] = getUploads("ELEMENT_ARRAY_BUFFER");

    expect(Array.from(positions)).toEqual(vertices.map((value) => Math.fround(value / 4096)));
    expect(Array.from(uploadedIndices)).toEqual(indices);
    expect(gl.drawElements).toHaveBeenCalledWith("TRIANGLES", indices.length, "UNSIGNED_SHORT", 0);
  });

  it("limits drawing to the image, in mercator coordinates", () => {
    addLayer({ ...data, color: [0, 0, 0, 0.5] });
    render();

    expect(gl.uniform4fv).toHaveBeenCalledWith({ name: "imageRect" }, [-0, -0, 1, 0.5]);
  });

  it("reaches one CSS pixel past the image when hidden, to cover the edges of the tiles", () => {
    addLayer();
    render();

    // at zoom 0 the world is 512 CSS pixels wide
    const margin = 1 / 512;
    expect(gl.uniform4fv).toHaveBeenCalledWith({ name: "imageRect" }, [-margin, -margin, 1 + margin, 0.5 + margin]);
  });

  it("erases without blending when hidden, and blends an overlay", () => {
    addLayer();
    render();

    expect(gl.disable).toHaveBeenCalledWith("BLEND");
    expect(gl.enable).not.toHaveBeenCalledWith("BLEND");

    layer.setData({ color: [0, 0, 0, 0.5] });
    render();

    expect(gl.enable).toHaveBeenCalledWith("BLEND");
    expect(gl.blendFunc).toHaveBeenCalledWith("ONE", "ONE_MINUS_SRC_ALPHA");
  });

  it("triangulates again after being removed and added back", () => {
    addLayer();
    render();

    layer.onRemove({} as MapLibreMap, gl as unknown as WebGL2RenderingContext);
    expect(gl.deleteProgram).toHaveBeenCalledWith({ name: "program" });

    render();
    expect(gl.drawElements).toHaveBeenCalledTimes(1);

    layer.onAdd({ getZoom: () => 0 } as unknown as MapLibreMap, gl as unknown as WebGL2RenderingContext);
    render();

    expect(triangulateOutsideCutline).toHaveBeenCalledTimes(2);
    expect(gl.drawElements).toHaveBeenCalledTimes(2);
  });
});
