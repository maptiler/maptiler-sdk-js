MapTiler SDK

# MapTiler SDK

## Table of contents

### Namespaces

- [Point](modules/Point.md)

### Classes

- [Map](classes/Map.md)
- [SdkConfig](classes/SdkConfig.md)

### Type Aliases

- [LanguageString](README.md#languagestring)
- [MapOptions](README.md#mapoptions)
- [MapStyleType](README.md#mapstyletype)
- [Unit](README.md#unit)

### Variables

- [AJAXError](README.md#ajaxerror)
- [AttributionControl](README.md#attributioncontrol)
- [CanvasSource](README.md#canvassource)
- [Evented](README.md#evented)
- [FullscreenControl](README.md#fullscreencontrol)
- [GeoJSONSource](README.md#geojsonsource)
- [GeolocateControl](README.md#geolocatecontrol)
- [ImageSource](README.md#imagesource)
- [Language](README.md#language)
- [LngLat](README.md#lnglat)
- [LngLatBounds](README.md#lnglatbounds)
- [LogoControl](README.md#logocontrol)
- [MapStyle](README.md#mapstyle)
- [Marker](README.md#marker)
- [MercatorCoordinate](README.md#mercatorcoordinate)
- [NavigationControl](README.md#navigationcontrol)
- [Popup](README.md#popup)
- [RasterDEMTileSource](README.md#rasterdemtilesource)
- [RasterTileSource](README.md#rastertilesource)
- [ScaleControl](README.md#scalecontrol)
- [Style](README.md#style)
- [TerrainControl](README.md#terraincontrol)
- [VectorTileSource](README.md#vectortilesource)
- [VideoSource](README.md#videosource)
- [config](README.md#config)
- [maxParallelImageRequests](README.md#maxparallelimagerequests)
- [version](README.md#version)
- [workerCount](README.md#workercount)
- [workerUrl](README.md#workerurl)

### Functions

- [Point](README.md#point)
- [addProtocol](README.md#addprotocol)
- [clearPrewarmedResources](README.md#clearprewarmedresources)
- [clearStorage](README.md#clearstorage)
- [getRTLTextPluginStatus](README.md#getrtltextpluginstatus)
- [prewarm](README.md#prewarm)
- [removeProtocol](README.md#removeprotocol)
- [setRTLTextPlugin](README.md#setrtltextplugin)
- [supported](README.md#supported)

## Type Aliases

### LanguageString

Ƭ **LanguageString**: `Values`<typeof [`Language`](README.md#language)\>

Built-in languages values as strings

#### Defined in

[src/language.ts:104](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/language.ts#L104)

___

### MapOptions

Ƭ **MapOptions**: `Omit`<`maplibre.MapOptions`, ``"style"`` \| ``"maplibreLogo"``\> & { `fullscreenControl?`: `boolean` \| `maplibre.ControlPosition` ; `maptilerLogo?`: `boolean` ; `navigationControl?`: `boolean` \| `maplibre.ControlPosition` ; `scaleControl?`: `boolean` \| `maplibre.ControlPosition` ; `style?`: `string` ; `terrain?`: `boolean` ; `terrainControl?`: `boolean` \| `maplibre.ControlPosition` ; `terrainExaggeration?`: `number`  }

Options to provide to the `Map` constructor

#### Defined in

[src/Map.ts:29](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/Map.ts#L29)

___

### MapStyleType

Ƭ **MapStyleType**: `Object`

#### Index signature

▪ [key: `string`]: `ReferenceMapStyle`

#### Defined in

src/mapstyle/mapstyle.ts:243

___

### Unit

Ƭ **Unit**: ``"imperial"`` \| ``"metric"`` \| ``"nautical"``

#### Defined in

[src/unit.ts:1](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/unit.ts#L1)

## Variables

### AJAXError

• `Const` **AJAXError**: typeof `AJAXError` = `ML.default.AJAXError`

#### Defined in

[src/index.ts:30](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L30)

___

### AttributionControl

• `Const` **AttributionControl**: typeof `AttributionControl` = `ML.default.AttributionControl`

#### Defined in

[src/index.ts:17](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L17)

___

### CanvasSource

• `Const` **CanvasSource**: typeof `CanvasSource` = `ML.default.CanvasSource`

#### Defined in

[src/index.ts:32](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L32)

___

### Evented

• `Const` **Evented**: typeof `Evented` = `ML.default.Evented`

#### Defined in

[src/index.ts:29](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L29)

___

### FullscreenControl

• `Const` **FullscreenControl**: typeof `FullscreenControl` = `ML.default.FullscreenControl`

#### Defined in

[src/index.ts:20](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L20)

___

### GeoJSONSource

• `Const` **GeoJSONSource**: typeof `GeoJSONSource` = `ML.default.GeoJSONSource`

#### Defined in

[src/index.ts:33](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L33)

___

### GeolocateControl

• `Const` **GeolocateControl**: typeof `GeolocateControl` = `ML.default.GeolocateControl`

#### Defined in

[src/index.ts:16](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L16)

___

### ImageSource

• `Const` **ImageSource**: typeof `ImageSource` = `ML.default.ImageSource`

#### Defined in

[src/index.ts:34](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L34)

___

### Language

• `Const` **Language**: `Object`

Languages. Note that not all the languages of this list are available but the compatibility list may be expanded in the future.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ALBANIAN` | ``"sq"`` | - |
| `AMHARIC` | ``"am"`` | - |
| `ARABIC` | ``"ar"`` | - |
| `ARMENIAN` | ``"hy"`` | - |
| `AUTO` | ``"auto"`` | AUTO mode uses the language of the browser |
| `AZERBAIJANI` | ``"az"`` | - |
| `BASQUE` | ``"eu"`` | - |
| `BELORUSSIAN` | ``"be"`` | - |
| `BOSNIAN` | ``"bs"`` | - |
| `BRETON` | ``"br"`` | - |
| `BULGARIAN` | ``"bg"`` | - |
| `CATALAN` | ``"ca"`` | - |
| `CHINESE` | ``"zh"`` | - |
| `CORSICAN` | ``"co"`` | - |
| `CROATIAN` | ``"hr"`` | - |
| `CZECH` | ``"cs"`` | - |
| `DANISH` | ``"da"`` | - |
| `DUTCH` | ``"nl"`` | - |
| `ENGLISH` | ``"en"`` | - |
| `ESPERANTO` | ``"eo"`` | - |
| `ESTONIAN` | ``"et"`` | - |
| `FINNISH` | ``"fi"`` | - |
| `FRENCH` | ``"fr"`` | - |
| `FRISIAN` | ``"fy"`` | - |
| `GEORGIAN` | ``"ka"`` | - |
| `GERMAN` | ``"de"`` | - |
| `GREEK` | ``"el"`` | - |
| `HEBREW` | ``"he"`` | - |
| `HINDI` | ``"hi"`` | - |
| `HUNGARIAN` | ``"hu"`` | - |
| `ICELANDIC` | ``"is"`` | - |
| `INDONESIAN` | ``"id"`` | - |
| `IRISH` | ``"ga"`` | - |
| `ITALIAN` | ``"it"`` | - |
| `JAPANESE` | ``"ja"`` | - |
| `JAPANESE_2018` | ``"ja-Latn"`` | - |
| `JAPANESE_HIRAGANA` | ``"ja-Hira"`` | - |
| `JAPANESE_KANA` | ``"ja_kana"`` | - |
| `JAPANESE_LATIN` | ``"ja_rm"`` | - |
| `KANNADA` | ``"kn"`` | - |
| `KAZAKH` | ``"kk"`` | - |
| `KOREAN` | ``"ko"`` | - |
| `KOREAN_LATIN` | ``"ko-Latn"`` | - |
| `KURDISH` | ``"ku"`` | - |
| `LATIN` | ``"latin"`` | Default fallback languages that uses latin charaters |
| `LATVIAN` | ``"lv"`` | - |
| `LITHUANIAN` | ``"lt"`` | - |
| `LOCAL` | ``""`` | Labels are in their local language, when available |
| `LUXEMBOURGISH` | ``"lb"`` | - |
| `MACEDONIAN` | ``"mk"`` | - |
| `MALAYALAM` | ``"ml"`` | - |
| `MALTESE` | ``"mt"`` | - |
| `NON_LATIN` | ``"nonlatin"`` | Default fallback languages that uses non-latin charaters |
| `NORWEGIAN` | ``"no"`` | - |
| `OCCITAN` | ``"oc"`` | - |
| `POLISH` | ``"pl"`` | - |
| `PORTUGUESE` | ``"pt"`` | - |
| `ROMANIAN` | ``"ro"`` | - |
| `ROMANSH` | ``"rm"`` | - |
| `ROMAN_LATIN` | ``"la"`` | - |
| `RUSSIAN` | ``"ru"`` | - |
| `SCOTTISH_GAELIC` | ``"gd"`` | - |
| `SERBIAN_CYRILLIC` | ``"sr"`` | - |
| `SERBIAN_LATIN` | ``"sr-Latn"`` | - |
| `SLOVAK` | ``"sk"`` | - |
| `SLOVENE` | ``"sl"`` | - |
| `SPANISH` | ``"es"`` | - |
| `SWEDISH` | ``"sv"`` | - |
| `TAMIL` | ``"ta"`` | - |
| `TELUGU` | ``"te"`` | - |
| `THAI` | ``"th"`` | - |
| `TURKISH` | ``"tr"`` | - |
| `UKRAINIAN` | ``"uk"`` | - |
| `WELSH` | ``"cy"`` | - |

#### Defined in

[src/language.ts:4](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/language.ts#L4)

___

### LngLat

• `Const` **LngLat**: typeof `LngLat` = `ML.default.LngLat`

#### Defined in

[src/index.ts:25](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L25)

___

### LngLatBounds

• `Const` **LngLatBounds**: typeof `LngLatBounds` = `ML.default.LngLatBounds`

#### Defined in

[src/index.ts:26](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L26)

___

### LogoControl

• `Const` **LogoControl**: typeof `LogoControl` = `ML.default.LogoControl`

#### Defined in

[src/index.ts:18](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L18)

___

### MapStyle

• `Const` **MapStyle**: [`MapStyleType`](README.md#mapstyletype)

Contains all the reference map style created by MapTiler team as well as all the variations.
For example, `MapStyle.STREETS` and the variations:
- `MapStyle.STREETS.DARK`
- `MapStyle.STREETS.LIGHT`
- `MapStyle.STREETS.PASTEL`

#### Defined in

src/mapstyle/mapstyle.ts:290

___

### Marker

• `Const` **Marker**: typeof `Marker` = `ML.default.Marker`

#### Defined in

[src/index.ts:23](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L23)

___

### MercatorCoordinate

• `Const` **MercatorCoordinate**: typeof `MercatorCoordinate` = `ML.default.MercatorCoordinate`

#### Defined in

[src/index.ts:28](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L28)

___

### NavigationControl

• `Const` **NavigationControl**: typeof `NavigationControl` = `ML.default.NavigationControl`

#### Defined in

[src/index.ts:15](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L15)

___

### Popup

• `Const` **Popup**: typeof `Popup` = `ML.default.Popup`

#### Defined in

[src/index.ts:22](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L22)

___

### RasterDEMTileSource

• `Const` **RasterDEMTileSource**: typeof `RasterDEMTileSource` = `ML.default.RasterDEMTileSource`

#### Defined in

[src/index.ts:35](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L35)

___

### RasterTileSource

• `Const` **RasterTileSource**: typeof `RasterTileSource` = `ML.default.RasterTileSource`

#### Defined in

[src/index.ts:36](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L36)

___

### ScaleControl

• `Const` **ScaleControl**: typeof `ScaleControl` = `ML.default.ScaleControl`

#### Defined in

[src/index.ts:19](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L19)

___

### Style

• `Const` **Style**: typeof `Style` = `ML.default.Style`

#### Defined in

[src/index.ts:24](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L24)

___

### TerrainControl

• `Const` **TerrainControl**: typeof `TerrainControl` = `ML.default.TerrainControl`

#### Defined in

[src/index.ts:21](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L21)

___

### VectorTileSource

• `Const` **VectorTileSource**: typeof `VectorTileSource` = `ML.default.VectorTileSource`

#### Defined in

[src/index.ts:37](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L37)

___

### VideoSource

• `Const` **VideoSource**: typeof `VideoSource` = `ML.default.VideoSource`

#### Defined in

[src/index.ts:38](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L38)

___

### config

• `Const` **config**: [`SdkConfig`](classes/SdkConfig.md)

#### Defined in

[src/config.ts:86](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/config.ts#L86)

___

### maxParallelImageRequests

• `Const` **maxParallelImageRequests**: `number` = `ML.default.maxParallelImageRequests`

#### Defined in

[src/index.ts:43](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L43)

___

### version

• `Const` **version**: `string` = `ML.default.version`

#### Defined in

[src/index.ts:41](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L41)

___

### workerCount

• `Const` **workerCount**: `number` = `ML.default.workerCount`

#### Defined in

[src/index.ts:42](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L42)

___

### workerUrl

• `Const` **workerUrl**: `string` = `ML.default.workerUrl`

#### Defined in

[src/index.ts:45](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/index.ts#L45)

## Functions

### Point

▸ **Point**(`x`, `y`): `void`

A standalone point geometry with useful accessor, comparison, and
modification methods.

**`Example`**

```ts
var point = new Point(-77, 38);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `x` | `any` | the x-coordinate. this could be longitude or screen pixels, or any other sort of unit. |
| `y` | `any` | the y-coordinate. this could be latitude or screen pixels, or any other sort of unit. |

#### Returns

`void`

#### Defined in

[src/Point.ts:17](https://github.com/maptiler/maptiler-sdk-js/blob/1f4ea9e/src/Point.ts#L17)

___

### addProtocol

▸ **addProtocol**(`customProtocol`, `loadFn`): `void`

Sets a custom load tile function that will be called when using a source that starts with a custom url schema.
The example below will be triggered for custom:// urls defined in the sources list in the style definitions.
The function passed will receive the request parameters and should call the callback with the resulting request,
for example a pbf vector tile, non-compressed, represented as ArrayBuffer.

**`Function`**

addProtocol

**`Example`**

// this will fetch a file using the fetch API (this is obviously a non iteresting example...)
maplibre.addProtocol('custom', (params, callback) => {
	fetch(`https://${params.url.split("://")[1]}`)
		.then(t => {
			if (t.status == 200) {
				t.arrayBuffer().then(arr => {
					callback(null, arr, null, null);
				});
			} else {
				callback(new Error(`Tile fetch error: ${t.statusText}`));
			}
		})
		.catch(e => {
			callback(new Error(e));
		});
	return { cancel: () => { } };
});
// the following is an example of a way to return an error when trying to load a tile
maplibre.addProtocol('custom2', (params, callback) => {
     callback(new Error('someErrorMessage'));
     return { cancel: () => { } };
});

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `customProtocol` | `string` | the protocol to hook, for example 'custom' |
| `loadFn` | (`requestParameters`: `RequestParameters`, `callback`: `ResponseCallback`<`any`\>) => `Cancelable` | the function to use when trying to fetch a tile specified by the customProtocol |

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11718

___

### clearPrewarmedResources

▸ **clearPrewarmedResources**(): `void`

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11506

___

### clearStorage

▸ **clearStorage**(`callback?`): `void`

Clears browser storage used by this library. Using this method flushes the MapLibre tile
cache that is managed by this library. Tiles may still be cached by the browser
in some cases.

This API is supported on browsers where the [`Cache` API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
is supported and enabled. This includes all major browsers when pages are served over
`https://`, except Internet Explorer and Edge Mobile.

When called in unsupported browsers or environments (private or incognito mode), the
callback will be called with an error argument.

**`Function`**

clearStorage

**`Example`**

```ts
maplibregl.clearStorage();
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `callback?` | (`err?`: `Error`) => `void` | Called with an error argument if there is an error. |

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11683

___

### getRTLTextPluginStatus

▸ **getRTLTextPluginStatus**(): `string`

#### Returns

`string`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11576

___

### prewarm

▸ **prewarm**(): `void`

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11505

___

### removeProtocol

▸ **removeProtocol**(`customProtocol`): `void`

Removes a previusly added protocol

**`Function`**

removeProtocol

**`Example`**

```ts
maplibregl.removeProtocol('custom');
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `customProtocol` | `string` | the custom protocol to remove registration for |

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11727

___

### setRTLTextPlugin

▸ **setRTLTextPlugin**(`url`, `callback`, `deferred?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `callback` | (`error?`: `Error`) => `void` |
| `deferred?` | `boolean` |

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11575

___

### supported

▸ **supported**(`options?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `IsSupportedOptions` |

#### Returns

`boolean`

#### Defined in

node_modules/@mapbox/mapbox-gl-supported/index.d.ts:7
