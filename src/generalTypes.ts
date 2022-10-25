export type lngLatType = {
  lng: number;
  lat: number;
};

export type lngLatArrayType = [number, number];

export type bboxType = {
  southWest: lngLatType;
  northEast: lngLatType;
};
