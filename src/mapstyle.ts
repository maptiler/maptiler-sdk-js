import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { MapStyle, ReferenceMapStyle, MapStyleVariant, mapStylePresetList, expandMapStyle } from "@maptiler/client";

export function styleToStyle(
  style: string | ReferenceMapStyle | MapStyleVariant | maplibregl.StyleSpecification | null | undefined,
): { style: string | maplibregl.StyleSpecification; requiresUrlMonitoring: boolean } {
  if (!style) {
    return {
      style: MapStyle[mapStylePresetList[0].referenceStyleID as keyof typeof MapStyle]
        .getDefaultVariant()
        .getExpandedStyleURL(),
      requiresUrlMonitoring: false, // default styles don't require URL monitoring
    };
  }

  // If the provided style is a shorthand (eg. "streets-v2") or a full style URL
  if (typeof style === "string") {
    // The string could be a JSON valid style spec
    const validStyleObj = convertToStyleSpecificationString(style);
    if (validStyleObj) {
      return {
        style: validStyleObj,
        requiresUrlMonitoring: false,
      };
    }

    // The style is an absolute URL
    if (style.startsWith("http")) {
      return { style: style, requiresUrlMonitoring: true };
    }

    // The style is a relative URL
    if (style.toLowerCase().includes(".json")) {
      return { style: urlToAbsoluteUrl(style), requiresUrlMonitoring: true };
    }

    // The style is a shorthand like "streets-v2" or a MapTiler Style ID (UUID)
    return { style: expandMapStyle(style), requiresUrlMonitoring: true };
  }

  if (style instanceof MapStyleVariant) {
    // Built-in style variants don't require URL monitoring
    return { style: style.getExpandedStyleURL(), requiresUrlMonitoring: false };
  }

  if (style instanceof ReferenceMapStyle) {
    // Built-in reference map styles don't require URL monitoring
    return {
      style: (style.getDefaultVariant() as MapStyleVariant).getExpandedStyleURL(),
      requiresUrlMonitoring: false,
    };
  }

  // Style objects are not URL, hence don't require URL monitoring
  return {
    style: style as maplibregl.StyleSpecification,
    requiresUrlMonitoring: false,
  };
}

/**
 * makes sure a URL is absolute
 */
export function urlToAbsoluteUrl(url: string): string {
  // Trying to make a URL instance only works with absolute URL or when a base is provided
  try {
    const u = new URL(url);
    return u.href;
  } catch (e) {
    // nothing to raise
  }

  // Absolute URL did not work, we are building it using the current domain
  const u = new URL(url, location.origin);
  return u.href;
}

export function convertToStyleSpecificationString(str: string): maplibregl.StyleSpecification | null {
  try {
    const styleObj = JSON.parse(str);
    const styleErrs = validateStyleMin(styleObj);
    return styleErrs.length === 0 ? (styleObj as maplibregl.StyleSpecification) : null;
  } catch (e) {
    return null;
  }
}
