[MapTiler SDK - v1.0.7](../README.md) / MaptilerGeolocateControl

# Class: MaptilerGeolocateControl

The MaptilerGeolocateControl is an extension of the original GeolocateControl
with a few changes. In this version, the active mode persists as long as the
location is still centered. This means it's robust to rotation, pitch and zoom.

## Hierarchy

- `GeolocateControl`

  ↳ **`MaptilerGeolocateControl`**

## Table of contents

### Constructors

- [constructor](MaptilerGeolocateControl.md#constructor)

### Methods

- [\_onZoom](MaptilerGeolocateControl.md#_onzoom)
- [\_setupUI](MaptilerGeolocateControl.md#_setupui)
- [\_updateCircleRadius](MaptilerGeolocateControl.md#_updatecircleradius)

## Constructors

### constructor

• **new MaptilerGeolocateControl**(`options`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `GeolocateOptions` |

#### Inherited from

GeolocateControl.constructor

#### Defined in

node_modules/maplibre-gl/dist/maplibre-gl.d.ts:11658

## Methods

### \_onZoom

▸ **_onZoom**(): `void`

#### Returns

`void`

#### Overrides

GeolocateControl.\_onZoom

#### Defined in

[src/MaptilerGeolocateControl.ts:198](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/MaptilerGeolocateControl.ts#L198)

___

### \_setupUI

▸ **_setupUI**(`supported`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `supported` | `boolean` |

#### Returns

`void`

#### Overrides

GeolocateControl.\_setupUI

#### Defined in

[src/MaptilerGeolocateControl.ts:77](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/MaptilerGeolocateControl.ts#L77)

___

### \_updateCircleRadius

▸ **_updateCircleRadius**(): `void`

#### Returns

`void`

#### Overrides

GeolocateControl.\_updateCircleRadius

#### Defined in

[src/MaptilerGeolocateControl.ts:172](https://github.com/maptiler/maptiler-sdk-js/blob/477d058/src/MaptilerGeolocateControl.ts#L172)
