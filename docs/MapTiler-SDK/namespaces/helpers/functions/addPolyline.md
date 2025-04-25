[**MapTiler SDK v3.3.0-rc1**](../../../../README.md)

***

[MapTiler SDK](../../../../README.md) / [helpers](../README.md) / addPolyline

# Function: addPolyline()

> **addPolyline**(`map`, `options`, `fetchOptions`): `Promise`\<\{ `polylineLayerId`: `string`; `polylineOutlineLayerId`: `string`; `polylineSourceId`: `string`; \}\>

Defined in: [src/helpers/vectorlayerhelpers.ts:515](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L515)

Add a polyline to the map from various sources and with builtin styling.
Compatible sources:
- gpx content as string
- gpx file from URL
- kml content from string
- kml from url
- geojson from url
- geojson content as string
- geojson content as JS object
- uuid of a MapTiler Cloud dataset

The method also gives the possibility to add an outline layer (if `options.outline` is `true`)
and if so , the returned property `polylineOutlineLayerId` will be a string. As a result, two layers
would be added.

The default styling creates a line layer of constant width of 3px, the color will be randomly picked
from a curated list of colors and the opacity will be 1.
If the outline is enabled, the outline width is of 1px at all zoom levels, the color is white and
the opacity is 1.

Those style properties can be changed and ramped according to zoom level using an easier syntax.

## Parameters

### map

[`Map`](../../../../classes/Map.md)

Map instance to add a polyline layer to

### options

[`PolylineLayerOptions`](../type-aliases/PolylineLayerOptions.md)

Options related to adding a polyline layer

### fetchOptions

`RequestInit` = `{}`

When the polyline data is loaded from a distant source, these options are propagated to the call of `fetch`

## Returns

`Promise`\<\{ `polylineLayerId`: `string`; `polylineOutlineLayerId`: `string`; `polylineSourceId`: `string`; \}\>
