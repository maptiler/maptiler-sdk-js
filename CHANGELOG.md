# MapTiler SDK Changelog

## DEVEL
### New Features
### Bug Fixes
### Others

## 1.2.1
### New Features
- Elevation lookup at `maptilersdk.elevation` with the function `.at()`, `.batch()` and for geojson payloads. From the update of the MapTiler Client library
- the new `ready` event. Called only once after `load` and wait for all the controls managed by the Map constructor to be dealt with (as one relies on async logic)
- the new Map lifecycle method `.onReadyAsync()` corresponding to a promise-based equivalent of the the `ready` event.
### Bug Fixes
- The index now exposes the geocoding option types from the Client library
### Others
- Update of the Maptiler Client library to v1.8.0 that brings the elevation and math module
- Update with the last version of MapLibre GL JS (v3.6.2)

## 1.2.0
### New Features
- Added the Minimap control https://github.com/maptiler/maptiler-sdk-js/pull/54
- Added vector layer helpers to create easier:
  - point layer (https://github.com/maptiler/maptiler-sdk-js/pull/61)
  - heatmap layer (https://github.com/maptiler/maptiler-sdk-js/pull/61)
  - polyline layer, including parsing from GPX/KML (https://github.com/maptiler/maptiler-sdk-js/pull/51)
  - polygon layer (https://github.com/maptiler/maptiler-sdk-js/pull/56)
- Add the `ColorRamp` class to create and customize color ramps, as well as `ColorRampCollection` with many predefined ones (as part of https://github.com/maptiler/maptiler-sdk-js/pull/61)
- Improved the language management for increased compatibility with [MapTiler Customize](https://cloud.maptiler.com/maps/editor/) (https://github.com/maptiler/maptiler-sdk-js/pull/58)
### Bug Fixes
- Fixed type export (https://github.com/maptiler/maptiler-sdk-js/pull/47)
### Others
- Upgrade to MapLibre v3.5.2 (https://github.com/maptiler/maptiler-sdk-js/pull/63)
- Update of TypeScript configuration `moduleResolution` to `Bundler` (https://github.com/maptiler/maptiler-sdk-js/pull/62)

## 1.1.2
### Bug Fixes
- Now using a fixed version of MapLibre GL. No longer use `^` because this caused issues as MapLibre made minor/patch update that were not backward compatible

## 1.1.1
### Others
- Update to `maplibre-gl@3.1.0`

## 1.1.0
### New Features
- Bringing back Map's `options.transformRequest` and `.setTransformRequest()`
### Bug Fixes
- Fixed the MapTiler logo rel name and its nofollow feature
- Made the few necessary changes acording to updating the ML v3. No braking change for SDK API
### Others
- Updated from `maplibre-gl@3.0.0-pre.4` to `maplibre-gl@3.0.1` (this includes the switch to WebGL2)


## 1.0.12
### New Features
- Added a new language flag `Language.STYLE_LOCK` to force keep the language form the style and prevent any further update. Can be at a sigle map instance level (via constuctor option `language`) or via global config (`config.primaryLanguage`)
### Bug Fixes
- The fallback language was `{name:latin}`, it is now replaced by `{name}`, which is for the local name (present by default for many places while `latin` is less frequent).

## 1.0.11
### Bug Fixes
- Now exporting `MaptilerNavigationControl`
### Others
- Documentation update for `Map`'s `option.maptilerLogo` that was a bit unclear

## 1.0.10
### New Features
- Terrain growing animation on enabling/disabling
- Added `Map` custom event `loadWithTerrain`
- Added `Map` lifecycle methods `.onLoadAsync()` and `.onLoadWithTerrainAsync()`
### Others
- Readme section was added about the event an methods above
- Updated from `maplibre-gl@3.0.0-pre.3` to `maplibre-gl@3.0.0-pre.4`
- Updated from `typedoc@0.23.21` to `typedoc@0.24.4`, which changes slightly the look of the reference documentation.
- Updated from `typescript@4.8.4` to `typescript@5.0.4`
- Updated from `rollup@2.79.0` to `rollup@3.20.6` as well as all the Rollup plugins

## 1.0.9
### New Features
- Added new styles:
  - `MapStyle.STREETS.NIGHT`
  - `MapStyle.WINTER.DARK`
  - `MapStyle.OUTDOOR.DARK`
### Bug Fixes
- If the geolocate option is missing from `Map` constructor, then it's considered `false`
- The instance types for the following MapLibre classes are now fully exported:
  - `NavigationControl`
  - `GeolocateControl`
  - `AttributionControl`
  - `LogoControl`
  - `ScaleControl`
  - `FullscreenControl`
  - `TerrainControl`
  - `Popup`
  - `Marker`
  - `Style`
  - `LngLat`
  - `LngLatBounds`
  - `MercatorCoordinate`
  - `Evented`
  - `AJAXError`
  - `CanvasSource`
  - `GeoJSONSource`
  - `ImageSource`
  - `RasterDEMTileSource`
  - `RasterTileSource`
  - `VectorTileSource`
  - `VideoSource`
  - `MapMLGL`
- The following class have been extended to provide greater compatibility with SDK,s MapL
  - `Popup`
  - `Marker`
  - `Style`
  - `CanvasSource`
  - `GeoJSONSource`
  - `ImageSource`
  - `RasterDEMTileSource`
  - `RasterTileSource`
  - `VectorTileSource`
  - `VideoSource`
  - `NavigationControl`
  - `GeolocateControl`
  - `AttributionControl`
  - `LogoControl`
  - `ScaleControl`
  - `FullscreenControl`
  - `TerrainControl`


## 1.0.8
### Bug Fixes
- Since v1.0.7, the `Map` primary language (when custom) was no longer persistant on style update.

## 1.0.7
### New Features
- The `apiKey` can now be specified in the `Map` constructor (will propagate to `config`)
- The `language` can now be speficifed in the `Map` constructo (will **not** propagete to `config` and will apply only to this specific instance)
- `Map` now has the method `.getSdkConfig()` to retrieve the config object. 
- `Map` now has the method `.getMaptilerSessionId()` to retrieve the MapTiler session ID
Both `.getSdkConfig()` and `.getMaptilerSessionId()` are handy for layers or control built outside of the SDK that still need some of the configuration to interact with the server. Those components do not always have access to the internal of the SDK (especially that the config is scoped) but can access to the `Map` instance to which they are added with the implementation of the `.onAdd()` method.

## 1.0.6
### New Features
- Now exposing `MaptilerGeolocateControl` for external initialization if needed
- Now exposing `MaptilerTerrain` for external initialization if needed

## 1.0.5
### New Features
- Terrain elevation is now using MapTiler's `terrain-rgb-v2`

## 1.0.4
### Others
- Improved the geolocate control behavior by not zooming out

## 1.0.3
### Bug Fixes
- Fixed the usage of relative path style JSON (in `Map` constructor and `.setStyle()`)

## 1.0.2
### Bug Fixes
- Fixed the dependency scheme of MapLibre import.

## 1.0.1
### Others
- Reducing the NPM size by ignoring documentation images

## 1.0.0
### Others
- First public version!