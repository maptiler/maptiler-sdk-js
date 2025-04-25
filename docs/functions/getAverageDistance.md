[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / getAverageDistance

# Function: getAverageDistance()

> **getAverageDistance**(`arr`): `number`

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:394](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L394)

Calculates the average distance between points in an array of coordinates.

This function computes the average distance between consecutive points in the array.
It uses the LngLat class from MapLibre to calculate distances based on geographical coordinates.

## Parameters

### arr

\[`number`, `number`\][]

An array of coordinate pairs [longitude, latitude]

## Returns

`number`

The average distance between points in the array
