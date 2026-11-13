// Sets the MapLibre worker URL, as Vite users of the SDK do
import "@maptiler/sdk/vite-worker";
import { Language, Map, config } from "@maptiler/sdk";
import type { ExpressionSpecification, SymbolLayerSpecification } from "@maptiler/sdk";
import { setupMapTilerApiKey } from "../../shared/demo-utils";
import { createGui } from "../../shared/gui";
import { createLogPanelUI } from "../../shared/log-panel";

/**
 * Reproduces label problems reported on /maps (works in Map Designer / Cloud):
 * - streets-v4: airport ICAO codes not rendered
 * - topo-v5: peak elevations not rendered
 * - winter-v4: labels using ["get", "name"] in an expression (with elevation) don't follow the language
 *
 * After every style load or language change, the label layers whose `text-field` the SDK rewrote are listed
 * (console.table), with the feature properties the original referenced and the rewritten one no longer does.
 * Clicking a label logs its properties, and its original and current `text-field`.
 */

// Values likely to change. Same names in every demo, so they can be updated with grep or a script.
const MAP_STYLE = "streets-v4";

createLogPanelUI({ title: "Language report" });
setupMapTilerApiKey({ config });

const STYLES: Record<string, string> = {
  "Streets v4 (airport codes)": "streets-v4",
  "Topo v5 (peak elevations)": "topo-v5",
  "Winter v4 (name + ele expression)": "winter-v4",
  "Outdoor v2": "outdoor-v2",
  "Streets v2 (old, string text-fields)": "streets-v2",
};

const LOCATIONS: Record<string, { center: [number, number]; zoom: number }> = {
  "Prague airport (LKPR)": { center: [14.26, 50.1008], zoom: 13 },
  "Heathrow (EGLL)": { center: [-0.4543, 51.47], zoom: 12.5 },
  Matterhorn: { center: [7.6586, 45.9763], zoom: 13 },
  Sněžka: { center: [15.7397, 50.7361], zoom: 13 },
  "Sapporo Teine (winter report)": { center: [141.282516, 43.02687], zoom: 16.9 },
};

// Feature properties holding the label's name, everything else (ele, icao, iata, ref...) is extra content
const isNameProperty = (prop: string) => prop === "name" || prop.startsWith("name:") || prop.startsWith("name_");

/** Feature properties referenced by a text-field, from ["get", x] expressions and "{x}" tokens */
function referencedProperties(textField: unknown): string[] {
  const found = new Set<string>();
  const walk = (node: unknown) => {
    if (typeof node === "string") {
      for (const match of node.matchAll(/\{([^}]+)\}/g)) found.add(match[1]);
      return;
    }
    if (!Array.isArray(node)) return;
    if (node[0] === "get" && typeof node[1] === "string") found.add(node[1]);
    node.forEach(walk);
  };
  walk(textField);
  return [...found];
}

// The SDK keeps the text-fields as they were before its first language change on the style.
// Private, read here only to compare. Empty while the language has never been changed (Language.STYLE).
function originalTextField(map: Map, layerId: string): string | ExpressionSpecification | undefined {
  const originals = (map as unknown as { originalLabelStyle: globalThis.Map<string, string | ExpressionSpecification> }).originalLabelStyle;
  return originals.get(layerId) ?? (map.getLayoutProperty(layerId, "text-field") as string | ExpressionSpecification | undefined);
}

