import * as maplibre from 'maplibre-gl';
import { config } from './config';
import constants from './constants';
import defaults from './defaults';
import CustomLogoControl from './CustomLogoControl';
import { expandMapStyle, vlog } from './tools';

// StyleSwapOptions is not exported by Maplibre, but we can redefine it (used for setStyle)
export type TransformStyleFunction = (previous: maplibre.StyleSpecification, next: maplibre.StyleSpecification) => maplibre.StyleSpecification;
export type StyleSwapOptions = {
  diff?: boolean;
  transformStyle?: TransformStyleFunction;
}


export type MapOptions = Omit<maplibre.MapOptions, "style" | "maplibreLogo" > & {
  style?: string,
  maptilerLogo?: boolean,
}

/**
 * Map constructor
 */
export default class Map extends maplibre.Map {
  private attributionMustDisplay: boolean = false;
  private attibutionLogoUrl: string = '';
  private languageShouldUpdate: boolean = false;
  private super_setStyle: Function;

  constructor(options: MapOptions) { 
    let style = expandMapStyle(defaults.mapStyle);

    if ("style" in options) {
      style = expandMapStyle(options.style as string);
    } else {
      vlog(`Map style not provided, backing up to ${defaults.mapStyle}`);
    }

    // calling the map constructor with full length style
    super({...options, style, maplibreLogo: false });

    // this.super_setStyle = super.setStyle;

    this.on('styledataloading', (data: maplibre.MapDataEvent) => {
      this.languageShouldUpdate = !!config.primaryLanguage || !!config.secondaryLanguage;
    })

    this.on('styledata', (data: maplibre.MapDataEvent) => {      
      // If the config includes language changing, we must update the map language
      if (config.primaryLanguage && this.languageShouldUpdate) {
        this.setPrimaryLanguage(config.primaryLanguage)
      }

      if (config.secondaryLanguage && this.languageShouldUpdate) {
        this.setSecondaryLanguage(config.secondaryLanguage)
      }

      this.languageShouldUpdate = false;
    })

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

        this.addControl(new CustomLogoControl({logoURL}), options.logoPosition);

        if (!options.attributionControl) {
          this.addControl(new maplibre.AttributionControl())
        }
      } else if (options.maptilerLogo) {
        this.addControl(new CustomLogoControl(), options.logoPosition);
      }
    })
  }


  setStyle(style: maplibre.StyleSpecification | string | null, options?: StyleSwapOptions & maplibre.StyleOptions) {
    const expandedStyle = style ? expandMapStyle(style) : null;
    return super.setStyle(expandedStyle, options);
  }


  setPrimaryLanguage(language: string = defaults.primaryLanguage) {
    // We want to keep track of it to apply the language again when changing the style
    config.primaryLanguage = language;

    const layers = this.getStyle().layers;

    // detects pattern like "{name:somelanguage}" with loose spacing
    const strLanguageRegex = /^\s*{\s*name\s*:\s*(\S*)\s*}\s*$/;
    
    // detects pattern like "name:somelanguage" with loose spacing
    const strLanguageInArrayRegex = /^\s*name\s*:\s*(\S*)\s*$/;

    // for string based bilingual lang such as "{name:latin}  {name:nonlatin}" or "{name:latin}  {name}" 
    const strBilingualRegex = /^\s*{\s*name\s*(:\s*(\S*))?\s*}(\s*){\s*name\s*(:\s*(\S*))?\s*}$/;

    const replacer = ['case', ['has', `name:${language}`], ['get', `name:${language}`], ['get', 'name']];

    for (let i = 0; i < layers.length; i += 1) {
      const layer = layers[i];
      const layout = layer.layout;

      if (!layout) {
        continue;
      }

      if (!layout['text-field']) {
        continue;
      }

      const textFieldLayoutProp = this.getLayoutProperty(layer.id, 'text-field');

      // Note:
      // The value of the 'text-field' property can take multiple shape;
      // 1. can be an array with 'concat' on its first element (most likely means bilingual)
      // 2. can be an array with 'get' on its first element (monolingual)
      // 3. can be a string of shape '{name:latin}'
      // 4. can be a string referencing another prop such as '{housenumber}' or '{ref}'
      // 
      // The case 1, 2 and 3 will be updated while maintaining their original type and shape.
      // The case 3 will not be updated

      let regexMatch;
      
      // This is case 1
      if (Array.isArray(textFieldLayoutProp) && textFieldLayoutProp.length >= 2 && textFieldLayoutProp[0].trim().toLowerCase() === 'concat') {
        const newProp = textFieldLayoutProp.slice(); // newProp is Array
        // The style could possibly have defined more than 2 concatenated language strings but we only want to edit the first
        // The style could also define that there are more things being concatenated and not only languages

        for (let j = 0; j < textFieldLayoutProp.length; j += 1) {
          const elem = textFieldLayoutProp[j];

          // we are looking for an elem of shape '{name:somelangage}' (string) of `["get", "name:somelanguage"]` (array)

          // the entry of of shape '{name:somelangage}', possibly with loose spacing
          if ((typeof elem === 'string' || elem instanceof String ) && strLanguageRegex.exec(elem.toString()) ) {
            newProp[j] = replacer;
            break; // we just want to update the primary language

          } else 
          // the entry is of an array of shape `["get", "name:somelanguage"]`
          if (Array.isArray(elem) && elem.length >= 2 && elem[0].trim().toLowerCase() === 'get' && strLanguageInArrayRegex.exec(elem[1].toString())) {
            newProp[j] = replacer;
            break; // we just want to update the primary language
          } else

          if (Array.isArray(elem) && elem.length === 4 && elem[0].trim().toLowerCase() === 'case') {
            newProp[j] = replacer;
            break; // we just want to update the primary language
          } 
        }

        this.setLayoutProperty(layer.id, 'text-field', newProp);
      } else 
      
      // This is case 2
      if (Array.isArray(textFieldLayoutProp) && textFieldLayoutProp.length >= 2 && textFieldLayoutProp[0].trim().toLowerCase() === 'get' && strLanguageInArrayRegex.exec(textFieldLayoutProp[1].toString())) {
        // const newProp = textFieldLayoutProp.slice();
        // newProp[1] = `name:${language}`;
        const newProp = replacer;
        this.setLayoutProperty(layer.id, 'text-field', newProp);
      } else 

      // This is case 3
      if ((typeof textFieldLayoutProp === 'string' || textFieldLayoutProp instanceof String ) && strLanguageRegex.exec(textFieldLayoutProp.toString()) ) {
        // const newProp = `{name:${language}}`;
        const newProp = replacer;
        this.setLayoutProperty(layer.id, 'text-field', newProp);
      } else 

      if (Array.isArray(textFieldLayoutProp) && textFieldLayoutProp.length === 4 && textFieldLayoutProp[0].trim().toLowerCase() === 'case') {
        const newProp = replacer;
        this.setLayoutProperty(layer.id, 'text-field', newProp);
      } else 

      if ((typeof textFieldLayoutProp === 'string' || textFieldLayoutProp instanceof String ) && (regexMatch = strBilingualRegex.exec(textFieldLayoutProp.toString())) !== null) {
        const newProp = `{name:${language||''}}${regexMatch[3]}{name${regexMatch[4]||''}}`;
        this.setLayoutProperty(layer.id, 'text-field', newProp);
      }
    }
  }

  setSecondaryLanguage(language: string = defaults.secondaryLanguage) {
    // We want to keep track of it to apply the language again when changing the style
    config.secondaryLanguage = language;

    const layers = this.getStyle().layers;

    // detects pattern like "{name:somelanguage}" with loose spacing
    const strLanguageRegex = /^\s*{\s*name\s*:\s*(\S*)\s*}\s*$/;

    // detects pattern like "name:somelanguage" with loose spacing
    const strLanguageInArrayRegex = /^\s*name\s*:\s*(\S*)\s*$/;

    // for string based bilingual lang such as "{name:latin}  {name:nonlatin}" or "{name:latin}  {name}" 
    const strBilingualRegex = /^\s*{\s*name\s*(:\s*(\S*))?\s*}(\s*){\s*name\s*(:\s*(\S*))?\s*}$/;

    let regexMatch;

    for (let i = 0; i < layers.length; i += 1) {
      const layer = layers[i];
      const layout = layer.layout;

      if (!layout) {
        continue;
      }

      if (!layout['text-field']) {
        continue;
      }

      const textFieldLayoutProp = this.getLayoutProperty(layer.id, 'text-field');

      let newProp;

      // Note:
      // The value of the 'text-field' property can take multiple shape;
      // 1. can be an array with 'concat' on its first element (most likely means bilingual)
      // 2. can be an array with 'get' on its first element (monolingual)
      // 3. can be a string of shape '{name:latin}'
      // 4. can be a string referencing another prop such as '{housenumber}' or '{ref}'
      // 
      // Only the case 1 will be updated because we don't want to change the styling (read: add a secondary language where the original styling is only displaying 1)

      // This is case 1
      if (Array.isArray(textFieldLayoutProp) && textFieldLayoutProp.length >= 2 && textFieldLayoutProp[0].trim().toLowerCase() === 'concat') {
        newProp = textFieldLayoutProp.slice(); // newProp is Array
        // The style could possibly have defined more than 2 concatenated language strings but we only want to edit the first
        // The style could also define that there are more things being concatenated and not only languages

        let languagesAlreadyFound = 0;

        for (let j = 0; j < textFieldLayoutProp.length; j += 1) {
          const elem = textFieldLayoutProp[j];

          // we are looking for an elem of shape '{name:somelangage}' (string) of `["get", "name:somelanguage"]` (array)

          // the entry of of shape '{name:somelangage}', possibly with loose spacing
          if ((typeof elem === 'string' || elem instanceof String ) && strLanguageRegex.exec(elem.toString()) ) {
            if (languagesAlreadyFound === 1) {
              newProp[j] = `{name:${language}}`;
              break; // we just want to update the secondary language
            }

            languagesAlreadyFound += 1;
          } else 
          // the entry is of an array of shape `["get", "name:somelanguage"]`
          if (Array.isArray(elem) && elem.length >= 2 && elem[0].trim().toLowerCase() === 'get' && strLanguageInArrayRegex.exec(elem[1].toString())) {
            if (languagesAlreadyFound === 1) {
              newProp[j][1] = `name:${language}`;
              break; // we just want to update the secondary language
            }

            languagesAlreadyFound += 1;
          } else

          if (Array.isArray(elem) && elem.length === 4 && elem[0].trim().toLowerCase() === 'case') {
            if (languagesAlreadyFound === 1) {
              newProp[j] = ['get', `name:${language}`]; // the situation with 'case' is supposed to only happen with the primary lang
              break; // but in case a styling also does that for secondary...
            }

            languagesAlreadyFound += 1;
          }
        }

        this.setLayoutProperty(layer.id, 'text-field', newProp);
      } 
      else 

      // the language (both first and second) are defined into a single string model
      if ((typeof textFieldLayoutProp === 'string' || textFieldLayoutProp instanceof String ) && (regexMatch = strBilingualRegex.exec(textFieldLayoutProp.toString())) !== null) {
        console.log('regexMatch', regexMatch);
        newProp = `{name${regexMatch[1]||''}}${regexMatch[3]}{name:${language||''}}`;

        console.log(newProp);

        this.setLayoutProperty(layer.id, 'text-field', newProp);
        
      }


      

      
    }
  }


  getLanguages() {
    const layers = this.getStyle().layers;

    for (let i = 0; i < layers.length; i += 1) {
      const layer = layers[i];
      const layout = layer.layout;

      if (!layout) {
        continue;
      }

      if (!layout['text-field']) {
        continue;
      }

      const textFieldLayoutProp = this.getLayoutProperty(layer.id, 'text-field');
      console.log(layer);
      console.log(textFieldLayoutProp);
      console.log('----------------------------------------');
      
    }
  }



}