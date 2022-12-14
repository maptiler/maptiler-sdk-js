[MapTiler SDK](../README.md) / ReferenceMapStyle

# Class: ReferenceMapStyle

An instance of reference style contains a list of StyleVariations ordered by relevance

## Table of contents

### Constructors

- [constructor](ReferenceMapStyle.md#constructor)

### Methods

- [addVariation](ReferenceMapStyle.md#addvariation)
- [getDefaultVariation](ReferenceMapStyle.md#getdefaultvariation)
- [getId](ReferenceMapStyle.md#getid)
- [getName](ReferenceMapStyle.md#getname)
- [getVariation](ReferenceMapStyle.md#getvariation)
- [getVariations](ReferenceMapStyle.md#getvariations)
- [hasVariation](ReferenceMapStyle.md#hasvariation)

## Constructors

### constructor

• **new ReferenceMapStyle**(`name`, `id`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Human-friendly name of this reference style |
| `id` | `string` | ID of this reference style |

#### Defined in

[src/mapstyle/mapstyle.ts:192](https://github.com/maptiler/maptiler-sdk-js/blob/1c936a5/src/mapstyle/mapstyle.ts#L192)

## Methods

### addVariation

▸ **addVariation**(`v`): `void`

Add a variation to _this_ reference style

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`MapStyleVariation`](MapStyleVariation.md) |

#### Returns

`void`

#### Defined in

[src/mapstyle/mapstyle.ts:224](https://github.com/maptiler/maptiler-sdk-js/blob/1c936a5/src/mapstyle/mapstyle.ts#L224)

___

### getDefaultVariation

▸ **getDefaultVariation**(): [`MapStyleVariation`](MapStyleVariation.md)

Get the defualt variation for this reference style

#### Returns

[`MapStyleVariation`](MapStyleVariation.md)

#### Defined in

[src/mapstyle/mapstyle.ts:262](https://github.com/maptiler/maptiler-sdk-js/blob/1c936a5/src/mapstyle/mapstyle.ts#L262)

___

### getId

▸ **getId**(): `string`

Get the id of _this_ reference style

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:216](https://github.com/maptiler/maptiler-sdk-js/blob/1c936a5/src/mapstyle/mapstyle.ts#L216)

___

### getName

▸ **getName**(): `string`

Get the human-friendly name of this reference style

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:208](https://github.com/maptiler/maptiler-sdk-js/blob/1c936a5/src/mapstyle/mapstyle.ts#L208)

___

### getVariation

▸ **getVariation**(`variationType`): [`MapStyleVariation`](MapStyleVariation.md)

Get a given variation. If the given type of variation does not exist for this reference style,
then the most relevant default variation is returned instead

#### Parameters

| Name | Type |
| :------ | :------ |
| `variationType` | `string` |

#### Returns

[`MapStyleVariation`](MapStyleVariation.md)

#### Defined in

[src/mapstyle/mapstyle.ts:244](https://github.com/maptiler/maptiler-sdk-js/blob/1c936a5/src/mapstyle/mapstyle.ts#L244)

___

### getVariations

▸ **getVariations**(): [`MapStyleVariation`](MapStyleVariation.md)[]

Get the list of variations for this reference style

#### Returns

[`MapStyleVariation`](MapStyleVariation.md)[]

#### Defined in

[src/mapstyle/mapstyle.ts:254](https://github.com/maptiler/maptiler-sdk-js/blob/1c936a5/src/mapstyle/mapstyle.ts#L254)

___

### hasVariation

▸ **hasVariation**(`variationType`): `boolean`

Check if a given variation type exists for this reference style

#### Parameters

| Name | Type |
| :------ | :------ |
| `variationType` | `string` |

#### Returns

`boolean`

#### Defined in

[src/mapstyle/mapstyle.ts:234](https://github.com/maptiler/maptiler-sdk-js/blob/1c936a5/src/mapstyle/mapstyle.ts#L234)
