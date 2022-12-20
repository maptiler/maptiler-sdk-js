import { MapStyleVariant, ReferenceMapStyle } from "./mapstyle";

type MapStylePresetList = Array<{
  referenceStyleID: string;
  name: string;
  description: string;
  variants: Array<{
    id: string;
    name: string;
    variantType: string;
    description: string;
    imageURL: string;
  }>;
}>;

/**
 * All the styles and variants maintained by MapTiler.
 */
export type MapStyleType = {
  /**
   * Suitable for navigation, with high level of detail on urban areas.
   */
  STREETS: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
    /**
     * Suitable for navigation, with high level of detail on urban areas, in dark mode.
     */
    DARK: MapStyleVariant;
    /**
     * Suitable for navigation, with high level of detail on urban areas, in light mode.
     */
    LIGHT: MapStyleVariant;
    /**
     * Suitable for navigation, with high level of detail on urban areas, with a pastel color palette.
     */
    PASTEL: MapStyleVariant;
  };

  /**
   * Suitable for outdoor activities. With elevation isolines and hillshading.
   */
  OUTDOOR: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
  };

  /**
   * Suitabe for winter outdoor activities. With ski tracks, elevation isolines and hillshading.
   */
  WINTER: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
  };

  /**
   * High resolution imagery only, without any label.
   */
  SATELLITE: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
  };

  /**
   * High resolution imagery with labels, political borders and roads.
   */
  HYBRID: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
  };

  BASIC: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
    DARK: MapStyleVariant;
    LIGHT: MapStyleVariant;
  };

  BRIGHT: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
    DARK: MapStyleVariant;
    LIGHT: MapStyleVariant;
    PASTEL: MapStyleVariant;
  };

  OPENSTREETMAP: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
  };

  TOPO: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
    SHINY: MapStyleVariant;
    PASTEL: MapStyleVariant;
    TOPOGRAPHIQUE: MapStyleVariant;
  };

  VOYAGER: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
    DARK: MapStyleVariant;
    LIGHT: MapStyleVariant;
    VINTAGE: MapStyleVariant;
  };

  TONER: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
    BACKGROUND: MapStyleVariant;
    LITE: MapStyleVariant;
    LINES: MapStyleVariant;
  };
};

export const mapStylePresetList: MapStylePresetList = [
  {
    referenceStyleID: "STREETS",
    name: "Streets",
    description: "",
    variants: [
      {
        id: "streets-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
      {
        id: "streets-v2-dark",
        name: "Dark",
        variantType: "DARK",
        description: "",
        imageURL: "",
      },
      {
        id: "streets-v2-light",
        name: "Light",
        variantType: "LIGHT",
        description: "",
        imageURL: "",
      },
      {
        id: "streets-v2-pastel",
        name: "Pastel",
        variantType: "PASTEL",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "OUTDOOR",
    name: "Outdoor",
    description: "",
    variants: [
      {
        id: "outdoor-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "WINTER",
    name: "Winter",
    description: "",
    variants: [
      {
        id: "winter-v2",
        name: "Winter",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "SATELLITE",
    name: "Satellite",
    description: "",
    variants: [
      {
        id: "satellite",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "HYBRID",
    name: "Hybrid",
    description: "",
    variants: [
      {
        id: "hybrid",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "BASIC",
    name: "Basic",
    description: "",
    variants: [
      {
        id: "basic-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
      {
        id: "basic-v2-dark",
        name: "Dark",
        variantType: "DARK",
        description: "",
        imageURL: "",
      },
      {
        id: "basic-v2-light",
        name: "Light",
        variantType: "LIGHT",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "BRIGHT",
    name: "Bright",
    description: "",
    variants: [
      {
        id: "bright-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
      {
        id: "bright-v2-dark",
        name: "Dark",
        variantType: "DARK",
        description: "",
        imageURL: "",
      },
      {
        id: "bright-v2-light",
        name: "Light",
        variantType: "LIGHT",
        description: "",
        imageURL: "",
      },
      {
        id: "bright-v2-pastel",
        name: "Pastel",
        variantType: "PASTEL",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "OPENSTREETMAP",
    name: "OpenStreetMap",
    description: "",
    variants: [
      {
        id: "openstreetmap",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "TOPO",
    name: "Topo",
    description: "",
    variants: [
      {
        id: "topo-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
      {
        id: "topo-v2-shiny",
        name: "Shiny",
        variantType: "SHINY",
        description: "",
        imageURL: "",
      },
      {
        id: "topo-v2-pastel",
        name: "Pastel",
        variantType: "PASTEL",
        description: "",
        imageURL: "",
      },
      {
        id: "topo-v2-topographique",
        name: "Topographique",
        variantType: "TOPOGRAPHIQUE",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "VOYAGER",
    name: "Voyager",
    description: "",
    variants: [
      {
        id: "voyager-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
      {
        id: "voyager-v2-darkmatter",
        name: "Darkmatter",
        variantType: "DARK",
        description: "",
        imageURL: "",
      },
      {
        id: "voyager-v2-positron",
        name: "Positron",
        variantType: "LIGHT",
        description: "",
        imageURL: "",
      },
      {
        id: "voyager-v2-vintage",
        name: "Vintage",
        variantType: "VINTAGE",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "TONER",
    name: "Toner",
    description: "",
    variants: [
      {
        id: "toner-v2",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
      {
        id: "toner-v2-background",
        name: "Background",
        variantType: "BACKGROUND",
        description: "",
        imageURL: "",
      },
      {
        id: "toner-v2-lite",
        name: "Lite",
        variantType: "LITE",
        description: "",
        imageURL: "",
      },
      {
        id: "toner-v2-lines",
        name: "Lines",
        variantType: "LINES",
        description: "",
        imageURL: "",
      },
    ],
  },
];
