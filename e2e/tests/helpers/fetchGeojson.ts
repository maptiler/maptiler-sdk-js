import { KeyframeableGeoJSONFeature } from "../../../src";

type GeoJSON = {
  type: "FeatureCollection";
  features: KeyframeableGeoJSONFeature[];
};

export default async function fetchGeoJSON(assetUrl: string): Promise<GeoJSON> {
  try {
    const response = await fetch(assetUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
    }

    const geojson = await response.json();
    return geojson as GeoJSON;
  } catch (e) {
    throw e;
  }
}
