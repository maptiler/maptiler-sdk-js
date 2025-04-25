[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MaptilerTerrainControl

# Class: MaptilerTerrainControl

Defined in: [src/controls/MaptilerTerrainControl.ts:11](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerTerrainControl.ts#L11)

A `MaptilerTerrainControl` control adds a button to turn terrain on and off
by triggering the terrain logic that is already deployed in the Map object.

## Implements

- `IControl`

## Constructors

### Constructor

> **new MaptilerTerrainControl**(): `MaptilerTerrainControl`

Defined in: [src/controls/MaptilerTerrainControl.ts:16](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerTerrainControl.ts#L16)

#### Returns

`MaptilerTerrainControl`

## Properties

### \_container

> **\_container**: `HTMLElement`

Defined in: [src/controls/MaptilerTerrainControl.ts:13](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerTerrainControl.ts#L13)

***

### \_map

> **\_map**: [`Map`](Map.md)

Defined in: [src/controls/MaptilerTerrainControl.ts:12](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerTerrainControl.ts#L12)

***

### \_terrainButton

> **\_terrainButton**: `HTMLButtonElement`

Defined in: [src/controls/MaptilerTerrainControl.ts:14](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerTerrainControl.ts#L14)

## Methods

### \_toggleTerrain()

> **\_toggleTerrain**(): `void`

Defined in: [src/controls/MaptilerTerrainControl.ts:40](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerTerrainControl.ts#L40)

#### Returns

`void`

***

### \_updateTerrainIcon()

> **\_updateTerrainIcon**(): `void`

Defined in: [src/controls/MaptilerTerrainControl.ts:50](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerTerrainControl.ts#L50)

#### Returns

`void`

***

### onAdd()

> **onAdd**(`map`): `HTMLElement`

Defined in: [src/controls/MaptilerTerrainControl.ts:20](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerTerrainControl.ts#L20)

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

Defined in: [src/controls/MaptilerTerrainControl.ts:33](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerTerrainControl.ts#L33)

Unregister a control on the map and give it a chance to detach event listeners
and resources. This method is called by Map#removeControl
internally.

#### Returns

`void`

#### Implementation of

`IControl.onRemove`
