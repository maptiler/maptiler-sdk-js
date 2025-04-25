[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MaptilerGeolocateControl

# Class: MaptilerGeolocateControl

Defined in: [src/controls/MaptilerGeolocateControl.ts:18](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerGeolocateControl.ts#L18)

The MaptilerGeolocateControl is an extension of the original GeolocateControl
with a few changes. In this version, the active mode persists as long as the
location is still centered. This means it's robust to rotation, pitch and zoom.

## Extends

- [`GeolocateControl`](GeolocateControl.md)

## Constructors

### Constructor

> **new MaptilerGeolocateControl**(`options`): `MaptilerGeolocateControl`

Defined in: node\_modules/maplibre-gl/dist/maplibre-gl.d.ts:13328

#### Parameters

##### options

`GeolocateControlOptions`

the control's options

#### Returns

`MaptilerGeolocateControl`

#### Inherited from

[`GeolocateControl`](GeolocateControl.md).[`constructor`](GeolocateControl.md#constructor)

## Methods

### \_finishSetupUI()

> **\_finishSetupUI**(`supported`): `void`

Defined in: [src/controls/MaptilerGeolocateControl.ts:77](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerGeolocateControl.ts#L77)

#### Parameters

##### supported

`boolean`

#### Returns

`void`

#### Overrides

`GeolocateControl._finishSetupUI`

***

### \_onZoom()

> **\_onZoom**(): `void`

Defined in: [src/controls/MaptilerGeolocateControl.ts:161](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerGeolocateControl.ts#L161)

#### Returns

`void`

#### Overrides

`GeolocateControl._onZoom`

***

### \_setErrorState()

> **\_setErrorState**(): `void`

Defined in: [src/controls/MaptilerGeolocateControl.ts:170](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerGeolocateControl.ts#L170)

#### Returns

`void`

#### Overrides

`GeolocateControl._setErrorState`

***

### \_updateCircleRadius()

> **\_updateCircleRadius**(): `void`

Defined in: [src/controls/MaptilerGeolocateControl.ts:144](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerGeolocateControl.ts#L144)

#### Returns

`void`

#### Overrides

`GeolocateControl._updateCircleRadius`

***

### onAdd()

> **onAdd**(`map`): `HTMLElement`

Defined in: [src/MLAdapters/GeolocateControl.ts:10](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/MLAdapters/GeolocateControl.ts#L10)

IControl.onAdd

#### Parameters

##### map

[`Map`](Map.md) | `Map$1`

#### Returns

`HTMLElement`

#### Inherited from

[`GeolocateControl`](GeolocateControl.md).[`onAdd`](GeolocateControl.md#onadd)
