[**MapTiler SDK v3.3.0-rc1**](../../../../README.md)

***

[MapTiler SDK](../../../../README.md) / [helpers](../README.md) / HeatmapLayerOptions

# Type Alias: HeatmapLayerOptions

> **HeatmapLayerOptions** = `object`

Defined in: [src/helpers/vectorlayerhelpers.ts:400](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L400)

## Properties

### beforeId?

> `optional` **beforeId**: `string`

Defined in: [src/helpers/vectorlayerhelpers.ts:425](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L425)

The ID of an existing layer to insert the new layer before, resulting in the new layer appearing
visually beneath the existing layer. If this argument is not specified, the layer will be appended
to the end of the layers array and appear visually above all other layers.

***

### colorRamp?

> `optional` **colorRamp**: [`ColorRamp`](../../../../classes/ColorRamp.md)

Defined in: [src/helpers/vectorlayerhelpers.ts:444](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L444)

The ColorRamp instance to use for visualization. The color ramp is expected to be defined in the
range `[0, 1]` or else will be forced to this range.
Default: `ColorRampCollection.TURBO`

***

### data

> **data**: `FeatureCollection` \| `string`

Defined in: [src/helpers/vectorlayerhelpers.ts:418](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L418)

A geojson Feature collection or a URL to a geojson or the UUID of a MapTiler Cloud dataset.

***

### intensity?

> `optional` **intensity**: `number` \| [`ZoomNumberValues`](ZoomNumberValues.md)

Defined in: [src/helpers/vectorlayerhelpers.ts:481](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L481)

The intensity is zoom-dependent. By default, the intensity is going to be scaled by zoom to preserve
a natural aspect or the data distribution.

***

### layerId?

> `optional` **layerId**: `string`

Defined in: [src/helpers/vectorlayerhelpers.ts:406](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L406)

ID to give to the layer.
If not provided, an auto-generated ID of the for "maptiler-layer-xxxxxx" will be auto-generated,
with "xxxxxx" being a random string.

***

### maxzoom?

> `optional` **maxzoom**: `number`

Defined in: [src/helpers/vectorlayerhelpers.ts:437](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L437)

Zoom level after which it no longer show.
Default: `22`

***

### minzoom?

> `optional` **minzoom**: `number`

Defined in: [src/helpers/vectorlayerhelpers.ts:431](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L431)

Zoom level at which it starts to show.
Default: `0`

***

### opacity?

> `optional` **opacity**: `number` \| [`ZoomNumberValues`](ZoomNumberValues.md)

Defined in: [src/helpers/vectorlayerhelpers.ts:475](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L475)

The opacity can be a fixed value or zoom-driven.
Default: fades-in 0.25z after minzoom and fade-out 0.25z before maxzoom

***

### property?

> `optional` **property**: `string`

Defined in: [src/helpers/vectorlayerhelpers.ts:451](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L451)

Use a property to apply a weight to each data point. Using a property requires also using
the options `.propertyValueWeight` or otherwise will be ignored.
Default: none, the points will all have a weight of `1`.

***

### radius?

> `optional` **radius**: `number` \| [`ZoomNumberValues`](ZoomNumberValues.md) \| [`PropertyValues`](PropertyValues.md)

Defined in: [src/helpers/vectorlayerhelpers.ts:469](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L469)

The radius (in screenspace) can be:
- a fixed number that will be constant across zoom level
- of type `ZoomNumberValues` to be ramped accoding to zoom level (`.zoomCompensation` will then be ignored)
- of type `PropertyValues` to be driven by the value of a property.
  If so, the option `.property` must be provided and will still be resized according to zoom level,
  unless the option `.zoomCompensation` is set to `false`.

Default:

***

### sourceId?

> `optional` **sourceId**: `string`

Defined in: [src/helpers/vectorlayerhelpers.ts:413](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L413)

ID to give to the geojson source.
If not provided, an auto-generated ID of the for "maptiler-source-xxxxxx" will be auto-generated,
with "xxxxxx" being a random string.

***

### weight?

> `optional` **weight**: [`PropertyValues`](PropertyValues.md) \| `number`

Defined in: [src/helpers/vectorlayerhelpers.ts:457](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L457)

The weight to give to each data point. If of type `PropertyValueWeights`, then the options `.property`
must also be provided. If used a number, all data points will be weighted by the same number (which is of little interest)

***

### zoomCompensation?

> `optional` **zoomCompensation**: `boolean`

Defined in: [src/helpers/vectorlayerhelpers.ts:488](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L488)

If the radius is driven by a property, then it will also scale by zoomming if `.zoomCompensation` is `true`.
If `false`, the radius will not adapt according to the zoom level.
Default: `true`
