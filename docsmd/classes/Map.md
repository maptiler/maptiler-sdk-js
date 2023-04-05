[MapTiler SDK - v1.0.9](../README.md) / Map

# Class: Map

The Map class can be instanciated to display a map in a `<div>`

## Hierarchy

- `Map`

  ↳ **`Map`**

## Table of contents

### Constructors

- [constructor](Map.md#constructor)

### Methods

- [centerOnIpPoint](Map.md#centeronippoint)
- [disableTerrain](Map.md#disableterrain)
- [enableTerrain](Map.md#enableterrain)
- [fitToIpBounds](Map.md#fittoipbounds)
- [getCameraHash](Map.md#getcamerahash)
- [getMaptilerSessionId](Map.md#getmaptilersessionid)
- [getPrimaryLanguage](Map.md#getprimarylanguage)
- [getSdkConfig](Map.md#getsdkconfig)
- [getSecondaryLanguage](Map.md#getsecondarylanguage)
- [getTerrainExaggeration](Map.md#getterrainexaggeration)
- [hasTerrain](Map.md#hasterrain)
- [setLanguage](Map.md#setlanguage)
- [setPrimaryLanguage](Map.md#setprimarylanguage)
- [setSecondaryLanguage](Map.md#setsecondarylanguage)
- [setStyle](Map.md#setstyle)
- [setTerrainExaggeration](Map.md#setterrainexaggeration)

## Constructors

### constructor

• **new Map**(`options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`MapOptions`](../README.md#mapoptions) |

#### Overrides

maplibregl.Map.constructor

#### Defined in

[src/Map.ts:147](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L147)

## Methods

### centerOnIpPoint

▸ **centerOnIpPoint**(`zoom`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `zoom` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/Map.ts:906](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L906)

___

### disableTerrain

▸ **disableTerrain**(): `void`

Disable the 3D terrain visualization

#### Returns

`void`

#### Defined in

[src/Map.ts:841](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L841)

___

### enableTerrain

▸ **enableTerrain**(`exaggeration?`): `void`

Enables the 3D terrain visualization

#### Parameters

| Name | Type |
| :------ | :------ |
| `exaggeration` | `number` |

#### Returns

`void`

#### Defined in

[src/Map.ts:796](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L796)

___

### fitToIpBounds

▸ **fitToIpBounds**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/Map.ts:895](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L895)

___

### getCameraHash

▸ **getCameraHash**(): `string`

#### Returns

`string`

#### Defined in

[src/Map.ts:914](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L914)

___

### getMaptilerSessionId

▸ **getMaptilerSessionId**(): `string`

Get the MapTiler session ID. Convenient to dispatch to externaly built component
that do not directly have access to the SDK configuration but do have access to a Map instance.

#### Returns

`string`

#### Defined in

[src/Map.ts:940](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L940)

___

### getPrimaryLanguage

▸ **getPrimaryLanguage**(): [`LanguageString`](../README.md#languagestring)

Get the primary language

#### Returns

[`LanguageString`](../README.md#languagestring)

#### Defined in

[src/Map.ts:763](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L763)

___

### getSdkConfig

▸ **getSdkConfig**(): [`SdkConfig`](SdkConfig.md)

Get the SDK config object.
This is convenient to dispatch the SDK configuration to externally built layers
that do not directly have access to the SDK configuration but do have access to a Map instance.

#### Returns

[`SdkConfig`](SdkConfig.md)

#### Defined in

[src/Map.ts:931](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L931)

___

### getSecondaryLanguage

▸ **getSecondaryLanguage**(): [`LanguageString`](../README.md#languagestring)

Get the secondary language

#### Returns

[`LanguageString`](../README.md#languagestring)

#### Defined in

[src/Map.ts:771](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L771)

___

### getTerrainExaggeration

▸ **getTerrainExaggeration**(): `number`

Get the exaggeration factor applied to the terrain

#### Returns

`number`

#### Defined in

[src/Map.ts:779](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L779)

___

### hasTerrain

▸ **hasTerrain**(): `boolean`

Know if terrian is enabled or not

#### Returns

`boolean`

#### Defined in

[src/Map.ts:787](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L787)

___

### setLanguage

▸ **setLanguage**(`language?`): `any`

Define the primary language of the map. Note that not all the languages shorthands provided are available.
This function is a short for `.setPrimaryLanguage()`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `language` | [`LanguageString`](../README.md#languagestring) | `defaults.primaryLanguage` |

#### Returns

`any`

#### Defined in

[src/Map.ts:454](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L454)

___

### setPrimaryLanguage

▸ **setPrimaryLanguage**(`language?`): `void`

Define the primary language of the map. Note that not all the languages shorthands provided are available.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `language` | [`LanguageString`](../README.md#languagestring) | `defaults.primaryLanguage` |

#### Returns

`void`

#### Defined in

[src/Map.ts:465](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L465)

___

### setSecondaryLanguage

▸ **setSecondaryLanguage**(`language?`): `void`

Define the secondary language of the map. Note that this is not supported by all the map styles
Note that most styles do not allow a secondary language and this function only works if the style allows (no force adding)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `language` | [`LanguageString`](../README.md#languagestring) | `defaults.secondaryLanguage` |

#### Returns

`void`

#### Defined in

[src/Map.ts:630](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L630)

___

### setStyle

▸ **setStyle**(`style`, `options?`): [`Map`](Map.md)

Update the style of the map.
Can be:
- a full style URL (possibly with API key)
- a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
- a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `style` | `string` \| `StyleSpecification` \| `MapStyleVariant` \| `ReferenceMapStyle` |
| `options?` | `StyleSwapOptions` & `StyleOptions` |

#### Returns

[`Map`](Map.md)

#### Overrides

maplibregl.Map.setStyle

#### Defined in

[src/Map.ts:442](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L442)

___

### setTerrainExaggeration

▸ **setTerrainExaggeration**(`exaggeration`): `void`

Sets the 3D terrain exageration factor.
Note: this is only a shortcut to `.enableTerrain()`

#### Parameters

| Name | Type |
| :------ | :------ |
| `exaggeration` | `number` |

#### Returns

`void`

#### Defined in

[src/Map.ts:854](https://github.com/maptiler/maptiler-sdk-js/blob/ca6a5a1/src/Map.ts#L854)
