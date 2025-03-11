import { DOMcreate, DOMremove } from "./tools";
import type { Map as SDKMap } from "./Map";
import type { IControl } from "maplibre-gl";

type MaptilerTerrainControlOptions = {
  removeDefaultDOM?: boolean;
  terrainElement?: HTMLElement;
};

/**
 * A `MaptilerTerrainControl` control adds a button to enable/disable terrain.
 */
export class MaptilerTerrainControl implements IControl {
  private map!: SDKMap;
  private container!: HTMLElement;
  private terrainButton!: HTMLButtonElement;
  private externalTerrain?: HTMLElement;
  private options: MaptilerTerrainControlOptions;
  private boundToggleTerrain: (e: Event) => void;

  constructor(options: MaptilerTerrainControlOptions = {}) {
    this.options = options;
    this.externalTerrain = options.terrainElement;
    // Bind the method once in constructor to maintain reference
    this.boundToggleTerrain = this.toggleTerrain.bind(this);
  }

  onAdd(map: SDKMap): HTMLElement {
    this.map = map;

    if (this.options.removeDefaultDOM) {
      // Create an empty container that won't be visible
      this.container = DOMcreate("div");
      this.setupExternalElements();
      return this.container;
    }

    // Default DOM implementation
    this.container = DOMcreate("div", "maplibregl-ctrl maplibregl-ctrl-group");
    this.terrainButton = DOMcreate(
      "button",
      "maplibregl-ctrl-terrain",
      this.container,
    );
    DOMcreate("span", "maplibregl-ctrl-icon", this.terrainButton).setAttribute(
      "aria-hidden",
      "true",
    );
    this.terrainButton.type = "button";
    this.terrainButton.addEventListener("click", this.boundToggleTerrain);

    map.on("terrain", this.updateTerrainIcon.bind(this));

    this.updateTerrainIcon();
    return this.container;
  }

  onRemove(): void {
    if (this.externalTerrain) {
      this.externalTerrain.removeEventListener(
        "click",
        this.boundToggleTerrain,
      );
    }
    DOMremove(this.container);
    this.map.off("terrain", this.updateTerrainIcon);
    // @ts-expect-error: map will only be undefined on remove
    this.map = undefined;
  }

  private setupExternalElements(): void {
    if (this.externalTerrain) {
      this.externalTerrain.addEventListener("click", this.boundToggleTerrain);
      // Set initial title
      this.updateExternalTitle();
      // Listen for terrain changes
      this.map.on("terrain", this.updateExternalTitle.bind(this));
    }
  }

  private toggleTerrain(): void {
    if (this.map.terrain) {
      this.map.disableTerrain();
    } else {
      this.map.enableTerrain();
    }
    if (!this.options.removeDefaultDOM) {
      this.updateTerrainIcon();
    }
  }

  private updateExternalTitle(): void {
    if (this.externalTerrain) {
      this.externalTerrain.title = this.map.terrain
        ? "Disable terrain"
        : "Enable terrain";
    }
  }

  private updateTerrainIcon(): void {
    if (!this.terrainButton) return;

    this.terrainButton.classList.remove("maplibregl-ctrl-terrain-enabled");
    this.terrainButton.classList.remove("maplibregl-ctrl-terrain-disabled");

    if (this.map.terrain) {
      this.terrainButton.classList.add("maplibregl-ctrl-terrain-enabled");
      this.terrainButton.title = "Disable terrain";
    } else {
      this.terrainButton.classList.add("maplibregl-ctrl-terrain-disabled");
      this.terrainButton.title = "Enable terrain";
    }
  }
}
