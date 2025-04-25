[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / resamplePath

# Function: resamplePath()

> **resamplePath**(`path`, `spacing`): \[`number`, `number`\][]

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:455](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L455)

Resamples a geographic path to have points spaced at approximately equal distances.
If the original path has fewer than 2 points, it is returned unchanged.

## Parameters

### path

\[`number`, `number`\][]

An array of coordinate pairs [longitude, latitude] representing the path to resample

### spacing

`number` = `10`

The desired spacing between points in the resampled path (in the same unit as used by the distanceTo method), defaults to 10

## Returns

\[`number`, `number`\][]

A new array of coordinate pairs representing the resampled path with approximately equal spacing between points
