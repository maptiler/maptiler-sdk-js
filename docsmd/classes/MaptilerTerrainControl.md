[MapTiler SDK - v1.0.8](../README.md) / MaptilerTerrainControl

# Class: MaptilerTerrainControl

A `MaptilerTerrainControl` control adds a button to turn terrain on and off
by triggering the terrain logic that is already deployed in the Map object.

## Implements

- `IControl`

## Table of contents

### Constructors

- [constructor](MaptilerTerrainControl.md#constructor)

### Properties

- [\_container](MaptilerTerrainControl.md#_container)
- [\_map](MaptilerTerrainControl.md#_map)
- [\_terrainButton](MaptilerTerrainControl.md#_terrainbutton)

### Methods

- [\_toggleTerrain](MaptilerTerrainControl.md#_toggleterrain)
- [\_updateTerrainIcon](MaptilerTerrainControl.md#_updateterrainicon)
- [onAdd](MaptilerTerrainControl.md#onadd)
- [onRemove](MaptilerTerrainControl.md#onremove)

## Constructors

### constructor

• **new MaptilerTerrainControl**()

#### Defined in

[src/MaptilerTerrainControl.ts:15](https://github.com/maptiler/maptiler-sdk-js/blob/6811710/src/MaptilerTerrainControl.ts#L15)

## Properties

### \_container

• **\_container**: `HTMLElement`

#### Defined in

[src/MaptilerTerrainControl.ts:12](https://github.com/maptiler/maptiler-sdk-js/blob/6811710/src/MaptilerTerrainControl.ts#L12)

___

### \_map

• **\_map**: [`Map`](Map.md)

#### Defined in

[src/MaptilerTerrainControl.ts:11](https://github.com/maptiler/maptiler-sdk-js/blob/6811710/src/MaptilerTerrainControl.ts#L11)

___

### \_terrainButton

• **\_terrainButton**: `HTMLButtonElement`

#### Defined in

[src/MaptilerTerrainControl.ts:13](https://github.com/maptiler/maptiler-sdk-js/blob/6811710/src/MaptilerTerrainControl.ts#L13)

## Methods

### \_toggleTerrain

▸ **_toggleTerrain**(): `void`

#### Returns

`void`

#### Defined in

[src/MaptilerTerrainControl.ts:45](https://github.com/maptiler/maptiler-sdk-js/blob/6811710/src/MaptilerTerrainControl.ts#L45)

___

### \_updateTerrainIcon

▸ **_updateTerrainIcon**(): `void`

#### Returns

`void`

#### Defined in

[src/MaptilerTerrainControl.ts:55](https://github.com/maptiler/maptiler-sdk-js/blob/6811710/src/MaptilerTerrainControl.ts#L55)

___

### onAdd

▸ **onAdd**(`map`): `HTMLElement`

#### Parameters

| Name | Type |
| :------ | :------ |
| `map` | [`Map`](Map.md) |

#### Returns

`HTMLElement`

#### Implementation of

maplibregl.IControl.onAdd

#### Defined in

[src/MaptilerTerrainControl.ts:19](https://github.com/maptiler/maptiler-sdk-js/blob/6811710/src/MaptilerTerrainControl.ts#L19)

___

### onRemove

▸ **onRemove**(): `void`

#### Returns

`void`

#### Implementation of

maplibregl.IControl.onRemove

#### Defined in

[src/MaptilerTerrainControl.ts:39](https://github.com/maptiler/maptiler-sdk-js/blob/6811710/src/MaptilerTerrainControl.ts#L39)
