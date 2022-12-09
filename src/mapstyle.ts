import satelliteBuiltin from "./builtinStyles/satellite.json";
import { StyleSpecification } from "maplibre-gl";


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

export const MapStyleVariationIds = {
  CLASSIC: "CLASSIC",
  DARK: "DARK",
  LIGHT: "LIGHT",
  NO_LABEL: "NO_LABEL",
}


function makeVariationProxy(variation: MapStyleVariation) {
  return new Proxy(variation, {
    get(target, prop, receiver) {
      const referenceStyle = target.getReferenceStyle();
      const hasVariation = referenceStyle.hasVariation(prop as string);

      if (hasVariation) {
        return referenceStyle.getVariation(prop as string);
      }
      
      // This variation does not exist for this style, but since it's full uppercase
      // we guess that the dev tries to access a style variation. So instead of
      // returning the default (STREETS.CLASSIC), we return the non-variation of the current style
      if (prop.toString().toUpperCase() === (prop as string)) {
        return referenceStyle.getVariation(target.getVariationId());
      }

      return Reflect.get(target, prop, receiver);
    }
  });
}


function makeReferenceStyleProxy(referenceStyle: ReferenceMapStyle) {
  return new Proxy(referenceStyle, {
    get(target, prop, receiver) {
      if (target.hasVariation(prop as string)) {
        return target.getVariation(prop as string);
      }

      // This variation does not exist for this style, but since it's full uppercase
      // we guess that the dev tries to access a style variation. So instead of
      // returning the default (STREETS.CLASSIC), we return the non-variation of the current style
      if (prop.toString().toUpperCase() === (prop as string)) {
        return referenceStyle.getVariation(MapStyleVariationIds.CLASSIC);
      }

      return Reflect.get(target, prop, receiver);
    }
  });
}



export class MapStyleVariation {
  constructor(private name: string, private variationId: string, private id: string, private priority: number, private referenceStyle: ReferenceMapStyle, private description: string = "") {

  }

  getName(): string {
    return this.name;
  }

  getVariationId(): string {
    return this.variationId;
  }

  getUsableStyle(): string | StyleSpecification {
    if (this.id in builtInStyles) {
      return builtInStyles[this.id];
    }

    return expandMapStyle(this.id);
  }

  getId(): string {
    return this.id;
  }

  getDescription(): string {
    return this.description;
  }

  getPriority(): number {
    return this.priority;
  }

  getReferenceStyle(): ReferenceMapStyle {
    return this.referenceStyle;
  }

  hasVariation(variationId: string): boolean {
    return this.referenceStyle.hasVariation(variationId);
  }
 
  getVariation(variationId: string): MapStyleVariation {
    return this.referenceStyle.getVariation(variationId);
  }

  getVariations(): Array<MapStyleVariation> {
    const variationSet: Set<MapStyleVariation> = new Set(this.referenceStyle.getVariations());
    variationSet.delete(this);
    const variationsArray = Array.from(variationSet);
    variationsArray.sort((a: MapStyleVariation, b: MapStyleVariation) => a.getPriority() < b.getPriority() ? -1 : 1 );
    return variationsArray;
  }
}




export class ReferenceMapStyle {
  private variations: {[key: string]: MapStyleVariation} = {}
  
  constructor() {}

  addVariation(v: MapStyleVariation) {
    this.variations[v.getVariationId()] = v;
  }


  hasVariation(variationId: string): boolean {
    return variationId in this.variations;
  }


  getVariation(variationId: string): MapStyleVariation {
    return variationId in this.variations ? this.variations[variationId] : this.variations[MapStyleVariationIds.CLASSIC];
  }

  getVariations(): Array<MapStyleVariation> {
    const variationsArray = Object.values(this.variations);
    variationsArray.sort((a: MapStyleVariation, b: MapStyleVariation) => a.getPriority() < b.getPriority() ? -1 : 1 );
    return variationsArray;
  }
}


const MapStyle = {
  STREETS: makeReferenceStyleProxy(new ReferenceMapStyle()),
  OUTDOOR: makeReferenceStyleProxy(new ReferenceMapStyle()),
  SATELLITE: makeReferenceStyleProxy(new ReferenceMapStyle()),
  BASIC: makeReferenceStyleProxy(new ReferenceMapStyle()),
};

// STREETS variations
MapStyle.STREETS.addVariation(
  makeVariationProxy(new MapStyleVariation(
    "Streets Classic",
    MapStyleVariationIds.CLASSIC,
    "streets-v2",
    0,
    MapStyle.STREETS,
  ))
);

MapStyle.STREETS.addVariation(
  makeVariationProxy(new MapStyleVariation(
    "Streets Dark",
    MapStyleVariationIds.DARK,
    "streets-v2-dark",
    1,
    MapStyle.STREETS,
  ))
);

MapStyle.STREETS.addVariation(
  makeVariationProxy(new MapStyleVariation(
    "Streets Light",
    MapStyleVariationIds.LIGHT,
    "streets-v2-light",
    2,
    MapStyle.STREETS,
  ))
);

// OUTDOOR variations
MapStyle.OUTDOOR.addVariation(
  makeVariationProxy(new MapStyleVariation(
    "Outdoor Classic",
    MapStyleVariationIds.CLASSIC,
    "outdoor-v2",
    0,
    MapStyle.OUTDOOR,
  ))
);

const winterVariation = 
MapStyle.OUTDOOR.addVariation(
  makeVariationProxy(new MapStyleVariation(
    "Outdoor Winter",
    "WINTER",
    "winter-v2",
    1,
    MapStyle.OUTDOOR,
  ))
);


// SATELLITE variations
MapStyle.SATELLITE.addVariation(
  makeVariationProxy(new MapStyleVariation(
    "Satellite with labels",
    MapStyleVariationIds.CLASSIC,
    "hybrid",
    0,
    MapStyle.SATELLITE,
  ))
);

// Satellite is currently a built-in.
const satelliteVariationId = "satellite"
MapStyle.SATELLITE.addVariation(
  makeVariationProxy(new MapStyleVariation(
    "Satellite without label",
    MapStyleVariationIds.NO_LABEL,
    satelliteVariationId,
    1,
    MapStyle.SATELLITE,
  ))
);
builtInStyles[satelliteVariationId] = satelliteBuiltin;

// BASIC variations
MapStyle.BASIC.addVariation(
  makeVariationProxy(new MapStyleVariation(
    "Basic",
    MapStyleVariationIds.CLASSIC,
    "basic-v2",
    0,
    MapStyle.BASIC,
  ))
);


function styleToStyle(style: string | ReferenceMapStyle | MapStyleVariation | StyleSpecification | null | undefined ): string | StyleSpecification {
  if (!style) {
    return MapStyle.STREETS.getVariation(MapStyleVariationIds.CLASSIC).getUsableStyle();
  }

  // If the style is given as a string and this corresponds to a built-in style
  if (typeof style === "string" && style.toLocaleLowerCase() in builtInStyles) {
    return builtInStyles[style.toLocaleLowerCase()];
  }

  // If the provided style is a shorthand (eg. "streets-v2") or a full style URL
  if (typeof style === 'string' || style instanceof String) {
    return expandMapStyle(style);
  }

  if ( style instanceof MapStyleVariation) {
    return style.getUsableStyle();
  }

  if ( style instanceof ReferenceMapStyle) {
    return style.getVariation(MapStyleVariationIds.CLASSIC).getUsableStyle();
  }

  return style as StyleSpecification;
}


export { MapStyle, styleToStyle };
