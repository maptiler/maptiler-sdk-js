import "../../dist/maptiler-sdk.css";
import { Map as MapTiler, type StyleSpecification } from "../../src/index";

// Attributions as a malicious style or TileJSON could provide them
const attributions = [
  // MapLibre skips the attribute that follows each one it removes
  '<img src="https://evil.example/pixel.png" onfoo="1" onerror="window.__attributionScriptExecuted = true">',
  '<a onclick="1" href="javascript:window.__attributionScriptExecuted = true">javascript: link</a>',
  // Not covered by MapLibre's list of dangerous attributes
  '<iframe srcdoc="<script>parent.__attributionScriptExecuted = true</script>"></iframe>',
  '<form action="javascript:window.__attributionScriptExecuted = true"><button>submit</button></form>',
  '<svg><a><animate attributeName="href" values="javascript:window.__attributionScriptExecuted = true"/><text y="20">SVG link</text></a></svg>',
  // Affect the whole page
  '© Base <base href="https://evil.example/">',
  "© Style <style>body { outline: 5px solid red }</style>",
  // Left open, it wraps the attributions that follow
  '<a href="//evil.example">',
  "© OpenStreetMap contributors",
];

const style: StyleSpecification = {
  version: 8,
  sources: Object.fromEntries(
    attributions.map((attribution, i) => [`source-${i}`, { type: "geojson", data: { type: "FeatureCollection", features: [] }, attribution }]),
  ),
  layers: attributions.map((_, i) => ({ id: `layer-${i}`, type: "circle", source: `source-${i}` })),
};

const map = new MapTiler({
  container: "map",
  apiKey: "DOESNT_MATTER",
  style,
});

window.__map = map;
