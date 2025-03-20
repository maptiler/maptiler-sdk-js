import { DOMcreate, DOMRemove } from "./tools";
import type { Map as SDKMap } from "./Map";
import type { IControl } from "maplibre-gl";

type MaptilerProjectionControlOptions = {
  removeDefaultDOM?: boolean;
  projectionElement?: HTMLElement;
};

/**
 * A `MaptilerProjectionControl` control adds a button to switch from Mercator to Globe projection.
 */
export class MaptilerProjectionControl implements IControl {
  map!: SDKMap;
  container!: HTMLElement;
  projectionButton!: HTMLButtonElement;
  private externalProjection?: HTMLElement;
  private options: MaptilerProjectionControlOptions;

  constructor(options: MaptilerProjectionControlOptions = {}) {
    this.options = options;
    this.externalProjection = options.projectionElement;
  }

  onAdd(map: SDKMap): HTMLElement {
    this.map = map;

    if (this.options.removeDefaultDOM) {
      this.setupExternalElements();
      this.container = DOMcreate("div");
      return this.container;
    }
    // Default DOM implementation
    this.container = DOMcreate("div", "maplibregl-ctrl maplibregl-ctrl-group");
    this.projectionButton = DOMcreate(
      "button",
      "maplibregl-ctrl-projection",
      this.container,
    );
    DOMcreate(
      "span",
      "maplibregl-ctrl-icon",
      this.projectionButton,
    ).setAttribute("aria-hidden", "true");
    this.projectionButton.type = "button";
    this.projectionButton.addEventListener("click", this.toggleProjection);

    map.on("projectiontransition", this.updateProjectionIcon.bind(this));

    this.updateProjectionIcon();

    return this.container;
  }

  onRemove(): void {
    if (this.externalProjection) {
      this.externalProjection.removeEventListener(
        "click",
        this.toggleProjection,
      );
    }
    DOMRemove(this.container);
    this.map.off("projectiontransition", this.updateProjectionIcon.bind(this));
    // @ts-expect-error: map will only be undefined on remove
    this.map = undefined;
  }

  private setupExternalElements(): void {
    if (this.externalProjection) {
      this.externalProjection.addEventListener("click", this.toggleProjection);
      // Set initial title
      this.updateExternalTitle();
      // Listen for projection changes
      this.map.on("projectiontransition", this.updateExternalTitle.bind(this));
    }
  }

  private toggleProjection = () => {
    if (this.map.isGlobeProjection()) {
      this.map.enableMercatorProjection();
    } else {
      this.map.enableGlobeProjection();
    }
    if (!this.options.removeDefaultDOM) {
      this.updateProjectionIcon();
    }
  };

  private updateExternalTitle(): void {
    if (this.externalProjection) {
      this.externalProjection.title = this.map.isGlobeProjection()
        ? "Enable Mercator projection"
        : "Enable Globe projection";
    }
  }

  private updateProjectionIcon(): void {
    this.projectionButton.classList.remove("maplibregl-ctrl-projection-globe");
    this.projectionButton.classList.remove(
      "maplibregl-ctrl-projection-mercator",
    );
    if (this.map.isGlobeProjection()) {
      this.projectionButton.classList.add(
        "maplibregl-ctrl-projection-mercator",
      );
      this.projectionButton.title = "Enable Mercator projection";
    } else {
      this.projectionButton.classList.add("maplibregl-ctrl-projection-globe");
      this.projectionButton.title = "Enable Globe projection";
    }
  }
}
