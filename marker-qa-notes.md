# Marker QA notes

Figma: "Map Controls UI [wip]" → Markers page (`210:2`). Status: 2026-10-07.
What changed in the code, before and after: `marker-changes-report.md`.

## Open questions

1. **Inter version.** The SDK's font file is Inter 4.001; Figma appears to use 3.x. Text placement matches, but some glyphs differ ("1", "2"). → Agree on one version.
2. **Default `maptiler` marker colours.** Figma draws it inverted (blue body, white inner, blue mark); the SDK draws it like every other marker. Figma itself isn't consistent: one M tile in "All sizes preview" has a white body. → Pick the target.
3. **CSS variable names.** Figma's "Semantic colours" lists `--marker-outer-color-light` / `-dark` and `--marker-content-color-dark`. The SDK has one `--marker-outer-color`, `--marker-inner-color`, `--marker-content-color` and `--marker-outline-color`, resolved per map style. → Rename in Figma or add them to the code.
4. **Duplicate content components in Figma.** Light markers use `_Marker content / M|S`, dark ones `_Content`, so every content change has to be made twice. → Designer to merge.
5. **UI states don't animate.** Hover / focus / active skip transitions and snap to the new look (`applyUIStates` in `Marker.ts`). → Intended?
6. **Wide two-character labels get clipped.** A wide label like "MW" at 12 px on an M circle is wider than the 20 px inner fill, so its sides are cut off. → Shrink text that doesn't fit, or accept?
7. **Clip-path IDs can collide** between two copies of the SDK on one page (module-level counter). Predates the QA. → Prefix IDs per instance.

## Decisions (code is the reference)

- **Shapes:** exact Figma geometry per size, pixel-identical at L / M / S.
- **Text (two or more characters):** baselines on whole pixels, 5 / 4 / 3 px below the content centre. Figma moved from 4.5 / 2.5 at M / S.
- **Single-character labels:** one letter or digit is drawn larger: L 15.5 px (baseline 5.5), M 13 px (baseline 4.5), S 10 px (baseline 3.5), so their capitals sit a hair above the centre. The half-pixel baselines make them slightly softer on 1× screens. Two or more characters keep 14 / 12 / 8 px. Same in Figma (`Type=Single char`).
- **Icons:** only the L drawing is bundled and scaled to 12 / 8 px; Figma's M / S variants were removed.
- **MapTiler mark:** the built-in `maptiler` icon, drawn like any icon (12 / 9 / 6 px).
- **Letter spacing:** −6 % at every size (was −8 %). Same in Figma.
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
| Soft shadow blur 2 → 0; swatch label updated | Effect style `Marker/Shadow/Soft`; Foundations text `444:3976` |
| Icons: differing M / S drawings replaced by scaled L; then all M / S variants removed, every instance swapped to L | "Map icons" (`680:2441`) |
| Icon previews: white fill restored after the swap | `_Marker icons / M` and `/ S` (`_Helper for icons`) |
| MapTiler mark added as icon 20; the six "Symbol" content masters now use it; "maptiler" tile added to the L / M / S previews | "Map icons", `_Content`, `_Marker content / L|M|S`, the preview frames |
| Blue mark restored on the 9 inverted default markers after the rebuild | `444:2144`, `444:2531`, `444:3942`, `444:3950`, `444:3958`, `444:3966`, `578:1876`, `578:1893`, `578:1910` |
| XS dot 8 → 10 px, 2 px ring; size swatch "dot 10px" | `dot-2px-outline-light` (`444:4337`) and `-dark` (`578:5125`); Foundations `216:2415` / `216:2416` |

## "MapTiler Inter" font

Added in `8968ad3` (RD-2250): `//cdn.maptiler.com/sdk-assets/fonts/inter/MapTilerInter.woff2`, about 25 KB. It's a Latin-only subset of Inter 4.001, variable weight 400–600; weight 500 renders correctly.

1. **OFL licence fields were stripped** from the file. The copyright is kept, but the licence text and URL are missing. Fix: keep them when subsetting (`pyftsubset --name-IDs='*'`) or publish `OFL.txt` next to the font. *(A reading of the licence, not legal advice.)*
2. **The protocol-relative URL fails on `http://` pages** (e.g. localhost). The CDN redirects to https without CORS headers, so the font is blocked. Fix: use `https://`.
3. **The font stack starts with `"Inter"`,** so a page's or OS's own Inter wins over the bundled file and labels can differ between sites.
