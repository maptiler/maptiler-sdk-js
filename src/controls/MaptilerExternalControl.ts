import type { Map as SDKMap } from "../Map";
import type { IControl } from "maplibre-gl";
import { MaptilerCustomControl, MaptilerCustomControlCallback } from "./MaptilerCustomControl";
import { toggleProjection } from "./MaptilerProjectionControl";
import { toggleTerrain } from "./MaptilerTerrainControl";

export type MaptilerExternalControlType = "zoom-in" | "zoom-out" | "toggle-projection" | "toggle-terrain" | "reset-view" | "reset-bearing" | "reset-pitch" | "reset-roll";

const controlCallbacks: Record<MaptilerExternalControlType, MaptilerCustomControlCallback<Event>> = {
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
 * The MaptilerExternalControl allows any existing element to automatically become a map control. Used for detected controls if `customControls` config is turned on.
 */
export class MaptilerExternalControl extends MaptilerCustomControl implements IControl {
  static controlCallbacks = controlCallbacks;

  #map!: SDKMap;
  #groupItemEvents = new Map<WeakRef<HTMLElement>, (event: Event) => void>();

  /**
   * Constructs an instance of External Control to have a predefined functionality
   * @param controlElement Element to be used as control, specified as reference to element itself
   * @param controlType One of the predefined types of functionality
   */
  constructor(controlElement: HTMLElement, controlType?: MaptilerExternalControlType) {
    if (controlType && !(controlType in controlCallbacks)) throw new Error(`data-maptiler-control value "${controlType}" is invalid.`);
    super(controlElement, controlType && controlCallbacks[controlType]);
  }

  onAdd(map: SDKMap): HTMLElement {
    this.#map = map;

    return super.onAdd(map);
  }

  onRemove(): void {
    for (const [elementRef, onClickFn] of this.#groupItemEvents) {
      const element = elementRef.deref();
      if (element) {
        element.removeEventListener("click", onClickFn);
      }
    }
    this.#groupItemEvents.clear();

    super.onRemove();
  }

  /**
   * Configure a child element to be part of this control and to have a predefined functionality added
   * @param controlElement Element that is a descendant of the control element and that optionally should have some functionality
   * @param controlType One of the predefined types of functionality
   */
  configureGroupItem(controlElement: HTMLElement, controlType: MaptilerExternalControlType | undefined): void {
    if (!controlType) return;
    if (!(controlType in controlCallbacks)) throw new Error(`data-maptiler-control value "${controlType}" is invalid.`);
    const onClickFn = (event: Event) => {
      controlCallbacks[controlType](this.#map, controlElement, event);
    };
    controlElement.addEventListener("click", onClickFn);
    this.#groupItemEvents.set(new WeakRef(controlElement), onClickFn);
  }
}
