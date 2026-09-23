import { Map as SDKMap } from '../Map';
import { IControl } from 'maplibre-gl';
/**
 * A `MaptilerTerrainControl` control adds a button to turn terrain on and off
 * by triggering the terrain logic that is already deployed in the Map object.
 */
export declare class MaptilerTerrainControl implements IControl {
    _map: SDKMap;
    _container: HTMLElement;
    _terrainButton: HTMLButtonElement;
    constructor();
    onAdd(map: SDKMap): HTMLElement;
    onRemove(): void;
    _toggleTerrain(): void;
    _updateTerrainIcon(): void;
}
export declare function toggleTerrain(map: SDKMap): void;
