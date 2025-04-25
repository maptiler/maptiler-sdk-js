[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / KeyframeableGeoJSONFeature

# Type Alias: KeyframeableGeoJSONFeature

> **KeyframeableGeoJSONFeature** = `Feature`\<[`KeyframeableGeometry`](KeyframeableGeometry.md)\> & `object`

Defined in: [src/utils/MaptilerAnimation/animation-helpers.ts:151](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/animation-helpers.ts#L151)

Represents a GeoJSON Feature that can be animated with keyframes.
Extends the standard GeoJSON Feature with animation-specific properties.

## Type declaration

### properties

> **properties**: `Record`\<`string`, `number`[]\> & `object`

#### Type declaration

##### @autoplay?

> `optional` **@autoplay**: `boolean`

##### @delay?

> `optional` **@delay**: `number`

##### @delta?

> `optional` **@delta**: `number`[]

##### @duration?

> `optional` **@duration**: `number`

##### @easing?

> `optional` **@easing**: [`EasingFunctionName`](../enumerations/EasingFunctionName.md)[]

##### @iterations?

> `optional` **@iterations**: `number`
