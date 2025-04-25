[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MapOptions

# Type Alias: MapOptions

> **MapOptions** = `Omit`\<`MapOptionsML`, `"style"` \| `"maplibreLogo"`\> & `object`

Defined in: [src/Map.ts:78](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L78)

Options to provide to the `Map` constructor

## Type declaration

### apiKey?

> `optional` **apiKey**: `string`

Define the MapTiler Cloud API key to be used. This is strictly equivalent to setting
`config.apiKey` and will overwrite it.

### customAttribution?

> `optional` **customAttribution**: `string` \| `string`[]

Attribution text to show in an [AttributionControl](../classes/AttributionControl.md).

### forceNoAttributionControl?

> `optional` **forceNoAttributionControl**: `boolean`

attributionControl

### fullscreenControl?

> `optional` **fullscreenControl**: `boolean` \| `ControlPosition`

Show the full screen control. (default: `false`, will show if `true`)

### geolocate?

> `optional` **geolocate**: *typeof* [`GeolocationType`](../variables/GeolocationType.md)\[keyof *typeof* [`GeolocationType`](../variables/GeolocationType.md)\] \| `boolean`

Method to position the map at a given geolocation. Only if:
- `hash` is `false`
- `center` is not provided

If the value is `true` of `"POINT"` (given by `GeolocationType.POINT`) then the positionning uses the MapTiler Cloud
Geolocation to find the non-GPS location point.
The zoom level can be provided in the `Map` constructor with the `zoom` option or will be `13` if not provided.

If the value is `"COUNTRY"` (given by `GeolocationType.COUNTRY`) then the map is centered around the bounding box of the country.
In this case, the `zoom` option will be ignored.

If the value is `false`, no geolocation is performed and the map centering and zooming depends on other options or on
the built-in defaults.

If this option is non-false and the options `center` is also provided, then `center` prevails.

Default: `false`

### geolocateControl?

> `optional` **geolocateControl**: `boolean` \| `ControlPosition`

Show the geolocate control. (default: `true`, will hide if `false`)

### language?

> `optional` **language**: `LanguageInfo` \| `string`

Define the language of the map. This can be done directly with a language ISO code (eg. "en"),
the ISO code prepended with the OSM flag (eg. "name:en" or even just "name"),
or with a built-in shorthand (eg. Language.ENGLISH).
Note that this is equivalent to setting the `config.primaryLanguage` and will overwrite it.

### maptilerLogo?

> `optional` **maptilerLogo**: `boolean`

Shows or hides the MapTiler logo in the bottom left corner.

For paid plans:
- `true` shows MapTiler logo
- `false` hodes MapTiler logo
- default: `false` (hide)

For free plans: MapTiler logo always shows, regardless of the value.

### minimap?

> `optional` **minimap**: `boolean` \| `ControlPosition` \| [`MinimapOptionsInput`](../interfaces/MinimapOptionsInput.md)

Display a minimap in a user defined corner of the map. (default: `bottom-left` corner)
If set to true, the map will assume it is a minimap and forego the attribution control.

### navigationControl?

> `optional` **navigationControl**: `boolean` \| `ControlPosition`

Show the navigation control. (default: `true`, will hide if `false`)

### projection?

> `optional` **projection**: `ProjectionTypes`

Whether the projection should be "mercator" or "globe".
If not provided, the style takes precedence. If provided, overwrite the style.

### projectionControl?

> `optional` **projectionControl**: `boolean` \| `ControlPosition`

Show the projection control. (default: `false`, will show if `true`)

### scaleControl?

> `optional` **scaleControl**: `boolean` \| `ControlPosition`

Show the scale control. (default: `false`, will show if `true`)

### style?

> `optional` **style**: `ReferenceMapStyle` \| `MapStyleVariant` \| `StyleSpecification` \| `string`

Style of the map. Can be:
- a full style URL (possibly with API key)
- a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
- a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)

### terrain?

> `optional` **terrain**: `boolean`

Enables 3D terrain if `true`. (default: `false`)

### terrainControl?

> `optional` **terrainControl**: `boolean` \| `ControlPosition`

Show the terrain control. (default: `false`, will show if `true`)

### terrainExaggeration?

> `optional` **terrainExaggeration**: `number`

Exaggeration factor of the terrain. (default: `1`, no exaggeration)
