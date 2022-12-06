[MapTiler SDK](../README.md) / SdkConfig

# Class: SdkConfig

Configuration class for the SDK

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

## Constructors

### constructor

• **new SdkConfig**()

## Properties

### primaryLanguage

• **primaryLanguage**: [`LanguageString`](../README.md#languagestring) = `Language.AUTO`

The primary languag. By default, the language of the web browser is used.

#### Defined in

[src/config.ts:16](https://github.com/maptiler/maptiler-sdk-js/blob/301cf83/src/config.ts#L16)

___

### secondaryLanguage

• **secondaryLanguage**: [`LanguageString`](../README.md#languagestring) = `null`

The secondary language, to overwrite the default language defined in the map style.
This settings is highly dependant on the style compatibility and may not work in most cases.

#### Defined in

[src/config.ts:22](https://github.com/maptiler/maptiler-sdk-js/blob/301cf83/src/config.ts#L22)

___

### verbose

• **verbose**: `boolean` = `false`

If `true`, some more debuf text will show. Default: `false`

#### Defined in

[src/config.ts:11](https://github.com/maptiler/maptiler-sdk-js/blob/301cf83/src/config.ts#L11)

## Accessors

### apiKey

• `get` **apiKey**(): `string`

Get the MapTiler Cloud API key

#### Returns

`string`

#### Defined in

[src/config.ts:40](https://github.com/maptiler/maptiler-sdk-js/blob/301cf83/src/config.ts#L40)

• `set` **apiKey**(`k`): `void`

Set the MapTiler Cloud API key

#### Parameters

| Name | Type |
| :------ | :------ |
| `k` | `string` |

#### Returns

`void`

#### Defined in

[src/config.ts:32](https://github.com/maptiler/maptiler-sdk-js/blob/301cf83/src/config.ts#L32)

___

### fetch

• `get` **fetch**(): `FetchFunction`

Get the fetch fucntion

#### Returns

`FetchFunction`

#### Defined in

[src/config.ts:54](https://github.com/maptiler/maptiler-sdk-js/blob/301cf83/src/config.ts#L54)

• `set` **fetch**(`f`): `void`

Set a the custom fetch function to replace the default one

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | `FetchFunction` |

#### Returns

`void`

#### Defined in

[src/config.ts:47](https://github.com/maptiler/maptiler-sdk-js/blob/301cf83/src/config.ts#L47)
