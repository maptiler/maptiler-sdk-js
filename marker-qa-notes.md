# Marker QA notes

Branch: `RD-1397-markers` · Figma: "Map Controls UI [wip]" → Markers page, frame "Foundations" (`216:2281`) and "Icons for export" (`678:2494`)

## Open questions — Figma vs SDK

Status as of 2026-10-07. "Verified" means a pixel-by-pixel comparison of the SDK's rendering against Figma's own export.

### In sync (verified)

- **Shapes** — all 6 types at L / M / S: identical to Figma.
- **Text placement** — font size 14 / 12 / 8, −8 % letter-spacing, baseline 5 / 4 / 3 px below the content centre. Figma was updated to the whole-pixel baselines on 2026-10-07 (see "Figma changes made" below).
- **Icons** — all 20 (19 map icons + the `maptiler` mark) identical to Figma's "Map icons" set, byte for byte; M/S are the L drawing scaled in both.
- **Default shadow per size** — L strong, M medium, S soft, xs dot soft (code: `DEFAULT_SHADOW_BY_SIZE`; an explicit `shadow` option wins). Shadow parameters match Figma's exports for all sizes after the soft change below.

### Open questions

1. **Icons at M and S — resolved.**
   Decision (2026-10-07): **the code is the reference** — the SDK bundles only the L drawing and scales it to 12 / 8 px. Figma's M/S variants that differed (cafe M, circle M+S, square M+S, mall M+S, lodging M) were replaced with the scaled L drawing (see "Figma changes made").

2. **XS dot size — resolved.**
   Decision (2026-10-07): the dot is **10 px with a 2 px ring** (6 px fill), soft shadow. SDK and Figma both updated (see "Figma changes made").

3. **XS dot shadow — resolved.**
   Decision (2026-10-07): the dot uses the marker's shadow, **soft by default** (previously it had none). Matches Figma.

4. **Photo in bubble-square — resolved.**
   Decision (2026-10-07): the photo **runs through the tail**, as Figma's image mask does (body + tail). Previously the SDK stopped the photo at the body and painted the tail in the inner colour. Bubble-circle is unchanged: its tail belongs to the white outer body, and Figma's mask there is just the inner circle.

5. **Soft shadow blur — resolved.**
   Decision (2026-10-07): soft has **no blur**: `0 1px 0px rgba(0,0,0,0.2)`, as the SDK already had. Figma's `Marker/Shadow/Soft` style was updated to match (it had 2 px blur).

6. **Text glyph shapes (font version).**
   Placement matches, but the glyphs differ slightly: Figma uses Inter (apparently 3.x), the SDK bundles Inter 4.001 ("1" and "2" are drawn differently). See the font notes below.
   → Agree on one Inter version.

7. **MapTiler mark (default `maptiler` marker) — resolved.**
   Decision (2026-10-07): the default `maptiler` marker is built exactly like an icon-type marker. The MapTiler mark is the built-in icon `maptiler` (`src/style/svg/marker-icons/maptiler.svg`, exported from Figma's L symbol box), drawn through the same code path as `icon: "cafe"`: 16 px icon box at L, scaled to 12 / 8 px. The mark is therefore 12 / 9 / 6 px at L / M / S (Figma's M was 10 px — updated in Figma to 9 px). `icon: "maptiler"` also works.

8. **Duplicate content components in Figma.**
   Light markers use `_Marker content / M|S`, dark markers use `_Content` — two parallel sets for the same thing. Any future content change has to be made twice.
   → Designer to merge them.

9. **Default `maptiler` marker colours (whole-page audit of `210:2`).**
   In Figma the default marker (content `Type=Symbol`) is **inverted**: outer blue `#4D7FFF` (`inner/blue`), inner white (`outer/light`), mark blue (`inner/blue`). The SDK draws it like every other marker: white outer, blue inner, white mark. Figma isn't consistent either: in "All sizes preview" one M Symbol tile has a white outer.
   → Decide which one is the target.

10. **CSS variable names in "Semantic colours".**
    Figma documents `--marker-outer-color-light`, `--marker-outer-color-dark` and `--marker-content-color-dark`. The SDK has single `--marker-outer-color`, `--marker-inner-color`, `--marker-content-color` and `--marker-outline-color` variables, resolved per map style. The colour values match; only the names differ.
    → Rename in Figma, or add the variables to the code.

