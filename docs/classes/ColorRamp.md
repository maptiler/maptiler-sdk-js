[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / ColorRamp

# Class: ColorRamp

Defined in: [src/ColorRamp.ts:64](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L64)

## Extends

- `Array`\<[`ColorStop`](../type-aliases/ColorStop.md)\>

## Indexable

\[`n`: `number`\]: [`ColorStop`](../type-aliases/ColorStop.md)

## Constructors

### Constructor

> **new ColorRamp**(`options`): `ColorRamp`

Defined in: [src/ColorRamp.ts:83](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L83)

#### Parameters

##### options

[`ColorRampOptions`](../type-aliases/ColorRampOptions.md) = `{}`

#### Returns

`ColorRamp`

#### Overrides

`Array<ColorStop>.constructor`

## Methods

### at()

> **at**(`pos`): [`ColorStop`](../type-aliases/ColorStop.md)

Defined in: [src/ColorRamp.ts:153](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L153)

Takes an integer value and returns the item at that index,
allowing for positive and negative integers.
Negative integers count back from the last item in the array.

#### Parameters

##### pos

`number`

#### Returns

[`ColorStop`](../type-aliases/ColorStop.md)

#### Overrides

`Array.at`

***

### clone()

> **clone**(): `ColorRamp`

Defined in: [src/ColorRamp.ts:161](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L161)

#### Returns

`ColorRamp`

***

### getBounds()

> **getBounds**(): `object`

Defined in: [src/ColorRamp.ts:186](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L186)

#### Returns

`object`

##### max

> **max**: `number`

##### min

> **min**: `number`

***

### getCanvasStrip()

> **getCanvasStrip**(`options`): `HTMLCanvasElement`

Defined in: [src/ColorRamp.ts:242](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L242)

#### Parameters

##### options

###### horizontal?

`boolean`

###### size?

`number`

###### smooth?

`boolean`

#### Returns

`HTMLCanvasElement`

***

### getColor()

> **getColor**(`value`, `options`): [`RgbaColor`](../type-aliases/RgbaColor.md)

Defined in: [src/ColorRamp.ts:190](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L190)

#### Parameters

##### value

`number`

##### options

###### smooth?

`boolean`

#### Returns

[`RgbaColor`](../type-aliases/RgbaColor.md)

***

### getColorHex()

> **getColorHex**(`value`, `options`): `string`

Defined in: [src/ColorRamp.ts:224](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L224)

Get the color as an hexadecimal string

#### Parameters

##### value

`number`

##### options

###### smooth?

`boolean`

###### withAlpha?

`boolean`

#### Returns

`string`

***

### getColorRelative()

> **getColorRelative**(`value`, `options`): [`RgbaColor`](../type-aliases/RgbaColor.md)

Defined in: [src/ColorRamp.ts:237](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L237)

Get the color of the color ramp at a relative position in [0, 1]

#### Parameters

##### value

`number`

##### options

###### smooth?

`boolean`

#### Returns

[`RgbaColor`](../type-aliases/RgbaColor.md)

***

### getRawColorStops()

> **getRawColorStops**(): [`ColorStop`](../type-aliases/ColorStop.md)[]

Defined in: [src/ColorRamp.ts:165](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L165)

#### Returns

[`ColorStop`](../type-aliases/ColorStop.md)[]

***

### hasTransparentStart()

> **hasTransparentStart**(): `boolean`

Defined in: [src/ColorRamp.ts:366](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L366)

Check if this color ramp has a transparent start

#### Returns

`boolean`

***

### resample()

> **resample**(`method`, `samples`): `ColorRamp`

Defined in: [src/ColorRamp.ts:283](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L283)

Apply a non-linear ressampling. This will create a new instance of ColorRamp with the same bounds.

#### Parameters

##### method

`"ease-in-square"` | `"ease-out-square"` | `"ease-in-sqrt"` | `"ease-out-sqrt"` | `"ease-in-exp"` | `"ease-out-exp"`

##### samples

`number` = `15`

#### Returns

`ColorRamp`

***

### reverse()

> **reverse**(`options`): `ColorRamp`

Defined in: [src/ColorRamp.ts:175](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L175)

Reverses the elements in an array in place.
This method mutates the array and returns a reference to the same array.

#### Parameters

##### options

###### clone?

`boolean`

#### Returns

`ColorRamp`

#### Overrides

`Array.reverse`

***

### scale()

> **scale**(`min`, `max`, `options`): `ColorRamp`

Defined in: [src/ColorRamp.ts:125](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L125)

#### Parameters

##### min

`number`

##### max

`number`

##### options

###### clone?

`boolean`

#### Returns

`ColorRamp`

***

### setStops()

> **setStops**(`stops`, `options`): `ColorRamp`

Defined in: [src/ColorRamp.ts:99](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L99)

#### Parameters

##### stops

[`ColorStop`](../type-aliases/ColorStop.md)[]

##### options

###### clone?

`boolean`

#### Returns

`ColorRamp`

***

### transparentStart()

> **transparentStart**(): `ColorRamp`

Defined in: [src/ColorRamp.ts:344](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L344)

Makes a clone of this color ramp that is fully transparant at the begining of their range

#### Returns

`ColorRamp`

***

### fromArrayDefinition()

> `static` **fromArrayDefinition**(`cr`): `ColorRamp`

Defined in: [src/ColorRamp.ts:71](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/ColorRamp.ts#L71)

Converts a array-definition color ramp definition into a usable ColorRamp instance.
Note: units are not converted and may need to to be converted beforehand (eg. kelvin to centigrade)

#### Parameters

##### cr

[`ArrayColorRamp`](../type-aliases/ArrayColorRamp.md)

#### Returns

`ColorRamp`
