[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / createBezierPathFromCoordinates

# Function: createBezierPathFromCoordinates()

> **createBezierPathFromCoordinates**(`inputPath`, `outputResolution`, `simplificationThreshold?`): \[`number`, `number`\][]

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:355](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L355)

Creates a smoothed path using cubic Bezier curves from an array of coordinates.

This function takes a series of points and creates a smooth path by generating cubic
Bezier curves between them. It uses the Catmull-Rom method to automatically calculate
control points for each curve segment. If the path has fewer than 4 points, the original
path is returned unchanged.

## Parameters

### inputPath

\[`number`, `number`\][]

Array of [x, y] coordinates that define the original path

### outputResolution

`number` = `20`

Controls how many points are generated along each segment
                          (higher values create smoother curves with more points)

### simplificationThreshold?

`number`

Optional threshold for simplifying the input path before
                                 creating the curves.

## Returns

\[`number`, `number`\][]

An array of [x, y] coordinates representing the smoothed path
