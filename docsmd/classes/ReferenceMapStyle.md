[MapTiler SDK](../README.md) / ReferenceMapStyle

# Class: ReferenceMapStyle

An instance of reference style contains a list of StyleVariations ordered by relevance

## Table of contents

### Constructors

- [constructor](ReferenceMapStyle.md#constructor)

### Methods

- [addVariation](ReferenceMapStyle.md#addvariation)
- [getDefaultVariation](ReferenceMapStyle.md#getdefaultvariation)
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

[src/mapstyle/mapstyle.ts:188](https://github.com/maptiler/maptiler-sdk-js/blob/31aa1aa/src/mapstyle/mapstyle.ts#L188)

## Methods

### addVariation

▸ **addVariation**(`v`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`MapStyleVariation`](MapStyleVariation.md) |

#### Returns

`void`

#### Defined in

[src/mapstyle/mapstyle.ts:200](https://github.com/maptiler/maptiler-sdk-js/blob/31aa1aa/src/mapstyle/mapstyle.ts#L200)

___

### getDefaultVariation

▸ **getDefaultVariation**(): [`MapStyleVariation`](MapStyleVariation.md)

Get the defualt variation for this reference style

#### Returns

[`MapStyleVariation`](MapStyleVariation.md)

#### Defined in

[src/mapstyle/mapstyle.ts:238](https://github.com/maptiler/maptiler-sdk-js/blob/31aa1aa/src/mapstyle/mapstyle.ts#L238)

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

[src/mapstyle/mapstyle.ts:220](https://github.com/maptiler/maptiler-sdk-js/blob/31aa1aa/src/mapstyle/mapstyle.ts#L220)

___

### getVariations

▸ **getVariations**(): [`MapStyleVariation`](MapStyleVariation.md)[]

Get the list of variations for this reference style

#### Returns

[`MapStyleVariation`](MapStyleVariation.md)[]

#### Defined in

[src/mapstyle/mapstyle.ts:230](https://github.com/maptiler/maptiler-sdk-js/blob/31aa1aa/src/mapstyle/mapstyle.ts#L230)

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

[src/mapstyle/mapstyle.ts:210](https://github.com/maptiler/maptiler-sdk-js/blob/31aa1aa/src/mapstyle/mapstyle.ts#L210)
