import { MapStyle, ReferenceMapStyle, MapStyleVariant, mapStylePresetList, expandMapStyle } from "@maptiler/client";
import { config } from "./config";
import { defaults } from "./defaults";

export function styleToStyle(
  style: string | ReferenceMapStyle | MapStyleVariant | maplibregl.StyleSpecification | null | undefined,
  onStyleUrlNotFound?: (url: string) => void,
): string | maplibregl.StyleSpecification {
  if (!style) {
    return MapStyle[mapStylePresetList[0].referenceStyleID as keyof typeof MapStyle]
      .getDefaultVariant()
      .getExpandedStyleURL();
  }

  // If the provided style is a shorthand (eg. "streets-v2") or a full style URL
  if (typeof style === "string" || style instanceof String) {
    let styleURL: string;

    if (!style.startsWith("http") && style.toLowerCase().includes(".json")) {
      // If a style does not start by http but still contains the extension ".json"
      // we assume it's a relative path to a style json file
      styleURL = style as string;
    } else {
      styleURL = expandMapStyle(style);
    }

    // Validating the style by fetching at the URL.
    // If the response is not "ok", the optional callback is executed
    if (onStyleUrlNotFound) {
      validateRemoteStyle(styleURL).then((isStyleOK) => {
        if (!isStyleOK) {
          onStyleUrlNotFound(styleURL);
        }
      });
    }

    return styleURL;
  }

  if (style instanceof MapStyleVariant) {
    return style.getExpandedStyleURL();
  }

  if (style instanceof ReferenceMapStyle) {
    return (style.getDefaultVariant() as MapStyleVariant).getExpandedStyleURL();
  }

  return style as maplibregl.StyleSpecification;
}

/**
 * Tests if a distant style URL resolves
 */
export async function validateRemoteStyle(styleURL: string): Promise<boolean> {
  let url: URL;

  if (styleURL.startsWith("http")) {
    url = new URL(styleURL);
    if (url.host === defaults.maptilerApiHost && url.searchParams.get("key") === null) {
      url.searchParams.set("key", config.apiKey);
    }
  } else {
    url = new URL(styleURL, location.origin);
  }

  const res = await fetch(url.href);
  return res.ok;
}
