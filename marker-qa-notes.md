# Marker QA notes

Figma: "Map Controls UI [wip]" → Markers page (`210:2`). Status: 2026-10-09.
What changed in the code, before and after: `marker-changes-report.md`.

## Status at a glance

✅ resolved (done, or handed to the designer in a Figma note) · 🟡 decided, work remains elsewhere (CDN) · 🔶 waiting for a decision · 🆗 accepted as is, no change · ❓ still waiting on someone

The designer's to-do list is a note in Figma, on the Markers page next to "Changes" (`729:9769`). Items marked "noted in Figma" are resolved on the SDK side; the designer still has to do the Figma work.

Code references are `file:line` in the working tree (nothing is committed yet, so no commit hashes); Figma references are node ids.

The SDK changes of 2026-10-09 are in the working tree, not committed.

| # | Item | Status | What is left | Change made in this session |
|---|---|---|---|---|
| 1 | Inter version | ✅ | Noted in Figma (`729:9769`, item 1): designer moves Figma to Inter 4.x | Figma note `729:9769` |
| 2 | Default `maptiler` marker colours | ✅ | SDK done. Noted in Figma (`729:9769`, items 2, 3): fix the masters (M `443:975`, L `578:2704`, S `444:1051`), confirm the dark look | `marker-constants.ts:87`, `marker-adaptive-colors.ts:58`, `marker-dom-utils.ts:85`, `:177`, `:553`, `:564`, `Marker.ts:396`, `:654`; Figma note `729:9769` |
| 3 | CSS variable names | ✅ | Optional swatch for `--marker-outline-color`: noted in Figma (`729:9769`, item 5) | Figma `216:2396`, `578:5151`, `216:2404`, `614:3773`, `216:2391` |
| 4 | Duplicate content components | ✅ | `_Content` kept as an archive on "Markers - initial designs" | Figma `578:5007`…`578:5123`, `I578:1901;578:2713`, `I578:5171;578:2723`, `425:2813`, `729:9768` |
| 5 | UI states don't animate | 🆗 | Intended | none; unchanged `Marker.ts:944` (`applyUIStates`) |
| 6 | Wide two-character labels clipped | ✅ | SDK done. Noted in Figma (`729:9769`, item 4): add the shrink-to-fit rule | `marker-text-fit.ts:84` (`fitLabel`), `:68`, `:49`; `marker-dom-utils.ts:1043`, `:1056`; `marker-constants.ts:195`–`204`; Figma note `729:9769` |
| 7 | Clip-path ID collisions | ✅ | | `marker-dom-utils.ts:814`, `:1001` |
| F1 | Font: OFL licence fields stripped | 🟡 ❓ | Publish `OFL.txt` next to the font on the CDN | none (CDN side) |
| F2 | Font: `//` URL fails on `http://` | ✅ | | `style_template.css:7` |
| F3 | Font: stack starts with `"Inter"` | 🆗 | Accepted | none; unchanged `style_template.css:12` |

## Items

