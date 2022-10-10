import * as maplibre from 'maplibre-gl';
import { StyleSpecification } from 'maplibre-gl';
import { config } from './config';

export const maptilerStyles = {
  'basic': 'https://api.maptiler.com/maps/basic-v2/style.json',
  'bright': 'https://api.maptiler.com/maps/bright/style.json',
  'openstreetmap': 'https://api.maptiler.com/maps/openstreetmap/style.json',
  'outdoor': 'https://api.maptiler.com/maps/outdoor/style.json',
  'pastel': 'https://api.maptiler.com/maps/pastel/style.json',
  'satellite Hybrid': 'https://api.maptiler.com/maps/hybrid/style.json',
  'streets': 'https://api.maptiler.com/maps/streets/style.json',
  'toner': 'https://api.maptiler.com/maps/toner/style.json',
  'topo': 'https://api.maptiler.com/maps/topo/style.json',
  'topographique': 'https://api.maptiler.com/maps/topographique/style.json',
  'voyager': 'https://api.maptiler.com/maps/voyager/style.json',
  'winter': 'https://api.maptiler.com/maps/winter/style.json',
}


export default class  Map extends maplibre.Map {
  constructor(options: maplibre.MapOptions) { 

    console.log('hello'); 
    
    
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