import { GeolocateControl } from '../MLAdapters/GeolocateControl';
/**
 * The MaptilerGeolocateControl is an extension of the original GeolocateControl
 * with a few changes. In this version, the active mode persists as long as the
 * location is still centered. This means it's robust to rotation, pitch and zoom.
 *
 */
export declare class MaptilerGeolocateControl extends GeolocateControl {
    private lastUpdatedCenter;
    /**
     * Update the camera location to center on the current position
     *
     * @param {Position} position the Geolocation API Position
     * @private
     */
    _updateCamera: (position: GeolocationPosition) => void;
    _finishSetupUI: (supported: boolean) => void;
    _updateCircleRadius(): void;
    _onZoom: () => void;
    _setErrorState(): void;
}
