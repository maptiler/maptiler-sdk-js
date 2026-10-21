import "../../dist/maptiler-sdk.css";
import type { MapTilerMarkerOptions, MarkerStyle } from "../../src/Marker/types";
import { createMarkerElement } from "../../src/Marker/marker-dom-utils";
import { drawMarkerCanvas } from "../../src/Marker/marker-canvas";
import { SHAPES } from "../../src/Marker/marker-svg-config";
import { getAdaptiveColors } from "../../src/Marker/marker-adaptive-colors";
import { CONTENT_METRICS, MARKER_FONT_FAMILY, SHADOW_PARAMS, SIZE_PX, TEXT_FONT_WEIGHT } from "../../src/Marker/marker-constants";
import { el } from "./demo-utils";

// Parity grid for the GL marker images: every shape × size × shadow drawn
// both as a DOM marker (SVG, marker-dom-utils.ts) and as a canvas image
// (marker-canvas.ts). No map involved — this only checks the two renderers
// produce the same pixels.

const shapes = Object.keys(SHAPES) as (keyof typeof SHAPES)[];
const sizes = Object.keys(SIZE_PX) as (keyof typeof SIZE_PX)[];
const shadows = Object.keys(SHADOW_PARAMS) as (keyof typeof SHADOW_PARAMS)[];

const customColors = { outerColor: "#ffd166", innerColor: "#ef476f", contentColor: "#073b4c", outlineColor: "#118ab2" };

const controls = {
  mode: el<HTMLSelectElement>("mode"),
  pixelRatio: el<HTMLSelectElement>("pixel-ratio"),
  content: el<HTMLSelectElement>("content"),
  outline: el<HTMLSelectElement>("outline"),
  colors: el<HTMLSelectElement>("colors"),
  bg: el<HTMLSelectElement>("bg"),
};

function readOutline(): MarkerStyle["outline"] {
  const value = controls.outline.value;
  if (!value) return undefined;
  return value === "true" ? true : Number(value);
}

function render() {
  document.body.dataset.mode = controls.mode.value;
  document.body.dataset.bg = controls.bg.value;

  const pixelRatio = controls.pixelRatio.value === "device" ? window.devicePixelRatio || 1 : Number(controls.pixelRatio.value);
  const overlay = controls.mode.value === "overlay";

  // adaptive mode: the canvas resolves colours from the style id itself, while
  // the DOM marker (which only resolves `base` without a map) gets them explicitly
  const colorMode = controls.colors.value;
  const styleId = colorMode.startsWith("adaptive:") ? colorMode.slice("adaptive:".length) : "";
  const canvasColors = colorMode === "custom" ? customColors : {};

  const baseStyle: MarkerStyle = {
    content: controls.content.value || undefined,
    outline: readOutline(),
  };

  const grids = el("grids");
  grids.replaceChildren();

  for (const shape of shapes) {
    const heading = document.createElement("h2");
    heading.textContent = shape;
    grids.appendChild(heading);

    // adaptive defaults depend on the shape (some swap their colours)
    const domColors = colorMode === "custom" ? customColors : getAdaptiveColors(styleId, shape);

    const table = document.createElement("table");
    const headRow = table.insertRow();
    headRow.appendChild(document.createElement("th"));
    for (const size of sizes) {
      const th = document.createElement("th");
      th.textContent = size;
      headRow.appendChild(th);
    }

    for (const shadow of shadows) {
      const row = table.insertRow();
      const rowHead = document.createElement("th");
      rowHead.textContent = shadow;
      row.appendChild(rowHead);

      for (const size of sizes) {
        const style: MarkerStyle = { ...baseStyle, shape, size, shadow };
        const domOptions: MapTilerMarkerOptions = { ...style, ...domColors };

        const domEl = createMarkerElement(domOptions);
        const canvasEl = toDisplayCanvas(style, canvasColors, styleId, pixelRatio);

        const pair = document.createElement("div");
        pair.className = "pair";
        if (overlay) {
          pair.appendChild(createSlot("diff", domEl, canvasEl));
        } else {
          pair.appendChild(createSlot("dom", domEl));
          pair.appendChild(createSlot("canvas", canvasEl));
        }

        row.insertCell().appendChild(pair);
      }
    }

    grids.appendChild(table);
  }
}

/** Draws the canvas image and sizes it to CSS px, so it lines up with the DOM marker. */
function toDisplayCanvas(style: MarkerStyle, colors: Partial<MarkerStyle>, styleId: string, pixelRatio: number): HTMLCanvasElement {
  const { canvas, padding } = drawMarkerCanvas({ ...style, ...colors }, { pixelRatio, styleId });
  const cssSize = canvas.width / pixelRatio;
  canvas.style.width = `${String(cssSize)}px`;
  canvas.style.height = `${String(cssSize)}px`;
  canvas.title = `${String(canvas.width)}×${String(canvas.height)} device px, ${String(padding)}px padding`;
  return canvas;
}

function createSlot(label: string, ...children: HTMLElement[]): HTMLDivElement {
  const slot = document.createElement("div");
  slot.className = "slot";

  const labelEl = document.createElement("span");
  labelEl.className = "slot-label";
  labelEl.textContent = label;

  slot.append(labelEl, ...children);
  return slot;
}

async function main() {
  // canvas text uses whatever font is loaded at draw time — the DOM text would
  // swap in the web font later, the canvas wouldn't. A failed load still lets
  // both fall back to the same family, so the grid stays comparable.
  try {
    await document.fonts.load(`${String(TEXT_FONT_WEIGHT)} ${String(CONTENT_METRICS.l.font)}px ${MARKER_FONT_FAMILY}`);
  } catch (error) {
    console.warn("Marker font failed to load, text falls back to the next family.", error);
  }

  for (const control of Object.values(controls)) {
    control.addEventListener("change", render);
  }

  render();
}

void main();
