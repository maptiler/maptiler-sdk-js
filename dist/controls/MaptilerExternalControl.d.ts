import { Map as SDKMap } from '../Map';
import { IControl } from 'maplibre-gl';
import { MaptilerCustomControl, MaptilerCustomControlCallback } from './MaptilerCustomControl';
export type MaptilerExternalControlType = "zoom-in" | "zoom-out" | "toggle-projection" | "toggle-terrain" | "reset-view" | "reset-bearing" | "reset-pitch" | "reset-roll";
/**
 * The MaptilerExternalControl allows any existing element to automatically become a map control. Used for detected controls if `customControls` config is turned on.
 */
export declare class MaptilerExternalControl extends MaptilerCustomControl implements IControl {
    #private;
    static controlCallbacks: Record<MaptilerExternalControlType, MaptilerCustomControlCallback<Event>>;
    /**
     * Constructs an instance of External Control to have a predefined functionality
     * @param controlElement Element to be used as control, specified as reference to element itself
     * @param controlType One of the predefined types of functionality
     */
    constructor(controlElement: HTMLElement, controlType?: MaptilerExternalControlType);
    onAdd(map: SDKMap): HTMLElement;
    onRemove(): void;
    /**
     * Configure a child element to be part of this control and to have a predefined functionality added
     * @param controlElement Element that is a descendant of the control element and that optionally should have some functionality
     * @param controlType One of the predefined types of functionality
     */
    configureGroupItem(controlElement: HTMLElement, controlType: MaptilerExternalControlType | undefined): void;
}
