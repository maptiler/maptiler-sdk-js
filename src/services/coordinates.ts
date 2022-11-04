import { config } from "../config";
import { defaults } from "../defaults";
import { LngLat } from "../generalTypes";
import { ServiceError } from "./ServiceError";


export type CoordinatesSearchOptions = {
  /**
   * Maximum number of results returned (default: 10)
   */
  limit?: number;

  /**
   *  Show detailed transformations for each CRS (default: false)
   */
  transformations?: boolean;

  /**
   * Show exports in WKT and Proj4 notations (default: false)
   */
  exports?: boolean;
};

const customMessages = {
  403: "Key is missing, invalid or restricted",
};

/**
 * Search information about coordinate systems using MapTiler API.
 * Learn more on the MapTiler API reference page: https://docs.maptiler.com/cloud/api/coordinates/#search-coordinate-systems
 * @param query Can be any kind of CRS by name or code
 * @param options
 * @returns
 */
async function search(
  query: string,
  options: CoordinatesSearchOptions = {}
) {
  const endpoint = new URL(
    `coordinates/search/${query}.json`,
    defaults.maptilerApiURL
  );
  endpoint.searchParams.set("key", config.apiToken);

  if ("limit" in options) {
    endpoint.searchParams.set("limit", options.limit.toString());
  }

  if ("transformations" in options) {
    endpoint.searchParams.set(
      "transformations",
      options.transformations.toString()
    );
  }

  if ("exports" in options) {
    endpoint.searchParams.set("exports", options.exports.toString());
  }

  const urlWithParams = endpoint.toString();
  const res = await fetch(urlWithParams);

  if (!res.ok) {
    throw new ServiceError(
      res,
      res.status in customMessages ? customMessages[res.status] : ""
    );
  }

  const obj = await res.json();
  return obj;
}

export type CoordinatesTransformOptions = {
  /**
   * Source coordinate reference system (default: 4326)
   */
  sourceCrs?: number;

  /**
   * Target coordinate reference system (default: 4326)
   */
  targetCrs?: number;

  /**
   * List of codes of operations
   */
  operations?: number | Array<number>;
};

/**
 * Transforms coordinates from a source reference system to a target reference system using MapTiler API.
 * Learn more on the MapTiler API reference page: https://docs.maptiler.com/cloud/api/coordinates/#transform-coordinates
 * @param coordinates
 * @param options
 * @returns
 */
async function transform(
  coordinates: LngLat | Array<LngLat>,
  options: CoordinatesTransformOptions = {}
) {
  const coordinatesStr = (
    Array.isArray(coordinates) ? coordinates : [coordinates]
  )
    .map((coord) => `${coord.lng},${coord.lat}`)
    .join(";");

  const endpoint = new URL(
    `coordinates/transform/${coordinatesStr}.json`,
    defaults.maptilerApiURL
  );
  endpoint.searchParams.set("key", config.apiToken);

  if ("sourceCrs" in options) {
    endpoint.searchParams.set("s_srs", options.sourceCrs.toString());
  }

  if ("targetCrs" in options) {
    endpoint.searchParams.set("t_srs", options.targetCrs.toString());
  }

  if ("operations" in options) {
    endpoint.searchParams.set(
      "ops",
      (Array.isArray(options.operations)
        ? options.operations
        : [options.operations]
      ).join("|")
    );
  }

  const urlWithParams = endpoint.toString();
  const res = await fetch(urlWithParams);

  if (!res.ok) {
    throw new ServiceError(
      res,
      res.status in customMessages ? customMessages[res.status] : ""
    );
  }

  const obj = await res.json();
  return obj;
}


/**
 * The **coordinate** namespace contains asynchronous functions to call the [MapTiler Coordinate API](https://docs.maptiler.com/cloud/api/coordinates/).  
 * The goal of the **Coordinate API* is query information about spatial coordinate reference system (CRS) as well as to transform coordinates from one CRS to another.
 */
const coordinates = {
  search,
  transform,
};


export { coordinates };
