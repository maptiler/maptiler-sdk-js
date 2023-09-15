/**
 * This is an extension adds support for adding a minimap to one of the map's control containers.
 */

import { Map } from "./Map";
import { DOMcreate, DOMremove } from "./tools";

import type {
  ControlPosition,
  FillLayerSpecification,
  GeoJSONSource,
  IControl,
  LineLayerSpecification,
  StyleOptions,
  StyleSpecification,
  StyleSwapOptions,
} from "maplibre-gl";
import type { MapOptions } from "./Map";
import type { MapStyleVariant, ReferenceMapStyle } from "@maptiler/client";

export interface ParentRect {
  lineLayout: LineLayerSpecification["layout"];
  linePaint: LineLayerSpecification["paint"];
  fillPaint: FillLayerSpecification["paint"];
}

export interface MinimapOptionsInput {
  /**
   * Style of the map. Can be:
   * - a full style URL (possibly with API key)
   * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
   * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
   */
  style?: ReferenceMapStyle | MapStyleVariant | StyleSpecification | string;

  /**
   * Set the zoom difference between the parent and the minimap
   * If the parent is zoomed to 10 and the minimap is zoomed to 8, the zoomAdjust should be 2
   * Default: -4
   */
  zoomAdjust?: number;

  /** Set a zoom of the minimap and don't allow any future changes */
  lockZoom?: number;

  /** Adjust the pitch only if the user requests */
  pitchAdjust?: boolean;

  /** Set CSS properties of the container using object key-values */
  containerStyle?: CSSStyleDeclaration & Record<string, string>;

  /** Set the position of the minimap at either "top-left", "top-right", "bottom-left", or "bottom-right" */
  position?: ControlPosition;

  /** Set the parentRect fill and/or line options */
  parentRect?: ParentRect;
}

export interface MinimapOptions extends MapOptions {
  zoomAdjust: number;
  pitchAdjust: boolean;
  containerStyle: Record<string, string>;
  parentRect?: ParentRect;
}

