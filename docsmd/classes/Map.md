[MapTiler SDK - v1.0.7](../README.md) / Map

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
- [getSdkConfig](Map.md#getsdkconfig)
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

[src/Map.ts:144](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L144)

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

[src/Map.ts:914](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L914)

___

### disableTerrain

▸ **disableTerrain**(): `void`

Disable the 3D terrain visualization

#### Returns

`void`

#### Defined in

[src/Map.ts:849](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L849)

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

[src/Map.ts:804](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L804)

___

### fitToIpBounds

▸ **fitToIpBounds**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/Map.ts:903](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L903)

___

### getCameraHash

▸ **getCameraHash**(): `string`

#### Returns

`string`

#### Defined in

[src/Map.ts:922](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L922)

___

### getMaptilerSessionId

▸ **getMaptilerSessionId**(): `string`

Get the MapTiler session ID. Convenient to dispatch to externaly built component
that do not directly have access to the SDK configuration but do have access to a Map instance.

#### Returns

`string`

#### Defined in

[src/Map.ts:948](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L948)

___

### getSdkConfig

▸ **getSdkConfig**(): [`SdkConfig`](SdkConfig.md)

Get the SDK config object.
This is convenient to dispatch the SDK configuration to externally built layers
that do not directly have access to the SDK configuration but do have access to a Map instance.

#### Returns

[`SdkConfig`](SdkConfig.md)

#### Defined in

[src/Map.ts:939](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L939)

___

### getTerrainExaggeration

▸ **getTerrainExaggeration**(): `number`

Get the exaggeration factor applied to the terrain

#### Returns

`number`

#### Defined in

[src/Map.ts:787](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L787)

___

### hasTerrain

▸ **hasTerrain**(): `boolean`

Know if terrian is enabled or not

#### Returns

`boolean`

#### Defined in

[src/Map.ts:795](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L795)

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

[src/Map.ts:482](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L482)

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

[src/Map.ts:493](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L493)

___

### setSecondaryLanguage

▸ **setSecondaryLanguage**(`language?`): `void`

Define the secondary language of the map.
Note that most styles do not allow a secondary language and this function only works if the style allows (no force adding)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `language` | [`LanguageString`](../README.md#languagestring) | `defaults.secondaryLanguage` |

#### Returns

`void`

#### Defined in

[src/Map.ts:656](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L656)

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

[src/Map.ts:470](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L470)

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

[src/Map.ts:862](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/Map.ts#L862)
