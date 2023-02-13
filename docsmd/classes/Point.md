[MapTiler SDK - v1.0.0](../README.md) / Point

# Class: Point

a point

**`Param`**

**`Param`**

## Table of contents

### Constructors

- [constructor](Point.md#constructor)

### Properties

- [x](Point.md#x)
- [y](Point.md#y)

### Methods

- [add](Point.md#add)
- [angle](Point.md#angle)
- [angleTo](Point.md#angleto)
- [angleWith](Point.md#anglewith)
- [angleWithSep](Point.md#anglewithsep)
- [clone](Point.md#clone)
- [dist](Point.md#dist)
- [distSqr](Point.md#distsqr)
- [div](Point.md#div)
- [divByPoint](Point.md#divbypoint)
- [equals](Point.md#equals)
- [mag](Point.md#mag)
- [matMult](Point.md#matmult)
- [mult](Point.md#mult)
- [multByPoint](Point.md#multbypoint)
- [perp](Point.md#perp)
- [rotate](Point.md#rotate)
- [rotateAround](Point.md#rotatearound)
- [round](Point.md#round)
- [sub](Point.md#sub)
- [unit](Point.md#unit)
- [convert](Point.md#convert)

## Constructors

### constructor

• **new Point**(`x`, `y`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Defined in

[src/Point.ts:20](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L20)

## Properties

### x

• **x**: `number`

#### Defined in

[src/Point.ts:17](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L17)

___

### y

• **y**: `number`

#### Defined in

[src/Point.ts:18](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L18)

## Methods

### add

▸ **add**(`p`): [`Point`](Point.md)

Add this point's x & y coordinates to another point,
yielding a new point.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | [`Point`](Point.md) | the other point |

#### Returns

[`Point`](Point.md)

output point

#### Defined in

[src/Point.ts:122](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L122)

___

### angle

▸ **angle**(): `number`

Get the angle from the 0, 0 coordinate to this point, in radians
coordinates.

#### Returns

`number`

angle

#### Defined in

[src/Point.ts:283](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L283)

___

### angleTo

▸ **angleTo**(`b`): `number`

Get the angle from this point to another point, in radians

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `b` | [`Point`](Point.md) | the other point |

#### Returns

`number`

angle

#### Defined in

[src/Point.ts:292](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L292)

___

### angleWith

▸ **angleWith**(`b`): `number`

Get the angle between this point and another point, in radians

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `b` | [`Point`](Point.md) | the other point |

#### Returns

`number`

angle

#### Defined in

[src/Point.ts:301](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L301)

___

### angleWithSep

▸ **angleWithSep**(`x`, `y`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`number`

#### Defined in

[src/Point.ts:312](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L312)

___

### clone

▸ **clone**(): [`Point`](Point.md)

Clone this point, returning a new point that can be modified
without affecting the old one.

#### Returns

[`Point`](Point.md)

the clone

#### Defined in

[src/Point.ts:112](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L112)

___

### dist

▸ **dist**(`p`): `number`

Calculate the distance from this point to another point

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `any` | the other point |

#### Returns

`number`

distance

#### Defined in

[src/Point.ts:261](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L261)

___

### distSqr

▸ **distSqr**(`p`): `number`

Calculate the distance from this point to another point,
without the square root step. Useful if you're comparing
relative distances.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | `any` | the other point |

#### Returns

`number`

distance

#### Defined in

[src/Point.ts:272](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L272)

___

### div

▸ **div**(`k`): [`Point`](Point.md)

Divide this point's x & y coordinates by a factor,
yielding a new point.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `k` | `number` | factor |

#### Returns

[`Point`](Point.md)

output point

#### Defined in

[src/Point.ts:172](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L172)

___

### divByPoint

▸ **divByPoint**(`p`): [`Point`](Point.md)

Divide this point's x & y coordinates by point,
yielding a new point.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | [`Point`](Point.md) | the other point |

#### Returns

[`Point`](Point.md)

output point

#### Defined in

[src/Point.ts:152](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L152)

___

### equals

▸ **equals**(`other`): `boolean`

Judge whether this point is equal to another point, returning
true or false.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `other` | `any` | the other point |

#### Returns

`boolean`

whether the points are equal

#### Defined in

[src/Point.ts:252](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L252)

___

### mag

▸ **mag**(): `number`

Return the magnitude of this point: this is the Euclidean
distance from the 0, 0 coordinate to this point's x and y
coordinates.

#### Returns

`number`

magnitude

#### Defined in

[src/Point.ts:242](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L242)

___

### matMult

▸ **matMult**(`m`): [`Point`](Point.md)

Multiply this point by a 4x1 transformation matrix

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `m` | [`Matrix2`](../README.md#matrix2) | transformation matrix |

#### Returns

[`Point`](Point.md)

output point

#### Defined in

[src/Point.ts:202](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L202)

___

### mult

▸ **mult**(`k`): [`Point`](Point.md)

Multiply this point's x & y coordinates by a factor,
yielding a new point.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `k` | `number` | factor |

#### Returns

[`Point`](Point.md)

output point

#### Defined in

[src/Point.ts:162](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L162)

___

### multByPoint

▸ **multByPoint**(`p`): [`Point`](Point.md)

Multiply this point's x & y coordinates by point,
yielding a new point.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | [`Point`](Point.md) | the other point |

#### Returns

[`Point`](Point.md)

output point

#### Defined in

[src/Point.ts:142](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L142)

___

### perp

▸ **perp**(): [`Point`](Point.md)

Compute a perpendicular point, where the new y coordinate
is the old x coordinate and the new x coordinate is the old y
coordinate multiplied by -1

#### Returns

[`Point`](Point.md)

perpendicular point

#### Defined in

[src/Point.ts:223](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L223)

___

### rotate

▸ **rotate**(`a`): [`Point`](Point.md)

Rotate this point around the 0, 0 origin by an angle a,
given in radians

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | `number` | angle to rotate around, in radians |

#### Returns

[`Point`](Point.md)

output point

#### Defined in

[src/Point.ts:182](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L182)

___

### rotateAround

▸ **rotateAround**(`a`, `p`): [`Point`](Point.md)

Rotate this point around p point by an angle a,
given in radians

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | `number` | angle to rotate around, in radians |
| `p` | [`Point`](Point.md) | Point to rotate around |

#### Returns

[`Point`](Point.md)

output point

#### Defined in

[src/Point.ts:193](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L193)

___

### round

▸ **round**(): [`Point`](Point.md)

Return a version of this point with the x & y coordinates
rounded to integers.

#### Returns

[`Point`](Point.md)

rounded point

#### Defined in

[src/Point.ts:232](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L232)

___

### sub

▸ **sub**(`p`): [`Point`](Point.md)

Subtract this point's x & y coordinates to from point,
yielding a new point.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | [`Point`](Point.md) | the other point |

#### Returns

[`Point`](Point.md)

output point

#### Defined in

[src/Point.ts:132](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L132)

___

### unit

▸ **unit**(): [`Point`](Point.md)

Calculate this point but as a unit vector from 0, 0, meaning
that the distance from the resulting point to the 0, 0
coordinate will be equal to 1 and the angle from the resulting
point to the 0, 0 coordinate will be the same as before.

#### Returns

[`Point`](Point.md)

unit vector point

#### Defined in

[src/Point.ts:213](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L213)

___

### convert

▸ `Static` **convert**(`a`): [`Point`](Point.md)

Construct a point from an array if necessary, otherwise if the input
is already a Point, or an unknown type, return it unchanged

**`Example`**

```ts
// this
var point = Point.convert([0, 1]);
// is equivalent to
var point = new Point(0, 1);
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | `number`[] \| [`Point`](Point.md) | any kind of input value |

#### Returns

[`Point`](Point.md)

constructed point, or passed-through value.

#### Defined in

[src/Point.ts:327](https://github.com/maptiler/maptiler-sdk-js/blob/4f983e8/src/Point.ts#L327)
