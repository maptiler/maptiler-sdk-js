import { DOMremove } from "../utils/dom";
import type { Map } from "../Map";
import type { IControl } from "maplibre-gl";

export type ExternalControlType = "zoom-in" | "zoom-out" | "toggle-projection" | "toggle-terrain" | "reset-view" | "reset-bearing" | "reset-pitch" | "reset-roll";
export type ExternalControlCallback = (map: Map, element: HTMLElement) => void;

const controlTypeCallbacks: Record<ExternalControlType, ExternalControlCallback> = {
  "zoom-in": (map) => map.zoomIn(),
  "zoom-out": (map) => map.zoomOut(),
  "toggle-projection": (map) => {
    if (map.isGlobeProjection()) {
      map.enableMercatorProjection();
    } else {
      map.enableGlobeProjection();
    }
  },
  "toggle-terrain": (map) => {
    if (map.hasTerrain()) {
      map.disableTerrain();
    } else {
      map.enableTerrain();
    }
  },
  "reset-view": (map) => {
    map.jumpTo({
      bearing: 0,
      pitch: 0,
      roll: 0,
    });
  },
  "reset-bearing": (map) => {
    map.rotateTo(0);
  },
  "reset-pitch": (map) => {
    map.setPitch(0);
  },
  "reset-roll": (map) => {
    map.setRoll(0);
  },
};

/**
 * A `MaptilerExternalControl` control ...
 */
export class MaptilerExternalControl implements IControl {
  #map!: Map;
  #element!: HTMLElement;
  #onClickFn?: () => void;
  #onRenderFn?: () => void;
  #originalParent: HTMLElement | null;

  constructor(selectorOrElement: string | HTMLElement, onClick?: ExternalControlCallback, onRender?: ExternalControlCallback) {
    if (typeof selectorOrElement === "string") {
      const element = document.querySelector(selectorOrElement) as HTMLElement | null;
      if (!element) throw new Error(`No element has been found with selector "${selectorOrElement}" when creating an external control.`);
      this.#element = element;
    } else {
      this.#element = selectorOrElement;
    }

    if (onClick) {
      this.#onClickFn = () => {
        onClick(this.#map, this.#element);
      };
    }
    if (onRender) {
      this.#onRenderFn = () => {
        onRender(this.#map, this.#element);
      };
    }

    this.#originalParent = this.#element.parentElement;
  }

  onAdd(map: Map): HTMLElement {
    this.#map = map;

    if (this.#onClickFn) {
      this.#element.addEventListener("click", this.#onClickFn);
    }
    if (this.#onRenderFn) {
      this.#map.on("render", this.#onRenderFn);
    }

    DOMremove(this.#element);
    return this.#element;
  }

  onRemove(): void {
    if (this.#onClickFn) {
      this.#element.removeEventListener("click", this.#onClickFn);
    }
    if (this.#onRenderFn) {
      this.#map.off("render", this.#onRenderFn);
    }

    if (this.#originalParent) {
      this.#originalParent.appendChild(this.#element);
    } else {
      DOMremove(this.#element);
    }
  }

  configureGroupItem(controlElement: HTMLElement, controlType: ExternalControlType | undefined): void {
    if (!controlType) return;
    if (!(controlType in controlTypeCallbacks)) throw new Error(`data-maptiler-control value "${controlType}" is invalid.`);
    controlElement.addEventListener("click", () => {
      controlTypeCallbacks[controlType](this.#map, controlElement);
    });
  }

  static createFromControlType(controlElement: HTMLElement, controlType: ExternalControlType | undefined): MaptilerExternalControl {
    if (controlType && !(controlType in controlTypeCallbacks)) throw new Error(`data-maptiler-control value "${controlType}" is invalid.`);
    return new MaptilerExternalControl(controlElement, controlType && controlTypeCallbacks[controlType]);
  }
}
