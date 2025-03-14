import { NavigationControl } from "./MLAdapters/NavigationControl";
import type { Map as MapMLGL, NavigationControlOptions } from "maplibre-gl";
import type { Map as SDKMap } from "./Map";

type HTMLButtonElementPlus = HTMLButtonElement & {
  clickFunction: (e?: Event) => unknown;
};

type MaptilerNavigationControlOptions = NavigationControlOptions & {
  compassElement?: HTMLElement;
  zoomInElement?: HTMLElement;
  zoomOutElement?: HTMLElement;
  removeDefaultDOM?: boolean;
};

export class MaptilerNavigationControl extends NavigationControl {
  private externalCompass?: HTMLElement;
  private externalZoomIn?: HTMLElement;
  private externalZoomOut?: HTMLElement;
  private removeDefaultDOM?: boolean;

  constructor(options: MaptilerNavigationControlOptions = {}) {
    super({
      showCompass: options.showCompass ?? true,
      showZoom: options.showZoom ?? true,
      visualizePitch: options.visualizePitch ?? true,
    });

    this.externalCompass = options.compassElement;
    this.externalZoomIn = options.zoomInElement;
    this.externalZoomOut = options.zoomOutElement;
    this.removeDefaultDOM = options.removeDefaultDOM;

    if (options.removeDefaultDOM) {
      // Remove default DOM elements
      if (this._container) {
        this._container.style.display = "none";
      }
    }

    // Removing the default click event
    if (this._compass) {
      this._compass.removeEventListener(
        "click",
        (this._compass as HTMLButtonElementPlus).clickFunction,
      );

      // Adding custom click event
      this._compass.addEventListener("click", (e) => {
        {
          const currentPitch = this._map.getPitch();
          if (currentPitch === 0) {
            this._map.easeTo({ pitch: Math.min(this._map.getMaxPitch(), 80) });
          } else {
            if (this.options.visualizePitch) {
              this._map.resetNorthPitch({}, { originalEvent: e });
            } else {
              this._map.resetNorth({}, { originalEvent: e });
            }
          }
        }
      });
    }
  }

  onAdd(map: SDKMap | MapMLGL) {
    this._map = map as SDKMap;
    if (this.removeDefaultDOM) {
      this.setupExternalElements();
    }
    return super.onAdd(map as MapMLGL);
  }

  private setupExternalElements() {
    if (this.externalCompass) {
      this.externalCompass.addEventListener("click", (e) => {
        const currentPitch = this._map.getPitch();
        if (currentPitch === 0) {
          this._map.easeTo({ pitch: Math.min(this._map.getMaxPitch(), 80) });
        } else {
          if (this.options.visualizePitch) {
            this._map.resetNorthPitch({}, { originalEvent: e });
          } else {
            this._map.resetNorth({}, { originalEvent: e });
          }
        }
      });
    }

    if (this.externalZoomIn) {
      this.externalZoomIn.addEventListener("click", () => {
        this._map.zoomIn();
      });
    }

    if (this.externalZoomOut) {
      this.externalZoomOut.addEventListener("click", () => {
        this._map.zoomOut();
      });
    }
  }

  /**
   * Overloading: the button now stores its click callback so that we can later on delete it and replace it
   */
  _createButton(
    className: string,
    fn: (e?: Event) => unknown,
  ): HTMLButtonElementPlus {
    const button = super._createButton(className, fn) as HTMLButtonElementPlus;
    button.clickFunction = fn;
    return button;
  }

  /**
   * Overloading: Limit how flat the compass icon can get
   */
  _rotateCompassArrow = () => {
    const angle = this._map.getBearing();
    const pitch = this._map.getPitch();

    const rotate = this.options.visualizePitch
      ? `scale(${Math.min(
          1.5,
          1 / Math.cos(pitch * (Math.PI / 180)) ** 0.5,
        )}) rotateX(${Math.min(70, pitch)}deg) rotateZ(${-angle}deg)`
      : `rotate(${-angle}deg)`;

    this._compassIcon.style.transform = rotate;
  };
}
