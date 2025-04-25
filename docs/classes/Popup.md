[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / Popup

# Class: Popup

Defined in: [src/MLAdapters/Popup.ts:9](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/MLAdapters/Popup.ts#L9)

## Extends

- `Popup`

## Constructors

### Constructor

> **new Popup**(`options?`): `Popup`

Defined in: node\_modules/maplibre-gl/dist/maplibre-gl.d.ts:12540

#### Parameters

##### options?

`PopupOptions`

the options

#### Returns

`Popup`

#### Inherited from

`maplibregl.Popup.constructor`

## Methods

### addTo()

> **addTo**(`map`): `this`

Defined in: [src/MLAdapters/Popup.ts:10](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/MLAdapters/Popup.ts#L10)

Adds the popup to a map.

#### Parameters

##### map

The MapLibre GL JS map to add the popup to.

[`Map`](Map.md) | `Map$1`

#### Returns

`this`

#### Example

```ts
new Popup()
  .setLngLat([0, 0])
  .setHTML("<h1>Null Island</h1>")
  .addTo(map);
```

#### See

 - [Display a popup](https://maplibre.org/maplibre-gl-js/docs/examples/popup/)
 - [Display a popup on hover](https://maplibre.org/maplibre-gl-js/docs/examples/popup-on-hover/)
 - [Display a popup on click](https://maplibre.org/maplibre-gl-js/docs/examples/popup-on-click/)
 - [Show polygon information on click](https://maplibre.org/maplibre-gl-js/docs/examples/polygon-popup-on-click/)

#### Overrides

`maplibregl.Popup.addTo`
