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

[src/Map.ts:66](https://github.com/maptiler/maptiler-sdk-js/blob/69bdddc/src/Map.ts#L66)

## Methods

### disableTerrain

▸ **disableTerrain**(): `void`

Disable the 3D terrain visualization

#### Returns

`void`

#### Defined in

[src/Map.ts:558](https://github.com/maptiler/maptiler-sdk-js/blob/69bdddc/src/Map.ts#L558)

___

### enableTerrain

▸ **enableTerrain**(`exaggeration?`): `void`

Enables the 3D terrain visualization

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `exaggeration` | `number` | `1` |

#### Returns

`void`

#### Defined in

[src/Map.ts:518](https://github.com/maptiler/maptiler-sdk-js/blob/69bdddc/src/Map.ts#L518)

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

[src/Map.ts:219](https://github.com/maptiler/maptiler-sdk-js/blob/69bdddc/src/Map.ts#L219)

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

[src/Map.ts:230](https://github.com/maptiler/maptiler-sdk-js/blob/69bdddc/src/Map.ts#L230)

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

[src/Map.ts:389](https://github.com/maptiler/maptiler-sdk-js/blob/69bdddc/src/Map.ts#L389)

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

[src/Map.ts:196](https://github.com/maptiler/maptiler-sdk-js/blob/69bdddc/src/Map.ts#L196)

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

[src/Map.ts:571](https://github.com/maptiler/maptiler-sdk-js/blob/69bdddc/src/Map.ts#L571)
