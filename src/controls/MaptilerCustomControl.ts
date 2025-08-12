import { DOMremove } from "../utils/dom";
import type { Map as SDKMap } from "../Map";
import type { IControl, MapLibreEvent } from "maplibre-gl";

export type MaptilerCustomControlCallback<E> = (map: SDKMap, element: HTMLElement, event: E) => void;

/**
 * The MaptilerCustomControl allows any existing element to become a map control.
 */
export class MaptilerCustomControl implements IControl {
  #map!: SDKMap;
  #element!: HTMLElement;
  #onClickFn?: (event: Event) => void;
  #onRenderFn?: (event: MapLibreEvent) => void;
  #originalParent: HTMLElement | null;

  /**
   * @param selectorOrElement Element to be used as control, specified as either reference to element itself or a CSS selector to find the element in DOM
   * @param onClick Function called when the element is clicked
   * @param onRender Function called every time the underlying map renders a new state
   */
  constructor(selectorOrElement: string | HTMLElement, onClick?: MaptilerCustomControlCallback<Event>, onRender?: MaptilerCustomControlCallback<MapLibreEvent>) {
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

    if (this.#originalParent) {
      this.#originalParent.appendChild(this.#element);
    } else {
      DOMremove(this.#element);
    }
  }
}
