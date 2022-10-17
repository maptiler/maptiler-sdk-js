
/**
 * Some default settings for the SDK
 */
const defaults = {
  // When a Map is instanciated without a 'style', then this one is the default
  mapStyle: 'streets',
  maptilerLogoURL: 'https://api.maptiler.com/resources/logo.svg',
  maptilerURL: 'https://www.maptiler.com/',
  maptilerApiURL: 'https://api.maptiler.com/',
  primaryLanguage: 'latin',
  secondaryLanguage: 'nonlatin',
};

Object.freeze(defaults);

export default defaults;