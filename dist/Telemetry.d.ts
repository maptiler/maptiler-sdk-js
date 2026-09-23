import { Map as MapSDK } from './Map';
/**
 * A Telemetry instance sends some usage and merics to a dedicated endpoint at MapTiler Cloud.
 */
export declare class Telemetry {
    private map;
    private registeredModules;
    private viewerType;
    /**
     *
     * @param map : a Map instance
     * @param delay : a delay in milliseconds after which the payload is sent to MapTiler cloud (cannot be less than 1000ms)
     */
    constructor(map: MapSDK, delay?: number);
    /**
     * Register a module to the telemetry system of the SDK.
     * The arguments `name` and `version` likely come from the package.json
     * of each module.
     */
    registerModule(name: string, version: string): void;
    registerViewerType(viewerType?: string): void;
    private preparePayload;
}
