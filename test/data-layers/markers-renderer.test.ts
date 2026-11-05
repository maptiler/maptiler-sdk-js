import { beforeEach, describe, expect, it, vi } from "vitest";
import { MarkerImages, buildMarkerLayers, resolveMarkersStyling, type MarkersRenderContext } from "../../src/data-layers/PointLayer/markers-renderer";
import { getAdaptiveColors } from "../../src/Marker/marker-adaptive-colors";
import { drawMarkerCanvas } from "../../src/Marker/marker-canvas";
import { onLabelFontLoad } from "../../src/Marker/marker-text-fit";
import { createMockStyleMap, type MockStyleMap } from "./mock-style-map";

// canvas drawing has its own tests — here it only needs to hand back an image
vi.mock("../../src/Marker/marker-canvas", () => ({
  getMarkerCanvasPadding: vi.fn(() => 6),
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
    it("fills in the default shape, size and the style's adaptive colours", () => {
      const { marker } = resolveMarkersStyling({}, "streets-v2");
      const defaults = getAdaptiveColors("streets-v2", "maptiler");

      expect(marker).toMatchObject({ shape: "maptiler", size: "m", outerColor: defaults.outerColor, innerColor: defaults.innerColor });
    });

    it("keeps explicit colours, and resolves the rest per shape", () => {
      const { marker } = resolveMarkersStyling({ marker: { shape: "square", outerColor: "#123456" } }, "dataviz-dark");

      expect(marker.outerColor).toBe("#123456");
      expect(marker.innerColor).toBe(getAdaptiveColors("dataviz-dark", "square").innerColor);
    });

    it("minimizes to an xs dot in the marker's own colours, under any overrides, without content", () => {
      const { marker, minimized } = resolveMarkersStyling({ marker: { shape: "square", content: "x" } }, "streets-v2");
      expect(minimized).toMatchObject({ shape: "square", size: "xs", outerColor: marker.outerColor, innerColor: marker.innerColor });
      expect(minimized.content).toBeUndefined();

      const overridden = resolveMarkersStyling({ marker: { shape: "square" }, minimized: { size: "s", outerColor: "#ff0000" } }, "streets-v2").minimized;
      expect(overridden).toMatchObject({ shape: "square", size: "s", outerColor: "#ff0000" });
    });

    it("styles clusters like the markers unless given their own style, resolved the same way", () => {
      const plain = resolveMarkersStyling({ marker: { shape: "square" } }, "streets-v2");
      expect(plain.clusterMarker).toEqual(plain.marker);

      const own = resolveMarkersStyling({ marker: { shape: "square" }, clusterMarker: { shape: "circle", size: "l" } }, "streets-v2").clusterMarker;
      expect(own).toMatchObject({ shape: "circle", size: "l", innerColor: getAdaptiveColors("streets-v2", "circle").innerColor });
    });
  });

  //#endregion

  //#region Layers

  describe("buildMarkerLayers", () => {
    const imagePrefixes = { marker: "pl-marker-1:", dot: "pl-dot-1:", cluster: "pl-cluster-1:" };
    const context: MarkersRenderContext = { layerId: "pl", sourceId: "pl-source", collisionBehaviour: "always-show", imagePrefixes };

    function layout(label?: string | ["get", string]) {
      const [layer] = buildMarkerLayers(resolveMarkersStyling({ label }, undefined), context);
      return layer.layout as Record<string, unknown>;
    }

    it("requests the bare prefix when there's no label", () => {
      expect(layout()["icon-image"]).toBe("pl-marker-1:");
    });

    it("appends a property label to the image id", () => {
      expect(layout("name")["icon-image"]).toEqual(["concat", "pl-marker-1:", ["to-string", ["get", "name"]]]);
    });

    it("appends an expression label to the image id", () => {
      expect(layout(["get", "mag"])["icon-image"]).toEqual(["concat", "pl-marker-1:", ["to-string", ["get", "mag"]]]);
    });

    it("depth-sorts overlapping markers by screen y", () => {
      expect(layout()).toMatchObject({ "icon-allow-overlap": true, "icon-ignore-placement": true, "symbol-z-order": "viewport-y" });
    });

    it("offsets bottom-anchored shapes so the tip sits on the point, and centres the rest", () => {
      const offset = (shape: "maptiler" | "square") => {
        const [layer] = buildMarkerLayers(resolveMarkersStyling({ marker: { shape, size: "l" } }, undefined), context);
        return (layer.layout as Record<string, unknown>)["icon-offset"];
      };

      expect(offset("maptiler")).toEqual([0, -20]);
      expect(offset("square")).toEqual([0, 0]);
    });

    it("applies opacity through the layer, not the image", () => {
      const [layer] = buildMarkerLayers(resolveMarkersStyling({ marker: { opacity: 0.5 } }, undefined), context);
      expect(layer.paint).toEqual({ "icon-opacity": 0.5 });
    });

    //#region Collision

    describe("collision behaviours", () => {
      function build(collisionBehaviour: MarkersRenderContext["collisionBehaviour"], styling: Parameters<typeof resolveMarkersStyling>[0] = {}) {
        return buildMarkerLayers(resolveMarkersStyling({ label: "name", ...styling }, undefined), { ...context, collisionBehaviour });
      }
      const layoutOf = (layer: { layout?: unknown }) => layer.layout as Record<string, unknown>;

      it("always-show: one marker layer that never collides, with no sort key", () => {
        const layers = build("always-show", { priority: ["get", "mag"] });

        expect(layers.map((l) => l.id)).toEqual(["pl-marker"]);
        expect(layoutOf(layers[0])["symbol-sort-key"]).toBeUndefined();
      });

      it("hide-by-priority: one marker layer that collides, placed highest priority first", () => {
        const layers = build("hide-by-priority", { priority: ["get", "mag"] });

        expect(layers.map((l) => l.id)).toEqual(["pl-marker"]);
        expect(layoutOf(layers[0])).toMatchObject({ "icon-allow-overlap": false, "icon-ignore-placement": false, "symbol-sort-key": ["-", ["get", "mag"]] });
        // viewport-y would make MapLibre place by screen y rather than by sort key
        expect(layoutOf(layers[0])["symbol-z-order"]).toBe("auto");
        // the collision box is trimmed of the image's shadow margin
        expect(layoutOf(layers[0])["icon-padding"]).toEqual([-6]);
        expect(layoutOf(build("always-show")[0])["icon-padding"]).toBeUndefined();
      });

      it("negates a constant priority, and leaves data order without one", () => {
        expect(layoutOf(build("hide-by-priority", { priority: 3 })[0])["symbol-sort-key"]).toBe(-3);
        expect(layoutOf(build("hide-by-priority")[0])["symbol-sort-key"]).toBeUndefined();
      });

      it("minimize-by-priority: an always-shown dot beneath every colliding marker", () => {
        const [dot, marker] = build("minimize-by-priority", { marker: { shape: "maptiler", opacity: 0.8 } });

        expect([dot.id, marker.id]).toEqual(["pl-dot", "pl-marker"]);
        // the dot has no label, and sits centred on the point
        expect(layoutOf(dot)).toMatchObject({ "icon-image": "pl-dot-1:", "icon-offset": [0, 0], "icon-allow-overlap": true, "icon-ignore-placement": true });
        expect(dot.paint).toEqual({ "icon-opacity": 0.8 });
        expect(layoutOf(marker)).toMatchObject({ "icon-allow-overlap": false, "icon-ignore-placement": false });
      });

      it("cluster: unclustered markers, then cluster markers with the count drawn into their image", () => {
        const [marker, cluster] = build("cluster", { clusterMarker: { shape: "circle", size: "l" } });

        expect([marker.id, cluster.id]).toEqual(["pl-marker", "pl-cluster"]);
        expect(marker.filter).toEqual(["!", ["has", "point_count"]]);
        expect(cluster.filter).toEqual(["has", "point_count"]);
        expect(layoutOf(cluster)).toMatchObject({
          "icon-image": ["concat", "pl-cluster-1:", ["to-string", ["get", "point_count_abbreviated"]]],
          "icon-offset": [0, 0],
          "icon-allow-overlap": true,
        });
      });
    });

    //#endregion
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

    it("draws and adds the image for one of its ids, with the label as content", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), { shape: "square", size: "m" });

      await images.resolve(mock.asSDKMap(), `${prefix}4.5`);

      expect(mock.images.has(`${prefix}4.5`)).toBe(true);
      expect(drawMarkerCanvas).toHaveBeenCalledWith({ shape: "square", size: "m", content: "4.5" });
      expect(mock.map.addImage).toHaveBeenCalledWith(`${prefix}4.5`, expect.anything(), { pixelRatio: 2 });
    });

    it("draws the bare marker for the unlabelled id", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), { shape: "square" });

      await images.resolve(mock.asSDKMap(), prefix);

      expect(drawMarkerCanvas).toHaveBeenCalledWith({ shape: "square" });
      expect(onLabelFontLoad).not.toHaveBeenCalled();
    });

    it("ignores ids that aren't its own", async () => {
      images.setStyle(mock.asSDKMap(), {});

      await images.resolve(mock.asSDKMap(), "some-other-image");
      await images.resolve(mock.asSDKMap(), "other-layer-marker-1:x");

      expect(drawMarkerCanvas).not.toHaveBeenCalled();
    });

    it("draws once for concurrent requests of the same image", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), {});

      await Promise.all([images.resolve(mock.asSDKMap(), `${prefix}a`), images.resolve(mock.asSDKMap(), `${prefix}a`)]);
      await images.resolve(mock.asSDKMap(), `${prefix}a`);

      expect(drawMarkerCanvas).toHaveBeenCalledTimes(1);
    });

    it("keeps the prefix for an unchanged style, and for an opacity-only change", () => {
      const first = images.setStyle(mock.asSDKMap(), { shape: "square", opacity: 1 });

      expect(images.setStyle(mock.asSDKMap(), { shape: "square", opacity: 1 })).toBe(first);
      expect(images.setStyle(mock.asSDKMap(), { shape: "square", opacity: 0.2 })).toBe(first);
    });

    it("changes the prefix and removes the old images when the style changes", async () => {
      const first = images.setStyle(mock.asSDKMap(), { shape: "square" });
      await images.resolve(mock.asSDKMap(), `${first}a`);

      const second = images.setStyle(mock.asSDKMap(), { shape: "circle" });

      expect(second).not.toBe(first);
      expect(mock.images.has(`${first}a`)).toBe(false);
    });

    it("drops a draw whose style changed while the font loaded", async () => {
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

    it("doesn't wait for the label font for xs dots, which have no label", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), { size: "xs" });

      await images.resolve(mock.asSDKMap(), `${prefix}a`);

      expect(onLabelFontLoad).not.toHaveBeenCalled();
      expect(mock.images.has(`${prefix}a`)).toBe(true);
    });

    it("keeps each role's images apart by id", async () => {
      const dots = new MarkerImages("pl", "dot");
      const markerPrefix = images.setStyle(mock.asSDKMap(), {});
      const dotPrefix = dots.setStyle(mock.asSDKMap(), { size: "xs" });

      expect(markerPrefix).toBe("pl-marker-1:");
      expect(dotPrefix).toBe("pl-dot-1:");
      await images.resolve(mock.asSDKMap(), dotPrefix);
      expect(drawMarkerCanvas).not.toHaveBeenCalled();
    });

    it("removeAll removes only the images it added", async () => {
      const prefix = images.setStyle(mock.asSDKMap(), {});
      mock.map.addImage("unrelated", {});
      await images.resolve(mock.asSDKMap(), `${prefix}a`);

      images.removeAll(mock.asSDKMap());

      expect([...mock.images.keys()]).toEqual(["unrelated"]);
    });
  });

  //#endregion
});
