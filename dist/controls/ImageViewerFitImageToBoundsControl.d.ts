import { IControl } from 'maplibre-gl';
import { ImageViewer } from '../ImageViewer';
import { Map as MapSDK } from '../Map';
export declare class ImageViewerFitImageToBoundsControl implements IControl {
    private viewer;
    private container;
    constructor({ imageViewer }: {
        imageViewer: ImageViewer;
    });
    handleClick: () => void;
    onAdd(_map: MapSDK): HTMLElement;
    onRemove(): void;
}
