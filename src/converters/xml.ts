// Typescript port of https://github.com/mapbox/togeojson/
// This includes KML and GPX parsing to GeoJSON

export interface Link {
  href: string | null;
}

export interface XMLProperties {
  links?: Link[];
}

export interface PlacemarkProperties {
  name?: string;
  address?: string;
  styleUrl?: string;
  description?: string;
  styleHash?: string;
  styleMapHash?: Record<string, string | null>;
  timespan?: {
    begin: string;
    end: string;
  };
  timestamp?: string;
  stroke?: string;
  "stroke-opacity"?: number;
  "stroke-width"?: number;
  fill?: string;
  "fill-opacity"?: number;
  visibility?: string;
  icon?: string;
  coordTimes?: (string | null)[] | (string | null)[][];
}

/**
 * create a function that converts a string to XML
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 */
export function str2xml(str: string): Document {
  if (typeof DOMParser !== "undefined") {
    return new DOMParser().parseFromString(str, "application/xml");
  } else {
    throw new Error("No XML parser found");
  }
}

/**
 * create a function that converts a XML to a string
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 */
export function xml2str(node: Node): string {
  if (typeof XMLSerializer !== "undefined") {
    return new XMLSerializer().serializeToString(node);
  }
  throw new Error("No XML serializer found");
}

/**
 * Given a XML document using the GPX spec, return GeoJSON
 */
export function gpx(doc: Document): GeoJSON.FeatureCollection {
  const tracks = get(doc, "trk");
  const routes = get(doc, "rte");
  const waypoints = get(doc, "wpt");
  // a feature collection
  const gj: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };
  let feature: GeoJSON.Feature | undefined;
  for (let i = 0; i < tracks.length; i++) {
    feature = getTrack(tracks[i]);
    if (feature) gj.features.push(feature);
  }
  for (let i = 0; i < routes.length; i++) {
    feature = getRoute(routes[i]);
    if (feature) gj.features.push(feature);
  }
  for (let i = 0; i < waypoints.length; i++) {
    gj.features.push(getPoint(waypoints[i]));
  }
  return gj;
}

/**
 * Given a XML document using the KML spec, return GeoJSON
 */
export function kml(
  doc: Document,
  xml2string?: (node: Node) => string,
): GeoJSON.FeatureCollection {
  const gj: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };
  // styleindex keeps track of hashed styles in order to match features
  const styleIndex: Record<string, string> = {};
  const styleByHash: Record<string, Element> = {};
  // stylemapindex keeps track of style maps to expose in properties
  const styleMapIndex: Record<string, Record<string, string | null>> = {};
  // all root placemarks in the file
  const placemarks = get(doc, "Placemark");
  const styles = get(doc, "Style");
  const styleMaps = get(doc, "StyleMap");

  for (let k = 0; k < styles.length; k++) {
    const hash = okhash(
      xml2string !== undefined ? xml2string(styles[k]) : xml2str(styles[k]),
    ).toString(16);
    styleIndex["#" + attr(styles[k], "id")] = hash;
    styleByHash[hash] = styles[k];
  }
  for (let l = 0; l < styleMaps.length; l++) {
    styleIndex["#" + attr(styleMaps[l], "id")] = okhash(
      xml2string !== undefined
        ? xml2string(styleMaps[l])
        : xml2str(styleMaps[l]),
    ).toString(16);
    const pairs = get(styleMaps[l], "Pair");
    const pairsMap: Record<string, string | null> = {};
    for (let m = 0; m < pairs.length; m++) {
      pairsMap[nodeVal(get1(pairs[m], "key")) ?? ""] = nodeVal(
        get1(pairs[m], "styleUrl"),
      );
    }
    styleMapIndex["#" + attr(styleMaps[l], "id")] = pairsMap;
  }
  for (let j = 0; j < placemarks.length; j++) {
    gj.features = gj.features.concat(
      getPlacemark(placemarks[j], styleIndex, styleByHash, styleMapIndex),
    );
  }
  return gj;
}

