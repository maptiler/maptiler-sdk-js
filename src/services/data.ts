import { config } from "../config";
import defaults from "../defaults";
import ServiceError from "./ServiceError";


const customMessages = {
  403: 'Key is missing, invalid or restricted',
}


/**
 * Get user data and returns it as GeoJSON using the MapTiler API
 * @param dataId 
 * @returns 
 */
async function get(dataId: string) {
  const endpoint = new URL(`data/${encodeURIComponent(dataId)}/features.json`, defaults.maptilerApiURL);
  endpoint.searchParams.set('key', config.apiToken);
  const urlWithParams = endpoint.toString()
  
  const res = await fetch(urlWithParams)

  if (!res.ok) {
    throw new ServiceError(res, res.status in customMessages ? customMessages[res.status] : '');
  }

  const obj = await res.json()
  return obj;
}


const data = {
  get,
}

export default data;