[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / IparseGeoJSONToKeyframesOptions

# Interface: IparseGeoJSONToKeyframesOptions

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:109](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L109)

Options for parsing GeoJSON data into animation keyframes.

 IparseGeoJSONToKeyframesOptions

## Properties

### defaultEasing?

> `optional` **defaultEasing**: [`EasingFunctionName`](../enumerations/EasingFunctionName.md)

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:110](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L110)

The default easing function to apply to the animation.

***

### pathSmoothing?

> `optional` **pathSmoothing**: `false` \| \{ `epsilon?`: `number`; `resolution`: `number`; \}

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:111](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L111)

Configuration for path smoothing, or false to disable smoothing.
