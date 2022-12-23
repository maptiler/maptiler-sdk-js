[MapTiler SDK](../README.md) / SdkConfig

# Class: SdkConfig

Configuration class for the SDK

## Hierarchy

- `EventEmitter`

  ↳ **`SdkConfig`**

## Table of contents

### Constructors

- [constructor](SdkConfig.md#constructor)

### Properties

- [primaryLanguage](SdkConfig.md#primarylanguage)
- [secondaryLanguage](SdkConfig.md#secondarylanguage)

### Accessors

- [apiKey](SdkConfig.md#apikey)
- [fetch](SdkConfig.md#fetch)
- [unit](SdkConfig.md#unit)

## Constructors

### constructor

• **new SdkConfig**()

#### Overrides

EventEmitter.constructor

#### Defined in

[src/config.ts:31](https://github.com/maptiler/maptiler-sdk-js/blob/4d9c657/src/config.ts#L31)

## Properties

### primaryLanguage

• **primaryLanguage**: [`LanguageString`](../README.md#languagestring) = `Language.AUTO`

The primary language. By default, the language of the web browser is used.

#### Defined in

[src/config.ts:13](https://github.com/maptiler/maptiler-sdk-js/blob/4d9c657/src/config.ts#L13)

___

### secondaryLanguage

• **secondaryLanguage**: [`LanguageString`](../README.md#languagestring) = `null`

The secondary language, to overwrite the default language defined in the map style.
This settings is highly dependant on the style compatibility and may not work in most cases.

#### Defined in

[src/config.ts:19](https://github.com/maptiler/maptiler-sdk-js/blob/4d9c657/src/config.ts#L19)

## Accessors

### apiKey

• `get` **apiKey**(): `string`

Get the MapTiler Cloud API key

#### Returns

`string`

#### Defined in

[src/config.ts:62](https://github.com/maptiler/maptiler-sdk-js/blob/4d9c657/src/config.ts#L62)

• `set` **apiKey**(`k`): `void`

Set the MapTiler Cloud API key

#### Parameters

| Name | Type |
| :------ | :------ |
| `k` | `string` |

#### Returns

`void`

#### Defined in

[src/config.ts:53](https://github.com/maptiler/maptiler-sdk-js/blob/4d9c657/src/config.ts#L53)

___

### fetch

• `get` **fetch**(): `FetchFunction`

Get the fetch fucntion

#### Returns

`FetchFunction`

#### Defined in

[src/config.ts:76](https://github.com/maptiler/maptiler-sdk-js/blob/4d9c657/src/config.ts#L76)

• `set` **fetch**(`f`): `void`

Set a the custom fetch function to replace the default one

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | `FetchFunction` |

#### Returns

`void`

#### Defined in

[src/config.ts:69](https://github.com/maptiler/maptiler-sdk-js/blob/4d9c657/src/config.ts#L69)

___

### unit

• `get` **unit**(): [`Unit`](../README.md#unit)

Get the unit system

#### Returns

[`Unit`](../README.md#unit)

#### Defined in

[src/config.ts:46](https://github.com/maptiler/maptiler-sdk-js/blob/4d9c657/src/config.ts#L46)

• `set` **unit**(`u`): `void`

Set the unit system

#### Parameters

| Name | Type |
| :------ | :------ |
| `u` | [`Unit`](../README.md#unit) |

#### Returns

`void`

#### Defined in

[src/config.ts:38](https://github.com/maptiler/maptiler-sdk-js/blob/4d9c657/src/config.ts#L38)
