import * as maplibre from 'maplibre-gl';
import { config } from './config';
import defaults from './defaults';
import { expandMapStyle, vlog } from './tools';


type MapOptions = Omit<maplibre.MapOptions, "style"> & {
  style?: string
}


/**
 * Map constructor
 */
export default class  Map extends maplibre.Map {
  constructor(options: MapOptions) { 
    let style = expandMapStyle(defaults.mapStyle);

    if ("style" in options) {
      style = expandMapStyle(options.style as string);
    } else {
      vlog(`Map style not provided, backing up to ${defaults.mapStyle}`);
    }

    // appending the token if necessary
    if (!style.includes('key=')) {
      style = `${style}?key=${config.apiToken}`
    }

    // calling the map constructor with full length style
    super({...options, style });    
  }
}