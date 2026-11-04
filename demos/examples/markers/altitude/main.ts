// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Map, MapStyle, Marker, config } from "@maptiler/sdk";
import { setupMapTilerApiKey } from "../../../shared/demo-utils";

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAPTILER_API_KEY = "API_KEY";
const MAP_STYLE = MapStyle.HYBRID.DEFAULT;

setupMapTilerApiKey({ config, apiKey: MAPTILER_API_KEY });

async function main() {
  // Glencoe, Scotland: steep glen walls, so the altitude is easy to see against the terrain
  const map = new Map({
    container: "map",
    style: MAP_STYLE,
    center: [-5.005, 56.662],
    zoom: 12.5,
    pitch: 60,
    bearing: -20,
    terrain: true,
  });

  await map.onLoadAsync();

  // Both markers fly at the same height above sea level, so their ground lines show the terrain under them:
  // long over the glen floor, short over the summit of Bidean nam Bian (1,150 m).
  // Drag a marker: it keeps its altitude, and its ground line follows the terrain below.
  const altitude = 1300;

  const helicopter = new Marker({ lngLat: [-4.988, 56.672], icon: "hospital", title: "Mountain rescue, 1,300 m above sea level", draggable: true });
  map.addMarker(helicopter);
  helicopter.setAltitude(altitude, { relativeTo: "sea" }).setGroundLine(true);

  const summit = new Marker({ lngLat: [-5.029, 56.643], icon: "flag", title: "Summit, 1,300 m above sea level", draggable: true });
  map.addMarker(summit);
  summit.setAltitude(altitude, { relativeTo: "sea" }).setGroundLine(true);
}

void main();
