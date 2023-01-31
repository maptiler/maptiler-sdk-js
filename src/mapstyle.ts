import {
  MapStyle,
  ReferenceMapStyle,
  MapStyleVariant,
  mapStylePresetList,
  expandMapStyle,
} from "@maptiler/client";

export function styleToStyle(
  style:
    | string
    | ReferenceMapStyle
    | MapStyleVariant
    | maplibregl.StyleSpecification
    | null
    | undefined
): string | maplibregl.StyleSpecification {
  if (!style) {
    return MapStyle[mapStylePresetList[0].referenceStyleID]
      .getDefaultVariant()
      .getExpandedStyleURL();
  }

  // If the provided style is a shorthand (eg. "streets-v2") or a full style URL
  if (typeof style === "string" || style instanceof String) {
    return expandMapStyle(style);
  }

  if (style instanceof MapStyleVariant) {
    return style.getExpandedStyleURL();
  }

  if (style instanceof ReferenceMapStyle) {
    return (style.getDefaultVariant() as MapStyleVariant).getExpandedStyleURL();
  }

  return style as maplibregl.StyleSpecification;
}
