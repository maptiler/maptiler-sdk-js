import { MapTilerMarkerUIStateName, MapTilerMarkerUIStates, UIStateSpec } from './types';
export declare const UI_STATE_PRIORITY: readonly MapTilerMarkerUIStateName[];
export declare function flattenUIStates(states: MapTilerMarkerUIStates, active: ReadonlySet<MapTilerMarkerUIStateName>): UIStateSpec;
