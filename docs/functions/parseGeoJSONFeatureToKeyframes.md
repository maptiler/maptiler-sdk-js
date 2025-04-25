[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / parseGeoJSONFeatureToKeyframes

# Function: parseGeoJSONFeatureToKeyframes()

> **parseGeoJSONFeatureToKeyframes**(`feature`, `options`): [`Keyframe`](../type-aliases/Keyframe.md)[]

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:178](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L178)

Converts a GeoJSON feature into an array of animation keyframes.

Parses a GeoJSON feature with reserved properties to create animation keyframes.
It extracts coordinates from the geometry and uses properties prefixed with '@' as animation
control parameters (easing functions, delta values). Non-reserved properties are preserved
and passed to the keyframe objects as props that will be interpolated

## Parameters

### feature

[`KeyframeableGeoJSONFeature`](../type-aliases/KeyframeableGeoJSONFeature.md)

The GeoJSON feature to convert to keyframes

### options

[`IparseGeoJSONToKeyframesOptions`](../interfaces/IparseGeoJSONToKeyframesOptions.md) = `{}`

Configuration options

## Returns

[`Keyframe`](../type-aliases/Keyframe.md)[]

Array of keyframe objects that can be used for animation

## Throws

When no geometry is found in the feature

## Throws

When the geometry type is not supported
