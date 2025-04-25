[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / lerp

# Function: lerp()

> **lerp**(`a`, `b`, `alpha`): `number`

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:15](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L15)

Performs simple linear interpolation between two numbers.

## Parameters

### a

`number`

The start value

### b

`number`

The end value

### alpha

`number`

The interpolation factor (typically between 0 and 1):
               0 returns a, 1 returns b, and values in between return a proportional mix

## Returns

`number`

The interpolated value between a and b
