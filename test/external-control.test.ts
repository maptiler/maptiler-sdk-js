/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-argument,
  @typescript-eslint/no-extraneous-class,
  @typescript-eslint/no-empty-function,
  @typescript-eslint/unbound-method,
*/

globalThis.WebGL2RenderingContext = class WebGL2RenderingContextMock {} as any;

vi.mock("maplibre-gl", async () => {
  const actual: any = await vi.importActual("maplibre-gl");
  return {
    default: {
      ...actual.default,
      Map: class extends actual.default.Evented {
        constructor(options: any) {
          super();
          this._container = options.container;
          actual.default.Map.prototype._setupContainer.call(this);
        }
        _controls: maplibregl.IControl[] = [];
        getCanvas = actual.default.Map.prototype.getCanvas;
        addControl = vi.fn(actual.default.Map.prototype.addControl);
        zoomIn = vi.fn();
        remove() {
          for (const control of this._controls) control.onRemove(this as any);
        }
        getCenter = () => ({ lng: 2, lat: 3 });
        getZoom = () => 4;
        getBearing = () => 5;
        getPitch = () => 6;
        getRoll = () => 7;
        isGlobeProjection = () => 8;
        hasTerrain = () => 9;
        getStyle = () => ({ version: 8, sources: {}, layers: [] });
        setStyle = () => {};
        getLayersOrder = () => [];
        _getUIString = (str: string) => str;
        _containerDimensions = () => [0, 0];
        _getClampedPixelRatio = () => 1;
        _resizeCanvas = () => {};
      },
    },
  };
});

vi.mock("../src/tools", async () => ({
  ...(await vi.importActual("../src/tools")),
  displayNoWebGlWarning: vi.fn(),
}));

vi.mock("../src/Telemetry", async () => ({
  ...(await vi.importActual("../src/Telemetry")),
  Telemetry: class {},
}));

vi.mock("../src/mapstyle", async () => ({
  ...(await vi.importActual("../src/mapstyle")),
  styleToStyle: () => ({
    requiresUrlMonitoring: false,
    isFallback: false,
  }),
}));

vi.mock("../src/controls/MaptilerNavigationControl", () => ({
  MaptilerNavigationControl: class {
    onAdd = () => document.createElement("div");
    onRemove = () => {};
  },
}));

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Map as SDKMap } from "../src/Map";
import { MaptilerExternalControl } from "../src/controls";