// parse color string to hex string with opacity. black with 100% opacity will be returned if no data found
function kmlColor(v: string | null): [string, number] {
  if (v === null) return ["#000000", 1];
  let color = "";
  let opacity = 1;
  if (v.substring(0, 1) === "#") v = v.substring(1);
  if (v.length === 6 || v.length === 3) color = v;
  if (v.length === 8) {
    opacity = parseInt(v.substring(0, 2), 16) / 255;
    color = "#" + v.substring(6, 8) + v.substring(4, 6) + v.substring(2, 4);
  }
  return [color ?? "#000000", opacity ?? 1];
}

function gxCoord(v: string): number[] {
  return numarray(v.split(" "));
}

// grab coordinates and timestamps (when available) from the gx:Track extension
function gxCoords(root: Document | Element): {
  coords: number[][];
  times: (string | null)[];
} {
  let elems = get(root, "coord");
  const coords: number[][] = [];
  const times: (string | null)[] = [];
  if (elems.length === 0) elems = get(root, "gx:coord");
  for (let i = 0; i < elems.length; i++)
    coords.push(gxCoord(nodeVal(elems[i]) ?? ""));
  const timeElems = get(root, "when");
  for (let j = 0; j < timeElems.length; j++) times.push(nodeVal(timeElems[j]));
  return {
    coords: coords,
    times,
  };
}

// get the geometry data and coordinate timestamps if available
function getGeometry(root: Element): {
  geoms: GeoJSON.Geometry[];
  coordTimes: (string | null)[][];
} {
  // atomic geospatial types supported by KML - MultiGeometry is
  // handled separately
  const geotypes = ["Polygon", "LineString", "Point", "Track", "gx:Track"];
  // setup variables
  let geomNode, geomNodes, i, j, k;
  const geoms: GeoJSON.Geometry[] = [];
  const coordTimes: (string | null)[][] = [];
  // simple cases
  if (get1(root, "MultiGeometry") !== null) {
    return getGeometry(get1(root, "MultiGeometry") as Element);
  }
  if (get1(root, "MultiTrack") !== null) {
    return getGeometry(get1(root, "MultiTrack") as Element);
  }
  if (get1(root, "gx:MultiTrack") !== null) {
    return getGeometry(get1(root, "gx:MultiTrack") as Element);
  }
  for (i = 0; i < geotypes.length; i++) {
    geomNodes = get(root, geotypes[i]);
    if (geomNodes) {
      for (j = 0; j < geomNodes.length; j++) {
        geomNode = geomNodes[j];
        if (geotypes[i] === "Point") {
          geoms.push({
            type: "Point",
            coordinates: coord1(nodeVal(get1(geomNode, "coordinates")) ?? ""),
          });
        } else if (geotypes[i] === "LineString") {
          geoms.push({
            type: "LineString",
            coordinates: coord(nodeVal(get1(geomNode, "coordinates")) ?? ""),
          });
        } else if (geotypes[i] === "Polygon") {
          const rings = get(geomNode, "LinearRing");
          const coords = [];
          for (k = 0; k < rings.length; k++) {
            coords.push(coord(nodeVal(get1(rings[k], "coordinates")) ?? ""));
          }
          geoms.push({
            type: "Polygon",
            coordinates: coords,
          });
        } else if (geotypes[i] === "Track" || geotypes[i] === "gx:Track") {
          const track = gxCoords(geomNode);
          geoms.push({
            type: "LineString",
            coordinates: track.coords,
          });
          if (track.times.length) coordTimes.push(track.times);
        }
      }
    }
  }
  return { geoms, coordTimes };
}

