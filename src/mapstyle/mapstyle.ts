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
      if (target.hasVariant(prop as string)) {
        return target.getVariant(prop as string);
      }

      // This variant does not exist for this style, but since it's full uppercase
      // we guess that the dev tries to access a style variant. So instead of
      // returning the default (STREETS.DEFAULT), we return the non-variant of the current style
      if (prop.toString().toUpperCase() === (prop as string)) {
        return referenceStyle.getDefaultVariant();
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}

/**
 * An instance of MapStyleVariant contains information about a style to use that belong to a reference style
 */
export class MapStyleVariant {
  constructor(
    /**
     * Human-friendly name
     */
    private name: string,

    /**
     * Variant name the variant is addressed to from its reference style: `MapStyle.REFERNCE_STYLE_NAME.VARIANT_TYPE`
     */
    private variantType: string,

    /**
     * MapTiler Cloud id
     */
    private id: string,

    /**
     * Reference map style, used to retrieve sibling variants
     */
    private referenceStyle: ReferenceMapStyle,

    /**
     * Human-friendly description
     */
    private description: string,

    /**
     * URL to an image describing the style variant
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
   * Get the variant type (eg. "DEFAULT", "DARK", "PASTEL", etc.)
   * @returns
   */
  getType(): string {
    return this.variantType;
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
   * Get the reference style this variant belongs to
   * @returns
   */
  getReferenceStyle(): ReferenceMapStyle {
    return this.referenceStyle;
  }

  /**
   * Check if a variant of a given type exists for _this_ variants
   * (eg. if this is a "DARK", then we can check if there is a "LIGHT" variant of it)
   * @param variantType
   * @returns
   */
  hasVariant(variantType: string): boolean {
    return this.referenceStyle.hasVariant(variantType);
  }

  /**
   * Retrieve the variant of a given type. If not found, will return the "DEFAULT" variant.
   * (eg. _this_ "DARK" variant does not have any "PASTEL" variant, then the "DEFAULT" is returned)
   * @param variantType
   * @returns
   */
  getVariant(variantType: string): MapStyleVariant {
    return this.referenceStyle.getVariant(variantType);
  }

  /**
   * Get all the variants for _this_ variants, except _this_ current one
   * @returns
   */
  getVariants(): Array<MapStyleVariant> {
    return this.referenceStyle.getVariants().filter((v) => v !== this);
  }

  /**
   * Get the image URL that represent _this_ variant
   * @returns
   */
  getImageURL(): string {
    return this.imageURL;
  }
}

/**
 * An instance of reference style contains a list of StyleVariants ordered by relevance
 */
export class ReferenceMapStyle {
  /**
   * Variants that belong to this reference style, key being the reference type
   */
  private variants: { [key: string]: MapStyleVariant } = {};

  /**
   * Variants that belong to this reference style, ordered by relevance
   */
  private orderedVariants: Array<MapStyleVariant> = [];

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
   * Add a variant to _this_ reference style
   * @param v
   */
  addVariant(v: MapStyleVariant) {
    this.variants[v.getType()] = v;
    this.orderedVariants.push(v);
  }

  /**
   * Check if a given variant type exists for this reference style
   * @param variantType
   * @returns
   */
  hasVariant(variantType: string): boolean {
    return variantType in this.variants;
  }

  /**
   * Get a given variant. If the given type of variant does not exist for this reference style,
   * then the most relevant default variant is returned instead
   * @param variantType
   * @returns
   */
  getVariant(variantType: string): MapStyleVariant {
    return variantType in this.variants
      ? this.variants[variantType]
      : this.orderedVariants[0];
  }

  /**
   * Get the list of variants for this reference style
   * @returns
   */
  getVariants(): Array<MapStyleVariant> {
    return Object.values(this.variants);
  }

  /**
   * Get the defualt variant for this reference style
   * @returns
   */
  getDefaultVariant(): MapStyleVariant {
    return this.orderedVariants[0];
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

    for (let j = 0; j < refStyleInfo.variants.length; j += 1) {
      const variantInfo = refStyleInfo.variants[j];
      const variant = new MapStyleVariant(
        variantInfo.name, // name
        variantInfo.variantType, // variantType
        variantInfo.id, // id
        refStyle, // referenceStyle
        variantInfo.description,
        variantInfo.imageURL // imageURL
      );

      refStyle.addVariant(variant);
    }
    mapStyle[refStyleInfo.referenceStyleID] = refStyle;
  }
  return mapStyle;
}

/**
 * Contains all the reference map style created by MapTiler team as well as all the variants.
 * For example, `MapStyle.STREETS` and the variants:
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
    | MapStyleVariant
    | StyleSpecification
    | null
    | undefined
): string | StyleSpecification {
  if (!style) {
    return MapStyle[mapstylepresets[0].referenceStyleID]
      .getDefaultVariant()
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

  if (style instanceof MapStyleVariant) {
    return style.getUsableStyle();
  }

  if (style instanceof ReferenceMapStyle) {
    return style.getDefaultVariant().getUsableStyle();
  }

  return style as StyleSpecification;
}

export { MapStyle, styleToStyle };
