[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MaptilerNavigationControl

# Class: MaptilerNavigationControl

Defined in: [src/controls/MaptilerNavigationControl.ts:8](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerNavigationControl.ts#L8)

## Extends

- [`NavigationControl`](NavigationControl.md)

## Constructors

### Constructor

> **new MaptilerNavigationControl**(`options`): `MaptilerNavigationControl`

Defined in: [src/controls/MaptilerNavigationControl.ts:9](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerNavigationControl.ts#L9)

#### Parameters

##### options

`NavigationControlOptions` = `{}`

#### Returns

`MaptilerNavigationControl`

#### Overrides

[`NavigationControl`](NavigationControl.md).[`constructor`](NavigationControl.md#constructor)

## Methods

### \_createButton()

> **\_createButton**(`className`, `fn`): `HTMLButtonElementPlus`

Defined in: [src/controls/MaptilerNavigationControl.ts:41](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerNavigationControl.ts#L41)

Overloading: the button now stores its click callback so that we can later on delete it and replace it

#### Parameters

##### className

`string`

##### fn

(`e?`) => `unknown`

#### Returns

`HTMLButtonElementPlus`

#### Overrides

`NavigationControl._createButton`

***

### \_rotateCompassArrow()

> **\_rotateCompassArrow**(): `void`

Defined in: [src/controls/MaptilerNavigationControl.ts:50](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/controls/MaptilerNavigationControl.ts#L50)

Overloading: Limit how flat the compass icon can get

#### Returns

`void`

#### Overrides

`NavigationControl._rotateCompassArrow`

***

### onAdd()

> **onAdd**(`map`): `HTMLElement`

Defined in: [src/MLAdapters/NavigationControl.ts:10](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/MLAdapters/NavigationControl.ts#L10)

IControl.onAdd

#### Parameters

##### map

[`Map`](Map.md) | `Map$1`

#### Returns

`HTMLElement`

#### Inherited from

[`NavigationControl`](NavigationControl.md).[`onAdd`](NavigationControl.md#onadd)
