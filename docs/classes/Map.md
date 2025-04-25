[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / Map

# Class: Map

Defined in: [src/Map.ts:200](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L200)

The Map class can be instanciated to display a map in a `<div>`

## Extends

- `Map$1`

## Constructors

### Constructor

> **new Map**(`options`): `Map`

Defined in: [src/Map.ts:220](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L220)

#### Parameters

##### options

[`MapOptions`](../type-aliases/MapOptions.md)

#### Returns

`Map`

#### Overrides

`maplibregl.Map.constructor`

## Properties

### telemetry

> `readonly` **telemetry**: `Telemetry`

Defined in: [src/Map.ts:202](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L202)

## Methods

### addLayer()

> **addLayer**(`layer`, `beforeId?`): `this`

Defined in: [src/Map.ts:843](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L843)

Adds a [MapLibre style layer](https://maplibre.org/maplibre-style-spec/layers)
to the map's style.

A layer defines how data from a specified source will be styled. Read more about layer types
and available paint and layout properties in the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/layers).

#### Parameters

##### layer

The layer to add,
conforming to either the MapLibre Style Specification's [layer definition](https://maplibre.org/maplibre-style-spec/layers) or,
less commonly, the CustomLayerInterface specification.
The MapLibre Style Specification's layer definition is appropriate for most layers.

LayerSpecification & \{ source?: string \| SourceSpecification \| undefined; \} | `CustomLayerInterface`

##### beforeId?

`string`

The ID of an existing layer to insert the new layer before,
resulting in the new layer appearing visually beneath the existing layer.
If this argument is not specified, the layer will be appended to the end of the layers array
and appear visually above all other layers.

#### Returns

`this`

`this`

#### Overrides

`maplibregl.Map.addLayer`

***

### centerOnIpPoint()

> **centerOnIpPoint**(`zoom`): `Promise`\<`void`\>

Defined in: [src/Map.ts:1464](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1464)

#### Parameters

##### zoom

`undefined` | `number`

#### Returns

`Promise`\<`void`\>

***

### disableTerrain()

> **disableTerrain**(): `void`

Defined in: [src/Map.ts:1362](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1362)

Disable the 3D terrain visualization

#### Returns

`void`

***

### enableGlobeProjection()

> **enableGlobeProjection**(): `void`

Defined in: [src/Map.ts:1534](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1534)

Activate the globe projection.

#### Returns

`void`

***

### enableMercatorProjection()

> **enableMercatorProjection**(): `void`

Defined in: [src/Map.ts:1547](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1547)

Activate the mercator projection.

#### Returns

`void`

***

### enableTerrain()

> **enableTerrain**(`exaggeration`): `void`

Defined in: [src/Map.ts:1276](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1276)

Enables the 3D terrain visualization

#### Parameters

##### exaggeration

`number` = `...`

#### Returns

`void`

***

### fitToIpBounds()

> **fitToIpBounds**(): `Promise`\<`void`\>

Defined in: [src/Map.ts:1456](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1456)

#### Returns

`Promise`\<`void`\>

***

### getCameraHash()

> **getCameraHash**(): `string`

Defined in: [src/Map.ts:1472](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1472)

#### Returns

`string`

***

### getMaptilerSessionId()

> **getMaptilerSessionId**(): `string`

Defined in: [src/Map.ts:1497](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1497)

Get the MapTiler session ID. Convenient to dispatch to externaly built component
that do not directly have access to the SDK configuration but do have access to a Map instance.

#### Returns

`string`

***

### getPrimaryLanguage()

> **getPrimaryLanguage**(): `LanguageInfo`

Defined in: [src/Map.ts:1199](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1199)

Get the primary language

#### Returns

`LanguageInfo`

***

### getSdkConfig()

> **getSdkConfig**(): [`SdkConfig`](SdkConfig.md)

Defined in: [src/Map.ts:1488](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1488)

Get the SDK config object.
This is convenient to dispatch the SDK configuration to externally built layers
that do not directly have access to the SDK configuration but do have access to a Map instance.

#### Returns

[`SdkConfig`](SdkConfig.md)

***

### getTerrainExaggeration()

> **getTerrainExaggeration**(): `number`

Defined in: [src/Map.ts:1207](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1207)

Get the exaggeration factor applied to the terrain

#### Returns

`number`

***

### hasTerrain()

> **hasTerrain**(): `boolean`

Defined in: [src/Map.ts:1215](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1215)

Know if terrian is enabled or not

#### Returns

`boolean`

***

### isGlobeProjection()

> **isGlobeProjection**(): `boolean`

Defined in: [src/Map.ts:1520](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1520)

Returns whether a globe projection is currently being used

#### Returns

`boolean`

***

### isLanguageUpdated()

> **isLanguageUpdated**(): `boolean`

Defined in: [src/Map.ts:1563](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1563)

Returns `true` is the language was ever updated, meaning changed
from what is delivered in the style.
Returns `false` if language in use is the language from the style
and has never been changed.

#### Returns

`boolean`

***

### moveLayer()

> **moveLayer**(`id`, `beforeId?`): `this`

Defined in: [src/Map.ts:868](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L868)

Moves a layer to a different z-position.

#### Parameters

##### id

`string`

The ID of the layer to move.

##### beforeId?

`string`

The ID of an existing layer to insert the new layer before. When viewing the map, the `id` layer will appear beneath the `beforeId` layer. If `beforeId` is omitted, the layer will be appended to the end of the layers array and appear above all other layers on the map.

#### Returns

`this`

`this`

#### Example

Move a layer with ID 'polygon' before the layer with ID 'country-label'. The `polygon` layer will appear beneath the `country-label` layer on the map.
```ts
map.moveLayer('polygon', 'country-label');
```

#### Overrides

`maplibregl.Map.moveLayer`

***

### onLoadAsync()

> **onLoadAsync**(): `Promise`\<`Map`\>

Defined in: [src/Map.ts:714](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L714)

Awaits for _this_ Map instance to be "loaded" and returns a Promise to the Map.
If _this_ Map instance is already loaded, the Promise is resolved directly,
otherwise, it is resolved as a result of the "load" event.

#### Returns

`Promise`\<`Map`\>

***

### onLoadWithTerrainAsync()

> **onLoadWithTerrainAsync**(): `Promise`\<`Map`\>

Defined in: [src/Map.ts:755](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L755)

Awaits for _this_ Map instance to be "loaded" as well as with terrain being non-null for the first time
and returns a Promise to the Map.
If _this_ Map instance is already loaded with terrain, the Promise is resolved directly,
otherwise, it is resolved as a result of the "loadWithTerrain" event.

#### Returns

`Promise`\<`Map`\>

***

### onReadyAsync()

> **onReadyAsync**(): `Promise`\<`Map`\>

Defined in: [src/Map.ts:735](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L735)

Awaits for _this_ Map instance to be "ready" and returns a Promise to the Map.
If _this_ Map instance is already ready, the Promise is resolved directly,
otherwise, it is resolved as a result of the "ready" event.
A map instance is "ready" when all the controls that can be managed by the contructor are
dealt with. This happens after the "load" event, due to the asynchronous nature
of some built-in controls.

#### Returns

`Promise`\<`Map`\>

***

### recreate()

> **recreate**(): `void`

Defined in: [src/Map.ts:683](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L683)

Recreates the map instance with the same options.
Useful for WebGL context loss.

#### Returns

`void`

***

### removeLayer()

> **removeLayer**(`id`): `this`

Defined in: [src/Map.ts:887](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L887)

Removes the layer with the given ID from the map's style.

An ErrorEvent will be fired if the image parameter is invald.

#### Parameters

##### id

`string`

The ID of the layer to remove

#### Returns

`this`

`this`

#### Example

If a layer with ID 'state-data' exists, remove it.
```ts
if (map.getLayer('state-data')) map.removeLayer('state-data');
```

#### Overrides

`maplibregl.Map.removeLayer`

***

### setFilter()

> **setFilter**(`layerId`, `filter?`, `options?`): `this`

Defined in: [src/Map.ts:919](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L919)

Sets the filter for the specified style layer.

Filters control which features a style layer renders from its source.
Any feature for which the filter expression evaluates to `true` will be
rendered on the map. Those that are false will be hidden.

Use `setFilter` to show a subset of your source data.

To clear the filter, pass `null` or `undefined` as the second parameter.

#### Parameters

##### layerId

`string`

##### filter?

`null` | `FilterSpecification`

##### options?

`StyleSetterOptions`

#### Returns

`this`

#### Overrides

`maplibregl.Map.setFilter`

***

### setGlyphs()

> **setGlyphs**(`glyphsUrl`, `options?`): `this`

Defined in: [src/Map.ts:972](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L972)

Sets the value of the style's glyphs property.

#### Parameters

##### glyphsUrl

Glyph URL to set. Must conform to the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/glyphs/).

