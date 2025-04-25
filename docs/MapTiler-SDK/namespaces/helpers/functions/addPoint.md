[**MapTiler SDK v3.3.0-rc1**](../../../../README.md)

***

[MapTiler SDK](../../../../README.md) / [helpers](../README.md) / addPoint

# Function: addPoint()

> **addPoint**(`map`, `options`): `object`

Defined in: [src/helpers/vectorlayerhelpers.ts:878](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L878)

Add a point layer from a GeoJSON source (or an existing sourceId) with many styling options

## Parameters

### map

[`Map`](../../../../classes/Map.md)

The Map instance to add a point layer to

### options

[`PointLayerOptions`](../type-aliases/PointLayerOptions.md)

## Returns

### clusterLayerId

> **clusterLayerId**: `string`

ID of the clustered point layer (empty if `cluster` options id `false`)

### labelLayerId

> **labelLayerId**: `string`

ID of the layer that shows the count of elements in each cluster (empty if `cluster` options id `false`)

### pointLayerId

> **pointLayerId**: `string`

ID of the unclustered point layer

### pointSourceId

> **pointSourceId**: `string`

ID of the data source
