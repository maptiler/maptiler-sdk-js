MapTiler SDK

# MapTiler SDK

## Table of contents

### Namespaces

- [Point](modules/Point.md)

### Classes

- [Map](classes/Map.md)
- [MapStyleVariant](classes/MapStyleVariant.md)
- [ReferenceMapStyle](classes/ReferenceMapStyle.md)
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
- [GeolocationType](README.md#geolocationtype)
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

[src/language.ts:110](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/language.ts#L110)

___

### MapOptions

Ƭ **MapOptions**: `Omit`<`MapOptionsML`, ``"style"`` \| ``"maplibreLogo"``\> & { `fullscreenControl?`: `boolean` \| `ControlPosition` ; `geolocate?`: typeof [`GeolocationType`](README.md#geolocationtype)[keyof typeof [`GeolocationType`](README.md#geolocationtype)] \| `boolean` ; `geolocateControl?`: `boolean` \| `ControlPosition` ; `maptilerLogo?`: `boolean` ; `navigationControl?`: `boolean` \| `ControlPosition` ; `scaleControl?`: `boolean` \| `ControlPosition` ; `style?`: [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) \| [`MapStyleVariant`](classes/MapStyleVariant.md) \| `StyleSpecification` \| `string` ; `terrain?`: `boolean` ; `terrainControl?`: `boolean` \| `ControlPosition` ; `terrainExaggeration?`: `number`  }

Options to provide to the `Map` constructor

#### Defined in

[src/Map.ts:55](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/Map.ts#L55)

___

### MapStyleType

Ƭ **MapStyleType**: `Object`

All the styles and variants maintained by MapTiler.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `BASIC` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DARK`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `LIGHT`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | - |
| `BRIGHT` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DARK`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `LIGHT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `PASTEL`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | - |
| `HYBRID` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | High resolution imagery with labels, political borders and roads. |
| `OPENSTREETMAP` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | - |
| `OUTDOOR` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | Suitable for outdoor activities. With elevation isolines and hillshading. |
| `SATELLITE` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | High resolution imagery only, without any label. |
| `STAGE` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DARK`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `LIGHT`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | - |
| `STREETS` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DARK`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `LIGHT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `PASTEL`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | Suitable for navigation, with high level of detail on urban areas. |
| `TONER` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `BACKGROUND`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `LINES`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `LITE`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | - |
| `TOPO` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `PASTEL`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `SHINY`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `TOPOGRAPHIQUE`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | - |
| `VOYAGER` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DARK`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `LIGHT`: [`MapStyleVariant`](classes/MapStyleVariant.md) ; `VINTAGE`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | - |
| `WINTER` | [`ReferenceMapStyle`](classes/ReferenceMapStyle.md) & { `DEFAULT`: [`MapStyleVariant`](classes/MapStyleVariant.md)  } | Suitabe for winter outdoor activities. With ski tracks, elevation isolines and hillshading. |

#### Defined in

[src/mapstyle/mapstylepresetlist.ts:19](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/mapstyle/mapstylepresetlist.ts#L19)

___

### Unit

Ƭ **Unit**: ``"imperial"`` \| ``"metric"`` \| ``"nautical"``

#### Defined in

[src/unit.ts:1](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/unit.ts#L1)

## Variables

### AJAXError

• **AJAXError**: typeof `AJAXError`

#### Defined in

[src/index.ts:71](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L71)

___

### AttributionControl

• **AttributionControl**: typeof `AttributionControl`

#### Defined in

[src/index.ts:59](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L59)

___

### CanvasSource

• **CanvasSource**: typeof `CanvasSource`

#### Defined in

[src/index.ts:72](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L72)

___

### Evented

• **Evented**: typeof `Evented`

#### Defined in

[src/index.ts:70](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L70)

___

### FullscreenControl

• **FullscreenControl**: typeof `FullscreenControl`

#### Defined in

[src/index.ts:62](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L62)

___

### GeoJSONSource

• **GeoJSONSource**: typeof `GeoJSONSource`

#### Defined in

[src/index.ts:73](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L73)

___

### GeolocateControl

• **GeolocateControl**: typeof `GeolocateControl`

#### Defined in

[src/index.ts:58](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L58)

___

### GeolocationType

• `Const` **GeolocationType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `IP_COUNTRY` | ``"IP_COUNTRY"`` |
| `IP_POINT` | ``"IP_POINT"`` |

#### Defined in

[src/Map.ts:44](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/Map.ts#L44)

___

### ImageSource

• **ImageSource**: typeof `ImageSource`

#### Defined in

[src/index.ts:74](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L74)

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

[src/language.ts:4](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/language.ts#L4)

___

### LngLat

• **LngLat**: typeof `LngLat`

#### Defined in

[src/index.ts:67](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L67)

___

### LngLatBounds

• **LngLatBounds**: typeof `LngLatBounds`

#### Defined in

[src/index.ts:68](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L68)

___

### LogoControl

• **LogoControl**: typeof `LogoControl`

#### Defined in

[src/index.ts:60](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L60)

___

### MapStyle

• `Const` **MapStyle**: [`MapStyleType`](README.md#mapstyletype)

Contains all the reference map style created by MapTiler team as well as all the variants.
For example, `MapStyle.STREETS` and the variants:
- `MapStyle.STREETS.DARK`
- `MapStyle.STREETS.LIGHT`
- `MapStyle.STREETS.PASTEL`

#### Defined in

[src/mapstyle/mapstyle.ts:305](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/mapstyle/mapstyle.ts#L305)

___

### Marker

• **Marker**: typeof `Marker`

#### Defined in

[src/index.ts:65](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L65)

___

### MercatorCoordinate

• **MercatorCoordinate**: typeof `MercatorCoordinate`

#### Defined in

[src/index.ts:69](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L69)

___

### NavigationControl

• **NavigationControl**: typeof `NavigationControl`

#### Defined in

[src/index.ts:57](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L57)

___

### Popup

• **Popup**: typeof `Popup`

#### Defined in

[src/index.ts:64](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L64)

___

### RasterDEMTileSource

• **RasterDEMTileSource**: typeof `RasterDEMTileSource`

#### Defined in

[src/index.ts:75](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L75)

___

### RasterTileSource

• **RasterTileSource**: typeof `RasterTileSource`

#### Defined in

[src/index.ts:76](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L76)

___

### ScaleControl

• **ScaleControl**: typeof `ScaleControl`

#### Defined in

[src/index.ts:61](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L61)

___

### Style

• **Style**: typeof `Style`

#### Defined in

[src/index.ts:66](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L66)

___

### TerrainControl

• **TerrainControl**: typeof `TerrainControl`

#### Defined in

[src/index.ts:63](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L63)

___

### VectorTileSource

• **VectorTileSource**: typeof `VectorTileSource`

#### Defined in

[src/index.ts:77](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L77)

___

### VideoSource

• **VideoSource**: typeof `VideoSource`

#### Defined in

[src/index.ts:78](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L78)

___

### config

• `Const` **config**: [`SdkConfig`](classes/SdkConfig.md)

#### Defined in

[src/config.ts:81](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/config.ts#L81)

___

### maxParallelImageRequests

• **maxParallelImageRequests**: `number`

#### Defined in

[src/index.ts:83](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L83)

___

### version

• **version**: `string`

#### Defined in

[src/index.ts:81](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L81)

___

### workerCount

• **workerCount**: `number`

#### Defined in

[src/index.ts:82](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L82)

___

### workerUrl

• **workerUrl**: `string`

#### Defined in

[src/index.ts:85](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/index.ts#L85)

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

[src/Point.ts:17](https://github.com/maptiler/maptiler-sdk-js/blob/9c8ff49/src/Point.ts#L17)

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

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11899

___

### clearPrewarmedResources

▸ **clearPrewarmedResources**(): `void`

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11687

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

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11864

___

### getRTLTextPluginStatus

▸ **getRTLTextPluginStatus**(): `string`

#### Returns

`string`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11757

___

### prewarm

▸ **prewarm**(): `void`

#### Returns

`void`

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11686

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

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11908

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

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11756

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
