[**MapTiler SDK v3.3.0-rc1**](../../../../README.md)

***

[MapTiler SDK](../../../../README.md) / [helpers](../README.md) / DataDrivenStyle

# Type Alias: DataDrivenStyle

> **DataDrivenStyle** = `object`[]

Defined in: [src/helpers/vectorlayerhelpers.ts:71](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L71)

Describes how to render a cluster of points

## Type declaration

### color

> **color**: `string`

Color of the cluster

### pointRadius

> **pointRadius**: `number`

Radius of the cluster circle

### value

> **value**: `number`

Numerical value to observe and apply the style upon.
In case of clusters, the value to observe is automatically the number of elements in a cluster.
In other cases, it can be a provided value.
