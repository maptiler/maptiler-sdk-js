import type { LogoControlOptions as LogoControlOptionsML } from "maplibre-gl";
import { defaults } from "./defaults";
import { LogoControl } from "./MLAdapters/LogoControl";
import type { Map as SDKMap } from "./Map";

type LogoControlOptions = LogoControlOptionsML & {
  logoURL?: string;
  linkURL?: string;
  defaultControlsEnabled?: boolean;
};

/**
 * This LogoControl extends the MapLibre LogoControl but instead can use any image URL and
 * any link URL. By default this is using MapTiler logo and URL.
 */
export class MaptilerLogoControl extends LogoControl {
  declare _compact: boolean;
  private logoURL = "";
  private linkURL = "";
  private defaultControlsEnabled = false;

  constructor(options: LogoControlOptions = {}) {
    super(options);

    this.logoURL = options.logoURL ?? defaults.maptilerLogoURL;
    this.linkURL = options.linkURL ?? defaults.maptilerURL;
    this.defaultControlsEnabled = options.defaultControlsEnabled ?? false;
  }

  onAdd(map: SDKMap): HTMLElement {
    this._map = map;
    this._compact = this.options.compact ?? false;
    this._container = window.document.createElement("div");

    if (this.defaultControlsEnabled) {
      this._container.className = "maplibregl-ctrl";
      this._container.appendChild(this._createAnchor());
      this._container.style.display = "block";
    } else {
      this._externalControlsEnabled();
    }

    return this._container;
  }

  _createAnchor() {
    const anchor = window.document.createElement("a");

    anchor.style.backgroundRepeat = "no-repeat";
    anchor.style.cursor = "pointer";
    anchor.style.display = "block";
    anchor.style.height = "23px";
    anchor.style.margin = "0 0 -4px -4px";
    anchor.style.overflow = "hidden";
    anchor.style.width = "88px";
    anchor.style.backgroundImage = `url(${this.logoURL})`;
    anchor.style.backgroundSize = "100px 30px";
    anchor.style.width = "100px";
    anchor.style.height = "30px";

    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.href = this.linkURL;
    anchor.setAttribute("aria-label", "MapTiler logo");
    anchor.setAttribute("rel", "noopener");
    return anchor;
  }

  _externalControlsEnabled() {
    if (!this.defaultControlsEnabled) {
      const containerLogo = window.document.createElement("div");
      containerLogo.className = "maptiler-logo";
      containerLogo.style.position = "absolute";
      containerLogo.style.bottom = "0";
      containerLogo.style.right = "0";
      containerLogo.style.width = "100%";
      containerLogo.style.height = "100%";
      containerLogo.style.margin = "0 0 4px 4px";
      containerLogo.style.display = "flex";
      containerLogo.style.alignItems = "flex-end";
      containerLogo.style.justifyContent = "space-between";
      containerLogo.style.pointerEvents = "none";

      containerLogo.appendChild(this._createAnchor());

      const oldAttr = this._map._container.querySelector(
        ".maplibregl-ctrl-attrib",
      );
      if (oldAttr) {
        const newAttr = oldAttr.cloneNode(true) as HTMLElement;
        oldAttr.remove();
        containerLogo.appendChild(newAttr);
      }

      this._map._container.appendChild(containerLogo);
    }
  }
}
