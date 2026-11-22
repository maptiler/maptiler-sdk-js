import { LngLat, MarkerMLGL as Marker, Point, PositionAnchor } from "../index";
import { Map } from "../Map";
import { MercatorCoordinate } from "..";

/**
 * At present there is no to overpan or underscroll in maplibre-gl.
 * This is still an ongoing discussion in the repo.
 *
 * However, thanks to https://github.com/maplibre/maplibre-gl-js/pull/5995 we can monkey patch the
 * sdk instance to add this functionality.
 *
 * This is a temporary solution until the PR is merged and released.
 */

const MAX_VALID_LATITUDE = 85.051129;

export function unprojectFromWorldCoordinates(worldSize: number, point: Point): LngLat {
  return new MercatorCoordinate(point.x / worldSize, point.y / worldSize).toLngLat();
}

function zoomScale(zoom: number) {
  return Math.pow(2, zoom);
}

function scaleZoom(scale: number) {
  return Math.log(scale) / Math.LN2;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function mercatorYfromLat(lat: number) {
  return (180 - (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))) / 360;
}

function mercatorXfromLng(lng: number) {
  return (180 + lng) / 360;
}

function wrap(n: number, min: number, max: number): number {
  const d = max - min;
  const w = ((((n - min) % d) + d) % d) + min;
  return w === min ? max : w;
}

function projectToWorldCoordinates(worldSize: number, lnglat: LngLat): Point {
  const lat = clamp(lnglat.lat, -MAX_VALID_LATITUDE, MAX_VALID_LATITUDE);
  return new Point(mercatorXfromLng(lnglat.lng) * worldSize, mercatorYfromLat(lat) * worldSize);
}

export function overpanningUnderzoomingTransformConstrain(this: Map["_camera"]["transform"], lngLat: LngLat, zoom: number, allowZoomIn = true): { center: LngLat; zoom: number } {
  zoom = clamp(zoom, this.minZoom, this.maxZoom);
  const result = {
    center: new LngLat(lngLat.lng, lngLat.lat),
    zoom,
  };

  let lngRange = this.lngRange as [number, number] | null;
  const latRange = this.latRange as [number, number] | null;

  if (lngRange === null) {
    const almost180 = 180 - 1e-10;
    lngRange = [-almost180, almost180];
  }

  const worldSize = this.tileSize * zoomScale(result.zoom); // A world size for the requested zoom level, not the current world size
  let minY = 0;
  let maxY = worldSize;
  let minX = 0;
  let maxX = worldSize;
  let scaleY = 0;
  let scaleX = 0;
  const { x: screenWidth, y: screenHeight } = this.size;

  const underzoom = 0.5;

  if (latRange) {
    minY = mercatorYfromLat(latRange[1]) * worldSize;
    maxY = mercatorYfromLat(latRange[0]) * worldSize;
    const shouldZoomIn = maxY - minY < underzoom * screenHeight;
    if (shouldZoomIn) scaleY = (underzoom * screenHeight) / (maxY - minY);
  }

  if (lngRange) {
    minX = wrap(mercatorXfromLng(lngRange[0]) * worldSize, 0, worldSize);
    maxX = wrap(mercatorXfromLng(lngRange[1]) * worldSize, 0, worldSize);

    if (maxX < minX) maxX += worldSize;

    const shouldZoomIn = maxX - minX < underzoom * screenWidth;
    if (shouldZoomIn) scaleX = (underzoom * screenWidth) / (maxX - minX);
  }

  const { x: originalX, y: originalY } = projectToWorldCoordinates(worldSize, lngLat);
  let modifiedX, modifiedY;

  const scale = Math.min(scaleX || 0, scaleY || 0);

  if (scale && allowZoomIn) {
    // zoom in to exclude all beyond the given lng/lat ranges,
    // then constrain the center at the new zoom (without zooming in again, which could loop on rounding errors)
    return overpanningUnderzoomingTransformConstrain.call(this, lngLat, result.zoom + scaleZoom(scale), false);
  }

  // Keep the viewport center within the bounds, so the bounds edges can be panned at most to the center of the viewport.
  // This is the same on all sides and at any zoom, as the center never needs to leave the bounds, and so the world.
  if (latRange) {
    if (originalY < minY) modifiedY = minY;
    if (originalY > maxY) modifiedY = maxY;
  }

  if (lngRange) {
    if (originalX < minX) modifiedX = minX;
    if (originalX > maxX) modifiedX = maxX;
  }

  // pan the map if the screen goes off the range
  if (modifiedX !== undefined || modifiedY !== undefined) {
    const newPoint = new Point(modifiedX ?? originalX, modifiedY ?? originalY);
    result.center = unprojectFromWorldCoordinates(worldSize, newPoint).wrap();
  }

  return result;
}

export const anchorTranslate: Record<PositionAnchor, string> = {
  center: "translate(-50%,-50%)",
  top: "translate(-50%,0)",
  "top-left": "translate(0,0)",
  "top-right": "translate(-100%,0)",
  bottom: "translate(-50%,-100%)",
  "bottom-left": "translate(0,-100%)",
  "bottom-right": "translate(-100%,-100%)",
  left: "translate(0,-50%)",
  right: "translate(-100%,-50%)",
};

/**
 * Monkey patches the Marker instance to remove wrapping. Because pixel projection does not wrap like lnglat.
 * See here https://github.com/maplibre/maplibre-gl-js/blob/14f56b00e0f08784681ef98f0731c60f3923a4a9/src/ui/marker.ts#L601
 * @param {Marker} marker - The Marker instance to patch.
 */
export function monkeyPatchMarkerInstanceToRemoveWrapping(marker: Marker) {
  // Mirrors MapLibre v6's `Marker._update`, minus the `smartWrap` of `_lngLat`.
  function update(this: Marker, e?: Parameters<Marker["_update"]>[0]) {
    if (!this._map) return;

    this._flatPos = this._pos = this._map.project(this._lngLat)._add(this._offset);
    if (this._map.terrain) {
      // `map.transform` was removed from the public API in MapLibre v6
      this._flatPos = this._map._camera.transform.locationToScreenPoint(this._lngLat)._add(this._offset);
    }

    let rotation = "";
    if (this._rotationAlignment === "viewport" || this._rotationAlignment === "auto") {
      rotation = `rotateZ(${this._rotation}deg)`;
    } else if (this._rotationAlignment === "map") {
      rotation = `rotateZ(${this._rotation - this._map.getBearing()}deg)`;
    }

    let pitch = "";
    if (this._pitchAlignment === "viewport" || this._pitchAlignment === "auto") {
      pitch = "rotateX(0deg)";
    } else if (this._pitchAlignment === "map") {
      pitch = `rotateX(${this._map.getPitch()}deg)`;
    }

    if (!this._subpixelPositioning && e?.type !== "move") {
      this._pos = this._pos.round();
    }

    const transform = `${anchorTranslate[this._anchor]} translate(${this._pos.x}px, ${this._pos.y}px) ${pitch} ${rotation}`;
    this._element.style.transform = transform;
    this._updateOpacity();
  }

  marker._update = update.bind(marker);
}
