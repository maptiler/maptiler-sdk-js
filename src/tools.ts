import { config } from "./config";

/**
 * Prints on console only if 'verbose' mode from the config is set to true
 * @param args 
 */
export function vlog(...args: any[]) {
  if (config.verbose) {
    console.log(...arguments);
  }
}


/**
 * Expand the map style provided as argument of the Map constructor
 * @param style 
 * @returns 
 */
export function expandMapStyle(style): string {
  const trimmed = style.trim();

  // The style was possibly already given as expanded URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // testing if the style provided is of form "maptiler://some-style"
  const maptilerDomainRegex = /^maptiler:\/\/(.*)/;
  const match = maptilerDomainRegex.exec(trimmed);
  
  if (match) {
    return `https://api.maptiler.com/maps/${match[1]}/style.json`
  } 

  // The style could also possibly just be the name of the style without any URI style
  return `https://api.maptiler.com/maps/${trimmed}/style.json`
}