### Figma changes made (2026-10-07)

Only the `y` position of the text layer `label` was changed, to put the text baseline on a whole pixel at M and S (the old half-pixel baseline made labels look like they sit low on 1× screens):

| Component set | Variant | Layer | y before → after |
|---|---|---|---|
| `_Content` | `Size=M, Type=Text` | `label` (`444:2911`) | 3.5 → 3 |
| `_Content` | `Size=S, Type=Text` | `label` (`444:2913`) | 2.5 → 3 |
| `_Marker content / M` | `Type=Text` | `label` (in `686:5274`) | 3.5 → 3 |
| `_Marker content / S` | `Type=Text` | `label` (in `686:5326`) | 2.5 → 3 |

Verified afterwards on all 24 M/S marker components (light + dark) from Figma's outlined-text export: baselines are 4 px (M) and 3 px (S) below the content centre, matching the SDK.

Soft shadow aligned with the SDK (no blur):

| What | Node | Before → after |
|---|---|---|
| Effect style `Marker/Shadow/Soft` (used by all S markers, both dots and the Foundations "Soft" swatch) | style `S:acce0f2d…` | blur 2 → 0 |
| Foundations "Shadows" → "Soft" swatch label | text `444:3976` | `0px 1px 2px 0px …` → `0px 1px 0px 0px …` (styling kept identical to the Medium / Strong labels) |

Icons — M/S variants made exactly the L drawing scaled to 12 / 8 px (code is the reference). Only the `glyph` vector's geometry and position were changed, in place, so the layers' fills and the 193 instances using them are kept:

| Component set "Map icons" (`680:2441`) | Variants changed |
|---|---|
| `Icon=cafe` | M |
| `Icon=circle` | M, S |
| `Icon=square` | M, S |
| `Icon=mall` | M, S |
| `Icon=lodging` | M |

Verified from Figma's export: each matches the scaled L drawing within 0.0001 px. The other 14 icons were already scaled L.

Icons — M and S variants removed from "Map icons"; everything now uses the **L** variant, scaled, as the SDK does:

- The 40 instances inside master components (`_Marker icons / M` and `/ S` — one per icon — plus `_Content` › `Size=M|S, Type=Icon`) were swapped to the L variant and rescaled to 12 / 8 px. Position and size unchanged within 0.001 px; colour overrides kept. The 76 instances nested in other instances followed their masters. Afterwards 0 instances referenced an M/S variant.
- Then the 38 M/S variants and the "M" / "S" column headers were deleted; the "Map icons" set is now 19 variants (L only), the "Icons for export" frame was narrowed, and its subtitle now reads "19 icons · drawn at L (16px) — The SDK scales them to M (12px) and S (8px)."

Follow-up fix: swapping the M/S icon instances to the L variant dropped the white colour override the previews had on the old M/S glyph layer, so M/S previews showed black icons. Fixed on the masters in `_Helper for icons`: the glyph in every `_Marker icons / M` and `/ S` component (38) now uses the same fill as the L previews — white, bound to the variable `color/content`. Afterwards every M/S icon in "M marker – all icons preview", "S marker – all icons preview" and "All sizes preview" is white again.

MapTiler mark as an icon (masters on the Markers page):

- "Map icons" got a 20th variant `Icon=maptiler, Size=L` (the MapTiler mark, 12 px centred in the 16 px box) — byte-identical to the SDK's `maptiler.svg`. Row label "maptiler" added; subtitle now "20 icons · …".
- The six Symbol content masters — `_Content` › `Size=L|M|S, Type=Symbol` and `_Marker content / L|M|S` › `Type=Symbol` — now hold an instance of that icon in the standard icon box (16 / 12 / 8 px at 2,2), instead of a separate vector. Fill kept (white, `color/content`). L and S render unchanged; M went from a 10 px to a 9 px mark (centred), matching the SDK.
- Not changed: the older copies on the "Markers - v1" page (no instances).
- Follow-up fix: the rebuild dropped the blue mark override on the 9 inverted default markers (blue body, white inner). Their marks turned white on white. The glyph fill was restored to blue, bound to `inner/blue`, as on the v1 page. The 9 instances: `444:2144`, `444:2531`, `444:3942`, `444:3950`, `444:3958`, `444:3966`, `578:1876`, `578:1893`, `578:1910`.
- `_Marker icons / L`, `/ M`, `/ S` (in `_Helper for icons`) got an `Icon=maptiler` variant each — cloned from `Icon=water`, swapped to the new icon, same box / scale / fill as the other icons.
- "L / M / S marker – all icons preview" each got a 20th tile, "maptiler", in the next grid slot after "water", wired like the other tiles (icon property `Icon = maptiler`).

