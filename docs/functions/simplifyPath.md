[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / simplifyPath

# Function: simplifyPath()

> **simplifyPath**(`points`, `distance`): \[`number`, `number`\][]

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:419](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L419)

Simplfies a path by removing points that are too close together.

This function first resamples the path based on the average distance between points,
then filters out points that are closer than the specified distance from the last included point.
The first and last points of the original path are always preserved.

## Parameters

### points

\[`number`, `number`\][]

An array of coordinate pairs [longitude, latitude]

### distance

`number`

The minimum distance between points in the simplified path

## Returns

\[`number`, `number`\][]

A new array containing a simplified version of the input path
