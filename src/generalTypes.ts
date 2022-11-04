export type LngLat = {
  lng: number;
  lat: number;
};

export type LngLatArray = [number, number];

export type Bbox = {
  southWest: LngLat;
  northEast: LngLat;
};
