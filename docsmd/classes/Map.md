[MapTiler SDK - v1.0.5](../README.md) / Map

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

[src/Map.ts:131](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L131)

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

[src/Map.ts:889](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L889)

___

### disableTerrain

▸ **disableTerrain**(): `void`

Disable the 3D terrain visualization

#### Returns

`void`

#### Defined in

[src/Map.ts:824](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L824)

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

[src/Map.ts:779](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L779)

___

### fitToIpBounds

▸ **fitToIpBounds**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/Map.ts:878](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L878)

___

### getCameraHash

▸ **getCameraHash**(): `string`

#### Returns

`string`

#### Defined in

[src/Map.ts:897](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L897)

___

### getTerrainExaggeration

▸ **getTerrainExaggeration**(): `number`

Get the exaggeration factor applied to the terrain

#### Returns

`number`

#### Defined in

[src/Map.ts:762](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L762)

___

### hasTerrain

▸ **hasTerrain**(): `boolean`

Know if terrian is enabled or not

#### Returns

`boolean`

#### Defined in

[src/Map.ts:770](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L770)

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

[src/Map.ts:451](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L451)

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

[src/Map.ts:462](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L462)

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

[src/Map.ts:628](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L628)

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

[src/Map.ts:439](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L439)

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

[src/Map.ts:837](https://github.com/maptiler/maptiler-sdk-js/blob/3b4c14f/src/Map.ts#L837)
