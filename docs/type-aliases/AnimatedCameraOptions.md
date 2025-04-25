[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / AnimatedCameraOptions

# Type Alias: AnimatedCameraOptions

> **AnimatedCameraOptions** = \{ `follow?`: `boolean`; `pathSmoothing?`: \{ `epsilon`: `number`; `resolution`: `number`; \} \| `false`; \} \| `false`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:42](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L42)

Options for configuring the animated camera movement
along the route.

## Type declaration

\{ `follow?`: `boolean`; `pathSmoothing?`: \{ `epsilon`: `number`; `resolution`: `number`; \} \| `false`; \}

### follow?

> `optional` **follow**: `boolean`

Whether the camera should follow the animation

### pathSmoothing?

> `optional` **pathSmoothing**: \{ `epsilon`: `number`; `resolution`: `number`; \} \| `false`

Whether the camera path should be smoothed

#### Type declaration

\{ `epsilon`: `number`; `resolution`: `number`; \}

`false`

`false`
