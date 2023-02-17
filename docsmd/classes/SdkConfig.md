[MapTiler SDK - v1.0.1](../README.md) / SdkConfig

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
- [session](SdkConfig.md#session)

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

[src/config.ts:40](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L40)

## Properties

### primaryLanguage

• **primaryLanguage**: [`LanguageString`](../README.md#languagestring) = `Language.AUTO`

The primary language. By default, the language of the web browser is used.

#### Defined in

[src/config.ts:13](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L13)

___

### secondaryLanguage

• **secondaryLanguage**: [`LanguageString`](../README.md#languagestring) = `null`

The secondary language, to overwrite the default language defined in the map style.
This settings is highly dependant on the style compatibility and may not work in most cases.

#### Defined in

[src/config.ts:19](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L19)

___

### session

• **session**: `boolean` = `true`

Setting on whether of not the SDK runs with a session logic.
A "session" is started at the initialization of the SDK and finished when the browser
page is being refreshed.
When `session` is enabled (default: true), the extra URL param `mtsid` is added to queries
on the MapTiler Cloud API. This allows MapTiler to enable "session based billing".

#### Defined in

[src/config.ts:28](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L28)

## Accessors

### apiKey

• `get` **apiKey**(): `string`

Get the MapTiler Cloud API key

#### Returns

`string`

#### Defined in

[src/config.ts:71](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L71)

• `set` **apiKey**(`k`): `void`

Set the MapTiler Cloud API key

#### Parameters

| Name | Type |
| :------ | :------ |
| `k` | `string` |

#### Returns

`void`

#### Defined in

[src/config.ts:62](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L62)

___

### fetch

• `get` **fetch**(): `FetchFunction`

Get the fetch fucntion

#### Returns

`FetchFunction`

#### Defined in

[src/config.ts:85](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L85)

• `set` **fetch**(`f`): `void`

Set a the custom fetch function to replace the default one

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | `FetchFunction` |

#### Returns

`void`

#### Defined in

[src/config.ts:78](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L78)

___

### unit

• `get` **unit**(): [`Unit`](../README.md#unit)

Get the unit system

#### Returns

[`Unit`](../README.md#unit)

#### Defined in

[src/config.ts:55](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L55)

• `set` **unit**(`u`): `void`

Set the unit system

#### Parameters

| Name | Type |
| :------ | :------ |
| `u` | [`Unit`](../README.md#unit) |

#### Returns

`void`

#### Defined in

[src/config.ts:47](https://github.com/maptiler/maptiler-sdk-js/blob/691fee3/src/config.ts#L47)
