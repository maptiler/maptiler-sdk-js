[MapTiler SDK](../README.md) / Map

# Class: Map

The Map class can be instanciated to display a map in a `<div>`

## Hierarchy

- `Map`

  ↳ **`Map`**

## Table of contents

### Constructors

- [constructor](Map.md#constructor)

### Methods

- [disableTerrain](Map.md#disableterrain)
- [enableTerrain](Map.md#enableterrain)
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

[src/Map.ts:132](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L132)

## Methods

### disableTerrain

▸ **disableTerrain**(): `void`

Disable the 3D terrain visualization

#### Returns

`void`

#### Defined in

[src/Map.ts:778](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L778)

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

[src/Map.ts:733](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L733)

___

### getTerrainExaggeration

▸ **getTerrainExaggeration**(): `number`

Get the exaggeration factor applied to the terrain

#### Returns

`number`

#### Defined in

[src/Map.ts:716](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L716)

___

### hasTerrain

▸ **hasTerrain**(): `boolean`

Know if terrian is enabled or not

#### Returns

`boolean`

#### Defined in

[src/Map.ts:724](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L724)

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

[src/Map.ts:405](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L405)

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

[src/Map.ts:416](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L416)

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

[src/Map.ts:582](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L582)

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
| `style` | `string` \| `StyleSpecification` \| [`ReferenceMapStyle`](ReferenceMapStyle.md) \| [`MapStyleVariant`](MapStyleVariant.md) |
| `options?` | `StyleSwapOptions` & `StyleOptions` |

#### Returns

[`Map`](Map.md)

#### Overrides

maplibregl.Map.setStyle

#### Defined in

[src/Map.ts:393](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L393)

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

[src/Map.ts:791](https://github.com/maptiler/maptiler-sdk-js/blob/2b084d1/src/Map.ts#L791)
