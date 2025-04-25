[**MapTiler SDK v3.3.0-rc1**](../../../../README.md)

***

[MapTiler SDK](../../../../README.md) / [helpers](../README.md) / CommonShapeLayerOptions

# Type Alias: CommonShapeLayerOptions

> **CommonShapeLayerOptions** = `object`

Defined in: [src/helpers/vectorlayerhelpers.ts:90](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L90)

## Properties

### beforeId?

> `optional` **beforeId**: `string`

Defined in: [src/helpers/vectorlayerhelpers.ts:115](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L115)

The ID of an existing layer to insert the new layer before, resulting in the new layer appearing
visually beneath the existing layer. If this argument is not specified, the layer will be appended
to the end of the layers array and appear visually above all other layers.

***

### data

> **data**: `FeatureCollection` \| `string`

Defined in: [src/helpers/vectorlayerhelpers.ts:108](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L108)

A geojson Feature collection or a URL to a geojson or the UUID of a MapTiler Cloud dataset.

***

### layerId?

> `optional` **layerId**: `string`

Defined in: [src/helpers/vectorlayerhelpers.ts:96](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L96)

ID to give to the layer.
If not provided, an auto-generated ID of the for "maptiler-layer-xxxxxx" will be auto-generated,
with "xxxxxx" being a random string.

***

### maxzoom?

> `optional` **maxzoom**: `number`

Defined in: [src/helpers/vectorlayerhelpers.ts:127](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L127)

Zoom level after which it no longer show.
Default: `22`

***

### minzoom?

> `optional` **minzoom**: `number`

Defined in: [src/helpers/vectorlayerhelpers.ts:121](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L121)

Zoom level at which it starts to show.
Default: `0`

***

### outline?

> `optional` **outline**: `boolean`

Defined in: [src/helpers/vectorlayerhelpers.ts:133](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L133)

Whether or not to add an outline.
Default: `false`

***

### outlineColor?

> `optional` **outlineColor**: `string` \| [`ZoomStringValues`](ZoomStringValues.md)

Defined in: [src/helpers/vectorlayerhelpers.ts:140](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L140)

Color of the outline. This is can be a constant color string or a definition based on zoom levels.
Applies only if `.outline` is `true`.
Default: `white`

***

### outlineOpacity?

> `optional` **outlineOpacity**: `number` \| [`ZoomNumberValues`](ZoomNumberValues.md)

Defined in: [src/helpers/vectorlayerhelpers.ts:154](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L154)

Opacity of the outline. This is can be a constant opacity in [0, 1] or a definition based on zoom levels
Applies only if `.outline` is `true`.
Default: `1`

***

### outlineWidth?

> `optional` **outlineWidth**: `number` \| [`ZoomNumberValues`](ZoomNumberValues.md)

Defined in: [src/helpers/vectorlayerhelpers.ts:147](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L147)

Width of the outline (relative to screen-space). This is can be a constant width or a definition based on zoom levels.
Applies only if `.outline` is `true`.
Default: `1`

***

### sourceId?

> `optional` **sourceId**: `string`

Defined in: [src/helpers/vectorlayerhelpers.ts:103](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L103)

ID to give to the geojson source.
If not provided, an auto-generated ID of the for "maptiler-source-xxxxxx" will be auto-generated,
with "xxxxxx" being a random string.
