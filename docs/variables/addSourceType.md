[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / addSourceType

# Variable: addSourceType()

> **addSourceType**: (`name`, `SourceType`) => `Promise`\<`void`\>

Defined in: [src/index.ts:73](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/index.ts#L73)

Adds a custom source type, making it available for use with Map#addSource.

## Parameters

### name

`string`

The name of the source type; source definition objects use this name in the `{type: ...}` field.

### SourceType

`SourceClass`

A SourceClass - which is a constructor for the `Source` interface.

## Returns

`Promise`\<`void`\>

a promise that is resolved when the source type is ready or rejected with an error.