1. ✅ **Inter version.** The SDK's font file is Inter 4.001; Figma appears to use 3.x. Text placement matches, but some glyphs differ ("1", "2"). Decided 2026-10-09: the SDK's 4.001 is the reference. → Figma moves to Inter 4.x (designer; the variable weight 575 needs the variable font). **Figma:** note `729:9769` (item 1).
2. ✅ **Default `maptiler` marker colours.** **Status: SDK done; Figma work noted in Figma (`729:9769`).** Decided 2026-10-09: Figma is the reference. The default `maptiler` marker is blue outside, white inside, with a blue mark; the SDK now draws it that way (see Decisions). The white-bodied M tiles in Figma's "All sizes preview" (e.g. `444:2161`, `444:2162`) come from the master `type=marker-maptiler` (M `443:975`, L `578:2704`, S `444:1051`), which is still white outside; the blue-outside tiles are instance overrides (e.g. `444:3950`). The designer fixes the masters (see the Figma note). **Code:** `INVERTED_COLOR_SHAPES` (`marker-constants.ts:87`), `getAdaptiveColors(styleId, shape)` (`marker-adaptive-colors.ts:58`), defaults resolved with the shape in `applyMarkerStyleVariables` (`marker-dom-utils.ts:85`) and `updateMarkerElement` (`:177`), dot colours `buildDotSvg` / `orientDotColors` (`:553`, `:564`), `getEffectiveColor` (`Marker.ts:396`), `setShape` refresh (`Marker.ts:654`). Tests: `test/Marker/marker-adaptive-colors.test.ts`, `marker-dom-utils.test.ts`, `Marker.test.ts`. **Figma:** note `729:9769` (items 2, 3).
3. ✅ **CSS variable names.** Resolved 2026-10-09: Figma now uses the SDK's names (see Figma changes). Figma has no swatch for `--marker-outline-color` yet. **Figma:** `216:2396`, `578:5151`, `216:2404`, `614:3773` (labels), `216:2391` (intro line). No code change. The optional outline swatch is item 5 of the Figma note `729:9769`.
4. ✅ **Duplicate content components in Figma.** Light markers use `_Marker content / L|M|S`, dark ones used `_Content`, so every content change had to be made twice. 2026-10-09: all 20 `_Content` instances on the Markers page (the 18 dark masters and 2 hidden doc layers) now use `_Marker content / L|M|S`; dark labels keep the `content/dark` fill. `_Content` (`425:2813`) is kept, not deleted: 98 instances of it remain on the page "Markers - initial designs", so it moved there (section `729:9768`, marked archived in its description). Live markers no longer use it. **Figma:** `578:5007`…`578:5123`, `I578:1901;578:2713`, `I578:5171;578:2723`, `425:2813`, `729:9768`. No code change.
5. 🆗 **UI states don't animate.** Intended (2026-10-09): hover / focus / active / dragging snap to the new look without easing (`applyUIStates` in `Marker.ts`). Setters still ease through `transitions`. **Code:** none; `applyUIStates` (`Marker.ts:944`) stays as it is.
6. ✅ **Wide two-character labels get clipped.** **Status: SDK done; Figma rule noted in Figma (`729:9769`).** Fixed 2026-10-09: a label wider than the inner fill is shrunk until it fits (see Decisions). **Figma doesn't have this rule yet:** "MW" on M is 9.3 px in the SDK, 12 px in Figma (clipped there). → Designer to add it. **Code:** `fitLabel` (`marker-text-fit.ts:84`) with `availableWidth` (`:68`) and `whenLabelFontReady` (`:49`), used by `setTextLabel` / `placeTextLabel` (`marker-dom-utils.ts:1043`, `:1056`); constants `marker-constants.ts:195`–`204`. Tests: `test/Marker/marker-text-fit.test.ts`. **Figma:** note `729:9769` (item 4).
7. ✅ **Clip-path IDs can collide** between two copies of the SDK on one page (module-level counter). Fixed 2026-10-09: ids now carry a random per-module prefix (`maptiler-marker-clip-<prefix>-<n>`). **Code:** `clipIdPrefix` (`marker-dom-utils.ts:814`), used in `appendContentClip` (`:1001`).

## Decisions (code is the reference)

- **Shapes:** exact Figma geometry per size, pixel-identical at L / M / S.
- **Text (two or more characters):** baselines on whole pixels, 5 / 4 / 3 px below the content centre. Figma moved from 4.5 / 2.5 at M / S.
- **Single-character labels:** one letter or digit is drawn larger: L 15.5 px (baseline 5.5), M 13 px (baseline 4.5), S 10 px (baseline 3.5), so their capitals sit a hair above the centre. The half-pixel baselines make them slightly softer on 1× screens. Two or more characters keep 14 / 12 / 8 px. Same in Figma (`Type=Single char`).
- **Default `maptiler` colours:** the `maptiler` shape (the default) swaps the style's colours when they aren't set: the accent on the body and the mark, the body colour inside. Light styles: blue `#4D7FFF` body, white inner, blue mark. Dark styles (no Figma reference, chosen to mirror it): light blue `#80A4FF` body and mark, `#292929` inner. Other shapes, `maptiler-full` included, keep the style's colours; colours set explicitly are never swapped. The xs dot keeps Figma's white ring and blue centre. (`getAdaptiveColors(styleId, shape)`, `INVERTED_COLOR_SHAPES`.)
- **Labels that don't fit:** a label of two or more characters that is wider than the inner fill is shrunk to fit, never clipped (`marker-text-fit.ts`). Labels that fit keep 14 / 12 / 8 px. The width is measured in the marker font (canvas) against the fill's width, and for circular fills against the chord at the cap line, which is narrower than the diameter; 1 px is kept free. The baseline scales with the size, on a whole pixel. Floor 6 px: a longer label than that fits is clipped. Re-fitted once the font has loaded. Examples: "MW" on M 12 → 9.3 px, "WW" on L 14 → 11.7 px, "WW" on S 8 → 7 px; "00", "AB", "12" unchanged.
- **Icons:** only the L drawing is bundled and scaled to 12 / 8 px; Figma's M / S variants were removed.
- **MapTiler mark:** the built-in `maptiler` icon, drawn like any icon (12 / 9 / 6 px).
- **Letter spacing:** −6 % at every size (was −8 %). Same in Figma.
- **Weight:** 575 (was 500 / Medium), real weight from the variable font — `@font-face` now declares 400–600. Same in Figma (Inter, variable weight 575).
- **Photo in bubble-square:** runs through the tail, like Figma's image mask. Bubble-circle is unchanged; its tail belongs to the outer body.
- **Shadows:** L strong, M medium, S and XS soft. Soft has no blur.
- **XS dot:** 10 px with a 2 px ring, soft shadow.

## Figma changes (2026-10-07)

