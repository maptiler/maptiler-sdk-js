MapTiler SDK - v1.0.9

# MapTiler SDK - v1.0.9

## Table of contents

### Classes

- [CanvasSource](classes/CanvasSource.md)
- [GeoJSONSource](classes/GeoJSONSource.md)
- [ImageSource](classes/ImageSource.md)
- [Map](classes/Map.md)
- [MaptilerGeolocateControl](classes/MaptilerGeolocateControl.md)
- [MaptilerLogoControl](classes/MaptilerLogoControl.md)
- [MaptilerTerrainControl](classes/MaptilerTerrainControl.md)
- [Marker](classes/Marker.md)
- [Point](classes/Point.md)
- [Popup](classes/Popup.md)
- [RasterDEMTileSource](classes/RasterDEMTileSource.md)
- [RasterTileSource](classes/RasterTileSource.md)
- [SdkConfig](classes/SdkConfig.md)
- [Style](classes/Style.md)
- [VectorTileSource](classes/VectorTileSource.md)
- [VideoSource](classes/VideoSource.md)

### Type Aliases

- [AJAXError](README.md#ajaxerror)
- [AttributionControl](README.md#attributioncontrol)
- [CanvasSourceMLGL](README.md#canvassourcemlgl)
- [Evented](README.md#evented)
- [FullscreenControl](README.md#fullscreencontrol)
- [GeoJSONSourceMLGL](README.md#geojsonsourcemlgl)
- [GeolocateControl](README.md#geolocatecontrol)
- [ImageSourceMLGL](README.md#imagesourcemlgl)
- [LanguageKey](README.md#languagekey)
- [LanguageString](README.md#languagestring)
- [LngLat](README.md#lnglat)
- [LngLatBounds](README.md#lnglatbounds)
- [LogoControl](README.md#logocontrol)
- [MapMLGL](README.md#mapmlgl)
- [MapOptions](README.md#mapoptions)
- [MarkerMLGL](README.md#markermlgl)
- [Matrix2](README.md#matrix2)
- [MercatorCoordinate](README.md#mercatorcoordinate)
- [NavigationControl](README.md#navigationcontrol)
- [PopupMLGL](README.md#popupmlgl)
- [RasterDEMTileSourceMLGL](README.md#rasterdemtilesourcemlgl)
- [RasterTileSourceMLGL](README.md#rastertilesourcemlgl)
- [ScaleControl](README.md#scalecontrol)
- [StyleMLGL](README.md#stylemlgl)
- [TerrainControl](README.md#terraincontrol)
- [Unit](README.md#unit)
- [VectorTileSourceMLGL](README.md#vectortilesourcemlgl)
- [VideoSourceMLGL](README.md#videosourcemlgl)

### Variables

- [AJAXError](README.md#ajaxerror-1)
- [AttributionControl](README.md#attributioncontrol-1)
- [CanvasSourceMLGL](README.md#canvassourcemlgl-1)
- [Evented](README.md#evented-1)
- [FullscreenControl](README.md#fullscreencontrol-1)
- [GeoJSONSourceMLGL](README.md#geojsonsourcemlgl-1)
- [GeolocateControl](README.md#geolocatecontrol-1)
- [GeolocationType](README.md#geolocationtype)
- [ImageSourceMLGL](README.md#imagesourcemlgl-1)
- [Language](README.md#language)
- [LngLat](README.md#lnglat-1)
- [LngLatBounds](README.md#lnglatbounds-1)
- [LogoControl](README.md#logocontrol-1)
- [MapMLGL](README.md#mapmlgl-1)
- [MarkerMLGL](README.md#markermlgl-1)
- [MercatorCoordinate](README.md#mercatorcoordinate-1)
- [NavigationControl](README.md#navigationcontrol-1)
- [PopupMLGL](README.md#popupmlgl-1)
- [RasterDEMTileSourceMLGL](README.md#rasterdemtilesourcemlgl-1)
- [RasterTileSourceMLGL](README.md#rastertilesourcemlgl-1)
- [ScaleControl](README.md#scalecontrol-1)
- [StyleMLGL](README.md#stylemlgl-1)
- [TerrainControl](README.md#terraincontrol-1)
- [VectorTileSourceMLGL](README.md#vectortilesourcemlgl-1)
- [VideoSourceMLGL](README.md#videosourcemlgl-1)
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

### AJAXError

Ƭ **AJAXError**: `InstanceType`<typeof [`AJAXError`](README.md#ajaxerror-1)\>

#### Defined in

[src/index.ts:87](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L87)

[src/index.ts:127](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L127)

___

### AttributionControl

Ƭ **AttributionControl**: `InstanceType`<typeof [`AttributionControl`](README.md#attributioncontrol-1)\>

#### Defined in

[src/index.ts:74](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L74)

[src/index.ts:113](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L113)

___

### CanvasSourceMLGL

Ƭ **CanvasSourceMLGL**: `InstanceType`<typeof [`CanvasSourceMLGL`](README.md#canvassourcemlgl-1)\>

#### Defined in

[src/index.ts:89](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L89)

[src/index.ts:128](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L128)

___

### Evented

Ƭ **Evented**: `InstanceType`<typeof [`Evented`](README.md#evented-1)\>

#### Defined in

[src/index.ts:86](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L86)

[src/index.ts:126](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L126)

___

### FullscreenControl

Ƭ **FullscreenControl**: `InstanceType`<typeof [`FullscreenControl`](README.md#fullscreencontrol-1)\>

#### Defined in

[src/index.ts:77](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L77)

[src/index.ts:116](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L116)

___

### GeoJSONSourceMLGL

Ƭ **GeoJSONSourceMLGL**: `InstanceType`<typeof [`GeoJSONSourceMLGL`](README.md#geojsonsourcemlgl-1)\>

#### Defined in

[src/index.ts:90](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L90)

[src/index.ts:129](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L129)

___

### GeolocateControl

Ƭ **GeolocateControl**: `InstanceType`<typeof [`GeolocateControl`](README.md#geolocatecontrol-1)\>

#### Defined in

[src/index.ts:73](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L73)

[src/index.ts:112](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L112)

___

### ImageSourceMLGL

Ƭ **ImageSourceMLGL**: `InstanceType`<typeof [`ImageSourceMLGL`](README.md#imagesourcemlgl-1)\>

#### Defined in

[src/index.ts:91](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L91)

[src/index.ts:130](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L130)

___

### LanguageKey

Ƭ **LanguageKey**: keyof typeof [`Language`](README.md#language)

Type representing the key of the Language object

#### Defined in

[src/language.ts:108](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/language.ts#L108)

___

### LanguageString

Ƭ **LanguageString**: `Values`<typeof [`Language`](README.md#language)\>

Built-in languages values as strings

#### Defined in

[src/language.ts:115](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/language.ts#L115)

___

### LngLat

Ƭ **LngLat**: `InstanceType`<typeof [`LngLat`](README.md#lnglat-1)\>

#### Defined in

[src/index.ts:82](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L82)

[src/index.ts:123](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L123)

___

### LngLatBounds

Ƭ **LngLatBounds**: `InstanceType`<typeof [`LngLatBounds`](README.md#lnglatbounds-1)\>

#### Defined in

[src/index.ts:83](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L83)

[src/index.ts:124](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L124)

___

### LogoControl

Ƭ **LogoControl**: `InstanceType`<typeof [`LogoControl`](README.md#logocontrol-1)\>

#### Defined in

[src/index.ts:75](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L75)

[src/index.ts:114](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L114)

___

### MapMLGL

Ƭ **MapMLGL**: `InstanceType`<typeof [`MapMLGL`](README.md#mapmlgl-1)\>

#### Defined in

[src/index.ts:105](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L105)

[src/index.ts:137](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L137)

___

### MapOptions

Ƭ **MapOptions**: `Omit`<`MapOptionsML`, ``"style"`` \| ``"maplibreLogo"``\> & { `apiKey?`: `string` ; `fullscreenControl?`: `boolean` \| `ControlPosition` ; `geolocate?`: typeof [`GeolocationType`](README.md#geolocationtype)[keyof typeof [`GeolocationType`](README.md#geolocationtype)] \| `boolean` ; `geolocateControl?`: `boolean` \| `ControlPosition` ; `language?`: [`LanguageString`](README.md#languagestring) ; `maptilerLogo?`: `boolean` ; `navigationControl?`: `boolean` \| `ControlPosition` ; `scaleControl?`: `boolean` \| `ControlPosition` ; `style?`: `ReferenceMapStyle` \| `MapStyleVariant` \| `StyleSpecification` \| `string` ; `terrain?`: `boolean` ; `terrainControl?`: `boolean` \| `ControlPosition` ; `terrainExaggeration?`: `number`  }

Options to provide to the `Map` constructor

#### Defined in

[src/Map.ts:51](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/Map.ts#L51)

___

### MarkerMLGL

Ƭ **MarkerMLGL**: `InstanceType`<typeof [`MarkerMLGL`](README.md#markermlgl-1)\>

#### Defined in

[src/index.ts:80](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L80)

[src/index.ts:119](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L119)

___

### Matrix2

Ƭ **Matrix2**: [`number`, `number`, `number`, `number`]

Row major 2x2 matrix

#### Defined in

[src/Point.ts:9](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/Point.ts#L9)

___

### MercatorCoordinate

Ƭ **MercatorCoordinate**: `InstanceType`<typeof [`MercatorCoordinate`](README.md#mercatorcoordinate-1)\>

#### Defined in

[src/index.ts:85](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L85)

[src/index.ts:125](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L125)

___

### NavigationControl

Ƭ **NavigationControl**: `InstanceType`<typeof [`NavigationControl`](README.md#navigationcontrol-1)\>

#### Defined in

[src/index.ts:72](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L72)

[src/index.ts:111](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L111)

___

### PopupMLGL

Ƭ **PopupMLGL**: `InstanceType`<typeof [`PopupMLGL`](README.md#popupmlgl-1)\>

#### Defined in

[src/index.ts:79](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L79)

[src/index.ts:120](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L120)

___

### RasterDEMTileSourceMLGL

Ƭ **RasterDEMTileSourceMLGL**: `InstanceType`<typeof [`RasterDEMTileSourceMLGL`](README.md#rasterdemtilesourcemlgl-1)\>

#### Defined in

[src/index.ts:92](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L92)

[src/index.ts:131](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L131)

___

### RasterTileSourceMLGL

Ƭ **RasterTileSourceMLGL**: `InstanceType`<typeof [`RasterTileSourceMLGL`](README.md#rastertilesourcemlgl-1)\>

#### Defined in

[src/index.ts:93](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L93)

[src/index.ts:134](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L134)

___

### ScaleControl

Ƭ **ScaleControl**: `InstanceType`<typeof [`ScaleControl`](README.md#scalecontrol-1)\>

#### Defined in

[src/index.ts:76](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L76)

[src/index.ts:115](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L115)

___

### StyleMLGL

Ƭ **StyleMLGL**: `InstanceType`<typeof [`StyleMLGL`](README.md#stylemlgl-1)\>

#### Defined in

[src/index.ts:81](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L81)

[src/index.ts:121](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L121)

___

### TerrainControl

Ƭ **TerrainControl**: `InstanceType`<typeof [`TerrainControl`](README.md#terraincontrol-1)\>

#### Defined in

[src/index.ts:78](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L78)

[src/index.ts:117](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L117)

___

### Unit

Ƭ **Unit**: ``"imperial"`` \| ``"metric"`` \| ``"nautical"``

#### Defined in

[src/unit.ts:1](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/unit.ts#L1)

___

### VectorTileSourceMLGL

Ƭ **VectorTileSourceMLGL**: `InstanceType`<typeof [`VectorTileSourceMLGL`](README.md#vectortilesourcemlgl-1)\>

#### Defined in

[src/index.ts:94](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L94)

[src/index.ts:135](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L135)

___

### VideoSourceMLGL

Ƭ **VideoSourceMLGL**: `InstanceType`<typeof [`VideoSourceMLGL`](README.md#videosourcemlgl-1)\>

#### Defined in

[src/index.ts:95](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L95)

[src/index.ts:136](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L136)

## Variables

### AJAXError

• **AJAXError**: typeof `AJAXError`

#### Defined in

[src/index.ts:31](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L31)

[src/index.ts:127](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L127)

___

### AttributionControl

• **AttributionControl**: typeof `AttributionControl`

#### Defined in

[src/index.ts:19](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L19)

[src/index.ts:113](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L113)

___

### CanvasSourceMLGL

• `Const` **CanvasSourceMLGL**: typeof `CanvasSource` = `maplibregl.CanvasSource`

#### Defined in

[src/index.ts:59](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L59)

[src/index.ts:128](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L128)

___

### Evented

• **Evented**: typeof `Evented`

#### Defined in

[src/index.ts:30](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L30)

[src/index.ts:126](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L126)

___

### FullscreenControl

• **FullscreenControl**: typeof `FullscreenControl`

#### Defined in

[src/index.ts:22](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L22)

[src/index.ts:116](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L116)

___

### GeoJSONSourceMLGL

• `Const` **GeoJSONSourceMLGL**: typeof `GeoJSONSource` = `maplibregl.GeoJSONSource`

#### Defined in

[src/index.ts:60](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L60)

[src/index.ts:129](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L129)

___

### GeolocateControl

• **GeolocateControl**: typeof `GeolocateControl`

#### Defined in

[src/index.ts:18](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L18)

[src/index.ts:112](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L112)

___

### GeolocationType

• `Const` **GeolocationType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `COUNTRY` | ``"COUNTRY"`` |
| `POINT` | ``"POINT"`` |

#### Defined in

[src/Map.ts:40](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/Map.ts#L40)

___

### ImageSourceMLGL

• `Const` **ImageSourceMLGL**: typeof `ImageSource` = `maplibregl.ImageSource`

#### Defined in

[src/index.ts:61](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L61)

[src/index.ts:130](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L130)

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

[src/language.ts:4](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/language.ts#L4)

___

### LngLat

• **LngLat**: typeof `LngLat`

#### Defined in

[src/index.ts:27](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L27)

[src/index.ts:123](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L123)

___

### LngLatBounds

• **LngLatBounds**: typeof `LngLatBounds`

#### Defined in

[src/index.ts:28](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L28)

[src/index.ts:124](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L124)

___

### LogoControl

• **LogoControl**: typeof `LogoControl`

#### Defined in

[src/index.ts:20](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L20)

[src/index.ts:114](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L114)

___

### MapMLGL

• `Const` **MapMLGL**: typeof `Map` = `maplibregl.Map`

#### Defined in

[src/index.ts:55](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L55)

[src/index.ts:137](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L137)

___

### MarkerMLGL

• `Const` **MarkerMLGL**: typeof `Marker` = `maplibregl.Marker`

#### Defined in

[src/index.ts:56](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L56)

[src/index.ts:119](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L119)

___

### MercatorCoordinate

• **MercatorCoordinate**: typeof `MercatorCoordinate`

#### Defined in

[src/index.ts:29](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L29)

[src/index.ts:125](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L125)

___

### NavigationControl

• **NavigationControl**: typeof `NavigationControl`

#### Defined in

[src/index.ts:17](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L17)

[src/index.ts:111](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L111)

___

### PopupMLGL

• `Const` **PopupMLGL**: typeof `Popup` = `maplibregl.Popup`

#### Defined in

[src/index.ts:57](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L57)

[src/index.ts:120](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L120)

___

### RasterDEMTileSourceMLGL

• `Const` **RasterDEMTileSourceMLGL**: typeof `RasterDEMTileSource` = `maplibregl.RasterDEMTileSource`

#### Defined in

[src/index.ts:63](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L63)

[src/index.ts:131](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L131)

___

### RasterTileSourceMLGL

• `Const` **RasterTileSourceMLGL**: typeof `RasterTileSource` = `maplibregl.RasterTileSource`

#### Defined in

[src/index.ts:62](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L62)

[src/index.ts:134](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L134)

___

### ScaleControl

• **ScaleControl**: typeof `ScaleControl`

#### Defined in

[src/index.ts:21](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L21)

[src/index.ts:115](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L115)

___

### StyleMLGL

• `Const` **StyleMLGL**: typeof `Style` = `maplibregl.Style`

#### Defined in

[src/index.ts:58](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L58)

[src/index.ts:121](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L121)

___

### TerrainControl

• **TerrainControl**: typeof `TerrainControl`

#### Defined in

[src/index.ts:23](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L23)

[src/index.ts:117](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L117)

___

### VectorTileSourceMLGL

• `Const` **VectorTileSourceMLGL**: typeof `VectorTileSource` = `maplibregl.VectorTileSource`

#### Defined in

[src/index.ts:64](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L64)

[src/index.ts:135](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L135)

___

### VideoSourceMLGL

• `Const` **VideoSourceMLGL**: typeof `VideoSource` = `maplibregl.VideoSource`

#### Defined in

[src/index.ts:65](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L65)

[src/index.ts:136](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L136)

___

### config

• `Const` **config**: [`SdkConfig`](classes/SdkConfig.md)

#### Defined in

[src/config.ts:90](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/config.ts#L90)

___

### maxParallelImageRequests

• **maxParallelImageRequests**: `number`

#### Defined in

[src/index.ts:43](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L43)

___

### version

• **version**: `string`

#### Defined in

[src/index.ts:41](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L41)

___

### workerCount

• **workerCount**: `number`

#### Defined in

[src/index.ts:42](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L42)

___

### workerUrl

• **workerUrl**: `string`

#### Defined in

[src/index.ts:45](https://github.com/maptiler/maptiler-sdk-js/blob/b764e92/src/index.ts#L45)

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
