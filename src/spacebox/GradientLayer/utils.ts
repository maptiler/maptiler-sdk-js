import type { LngLat } from "maplibre-gl";

function getAntipode(lngLat: LngLat) {
  const { lat, lng } = lngLat;
  const antipodeLat = -lat;

  let antipodeLng = lng + 180;

  if (antipodeLng > 180) {
    antipodeLng -= 360;
  } else if (antipodeLng < -180) {
    antipodeLng += 360;
  }

  return { lat: antipodeLat, lng: antipodeLng };
}

export { getAntipode };