// build geojson feature sets with all their attributes and property data
function getPlacemark(
  root: Element,
  styleIndex: Record<string, string>,
  styleByHash: Record<string, Element>,
  styleMapIndex: Record<string, Record<string, string | null>>,
) {
  const geomsAndTimes = getGeometry(root);
  const properties: PlacemarkProperties & Record<string, string> = {};
  const name = nodeVal(get1(root, "name"));
  const address = nodeVal(get1(root, "address"));
  const description = nodeVal(get1(root, "description"));
  const timeSpan = get1(root, "TimeSpan");
  const timeStamp = get1(root, "TimeStamp");
  const extendedData = get1(root, "ExtendedData");
  const visibility = get1(root, "visibility");

  let i: number;
  let styleUrl = nodeVal(get1(root, "styleUrl"));
  let lineStyle = get1(root, "LineStyle");
  let polyStyle = get1(root, "PolyStyle");

  if (!geomsAndTimes.geoms.length) return [];
  if (name) properties.name = name;
  if (address) properties.address = address;
  if (styleUrl) {
    if (styleUrl[0] !== "#") styleUrl = "#" + styleUrl;

    properties.styleUrl = styleUrl;
    if (styleIndex[styleUrl]) {
      properties.styleHash = styleIndex[styleUrl];
    }
    if (styleMapIndex[styleUrl]) {
      properties.styleMapHash = styleMapIndex[styleUrl];
      properties.styleHash = styleIndex[styleMapIndex[styleUrl].normal ?? ""];
    }
    // Try to populate the lineStyle or polyStyle since we got the style hash
    const style = styleByHash[properties.styleHash ?? ""];
    if (style) {
      if (!lineStyle) lineStyle = get1(style, "LineStyle");
      if (!polyStyle) polyStyle = get1(style, "PolyStyle");
      const iconStyle = get1(style, "IconStyle");
      if (iconStyle) {
        const icon = get1(iconStyle, "Icon");
        if (icon) {
          const href = nodeVal(get1(icon, "href"));
          if (href) properties.icon = href;
        }
      }
    }
  }
  if (description) properties.description = description;
  if (timeSpan) {
    const begin = nodeVal(get1(timeSpan, "begin"));
    const end = nodeVal(get1(timeSpan, "end"));
    if (begin && end) properties.timespan = { begin, end };
  }
  if (timeStamp !== null) {
    properties.timestamp =
      nodeVal(get1(timeStamp, "when")) ?? new Date().toISOString();
  }
  if (lineStyle !== null) {
    const linestyles = kmlColor(nodeVal(get1(lineStyle, "color")));
    const color = linestyles[0];
    const opacity = linestyles[1];
    const width = parseFloat(nodeVal(get1(lineStyle, "width")) ?? "");
    if (color) properties.stroke = color;
    if (!isNaN(opacity)) properties["stroke-opacity"] = opacity;
    if (!isNaN(width)) properties["stroke-width"] = width;
  }
  if (polyStyle) {
    const polystyles = kmlColor(nodeVal(get1(polyStyle, "color")));
    const pcolor = polystyles[0];
    const popacity = polystyles[1];
    const fill = nodeVal(get1(polyStyle, "fill"));
    const outline = nodeVal(get1(polyStyle, "outline"));
    if (pcolor) properties.fill = pcolor;
    if (!isNaN(popacity)) properties["fill-opacity"] = popacity;
    if (fill)
      properties["fill-opacity"] =
        fill === "1" ? properties["fill-opacity"] || 1 : 0;
    if (outline)
      properties["stroke-opacity"] =
        outline === "1" ? properties["stroke-opacity"] || 1 : 0;
  }
  if (extendedData) {
    const datas = get(extendedData, "Data"),
      simpleDatas = get(extendedData, "SimpleData");

    for (i = 0; i < datas.length; i++) {
      properties[datas[i].getAttribute("name") ?? ""] =
        nodeVal(get1(datas[i], "value")) ?? "";
    }
    for (i = 0; i < simpleDatas.length; i++) {
      properties[simpleDatas[i].getAttribute("name") ?? ""] =
        nodeVal(simpleDatas[i]) ?? "";
    }
  }
  if (visibility !== null) {
    properties.visibility = nodeVal(visibility) ?? "";
  }
  if (geomsAndTimes.coordTimes.length !== 0) {
    properties.coordTimes =
      geomsAndTimes.coordTimes.length === 1
        ? geomsAndTimes.coordTimes[0]
        : geomsAndTimes.coordTimes;
  }
  const feature: GeoJSON.Feature = {
    type: "Feature",
    geometry:
      geomsAndTimes.geoms.length === 1
        ? geomsAndTimes.geoms[0]
        : {
            type: "GeometryCollection",
            geometries: geomsAndTimes.geoms,
          },
    properties: properties,
  };
  if (attr(root, "id")) feature.id = attr(root, "id") ?? undefined;
  return [feature];
}

