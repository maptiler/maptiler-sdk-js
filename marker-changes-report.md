# Markers: changes since `dd72211`

**Baseline:** `dd72211`, Les's last commit (merge of PR #433, 2026-09-29).
**Branch:** `RD-1397-markers-qa`, branched from the baseline.
**Goal:** make the SDK markers match the "Map Controls UI [wip]" Figma design (Markers page) exactly, at every size. Along the way the design file itself was corrected wherever the code turned out to be the better reference.

**How it was checked:**

- Each shape, size and content type was rendered in the browser and compared pixel by pixel with Figma's own SVG export. Shapes and icons match exactly.
- `npm test`: 507 / 507 pass.
- `tsc` passes.
- eslint: 0 errors, and the same warning count as the baseline.

---

## At a glance

| Area | Before (`dd72211`) | After |
|---|---|---|
| Shape geometry | One drawing per shape in its own viewBox (32–40 units), scaled to each size | Exact geometry for each size (L / M / S), in px. The viewBox is the marker box, so 1 unit = 1 px |
| SVG primitives | Outer always a `<path>`; inner a `<circle>` or `<path>` | `<path>`, `<circle>` or `<rect>`, the same primitive Figma uses. Inner can be several elements |
| Anchor (bottom shapes) | Computed from `anchorY` and the viewBox scale | Tail tip sits on the box's bottom edge at every size → offset `-SIZE_PX / 2` |
| Text | 14 px at every size; `dominant-baseline: central`; tabular numerals; clipped to a circle of r = 14 | 14 / 12 / 8 px (L / M / S), a single character 15.5 / 13 / 10 px; baseline 5 / 4 / 3 px below the content centre (single character 5.5 / 4.5 / 3.5); weight 575; −6 % letter-spacing; clipped to the inner fill |
| Icons | `icon` option was a placeholder (rendered nothing, TODO) | 20 built-in icons (Figma "Icons for export", L drawing), scaled to 16 / 12 / 8 px |
| Default `maptiler` mark | Separate hard-coded diamond path (`defaultContent`) | The built-in `maptiler` icon, drawn exactly like `icon` content |
| Images | Clipped to the content circle (or `imageClip` where a shape had one). Bubble-square tail re-painted on top in the inner colour | Fill the whole inner area, edge to edge. On bubble-square the photo runs through the tail. Inner fill hidden underneath |
| Size change | Same SVG, `width` / `height` changed | SVG rebuilt with that size's geometry; content moved over (icons re-drawn for the new box) |
| Default shadow | `medium` for every size | Per size: L `strong`, M `medium`, S and XS `soft`. Re-resolved on size change while `shadow` is unset |
| XS dot | 8 px, inner colour with a 1 px outer-colour stroke, no shadow | 10 px: outer-colour disc with the inner disc 2 px inside it, marker shadow (soft by default) |

---

## Details

### 1. Shape geometry (`marker-svg-config.ts`)

**Before:** each shape had one `ShapeDescriptor` with `viewBox`, `anchorY`, `outerPath`, `inner`, `content` (a circle), and optional `imageClip`, `pointerPath` and `defaultContent`. The browser scaled that one drawing to 24 / 32 / 40 px, so ring widths and paddings scaled too. Figma draws every size separately: S has a 2 px ring, M and L a 3 px ring, with different paddings.

**After:**

- **Per-size geometry:** `ShapeDescriptor` is `{ anchor, defaultIcon?, sizes: { l, m, s } }`. Each size is a `ShapeGeometry`:
  - `outer`: the body.
  - `inner[]`: the fill.
  - `clip`: the content and image clip, with its bounding box.
  - `content`: the centre of the content box.
