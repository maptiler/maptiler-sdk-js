/**
 * WGS84 longitude and latitude as object
 */
export type LngLat = {
  /**
   * Longitude
   */
  lng: number;
  /**
   * Latitude
   */
  lat: number;
};

/**
 * WGS84 longitude and latitude as array of the form [lng, lat]
 */
export type LngLatArray = [number, number];

/**
 * Bounding box (lng/lat axis aligned)
 */
export type Bbox = {
  /**
   * South-west corner WGS84 coordinates
   */
  southWest: LngLat;

  /**
   * North-east corner WGS84 coordinates
   */
  northEast: LngLat;
};
