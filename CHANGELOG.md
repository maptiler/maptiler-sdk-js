# Changelog

## [v1.1.1](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.1.1)
- VER update to `maplibre-gl@3.1.0`

## [v1.1.0](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.1.0)
- VER updated from `maplibre-gl@3.0.0-pre.4` to `maplibre-gl@3.0.1` (this includes the switch to WebGL2)
- UP made the few necessary changes acording to updating the ML v3. No braking change for SDK API
- FIX the MapTiler logo rel name and its nofollow feature
- ADD bringing back Map's `options.transformRequest` and `.setTransformRequest()`


## [v1.0.12](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.12)
- ADD a new language flag `Language.STYLE_LOCK` to force keep the language form the style and prevent any further update. Can be at a sigle map instance level (via constuctor option `language`) or via global config (`config.primaryLanguage`)
- FIX the fallback language was `{name:latin}`, it is now replaced by `{name}`, which is for the local name (present by default for many places while `latin` is less frequent).

## [v1.0.11](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.11)
- DOC update for `Map`'s `option.maptilerLogo` that was a bit unclear
- FIX now exporting `MaptilerNavigationControl`

## [v1.0.10](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.10)
- ADD terrain growing animation on enabling/disabling
- ADD `Map` custom event `loadWithTerrain`
- ADD `Map` lifecycle methods `.onLoadAsync()` and `.onLoadWithTerrainAsync()`
- DOC readme section was added about the event an methods above
- VER updated from `maplibre-gl@3.0.0-pre.3` to `maplibre-gl@3.0.0-pre.4`
- VER updated from `typedoc@0.23.21` to `typedoc@0.24.4`, which changes slightly the look of the reference documentation.
- VER updated from `typescript@4.8.4` to `typescript@5.0.4`
- VER updated from `rollup@2.79.0` to `rollup@3.20.6` as well as all the Rollup plugins

## [v1.0.9](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.9)
- FIX: if the geolocate option is missing from `Map` constructor, then it's considered `false`

- FIX: The instance types for the following MapLibre classes are now fully exported:
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

- FIX: The following class have been extended to provide greater compatibility with SDK,s MapL
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

- ADD: new styles:
  - `MapStyle.STREETS.NIGHT`
  - `MapStyle.WINTER.DARK`
  - `MapStyle.OUTDOOR.DARK`

## [v1.0.8](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.8)
- FIX: Since v1.0.7, the `Map` primary language (when custom) was no longer persistant on style update.

## [v1.0.7](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.7)
- The `apiKey` can now be specified in the `Map` constructor (will propagate to `config`)
- The `language` can now be speficifed in the `Map` constructo (will **not** propagete to `config` and will apply only to this specific instance)
- `Map` now has the method `.getSdkConfig()` to retrieve the config object. 
- `Map` now has the method `.getMaptilerSessionId()` to retrieve the MapTiler session ID

Both `.getSdkConfig()` and `.getMaptilerSessionId()` are handy for layers or control built outside of the SDK that still need some of the configuration to interact with the server. Those components do not always have access to the internal of the SDK (especially that the config is scoped) but can access to the `Map` instance to which they are added with the implementation of the `.onAdd()` method.

## [v1.0.6](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.6)
- Now exposing `MaptilerGeolocateControl` for external initialization if needed
- Now exposing `MaptilerTerrain` for external initialization if needed

## [v1.0.5](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.5)
- Terrain elevation is now using MapTiler's `terrain-rgb-v2`

## [v1.0.4](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.4)
- Improved the geolocate control behavior by not zooming out

## [v1.0.3](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.3)
- Fixed the usage of relative path style JSON (in `Map` constructor and `.setStyle()`)

## [v1.0.2](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.2)
- Fixed the dependency scheme of MapLibre import.

## [v1.0.1](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.1)
- Reducing the NPM size by ignoring documentation images

## [v1.0.0](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.0)
- First public version!