[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / Marker

# Class: Marker

Defined in: [src/MLAdapters/Marker.ts:9](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/MLAdapters/Marker.ts#L9)

## Extends

- `Marker`

## Constructors

### Constructor

> **new Marker**(`options?`): `Marker`

Defined in: node\_modules/maplibre-gl/dist/maplibre-gl.d.ts:12885

#### Parameters

##### options?

`MarkerOptions`

the options

#### Returns

`Marker`

#### Inherited from

`maplibregl.Marker.constructor`

## Methods

### addTo()

> **addTo**(`map`): `this`

Defined in: [src/MLAdapters/Marker.ts:10](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/MLAdapters/Marker.ts#L10)

Attaches the `Marker` to a `Map` object.

#### Parameters

##### map

The MapLibre GL JS map to add the marker to.

[`Map`](Map.md) | `Map$1`

#### Returns

`this`

#### Example

```ts
let marker = new Marker()
  .setLngLat([30.5, 50.5])
  .addTo(map); // add the marker to the map
```

#### Overrides

`maplibregl.Marker.addTo`