export default class Minimap implements IControl {
  #options: MinimapOptions;
  #minimap!: Map;
  #parentMap!: Map;
  #container!: HTMLElement;
  #parentRect?: GeoJSON.Feature<GeoJSON.Polygon>;
  #differentStyle = false;
  #desync?: () => void;
  constructor(options: MinimapOptionsInput, mapOptions: MapOptions) {
    // check if the style is different
    if (options.style !== undefined) this.#differentStyle = true;
    // set options
    this.#options = {
      zoomAdjust: -4,
      pitchAdjust: options.pitchAdjust ?? false,
      containerStyle: {
        border: "1px solid #000",
        width: "500px",
        height: "300px",
      },
      position: "top-right",
      ...mapOptions,
      ...options,
      attributionControl: false,
      navigationControl: false,
      geolocateControl: false,
      maptilerLogo: false,
      minimap: true,
    };
    if (options.lockZoom !== undefined) {
      this.#options.minZoom = options.lockZoom;
      this.#options.maxZoom = options.lockZoom;
    }
  }

  setStyle(
    style:
      | null
      | ReferenceMapStyle
      | MapStyleVariant
      | StyleSpecification
      | string,
    options?: StyleSwapOptions & StyleOptions,
  ): void {
    if (!this.#differentStyle) this.#minimap.setStyle(style, options);
    this.#setParentBounds();
  }

  onAdd(parentMap: Map): HTMLElement {
    this.#parentMap = parentMap;
    //prep the container
    this.#container = DOMcreate("div", "maplibregl-ctrl maplibregl-ctrl-group");
    // adjust styling
    for (const [key, value] of Object.entries(this.#options.containerStyle)) {
      this.#container.style.setProperty(key, value);
    }
    this.#options.container = this.#container;
    this.#options.zoom = parentMap.getZoom() + this.#options.zoomAdjust ?? -4;
    // create the map
    this.#minimap = new Map(this.#options);
    // ensure the canvas properly fills the container (this shouldn't be necessary wth o_O)
    const canvas = this.#minimap.getCanvas();
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    // set options
    this.#minimap.once("load", () => {
      this.#addParentRect(this.#options.parentRect);
      this.#desync = this.#syncMaps();
    });

    return this.#container;
  }

  onRemove(): void {
    this.#desync?.();
    DOMremove(this.#container);
  }

  #addParentRect(rect?: ParentRect): void {
    if (
      rect === undefined ||
      (rect.linePaint === undefined && rect.fillPaint === undefined)
    ) {
      return;
    }
    this.#parentRect = {
      type: "Feature",
      properties: {
        name: "parentRect",
      },
      geometry: {
        type: "Polygon",
        coordinates: [[[], [], [], [], []]],
      },
    };

    this.#minimap.addSource("parentRect", {
      type: "geojson",
      data: this.#parentRect,
    });
    if (rect.lineLayout !== undefined || rect.linePaint !== undefined) {
      this.#minimap.addLayer({
        id: "parentRectOutline",
        type: "line",
        source: "parentRect",
        layout: {
          ...rect.lineLayout,
        },
        paint: {
          "line-color": "#FFF",
          "line-width": 1,
          "line-opacity": 0.85,
          ...rect.linePaint,
        },
      });
    }
    if (rect.fillPaint !== undefined) {
      this.#minimap.addLayer({
        id: "parentRectFill",
        type: "fill",
        source: "parentRect",
        layout: {},
        paint: {
          "fill-color": "#08F",
          "fill-opacity": 0.135,
          ...rect.fillPaint,
        },
      });
    }

    this.#setParentBounds();
  }

  #setParentBounds() {
    if (this.#parentRect === undefined) return;

    const { devicePixelRatio } = window;
    const canvas = this.#parentMap.getCanvas();
    const width = canvas.width / devicePixelRatio;
    const height = canvas.height / devicePixelRatio;

    // Get coordinates for all four corners
    const unproject = this.#parentMap.unproject.bind(this.#parentMap);
    const northWest = unproject([0, 0]);
    const northEast = unproject([width, 0]);
    const southWest = unproject([0, height]);
    const southEast = unproject([width, height]);

    this.#parentRect.geometry.coordinates = [
      [
        southWest.toArray(),
        southEast.toArray(),
        northEast.toArray(),
        northWest.toArray(),
        southWest.toArray(),
      ],
    ];

    const source = this.#minimap.getSource("parentRect") as GeoJSONSource;
    source.setData(this.#parentRect);
  }

  #syncMaps(): () => void {
    const { pitchAdjust } = this.#options;
    // syncing callbacks
    const parentCallback = () => {
      sync("parent");
    };
    const minimapCallback = () => {
      sync("minimap");
    };

    // on off functions
    const on = () => {
      this.#parentMap.on("move", parentCallback);
      this.#minimap.on("move", minimapCallback);
    };
    const off = () => {
      this.#parentMap.off("move", parentCallback);
      this.#minimap.off("move", minimapCallback);
    };

    // When one map moves, we turn off the movement listeners
    // on all the maps, move it, then turn the listeners on again
    const sync = (which: "parent" | "minimap") => {
      // OFF
      off();

      // MOVE
      const from = which === "parent" ? this.#parentMap : this.#minimap;
      const to = which === "parent" ? this.#minimap : this.#parentMap;
      const center = from.getCenter();
      const zoom =
        from.getZoom() +
        (this.#options.zoomAdjust ?? -4) * (which === "parent" ? 1 : -1);
      const bearing = from.getBearing();
      const pitch = from.getPitch();
      to.jumpTo({
        center,
        zoom,
        bearing,
        pitch: pitchAdjust ? pitch : 0,
      });
      // update parent rect
      this.#setParentBounds();

      // ON
      on();
    };

    on();
    // return a desync function
    return () => {
      off();
    };
  }
}
