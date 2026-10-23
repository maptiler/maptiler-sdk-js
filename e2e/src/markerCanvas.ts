import "../../dist/maptiler-sdk.css";
import type { MapTilerMarkerShape, MapTilerMarkerSize, MarkerStyle } from "../../src/Marker/types";
import { createMarkerElement } from "../../src/Marker/marker-dom-utils";
import { drawMarkerCanvas } from "../../src/Marker/marker-canvas";
import { SHAPES } from "../../src/Marker/marker-svg-config";
import { getAdaptiveColors } from "../../src/Marker/marker-adaptive-colors";
import { CONTENT_METRICS, MARKER_FONT_FAMILY, TEXT_FONT_WEIGHT } from "../../src/Marker/marker-constants";

// Every marker drawn twice — as a DOM marker (SVG) and as a canvas image — in
// same-sized cells, so the test can compare each pair pixel for pixel. No map involved.

const shapes = Object.keys(SHAPES) as MapTilerMarkerShape[];
const sizes: MapTilerMarkerSize[] = ["l", "m", "s", "xs"];

const variants: Record<string, MarkerStyle> = {
  text: { size: "m", content: "AB" },
  "single-char": { size: "l", content: "7" },
  outline: { size: "m", outline: true },
  "custom-colors": { size: "m", outerColor: "#ffd166", innerColor: "#ef476f", contentColor: "#073b4c", outlineColor: "#118ab2", outline: 3 },
  "no-shadow": { size: "l", shadow: "none" },
};

function buildCases(): { id: string; style: MarkerStyle }[] {
  const cases: { id: string; style: MarkerStyle }[] = [];
  for (const shape of shapes) {
    for (const size of sizes) cases.push({ id: `${shape}-${size}`, style: { shape, size } });
    for (const [name, variant] of Object.entries(variants)) cases.push({ id: `${shape}-${name}`, style: { shape, ...variant } });
  }
  return cases;
}

function cell(kind: "dom" | "canvas", id: string, child: HTMLElement): HTMLDivElement {
  const div = document.createElement("div");
  div.className = "cell";
  div.dataset.case = id;
  div.dataset.kind = kind;
  div.appendChild(child);
  return div;
}

async function main() {
  // the canvas draws text with whatever font is loaded at the time — load the marker font first,
  // so both renderers use it (a failed load leaves both on the same fallback)
  try {
    await document.fonts.load(`${String(TEXT_FONT_WEIGHT)} ${String(CONTENT_METRICS.l.font)}px ${MARKER_FONT_FAMILY}`);
  } catch {
    // fall back together
  }

  const pixelRatio = window.devicePixelRatio || 1;
  const grid = document.getElementById("grid");
  if (!grid) throw new Error("Missing #grid");

  for (const { id, style } of buildCases()) {
    // the DOM marker has no map, so it only resolves the `base` colours itself — give it the same ones explicitly
    const domEl = createMarkerElement({ ...getAdaptiveColors("", style.shape), ...style });

    const { canvas } = drawMarkerCanvas(style, { pixelRatio });
    canvas.style.width = `${String(canvas.width / pixelRatio)}px`;
    canvas.style.height = `${String(canvas.height / pixelRatio)}px`;

    const pair = document.createElement("div");
    pair.className = "pair";
    pair.append(cell("dom", id, domEl), cell("canvas", id, canvas));
    grid.appendChild(pair);
  }

  // DOM labels refit once the font has loaded — let that land before the test looks
  await document.fonts.ready;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.dataset.ready = "true";
    });
  });
}

void main();
