[**MapTiler SDK v3.3.0-rc1**](../../../../README.md)

***

[MapTiler SDK](../../../../README.md) / [helpers](../README.md) / PointLayerOptions

# Type Alias: PointLayerOptions

> **PointLayerOptions** = [`CommonShapeLayerOptions`](CommonShapeLayerOptions.md) & `object`

Defined in: [src/helpers/vectorlayerhelpers.ts:307](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L307)

## Type declaration

### alignOnViewport?

> `optional` **alignOnViewport**: `boolean`

If `true`, the points will keep their circular shape align with the wiewport.
If `false`, the points will be like flatten on the map. This difference shows
when the map is tilted.
Default: `true`

### cluster?

> `optional` **cluster**: `boolean`

Whether the points should cluster

### labelColor?

> `optional` **labelColor**: `string`

text color used for the number elements in each cluster.
Applicable only when `cluster` is `true`.
Default: `#000000` (black)

### labelSize?

> `optional` **labelSize**: `number`

text size used for the number elements in each cluster.
Applicable only when `cluster` is `true`.
Default: `12`

### maxPointRadius?

> `optional` **maxPointRadius**: `number`

The maximum point radius posible.
Default: `40`

### minPointRadius?

> `optional` **minPointRadius**: `number`

The minimum point radius posible.
Default: `10`

### pointColor?

> `optional` **pointColor**: `string` \| [`ColorRamp`](../../../../classes/ColorRamp.md)

Can be a unique point color as a string (CSS color such as "#FF0000" or "red").
Alternatively, the color can be a ColorRamp with a range.
In case of `.cluster` being `true`, the range of the ColorRamp will be addressed with the number of elements in
the cluster. If `.cluster` is `false`, the color will be addressed using the value of the `.property`.
If no `.property` is given but `.pointColor` is a ColorRamp, the chosen color is the one at the lower bound of the ColorRamp.
Default: a color randomly pick from a list

### pointOpacity?

> `optional` **pointOpacity**: `number` \| [`ZoomNumberValues`](ZoomNumberValues.md)

Opacity of the point or icon. This is can be a constant opacity in [0, 1] or a definition based on zoom levels.
Alternatively, if not provided but the `.pointColor` is a ColorRamp, the opacity will be extracted from tha alpha
component if present.
Default: `1`

### pointRadius?

> `optional` **pointRadius**: `number` \| [`ZoomNumberValues`](ZoomNumberValues.md)

Radius of the points. Can be a fixed size or a value dependant on the zoom.
If `.pointRadius` is not provided, the radius will depend on the size of each cluster (if `.cluster` is `true`)
or on the value of each point (if `.property` is provided and `.pointColor` is a ColorRamp).
The radius will be between `.minPointRadius` and `.maxPointRadius`

### property?

> `optional` **property**: `string`

The point property to observe and apply the radius and color upon.
This is ignored if `.cluster` is `true` as the observed value will be fiorced to being the number
of elements in each cluster.

Default: none

### showLabel?

> `optional` **showLabel**: `boolean`

Shows a label with the numerical value id `true`.
If `.cluster` is `true`, the value will be the numebr of elements in the cluster.

Default: `true` if `cluster` or `dataDrivenStyleProperty` are used, `false` otherwise.

### zoomCompensation?

> `optional` **zoomCompensation**: `boolean`

Only if `.cluster` is `false`.
If the radius is driven by a property, then it will also scale by zoomming if `.zoomCompensation` is `true`.
If `false`, the radius will not adapt according to the zoom level.
Default: `true`
