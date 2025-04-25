[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / lerpArrayValues

# Function: lerpArrayValues()

> **lerpArrayValues**(`numericArray`): `number`[]

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:27](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L27)

Interpolates an array of numbers, replacing null values with interpolated values.

`null` is treated as an empty value where an interpolation is needed.

## Parameters

### numericArray

[`NumericArrayWithNull`](../type-aliases/NumericArrayWithNull.md)

The array of numbers to interpolate, which may contain null values

## Returns

`number`[]

A new array with null values replaced by interpolated values
