[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / getKeyframes

# Function: getKeyframes()

> **getKeyframes**(`coordinates`, `deltas`, `easings`, `properties`): [`Keyframe`](../type-aliases/Keyframe.md)[]

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:299](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L299)

Generates an array of keyframes from coordinates, deltas, easings, and other properties provided by the geoJSON feature.
Assumes that the coordinates are in the format [longitude, latitude, altitude?]. If altitude is not provided, it defaults to 0.

## Parameters

### coordinates

`number`[][]

Array of coordinate points, where each point is an array of [longitude, latitude, altitude?]

### deltas

`number`[]

Array of time deltas between keyframes

### easings

[`EasingFunctionName`](../enumerations/EasingFunctionName.md)[]

Array of easing function names to apply to each keyframe transition

### properties

`Record`\<`string`, `number`[]\> = `{}`

Optional additional properties as key-value pairs, where each value is an array
of numbers corresponding to each keyframe

## Returns

[`Keyframe`](../type-aliases/Keyframe.md)[]

An array of Keyframe objects, each containing coordinate props, delta, and easing information

## Throws

Error if the arrays for coordinates, deltas, easings, and any property values don't have matching lengths

## Example

```ts
const keyframes = getKeyframes(
  [[0, 0, 10], [10, 10, 20]], // coordinates
  [1000, 2000], // deltas (in milliseconds)
  [EasingFunctionName.Linear, EasingFunctionName.ElasticIn], // easings
  { zoom: [10, 15] } // additional properties
);
```