`null` | `string`

##### options?

`StyleSetterOptions`

Options object.

#### Returns

`this`

`this`

#### Example

```ts
map.setGlyphs('https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf');
```

#### Overrides

`maplibregl.Map.setGlyphs`

***

### setLanguage()

> **setLanguage**(`language`): `void`

Defined in: [src/Map.ts:991](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L991)

Define the primary language of the map. Note that not all the languages shorthands provided are available.

#### Parameters

##### language

`string` | `LanguageInfo`

#### Returns

`void`

***

### setLayerZoomRange()

> **setLayerZoomRange**(`layerId`, `minzoom`, `maxzoom`): `this`

Defined in: [src/Map.ts:903](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L903)

Sets the zoom extent for the specified style layer. The zoom extent includes the
[minimum zoom level](https://maplibre.org/maplibre-style-spec/layers/#minzoom)
and [maximum zoom level](https://maplibre.org/maplibre-style-spec/layers/#maxzoom))
at which the layer will be rendered.

Note: For style layers using vector sources, style layers cannot be rendered at zoom levels lower than the
minimum zoom level of the _source layer_ because the data does not exist at those zoom levels. If the minimum
zoom level of the source layer is higher than the minimum zoom level defined in the style layer, the style
layer will not be rendered at all zoom levels in the zoom range.

#### Parameters

##### layerId

`string`

##### minzoom

`number`

##### maxzoom

`number`

#### Returns

`this`

#### Overrides

`maplibregl.Map.setLayerZoomRange`

***

### setLayoutProperty()

> **setLayoutProperty**(`layerId`, `name`, `value`, `options?`): `this`

Defined in: [src/Map.ts:956](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L956)

Sets the value of a layout property in the specified style layer.
Layout properties define how the layer is styled.
Layout properties for layers of the same type are documented together.
Layers of different types have different layout properties.
See the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/) for the complete list of layout properties.

#### Parameters

##### layerId

`string`

The ID of the layer to set the layout property in.

##### name

`string`

The name of the layout property to set.

##### value

`any`

The value of the layout property to set.
Must be of a type appropriate for the property, as defined in the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/).

