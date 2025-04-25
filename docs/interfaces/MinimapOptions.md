[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MinimapOptions

# Interface: MinimapOptions

Defined in: [src/controls/Minimap.ts:64](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L64)

Options to provide to the `Map` constructor

## Extends

- [`MapOptions`](../type-aliases/MapOptions.md)

## Properties

### apiKey?

> `optional` **apiKey**: `string`

Defined in: [src/Map.ts:99](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L99)

Define the MapTiler Cloud API key to be used. This is strictly equivalent to setting
`config.apiKey` and will overwrite it.

#### Inherited from

`MapOptions.apiKey`

***

### containerStyle

> **containerStyle**: `Record`\<`string`, `string`\>

Defined in: [src/controls/Minimap.ts:67](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L67)

***

### customAttribution?

> `optional` **customAttribution**: `string` \| `string`[]

Defined in: [src/Map.ts:116](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L116)

Attribution text to show in an [AttributionControl](../classes/AttributionControl.md).

#### Inherited from

`MapOptions.customAttribution`

***

### forceNoAttributionControl?

> `optional` **forceNoAttributionControl**: `boolean`

Defined in: [src/Map.ts:162](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L162)

attributionControl

#### Inherited from

`MapOptions.forceNoAttributionControl`

***

### fullscreenControl?

> `optional` **fullscreenControl**: `boolean` \| `ControlPosition`

Defined in: [src/Map.ts:151](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L151)

Show the full screen control. (default: `false`, will show if `true`)

#### Inherited from

`MapOptions.fullscreenControl`

***

### geolocate?

> `optional` **geolocate**: `boolean` \| `"POINT"` \| `"COUNTRY"`

Defined in: [src/Map.ts:183](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L183)

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

#### Inherited from

`MapOptions.geolocate`

***

### geolocateControl?

> `optional` **geolocateControl**: `boolean` \| `ControlPosition`

Defined in: [src/Map.ts:141](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L141)

Show the geolocate control. (default: `true`, will hide if `false`)

#### Inherited from

`MapOptions.geolocateControl`

***

### language?

> `optional` **language**: `string` \| `LanguageInfo`

Defined in: [src/Map.ts:93](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L93)

Define the language of the map. This can be done directly with a language ISO code (eg. "en"),
the ISO code prepended with the OSM flag (eg. "name:en" or even just "name"),
or with a built-in shorthand (eg. Language.ENGLISH).
Note that this is equivalent to setting the `config.primaryLanguage` and will overwrite it.

#### Inherited from

`MapOptions.language`

***

### maptilerLogo?

> `optional` **maptilerLogo**: `boolean`

Defined in: [src/Map.ts:111](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L111)

Shows or hides the MapTiler logo in the bottom left corner.

For paid plans:
- `true` shows MapTiler logo
- `false` hodes MapTiler logo
- default: `false` (hide)

For free plans: MapTiler logo always shows, regardless of the value.

#### Inherited from

`MapOptions.maptilerLogo`

***

### minimap?

> `optional` **minimap**: `boolean` \| [`MinimapOptionsInput`](MinimapOptionsInput.md) \| `ControlPosition`

Defined in: [src/Map.ts:157](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L157)

Display a minimap in a user defined corner of the map. (default: `bottom-left` corner)
If set to true, the map will assume it is a minimap and forego the attribution control.

#### Inherited from

`MapOptions.minimap`

***

### navigationControl?

> `optional` **navigationControl**: `boolean` \| `ControlPosition`

Defined in: [src/Map.ts:131](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L131)

Show the navigation control. (default: `true`, will hide if `false`)

#### Inherited from

`MapOptions.navigationControl`

***

### parentRect?

> `optional` **parentRect**: [`ParentRect`](ParentRect.md)

Defined in: [src/controls/Minimap.ts:68](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L68)

***

### pitchAdjust

> **pitchAdjust**: `boolean`

Defined in: [src/controls/Minimap.ts:66](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L66)

***

### projection?

> `optional` **projection**: `ProjectionTypes`

Defined in: [src/Map.ts:194](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L194)

Whether the projection should be "mercator" or "globe".
If not provided, the style takes precedence. If provided, overwrite the style.

#### Inherited from

`MapOptions.projection`

***

### projectionControl?

> `optional` **projectionControl**: `boolean` \| `ControlPosition`

Defined in: [src/Map.ts:188](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L188)

Show the projection control. (default: `false`, will show if `true`)

#### Inherited from

`MapOptions.projectionControl`

***

### scaleControl?

> `optional` **scaleControl**: `boolean` \| `ControlPosition`

Defined in: [src/Map.ts:146](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L146)

Show the scale control. (default: `false`, will show if `true`)

#### Inherited from

`MapOptions.scaleControl`

***

### style?

> `optional` **style**: `string` \| `ReferenceMapStyle` \| `MapStyleVariant` \| `StyleSpecification`

Defined in: [src/Map.ts:85](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L85)

Style of the map. Can be:
- a full style URL (possibly with API key)
- a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
- a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)

#### Inherited from

`MapOptions.style`

***

### terrain?

> `optional` **terrain**: `boolean`

Defined in: [src/Map.ts:121](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L121)

Enables 3D terrain if `true`. (default: `false`)

#### Inherited from

`MapOptions.terrain`

***

### terrainControl?

> `optional` **terrainControl**: `boolean` \| `ControlPosition`

Defined in: [src/Map.ts:136](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L136)

Show the terrain control. (default: `false`, will show if `true`)

#### Inherited from

`MapOptions.terrainControl`

***

### terrainExaggeration?

> `optional` **terrainExaggeration**: `number`

Defined in: [src/Map.ts:126](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L126)

Exaggeration factor of the terrain. (default: `1`, no exaggeration)

#### Inherited from

`MapOptions.terrainExaggeration`

***

### zoomAdjust

> **zoomAdjust**: `number`

Defined in: [src/controls/Minimap.ts:65](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L65)
