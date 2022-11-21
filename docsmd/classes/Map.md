[MapTiler SDK](../README.md) / [Exports](../modules.md) / Map

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
| `options` | [`MapOptions`](../modules.md#mapoptions) |

#### Overrides

maplibre.Map.constructor

#### Defined in

[Map.ts:57](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/Map.ts#L57)

## Methods

### disableTerrain

▸ **disableTerrain**(): `void`

Disable the 3D terrain visualization

#### Returns

`void`

#### Defined in

[Map.ts:527](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/Map.ts#L527)

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

[Map.ts:487](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/Map.ts#L487)

___

### setLanguage

▸ **setLanguage**(`language?`): `any`

Define the primary language of the map. Note that not all the languages shorthands provided are available.
This function is a short for `.setPrimaryLanguage()`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `language` | [`LanguageString`](../modules.md#languagestring) | `defaults.primaryLanguage` |

#### Returns

`any`

#### Defined in

[Map.ts:186](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/Map.ts#L186)

___

### setPrimaryLanguage

▸ **setPrimaryLanguage**(`language?`): `any`

Define the primary language of the map. Note that not all the languages shorthands provided are available.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `language` | [`LanguageString`](../modules.md#languagestring) | `defaults.primaryLanguage` |

#### Returns

`any`

#### Defined in

[Map.ts:197](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/Map.ts#L197)

___

### setSecondaryLanguage

▸ **setSecondaryLanguage**(`language?`): `any`

Define the secondary language of the map.
Note that most styles do not allow a secondary language and this function only works if the style allows (no force adding)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `language` | [`LanguageString`](../modules.md#languagestring) | `defaults.secondaryLanguage` |

#### Returns

`any`

#### Defined in

[Map.ts:358](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/Map.ts#L358)

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

[Map.ts:166](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/Map.ts#L166)

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

[Map.ts:540](https://github.com/maptiler/maptiler-sdk-js/blob/b54b65f/src/Map.ts#L540)
