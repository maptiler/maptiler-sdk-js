[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MaptilerLogoControl

# Class: MaptilerLogoControl

Defined in: [src/controls/MaptilerLogoControl.ts:15](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerLogoControl.ts#L15)

This LogoControl extends the MapLibre LogoControl but instead can use any image URL and
any link URL. By default this is using MapTiler logo and URL.

## Extends

- [`LogoControl`](LogoControl.md)

## Constructors

### Constructor

> **new MaptilerLogoControl**(`options`): `MaptilerLogoControl`

Defined in: [src/controls/MaptilerLogoControl.ts:20](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerLogoControl.ts#L20)

#### Parameters

##### options

`LogoControlOptions` = `{}`

#### Returns

`MaptilerLogoControl`

#### Overrides

[`LogoControl`](LogoControl.md).[`constructor`](LogoControl.md#constructor)

## Properties

### \_compact

> **\_compact**: `boolean`

Defined in: [src/controls/MaptilerLogoControl.ts:16](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerLogoControl.ts#L16)

#### Overrides

`LogoControl._compact`

## Methods

### onAdd()

> **onAdd**(`map`): `HTMLElement`

Defined in: [src/controls/MaptilerLogoControl.ts:27](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerLogoControl.ts#L27)

IControl.onAdd

#### Parameters

##### map

[`Map`](Map.md)

#### Returns

`HTMLElement`

#### Overrides

[`LogoControl`](LogoControl.md).[`onAdd`](LogoControl.md#onadd)
