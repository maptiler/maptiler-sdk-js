[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / InterpolatedKeyFrame

# Type Alias: InterpolatedKeyFrame

> **InterpolatedKeyFrame** = [`Keyframe`](Keyframe.md) & `object`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:34](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L34)

A keyframe in the animation sequence where null or undefined values
are interpolated to fill in the gaps between keyframes.

## Type declaration

### easing

> **easing**: [`EasingFunctionName`](../enumerations/EasingFunctionName.md)

### id

> **id**: `string`

### props

> **props**: `Record`\<`string`, `number`\>