##### options?

`StyleSetterOptions`

Options object.

#### Returns

`this`

`this`

#### Overrides

`maplibregl.Map.setLayoutProperty`

***

### setPaintProperty()

> **setPaintProperty**(`layerId`, `name`, `value`, `options?`): `this`

Defined in: [src/Map.ts:938](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L938)

Sets the value of a paint property in the specified style layer.

#### Parameters

##### layerId

`string`

The ID of the layer to set the paint property in.

##### name

`string`

The name of the paint property to set.

##### value

`any`

The value of the paint property to set.
Must be of a type appropriate for the property, as defined in the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/).

##### options?

`StyleSetterOptions`

Options object.

#### Returns

`this`

`this`

#### Example

```ts
map.setPaintProperty('my-layer', 'fill-color', '#faafee');
```

#### Overrides

`maplibregl.Map.setPaintProperty`

***

### setStyle()

> **setStyle**(`style`, `options?`): `this`

Defined in: [src/Map.ts:789](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L789)

Update the style of the map.
Can be:
- a full style URL (possibly with API key)
- a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
- a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)

#### Parameters

##### style

`null` | `string` | `ReferenceMapStyle` | `MapStyleVariant` | `StyleSpecification`

##### options?

`StyleSwapOptions` & `StyleOptions`

#### Returns

`this`

#### Overrides

`maplibregl.Map.setStyle`

***

### setTerrainAnimationDuration()

> **setTerrainAnimationDuration**(`d`): `void`

Defined in: [src/Map.ts:704](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L704)

Set the duration (millisec) of the terrain animation for growing or flattening.
Must be positive. (Built-in default: `1000` milliseconds)

#### Parameters

##### d

`number`

#### Returns

`void`

***

### setTerrainExaggeration()

> **setTerrainExaggeration**(`exaggeration`, `animate`): `void`

Defined in: [src/Map.ts:1432](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1432)

Sets the 3D terrain exageration factor.
If the terrain was not enabled prior to the call of this method,
the method `.enableTerrain()` will be called.
If `animate` is `true`, the terrain transformation will be animated in the span of 1 second.
If `animate` is `false`, no animated transition to the newly defined exaggeration.

#### Parameters

##### exaggeration

`number`

##### animate

`boolean` = `true`

#### Returns

`void`

***

### setTransformRequest()

> **setTransformRequest**(`transformRequest`): `this`

Defined in: [src/Map.ts:1512](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/Map.ts#L1512)

Updates the requestManager's transform request with a new function.

#### Parameters

##### transformRequest

`RequestTransformFunction`

A callback run before the Map makes a request for an external URL. The callback can be used to modify the url, set headers, or set the credentials property for cross-origin requests.
   Expected to return an object with a `url` property and optionally `headers` and `credentials` properties

#### Returns

`this`

`this`

#### Example

```ts
map.setTransformRequest((url: string, resourceType: string) => {});
```

#### Overrides

`maplibregl.Map.setTransformRequest`
