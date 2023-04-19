[MapTiler SDK - v1.0.10](../README.md) / RasterTileSource

# Class: RasterTileSource

## Hierarchy

- `RasterTileSource`

  ↳ **`RasterTileSource`**

## Table of contents

### Constructors

- [constructor](RasterTileSource.md#constructor)

### Methods

- [onAdd](RasterTileSource.md#onadd)

## Constructors

### constructor

• **new RasterTileSource**(`id`, `options`, `dispatcher`, `eventedParent`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `options` | `RasterSourceSpecification` \| `RasterDEMSourceSpecification` |
| `dispatcher` | `Dispatcher` |
| `eventedParent` | `Evented` |

#### Inherited from

maplibregl.RasterTileSource.constructor

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:3406

## Methods

### onAdd

▸ **onAdd**(`map`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `map` | `Map` \| [`Map`](Map.md) |

#### Returns

`void`

#### Overrides

maplibregl.RasterTileSource.onAdd

#### Defined in

[src/RasterTileSource.ts:10](https://github.com/maptiler/maptiler-sdk-js/blob/a5b1980/src/RasterTileSource.ts#L10)
