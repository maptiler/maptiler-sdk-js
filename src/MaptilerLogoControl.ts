import type { LogoOptions as LogoOptionsML } from "maplibre-gl";
import { defaults } from "./defaults";
import { LogoControl } from "./LogoControl";
import type { Map } from "./Map";

type LogoOptions = LogoOptionsML & {
  logoURL?: string;
  linkURL?: string;
};

/**
 * This LogoControl extends the MapLibre LogoControl but instead can use any image URL and
 * any link URL. By default this is using MapTiler logo and URL.
 */
export class MaptilerLogoControl extends LogoControl {
  declare _compact: boolean;
  private logoURL = "";
  private linkURL = "";

  constructor(options: LogoOptions = {}) {
    super(options);

    this.logoURL = options.logoURL ?? defaults.maptilerLogoURL;
    this.linkURL = options.linkURL ?? defaults.maptilerURL;
  }

  onAdd(map: Map): HTMLElement {
    this._map = map;
    this._compact = this.options.compact ?? false;
    this._container = window.document.createElement("div");
    this._container.className = "maplibregl-ctrl";
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
    this._container.appendChild(anchor);
    this._container.style.display = "block";

    this._map.on("resize", this._updateCompact);
    this._updateCompact();

    return this._container;
  }
}
