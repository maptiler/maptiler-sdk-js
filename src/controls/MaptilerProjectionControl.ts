import { DOMcreate, DOMremove } from "../utils/dom";
import type { Map as SDKMap } from "../Map";
import type { IControl } from "maplibre-gl";

/**
 * A `MaptilerProjectionControl` control adds a button to switch from Mercator to Globe projection.
 */
export class MaptilerProjectionControl implements IControl {
  map!: SDKMap;
  container!: HTMLElement;
  projectionButton!: HTMLButtonElement;

  onAdd(map: SDKMap): HTMLElement {
    this.map = map;
    this.container = DOMcreate("div", "maplibregl-ctrl maplibregl-ctrl-group");
    this.projectionButton = DOMcreate("button", "maplibregl-ctrl-projection", this.container);
    DOMcreate("span", "maplibregl-ctrl-icon", this.projectionButton).setAttribute("aria-hidden", "true");
    this.projectionButton.type = "button";
    this.projectionButton.addEventListener("click", this.toggleProjection.bind(this));

    map.on("projectiontransition", this.updateProjectionIcon.bind(this));

    this.updateProjectionIcon();
    return this.container;
  }

  onRemove(): void {
    DOMremove(this.container);
    this.map.off("projectiontransition", this.updateProjectionIcon);
    // @ts-expect-error: map will only be undefined on remove
    this.map = undefined;
  }

  private toggleProjection(): void {
    toggleProjection(this.map);
    this.updateProjectionIcon();
  }

  private updateProjectionIcon(): void {
    this.projectionButton.classList.remove("maplibregl-ctrl-projection-globe");
    this.projectionButton.classList.remove("maplibregl-ctrl-projection-mercator");
    if (this.map.isGlobeProjection()) {
      this.projectionButton.classList.add("maplibregl-ctrl-projection-mercator");
      this.projectionButton.title = "Enable Mercator projection";
    } else {
      this.projectionButton.classList.add("maplibregl-ctrl-projection-globe");
      this.projectionButton.title = "Enable Globe projection";
    }
  }
}

export function toggleProjection(map: SDKMap): void {
  if (map.getProjection() === undefined) {
    map.setProjection({ type: "mercator" });
  }
  if (map.isGlobeProjection()) {
    map.setProjection("mercator", { persist: true });
  } else {
    map.setProjection("globe", { persist: true });
  }
}
