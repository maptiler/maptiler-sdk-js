export const earthRadius = 6371008.8;

/** Convert meters to feet */
export function mToFt(m: number): number {
  return m * 3.28084;
}

/** Convert degrees to Radians */
export function degToRad(degrees: number): number {
  return ((degrees % 360) * Math.PI) / 180;
}

/** Convert radians to degrees */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/** Given a latitude and zoom level, determine the max distance each segment can be in meters */
export function getZoomLevelResolution(latitude: number, zoom: number): number {
  return (
    (Math.cos((latitude * Math.PI) / 180.0) * 2 * Math.PI * 6378137) /
    (512 * 2 ** zoom)
  );
}

/** Convert a tile's zoom-x-y to a number hash */
export function xyzToTileID(x: number, y: number, zoom: number): number {
  return ((1 << zoom) * y + x) * 32 + zoom;
}
