[MapTiler SDK](../README.md) / MapStyleVariant

# Class: MapStyleVariant

An instance of MapStyleVariant contains information about a style to use that belong to a reference style

## Table of contents

### Constructors

- [constructor](MapStyleVariant.md#constructor)

### Methods

- [getDescription](MapStyleVariant.md#getdescription)
- [getFullName](MapStyleVariant.md#getfullname)
- [getId](MapStyleVariant.md#getid)
- [getImageURL](MapStyleVariant.md#getimageurl)
- [getName](MapStyleVariant.md#getname)
- [getReferenceStyle](MapStyleVariant.md#getreferencestyle)
- [getType](MapStyleVariant.md#gettype)
- [getUsableStyle](MapStyleVariant.md#getusablestyle)
- [getVariant](MapStyleVariant.md#getvariant)
- [getVariants](MapStyleVariant.md#getvariants)
- [hasVariant](MapStyleVariant.md#hasvariant)

## Constructors

### constructor

• **new MapStyleVariant**(`name`, `variantType`, `id`, `referenceStyle`, `description`, `imageURL`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Human-friendly name |
| `variantType` | `string` | Variant name the variant is addressed to from its reference style: `MapStyle.REFERNCE_STYLE_NAME.VARIANT_TYPE` |
| `id` | `string` | MapTiler Cloud id |
| `referenceStyle` | [`ReferenceMapStyle`](ReferenceMapStyle.md) | Reference map style, used to retrieve sibling variants |
| `description` | `string` | Human-friendly description |
| `imageURL` | `string` | URL to an image describing the style variant |

#### Defined in

[src/mapstyle/mapstyle.ts:58](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L58)

## Methods

### getDescription

▸ **getDescription**(): `string`

Get the human-friendly description

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:132](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L132)

___

### getFullName

▸ **getFullName**(): `string`

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:98](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L98)

___

### getId

▸ **getId**(): `string`

Get the MapTiler Cloud id

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:125](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L125)

___

### getImageURL

▸ **getImageURL**(): `string`

Get the image URL that represent _this_ variant

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:176](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L176)

___

### getName

▸ **getName**(): `string`

Get the human-friendly name

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:94](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L94)

___

### getReferenceStyle

▸ **getReferenceStyle**(): [`ReferenceMapStyle`](ReferenceMapStyle.md)

Get the reference style this variant belongs to

#### Returns

[`ReferenceMapStyle`](ReferenceMapStyle.md)

#### Defined in

[src/mapstyle/mapstyle.ts:140](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L140)

___

### getType

▸ **getType**(): `string`

Get the variant type (eg. "DEFAULT", "DARK", "PASTEL", etc.)

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:106](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L106)

___

### getUsableStyle

▸ **getUsableStyle**(): `string` \| `StyleSpecification`

Get the style as usable by MapLibre, a string (URL) or a plain style description (StyleSpecification)

#### Returns

`string` \| `StyleSpecification`

#### Defined in

[src/mapstyle/mapstyle.ts:114](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L114)

___

### getVariant

▸ **getVariant**(`variantType`): [`MapStyleVariant`](MapStyleVariant.md)

Retrieve the variant of a given type. If not found, will return the "DEFAULT" variant.
(eg. _this_ "DARK" variant does not have any "PASTEL" variant, then the "DEFAULT" is returned)

#### Parameters

| Name | Type |
| :------ | :------ |
| `variantType` | `string` |

#### Returns

[`MapStyleVariant`](MapStyleVariant.md)

#### Defined in

[src/mapstyle/mapstyle.ts:160](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L160)

___

### getVariants

▸ **getVariants**(): [`MapStyleVariant`](MapStyleVariant.md)[]

Get all the variants for _this_ variants, except _this_ current one

#### Returns

[`MapStyleVariant`](MapStyleVariant.md)[]

#### Defined in

[src/mapstyle/mapstyle.ts:168](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L168)

___

### hasVariant

▸ **hasVariant**(`variantType`): `boolean`

Check if a variant of a given type exists for _this_ variants
(eg. if this is a "DARK", then we can check if there is a "LIGHT" variant of it)

#### Parameters

| Name | Type |
| :------ | :------ |
| `variantType` | `string` |

#### Returns

`boolean`

#### Defined in

[src/mapstyle/mapstyle.ts:150](https://github.com/maptiler/maptiler-sdk-js/blob/ff91be4/src/mapstyle/mapstyle.ts#L150)
