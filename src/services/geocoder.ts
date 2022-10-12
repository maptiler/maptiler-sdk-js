import { config } from "../config";
import defaults from "../defaults";
import { bboxType, lngLatType } from "../generalTypes";
import ServiceError from "./ServiceError";


export type geocoderOptionsType = {
  bbox?: bboxType,
  proximity?: lngLatType,
  language?: string | Array<string>, 
}


async function forward(query, options: geocoderOptionsType = {}) {
  const endpoint = new URL(`geocoding/${encodeURIComponent(query)}.json`, defaults.maptilerApiURL);
  endpoint.searchParams.set('key', config.apiToken);

  if ('bbox' in options) {
    endpoint.searchParams.set('bbox', [
      options.bbox.southWest.lng,
      options.bbox.southWest.lat,
      options.bbox.northEast.lng,
      options.bbox.northEast.lat,
    ].join(','));
  }

  if ('proximity' in options) {
    endpoint.searchParams.set('proximity', [
      options.proximity.lng, 
      options.proximity.lat,
    ].join(','));
  }

  if ('language' in options) {
    const languages = (Array.isArray(options.language) ? options.language : [options.language]).join(',');
    endpoint.searchParams.set('language', languages);
  }

  const urlWithParams = endpoint.toString()
  console.log(urlWithParams);
  
  const res = await fetch(urlWithParams)

  if (!res.ok) {
    throw new ServiceError(res);
  }

  const obj = await res.json()

  console.log(obj);
  

}


async function reverse() {
  console.log('to implement...');
  
}

const geocoder = {
  forward,
  reverse
}

export default geocoder;