XS dot — 8 px / 1 px ring → 10 px / 2 px ring, on the master components:

| Node | Change |
|---|---|
| `dot-2px-outline-light` › `type=marker-dot` (`444:4337`, the master — 39 instances, all now 10×10) | 8×8 → 10×10; `outer` ellipse 10×10 at 0,0; `inner` ellipse 6×6 at 2,2 |
| `dot-2px-outline-dark` › `type=marker-dot` (`578:5125`, no instances) | same, to keep light and dark identical |
| Foundations › Sizes › `size/xs` swatch (`216:2415`) and label (`216:2416`) | swatch 8 → 10 px (radius 5); "dot 8px" → "dot 10px" |

Verified from Figma's export of the light master: circles r = 5 and r = 3 centred in 10×10 — identical to the SDK's dot.

---

## "MapTiler Inter" font

Noted: 2026-10-06. Introduced in commit `8968ad3` (2026-09-22, "RD-2250 Design updates"): adds the `@font-face "MapTiler Inter"` and the `.maptiler-sdk-marker-font` class in `src/style/style_template.css`.

### What the font file actually is

URL: `//cdn.maptiler.com/sdk-assets/fonts/inter/MapTilerInter.woff2` (~25 KB)

- A trimmed copy of the open-source **Inter** typeface (rsms/inter). Internal metadata still says family "Inter", copyright "2016 The Inter Project Authors", **version 4.001**.
- Variable font, `wght` axis only, **400–600**, default **400 (Regular)**. No `opsz` axis.
- 319 characters (Latin only), matching the CSS `unicode-range`.

### Issues to report

1. **License text and URL removed from the font file (OFL 1.1 compliance).**
   Inter is licensed under the SIL Open Font License 1.1. Subsetting, redistributing from a CDN, bundling in commercial software and keeping the name "Inter" are all allowed (Inter has no Reserved Font Name). But OFL requires every copy to carry the copyright notice **and** the license. The file keeps the copyright, but the license description and license URL name-table entries were stripped. No OFL text was found in the repo or next to the file (the CDN wasn't searched).
   *Fix:* keep or restore the license fields when subsetting (e.g. `pyftsubset --name-IDs='*'`), and/or publish `OFL.txt` next to the font on the CDN.
   *(This is a reading of the license, not legal advice.)*

2. **Inter version may differ from the design.**
   The file is Inter **4.001**. The Figma file reports Inter with `slnt` + `wght` axes, which is typical of Inter **3.x**. Inter 4 changed spacing and some glyph shapes, so marker labels may not match Figma pixel for pixel even when size and placement are correct.
   *To check:* which Inter version the designer's Figma uses; align the subset to it, or agree that 4.x is the target.

3. **Weight range and default.**
   The CSS declares `font-weight: 500`, but the file's default instance is 400. Verified 2026-10-06: the browser does render weight 500 (stem thickness matches Figma's Medium). The file only covers 400–600.

4. **Font fails to load on plain-http pages.**
   The URL is protocol-relative (`//cdn…`). On an `http://` page (e.g. `http://localhost` in dev) it requests http. The CDN then answers with a 301 redirect to https without CORS headers, and the browser blocks the font (console error: "blocked by CORS policy"). On https pages it loads fine.
   *Fix:* use an explicit `https://` URL.

5. **Font stack order.**
   `.maptiler-sdk-marker-font` is `"Inter", "MapTiler Inter", system-ui, …`. If the host page or OS already has some other Inter version, that one wins over the bundled file, so marker text can render differently from one site to another.