describe("MaptilerExternalControl & customControls option", () => {
  async function createMapHelper() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const map = new SDKMap({
      container,
      customControls: true,
    });
    map.fire("load");
    await map.onReadyAsync();
    return map;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  describe("autodetected controls", () => {
    it("should detect control without data attribute value", async () => {
      // <button data-maptiler-control></button>
      const control = document.createElement("button");
      control.setAttribute("data-maptiler-control", "");
      document.body.appendChild(control);
      const addEventListenerSpy = vi.spyOn(control, "addEventListener");

      const map = await createMapHelper();

      expect(map.addControl).toHaveBeenCalledWith(expect.any(MaptilerExternalControl), undefined);
      expect(control.parentElement).not.toBe(document.body);
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it("should detect control without data attribute value set in React", async () => {
      // <button data-maptiler-control="true"></button>
      const control = document.createElement("button");
      control.setAttribute("data-maptiler-control", "true");
      document.body.appendChild(control);
      const addEventListenerSpy = vi.spyOn(control, "addEventListener");

      const map = await createMapHelper();

      expect(map.addControl).toHaveBeenCalledWith(expect.any(MaptilerExternalControl), undefined);
      expect(control.parentElement).not.toBe(document.body);
      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it("should detect control with a known data attribute value", async () => {
      // <button data-maptiler-control="zoom-in"></button>
      const control = document.createElement("button");
      control.setAttribute("data-maptiler-control", "zoom-in");
      document.body.appendChild(control);
      const addEventListenerSpy = vi.spyOn(control, "addEventListener");

      const map = await createMapHelper();

      expect(map.addControl).toHaveBeenCalledWith(expect.any(MaptilerExternalControl), undefined);
      expect(control.parentElement).not.toBe(document.body);
      expect(addEventListenerSpy).toHaveBeenCalledOnce();

      control.click();

      expect(map.zoomIn).toHaveBeenCalledOnce();

      control.click();

      expect(map.zoomIn).toHaveBeenCalledTimes(2);
    });

    it("should detect control position", async () => {
      // <button data-maptiler-control data-maptiler-position="top-left"></button>
      const control = document.createElement("button");
      control.setAttribute("data-maptiler-control", "");
      control.setAttribute("data-maptiler-position", "top-left");
      document.body.appendChild(control);

      const map = await createMapHelper();

      expect(map.addControl).toHaveBeenCalledWith(expect.any(MaptilerExternalControl), "top-left");
    });

    it("should move the control element to its original DOM place when map is removed", async () => {
      // <button data-maptiler-control></button>
      const control = document.createElement("button");
      control.setAttribute("data-maptiler-control", "");
      document.body.appendChild(control);

      const map = await createMapHelper();
      map.remove();

      expect(control.parentElement).toBe(document.body);
    });

    it("should remove functionality from control when map is removed", async () => {
      // <button data-maptiler-control="zoom-in"></button>
      const control = document.createElement("button");
      control.setAttribute("data-maptiler-control", "zoom-in");
      document.body.appendChild(control);

      const map = await createMapHelper();
      control.click();

      expect(map.zoomIn).toHaveBeenCalledOnce();

      map.remove();
      control.click();

      expect(map.zoomIn).toHaveBeenCalledOnce();
    });
  });
  describe("autodetected control groups", () => {
    it("should detect control group with several controls", async () => {
      // <div data-maptiler-control-group>
      //   <button data-maptiler-control="zoom-in"></button>
      //   <button data-maptiler-control="true"></button>
      //   <button data-maptiler-control></button>
      // </div>
      const group = document.createElement("div");
      group.setAttribute("data-maptiler-control-group", "");
      document.body.appendChild(group);

      const emptyControl = document.createElement("button");
      emptyControl.setAttribute("data-maptiler-control", "");
      group.appendChild(emptyControl);
      const emptyControlAddEventListenerSpy = vi.spyOn(emptyControl, "addEventListener");

      const trueControl = document.createElement("button");
      trueControl.setAttribute("data-maptiler-control", "true");
      group.appendChild(trueControl);
      const trueControlAddEventListenerSpy = vi.spyOn(trueControl, "addEventListener");

      const zoomInControl = document.createElement("button");
      zoomInControl.setAttribute("data-maptiler-control", "zoom-in");
      group.appendChild(zoomInControl);
      const zoomInControlAddEventListenerSpy = vi.spyOn(zoomInControl, "addEventListener");

      const map = await createMapHelper();

      expect(map.addControl).toHaveBeenCalledWith(expect.any(MaptilerExternalControl), undefined);
      expect(group.parentElement).not.toBe(document.body);
      expect(emptyControl.parentElement).toBe(group);
      expect(trueControl.parentElement).toBe(group);
      expect(zoomInControl.parentElement).toBe(group);
      expect(emptyControlAddEventListenerSpy).not.toHaveBeenCalled();
      expect(trueControlAddEventListenerSpy).not.toHaveBeenCalled();
      expect(zoomInControlAddEventListenerSpy).toHaveBeenCalledOnce();

      zoomInControl.click();

      expect(map.zoomIn).toHaveBeenCalledOnce();

      map.remove();

      expect(group.parentElement).toBe(document.body);
      expect(emptyControl.parentElement).toBe(group);
      expect(trueControl.parentElement).toBe(group);
      expect(zoomInControl.parentElement).toBe(group);

      zoomInControl.click();

      expect(map.zoomIn).toHaveBeenCalledOnce();
    });

    it("should detect control position", async () => {
      // <div data-maptiler-control-group data-maptiler-position="bottom-left">
      //   <button data-maptiler-control="zoom-in"></button>
      // </div>
      const group = document.createElement("div");
      group.setAttribute("data-maptiler-control-group", "");
      group.setAttribute("data-maptiler-position", "top-left");
      document.body.appendChild(group);

      const control = document.createElement("button");
      control.setAttribute("data-maptiler-control", "");
      group.appendChild(control);

      const map = await createMapHelper();

      expect(map.addControl).toHaveBeenCalledWith(expect.any(MaptilerExternalControl), "top-left");
    });

    it("should move the control group element to its original DOM place when map is removed", async () => {
      // <div data-maptiler-control-group>
      //   <button data-maptiler-control=""></button>
      // </div>
      const group = document.createElement("div");
      group.setAttribute("data-maptiler-control-group", "");
      document.body.appendChild(group);

      const control = document.createElement("button");
      control.setAttribute("data-maptiler-control", "");
      group.appendChild(control);

      const map = await createMapHelper();
      map.remove();

      expect(group.parentElement).toBe(document.body);
      expect(control.parentElement).toBe(group);
    });

    it("should remove functionality from control when map is removed", async () => {
      // <div data-maptiler-control-group>
      //   <button data-maptiler-control="zoom-in"></button>
      // </div>
      const group = document.createElement("div");
      group.setAttribute("data-maptiler-control-group", "");
      document.body.appendChild(group);

      const control = document.createElement("button");
      control.setAttribute("data-maptiler-control", "zoom-in");
      group.appendChild(control);

      const map = await createMapHelper();
      control.click();

      expect(map.zoomIn).toHaveBeenCalledOnce();

      map.remove();
      control.click();

      expect(map.zoomIn).toHaveBeenCalledOnce();
    });
  });
});