function report(map: Map, label: string) {
  const rows: Record<string, unknown>[] = [];
  for (const layer of map.getStyle().layers) {
    if (layer.type !== "symbol") continue;
    const current = map.getLayoutProperty(layer.id, "text-field") as unknown;
    if (current === undefined) continue;
    const original = originalTextField(map, layer.id);
    const changed = JSON.stringify(original) !== JSON.stringify(current);
    const originalExtras = referencedProperties(original).filter((p) => !isNameProperty(p));
    const currentProps = referencedProperties(current);
    const lost = originalExtras.filter((p) => !currentProps.includes(p));
    if (!changed && originalExtras.length === 0) continue;
    rows.push({
      layer: layer.id,
      sourceLayer: (layer as SymbolLayerSpecification)["source-layer"],
      changed,
      originalType: typeof original === "string" ? "string" : "expression",
      originalProps: referencedProperties(original).join(", "),
      currentProps: currentProps.join(", "),
      LOST: lost.join(", "),
    });
  }
  console.log(`— ${label} — language: ${map.getPrimaryLanguage().flag}, ${String(rows.length)} label layers changed or with extra content`);
  console.table(rows);
  const lostLayers = rows.filter((r) => r.LOST);
  if (lostLayers.length) {
    console.warn(`Content lost by the language change in: ${lostLayers.map((r) => `${String(r.layer)} (${String(r.LOST)})`).join("; ")}`);
  }
}

async function main() {
  // Starting with the style's own labels: the SDK doesn't touch them until a language is picked
  const map = new Map({
    container: "map",
    style: MAP_STYLE,
    hash: true,
    language: Language.STYLE,
    center: LOCATIONS["Prague airport (LKPR)"].center,
    zoom: LOCATIONS["Prague airport (LKPR)"].zoom,
  });

  await map.onReadyAsync();

  // label → key of `Language`
  const languages: Record<string, string> = {};
  Object.entries(Language).forEach(([key, language]) => {
    languages[language.name in languages ? `${language.name} (${key})` : language.name] = key;
  });

  const params = {
    style: MAP_STYLE,
    customStyle: "",
    language: "STYLE",
    location: "Prague airport (LKPR)",
    report: () => {
      report(map, "manual");
    },
    logLayerTextFields: () => {
      for (const layer of map.getStyle().layers) {
        if (layer.type !== "symbol") continue;
        console.info(layer.id, { original: originalTextField(map, layer.id), current: map.getLayoutProperty(layer.id, "text-field") });
      }
    },
  };

  // Reports once the map has settled after a style or language change
  const reportWhenIdle = (label: string) => {
    void map.once("idle", () => {
      report(map, label);
    });
  };

  const gui = createGui("Language / text-field");
  gui.add(params, "style", STYLES).onChange(() => {
    map.setStyle(params.style);
    reportWhenIdle(`style ${params.style}`);
  });
  gui
    .add(params, "customStyle")
    .name("style id / URL")
    .onFinishChange(() => {
      if (!params.customStyle) return;
      map.setStyle(params.customStyle);
      reportWhenIdle(`style ${params.customStyle}`);
    });
  gui.add(params, "language", languages).onChange(() => {
    map.setLanguage(Language[params.language as keyof typeof Language]);
    reportWhenIdle(`language ${params.language}`);
  });
  gui.add(params, "location", Object.keys(LOCATIONS)).onChange(() => {
    map.jumpTo(LOCATIONS[params.location]);
  });
  gui.add(params, "report").name("report changed label layers");
  gui.add(params, "logLayerTextFields").name("log all text-fields (info)");

  // Clicking a label logs what it's made from
  map.on("click", (e) => {
    const box: [[number, number], [number, number]] = [
      [e.point.x - 6, e.point.y - 6],
      [e.point.x + 6, e.point.y + 6],
    ];
    const features = map.queryRenderedFeatures(box).filter((f) => f.layer.type === "symbol");
    if (!features.length) {
      console.log("No label here");
      return;
    }
    for (const feature of features) {
      const props = feature.properties;
      // All the non-name properties, and only the names that matter here (there can be dozens of name:xx)
      const shownNames = ["name", "name:en", "name:latin", "name:nonlatin", `name:${map.getPrimaryLanguage().flag}`];
      const relevant = Object.fromEntries(Object.entries(props).filter(([k]) => !isNameProperty(k) || shownNames.includes(k)));
      console.log(`Label in "${feature.layer.id}"`, {
        properties: relevant,
        original: originalTextField(map, feature.layer.id),
        current: map.getLayoutProperty(feature.layer.id, "text-field"),
      });
    }
  });

  report(map, `initial style ${MAP_STYLE}`);
}

void main();
