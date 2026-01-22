# MapTiler SDK Changelog

## NEXT

### ✨ Features and improvements
- Adds the new `MapTilerAnimation` module and associated helpers for creating and managing animations, lerping between values and 'smoothing' arrays.
- Adds the new `AnimatedRouteLayer` module and associated helpers for animating camera movement along GeoJSON features paths.
- Adds better validation of space specifications in CubemapLayer

### 🐛 Bug Fixes
- Fixes a bug where `map.getProjection()` did not return a value when default projection was used.
- Fixes bugs in space and halo where precedence of constructor options vs remote styles was not enforced correctly.

### ⚙️ Others
- Better e2e Test coverage for Space & Halo

## 3.10.2
### ✨ Features and improvements
- None

### 🐛 Bug Fixes
- Fixes a merge artefact where a call to enableRTL was removed, disabling rtl text by default. Re-enables RTL by default and adds e2e tests.

### ⚙️ Others
- None

## 3.10.1

### ✨ Features and improvements
- MapLibre GL dependency was updated to `5.14`
  - Types that were removed in a minor version of MapLibre GL, breaking semver, were moved into MapTiler SDK to not break compatibility for MapTiler SDK users
  - Overpanning and underzooming patch for `ImageViewer` was updated to use a new standard MapLibre GL approach instead of monkey-patching it

### 🐛 Bug Fixes
- Reworks `setStyle` logic for halo and space
- Fixes bug where remote styles where not updating halo / space specs.

### ⚙️ Others
- Adds clearer type docs for `mapTilerLogo` constructor option.
- Add console.info informing SDK consumers of current version.

## 3.10.0
### ⚠️ Warning This version is deprecated use 3.10.1 instead

## 3.9.0

