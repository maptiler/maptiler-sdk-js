import type { IControl } from "maplibre-gl";
import { ImageViewer } from "../ImageViewer";
import { Map as MapSDK } from "../Map";

// this control is only used in the ImageViewer component
// it should not be used in the Map component
export class ImageViewerFitImageToBoundsControl implements IControl {
  private viewer: ImageViewer;
  private container!: HTMLElement;
  constructor({ imageViewer }: { imageViewer: ImageViewer }) {
    if (!imageViewer) {
      throw new Error("ImageViewerFitImageToBoundsControl: an instance of 'ImageViewer' is required");
    }
    this.viewer = imageViewer;
  }

  handleClick = () => {
    this.viewer.fitImageToViewport({ ease: true });
  };

  onAdd(_map: MapSDK) {
    const button = document.createElement("button");
    this.container = document.createElement("div");
    this.container.classList.add("maplibregl-ctrl", "maplibregl-ctrl-group");
    button.classList.add("maplibregl-ctrl-fit-image-to-bounds");
    const internalSpan = document.createElement("span");
    internalSpan.classList.add("maplibregl-ctrl-icon");
    button.title = "Zoom image to viewport bounds";
    button.appendChild(internalSpan);
    button.addEventListener("click", this.handleClick);

    this.container.appendChild(button);

    return this.container;
  }

  onRemove() {
    this.container.remove();
  }
}
