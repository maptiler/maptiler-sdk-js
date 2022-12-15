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
- [verbose](SdkConfig.md#verbose)

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

[src/config.ts:36](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L36)

## Properties

### primaryLanguage

• **primaryLanguage**: [`LanguageString`](../README.md#languagestring) = `Language.AUTO`

The primary languag. By default, the language of the web browser is used.

#### Defined in

[src/config.ts:18](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L18)

___

### secondaryLanguage

• **secondaryLanguage**: [`LanguageString`](../README.md#languagestring) = `null`

The secondary language, to overwrite the default language defined in the map style.
This settings is highly dependant on the style compatibility and may not work in most cases.

#### Defined in

[src/config.ts:24](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L24)

___

### verbose

• **verbose**: `boolean` = `false`

If `true`, some more debuf text will show. Default: `false`

#### Defined in

[src/config.ts:13](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L13)

## Accessors

### apiKey

• `get` **apiKey**(): `string`

Get the MapTiler Cloud API key

#### Returns

`string`

#### Defined in

[src/config.ts:67](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L67)

• `set` **apiKey**(`k`): `void`

Set the MapTiler Cloud API key

#### Parameters

| Name | Type |
| :------ | :------ |
| `k` | `string` |

#### Returns

`void`

#### Defined in

[src/config.ts:58](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L58)

___

### fetch

• `get` **fetch**(): `FetchFunction`

Get the fetch fucntion

#### Returns

`FetchFunction`

#### Defined in

[src/config.ts:81](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L81)

• `set` **fetch**(`f`): `void`

Set a the custom fetch function to replace the default one

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | `FetchFunction` |

#### Returns

`void`

#### Defined in

[src/config.ts:74](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L74)

___

### unit

• `get` **unit**(): [`Unit`](../README.md#unit)

Get the unit system

#### Returns

[`Unit`](../README.md#unit)

#### Defined in

[src/config.ts:51](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L51)

• `set` **unit**(`u`): `void`

Set the unit system

#### Parameters

| Name | Type |
| :------ | :------ |
| `u` | [`Unit`](../README.md#unit) |

#### Returns

`void`

#### Defined in

[src/config.ts:43](https://github.com/maptiler/maptiler-sdk-js/blob/31b341d/src/config.ts#L43)
