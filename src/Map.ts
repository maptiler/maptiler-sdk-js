import * as maplibre from 'maplibre-gl';
import { StyleSpecification } from 'maplibre-gl';
import { config } from './config';

export const maptilerStyles = {
  'maptiler.basic': 'https://api.maptiler.com/maps/basic-v2/style.json',
  'maptiler.bright': 'https://api.maptiler.com/maps/bright/style.json',
  'maptiler.openstreetmap': 'https://api.maptiler.com/maps/openstreetmap/style.json',
  'maptiler.outdoor': 'https://api.maptiler.com/maps/outdoor/style.json',
  'maptiler.pastel': 'https://api.maptiler.com/maps/pastel/style.json',
  'maptiler.satellite Hybrid': 'https://api.maptiler.com/maps/hybrid/style.json',
  'maptiler.street': 'https://api.maptiler.com/maps/streets/style.json',
  'maptiler.toner': 'https://api.maptiler.com/maps/toner/style.json',
  'maptiler.topo': 'https://api.maptiler.com/maps/topo/style.json',
  'maptiler.topographique': 'https://api.maptiler.com/maps/topographique/style.json',
  'maptiler.voyager': 'https://api.maptiler.com/maps/voyager/style.json',
  'maptiler.winter': 'https://api.maptiler.com/maps/winter/style.json',
}


export default class  Map extends maplibre.Map {
  constructor(options: maplibre.MapOptions) { 
    
    // the style, possibly a shorthand
    let style = (options.style as string).trim().toLowerCase()

    // replacing a shorthand style by its extanded URL
    if (style in maptilerStyles) {
      style = maptilerStyles[style];
    }
    
    // appending the token if necessary
    if (!style.includes('key=')) {
      style = `${style}?key=${config.accessToken}`
    }

    // calling the map constructor with full length style
    super({...options, style});
  }
}