All made on master components, so every instance follows.

| Change | Where |
|---|---|
| Text `label` y: M 3.5 → 3, S 2.5 → 3 | `_Content` (`444:2911`, `444:2913`), `_Marker content / M` and `/ S` |
| New `Type=Single char` variants: L 15.5 px / baseline 5.5, M 13 px / 4.5, S 10 px / 3.5; descriptions on all text variants; "Changes" frame lines (frame 1008 → 1067 px tall) | `_Content` (`715:13358`, `715:13362`, `715:13240`), `_Marker content / L` `/ M` `/ S` (`715:13360`, `715:13364`, `715:13242`), Changes (`578:5153`) |
| Letter spacing −8 % → −6 % on every text label (12 masters; 169 labels follow) | `_Content`, `_Marker content / L|M|S` |
| Weight Inter Medium → variable weight 575 on every text label (12 masters; 168 labels follow); "Changes" frame line updated | `_Content`, `_Marker content / L|M|S`, Changes (`578:5153`) |
| Soft shadow blur 2 → 0; swatch label updated | Effect style `Marker/Shadow/Soft`; Foundations text `444:3976` |
| Icons: differing M / S drawings replaced by scaled L; then all M / S variants removed, every instance swapped to L | "Map icons" (`680:2441`) |
| Icon previews: white fill restored after the swap | `_Marker icons / M` and `/ S` (`_Helper for icons`) |
| MapTiler mark added as icon 20; the six "Symbol" content masters now use it; "maptiler" tile added to the L / M / S previews | "Map icons", `_Content`, `_Marker content / L|M|S`, the preview frames |
| Blue mark restored on the 9 inverted default markers after the rebuild | `444:2144`, `444:2531`, `444:3942`, `444:3950`, `444:3958`, `444:3966`, `578:1876`, `578:1893`, `578:1910` |
| XS dot 8 → 10 px, 2 px ring; size swatch "dot 10px" | `dot-2px-outline-light` (`444:4337`) and `-dark` (`578:5125`); Foundations `216:2415` / `216:2416` |
| CSS variable names follow the SDK: `--marker-outer-color`, `--marker-content-color` (labels end in "· light" / "· dark" for the map-style value); intro line updated. Token names (`color/outer-light`, …) and the `Marker/Colors` variables are unchanged | Foundations → Semantic colours (`216:2388`): `216:2396`, `578:5151`, `216:2404`, `614:3773`, `216:2391` |
| Dark masters and 2 doc layers moved from `_Content` onto `_Marker content / L|M|S` (`Type=Text` / `None` / `Icon`); label fill still bound to `content/dark`; no visible change (screenshots compared). Restore point in version history: "Before merging _Content into _Marker content / L|M|S" | `578:5007`…`578:5123` (18 dark masters), `I578:1901;578:2713`, `I578:5171;578:2723` |
| `_Content` moved from Foundations to the page "Markers - initial designs" (section "Archived · _Content …"), description marks it superseded; its 98 instances there stay linked | `425:2813`, section `729:9768` |
| Note for the designer, with the open Figma work (Inter 4.x, default `maptiler` masters, dark look, label fit rule, outline swatch) | Markers page, left of "Changes": `729:9769` |

## "MapTiler Inter" font

Added in `8968ad3` (RD-2250): `//cdn.maptiler.com/sdk-assets/fonts/inter/MapTilerInter.woff2`, about 25 KB. It's a Latin-only subset of Inter 4.001, variable weight 400–600; weight 500 renders correctly.

1. 🟡❓ **OFL licence fields were stripped** from the file. The copyright is kept, but the licence text and URL are missing. *(A reading of the licence, not legal advice.)* **Needed. Plan (2026-10-09): publish `OFL.txt` next to the font on the CDN** (`sdk-assets/fonts/inter/`), and leave the font file as it is. To do on the CDN side; not in this repo. The cleaner alternative, keeping the name tables when subsetting (`pyftsubset --name-IDs='*'`) and re-uploading the font, stays an option. No code change (CDN side).
2. ✅ **The protocol-relative URL fails on `http://` pages** (e.g. localhost). Fixed 2026-10-09: the font URL in `style_template.css` is now `https://`. Background: The URL starts with `//`, so the browser reuses the page's protocol. On an `http://` page it asks the CDN for `http://…`, the CDN redirects to https without CORS headers, and the browser refuses the font. Markers then fall back to the system font and their text shifts. Fix: use `https://`. **Code:** `style_template.css:7`.
3. 🆗 **The font stack starts with `"Inter"`,** so a page's or OS's own Inter wins over the bundled file and labels can differ between sites (glyphs, and no variable weight 575 if that Inter isn't variable). Accepted as is (2026-10-09): the page's own Inter is used when present, and the bundled file is the fallback. Putting `"MapTiler Inter"` first would make markers identical everywhere, at the cost of always downloading the font. **Code:** none; `style_template.css:12` stays as it is.
