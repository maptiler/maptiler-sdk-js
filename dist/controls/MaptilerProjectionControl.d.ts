import { Map as SDKMap } from '../Map';
import { IControl } from 'maplibre-gl';
/**
 * A `MaptilerProjectionControl` control adds a button to switch from Mercator to Globe projection.
 */
export declare class MaptilerProjectionControl implements IControl {
    map: SDKMap;
    container: HTMLElement;
    projectionButton: HTMLButtonElement;
    onAdd(map: SDKMap): HTMLElement;
    onRemove(): void;
    private toggleProjection;
    private updateProjectionIcon;
}
export declare function toggleProjection(map: SDKMap): void;