function getPoints(
  node: Element,
  pointname: string,
):
  | undefined
  | {
      line: number[][];
      times: string[];
      heartRates: (number | null)[];
    } {
  const pts = get(node, pointname);
  const line: number[][] = [];
  const times: string[] = [];
  let heartRates: (number | null)[] = [];
  const l = pts.length;
  if (l < 2) return; // Invalid line in GeoJSON
  for (let i = 0; i < l; i++) {
    const c = coordPair(pts[i]);
    line.push(c.coordinates);
    if (c.time) times.push(c.time);
    if (c.heartRate || heartRates.length) {
      if (heartRates.length === 0) heartRates = new Array(i).fill(null);
      heartRates.push(c.heartRate);
    }
  }
  return {
    line: line,
    times: times,
    heartRates,
  };
}

function getTrack(node: Element): undefined | GeoJSON.Feature {
  const segments = get(node, "trkseg");
  const track = [];
  const times = [];
  const heartRates: (number | null)[][] = [];
  let line;
  for (let i = 0; i < segments.length; i++) {
    line = getPoints(segments[i], "trkpt");
    if (line !== undefined) {
      if (line.line) track.push(line.line);
      if (line.times && line.times.length) times.push(line.times);
      if (heartRates.length || (line.heartRates && line.heartRates.length)) {
        if (!heartRates.length) {
          for (let s = 0; s < i; s++) {
            heartRates.push(new Array(track[s].length).fill(null));
          }
        }
        if (line.heartRates && line.heartRates.length) {
          heartRates.push(line.heartRates);
        } else {
          heartRates.push(new Array(line.line.length).fill(null));
        }
      }
    }
  }
  if (track.length === 0) return;
  const properties: {
    coordTimes?: string[] | string[][];
    heartRates?: (number | null)[] | (number | null)[][];
  } & XMLProperties &
    Record<string, string | number> = {
    ...getProperties(node),
    ...getLineStyle(get1(node, "extensions")),
  };
  if (times.length !== 0)
    properties.coordTimes = track.length === 1 ? times[0] : times;
  if (heartRates.length !== 0) {
    properties.heartRates = track.length === 1 ? heartRates[0] : heartRates;
  }
  if (track.length === 1) {
    return {
      type: "Feature",
      properties,
      geometry: {
        type: "LineString",
        coordinates: track[0],
      },
    };
  } else {
    return {
      type: "Feature",
      properties,
      geometry: {
        type: "MultiLineString",
        coordinates: track,
      },
    };
  }
}

function getRoute(node: Element): GeoJSON.Feature | undefined {
  const line = getPoints(node, "rtept");
  if (line === undefined) return;
  const prop = {
    ...getProperties(node),
    ...getLineStyle(get1(node, "extensions")),
  };
  return {
    type: "Feature",
    properties: prop,
    geometry: {
      type: "LineString",
      coordinates: line.line,
    },
  };
}

function getPoint(node: Element): GeoJSON.Feature {
  const prop = { ...getProperties(node), ...getMulti(node, ["sym"]) };
  return {
    type: "Feature",
    properties: prop,
    geometry: {
      type: "Point",
      coordinates: coordPair(node).coordinates,
    },
  };
}

