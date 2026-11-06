/**
 * Makes MapLibre AttributionControl sanitize attributions properly
 *
 * Attributions come from styles and TileJSONs, which may not be trusted, but MapLibre only removes some of the
 * dangerous markup from them (it even skips the attribute after each one it removes). MapLibre AttributionControl
 * itself is patched, rather than only the SDK AttributionControl extending it, because that is the one the map
 * adds by default.
 */

import maplibregl from "maplibre-gl";
import type { AttributionControl as AttributionControlMLGL, StyleSpecification } from "maplibre-gl";
import { sanitizeHTML } from "./utils/sanitizeHTML";

/*
 * @license
 * This comes from:
 * https://github.com/maplibre/maplibre-gl-js/blob/v5.24.0/src/ui/control/attribution_control.ts
 * `AttributionControl._updateAttributions` is changed to sanitize each attribution with `sanitizeHTML` and insert
 * the resulting nodes, instead of setting `innerHTML` to all of them joined and sanitized with `DOM.sanitize`.
 * It also no longer resets `_editLink`, which nothing reads.
 *
 * Copyright (c) 2023, MapLibre contributors
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *     * Neither the name of MapLibre GL JS nor the names of its contributors
 *       may be used to endorse or promote products derived from this software
 *       without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *
 * Contains code from mapbox-gl-js v1.13 and earlier
 *
 * Version v1.13 of mapbox-gl-js and earlier are licensed under a BSD-3-Clause license
 *
 * Copyright (c) 2020, Mapbox
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Mapbox GL JS nor the names of its contributors
 *   may be used to endorse or promote products derived from this software
 *   without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function updateAttributions(this: AttributionControlMLGL) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!this._map.style) return;
  let attributions: string[] = [];
  if (this.options.customAttribution) {
    if (Array.isArray(this.options.customAttribution)) {
      attributions = attributions.concat(
        this.options.customAttribution.map((attribution) => {
          if (typeof attribution !== "string") return "";
          return attribution;
        }),
      );
    } else if (typeof this.options.customAttribution === "string") {
      attributions.push(this.options.customAttribution);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (this._map.style.stylesheet) {
    const stylesheet = this._map.style.stylesheet as StyleSpecification & { owner: string; id: string };
    this.styleOwner = stylesheet.owner;
    this.styleId = stylesheet.id;
  }

  const tileManagers = this._map.style.tileManagers;
  for (const id in tileManagers) {
    const tileManager = tileManagers[id];
    if (tileManager.used || tileManager.usedForTerrain) {
      const source = tileManager.getSource();
      if (source.attribution && !attributions.includes(source.attribution)) {
        attributions.push(source.attribution);
      }
    }
  }

  // remove any entries that are whitespace
  attributions = attributions.filter((e) => e.trim());

  // remove any entries that are substrings of another entry.
  // first sort by length so that substrings come first
  attributions.sort((a, b) => a.length - b.length);
  attributions = attributions.filter((attrib, i) => {
    for (let j = i + 1; j < attributions.length; j++) {
      if (attributions[j].includes(attrib)) {
        return false;
      }
    }
    return true;
  });

  // check if attribution string is different to minimize DOM changes
  const attribHTML = attributions.join(" | ");
  if (attribHTML === this._attribHTML) return;

  this._attribHTML = attribHTML;

  if (attributions.length) {
    // each attribution is sanitized on its own, so that markup left open in one cannot wrap the others
    const fragment = document.createDocumentFragment();
    for (const attribution of attributions) {
      const sanitizedAttribution = sanitizeHTML(attribution);
      if (!sanitizedAttribution.hasChildNodes()) continue;
      if (fragment.hasChildNodes()) fragment.append(" | ");
      fragment.append(sanitizedAttribution);
    }
    this._innerContainer.replaceChildren(fragment);
    this._container.classList.remove("maplibregl-attrib-empty");
  } else {
    this._container.classList.add("maplibregl-attrib-empty");
  }
  this._updateCompact();
}

maplibregl.AttributionControl.prototype._updateAttributions = updateAttributions;
