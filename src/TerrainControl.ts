import { bindAll, DOMcreate, DOMremove } from "./tools";

import { Map } from "./map";
import type { IControl } from "maplibre-gl";

/**
 * An `TerrainControl` control adds a button to turn terrain on and off.
 *
 * @implements {IControl}
 * @param {Object} [options]
 * @param {string} [options.id] The ID of the raster-dem source to use.
 * @param {Object} [options.options]
 * @param {number} [options.options.exaggeration]
 * @example
 * var map = new maplibregl.Map({TerrainControl: false})
 *     .addControl(new maplibregl.TerrainControl({
 *         source: "terrain"
 *     }));
 */
export class TerrainControl implements IControl {
  _map: Map;
  _container: HTMLElement;
  _terrainButton: HTMLButtonElement;

  constructor() {
    bindAll(["_toggleTerrain", "_updateTerrainIcon"], this);
  }

  onAdd(map: Map) {
    this._map = map;
    this._container = DOMcreate("div", "maplibregl-ctrl maplibregl-ctrl-group");
    this._terrainButton = DOMcreate(
      "button",
      "maplibregl-ctrl-terrain",
      this._container
    );
    DOMcreate("span", "maplibregl-ctrl-icon", this._terrainButton).setAttribute(
      "aria-hidden",
      "true"
    );
    this._terrainButton.type = "button";
    this._terrainButton.addEventListener("click", this._toggleTerrain);

    this._updateTerrainIcon();
    this._map.on("terrain", this._updateTerrainIcon);
    return this._container;
  }

  onRemove() {
    DOMremove(this._container);
    this._map.off("terrain", this._updateTerrainIcon);
    this._map = undefined;
  }

  _toggleTerrain() {
    // if (this._map.getTerrain()) {
    //     this._map.setTerrain(null);
    // } else {
    //     this._map.setTerrain(this.options);
    // }

    if (this._map.hasTerrain()) {
      this._map.disableTerrain();
    } else {
      this._map.enableTerrain();
    }

    this._updateTerrainIcon();
  }

  _updateTerrainIcon() {
    this._terrainButton.classList.remove("maplibregl-ctrl-terrain");
    this._terrainButton.classList.remove("maplibregl-ctrl-terrain-enabled");
    // if (this._map.terrain) {
    if (this._map.hasTerrain()) {
      this._terrainButton.classList.add("maplibregl-ctrl-terrain-enabled");
      this._terrainButton.title = this._map._getUIString(
        "TerrainControl.disableTerrain"
      );
    } else {
      this._terrainButton.classList.add("maplibregl-ctrl-terrain");
      this._terrainButton.title = this._map._getUIString(
        "TerrainControl.enableTerrain"
      );
    }
  }
}
