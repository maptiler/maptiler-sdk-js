[**MapTiler SDK v3.3.0-rc1**](../../../../README.md)

***

[MapTiler SDK](../../../../README.md) / [helpers](../README.md) / addPolygon

# Function: addPolygon()

> **addPolygon**(`map`, `options`): `object`

Defined in: [src/helpers/vectorlayerhelpers.ts:705](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L705)

Add a polygon with styling options.

## Parameters

### map

[`Map`](../../../../classes/Map.md)

### options

[`PolygonLayerOptions`](../type-aliases/PolygonLayerOptions.md)

## Returns

### polygonLayerId

> **polygonLayerId**: `string`

ID of the fill layer

### polygonOutlineLayerId

> **polygonOutlineLayerId**: `string`

ID of the outline layer (will be `""` if no outline)

### polygonSourceId

> **polygonSourceId**: `string`

ID of the source that contains the data
