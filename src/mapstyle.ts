import satelliteBuiltin from "./builtinStyles/satellite.json";
import { StyleSpecification } from "maplibre-gl";
import { defaults } from "./defaults"


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
    get(target: MapStyleVariation, name: string) {
      return target.getVariation(name);
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

  get DARK(): MapStyleVariation | null  {
    // this will return _this_ if _this_ is the dark variation
    return this.referenceStyle.DARK;
  }

  get CLASSIC(): MapStyleVariation | null {
    // this will return _this_ if _this_ is the classic variation
    return this.referenceStyle.CLASSIC;
  }

  get LIGHT(): MapStyleVariation | null  {
    // this will return _this_ if _this_ is the light variation
    return this.referenceStyle.LIGHT;
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
    return variationId in this.variations ? this.variations[variationId] : this.CLASSIC;
  }

  getVariations(): Array<MapStyleVariation> {
    const variationsArray = Object.values(this.variations);
    variationsArray.sort((a: MapStyleVariation, b: MapStyleVariation) => a.getPriority() < b.getPriority() ? -1 : 1 );
    return variationsArray;
  }

  get CLASSIC(): MapStyleVariation | null {
    return this.getVariation(MapStyleVariationIds.CLASSIC);
  }

  get DARK(): MapStyleVariation | null {
    return this.getVariation(MapStyleVariationIds.DARK);
  }

  get LIGHT(): MapStyleVariation | null {
    return this.getVariation(MapStyleVariationIds.LIGHT);
  }
}


const MapStyle = {
  STREETS: new ReferenceMapStyle(),
  OUTDOOR: new ReferenceMapStyle(),
  SATELLITE: new ReferenceMapStyle(),
  BASIC: new ReferenceMapStyle(),
};

// STREETS variations
MapStyle.STREETS.addVariation(
  new MapStyleVariation(
    "Streets Classic",
    MapStyleVariationIds.CLASSIC,
    "streets-v2",
    0,
    MapStyle.STREETS,
  )
);

MapStyle.STREETS.addVariation(
  new MapStyleVariation(
    "Streets Dark",
    MapStyleVariationIds.DARK,
    "streets-v2-dark",
    1,
    MapStyle.STREETS,
  )
);

MapStyle.STREETS.addVariation(
  new MapStyleVariation(
    "Streets Light",
    MapStyleVariationIds.LIGHT,
    "streets-v2-light",
    2,
    MapStyle.STREETS,
  )
);

// OUTDOOR variations
MapStyle.OUTDOOR.addVariation(
  new MapStyleVariation(
    "Outdoor Classic",
    MapStyleVariationIds.CLASSIC,
    "outdoor-v2",
    0,
    MapStyle.OUTDOOR,
  )
);

const winterVariation = new MapStyleVariation(
  "Outdoor Winter",
  "WINTER",
  "winter-v2",
  1,
  MapStyle.OUTDOOR,
);
MapStyle.OUTDOOR.addVariation(
  winterVariation
);

const winterVariationProxy = makeVariationProxy(winterVariation)

console.log("winterVariationProxy", winterVariationProxy);



// SATELLITE variations
MapStyle.SATELLITE.addVariation(
  new MapStyleVariation(
    "Satellite with labels",
    MapStyleVariationIds.CLASSIC,
    "hybrid",
    0,
    MapStyle.SATELLITE,
  )
);

// Satellite is currently a built-in.
const satelliteVariationId = "satellite"
MapStyle.SATELLITE.addVariation(
  new MapStyleVariation(
    "Satellite without label",
    MapStyleVariationIds.NO_LABEL,
    satelliteVariationId,
    1,
    MapStyle.SATELLITE,
  )
);
builtInStyles[satelliteVariationId] = satelliteBuiltin;

// BASIC variations
MapStyle.BASIC.addVariation(
  new MapStyleVariation(
    "Basic",
    MapStyleVariationIds.CLASSIC,
    "basic-v2",
    0,
    MapStyle.BASIC,
  )
);


function styleToStyle(style: string | ReferenceMapStyle | MapStyleVariation | StyleSpecification | null | undefined ): string | StyleSpecification {
  if (!style) {
    return defaults.mapStyle.CLASSIC.getUsableStyle();
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
    return style.CLASSIC.getUsableStyle();
  }

  return style as StyleSpecification;
}


export { MapStyle, styleToStyle };
