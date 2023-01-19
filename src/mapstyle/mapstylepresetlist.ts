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
   * Suitable for navigation, with high level of detail on urban areas, plenty of POIs and 3D buildings
   */
  STREETS: ReferenceMapStyle & {
    /**
     * Suitable for navigation, with high level of detail on urban areas, plenty of POIs and 3D buildings.
     */
    DEFAULT: MapStyleVariant;
    /**
     * Suitable for navigation, with high level of detail on urban areas, plenty of POIs and 3D buildings, in dark mode.
     */
    DARK: MapStyleVariant;
    /**
     * Suitable for navigation, with high level of detail on urban areas, plenty of POIs and 3D buildings, in light mode.
     */
    LIGHT: MapStyleVariant;
    /**
     * Suitable for navigation, with high level of detail on urban areas, plenty of POIs and 3D buildings, with a pastel color palette.
     */
    PASTEL: MapStyleVariant;
  };

  /**
   * Suitable for outdoor activities. With elevation isolines and hillshading.
   */
  OUTDOOR: ReferenceMapStyle & {
    /**
     * Suitable for outdoor activities. With elevation isolines and hillshading.
     */
    DEFAULT: MapStyleVariant;
  };

  /**
   * Suitabe for winter outdoor activities. With ski tracks, elevation isolines and hillshading.
   */
  WINTER: ReferenceMapStyle & {
    /**
     * Suitabe for winter outdoor activities. With ski tracks, elevation isolines and hillshading.
     */
    DEFAULT: MapStyleVariant;
  };

  /**
   * High resolution imagery only, without any label.
   */
  SATELLITE: ReferenceMapStyle & {
    /**
     * High resolution imagery only, without any label.
     */
    DEFAULT: MapStyleVariant;
  };

  /**
   * High resolution imagery with labels, political borders and roads.
   */
  HYBRID: ReferenceMapStyle & {
    /**
     * High resolution imagery with labels, political borders and roads.
     */
    DEFAULT: MapStyleVariant;
  };

  /**
   * A minimalist street-oriented style without POI
   */
  BASIC: ReferenceMapStyle & {
    /**
     * A minimalist street-oriented style without POI
     */
    DEFAULT: MapStyleVariant;
    /**
     * A minimalist street-oriented style without POI, in dark mode
     */
    DARK: MapStyleVariant;
    /**
     * A minimalist street-oriented style without POI, in light mode
     */
    LIGHT: MapStyleVariant;
  };

  /**
   * A bright street-oriented style, a nice alternative to `streets`
   */
  BRIGHT: ReferenceMapStyle & {
    /**
     * A bright street-oriented style, a nice alternative to `streets`
     */
    DEFAULT: MapStyleVariant;
    /**
     * A bright street-oriented style, a nice alternative to `streets`, in dark mode
     */
    DARK: MapStyleVariant;
    /**
     * A bright street-oriented style, a nice alternative to `streets`, in light mode
     */
    LIGHT: MapStyleVariant;
    /**
     * A bright street-oriented style, a nice alternative to `streets`, with a soft pastel color palette
     */
    PASTEL: MapStyleVariant;
  };

  /**
   * Classic OpenStreetMap style
   */
  OPENSTREETMAP: ReferenceMapStyle & {
    DEFAULT: MapStyleVariant;
  };

  /**
   * A nice high-contrast, yet less saturated alternative to the `outdoor` style, with hillshading, 3D buildings and fairly high street details
   */
  TOPO: ReferenceMapStyle & {
    /**
     * A nice high-contrast, yet less saturated alternative to the `outdoor` style, with hillshading, 3D buildings and fairly high street details
     */
    DEFAULT: MapStyleVariant;
    /**
     * A nice high-contrast, and high saturation alternative to the `outdoor` style, with hillshading, 3D buildings and fairly high street details
     */
    SHINY: MapStyleVariant;
    /**
     * A nice low-contrast, alternative to the `outdoor` style, with hillshading, 3D buildings and fairly high street details, using a soft pastel color palette
     */
    PASTEL: MapStyleVariant;

    /**
     * A nice very high-contrast, yet less saturated alternative to the `outdoor` style, with hillshading, 3D buildings and fairly high street details
     */
    TOPOGRAPHIQUE: MapStyleVariant;
  };

  /**
   * A nice alternative to `streets` with a soft color palette
   */
  VOYAGER: ReferenceMapStyle & {
    /**
     * A nice alternative to `streets` with a soft color palette
     */
    DEFAULT: MapStyleVariant;
    /**
     * A nice alternative to `streets`, in very dark mode
     */
    DARK: MapStyleVariant;
    /**
     * A nice alternative to `streets`, in light mode
     */
    LIGHT: MapStyleVariant;
    /**
     * A nice alternative to `streets` with a soft sepia color palette and vintage look
     */
    VINTAGE: MapStyleVariant;
  };

  /**
   * A bold very high contrast black and white (no gray!) style for the city
   */
  TONER: ReferenceMapStyle & {
    /**
     * A bold very high contrast black and white (no gray!) style for the city
     */
    DEFAULT: MapStyleVariant;
    /**
     * A bold very high contrast black and white (no gray!) style for the city, without any label
     */
    BACKGROUND: MapStyleVariant;
    /**
     * A bold very high contrast, yet faded, style for the city
     */
    LITE: MapStyleVariant;
    /**
     * A bold very high contrast black and white (no gray!) style for the city, with no building, only roads!
     */
    LINES: MapStyleVariant;
  };

  /**
   * Minimalist style, perfect for data visualization
   */
  STAGE: ReferenceMapStyle & {
    /**
     *  Minimalist style, perfect for data visualization
     */
    DEFAULT: MapStyleVariant;

    /**
     *  Minimalist style, perfect for data visualization in dark mode
     */
    DARK: MapStyleVariant;

    /**
     *  Minimalist style, perfect for data visualization in light mode
     */
    LIGHT: MapStyleVariant;
  };

  /**
   * Explore deep see trenches and mountains, with isolines and depth labels
   */
  OCEAN: ReferenceMapStyle & {
    /**
     * Explore deep see trenches and mountains, with isolines and depth labels
     */
    DEFAULT: MapStyleVariant;
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

  {
    referenceStyleID: "STAGE",
    name: "Stage",
    description: "",
    variants: [
      {
        id: "stage",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
      {
        id: "stage-dark",
        name: "Dark",
        variantType: "DARK",
        description: "",
        imageURL: "",
      },
      {
        id: "stage-light",
        name: "Light",
        variantType: "LIGHT",
        description: "",
        imageURL: "",
      },
    ],
  },

  {
    referenceStyleID: "OCEAN",
    name: "Ocean",
    description: "",
    variants: [
      {
        id: "ocean",
        name: "Default",
        variantType: "DEFAULT",
        description: "",
        imageURL: "",
      },
    ],
  },
];
