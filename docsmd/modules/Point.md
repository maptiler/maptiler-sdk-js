[MapTiler SDK](../README.md) / Point

# Namespace: Point

## Table of contents

### Functions

- [convert](Point.md#convert)

## Functions

### convert

▸ **convert**(`a`): `any`

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
| `a` | `any` | any kind of input value |

#### Returns

`any`

constructed point, or passed-through value.

#### Defined in

[src/Point.ts:326](https://github.com/maptiler/maptiler-sdk-js/blob/652e417/src/Point.ts#L326)
