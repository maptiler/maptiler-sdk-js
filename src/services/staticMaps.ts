import { config } from "../config";
import defaults from "../defaults";
import { bboxType, lngLatArrayType, lngLatType } from "../generalTypes";
import simplify from "../simplify";

export type centeredStaticMapOptionsType = {
  style?: string;
  hiDPI?: boolean;
  format?: "png" | "jpg" | "webp";
  width?: number;
  height?: number;
  attribution?: "bottomright" | "bottomleft" | "topleft" | "topright" | false;
  marker?: staticMapMarkerType | Array<staticMapMarkerType>;
  markerIcon?: string;
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
  markerScale?: number;
  path?: Array<lngLatArrayType>;
  pathStrokeColor?: string;
  pathFillColor?: string;
  pathWidth?: number;
};

export type boundedStaticMapOptionsType = {
  style?: string;
  hiDPI?: boolean;
  format?: "png" | "jpg" | "webp";
  width?: number;
  height?: number;
  attribution?: "bottomright" | "bottomleft" | "topleft" | "topright" | false;
  marker?: staticMapMarkerType | Array<staticMapMarkerType>;
  markerIcon?: string;
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
  markerScale?: number;
  path?: Array<lngLatArrayType>;
  pathStrokeColor?: string;
  pathFillColor?: string;
  pathWidth?: number;
  padding?: number;
};

export type automaticStaticMapOptionsType = boundedStaticMapOptionsType;

export type staticMapMarkerType = {
  lng: number;
  lat: number;
  color?: string;
};

function staticMapMarkerToString(
  marker: staticMapMarkerType,
  includeColor = true
) {
  let str = `${marker.lng},${marker.lat}`;

  if (marker.color && includeColor) {
    str += `,${marker.color}`;
  }

  return str;
}

function simplifyAndStringify(
  path: Array<lngLatArrayType>,
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
  center: lngLatType,
  zoom: number,
  options: centeredStaticMapOptionsType = {}
): string {
  const style = options.style ?? defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = options.format ?? "png";
  const width = ~~(options.width ?? 800);
  const height = ~~(options.height ?? 600);
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

    if (hasIcon && "markerScale" in options) {
      markerStr += `scale:${Math.round(1 / options.markerScale)}|`;
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
      pathStr += `width:${options.pathWidth.toString()}|`;
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
  boundingBox: bboxType,
  options: boundedStaticMapOptionsType = {}
) {
  const style = options.style ?? defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = options.format ?? "png";
  const width = ~~(options.width ?? 800);
  const height = ~~(options.height ?? 600);
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

    if (hasIcon && "markerScale" in options) {
      markerStr += `scale:${Math.round(1 / options.markerScale)}|`;
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
      pathStr += `width:${options.pathWidth.toString()}|`;
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
function automatic(options: automaticStaticMapOptionsType = {}) {
  if (!("marker" in options) && !("path" in options)) {
    throw new Error(
      "Automatic static maps require markers and/or path to be created."
    );
  }

  const style = options.style ?? defaults.mapStyle;
  const scale = options.hiDPI ? "@2x" : "";
  const format = options.format ?? "png";
  const width = ~~(options.width ?? 800);
  const height = ~~(options.height ?? 600);
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
      markerStr += `scale:${Math.round(1 / options.markerScale)}|`;
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
      pathStr += `width:${options.pathWidth.toString()}|`;
    }

    pathStr += simplifyAndStringify(options.path);
    endpoint.searchParams.set("path", pathStr);
  }

  endpoint.searchParams.set("key", config.apiToken);

  return endpoint.toString();
}

const staticMaps = {
  centered,
  bounded,
  automatic,
};

export default staticMaps;
