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

maplibre.Map.constructor

#### Defined in

[src/Map.ts:87](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L87)

## Methods

### disableTerrain

▸ **disableTerrain**(): `void`

Disable the 3D terrain visualization

#### Returns

`void`

#### Defined in

[src/Map.ts:634](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L634)

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

[src/Map.ts:594](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L594)

___

### getTerrainExaggeration

▸ **getTerrainExaggeration**(): `number`

Get the exaggeration factor applied to the terrain

#### Returns

`number`

#### Defined in

[src/Map.ts:577](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L577)

___

### hasTerrain

▸ **hasTerrain**(): `boolean`

Know if terrian is enabled or not

#### Returns

`boolean`

#### Defined in

[src/Map.ts:585](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L585)

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

[src/Map.ts:279](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L279)

___

### setPrimaryLanguage

▸ **setPrimaryLanguage**(`language?`): `any`

Define the primary language of the map. Note that not all the languages shorthands provided are available.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `language` | [`LanguageString`](../README.md#languagestring) | `defaults.primaryLanguage` |

#### Returns

`any`

#### Defined in

[src/Map.ts:290](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L290)

___

### setSecondaryLanguage

▸ **setSecondaryLanguage**(`language?`): `any`

Define the secondary language of the map.
Note that most styles do not allow a secondary language and this function only works if the style allows (no force adding)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `language` | [`LanguageString`](../README.md#languagestring) | `defaults.secondaryLanguage` |

#### Returns

`any`

#### Defined in

[src/Map.ts:449](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L449)

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
| `style` | `string` \| `StyleSpecification` |
| `options?` | `StyleSwapOptions` & `StyleOptions` |

#### Returns

[`Map`](Map.md)

#### Overrides

maplibre.Map.setStyle

#### Defined in

[src/Map.ts:267](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L267)

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

[src/Map.ts:647](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/Map.ts#L647)