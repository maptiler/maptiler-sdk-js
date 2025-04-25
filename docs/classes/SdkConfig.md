[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / SdkConfig

# Class: SdkConfig

Defined in: [src/config.ts:13](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L13)

Configuration class for the SDK

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new SdkConfig**(`options?`): `SdkConfig`

Defined in: node\_modules/@types/node/events.d.ts:134

#### Parameters

##### options?

`EventEmitterOptions`

#### Returns

`SdkConfig`

#### Inherited from

`EventEmitter.constructor`

## Properties

### caching

> **caching**: `boolean` = `true`

Defined in: [src/config.ts:39](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L39)

Enables client-side caching of requests for tiles and fonts.
The cached requests persist multiple browser sessions and will be reused when possible.
Works only for requests to the MapTiler Cloud API when sessions are enabled.

***

### primaryLanguage

> **primaryLanguage**: `LanguageInfo` = `defaults.primaryLanguage`

Defined in: [src/config.ts:17](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L17)

The primary language. By default, the language of the web browser is used.

***

### secondaryLanguage?

> `optional` **secondaryLanguage**: `LanguageInfo`

Defined in: [src/config.ts:23](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L23)

The secondary language, to overwrite the default language defined in the map style.
This settings is highly dependant on the style compatibility and may not work in most cases.

***

### session

> **session**: `boolean` = `true`

Defined in: [src/config.ts:32](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L32)

Setting on whether of not the SDK runs with a session logic.
A "session" is started at the initialization of the SDK and finished when the browser
page is being refreshed.
When `session` is enabled (default: true), the extra URL param `mtsid` is added to queries
on the MapTiler Cloud API. This allows MapTiler to enable "session based billing".

***

### telemetry

> **telemetry**: `boolean` = `true`

Defined in: [src/config.ts:58](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L58)

Telemetry is enabled by default but can be opted-out by setting this value to `false`.
The telemetry is very valuable to the team at MapTiler because it shares information
about where to add the extra effort. It also helps spotting some incompatibility issues
that may arise between the SDK and a specific version of a module.

It consists in sending metrics about usage of the following features:
- SDK version [string]
- API key [string]
- MapTiler sesion ID (if opted-in) [string]
- if tile caching is enabled [boolean]
- if language specified at initialization [boolean]
- if terrain is activated at initialization [boolean]
- if globe projection is activated at initialization [boolean]

In addition, each official module will be added to a list, alongside its version number.

## Accessors

### apiKey

#### Get Signature

> **get** **apiKey**(): `string`

Defined in: [src/config.ts:97](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L97)

Get the MapTiler Cloud API key

##### Returns

`string`

#### Set Signature

> **set** **apiKey**(`k`): `void`

Defined in: [src/config.ts:88](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L88)

Set the MapTiler Cloud API key

##### Parameters

###### k

`string`

##### Returns

`void`

***

### fetch

#### Get Signature

> **get** **fetch**(): `null` \| `FetchFunction`

Defined in: [src/config.ts:111](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L111)

Get the fetch fucntion

##### Returns

`null` \| `FetchFunction`

#### Set Signature

> **set** **fetch**(`f`): `void`

Defined in: [src/config.ts:104](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L104)

Set a the custom fetch function to replace the default one

##### Parameters

###### f

`FetchFunction`

##### Returns

`void`

***

### unit

#### Get Signature

> **get** **unit**(): [`Unit`](../type-aliases/Unit.md)

Defined in: [src/config.ts:81](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L81)

Get the unit system

##### Returns

[`Unit`](../type-aliases/Unit.md)

#### Set Signature

> **set** **unit**(`u`): `void`

Defined in: [src/config.ts:73](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/config.ts#L73)

Set the unit system

##### Parameters

###### u

[`Unit`](../type-aliases/Unit.md)

##### Returns

`void`
