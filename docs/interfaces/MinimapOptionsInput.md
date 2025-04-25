[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MinimapOptionsInput

# Interface: MinimapOptionsInput

Defined in: [src/controls/Minimap.ts:32](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L32)

## Properties

### containerStyle?

> `optional` **containerStyle**: `Record`\<`string`, `string`\>

Defined in: [src/controls/Minimap.ts:55](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L55)

Set CSS properties of the container using object key-values

***

### lockZoom?

> `optional` **lockZoom**: `number`

Defined in: [src/controls/Minimap.ts:49](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L49)

Set a zoom of the minimap and don't allow any future changes

***

### parentRect?

> `optional` **parentRect**: [`ParentRect`](ParentRect.md)

Defined in: [src/controls/Minimap.ts:61](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L61)

Set the parentRect fill and/or line options

***

### pitchAdjust?

> `optional` **pitchAdjust**: `boolean`

Defined in: [src/controls/Minimap.ts:52](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L52)

Adjust the pitch only if the user requests

***

### position?

> `optional` **position**: `ControlPosition`

Defined in: [src/controls/Minimap.ts:58](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L58)

Set the position of the minimap at either "top-left", "top-right", "bottom-left", or "bottom-right"

***

### style?

> `optional` **style**: `string` \| `ReferenceMapStyle` \| `MapStyleVariant` \| `StyleSpecification`

Defined in: [src/controls/Minimap.ts:39](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L39)

Style of the map. Can be:
- a full style URL (possibly with API key)
- a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
- a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)

***

### zoomAdjust?

> `optional` **zoomAdjust**: `number`

Defined in: [src/controls/Minimap.ts:46](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/Minimap.ts#L46)

Set the zoom difference between the parent and the minimap
If the parent is zoomed to 10 and the minimap is zoomed to 8, the zoomAdjust should be 2
Default: -4
