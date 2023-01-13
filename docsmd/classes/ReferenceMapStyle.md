[MapTiler SDK](../README.md) / ReferenceMapStyle

# Class: ReferenceMapStyle

An instance of reference style contains a list of StyleVariants ordered by relevance

## Table of contents

### Constructors

- [constructor](ReferenceMapStyle.md#constructor)

### Methods

- [addVariant](ReferenceMapStyle.md#addvariant)
- [getDefaultVariant](ReferenceMapStyle.md#getdefaultvariant)
- [getId](ReferenceMapStyle.md#getid)
- [getName](ReferenceMapStyle.md#getname)
- [getVariant](ReferenceMapStyle.md#getvariant)
- [getVariants](ReferenceMapStyle.md#getvariants)
- [hasVariant](ReferenceMapStyle.md#hasvariant)

## Constructors

### constructor

• **new ReferenceMapStyle**(`name`, `id`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Human-friendly name of this reference style |
| `id` | `string` | ID of this reference style |

#### Defined in

[src/mapstyle/mapstyle.ts:195](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L195)

## Methods

### addVariant

▸ **addVariant**(`v`): `void`

Add a variant to _this_ reference style

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | [`MapStyleVariant`](MapStyleVariant.md) |

#### Returns

`void`

#### Defined in

[src/mapstyle/mapstyle.ts:227](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L227)

___

### getDefaultVariant

▸ **getDefaultVariant**(): [`MapStyleVariant`](MapStyleVariant.md)

Get the defualt variant for this reference style

#### Returns

[`MapStyleVariant`](MapStyleVariant.md)

#### Defined in

[src/mapstyle/mapstyle.ts:265](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L265)

___

### getId

▸ **getId**(): `string`

Get the id of _this_ reference style

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:219](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L219)

___

### getName

▸ **getName**(): `string`

Get the human-friendly name of this reference style

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:211](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L211)

___

### getVariant

▸ **getVariant**(`variantType`): [`MapStyleVariant`](MapStyleVariant.md)

Get a given variant. If the given type of variant does not exist for this reference style,
then the most relevant default variant is returned instead

#### Parameters

| Name | Type |
| :------ | :------ |
| `variantType` | `string` |

#### Returns

[`MapStyleVariant`](MapStyleVariant.md)

#### Defined in

[src/mapstyle/mapstyle.ts:247](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L247)

___

### getVariants

▸ **getVariants**(): [`MapStyleVariant`](MapStyleVariant.md)[]

Get the list of variants for this reference style

#### Returns

[`MapStyleVariant`](MapStyleVariant.md)[]

#### Defined in

[src/mapstyle/mapstyle.ts:257](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L257)

___

### hasVariant

▸ **hasVariant**(`variantType`): `boolean`

Check if a given variant type exists for this reference style

#### Parameters

| Name | Type |
| :------ | :------ |
| `variantType` | `string` |

#### Returns

`boolean`

#### Defined in

[src/mapstyle/mapstyle.ts:237](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L237)
