/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-return,
  @typescript-eslint/no-extraneous-class,
  @typescript-eslint/no-empty-function,
*/

globalThis.WebGL2RenderingContext = class WebGL2RenderingContextMock {} as any;

vi.mock("../src/Map", async () => {
  const actual: any = await vi.importActual("../src/Map");
  const maplibre: any = await vi.importActual("maplibre-gl");
  return {
    ...actual,
    Map: class extends maplibre.default.Evented {
      constructor(options: any) {
        super();
        this._container = options.container;
        this._setupContainer(this);
      }
      _container: HTMLElement;
      _setupContainer = actual.Map.prototype._setupContainer;
      _controls: maplibregl.IControl[] = [];
      addControl = actual.Map.prototype.addControl;
      removeControl = actual.Map.prototype.removeControl;
      _getUIString = (str: string) => str;
      _containerDimensions = () => [0, 0];
      _getClampedPixelRatio = () => 1;
      _resizeCanvas = () => {};
    },
  };
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Map as SDKMap } from "../src/Map";
import { MaptilerCustomControl } from "../src/controls";

describe("MaptilerCustomControl", () => {
  let container: HTMLElement;
  function createMapHelper() {
    container = document.createElement("div");
    document.body.appendChild(container);
    console.log("adding container");

    return new SDKMap({
      container,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  describe("element that is not part of DOM", () => {
    it("should pick up the element", () => {
      const element = document.createElement("button");

      expect(() => {
        new MaptilerCustomControl(element);
      }).not.toThrow();
    });

    it("should move the element into the map DOM", () => {
      const element = document.createElement("button");
      const control = new MaptilerCustomControl(element);

      const map = createMapHelper();
      map.addControl(control);

      expect(element.parentElement).not.toBeNull();
    });

    it("should detach the element from DOM when control is removed", () => {
      const element = document.createElement("button");
      const control = new MaptilerCustomControl(element);

      const map = createMapHelper();
      map.addControl(control);
      map.removeControl(control);

      expect(element.parentElement).toBeNull();
    });
  });

  describe("element that is part of DOM", () => {
    it("should pick up the element", () => {
      const element = document.createElement("button");
      document.body.appendChild(element);

      expect(() => {
        new MaptilerCustomControl(element);
      }).not.toThrow();
    });

    it("should move the element into the map DOM", () => {
      const element = document.createElement("button");
      document.body.appendChild(element);
      const control = new MaptilerCustomControl(element);

      const map = createMapHelper();
      map.addControl(control);

      expect(element.parentElement).not.toBe(document.body);
    });

    it("should move the element to its original DOM place when control is removed", () => {
      const element = document.createElement("button");
      document.body.appendChild(element);
      const control = new MaptilerCustomControl(element);

      const map = createMapHelper();
      map.addControl(control);
      map.removeControl(control);

      expect(element.parentElement).toBe(document.body);
    });
  });

  describe("element that is looked up by its selector", () => {
    it("should pick up the element if it exists", () => {
      const element = document.createElement("button");
      element.classList.add("my-control");
      document.body.appendChild(element);

      expect(() => {
        new MaptilerCustomControl(".my-control");
      }).not.toThrow();
    });

    it("should throw error if the element doesn't exist", () => {
      expect(() => {
        new MaptilerCustomControl(".not-found");
      }).toThrow();
    });

    it("should move the element into the map DOM", () => {
      const element = document.createElement("button");
      element.classList.add("my-control");
      document.body.appendChild(element);
      const control = new MaptilerCustomControl(".my-control");

      const map = createMapHelper();
      map.addControl(control);

      expect(element.parentElement).not.toBe(document.body);
    });

    it("should move the element to its original DOM place when control is removed", () => {
      const element = document.createElement("button");
      element.classList.add("my-control");
      document.body.appendChild(element);
      const control = new MaptilerCustomControl(".my-control");

      const map = createMapHelper();
      map.addControl(control);
      map.removeControl(control);

      expect(element.parentElement).toBe(document.body);
    });

    it("should use only the first found element", () => {
      const element = document.createElement("button");
      element.classList.add("my-control");
      document.body.appendChild(element);

      const otherElement = document.createElement("button");
      otherElement.classList.add("my-control");
      document.body.appendChild(otherElement);

      const control = new MaptilerCustomControl(".my-control");

      const map = createMapHelper();
      map.addControl(control);

      expect(element.parentElement).not.toBe(document.body);
      expect(otherElement.parentElement).toBe(document.body);
    });
  });

  describe("onClick callback", () => {
    it("should not call callback before control is added", () => {
      const element = document.createElement("button");
      const onClickFn = vi.fn();
      new MaptilerCustomControl(element, onClickFn);

      expect(onClickFn).not.toHaveBeenCalled();
    });

    it("should not call callback unless element is clicked", () => {
      const element = document.createElement("button");
      const onClickFn = vi.fn();
      const control = new MaptilerCustomControl(element, onClickFn);

      const map = createMapHelper();
      map.addControl(control);

      expect(onClickFn).not.toHaveBeenCalled();
    });

    it("should call callback when element is clicked after control is added", () => {
      const element = document.createElement("button");
      const onClickFn = vi.fn();
      const control = new MaptilerCustomControl(element, onClickFn);

      const map = createMapHelper();
      map.addControl(control);

      element.click();

      expect(onClickFn).toHaveBeenCalledExactlyOnceWith(map, element, expect.any(Event));

      element.click();

      expect(onClickFn).toHaveBeenCalledTimes(2);
    });

    it("should stop calling callback after control is removed", () => {
      const element = document.createElement("button");
      const onClickFn = vi.fn();
      const control = new MaptilerCustomControl(element, onClickFn);

      const map = createMapHelper();
      map.addControl(control);

      element.click();

      expect(onClickFn).toHaveBeenCalledOnce();

      map.removeControl(control);

      element.click();

      expect(onClickFn).toHaveBeenCalledOnce();
    });
  });

  describe("onRender callback", () => {
    it("should not call callback before control is added", () => {
      const element = document.createElement("button");
      const onRenderFn = vi.fn();
      new MaptilerCustomControl(element, undefined, onRenderFn);

      expect(onRenderFn).not.toHaveBeenCalled();
    });

    it("should call callback when map renders after control is added", () => {
      const element = document.createElement("button");
      const onRenderFn = vi.fn();
      const control = new MaptilerCustomControl(element, undefined, onRenderFn);

      const map = createMapHelper();
      map.addControl(control);

      map.fire("render");

      expect(onRenderFn).toHaveBeenCalledExactlyOnceWith(map, element, expect.objectContaining({ type: "render" }));

      map.fire("render");

      expect(onRenderFn).toHaveBeenCalledTimes(2);
    });

    it("should stop calling callback after control is removed", () => {
      const element = document.createElement("button");
      const onRenderFn = vi.fn();
      const control = new MaptilerCustomControl(element, undefined, onRenderFn);

      const map = createMapHelper();
      map.addControl(control);

      map.fire("render");

      expect(onRenderFn).toHaveBeenCalledOnce();

      map.removeControl(control);

      map.fire("render");

      expect(onRenderFn).toHaveBeenCalledOnce();
    });
  });
});
