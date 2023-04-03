[MapTiler SDK - v1.0.9](../README.md) / MaptilerLogoControl

# Class: MaptilerLogoControl

This LogoControl extends the MapLibre LogoControl but instead can use any image URL and
any link URL. By default this is using MapTiler logo and URL.

## Hierarchy

- `LogoControl`

  ↳ **`MaptilerLogoControl`**

## Table of contents

### Constructors

- [constructor](MaptilerLogoControl.md#constructor)

### Methods

- [onAdd](MaptilerLogoControl.md#onadd)

## Constructors

### constructor

• **new MaptilerLogoControl**(`options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `LogoOptions` |

#### Overrides

maplibregl.LogoControl.constructor

#### Defined in

[src/MaptilerLogoControl.ts:19](https://github.com/maptiler/maptiler-sdk-js/blob/6e526f0/src/MaptilerLogoControl.ts#L19)

## Methods

### onAdd

▸ **onAdd**(`map`): `HTMLElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `map` | [`Map`](Map.md) |

#### Returns

`HTMLElement`

#### Overrides

maplibregl.LogoControl.onAdd

#### Defined in

[src/MaptilerLogoControl.ts:26](https://github.com/maptiler/maptiler-sdk-js/blob/6e526f0/src/MaptilerLogoControl.ts#L26)
