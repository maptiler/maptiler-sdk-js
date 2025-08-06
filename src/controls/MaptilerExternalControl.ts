import { DOMremove } from "../utils/dom";
import type { Map as SDKMap } from "../Map";
import type { IControl, MapLibreEvent } from "maplibre-gl";
import { toggleProjection } from "./MaptilerProjectionControl";
import { toggleTerrain } from "./MaptilerTerrainControl";

export type ExternalControlType = "zoom-in" | "zoom-out" | "toggle-projection" | "toggle-terrain" | "reset-view" | "reset-bearing" | "reset-pitch" | "reset-roll";
export type ExternalControlCallback<E> = (map: SDKMap, element: HTMLElement, event: E) => void;

const controlTypeCallbacks: Record<ExternalControlType, ExternalControlCallback<Event>> = {
  "zoom-in": (map) => map.zoomIn(),
  "zoom-out": (map) => map.zoomOut(),
  "toggle-projection": toggleProjection,
  "toggle-terrain": toggleTerrain,
  "reset-view": (map) => {
    const currentPitch = map.getPitch();
    if (currentPitch === 0) {
      map.easeTo({ pitch: Math.min(map.getMaxPitch(), 80) });
    } else {
      map.resetNorthPitch();
    }
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
 * The MaptilerExternalControl allows any existing element to become a map control.
 */
export class MaptilerExternalControl implements IControl {
  #map!: SDKMap;
  #element!: HTMLElement;
  #onClickFn?: (event: Event) => void;
  #onRenderFn?: (event: MapLibreEvent) => void;
  #originalParent: HTMLElement | null;
  #groupItemEvents = new Map<WeakRef<HTMLElement>, (event: Event) => void>();

  /**
   * @param selectorOrElement Element to be used as control, specified as either reference to element itself or a CSS selector to find the element in DOM
   * @param onClick Function called when the element is clicked
   * @param onRender Function called every time the underlying map renders a new state
   */
  constructor(selectorOrElement: string | HTMLElement, onClick?: ExternalControlCallback<Event>, onRender?: ExternalControlCallback<MapLibreEvent>) {
    if (typeof selectorOrElement === "string") {
      const element = document.querySelector(selectorOrElement) as HTMLElement | null;
      if (!element) throw new Error(`No element has been found with selector "${selectorOrElement}" when creating an external control.`);
      this.#element = element;
    } else {
      this.#element = selectorOrElement;
    }

    if (onClick) {
      this.#onClickFn = (event: Event) => {
        onClick(this.#map, this.#element, event);
      };
    }
    if (onRender) {
      this.#onRenderFn = (event: MapLibreEvent) => {
        onRender(this.#map, this.#element, event);
      };
    }

    this.#originalParent = this.#element.parentElement;
  }

  onAdd(map: SDKMap): HTMLElement {
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
    for (const [elementRef, onClickFn] of this.#groupItemEvents) {
      const element = elementRef.deref();
      if (element) {
        element.removeEventListener("click", onClickFn);
      }
    }

    if (this.#originalParent) {
      this.#originalParent.appendChild(this.#element);
    } else {
      DOMremove(this.#element);
    }
  }

  /**
   * Configure a child element to be part of this control and to have a predefined functionality added
   * @param controlElement Element that is a descendant of the control element and that optionally should have some functionality
   * @param controlType One of the predefined types of functionality
   */
  configureGroupItem(controlElement: HTMLElement, controlType: ExternalControlType | undefined): void {
    if (!controlType) return;
    if (!(controlType in controlTypeCallbacks)) throw new Error(`data-maptiler-control value "${controlType}" is invalid.`);
    const onClickFn = (event: Event) => {
      controlTypeCallbacks[controlType](this.#map, controlElement, event);
    };
    controlElement.addEventListener("click", onClickFn);
    this.#groupItemEvents.set(new WeakRef(controlElement), onClickFn);
  }

  /**
   * Constructs an instance of External Control to have a predefined functionality
   * @param controlElement Element to be used as control, specified as reference to element itself
   * @param controlType One of the predefined types of functionality
   * @returns New instance of External Control
   */
  static createFromControlType(controlElement: HTMLElement, controlType: ExternalControlType | undefined): MaptilerExternalControl {
    if (controlType && !(controlType in controlTypeCallbacks)) throw new Error(`data-maptiler-control value "${controlType}" is invalid.`);
    return new MaptilerExternalControl(controlElement, controlType && controlTypeCallbacks[controlType]);
  }
}
