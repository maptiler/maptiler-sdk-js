[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / setRTLTextPlugin

# Variable: setRTLTextPlugin()

> **setRTLTextPlugin**: (`pluginURL`, `lazy`) => `Promise`\<`void`\>

Defined in: [src/index.ts:49](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/index.ts#L49)

Sets the map's [RTL text plugin](https://www.mapbox.com/mapbox-gl-js/plugins/#mapbox-gl-rtl-text).
Necessary for supporting the Arabic and Hebrew languages, which are written right-to-left.

## Parameters

### pluginURL

`string`

URL pointing to the Mapbox RTL text plugin source.

### lazy

`boolean`

If set to `true`, maplibre will defer loading the plugin until rtl text is encountered,
rtl text will then be rendered only after the plugin finishes loading.

## Returns

`Promise`\<`void`\>

## Example

```ts
setRTLTextPlugin('https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js', false);
```

## See

[Add support for right-to-left scripts](https://maplibre.org/maplibre-gl-js/docs/examples/mapbox-gl-rtl-text/)
