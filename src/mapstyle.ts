import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { MapStyle, ReferenceMapStyle, MapStyleVariant, mapStylePresetList, expandMapStyle } from "@maptiler/client";

export function styleToStyle(style: string | ReferenceMapStyle | MapStyleVariant | maplibregl.StyleSpecification | null | undefined): {
  style: string | maplibregl.StyleSpecification;
  requiresUrlMonitoring: boolean;
  isFallback: boolean;
  isJSON?: boolean;
} {
  if (!style) {
    return {
      style: MapStyle[mapStylePresetList[0].referenceStyleID as keyof typeof MapStyle].getDefaultVariant().getExpandedStyleURL(),
      requiresUrlMonitoring: false, // default styles don't require URL monitoring
      isFallback: true,
    };
  }

  // If the provided style is a shorthand (eg. "streets-v2") or a full style URL
  if (typeof style === "string") {
    // The string could be a JSON valid style spec
    const styleValidationReport = convertStringToStyleSpecification(style);

    // The string is a valid JSON style that validates against the StyleSpecification spec:
    // Let's use this style
    if (styleValidationReport.isValidStyle) {
      return {
        style: styleValidationReport.styleObject!,
        requiresUrlMonitoring: false,
        isFallback: false,
      };
    }

    // The string is a valid JSON but not of an object that validates the StyleSpecification spec:
    // Fallback to the default style
    if (styleValidationReport.isValidJSON) {
      return {
        style: MapStyle[mapStylePresetList[0].referenceStyleID as keyof typeof MapStyle].getDefaultVariant().getExpandedStyleURL(),
        requiresUrlMonitoring: false, // default styles don't require URL monitoring
        isFallback: true,
      };
    }

    // The style is an absolute URL
    if (style.startsWith("http")) {
      return { style: style, requiresUrlMonitoring: true, isFallback: false };
    }

    // The style is a relative URL
    if (style.toLowerCase().includes(".json")) {
      return {
        style: urlToAbsoluteUrl(style),
        requiresUrlMonitoring: true,
        isFallback: false,
      };
    }

    // The style is a shorthand like "streets-v2" or a MapTiler Style ID (UUID)
    return {
      style: expandMapStyle(style),
      requiresUrlMonitoring: true,
      isFallback: false,
    };
  }

  if (style instanceof MapStyleVariant) {
    // Built-in style variants don't require URL monitoring
    return {
      style: style.getExpandedStyleURL(),
      requiresUrlMonitoring: false,
      isFallback: false,
    };
  }

  if (style instanceof ReferenceMapStyle) {
    // Built-in reference map styles don't require URL monitoring
    return {
      style: (style.getDefaultVariant() as MapStyleVariant).getExpandedStyleURL(),
      requiresUrlMonitoring: false,
      isFallback: false,
    };
  }

  // If the style validates as a StyleSpecification object, we use it
  if (validateStyleMin(style).length === 0) {
    return {
      style: style as maplibregl.StyleSpecification,
      requiresUrlMonitoring: false,
      isFallback: false,
      isJSON: true,
    };
  }
  // If none of the previous attempts to detect a valid style failed => fallback to default style
  const fallbackStyle = MapStyle[mapStylePresetList[0].referenceStyleID as keyof typeof MapStyle].getDefaultVariant();
  return {
    style: fallbackStyle.getExpandedStyleURL(),
    requiresUrlMonitoring: false, // default styles don't require URL monitoring
    isFallback: true,
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
  } catch (_e) {
    // nothing to raise
  }

  // Absolute URL did not work, we are building it using the current domain
  const u = new URL(url, location.origin);
  return u.href;
}

type StyleValidationReport = {
  isValidJSON: boolean;
  isValidStyle: boolean;
  styleObject: maplibregl.StyleSpecification | null;
};

export function convertStringToStyleSpecification(str: string): StyleValidationReport {
  try {
    const styleObj = JSON.parse(str);
    const styleErrs = validateStyleMin(styleObj);

    return {
      isValidJSON: true,
      isValidStyle: styleErrs.length === 0,
      styleObject: styleErrs.length === 0 ? (styleObj as maplibregl.StyleSpecification) : null,
    };
  } catch (_e) {
    return {
      isValidJSON: false,
      isValidStyle: false,
      styleObject: null,
    };
  }
}

/**
 * Derives the MapTiler style id (e.g. `"streets-v4-dark"`) from a style input,
 * without expanding or fetching it.
 * Returns `undefined` for custom `StyleSpecification`s and URLs that don't
 * follow the MapTiler Cloud `/maps/<id>/style.json` shape.
 */
export function styleToStyleId(style: string | ReferenceMapStyle | MapStyleVariant | maplibregl.StyleSpecification | null | undefined): string | undefined {
  if (!style) {
    // same default as styleToStyle()
    return MapStyle[mapStylePresetList[0].referenceStyleID as keyof typeof MapStyle].getDefaultVariant().getId();
  }

  if (style instanceof MapStyleVariant) return style.getId();

  if (style instanceof ReferenceMapStyle) return (style.getDefaultVariant() as MapStyleVariant).getId();

  if (typeof style === "string") {
    const urlMatch = /\/maps\/([^/]+)\/style\.json/.exec(style);
    if (urlMatch) return urlMatch[1];

    // other URLs and inline JSON styles carry no derivable id
    if (style.startsWith("http") || style.toLowerCase().includes(".json") || style.trim().startsWith("{")) return undefined;

    // shorthand ("streets-v4", possibly "maptiler://streets-v4") or a MapTiler Cloud style UUID
    return style.replace("maptiler://", "");
  }

  const id = (style as { id?: unknown }).id;
  return typeof id === "string" ? id : undefined;
}
