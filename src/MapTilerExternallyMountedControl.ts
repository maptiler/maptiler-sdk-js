import { IControl, Map } from "maplibre-gl";

export enum ECustomControlTypes {
  "zoomIn" = "zoomIn",
  "zoomOut" = "zoomOut",
}

export const customControlEventMap = {
  zoomIn: {
    mapControlMethod: "zoomIn",
    mapControlEvent: "zoom",
    mapGetterMethod: "getZoom",
  },
  zoomOut: {
    mapControlMethod: "zoomOut",
    mapControlEvent: "zoom",
    mapGetterMethod: "getZoom",
  },
};

export default class MapTilerExternallyMountedControl implements IControl {
  private element: HTMLElement;
  isCustomControl = true;
  private placeHolder: HTMLElement;
  private type: ECustomControlTypes;
  map!: Map;
  constructor(parameters: {
    type?: ECustomControlTypes;
    element?: HTMLElement;
  }) {
    if (
      !parameters.type ||
      !Object.values(ECustomControlTypes).includes(parameters.type)
    ) {
      throw new Error(
        `Control type ${parameters.type} is either invalid or not supported for custom controls yet`,
      );
    }
    if (!parameters.element) {
      throw new Error("Element is required");
    }

    this.element = parameters.element;
    this.type = parameters.type;
    this.placeHolder = document.createElement("div");
    this.placeHolder.style.display = "none";

    this.handleClick = this.handleClick.bind(this);
    this.handleMapEvent = this.handleMapEvent.bind(this);
  }

  handleClick(e) {
    const { mapControlMethod } = customControlEventMap[this.type];
    try {
      this.map[mapControlMethod as keyof Map]();
    } catch (error) {
      console.error(error);
    }
  }

  handleMapEvent(e) {
    const { mapControlEvent, mapGetterMethod } =
      customControlEventMap[this.type];

    this.element.style.setProperty(
      `--${mapControlEvent}`,
      this.map[mapGetterMethod as keyof Map](),
    );
  }

  addListeners() {
    this.element.addEventListener("click", this.handleClick);
    console.log(this.type);
    const { mapControlEvent } = customControlEventMap[this.type];
    this.map.on(mapControlEvent, this.handleMapEvent);
  }

  removeListeners() {
    this.element.removeEventListener("click", this.handleClick);
  }

  onAdd(map: Map): HTMLElement {
    this.map = map;
    this.addListeners();
    return this.placeHolder;
  }

  onRemove(): void {
    this.removeListeners();
  }
}
