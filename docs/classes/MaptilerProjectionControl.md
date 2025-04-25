[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MaptilerProjectionControl

# Class: MaptilerProjectionControl

Defined in: [src/controls/MaptilerProjectionControl.ts:8](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerProjectionControl.ts#L8)

A `MaptilerProjectionControl` control adds a button to switch from Mercator to Globe projection.

## Implements

- `IControl`

## Constructors

### Constructor

> **new MaptilerProjectionControl**(): `MaptilerProjectionControl`

#### Returns

`MaptilerProjectionControl`

## Properties

### container

> **container**: `HTMLElement`

Defined in: [src/controls/MaptilerProjectionControl.ts:10](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerProjectionControl.ts#L10)

***

### map

> **map**: [`Map`](Map.md)

Defined in: [src/controls/MaptilerProjectionControl.ts:9](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerProjectionControl.ts#L9)

***

### projectionButton

> **projectionButton**: `HTMLButtonElement`

Defined in: [src/controls/MaptilerProjectionControl.ts:11](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerProjectionControl.ts#L11)

## Methods

### onAdd()

> **onAdd**(`map`): `HTMLElement`

Defined in: [src/controls/MaptilerProjectionControl.ts:13](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerProjectionControl.ts#L13)

Register a control on the map and give it a chance to register event listeners
and resources. This method is called by Map#addControl
internally.

#### Parameters

##### map

[`Map`](Map.md)

the Map this control will be added to

#### Returns

`HTMLElement`

The control's container element. This should
be created by the control and returned by onAdd without being attached
to the DOM: the map will insert the control's element into the DOM
as necessary.

#### Implementation of

`IControl.onAdd`

***

### onRemove()

> **onRemove**(): `void`

Defined in: [src/controls/MaptilerProjectionControl.ts:27](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerProjectionControl.ts#L27)

Unregister a control on the map and give it a chance to detach event listeners
and resources. This method is called by Map#removeControl
internally.

#### Returns

`void`

#### Implementation of

`IControl.onRemove`
