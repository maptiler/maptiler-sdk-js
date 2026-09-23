import { Map as SDKMap, MapOptions } from '../Map';
import { ControlPosition, CustomLayerInterface, FillLayerSpecification, FilterSpecification, IControl, LayerSpecification, LineLayerSpecification, SourceSpecification, StyleOptions, StyleSetterOptions, StyleSpecification, StyleSwapOptions } from 'maplibre-gl';
import { MapStyleVariant, ReferenceMapStyle } from '@maptiler/client';
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
export interface MinimapOptions extends Omit<MapOptions, "space" | "halo"> {
    zoomAdjust: number;
    pitchAdjust: boolean;
    containerStyle: Record<string, string>;
    parentRect?: ParentRect;
}
export default class Minimap implements IControl {
    #private;
    map: SDKMap;
    constructor(options: MinimapOptionsInput, mapOptions: MapOptions);
    setStyle(style: null | ReferenceMapStyle | MapStyleVariant | StyleSpecification | string, options?: StyleSwapOptions & StyleOptions): void;
    addLayer(layer: (LayerSpecification & {
        source?: string | SourceSpecification;
    }) | CustomLayerInterface, beforeId?: string): SDKMap;
    moveLayer(id: string, beforeId?: string): SDKMap;
    removeLayer(id: string): this;
    setLayerZoomRange(layerId: string, minzoom: number, maxzoom: number): this;
    setFilter(layerId: string, filter?: FilterSpecification | null, options?: StyleSetterOptions): this;
    setPaintProperty(layerId: string, name: string, value: any, options?: StyleSetterOptions): this;
    setLayoutProperty(layerId: string, name: string, value: any, options?: StyleSetterOptions): this;
    setGlyphs(glyphsUrl: string | null, options?: StyleSetterOptions): this;
    onAdd(parentMap: SDKMap): HTMLElement;
    onRemove(): void;
}
