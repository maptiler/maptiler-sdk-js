[**MapTiler SDK v3.3.0-rc1**](../../../../README.md)

***

[MapTiler SDK](../../../../README.md) / [helpers](../README.md) / takeScreenshot

# Function: takeScreenshot()

> **takeScreenshot**(`map`, `options`): `Promise`\<`Blob`\>

Defined in: [src/helpers/screenshot.ts:7](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/screenshot.ts#L7)

Takes a screenshot (PNG file) of the curent map view.
Depending on the options, this function can automatically trigger a download of te file.

## Parameters

### map

[`Map`](../../../../classes/Map.md)

### options

#### download?

`boolean`

If `true`, this function will trigger a download in addition to returning a blob.
Default: `false`

#### filename?

`string`

Only if `options.download` is `true`. Indicates the filename under which
the file will be downloaded.
Default: `"maptiler_screenshot.png"`

## Returns

`Promise`\<`Blob`\>
