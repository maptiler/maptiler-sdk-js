import { describe, it, expect } from "vitest";
import packagejson from "../package.json";
import * as language from "../src/language";
import * as controls from "../src/controls";
import * as converters from "../src/converters";
import * as ColorRamp from "../src/ColorRamp_";
import * as helpers from "../src/utils";

// List of expected exports
const expectedExports = Array.from(
  new Set([
    "getVersion",
    "getMapLibreVersion",
    "configMLGL",
    "getWebGLSupportError",
    "displayWebGLContextLostWarning",
    "config",
    "SdkConfig",
    "Map",
    "GeolocationType",
    "Marker",
    "Popup",
    "Style",
    "CanvasSource",
    "GeoJSONSource",
    "ImageSource",
    "RasterTileSource",
    "RasterDEMTileSource",
    "VectorTileSource",
    "VideoSource",
    "NavigationControl",
    "GeolocateControl",
    "AttributionControl",
    "LogoControl",
    "ScaleControl",
    "FullscreenControl",
    "TerrainControl",
    "BoxZoomHandler",
    "ScrollZoomHandler",
    "CooperativeGesturesHandler",
    "KeyboardHandler",
    "TwoFingersTouchPitchHandler",
    "MapWheelEvent",
    "MapTouchEvent",
    "MapMouseEvent",
    "setRTLTextPlugin",
    "getRTLTextPluginStatus",
    "LngLat",
    "LngLatBounds",
    "MercatorCoordinate",
    "Evented",
    "AJAXError",
    "prewarm",
    "clearPrewarmedResources",
    "Hash",
    "Point",
    "EdgeInsets",
    "DragRotateHandler",
    "DragPanHandler",
    "TwoFingersTouchZoomRotateHandler",
    "DoubleClickZoomHandler",
    "TwoFingersTouchZoomHandler",
    "TwoFingersTouchRotateHandler",
    "getWorkerCount",
    "setWorkerCount",
    "getMaxParallelImageRequests",
    "setMaxParallelImageRequests",
    "getWorkerUrl",
    "setWorkerUrl",
    "addSourceType",
    "importScriptInWorkers",
    "addProtocol",
    "removeProtocol",
    "MapStyle",
    "MapStyleVariant",
    "ReferenceMapStyle",
    "ServiceError",
    "bufferToPixelDataBrowser",
    "circumferenceAtLatitude",
    "coordinates",
    "data",
    "elevation",
    "expandMapStyle",
    "geocoding",
    "geolocation",
    "getBufferToPixelDataParser",
    "getTileCache",
    "mapStylePresetList",
    "math",
    "misc",
    "staticMaps",
    "styleToStyle",
    "areSameLanguages",
    "toLanguageInfo",
    "isLanguageInfo",
    "getAutoLanguage",
    "getLanguageInfoFromFlag",
    "getLanguageInfoFromCode",
    "getLanguageInfoFromKey",
    "getWebGLSupportError",
    "displayWebGLContextLostWarning",
    "config",
    "SdkConfig",
    "MapMLGL",
    "MarkerMLGL",
    "PopupMLGL",
    "StyleMLGL",
    "CanvasSourceMLGL",
    "GeoJSONSourceMLGL",
    "ImageSourceMLGL",
    "RasterTileSourceMLGL",
    "RasterDEMTileSourceMLGL",
    "VectorTileSourceMLGL",
    "VideoSourceMLGL",
    "NavigationControMLGL",
    "GeolocateControlMLGL",
    "AttributionControlMLGL",
    "LogoControlMLGL",
    "ScaleControlMLGL",
    "FullscreenControlMLGL",
    "TerrainControMLGL",
    "BoxZoomHandlerMLGL",
    "ScrollZoomHandlerMLGL",
    "CooperativeGesturesHandlerMLGL",
    "KeyboardHandlerMLGL",
    "TwoFingersTouchPitchHandlerMLGL",
    "MapWheelEventMLGL",
    "MapTouchEventMLGL",
    "MapMouseEventMLGL",
    ...Object.keys(language),
    ...Object.keys(controls),
    ...Object.keys(converters),
    ...Object.keys(ColorRamp),
    ...Object.keys(helpers),
  ]),
);

describe("Module Exports", async () => {
  const exportedModule = await import("../src/index");

  it("should match number of exptected exports with expected number of exports, logging any superfluous exports", () => {
    const actualExports = Object.keys(exportedModule);
    const superfluousExports = actualExports.filter((key) => !expectedExports.includes(key));
    if (superfluousExports.length > 0) {
      console.log("Unexpected exports found:", superfluousExports);
    }

    expect(Object.keys(exportedModule).length).toBe(expectedExports.length);
  });

  it("should export all expected values and log missing ones", () => {
    const missingExports = expectedExports.filter((key) => !(key in exportedModule));
    expect(missingExports).toEqual([]);
  });

  it("should have a valid version export", () => {
    expect(exportedModule.getVersion()).toBe(packagejson.version);
  });

  it("should match the snapshot of module exports", () => {
    // .sort() is used to ensure the order of keys is consistent and avoid brittle snapshots
    expect(Object.keys(exportedModule).sort()).toMatchSnapshot();
  });
});
