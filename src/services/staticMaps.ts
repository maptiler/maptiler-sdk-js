import { config } from "../config";
import { defaults } from "../defaults";
import { Bbox, LngLatArray, LngLat } from "../generalTypes";
import simplify from "../simplify";


type StaticMapBaseOptions = {
  /**
   * Style of the map (not full style URL). Example: "winter", "streets-v2".
   * Default: `"streets-v2"`
   */
  style?: string;

  /**
   * Double the size of the static map image to support hiDPI/Retina monitors.
   * Default: `false`
   */
  hiDPI?: boolean;

  /**
   * Image format.
   * Default: `"png"`
   */
  format?: "png" | "jpg" | "webp";

  /**
   * Width of the output image. Maximum value: `2048`.
   * Default: `1024`
   */
  width?: number;

  /**
   * Height of the output image. Maximum value: `2048`.
   * Default: `1024`
   */
  height?: number;

  /**
   * Placement of the attribution. Can also be set to `false` to not show attribution.
   * Default: `"bottomright"`
   */
  attribution?: "bottomright" | "bottomleft" | "topleft" | "topright" | false;

  /**
   * A marker or list of markers to show on the map
   * Default: none provided
   */
  marker?: StaticMapMarker | Array<StaticMapMarker>;

  /**
   * URL of the marker image. Applies only if one or multiple markers positions are provided.
   * Default: none provided
   */
  markerIcon?: string;

  /**
   * Position of the marker regarding its coordinates. Applies only:
   * - with a custom icon provided with `markerIcon`
   * - if one or multiple markers positions are provided.
   * Default: `"bottom"`
   */
  markerAnchor?:
    | "top"
    | "left"
    | "bottom"
    | "right"
    | "center"
    | "topleft"
    | "bottomleft"
    | "topright"
    | "bottomright";

  /**
   * Draw a path or polygon on top of the map. If the path is too long it will be simplified, yet remaining accurate.
   * Default: none provided
   */
  path?: Array<LngLatArray>;

  /**
   * Color of the path line. The color must be CSS compatible.
   * Examples:
   * - long form hex without transparency `"#FF0000"` (red)
   * - short form hex without transparency `"#F00"` (red)
   * - long form hex with transparency `"#FF000008"` (red, half opacity)
   * - short form hex with transparency `"#F008"` (red, half opacity)
   * - CSS color shorthands: `"red"`, `"chartreuse"`, etc.
   * - decimal RGB values without transparency: `"rgb(128, 100, 255)"`
   * - decimal RGB values with transparency: `"rgb(128, 100, 255, 0.5)"`
   * Default: `"blue"`
   */
  pathStrokeColor?: string;

  /**
   * Color of the filling, also works if the polygon is not closed. The color must be CSS compatible.
   * Examples:
   * - long form hex without transparency `"#FF0000"` (red)
   * - short form hex without transparency `"#F00"` (red)
   * - long form hex with transparency `"#FF000008"` (red, half opacity)
   * - short form hex with transparency `"#F008"` (red, half opacity)
   * - CSS color shorthands: `"red"`, `"chartreuse"`, etc.
   * - decimal RGB values without transparency: `"rgb(128, 100, 255)"`
   * - decimal RGB values with transparency: `"rgb(128, 100, 255, 0.5)"`
   * Default: none (transparent filling)
   */
  pathFillColor?: string;

  /**
   * Width of the path line in pixel. It can be floating point precision (ex: `0.5`)
   * Default: `1` if `hiDPI` is `false` and `2` if `hiDPI` is `true`.
   */
  pathWidth?: number;
};

export type CenteredStaticMapOptions = StaticMapBaseOptions;

export type BoundedStaticMapOptions = StaticMapBaseOptions & {
  /**
   * Extra space added around the regio of interest, in percentage.
   * Default: `0.1` (for 10%)
   */
  padding?: number;
}

export type AutomaticStaticMapOptions = BoundedStaticMapOptions;

export type StaticMapMarker = {
  /**
   * 
   */
  lng: number;
  lat: number;
  color?: string;
};

