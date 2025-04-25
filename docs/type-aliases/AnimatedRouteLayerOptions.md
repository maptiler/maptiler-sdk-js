[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / AnimatedRouteLayerOptions

# Type Alias: AnimatedRouteLayerOptions

> **AnimatedRouteLayerOptions** = `object` & \{ `keyframes`: [`Keyframe`](Keyframe.md)[]; `source?`: `never`; \} \| \{ `keyframes?`: `never`; `source`: [`SourceData`](SourceData.md); \}

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:74](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L74)

Configuration options for the AnimatedRouteLayer.
This type supports either providing keyframes directly OR source data for the animation.

## Type declaration

### autoplay?

> `optional` **autoplay**: `boolean`

Whether the animation should autoplay

### cameraAnimation?

> `optional` **cameraAnimation**: [`AnimatedCameraOptions`](AnimatedCameraOptions.md)

The camera animation options

### delay?

> `optional` **delay**: `number`

The delay in ms before playing

### duration?

> `optional` **duration**: `number`

The Duration in ms

### easing?

> `optional` **easing**: [`EasingFunctionName`](../enumerations/EasingFunctionName.md)

The default easing to use if not provided in teh GeoJSON

### iterations?

> `optional` **iterations**: `number`

The number of iterations

### manualUpdate?

> `optional` **manualUpdate**: `boolean`

Whether the animation should auto matically animated or whether the frameAdvance method should be called

### pathStrokeAnimation?

> `optional` **pathStrokeAnimation**: [`AnimatedStrokeOptions`](AnimatedStrokeOptions.md)

The stroke animation options, only viable for LineString geometries