### ✨ Features and improvements
- Additions and improvements to ImageViewer
 - ImageViewer `set` methods now return the ImageViewer instance for chaining.
 - `ImageViewer.destroy()` added for cleanup of internal resources and removal of listeners.
 - `ImageViewer.getImageMetadata()` returns the imagedata for the image being viewed.
 - `ImageViewer.getImageBounds()` returns the current bounds of the viewport in image pixels (note: _not_ screen pixels, image pixels are pixels in relation to the intrinsic image size, not it's size on the screen).
 - `ImageViewer.fitImageBounds(bounds)` fits the viewer to `bounds`.
 - `ImageViewerMarker` class added. `ImageViewer`can now have markers positioned in image pixels.
 - `ImageViewer` now has the `getCanvas` method to retrieve the `HTMLCanvasElement`used by the viewer.
 - Exports `ImageMarkerEvents` type.
 - Configs passed to `setSpace` and `setHalo` are now validated ahead fo time.


### 🐛 Bug Fixes

- Fixes a bug where `setStyle(<JSON>)` would not update.
- Fixes a bug where `map.getProjection()` did not return a value when default projection was used
- Fixes a bug where "Style Not Done Loading" error is thrown when an Image is used in conjunction with Spacebox.
- Fixes a bug where switching between remote styles causes flickering in Halo.
- Fixes a bug where Webgl would throw a texture error when two maps are rendered on the page due to a race condition loading images.

### ⚙️ Others
- Right to left text is now opt-out. `rtlTextPlugin` can be passed in the constructor options to opt-out of installing the RTL text-plugin or install a different RTL text-plugin. Without this option the behaviour will remain the same.
- Version bunp of @maptiler/client to 2.6.0

## 3.8.0

### ✨ Features and improvements
- Adds a new `ImageViewer` class for viewing tiled non-georeferenced images from MapTiler Engine in the same way you would a map. See [the docs](https://docs.maptiler.com/sdk-js/examples/image-viewer/) for more info.
- Adds `enableHaloAnimations`, `enableSpaceAnimations`, `disableHaloAnimations`, `disableSpaceAnimations` to Map instance for toggling halo and space animations.
- Adds custom controls that can be styled however you wish and can do whatever you need, in both declarative (auto-detected) and programmatic way. See [the section in the readme](https://github.com/maptiler/maptiler-sdk-js#-custom-controls) for more info.

### 🐛 Bug Fixes
- Fixes a bug on `halo` where sharp edged stops cause noise to surface when scaled down.
- Fixes bug where space would not load correctly when style is a URI.
- Fixes a bug in the UMD module where space crashes when only a color is set.
- Fixes a bug when `space: true` and no style is passed, `space` becomes unset.


⚙️ Others
- Removes superfluous dependencies from package.json

## 3.7.0

### ✨ Features and improvements
- Version Bump @maptiler/client to 2.5.0 adding `at`, `batch`, `computeOn`, `canParsePixelData` functions for working with elevations.

### 🐛 Bug Fixes
- Includes workaround where internal event is not fired correctly and causes breaking of space box.

### Others
- None

## 3.6.1

### ✨ Features and improvements
- None 

### 🐛 Bug Fixes
- Fixes a bug that breaks spacebox when projection is changed in style.json

### Others
- None

## 3.6.0

### ✨ Features and improvements
- None 

### 🐛 Bug Fixes
- Fixes bug where terrain does not load when `map.enableTerrain()` is called directly after `.flyTo`
- Adds `StyleDefinitionWithMetadata` as an accepted type to `setStyle` ([#216](https://github.com/maptiler/maptiler-sdk-js/issues/216))
- Adds condition to log calls in `extractCustomLayerStyle` ([#216](https://github.com/maptiler/maptiler-sdk-js/issues/216))
- Fix to spacebox where image was fading in and out when only color was changed.
- Fix to spacebox when, having been set from setStyle, with terrain activated, the map breaks
- Fix to spacebox where changes made via to setStyle were not always being propogated
- Resolved a race condition in `loadCubemapTexture` where WebGL draw calls could occur before all cubemap face textures were fully loaded. Texture setup is now performed only after _all_ cubemap faces have finished loading, rather than processing each face as it loads.

### Others
- None

## 3.5.0
### ✨ Features and improvements
- Now able to include cubemap background images and Earth radial gradient halo via `space` and `halo` in map 
constructor _or_ via `setSpace` or `setHalo` methods _or_ via incoming MT style spec.

### Others
- Version bump client-js to the latest version

## 3.4.1 

### ✨ Features and improvements
- Update Maplibre to 5.6.0

### 🐛 Bug Fixes
- Fix for [RD-900](https://maptiler.atlassian.net/browse/RD-900?atlOrigin=eyJpIjoiOTRjZGRhYjg2Y2JhNGY2NGI2NzM2M2E1MGNkNjBmYWYiLCJwIjoiaiJ9)

### Others
- None

## 3.4.0
### ⚠️ Warning This version is deprecated use 3.4.1 instead

## 3.3.0
### ✨ Features and improvements
- Maplibre-gl version bump to 5.5.0

## 3.2.3
### ✨ Features and improvements
None

### 🐛 Bug Fixes
- Fixes incorrect exports of some types from sdk helper functions.

### 🔧 Others
- Migrates Demos to use vite for better dx

## 3.2.2
### ✨ Features and improvements
None

### 🐛 Bug Fixes
- [RD-902](https://maptiler.atlassian.net/browse/RD-902?atlOrigin=eyJpIjoiNGM2NGQxNzg0ZjEzNGJlMGI3M2Y1YTM3YTIyNjdkMDkiLCJwIjoiaiJ9) Changes to use default import for maplibre-gl as it uses commonjs modules under the hood.

### 🔧 Others
- Adds linting config to check for non default maplibre defaults. Named imports from CJS modules fail on some build pipelines.

## 3.2.1
### ⚠️ Warning
- This version was published in error. Please use `3.2.2` instead.

## 3.2.0
### ✨ Features and improvements
- Updates Maplibre-gl to 5.3.1
- Updates MapTiler Client to 2.3.2

## 3.1.1
### ✨ Features and improvements
None

### 🐛 Bug Fixes
None

### 🔧 Others
Version bump for maptiler-client-js

## 3.1.0
### ✨ Features and improvements
Updates MapTiler Client JS version to include new MapStyles

### 🐛 Bug Fixes
None

### 🔧 Others
None

## 3.0.3
### ✨ Features and improvements
None

### 🐛 Bug Fixes
Fixes a bug that accesses undefined `projection` object in `Map.getProjection` method

### 🔧 Others
None

## 3.0.2
### ✨ Features and improvements
None

### 🐛 Bug Fixes
None

### 🔧 Others
Restructuring of repo, additon of tests to check consistency of library exports.

## 3.0.1
### New Features
- Update Maplibre to v5.0.1


## 3.0.0
⚠️ Please keep in mind that if you use any additional [MapTiler modules](https://docs.maptiler.com/sdk-js/modules/), you must update them to a version that supports MapTiler SDK JS v3.

### ✨ Features and improvements
* Globe projection support
* `MaptilerProjectionControl`  to toggle Globe/Mercator projection

### 🐛 Bug Fixes
* Navigation now relies on `Map` methods instead of `Transform` methods for bearing due to globe projection being available

### 🔧 Others
* Using MapLibre GL JS 5.0.0
* Using MapTiler Client JS 2.2.0


## 2.5.1
### Bug Fixes
- Better control of the status of `monitoredStyleUrls` in Map instance when error is caught (https://github.com/maptiler/maptiler-sdk-js/pull/141)
- Added extra integrity checks on style object when updating language (https://github.com/maptiler/maptiler-sdk-js/pull/142)
- The Geolocate control no longer throwing error when window is lost (issue on Firefox only) (https://github.com/maptiler/maptiler-sdk-js/pull/140)


## 2.5.0
### others
- Update MapTiler Client library to v2.5.0


## 2.4.2
### Bug Fixes
- The language switching is now more robust and preserves the original formatting from the style (`Map.setPrimaryLangage()`) (https://github.com/maptiler/maptiler-sdk-js/pull/134)
### Others
- Now able to GitHub action a beta on NPM from the GH release creation process
- Updated GH action to v4


## 2.4.1
### Bug Fixes
- The class `AJAXError` is now imported as part of the `maplibregl` namespace (CommonJS limitation from Maplibre GL JS) (https://github.com/maptiler/maptiler-sdk-js/pull/129)
- The `Map` constructor can now also take a language as a string (https://github.com/maptiler/maptiler-sdk-js/pull/131)

## 2.4.0
### New Features
- Shows a warning message in the map container if WebGL context is lost
- The event `"webglContextLost"` is now exposed
- The `Map` class instances now have a `.setTerrainAnimationDuration(d: number)` method
- The `Map` class instances now have events related to terrain animation `"terrainAnimationStart"` and `"terrainAnimationStop"`
- expose the function `getWebGLSupportError()` to detect WebGL compatibility
- Adding detection of invalid style objects of URLs and falls back to a default style if necessary.
- Updating to Maplibre v4.7.1


## 2.3.0
### Bug Fixes
- Updating from MapLibre v4.4.1 to v4.7.0. See Maplibre changelogs for [v4.5.0](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#450), [v4.5.1](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#451), [v4.5.2](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#452), and [v4.6.0](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#460)
- Fixed the elevation shift glitch happening with terrain animation after calling `.easeTo()` (https://github.com/maptiler/maptiler-sdk-js/pull/110)
- The heatmap layer helper missed the `beforeId` option
### New Features
- Updating from MapLibre v4.4.1 to v4.7.0, adding the following features. See Maplibre changelogs for for [v4.5.0](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#450), [v4.5.1](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#451), [v4.5.2](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#452), [v4.6.0](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#460) and [v4.7.0](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#470)
### Others
- Updating from MapLibre v4.4.1 to v4.7.0
- Updating `MapTilerGeolocateControl` to match latest Maplibre update (https://github.com/maptiler/maptiler-sdk-js/pull/104)
- Now sourcing language list from `@maptiler/client` (https://github.com/maptiler/maptiler-client-js/pull/42)


## 2.2.2
### Bug Fixes
- No longer using named imports from Maplibre (https://github.com/maptiler/maptiler-sdk-js/issues/99)
- Exporting types with classes for Maplibre types (https://github.com/maptiler/maptiler-sdk-js/issues/99)
### Others
- Bundling now made with ViteJS (no longer Rollup)


## 2.2.1
### Bug Fixes
- The types from classes defined in Maplibre are now exposed more reliably (https://github.com/maptiler/maptiler-sdk-js/pull/98)
### Others
- Loading (lazy) the RTL plugin ealier and outside Map instance to prevent display glitch


## 2.2.0
### New Features
- Displays a message in the map div when WebGL2 is not supported (https://github.com/maptiler/maptiler-sdk-js/pull/92)
- Fails quietly if caching API is not usable (non https, non localhost) (https://github.com/maptiler/maptiler-sdk-js/pull/93)
### Bug Fixes
- Removed `Inflight` as a second degree dependency (https://github.com/maptiler/maptiler-sdk-js/pull/95)
- Removed double export of class+type from Maplibre (https://github.com/maptiler/maptiler-sdk-js/pull/95)
- Fixing the loading of the RTL plugin (https://github.com/maptiler/maptiler-sdk-js/pull/96)
### Others
- Replaced Eslint and Prettier by BiomeJS (ang got rid of tons of dependencies, some were problematic) (https://github.com/maptiler/maptiler-sdk-js/pull/95)
- Fixed many formatting and linting issues pointed by BiomeJS (https://github.com/maptiler/maptiler-sdk-js/pull/95)


## 2.1.0
### New Features
- Update from Maplibre v4.1.3 to v4.4.1 (see Maplibre's [changelog](https://github.com/maplibre/maplibre-gl-js/blob/main/CHANGELOG.md#441))
### Bug Fixes
- Floating buildings, fixed with the above update


## 2.0.3
### Bug Fixes
- Fixed issue in attribution control


## 2.0.2
### Bug Fixes
- Fix for the client-side caching breaking GeoJSON sources [#82](https://github.com/maptiler/maptiler-sdk-js/pull/82)
- Improved attribution management
### Others
- Update to MapLibre GL JS v4.1.3


## 2.0.1
### Bug Fixes
- Bundling issue solved by [#79](https://github.com/maptiler/maptiler-sdk-js/pull/79)


## 2.0.0
### New Features
- Updating with MapLibre GL JS v4.1
- Added client-side caching mechanism for tiles and fonts
### Bug Fixes
- Language switching now only occurs on layers fueled by a MapTiler Cloud source
### Others
- Removed `Map.loadImageAsync()` as MapLibre's `.loadImage()` is now promise based.
- Added all the exports that are now exposed from MapLibre
- Adapted some newly exported classes to make them TypeScript-compatible with the `Map` classes from both MapLibre and MapTiler SDK


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
