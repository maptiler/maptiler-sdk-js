import { LngLat, Point } from "@maptiler/sdk";
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

export function monkeyPatchMapTransformInstance(instance: Map) {
  instance.transform.getConstrained = function (lngLat: LngLat, zoom: number): { center: LngLat; zoom: number } {
    zoom = clamp(+zoom, this.minZoom, this.maxZoom);
    const result = {
      center: new LngLat(lngLat.lng, lngLat.lat),
      zoom,
    };

    // @ts-expect-error we're monkey patching the maplibre-gl transform
    let lngRange = this._helper._lngRange;

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

    // @ts-expect-error we're monkey patching the maplibre-gl transform
    if (this._helper._latRange) {
      // @ts-expect-error we're monkey patching the maplibre-gl transform
      const latRange = this._helper._latRange;
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

    if (scale) {
      // zoom in to exclude all beyond the given lng/lat ranges
      result.zoom += scaleZoom(scale);
      return result;
    }

    // Panning up and down in latitude is externally limited by project() with MAX_VALID_LATITUDE.
    // This limit prevents panning the top and bottom bounds farther than the center of the viewport.
    // Due to the complexity and consequence of altering project() or MAX_VALID_LATITUDE, we'll simply limit
    // the overpan to 50% the bounds to match that external limit.
    let lngOverpan = 0.0;
    let latOverpan = 0.0;

    const overpan = 1.0;
    const latUnderzoomMinimumPan = 1.0 - (maxY - minY) / screenHeight;
    const lngUnderzoomMinimumPan = 1.0 - (maxX - minX) / screenWidth;
    lngOverpan = Math.max(lngUnderzoomMinimumPan, overpan);
    latOverpan = Math.max(latUnderzoomMinimumPan, overpan);

    const lngPanScale = 1.0 - lngOverpan;
    const latPanScale = 1.0 - latOverpan;

    // @ts-expect-error we're monkey patching the maplibre-gl transform
    if (this._helper._latRange) {
      const h2 = (latPanScale * screenHeight) / 2;
      if (originalY - h2 < minY) modifiedY = minY + h2;
      if (originalY + h2 > maxY) modifiedY = maxY - h2;
    }

    if (lngRange) {
      const wrappedX = originalX;

      const w2 = (lngPanScale * screenWidth) / 2;

      if (wrappedX - w2 < minX) modifiedX = minX + w2;
      if (wrappedX + w2 > maxX) modifiedX = maxX - w2;
    }

    // pan the map if the screen goes off the range
    if (modifiedX !== undefined || modifiedY !== undefined) {
      const newPoint = new Point(modifiedX ?? originalX, modifiedY ?? originalY);
      result.center = unprojectFromWorldCoordinates(worldSize, newPoint).wrap();
    }

    return result;
  };
}
