import * as maplibre from 'maplibre-gl'

export default class  LngLat extends maplibre.LngLat {
  constructor(lng: number, lat: number) {
    super(lng, lat);
  }

  setToNull(): void {
    this.lng = 0;
    this.lat = 0;
  }
}