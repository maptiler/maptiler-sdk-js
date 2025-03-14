/**
 * This is an extension of MapLibre ScaleControl to make it fully type compatible with the SDK
 */

import maplibregl from "maplibre-gl";
import type { Map as MapMLGL, ScaleControlOptions } from "maplibre-gl";
import type { Map as SDKMap } from "./Map";
import { DOMcreate, DOMremove } from "./tools";

type MaptilerScaleControlOptions = ScaleControlOptions & {
  removeDefaultDOM?: boolean;
  scaleElement?: HTMLElement;
};

export class MaptilerScaleControl extends maplibregl.ScaleControl {
  private _map!: SDKMap;
  private externalScale?: HTMLElement;
  private removeDefaultDOM?: boolean;

  constructor(options: MaptilerScaleControlOptions = {}) {
    super({ maxWidth: options.maxWidth, unit: options.unit });
    this.externalScale = options.scaleElement;
    this.removeDefaultDOM = options.removeDefaultDOM;
  }

  _onMove = () => {
    if (this.externalScale) {
      updateScale(this._map, this.externalScale, this.options);
    } else {
      updateScale(this._map, this._container, this.options);
    }
  };

  onAdd(map: SDKMap | MapMLGL) {
    this._map = map as SDKMap;
    if (this.removeDefaultDOM) {
      this._map.on("move", this._onMove);
      this._onMove();

      return DOMcreate("div");
    }
    return super.onAdd(map as MapMLGL);
  }

  onRemove() {
    if (this.externalScale) {
      this._map.off("move", this._onMove);
      DOMremove(this.externalScale);
    }
    super.onRemove();
  }
}

function updateScale(
  map: SDKMap | MapMLGL,
  container: HTMLElement,
  options: MaptilerScaleControlOptions,
) {
  // A horizontal scale is imagined to be present at center of the map
  // container with maximum length (Default) as 100px.
  // Using spherical law of cosines approximation, the real distance is
  // found between the two coordinates.
  // Minimum maxWidth is calculated for the scale box.
  const optWidth = (options && options.maxWidth) || 100;
  const y = map._container.clientHeight / 2;
  const x = map._container.clientWidth / 2;
  const left = map.unproject([x - optWidth / 2, y]);
  const right = map.unproject([x + optWidth / 2, y]);

  const globeWidth = Math.round(map.project(right).x - map.project(left).x);
  const maxWidth = Math.min(optWidth, globeWidth, map._container.clientWidth);

  const maxMeters = left.distanceTo(right);
  // The real distance corresponding to 100px scale length is rounded off to
  // near pretty number and the scale length for the same is found out.
  // Default unit of the scale is based on User's locale.
  if (options && options.unit === "imperial") {
    const maxFeet = 3.2808 * maxMeters;
    if (maxFeet > 5280) {
      const maxMiles = maxFeet / 5280;
      setScale({
        container,
        maxWidth,
        maxDistance: maxMiles,
        unit: map._getUIString("ScaleControl.Miles"),
        externalScale: options.scaleElement,
      });
    } else {
      setScale({
        container,
        maxWidth,
        maxDistance: maxFeet,
        unit: map._getUIString("ScaleControl.Feet"),
        externalScale: options.scaleElement,
      });
    }
  } else if (options && options.unit === "nautical") {
    const maxNauticals = maxMeters / 1852;
    setScale({
      container,
      maxWidth,
      maxDistance: maxNauticals,
      unit: map._getUIString("ScaleControl.NauticalMiles"),
      externalScale: options.scaleElement,
    });
  } else if (maxMeters >= 1000) {
    setScale({
      container,
      maxWidth,
      maxDistance: maxMeters / 1000,
      unit: map._getUIString("ScaleControl.Kilometers"),
      externalScale: options.scaleElement,
    });
  } else {
    setScale({
      container,
      maxWidth,
      maxDistance: maxMeters,
      unit: map._getUIString("ScaleControl.Meters"),
      externalScale: options.scaleElement,
    });
  }
}

function setScale({
  container,
  maxWidth,
  maxDistance,
  unit,
  externalScale,
}: {
  container: HTMLElement;
  maxWidth: number;
  maxDistance: number;
  unit: string;
  externalScale?: HTMLElement;
}) {
  const distance = getRoundNum(maxDistance);
  const ratio = distance / maxDistance;
  container.style.width = externalScale ? `${maxWidth * ratio}px` : "auto";
  container.innerHTML = `${distance}&nbsp;${unit}`;
}

function getDecimalRoundNum(d: number) {
  const multiplier = Math.pow(10, Math.ceil(-Math.log(d) / Math.LN10));
  return Math.round(d * multiplier) / multiplier;
}

function getRoundNum(num: number) {
  const pow10 = Math.pow(10, `${Math.floor(num)}`.length - 1);
  let d = num / pow10;

  d =
    d >= 10
      ? 10
      : d >= 5
        ? 5
        : d >= 3
          ? 3
          : d >= 2
            ? 2
            : d >= 1
              ? 1
              : getDecimalRoundNum(d);

  return pow10 * d;
}
