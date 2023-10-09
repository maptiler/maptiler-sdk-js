/**
 * This is an extension adds support for adding a minimap to one of the map's control containers.
 */

import { Map } from "./Map";
import { DOMcreate, DOMremove } from "./tools";

import type {
  ControlPosition,
  CustomLayerInterface,
  FillLayerSpecification,
  FilterSpecification,
  GeoJSONSource,
  IControl,
  LayerSpecification,
  LineLayerSpecification,
  SourceSpecification,
  StyleOptions,
  StyleSetterOptions,
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
  containerStyle?: Record<string, string>;

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
  map!: Map;
  #parentMap!: Map;
  #container!: HTMLElement;
  #canvasContainer!: HTMLElement;
  #parentRect?: GeoJSON.Feature<GeoJSON.Polygon>;
  #differentStyle = false;
  #desync?: () => void;
  constructor(options: MinimapOptionsInput, mapOptions: MapOptions) {
    // check if the style is different
    if (options.style !== undefined) this.#differentStyle = true;
    // set options
    this.#options = {
      // set defaults
      zoomAdjust: -4,
      position: "top-right",
      // inherit map options
      ...mapOptions,
      // override any lingering control options
      forceNoAttributionControl: true,
      attributionControl: false,
      navigationControl: false,
      geolocateControl: false,
      maptilerLogo: false,
      minimap: false,
      hash: false,
      pitchAdjust: false,
      // override map options with new user defined minimap options
      ...options,
      containerStyle: {
        border: "1px solid #000",
        width: "400px",
        height: "300px",
        ...(options.containerStyle ?? {}),
      },
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
    if (!this.#differentStyle) this.map.setStyle(style, options);
    this.#setParentBounds();
  }

  addLayer(
    layer:
      | (LayerSpecification & {
          source?: string | SourceSpecification;
        })
      | CustomLayerInterface,
    beforeId?: string,
  ): Map {
    if (!this.#differentStyle) this.map.addLayer(layer, beforeId);
    this.#setParentBounds();
    return this.map;
  }

  moveLayer(id: string, beforeId?: string): Map {
    if (!this.#differentStyle) this.map.moveLayer(id, beforeId);
    this.#setParentBounds();
    return this.map;
  }

  removeLayer(id: string): this {
    if (!this.#differentStyle) this.map.removeLayer(id);
    this.#setParentBounds();
    return this;
  }

  setLayerZoomRange(layerId: string, minzoom: number, maxzoom: number): this {
    if (!this.#differentStyle)
      this.map.setLayerZoomRange(layerId, minzoom, maxzoom);
    this.#setParentBounds();
    return this;
  }

  setFilter(
    layerId: string,
    filter?: FilterSpecification | null,
    options?: StyleSetterOptions,
  ): this {
    if (!this.#differentStyle) this.map.setFilter(layerId, filter, options);
    this.#setParentBounds();
    return this;
  }

  setPaintProperty(
    layerId: string,
    name: string,
    // maplibre controlled types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    options?: StyleSetterOptions,
  ): this {
    if (!this.#differentStyle)
      this.map.setPaintProperty(layerId, name, value, options);
    this.#setParentBounds();
    return this;
  }

  setLayoutProperty(
    layerId: string,
    name: string,
    // maplibre controlled types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    options?: StyleSetterOptions,
  ): this {
    if (!this.#differentStyle)
      this.map.setLayoutProperty(layerId, name, value, options);
    this.#setParentBounds();
    return this;
  }

  setGlyphs(glyphsUrl: string | null, options?: StyleSetterOptions): this {
    if (!this.#differentStyle) this.map.setGlyphs(glyphsUrl, options);
    this.#setParentBounds();
    return this;
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
    this.map = new Map(this.#options);

    // NOTE: For some reason the DOM doesn't properly update it's size in time
    // for the minimap to convey it's size to the canvas.
    this.map.once("style.load", () => {
      this.map.resize();
    });

    // set options
    this.map.once("load", () => {
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

    this.map.addSource("parentRect", {
      type: "geojson",
      data: this.#parentRect,
    });
    if (rect.lineLayout !== undefined || rect.linePaint !== undefined) {
      this.map.addLayer({
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
      this.map.addLayer({
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

    const source = this.map.getSource("parentRect") as GeoJSONSource;
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
      this.map.on("move", minimapCallback);
    };
    const off = () => {
      this.#parentMap.off("move", parentCallback);
      this.map.off("move", minimapCallback);
    };

    // When one map moves, we turn off the movement listeners
    // on all the maps, move it, then turn the listeners on again
    const sync = (which: "parent" | "minimap") => {
      // OFF
      off();

      // MOVE
      const from = which === "parent" ? this.#parentMap : this.map;
      const to = which === "parent" ? this.map : this.#parentMap;
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
