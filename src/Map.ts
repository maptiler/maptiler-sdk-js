import * as maplibre from 'maplibre-gl';
import { config } from './config';
import defaults from './defaults';
import LogoControl from './LogoControl';
import { expandMapStyle, vlog } from './tools';


type MapOptions = Omit<maplibre.MapOptions, "style"> & Omit<maplibre.MapOptions, "maplibreLogo"> & {
  style?: string,
  maptilerLogo?: boolean,
}


/**
 * Map constructor
 */
export default class  Map extends maplibre.Map {
  private attributionMustDisplay: boolean = false;
  private attibutionLogoUrl: string = '';

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
    super({...options, style, maplibreLogo: false });


    this.once("load", async () => {
      let tileJsonURL = null;
      try {
        tileJsonURL = (this.getSource("openmaptiles") as maplibre.VectorTileSource).url;
      } catch(e) {
        return;
      }

      const tileJsonRes = await fetch(tileJsonURL);
      const tileJsonContent = await tileJsonRes.json();

      // The attribution and logo must show when required
      if (("logo" in tileJsonContent && tileJsonContent.logo)) {
        this.attributionMustDisplay = true;
        this.attibutionLogoUrl = tileJsonContent.logo;
        const logoURL: string = tileJsonContent.logo;

        this.addControl(new LogoControl({logoURL}), options.logoPosition);

        if (!options.attributionControl) {
          this.addControl(new maplibre.AttributionControl())
        }
      } else if (options.maptilerLogo) {
        this.addControl(new LogoControl(), options.logoPosition);
      }
    })
  }

}