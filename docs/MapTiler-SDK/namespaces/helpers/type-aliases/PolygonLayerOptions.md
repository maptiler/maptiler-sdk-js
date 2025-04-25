[**MapTiler SDK v3.3.0-rc1**](../../../../README.md)

***

[MapTiler SDK](../../../../README.md) / [helpers](../README.md) / PolygonLayerOptions

# Type Alias: PolygonLayerOptions

> **PolygonLayerOptions** = [`CommonShapeLayerOptions`](CommonShapeLayerOptions.md) & `object`

Defined in: [src/helpers/vectorlayerhelpers.ts:235](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/helpers/vectorlayerhelpers.ts#L235)

## Type declaration

### fillColor?

> `optional` **fillColor**: `string` \| [`ZoomStringValues`](ZoomStringValues.md)

Color of the polygon. This is can be a constant color string or a definition based on zoom levels.
Default: a color randomly pick from a list

### fillOpacity?

> `optional` **fillOpacity**: [`ZoomNumberValues`](ZoomNumberValues.md)

Opacity of the polygon. This is can be a constant opacity in [0, 1] or a definition based on zoom levels
Default: `1`

### outlineBlur?

> `optional` **outlineBlur**: `number` \| [`ZoomNumberValues`](ZoomNumberValues.md)

How blury the outline is, with `0` being no blur and `10` and beyond being quite blurry.
Applies only if `.outline` is `true`.
Default: `0`

### outlineCap?

> `optional` **outlineCap**: `"butt"` \| `"round"` \| `"square"`

The display of line endings for both the line and the outline (if `.outline` is `true`)
- "butt": A cap with a squared-off end which is drawn to the exact endpoint of the line.
- "round": A cap with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line.
- "square": A cap with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width.
Default: "round"

### outlineDashArray?

> `optional` **outlineDashArray**: `number`[] \| `string`

Sequence of line and void to create a dash pattern. The unit is the line width so that
a dash array value of `[3, 1]` will create a segment worth 3 times the width of the line,
followed by a spacing worth 1 time the line width, and then repeat.

Alternatively, this property can be a string made of underscore and whitespace characters
such as `"___ _ "` and internaly this will be translated into [3, 1, 1, 1]. Note that
this way of describing dash arrays with a string only works for integer values.

Dash arrays can contain more than 2 element to create more complex patters. For instance
a dash array value of [3, 2, 1, 2] will create the following sequence:
- a segment worth 3 times the width
- a spacing worth 2 times the width
- a segment worth 1 times the width
- a spacing worth 2 times the width
- repeat

Default: no dash pattern

### outlineJoin?

> `optional` **outlineJoin**: `"bevel"` \| `"round"` \| `"miter"`

The display of lines when joining for both the line and the outline (if `.outline` is `true`)
- "bevel": A join with a squared-off end which is drawn beyond the endpoint of the line at a distance of one-half of the line's width.
- "round": A join with a rounded end which is drawn beyond the endpoint of the line at a radius of one-half of the line's width and centered on the endpoint of the line.
- "miter": A join with a sharp, angled corner which is drawn with the outer sides beyond the endpoint of the path until they meet.
Default: "round"

### outlinePosition

> **outlinePosition**: `"center"` \| `"inside"` \| `"outside"`

Position of the outline with regard to the polygon edge (when `.outline` is `true`)
Default: `"center"`

### pattern?

> `optional` **pattern**: `string` \| `null`

The pattern is an image URL to be put as a repeated background pattern of the polygon.
Default: `null` (no pattern, `fillColor` will be used)
