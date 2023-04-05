# Changelog
## [v1.0.9](https://github.com/maptiler/maptiler-sdk-js/releases/tag/v1.0.9)
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