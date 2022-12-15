[MapTiler SDK](../README.md) / MapStyleVariation

# Class: MapStyleVariation

An instance of MapStyleVariation contains information about a style to use that belong to a reference style

## Table of contents

### Constructors

- [constructor](MapStyleVariation.md#constructor)

### Methods

- [getDescription](MapStyleVariation.md#getdescription)
- [getFullName](MapStyleVariation.md#getfullname)
- [getId](MapStyleVariation.md#getid)
- [getImageURL](MapStyleVariation.md#getimageurl)
- [getName](MapStyleVariation.md#getname)
- [getReferenceStyle](MapStyleVariation.md#getreferencestyle)
- [getType](MapStyleVariation.md#gettype)
- [getUsableStyle](MapStyleVariation.md#getusablestyle)
- [getVariation](MapStyleVariation.md#getvariation)
- [getVariations](MapStyleVariation.md#getvariations)
- [hasVariation](MapStyleVariation.md#hasvariation)

## Constructors

### constructor

• **new MapStyleVariation**(`name`, `variationType`, `id`, `referenceStyle`, `description`, `imageURL`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Human-friendly name |
| `variationType` | `string` | Variation name the variation is addressed to from its reference style: `MapStyle.REFERNCE_STYLE_NAME.VARIATION_TYPE` |
| `id` | `string` | MapTiler Cloud id |
| `referenceStyle` | [`ReferenceMapStyle`](ReferenceMapStyle.md) | Reference map style, used to retrieve sibling variations |
| `description` | `string` | Human-friendly description |
| `imageURL` | `string` | URL to an image describing the style variation |

#### Defined in

[src/mapstyle/mapstyle.ts:55](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L55)

## Methods

### getDescription

▸ **getDescription**(): `string`

Get the human-friendly description

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:129](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L129)

___

### getFullName

▸ **getFullName**(): `string`

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:95](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L95)

___

### getId

▸ **getId**(): `string`

Get the MapTiler Cloud id

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:122](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L122)

___

### getImageURL

▸ **getImageURL**(): `string`

Get the image URL that represent _this_ variation

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:173](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L173)

___

### getName

▸ **getName**(): `string`

Get the human-friendly name

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:91](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L91)

___

### getReferenceStyle

▸ **getReferenceStyle**(): [`ReferenceMapStyle`](ReferenceMapStyle.md)

Get the reference style this variation belongs to

#### Returns

[`ReferenceMapStyle`](ReferenceMapStyle.md)

#### Defined in

[src/mapstyle/mapstyle.ts:137](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L137)

___

### getType

▸ **getType**(): `string`

Get the variation type (eg. "DEFAULT", "DARK", "PASTEL", etc.)

#### Returns

`string`

#### Defined in

[src/mapstyle/mapstyle.ts:103](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L103)

___

### getUsableStyle

▸ **getUsableStyle**(): `string` \| `StyleSpecification`

Get the style as usable by MapLibre, a string (URL) or a plain style description (StyleSpecification)

#### Returns

`string` \| `StyleSpecification`

#### Defined in

[src/mapstyle/mapstyle.ts:111](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L111)

___

### getVariation

▸ **getVariation**(`variationType`): [`MapStyleVariation`](MapStyleVariation.md)

Retrieve the variation of a given type. If not found, will return the "DEFAULT" variation.
(eg. _this_ "DARK" variation does not have any "PASTEL" variation, then the "DEFAULT" is returned)

#### Parameters

| Name | Type |
| :------ | :------ |
| `variationType` | `string` |

#### Returns

[`MapStyleVariation`](MapStyleVariation.md)

#### Defined in

[src/mapstyle/mapstyle.ts:157](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L157)

___

### getVariations

▸ **getVariations**(): [`MapStyleVariation`](MapStyleVariation.md)[]

Get all the variations for _this_ variations, except _this_ current one

#### Returns

[`MapStyleVariation`](MapStyleVariation.md)[]

#### Defined in

[src/mapstyle/mapstyle.ts:165](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L165)

___

### hasVariation

▸ **hasVariation**(`variationType`): `boolean`

Check if a variation of a given type exists for _this_ variations
(eg. if this is a "DARK", then we can check if there is a "LIGHT" variation of it)

#### Parameters

| Name | Type |
| :------ | :------ |
| `variationType` | `string` |

#### Returns

`boolean`

#### Defined in

[src/mapstyle/mapstyle.ts:147](https://github.com/maptiler/maptiler-sdk-js/blob/1987156/src/mapstyle/mapstyle.ts#L147)