- **Values:** all values are the Figma export's own px coordinates.
- **Primitives:** they stay the type Figma uses (`circle`, `rect` with `rx`, or `path`). That way the browser anti-aliases the edges exactly like the design.
- **Checked first:** before adding geometry, I checked whether the sizes were really different drawings or the same drawing scaled. They are different (ring width and padding don't scale), which is why each size has its own entry.
- **Helpers:** `getShapeGeometry(shape, size, fallback = "m")` resolves the geometry. `xs` falls back, because a hidden shape SVG still needs valid numbers.
- **Removed:** `ShapeInner`, `ShapeImageClip`, `ShapeContent`, `ShapeDefaultContent`, `viewBox`, `anchorY`, `pointerPath` and `defaultContent`.

### 2. Anchor offset

**Before:** `-(anchorY * scale - heightPx / 2)`.

**After:** every bottom-anchored shape now has its tail tip on the bottom edge of the marker box, so the offset is `[0, -SIZE_PX[size] / 2]`. Center-anchored shapes and `xs` are unchanged (`[0, 0]`).

### 3. Content box and text

**Before:** content sat in a circle `r` from the descriptor:

- glyphs and elements were sized to `r * 1.4`;
- text was always 14 px, centred with `dominant-baseline: central`;
- text used tabular numerals and was clipped to a circle of r = 14.

**After:** `CONTENT_METRICS` (per size, in `marker-constants.ts`):

| Size | Content box | Icon box | Font | Baseline below centre |
|---|---|---|---|---|
| L | 20 | 16 | 14 (one character: 15.5) | 5 (one character: 5.5) |
| M | 16 | 12 | 12 (one character: 13) | 4 (one character: 4.5) |
| S | 12 | 8 | 8 (one character: 10) | 3 (one character: 3.5) |

- **One character:** a label of a single letter or digit is drawn larger (`CONTENT_METRICS[size].singleChar`), so it reads at a glance: L 15.5 px (baseline 5.5), M 13 px (baseline 4.5), S 10 px (baseline 3.5): about 10 % larger on L and M, 25 % on S, whose two-character text is the smallest. Each baseline puts the capitals a hair above the centre (L and S 0.14 px, M 0.23 px), which reads as centred; a whole-pixel baseline would put them visibly low or high. The half-pixel baselines make the bottom edge of single characters slightly softer on 1× screens. The size is re-picked whenever the label changes (`setTextLabel`). Figma has matching `Type=Single char` variants at every size.
- **Text position:** `y = cy + baseline`. Labels of two or more characters sit on a whole pixel, so letter bottoms stay crisp on 1× screens (the design had M / S on a half pixel, which read as text sitting low). Figma was updated to the same baselines.
- **Weight:** `TEXT_FONT_WEIGHT = 575`, between Medium (500) and SemiBold (600), so labels read more firmly. The marker font is a variable font covering 400–600; its `@font-face` in `style_template.css` now declares that range (`font-weight: 400 600`). Before, it declared 500 only, so any other weight would have been synthesised. Figma uses Inter at variable weight 575.
- **Letter spacing:** `TEXT_LETTER_SPACING_EM = -0.06`. The design had −8 %; −6 % was chosen during this QA and Figma was updated to match. SVG also adds spacing after the last glyph, so `x` is shifted by half a spacing to keep the glyphs themselves centred, as Figma does.
- **Clipping:** text, elements and images are clipped to the shape's inner fill, not to a fixed circle.
- **Numerals:** tabular numerals were dropped; the design uses Inter's default figures.

### 4. Icons (new)

**Before:** `MarkerContentTypeIcon.icon: string`, and `appendIconContent` was an empty placeholder with `TODO(icons)`.

**After:**

- **Source files:** `src/style/svg/marker-icons/*.svg`, 20 files exported as-is from Figma's "Icons for export" frame, L size (16 px). Next to them is the existing `v6-*.svg` control icons.
- **Loading:** they're loaded with `?raw` imports in `marker-icons.ts`, the same mechanism as the GLSL shaders.
  - That file holds `MARKER_ICON_NAMES` and `BUILT_IN_MARKER_ICONS`.
  - The list is checked against the public type with `satisfies`, and the record must have every key, so the list, the type and the files can't drift apart.
- **Registry:** `ICONS` sits in `marker-content-registry.ts` next to `TEMPLATES`, with `registerMarkerIcon` and `getMarkerIcon`. Like the template registry, it's internal and not exported publicly.
- **Rendering:** `appendIconContent`:
  - parses the markup once (cached, like `shapeSvgTemplates`) and clones it;
  - drops the file's own fills so the group's `var(--marker-content-color)` applies;
  - scales it from its viewBox to the size's icon box (16 / 12 / 8) and centres it on the content box;
  - tags the group with `data-icon`, so a size or shape change re-draws it.
- **Unknown names** log `Unknown marker icon "…"` and render nothing, the same pattern as unknown templates.
- **Why one size only:** M and S use the L drawing scaled down. Figma's separate M / S drawings were removed, so design and code use one source.
- **Bundle cost:** about 5 KB gzipped.
  - Research: no comparable SDK bundles POI icons in its core, so this was a deliberate decision.
  - Shipping only L keeps the cost down.

### 5. Default `maptiler` content

**Before:** `defaultContent: { d: <diamond path>, size: 12 }`, drawn unscaled at every size.

**After:** `defaultIcon: "maptiler"`. The mark is the built-in `maptiler` icon and goes through the same code as `icon: "cafe"`, so at L / M / S it's 12 / 9 / 6 px. It still carries `DEFAULT_CONTENT_CLASSNAME`, so shape changes don't treat it as user content. `icon: "maptiler"` also works explicitly.

### 6. Images

**Before:**

- Shapes with `imageClip` (square, bubble-square, maptiler-full) clipped to it. The others clipped to the content circle, so the photo didn't fill the inner area.
- On bubble-square the tail was painted on top in the inner colour, so the photo stopped at the body.

**After:**

- The image always covers the clip region: the whole inner fill. On bubble-square that's the body plus the tail, which is Figma's image mask.
- The inner-colour fill is hidden under an image (`setInnerFillHidden`). Otherwise it bleeds through the image's anti-aliased edge as a hairline between the photo and the ring.
- Replacing the image with text brings the fill back.
- `pointerPath` is gone.

### 7. Size changes (`applySize`, `applyShape`)

**Before:** changing the size only changed the SVG's `width` / `height`, since the drawing was scaled anyway.

**After:**

- A new size has a different geometry, so the SVG is rebuilt through `replaceShapeSvg`, shared by `applyShape` and `applySize`. It keeps the outline width, content and visibility.
- The SVG records the shape and size it was built for (`data-shape`, `data-size`). That way content placement stays correct while the marker is shown as an `xs` dot.

### 8. Shadows

**Before:** `DEFAULT_SHADOW = "medium"` for everything.

**After:**

- `DEFAULT_SHADOW_BY_SIZE = { xs: "soft", s: "soft", m: "medium", l: "strong" }`, as in the design.
- An explicit `shadow` always wins and is remembered in `data-marker-shadow`. While it's unset, a size change picks up the new size's default.
- `soft` keeps no blur (`0 1px 0 rgba(0,0,0,.2)`), as the SDK already had. Figma's soft style was changed to match.

### 9. XS dot

**Before:** an 8 px circle in the inner colour with a 1 px outer-colour stroke, and `filter: none`.

**After:**

- A 10 px outer-colour disc with an inner-colour disc `DOT_RING_PX` (2 px) inside it.
- It uses the marker shadow (soft by default).
- `SIZE_PX.xs` is 8 → 10. Collision footprints use `SIZE_PX`, so they follow automatically.

---

## Public API

| | Before | After |
|---|---|---|
| `MapTilerMarkerIcon` | — | **New** type: union of the 20 built-in icon names. Named like `MapTilerMarkerShape` / `Size` / `Shadow` and declared next to them in `types.ts` |
| `MarkerContentTypeIcon.icon` | `string` (placeholder, rendered nothing) | `MapTilerMarkerIcon` |
| `shadow` default (doc) | `"medium"` | Per size (see 8) |

No new exported functions. The icon registry stays internal, like `registerMarkerTemplate`.

## Constants (`marker-constants.ts`)

| Constant | Before | After |
|---|---|---|
| `DEFAULT_SHADOW` | `"medium"` | Replaced by `DEFAULT_SHADOW_BY_SIZE` (Defaults) |
| `SIZE_PX.xs` | 8 | 10 |
| `TEXT_CONTENT_FONT_SIZE` | 14 (Layout) | Removed → `CONTENT_METRICS` (Lookup Tables, per size) |
| `TEXT_LETTER_SPACING_EM` | — | −0.06 (Layout) |
| `TEXT_FONT_WEIGHT` | 500 (hard-coded) | 575 (Layout) |
| `DOT_RING_PX` | — | 2 (Layout) |

## Internal structure (`marker-dom-utils.ts`)

- **Layout:** `MarkerLayout` (`size`, `geometry`, `metrics`, `defaultIcon`) replaces passing a `ShapeDescriptor` to the content helpers. `getLayout` / `getSvgLayout` live in a new `//#region Layout`.
- **Primitives:** `buildInnerElement` → `buildPrimitive` (path / circle / rect), used for outer, inner, the dot and clip paths.
- **Clipping:** `appendContentClip(svg, layout)` clips to the geometry's clip primitive. The `radius` parameter is gone.
- **New helpers:** `replaceShapeSvg`, `applyShadow`, `setInnerFillHidden`, `parseIconSvg` (with an `iconTemplates` cache) and `setTextLabel` (text, size and position for a label, re-run when the label changes).

## Tests

- `marker-svg-config.test.ts`:
  - geometry for every shape and size;
  - content box stays inside the marker box;
  - content metrics;
  - `xs` fallback;
  - the anchor formula, rewritten for the new geometry.
- `marker-dom-utils.test.ts` covers:
  - the XS dot (size, ring, shadow);
  - icons: every built-in icon at every size, the default `maptiler` mark drawn like an icon, re-scaling on a size change, unknown-icon warning, replacement by text;
  - per-size shadow defaults, and re-resolving on a size change while an explicit shadow is kept;
  - photo through the bubble-square tail, and the inner fill hidden under an image;
  - the SVG rebuilt at the new size's geometry;
  - one-character labels larger than longer ones at every size, and re-sized when a label's length changes.

  The two old tests that expected `'none'` as the default shadow were rewritten.

## Dev setup

- **`vite.config-dev.ts` + `demo-utils.ts`:**
  - the dev server injects `MAPTILER_API_KEY` (from the shell or the gitignored `.env`) as `__MT_DEMO_API_KEY__`;
  - the stored key and `?key=` still work.

  **This affects every demo.**
- The QA was done with a local marker playground demo, which isn't part of this branch.

## Figma changes

The code was the reference. The design file was changed where it disagreed, always on the master components.

- **Text baselines:** M and S label `y` moved to whole-pixel baselines (4 / 3 px).
- **Soft shadow:** `Marker/Shadow/Soft` blur 2 → 0, and the Foundations "Soft" swatch label updated.
- **Icons:**
  - The M / S icon variants that differed (cafe, circle, square, mall, lodging) were replaced by the scaled L drawing. All M / S variants were then removed; every instance uses L, rescaled.
  - White icon fills on the M / S preview masters were restored after the swap.
- **MapTiler mark:**
  - Added as a 20th icon. The six "Symbol" content masters now use it.
  - The preview frames got a "maptiler" tile.
  - The blue mark on the 9 inverted default markers was restored after the rebuild.
- **XS dot:** the `dot-2px-outline-light` / `-dark` masters went 8 → 10 px with a 2 px ring, and the Foundations size swatch changed to "dot 10px".
- **Single-character labels:** new `Type=Single char` variants (L 15.5 px / baseline 5.5, M 13 px / 4.5, S 10 px / 3.5) in `_Content` and `_Marker content / L|M|S`, with component descriptions on every text variant and a line in the "Changes" frame.
- **Letter spacing:** −8 % → −6 % on every marker text label.
- **Weight:** Inter Medium (500) → Inter at variable weight 575 on every marker text label.

Full log: `marker-qa-notes.md`.

---

## Conventions check

I reviewed the diff against the structure at `dd72211` and aligned it. Every item below is a rename, move or comment. Rendering was checked before and after over 488 shape × size × content × shadow combinations plus a sequence of live updates. The markup is identical except for the internal attribute in the first row.

| Was | Now | Why |
|---|---|---|
| `data-shadow` on the wrapper | `data-marker-shadow` | Matches `data-marker-shape` / `data-marker-size` |
| Public type `MarkerIconName`, defined in `marker-icons.ts` and re-exported from `index.ts` | `MapTilerMarkerIcon`, a literal union in `types.ts` | Same naming and location as the other public value types |
| `CONTENT_METRICS`, `TEXT_LETTER_SPACING_EM` in `marker-svg-config.ts`; `DOT_RING_PX` under Lookup Tables | Moved to `marker-constants.ts` (Lookup Tables / Layout) | Follows Les's RD-2250 move of constants into `marker-constants.ts`; the text font size used to live in Layout |
| Layout helpers above the first `//#region` | Inside `//#region Layout` | Every block in the file sits in a region |
| Local `ShapeKey` alias | `NonNullable<MapTilerMarkerBaseOptions["shape"]>` | Matches the rest of the module |
| `attraction: attraction` … | Shorthand properties | |
| Stale comments ("the design has 8px", "the design renders M/S on a half pixel") | Updated | Figma now matches the code |

## Open points for Les

Status per point is in `marker-qa-notes.md` (table at the top).

1. **CHANGELOG.** Entries for this work are under `## NEXT`: design match, icons, shadows, the XS dot, the default `maptiler` colours, labels that shrink to fit, the font URL and the clip-path ids. The markers feature itself (the RD-2250 shapes, adaptive colours, the removed `color` option, the MapTiler Inter font) still has no entry; only its transitions API does. Add one before release?
2. **`marker-qa-notes.md`** sits in the repo root as working notes: a status table, the decisions, the Figma change log and the font notes. Keep it, move it to docs, or drop it before merge?
3. **Font on the CDN.** The OFL licence fields were stripped from `MapTilerInter.woff2` (copyright kept, licence text and URL gone). The plan is to publish `OFL.txt` next to the font in `sdk-assets/fonts/inter/`; someone with CDN access has to do it. *(A reading of the licence, not legal advice.)*
4. **Icon registry visibility.** `registerMarkerIcon` and `MARKER_ICON_NAMES` are internal, like the template registry. Should custom icons become public API?
5. **The default `maptiler` marker now looks different** (please review): blue body, white inner fill, blue mark, as in Figma, instead of the white body every other shape has. It applies when the colours are unset, so any marker that relies on the default changes. Details:
   - dark styles mirror it (light blue `#80A4FF` body and mark, `#292929` inner); Figma has no dark version, the designer has been asked to confirm;
   - `maptiler-full` and the other shapes keep the style's colours; colours set explicitly are never swapped;
   - the XS dot keeps the white ring and blue centre;
   - code: `INVERTED_COLOR_SHAPES`, `getAdaptiveColors(styleId, shape)`.

### Resolved since the first version of this report

- **Figma's "Semantic colours" names** now follow the SDK (`--marker-outer-color`, …, with "light" / "dark" for the map-style value).
- **UI states** (hover / focus / active) snap on purpose, as the setters ease through `transitions`.
- **Wide two-character labels** ("MW", "WW") are no longer cut off: a label wider than the inner fill shrinks until it fits (minimum 6 px). Labels that fit keep 14 / 12 / 8 px. Code: `marker-text-fit.ts`.
- **Clip-path IDs** carry a random per-module prefix (`maptiler-marker-clip-<prefix>-<n>`), so two copies of the SDK no longer collide.
- **Inter version:** the SDK's 4.001 is the reference; Figma moves to 4.x (noted for the designer in Figma).
- **Font URL:** now `https://`, so it loads on `http://` pages. The font stack still starts with `"Inter"` on purpose: a page's own Inter wins when present.
