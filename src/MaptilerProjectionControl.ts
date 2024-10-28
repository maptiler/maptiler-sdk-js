import { bindAll, DOMcreate, DOMremove } from "./tools";

import type { Map as SDKMap } from "./Map";
import type { IControl } from "maplibre-gl";

/**
 * A `MaptilerProjectionControl` control adds a button to switch from Mercator to Globe projection.
 */
export class MaptilerProjectionControl implements IControl {
  map!: SDKMap;
  container!: HTMLElement;
  projectionButton!: HTMLButtonElement;

  constructor() {
    bindAll(["toggleProjection", "updateProjectionIcon"], this);
  }

  onAdd(map: SDKMap): HTMLElement {
    this.map = map;
    this.container = DOMcreate("div", "maplibregl-ctrl maplibregl-ctrl-group");
    this.projectionButton = DOMcreate("button", "maplibregl-ctrl-projection", this.container);
    DOMcreate("span", "maplibregl-ctrl-icon", this.projectionButton).setAttribute("aria-hidden", "true");
    this.projectionButton.type = "button";
    this.projectionButton.addEventListener("click", this.toggleProjection);

    this.updateProjectionIcon();
    this.map.on("style", this.updateProjectionIcon);
    return this.container;
  }

  onRemove(): void {
    DOMremove(this.container);
    this.map.off("style", this.updateProjectionIcon);
    // @ts-expect-error: map will only be undefined on remove
    this.map = undefined;
  }

  private toggleProjection(): void {
    console.log(this.map.style.getTransition());
    
    if (this.isGlobe()) {
      this.map.setProjection({type: "mercator"});
    } else {
      this.map.setProjection({type: "globe"});
      // @ts-ignore
      this.map.transform.setGlobeViewAllowed(true, true);
    }

    this.updateProjectionIcon();
  }


  private updateProjectionIcon(): void {
    // this.projectionButton.classList.remove("maplibregl-ctrl-terrain");
    this.projectionButton.classList.remove("maplibregl-ctrl-projection-globe");
    this.projectionButton.classList.remove("maplibregl-ctrl-projection-mercator");
    if (this.isGlobe()) {
      this.projectionButton.classList.add("maplibregl-ctrl-projection-mercator");
      this.projectionButton.title = "Enable Mercator projection";
    } else {
      this.projectionButton.classList.add("maplibregl-ctrl-projection-globe");
      this.projectionButton.title = "Enable Globe projection";
    }
  }


  private isGlobe(): boolean {
    if (!this.map) return false;
    const projection = this.map.getProjection();
    if (!projection) return false;
    return projection.type === "globe";
  }
}
