import { Map as SDKMap } from '../Map';
import { IControl, MapLibreEvent } from 'maplibre-gl';
export type MaptilerCustomControlCallback<E> = (map: SDKMap, element: HTMLElement, event: E) => void;
/**
 * The MaptilerCustomControl allows any existing element to become a map control.
 */
export declare class MaptilerCustomControl implements IControl {
    #private;
    /**
     * @param selectorOrElement Element to be used as control, specified as either reference to element itself or a CSS selector to find the element in DOM
     * @param onClick Function called when the element is clicked
     * @param onRender Function called every time the underlying map renders a new state
     */
    constructor(selectorOrElement: string | HTMLElement, onClick?: MaptilerCustomControlCallback<Event>, onRender?: MaptilerCustomControlCallback<MapLibreEvent>);
    onAdd(map: SDKMap): HTMLElement;
    onRemove(): void;
}
