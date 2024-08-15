import type { NavigationControlOptions } from "maplibre-gl";
import { NavigationControl } from "./MLAdapters/NavigationControl";

type HTMLButtonElementPlus = HTMLButtonElement & {
  clickFunction: (e?: Event) => unknown;
};

export class MaptilerNavigationControl extends NavigationControl {
  constructor(options: NavigationControlOptions = {}) {
    super({
      showCompass: options.showCompass ?? true,
      showZoom: options.showZoom ?? true,
      visualizePitch: options.visualizePitch ?? true,
    });

    // Removing the default click event
    if (this._compass) {
      this._compass.removeEventListener("click", (this._compass as HTMLButtonElementPlus).clickFunction);

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

  /**
   * Overloading: the button now stores its click callback so that we can later on delete it and replace it
   */
  _createButton(className: string, fn: (e?: Event) => unknown): HTMLButtonElementPlus {
    const button = super._createButton(className, fn) as HTMLButtonElementPlus;
    button.clickFunction = fn;
    return button;
  }

  /**
   * Overloading: Limit how flat the compass icon can get
   */
  _rotateCompassArrow = () => {
    const rotate = this.options.visualizePitch
      ? `scale(${Math.min(
          1.5,
          1 / Math.cos(this._map.transform.pitch * (Math.PI / 180)) ** 0.5,
        )}) rotateX(${Math.min(70, this._map.transform.pitch)}deg) rotateZ(${
          this._map.transform.angle * (180 / Math.PI)
        }deg)`
      : `rotate(${this._map.transform.angle * (180 / Math.PI)}deg)`;

    this._compassIcon.style.transform = rotate;
  };
}
