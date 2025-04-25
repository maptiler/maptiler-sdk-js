[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / getRTLTextPluginStatus

# Variable: getRTLTextPluginStatus()

> **getRTLTextPluginStatus**: () => `string`

Defined in: [src/index.ts:50](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/index.ts#L50)

Gets the map's [RTL text plugin](https://www.mapbox.com/mapbox-gl-js/plugins/#mapbox-gl-rtl-text) status.
The status can be `unavailable` (i.e. not requested or removed), `loading`, `loaded` or `error`.
If the status is `loaded` and the plugin is requested again, an error will be thrown.

## Returns

`string`

## Example

```ts
const pluginStatus = getRTLTextPluginStatus();
```
