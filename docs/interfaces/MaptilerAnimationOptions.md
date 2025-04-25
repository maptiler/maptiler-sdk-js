[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MaptilerAnimationOptions

# Interface: MaptilerAnimationOptions

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:17](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L17)

Configuration options for creating an animation.

 MaptilerAnimationOptions

## Properties

### delay?

> `optional` **delay**: `number`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:22](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L22)

Optional. The delay before the animation starts, in milliseconds. Defaults to 0 if not specified.

***

### duration

> **duration**: `number`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:19](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L19)

The total duration of the animation in milliseconds.

***

### iterations

> **iterations**: `number`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:20](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L20)

The number of times the animation should repeat. Use 0 for no repeat, or Infinity for an infinite loop.

***

### keyframes

> **keyframes**: [`Keyframe`](../type-aliases/Keyframe.md)[]

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:18](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L18)

The keyframes that define the animation states at various points in time.

***

### manualMode?

> `optional` **manualMode**: `boolean`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:21](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L21)

Optional. If true, the animation will not be automatically managed by the animation manager
                                  and must be updated manually by calling update(). Defaults to false if not specified.