function staticMapMarkerToString(
  marker: StaticMapMarker,
  includeColor = true
) {
  let str = `${marker.lng},${marker.lat}`;

  if (marker.color && includeColor) {
    str += `,${marker.color}`;
  }

  return str;
}

function simplifyAndStringify(
  path: Array<LngLatArray>,
  maxNbChar = 3000
): string {
  let str = path.map((point) => point.join(",")).join("|");
  let tolerance = 0.000005;
  const toleranceStep = 0.00001;

  while (str.length > maxNbChar) {
    const simplerPath = simplify(path, tolerance);
    // str = simplerPath.map(point => point.join(',')).join('|');
    str = simplerPath.map((point) => `${point[0]},${point[1]}`).join("|");
    tolerance += toleranceStep;
  }

  return str;
}

/**
 * Construct the URL for a static map centered on one point.
 * Note: this function does not fetch the binary content of the image since
 * the purpose of a static map is generally to have its URL as a `src` property of a <img/> element.
 * @param center
 * @param zoom
 * @param options
 * @returns
 */
function centered(
  center: LngLat,
  zoom: number,
  options: CenteredStaticMapOptions = {}
): string {
  const style = options.style ?? defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = options.format ?? "png";
  let width = ~~(options.width ?? 1024);
  let height = ~~(options.height ?? 1024);

  if (options.hiDPI) {
    width = ~~(width / 2);
    height = ~~(height / 2);
  }

  const endpoint = new URL(
    `maps/${encodeURIComponent(style)}/static/${center.lng},${
      center.lat
    },${zoom}/${width}x${height}${scale}.${format}`,
    defaults.maptilerApiURL
  );

  if ("attribution" in options) {
    endpoint.searchParams.set("attribution", options.attribution.toString());
  }

  if ("marker" in options) {
    let markerStr = "";

    const hasIcon = "markerIcon" in options;

    if (hasIcon) {
      markerStr += `icon:${options.markerIcon}|`;
    }

    if (hasIcon && "markerAnchor" in options) {
      markerStr += `anchor:${options.markerAnchor}|`;
    }

    if (hasIcon && options.hiDPI) {
      markerStr += `scale:2|`;
    }

    const markerList = Array.isArray(options.marker)
      ? options.marker
      : [options.marker];
    markerStr += markerList
      .map((m) => staticMapMarkerToString(m, !hasIcon))
      .join("|");
    endpoint.searchParams.set("markers", markerStr);
  }

  if ("path" in options) {
    let pathStr = "";

    pathStr += `fill:${options.pathFillColor ?? "none"}|`;

    if ("pathStrokeColor" in options) {
      pathStr += `stroke:${options.pathStrokeColor}|`;
    }

    if ("pathWidth" in options) {
      const pathWidth = options.pathWidth / (options.hiDPI ? 2 : 1);
      pathStr += `width:${pathWidth.toString()}|`;
    }

    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }

  endpoint.searchParams.set("key", config.apiToken);

  return endpoint.toString();
}

/**
 * Construct the URL for a static map using a bounding box
 * Note: this function does not fetch the binary content of the image since
 * the purpose of a static map is generally to have its URL as a `src` property of a <img/> element.
 * @param boundingBox
 * @param options
 * @returns
 */
