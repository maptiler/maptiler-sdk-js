import satelliteBuiltin from "./builtinMapStyles/satellite.json";
import { StyleSpecification } from "maplibre-gl";
import mapstylepresets from "./mapstylepresets.json";

/**
 * Expand the map style provided as argument of the Map constructor
 * @param style
 * @returns
 */
export function expandMapStyle(style): string {
  // testing if the style provided is of form "maptiler://some-style"
  const maptilerDomainRegex = /^maptiler:\/\/(.*)/;
  let match;
  const trimmed = style.trim();
  let expandedStyle;

  // The style was possibly already given as expanded URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    expandedStyle = trimmed;
  } else if ((match = maptilerDomainRegex.exec(trimmed)) !== null) {
    expandedStyle = `https://api.maptiler.com/maps/${match[1]}/style.json`;
  } else {
    // The style could also possibly just be the name of the style without any URI style
    expandedStyle = `https://api.maptiler.com/maps/${trimmed}/style.json`;
  }

  return expandedStyle;
}

const builtInStyles = {};

function makeReferenceStyleProxy(referenceStyle: ReferenceMapStyle) {
  return new Proxy(referenceStyle, {
    get(target, prop, receiver) {
      if (target.hasVariation(prop as string)) {
        return target.getVariation(prop as string);
      }

      // This variation does not exist for this style, but since it's full uppercase
      // we guess that the dev tries to access a style variation. So instead of
      // returning the default (STREETS.DEFAULT), we return the non-variation of the current style
      if (prop.toString().toUpperCase() === (prop as string)) {
        return referenceStyle.getDefaultVariation();
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}

/**
 * An instance of MapStyleVariation contains information about a style to use that belong to a reference style
 */
export class MapStyleVariation {
  constructor(
    /**
     * Human-friendly name
     */
    private name: string,

    /**
     * Variation name the variation is addressed to from its reference style: `MapStyle.REFERNCE_STYLE_NAME.VARIATION_TYPE`
     */
    private variationType: string,

    /**
     * MapTiler Cloud id
     */
    private id: string,

    /**
     * Reference map style, used to retrieve sibling variations
     */
    private referenceStyle: ReferenceMapStyle,

    /**
     * Human-friendly description
     */
    private description: string,

    /**
     * URL to an image describing the style variation
     */
    private imageURL: string
  ) {}

  /**
   * Get the human-friendly name
   * @returns
   */
  getName(): string {
    return this.name;
  }

  getFullName(): string {
    return `${this.referenceStyle.getName()} ${this.name}`;
  }

  /**
   * Get the variation type (eg. "DEFAULT", "DARK", "PASTEL", etc.)
   * @returns
   */
  getType(): string {
    return this.variationType;
  }

  /**
   * Get the style as usable by MapLibre, a string (URL) or a plain style description (StyleSpecification)
   * @returns
   */
  getUsableStyle(): string | StyleSpecification {
    if (this.id in builtInStyles) {
      return builtInStyles[this.id];
    }
    return expandMapStyle(this.id);
  }

  /**
   * Get the MapTiler Cloud id
   * @returns
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get the human-friendly description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Get the reference style this variation belongs to
   * @returns
   */
  getReferenceStyle(): ReferenceMapStyle {
    return this.referenceStyle;
  }

  /**
   * Check if a variation of a given type exists for _this_ variations
   * (eg. if this is a "DARK", then we can check if there is a "LIGHT" variation of it)
   * @param variationType
   * @returns
   */
  hasVariation(variationType: string): boolean {
    return this.referenceStyle.hasVariation(variationType);
  }

  /**
   * Retrieve the variation of a given type. If not found, will return the "DEFAULT" variation.
   * (eg. _this_ "DARK" variation does not have any "PASTEL" variation, then the "DEFAULT" is returned)
   * @param variationType
   * @returns
   */
  getVariation(variationType: string): MapStyleVariation {
    return this.referenceStyle.getVariation(variationType);
  }

  /**
   * Get all the variations for _this_ variations, except _this_ current one
   * @returns
   */
  getVariations(): Array<MapStyleVariation> {
    return this.referenceStyle.getVariations().filter((v) => v !== this);
  }

  /**
   * Get the image URL that represent _this_ variation
   * @returns
   */
  getImageURL(): string {
    return this.imageURL;
  }
}

/**
 * An instance of reference style contains a list of StyleVariations ordered by relevance
 */
export class ReferenceMapStyle {
  /**
   * Variations that belong to this reference style, key being the reference type
   */
  private variations: { [key: string]: MapStyleVariation } = {};

  /**
   * Variations that belong to this reference style, ordered by relevance
   */
  private orderedVariations: Array<MapStyleVariation> = [];

  constructor(
    /**
     * Human-friendly name of this reference style
     */
    private name: string,

    /**
     * ID of this reference style
     */
    private id: string
  ) {}

  /**
   * Get the human-friendly name of this reference style
   * @returns
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the id of _this_ reference style
   * @returns
   */
  getId(): string {
    return this.id;
  }

  /**
   * Add a variation to _this_ reference style
   * @param v
   */
  addVariation(v: MapStyleVariation) {
    this.variations[v.getType()] = v;
    this.orderedVariations.push(v);
  }

  /**
   * Check if a given variation type exists for this reference style
   * @param variationType
   * @returns
   */
  hasVariation(variationType: string): boolean {
    return variationType in this.variations;
  }

  /**
   * Get a given variation. If the given type of variation does not exist for this reference style,
   * then the most relevant default variation is returned instead
   * @param variationType
   * @returns
   */
  getVariation(variationType: string): MapStyleVariation {
    return variationType in this.variations
      ? this.variations[variationType]
      : this.orderedVariations[0];
  }

  /**
   * Get the list of variations for this reference style
   * @returns
   */
  getVariations(): Array<MapStyleVariation> {
    return Object.values(this.variations);
  }

  /**
   * Get the defualt variation for this reference style
   * @returns
   */
  getDefaultVariation(): MapStyleVariation {
    return this.orderedVariations[0];
  }
}

export type MapStyleType = {
  /**
   * Reference styles by ID
   */
  [key: string]: ReferenceMapStyle;
};

function buildMapStyles(): MapStyleType {
  const mapStyle: MapStyleType = {};

  for (let i = 0; i < mapstylepresets.length; i += 1) {
    const refStyleInfo = mapstylepresets[i];

    const refStyle = makeReferenceStyleProxy(
      new ReferenceMapStyle(refStyleInfo.name, refStyleInfo.referenceStyleID)
    );

    for (let j = 0; j < refStyleInfo.variations.length; j += 1) {
      const variationInfo = refStyleInfo.variations[j];
      const variation = new MapStyleVariation(
        variationInfo.name, // name
        variationInfo.variationType, // variationType
        variationInfo.id, // id
        refStyle, // referenceStyle
        variationInfo.description,
        variationInfo.imageURL // imageURL
      );

      refStyle.addVariation(variation);
    }
    mapStyle[refStyleInfo.referenceStyleID] = refStyle;
  }
  return mapStyle;
}

/**
 * Contains all the reference map style created by MapTiler team as well as all the variations.
 * For example, `MapStyle.STREETS` and the variations:
 * - `MapStyle.STREETS.DARK`
 * - `MapStyle.STREETS.LIGHT`
 * - `MapStyle.STREETS.PASTEL`
 *
 */
const MapStyle = buildMapStyles();

function styleToStyle(
  style:
    | string
    | ReferenceMapStyle
    | MapStyleVariation
    | StyleSpecification
    | null
    | undefined
): string | StyleSpecification {
  if (!style) {
    return MapStyle[mapstylepresets[0].referenceStyleID]
      .getDefaultVariation()
      .getUsableStyle();
  }

  // If the style is given as a string and this corresponds to a built-in style
  if (typeof style === "string" && style.toLocaleLowerCase() in builtInStyles) {
    return builtInStyles[style.toLocaleLowerCase()];
  }

  // If the provided style is a shorthand (eg. "streets-v2") or a full style URL
  if (typeof style === "string" || style instanceof String) {
    return expandMapStyle(style);
  }

  if (style instanceof MapStyleVariation) {
    return style.getUsableStyle();
  }

  if (style instanceof ReferenceMapStyle) {
    return style.getDefaultVariation().getUsableStyle();
  }

  return style as StyleSpecification;
}

export { MapStyle, styleToStyle };
