[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / getWebGLSupportError

# Function: getWebGLSupportError()

> **getWebGLSupportError**(): `null` \| `string`

Defined in: [src/tools.ts:140](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/tools.ts#L140)

This function tests if WebGL2 is supported. Since it can be for a different reasons that WebGL2 is
not supported but we do not have an action to take based on the reason, this function return null
if there is no error (WebGL is supported), or returns a string with the error message if WebGL2 is
not supported.

## Returns

`null` \| `string`