function bounded(
  boundingBox: Bbox,
  options: BoundedStaticMapOptions = {}
) {
  const style = options.style ?? defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = options.format ?? "png";
  let width = ~~(options.width ?? 1024);
  let height = ~~(options.height ?? 1024);

  if (options.hiDPI) {
    width = ~~(width / 2);
    height = ~~(height / 2);
  }

  const endpoint = new URL(
    `maps/${encodeURIComponent(style)}/static/${boundingBox.southWest.lng},${
      boundingBox.southWest.lat
    },${boundingBox.northEast.lng},${
      boundingBox.northEast.lat
    }/${width}x${height}${scale}.${format}`,
    defaults.maptilerApiURL
  );

  if ("attribution" in options) {
    endpoint.searchParams.set("attribution", options.attribution.toString());
  }

  if ("padding" in options) {
    endpoint.searchParams.set("padding", options.padding.toString());
  }

  if ("marker" in options) {
    let markerStr = "";

    const hasIcon = "markerIcon" in options;

    if (hasIcon) {
      markerStr += `icon:${options.markerIcon}|`;
    }

    if (hasIcon && "markerAnchor" in options) {
      markerStr += `anchor:${options.markerAnchor}|`;
    }

    if (hasIcon && options.hiDPI) {
      markerStr += `scale:2|`;
    }

    const markerList = Array.isArray(options.marker)
      ? options.marker
      : [options.marker];
    markerStr += markerList
      .map((m) => staticMapMarkerToString(m, !hasIcon))
      .join("|");
    endpoint.searchParams.set("markers", markerStr);
  }

  if ("path" in options) {
    let pathStr = "";

    pathStr += `fill:${options.pathFillColor ?? "none"}|`;

    if ("pathStrokeColor" in options) {
      pathStr += `stroke:${options.pathStrokeColor}|`;
    }

    if ("pathWidth" in options) {
      const pathWidth = options.pathWidth / (options.hiDPI ? 2 : 1);
      pathStr += `width:${pathWidth.toString()}|`;
    }

    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }

  endpoint.searchParams.set("key", config.apiToken);

  return endpoint.toString();
}

/**
 * Construct the URL for a static map automatically fitted around the provided path or markers.
 * Note: this function does not fetch the binary content of the image since
 * the purpose of a static map is generally to have its URL as a `src` property of a <img/> element.
 * @param options
 * @returns
 */
function automatic(options: AutomaticStaticMapOptions = {}) {
  if (!("marker" in options) && !("path" in options)) {
    throw new Error(
      "Automatic static maps require markers and/or path to be created."
    );
  }

  const style = options.style ?? defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = options.format ?? "png";
  let width = ~~(options.width ?? 1024);
  let height = ~~(options.height ?? 1024);

  if (options.hiDPI) {
    width = ~~(width / 2);
    height = ~~(height / 2);
  }

  const endpoint = new URL(
    `maps/${encodeURIComponent(
      style
    )}/static/auto/${width}x${height}${scale}.${format}`,
    defaults.maptilerApiURL
  );

  if ("attribution" in options) {
    endpoint.searchParams.set("attribution", options.attribution.toString());
  }

  if ("padding" in options) {
    endpoint.searchParams.set("padding", options.padding.toString());
  }

  if ("marker" in options) {
    let markerStr = "";

    const hasIcon = "markerIcon" in options;

    if (hasIcon) {
      markerStr += `icon:${options.markerIcon}|`;
    }

    if (hasIcon && "markerAnchor" in options) {
      markerStr += `anchor:${options.markerAnchor}|`;
    }

    if (hasIcon && "markerScale" in options) {
      markerStr += `scale:2}|`;
    }

    const markerList = Array.isArray(options.marker)
      ? options.marker
      : [options.marker];
    markerStr += markerList
      .map((m) => staticMapMarkerToString(m, !hasIcon))
      .join("|");
    endpoint.searchParams.set("markers", markerStr);
  }

  if ("path" in options) {
    let pathStr = "";

    pathStr += `fill:${options.pathFillColor ?? "none"}|`;

    if ("pathStrokeColor" in options) {
      pathStr += `stroke:${options.pathStrokeColor}|`;
    }

    if ("pathWidth" in options) {
      const pathWidth = options.pathWidth / (options.hiDPI ? 2 : 1);
      pathStr += `width:${pathWidth.toString()}|`;
    }

    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }

  endpoint.searchParams.set("key", config.apiToken);

  return endpoint.toString();
}


/**
 * The **staticMaps** namespace contains an synchronous function build image URL of static map, as specified by the [MapTiler Static Map API](https://docs.maptiler.com/cloud/api/static-maps/).
 * The URL of static maps can then be used within a `<img />` markup element, as the `src` property value.
 */
const staticMaps = {
  centered,
  bounded,
  automatic,
};


export { staticMaps };