function getLineStyle(
  extensions: Element | null,
): Record<string, string | number> {
  const style: Record<string, string | number> = {};
  if (extensions) {
    const lineStyle = get1(extensions, "line");
    if (lineStyle) {
      const color = nodeVal(get1(lineStyle, "color"));
      const opacity = parseFloat(nodeVal(get1(lineStyle, "opacity")) ?? "0");
      const width = parseFloat(nodeVal(get1(lineStyle, "width")) ?? "0");
      if (color) style.stroke = color;
      if (!isNaN(opacity)) style["stroke-opacity"] = opacity;
      // GPX width is in mm, convert to px with 96 px per inch
      if (!isNaN(width)) style["stroke-width"] = (width * 96) / 25.4;
    }
  }
  return style;
}

function getProperties(node: Element): XMLProperties & Record<string, string> {
  const prop: XMLProperties & Record<string, string> = getMulti(node, [
    "name",
    "cmt",
    "desc",
    "type",
    "time",
    "keywords",
  ]);
  const links = get(node, "link");
  if (links.length !== 0) {
    prop.links = [];
    for (let i = 0, link; i < links.length; i++) {
      link = {
        href: attr(links[i], "href"),
        ...getMulti(links[i], ["text", "type"]),
      };
      prop.links.push(link);
    }
  }
  return prop;
}

function okhash(x: string): number {
  let h = 0;
  if (!x || !x.length) return h;
  for (let i = 0; i < x.length; i++) {
    h = ((h << 5) - h + x.charCodeAt(i)) | 0;
  }
  return h;
}

function get(x: Document | Element, y: string): HTMLCollectionOf<Element> {
  return x.getElementsByTagName(y);
}

function attr(x: Element, y: string): string | null {
  return x.getAttribute(y);
}

function attrf(x: Element, y: string): number {
  return parseFloat(attr(x, y) ?? "0");
}

function get1(x: Element, y: string): Element | null {
  const n = get(x, y);
  return n.length ? n[0] : null;
}

// https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
function norm(el: Element): Element {
  if (el.normalize) el.normalize();
  return el;
}

// cast array x into numbers
function numarray(x: string[]): number[] {
  return x.map(parseFloat).map((n) => (isNaN(n) ? null : n)) as number[];
}

// get the content of a text node, if any
function nodeVal(x: Element | null): string | null {
  if (x) norm(x);
  return x && x.textContent;
}

// get the contents of multiple text nodes, if present
function getMulti(x: Element, ys: string[]): Record<string, string> {
  const o: Record<string, string> = {};
  let n;
  let k;
  for (k = 0; k < ys.length; k++) {
    n = get1(x, ys[k]);
    if (n) o[ys[k]] = nodeVal(n) ?? "";
  }
  return o;
}

// get one coordinate from a coordinate array, if any
function coord1(v: string): number[] {
  return numarray(v.replace(/\s*/g, "").split(","));
}

// get all coordinates from a coordinate array as [[],[]]
function coord(v: string): number[][] {
  const coords = v.replace(/^\s*|\s*$/g, "").split(/\s+/);
  const out = [];
  for (let i = 0; i < coords.length; i++) {
    out.push(coord1(coords[i]));
  }
  return out;
}

// build a set of coordinates, timestamps, and heartrate
function coordPair(x: Element): {
  coordinates: number[];
  time: string | null;
  heartRate: number | null;
} {
  const ll = [attrf(x, "lon"), attrf(x, "lat")];
  const ele = get1(x, "ele");
  // handle namespaced attribute in browser
  const heartRate = get1(x, "gpxtpx:hr") || get1(x, "hr");
  const time = get1(x, "time");
  let e: number;
  if (ele) {
    e = parseFloat(nodeVal(ele) ?? "0");
    if (!isNaN(e)) ll.push(e);
  }
  return {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    heartRate:
      heartRate !== null ? parseFloat(nodeVal(heartRate) ?? "0") : null,
  };
}
