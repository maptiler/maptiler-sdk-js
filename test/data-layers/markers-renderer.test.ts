import { beforeEach, describe, expect, test, vi } from "vitest";
import { MarkerImages, buildMarkerLayers, resolveMarkersStyling } from "../../src/data-layers/PointLayer/markers-renderer";
import { getAdaptiveColors } from "../../src/Marker/marker-adaptive-colors";
import { drawMarkerCanvas } from "../../src/Marker/marker-canvas";
import { onLabelFontLoad } from "../../src/Marker/marker-text-fit";
import { createMockStyleMap, type MockStyleMap } from "./mock-style-map";

// canvas drawing has its own tests — here it only needs to hand back an image
vi.mock("../../src/Marker/marker-canvas", () => ({
  drawMarkerCanvas: vi.fn(() => ({
    canvas: { width: 2, height: 2, getContext: () => ({ getImageData: () => new ImageData(2, 2) }) },
    pixelRatio: 2,
    padding: 0,
  })),
}));

vi.mock("../../src/Marker/marker-text-fit", () => ({
  onLabelFontLoad: vi.fn(() => Promise.resolve()),
}));

describe("markers renderer", () => {
  //#region Styling

  describe("resolveMarkersStyling", () => {
    test("fills in the default shape, size and the style's adaptive colours", () => {
      const { marker } = resolveMarkersStyling({}, "streets-v2");
      const defaults = getAdaptiveColors("streets-v2", "maptiler");

      expect(marker).toMatchObject({ shape: "maptiler", size: "m", outerColor: defaults.outerColor, innerColor: defaults.innerColor });
    });

    test("keeps explicit colours, and resolves the rest per shape", () => {
      const { marker } = resolveMarkersStyling({ marker: { shape: "square", outerColor: "#123456" } }, "dataviz-dark");

      expect(marker.outerColor).toBe("#123456");
      expect(marker.innerColor).toBe(getAdaptiveColors("dataviz-dark", "square").innerColor);
    });
  });

  //#endregion

  //#region Layers

  describe("buildMarkerLayers", () => {
    const context = { layerId: "pl", sourceId: "pl-source", collisionBehaviour: "always-show" as const, imagePrefix: "pl-marker-1:" };

    function layout(label?: string | ["get", string]) {
      const [layer] = buildMarkerLayers(resolveMarkersStyling({ label }, undefined), context);
      return layer.layout as Record<string, unknown>;
    }

    test("requests the bare prefix when there's no label", () => {
      expect(layout()["icon-image"]).toBe("pl-marker-1:");
    });

    test("appends a property label to the image id", () => {
      expect(layout("name")["icon-image"]).toEqual(["concat", "pl-marker-1:", ["to-string", ["get", "name"]]]);
    });

    test("appends an expression label to the image id", () => {
      expect(layout(["get", "mag"])["icon-image"]).toEqual(["concat", "pl-marker-1:", ["to-string", ["get", "mag"]]]);
    });

    test("depth-sorts overlapping markers by screen y", () => {
      expect(layout()).toMatchObject({ "icon-allow-overlap": true, "icon-ignore-placement": true, "symbol-z-order": "viewport-y" });
    });

    test("offsets bottom-anchored shapes so the tip sits on the point, and centres the rest", () => {
      const offset = (shape: "maptiler" | "square") => {
        const [layer] = buildMarkerLayers(resolveMarkersStyling({ marker: { shape, size: "l" } }, undefined), context);
        return (layer.layout as Record<string, unknown>)["icon-offset"];
      };

      expect(offset("maptiler")).toEqual([0, -20]);
      expect(offset("square")).toEqual([0, 0]);
    });

    test("applies opacity through the layer, not the image", () => {
      const [layer] = buildMarkerLayers(resolveMarkersStyling({ marker: { opacity: 0.5 } }, undefined), context);
      expect(layer.paint).toEqual({ "icon-opacity": 0.5 });
    });
  });

  //#endregion

  //#region Images

  describe("MarkerImages", () => {
    let mock: MockStyleMap;
    let images: MarkerImages;

    beforeEach(() => {
      vi.mocked(drawMarkerCanvas).mockClear();
      vi.mocked(onLabelFontLoad).mockClear();
      mock = createMockStyleMap();
      images = new MarkerImages("pl");
    });

    test("draws and adds the image for one of its ids, with the label as content", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), { shape: "square", size: "m" });

      await images.resolve(mock.asSDKMap(), `${prefix}4.5`);

      expect(mock.images.has(`${prefix}4.5`)).toBe(true);
      expect(drawMarkerCanvas).toHaveBeenCalledWith({ shape: "square", size: "m", content: "4.5" });
      expect(mock.map.addImage).toHaveBeenCalledWith(`${prefix}4.5`, expect.anything(), { pixelRatio: 2 });
    });

    test("draws the bare marker for the unlabelled id", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), { shape: "square" });

      await images.resolve(mock.asSDKMap(), prefix);

      expect(drawMarkerCanvas).toHaveBeenCalledWith({ shape: "square" });
      expect(onLabelFontLoad).not.toHaveBeenCalled();
    });

    test("ignores ids that aren't its own", async () => {
      images.setStyle(mock.asSDKMap(), {});

      await images.resolve(mock.asSDKMap(), "some-other-image");
      await images.resolve(mock.asSDKMap(), "other-layer-marker-1:x");

      expect(drawMarkerCanvas).not.toHaveBeenCalled();
    });

    test("draws once for concurrent requests of the same image", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), {});

      await Promise.all([images.resolve(mock.asSDKMap(), `${prefix}a`), images.resolve(mock.asSDKMap(), `${prefix}a`)]);
      await images.resolve(mock.asSDKMap(), `${prefix}a`);

      expect(drawMarkerCanvas).toHaveBeenCalledTimes(1);
    });

    test("keeps the prefix for an unchanged style, and for an opacity-only change", () => {
      const first = images.setStyle(mock.asSDKMap(), { shape: "square", opacity: 1 });

      expect(images.setStyle(mock.asSDKMap(), { shape: "square", opacity: 1 })).toBe(first);
      expect(images.setStyle(mock.asSDKMap(), { shape: "square", opacity: 0.2 })).toBe(first);
    });

    test("changes the prefix and removes the old images when the style changes", async () => {
      const first = images.setStyle(mock.asSDKMap(), { shape: "square" });
      await images.resolve(mock.asSDKMap(), `${first}a`);

      const second = images.setStyle(mock.asSDKMap(), { shape: "circle" });

      expect(second).not.toBe(first);
      expect(mock.images.has(`${first}a`)).toBe(false);
    });

    test("drops a draw whose style changed while the font loaded", async () => {
      let fontLoaded: () => void = () => undefined;
      vi.mocked(onLabelFontLoad).mockImplementationOnce(() => new Promise<void>((resolve) => (fontLoaded = resolve)));
      const first = images.setStyle(mock.asSDKMap(), { shape: "square" });

      const drawing = images.resolve(mock.asSDKMap(), `${first}a`);
      images.setStyle(mock.asSDKMap(), { shape: "circle" });
      fontLoaded();
      await drawing;

      expect(mock.images.has(`${first}a`)).toBe(false);
      expect(drawMarkerCanvas).not.toHaveBeenCalled();
    });

    test("doesn't wait for the label font for xs dots, which have no label", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), { size: "xs" });

      await images.resolve(mock.asSDKMap(), `${prefix}a`);

      expect(onLabelFontLoad).not.toHaveBeenCalled();
      expect(mock.images.has(`${prefix}a`)).toBe(true);
    });

    test("removeAll removes only the images it added", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), {});
      mock.map.addImage("unrelated", {});
      await images.resolve(mock.asSDKMap(), `${prefix}a`);

      images.removeAll(mock.asSDKMap());

      expect([...mock.images.keys()]).toEqual(["unrelated"]);
    });
  });

  //#endregion
});
