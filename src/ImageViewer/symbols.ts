// this is not exposed publicly by the SDK, but is used on internal products in other projects
export const sdkSymbolKey = Symbol.for("MapTiler:ImageViewer:sdk");

// these are not exposed publicly by the SDK, but are used internally (ImageViewerMarker)
export const lngLatToPxInternalSymbolKey = Symbol("MapTiler:ImageViewer:Internal:lngLatToPxInternal");
export const pxToLngLatInternalSymbolKey = Symbol("MapTiler:ImageViewer:Internal:pxToLngLatInternal");
