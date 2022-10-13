import { config } from "../config";
import defaults from "../defaults";
import ServiceError from "./ServiceError";


const customMessages = {
  403: 'Key is missing, invalid or restricted',
}


/**
 * Looks up geolocation details from IP address using MapTiler API
 * @returns 
 */
async function info() {
  const endpoint = new URL(`geolocation/ip.json`, defaults.maptilerApiURL);
  endpoint.searchParams.set('key', config.apiToken);
  const urlWithParams = endpoint.toString()
  
  const res = await fetch(urlWithParams)

  if (!res.ok) {
    throw new ServiceError(res, res.status in customMessages ? customMessages[res.status] : '');
  }

  const obj = await res.json()
  return obj;
}


const geolocation = {
  info,
}

export default geolocation;