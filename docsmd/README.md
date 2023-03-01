MapTiler SDK - v1.0.4

# MapTiler SDK - v1.0.4

## Table of contents

### Classes

- [Map](classes/Map.md)
- [Point](classes/Point.md)
- [SdkConfig](classes/SdkConfig.md)

### Type Aliases

- [LanguageKey](README.md#languagekey)
- [LanguageString](README.md#languagestring)
- [MapOptions](README.md#mapoptions)
- [Matrix2](README.md#matrix2)
- [Unit](README.md#unit)

### Variables

- [AJAXError](README.md#ajaxerror)
- [AttributionControl](README.md#attributioncontrol)
- [CanvasSource](README.md#canvassource)
- [Evented](README.md#evented)
- [FullscreenControl](README.md#fullscreencontrol)
- [GeoJSONSource](README.md#geojsonsource)
- [GeolocateControl](README.md#geolocatecontrol)
- [GeolocationType](README.md#geolocationtype)
- [ImageSource](README.md#imagesource)
- [Language](README.md#language)
- [LngLat](README.md#lnglat)
- [LngLatBounds](README.md#lnglatbounds)
- [LogoControl](README.md#logocontrol)
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

- [addProtocol](README.md#addprotocol)
- [clearPrewarmedResources](README.md#clearprewarmedresources)
- [clearStorage](README.md#clearstorage)
- [getRTLTextPluginStatus](README.md#getrtltextpluginstatus)
- [prewarm](README.md#prewarm)
- [removeProtocol](README.md#removeprotocol)
- [setRTLTextPlugin](README.md#setrtltextplugin)
- [supported](README.md#supported)

## Type Aliases

### LanguageKey

Ƭ **LanguageKey**: keyof typeof [`Language`](README.md#language)

Type representing the key of the Language object

#### Defined in

[src/language.ts:108](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/language.ts#L108)

___

### LanguageString

Ƭ **LanguageString**: `Values`<typeof [`Language`](README.md#language)\>

Built-in languages values as strings

#### Defined in

[src/language.ts:115](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/language.ts#L115)

___

### MapOptions

Ƭ **MapOptions**: `Omit`<`MapOptionsML`, ``"style"`` \| ``"maplibreLogo"``\> & { `fullscreenControl?`: `boolean` \| `ControlPosition` ; `geolocate?`: typeof [`GeolocationType`](README.md#geolocationtype)[keyof typeof [`GeolocationType`](README.md#geolocationtype)] \| `boolean` ; `geolocateControl?`: `boolean` \| `ControlPosition` ; `maptilerLogo?`: `boolean` ; `navigationControl?`: `boolean` \| `ControlPosition` ; `scaleControl?`: `boolean` \| `ControlPosition` ; `style?`: `ReferenceMapStyle` \| `MapStyleVariant` \| `StyleSpecification` \| `string` ; `terrain?`: `boolean` ; `terrainControl?`: `boolean` \| `ControlPosition` ; `terrainExaggeration?`: `number`  }

Options to provide to the `Map` constructor

#### Defined in

[src/Map.ts:51](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/Map.ts#L51)

___

### Matrix2

Ƭ **Matrix2**: [`number`, `number`, `number`, `number`]

Row major 2x2 matrix

#### Defined in

[src/Point.ts:9](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/Point.ts#L9)

___

### Unit

Ƭ **Unit**: ``"imperial"`` \| ``"metric"`` \| ``"nautical"``

#### Defined in

[src/unit.ts:1](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/unit.ts#L1)

## Variables

### AJAXError

• **AJAXError**: typeof `AJAXError`

#### Defined in

[src/index.ts:31](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L31)

___

### AttributionControl

• **AttributionControl**: typeof `AttributionControl`

#### Defined in

[src/index.ts:19](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L19)

___

### CanvasSource

• **CanvasSource**: typeof `CanvasSource`

#### Defined in

[src/index.ts:32](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L32)

___

### Evented

• **Evented**: typeof `Evented`

#### Defined in

[src/index.ts:30](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L30)

___

### FullscreenControl

• **FullscreenControl**: typeof `FullscreenControl`

#### Defined in

[src/index.ts:22](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L22)

___

### GeoJSONSource

• **GeoJSONSource**: typeof `GeoJSONSource`

#### Defined in

[src/index.ts:33](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L33)

___

### GeolocateControl

• **GeolocateControl**: typeof `GeolocateControl`

#### Defined in

[src/index.ts:18](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L18)

___

### GeolocationType

• `Const` **GeolocationType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `COUNTRY` | ``"COUNTRY"`` |
| `POINT` | ``"POINT"`` |

#### Defined in

[src/Map.ts:40](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/Map.ts#L40)

___

### ImageSource

• **ImageSource**: typeof `ImageSource`

#### Defined in

[src/index.ts:34](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L34)

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

[src/language.ts:4](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/language.ts#L4)

___

### LngLat

• **LngLat**: typeof `LngLat`

#### Defined in

[src/index.ts:27](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L27)

___

### LngLatBounds

• **LngLatBounds**: typeof `LngLatBounds`

#### Defined in

[src/index.ts:28](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L28)

___

### LogoControl

• **LogoControl**: typeof `LogoControl`

#### Defined in

[src/index.ts:20](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L20)

___

### Marker

• **Marker**: typeof `Marker`

#### Defined in

[src/index.ts:25](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L25)

___

### MercatorCoordinate

• **MercatorCoordinate**: typeof `MercatorCoordinate`

#### Defined in

[src/index.ts:29](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L29)

___

### NavigationControl

• **NavigationControl**: typeof `NavigationControl`

#### Defined in

[src/index.ts:17](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L17)

___

### Popup

• **Popup**: typeof `Popup`

#### Defined in

[src/index.ts:24](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L24)

___

### RasterDEMTileSource

• **RasterDEMTileSource**: typeof `RasterDEMTileSource`

#### Defined in

[src/index.ts:35](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L35)

___

### RasterTileSource

• **RasterTileSource**: typeof `RasterTileSource`

#### Defined in

[src/index.ts:36](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L36)

___

### ScaleControl

• **ScaleControl**: typeof `ScaleControl`

#### Defined in

[src/index.ts:21](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L21)

___

### Style

• **Style**: typeof `Style`

#### Defined in

[src/index.ts:26](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L26)

___

### TerrainControl

• **TerrainControl**: typeof `TerrainControl`

#### Defined in

[src/index.ts:23](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L23)

___

### VectorTileSource

• **VectorTileSource**: typeof `VectorTileSource`

#### Defined in

[src/index.ts:37](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L37)

___

### VideoSource

• **VideoSource**: typeof `VideoSource`

#### Defined in

[src/index.ts:38](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L38)

___

### config

• `Const` **config**: [`SdkConfig`](classes/SdkConfig.md)

#### Defined in

[src/config.ts:90](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/config.ts#L90)

___

### maxParallelImageRequests

• **maxParallelImageRequests**: `number`

#### Defined in

[src/index.ts:43](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L43)

___

### version

• **version**: `string`

#### Defined in

[src/index.ts:41](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L41)

___

### workerCount

• **workerCount**: `number`

#### Defined in

[src/index.ts:42](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L42)

___

### workerUrl

• **workerUrl**: `string`

#### Defined in

[src/index.ts:45](https://github.com/maptiler/maptiler-sdk-js/blob/2a2de2d/src/index.ts#L45)

## Functions

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

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:12026

___

### clearPrewarmedResources

▸ **clearPrewarmedResources**(): `void`

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11814

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

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11991

___

### getRTLTextPluginStatus

▸ **getRTLTextPluginStatus**(): `string`

#### Returns

`string`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11884

___

### prewarm

▸ **prewarm**(): `void`

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11813

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

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:12035

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

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11883

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
