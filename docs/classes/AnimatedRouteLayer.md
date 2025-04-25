[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / AnimatedRouteLayer

# Class: AnimatedRouteLayer

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:154](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L154)

This layer allows you to create animated paths on a map by providing keyframes or a GeoJSON source
with route data. The animation can control both the visual appearance of the path (using color transitions)
and optionally animate the camera to follow along the route path.
 AnimatedRouteLayer

## Example

```typescript
// Create an animated route layer using a GeoJSON source
const animatedRoute = new AnimatedRouteLayer({
  source: {
    id: 'route-source',
    layerID: 'route-layer',
    featureSetIndex: 0
  },
  duration: 5000,
  pathStrokeAnimation: {
    activeColor: [0, 255, 0, 1],
    inactiveColor: [100, 100, 100, 0.5]
  },
  autoplay: true
});

// Add the layer to the map
map.addLayer(animatedRoute);

// Control playback
animatedRoute.play();
animatedRoute.pause();
```

## Remarks

The animation can be configured using either explicit keyframes or a GeoJSON source.
When using a GeoJSON source, the feature can include special properties that control
animation behavior:
- `@duration`: Animation duration in milliseconds
- `@iterations`: Number of times to repeat the animation
- `@delay`: Delay before starting animation in milliseconds
- `@autoplay`: Whether to start the animation automatically

Only one AnimatedRouteLayer can be active at a time on a map.

## Implements

- `CustomLayerInterface`

## Constructors

### Constructor

> **new AnimatedRouteLayer**(`__namedParameters`): `AnimatedRouteLayer`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:214](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L214)

#### Parameters

##### \_\_namedParameters

[`AnimatedRouteLayerOptions`](../type-aliases/AnimatedRouteLayerOptions.md)

#### Returns

`AnimatedRouteLayer`

## Properties

### animationInstance

> **animationInstance**: [`MaptilerAnimation`](MaptilerAnimation.md)

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:161](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L161)

The MaptilerAnimation instance that handles the animation

***

### id

> `readonly` **id**: `string`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:156](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L156)

Unique ID for the layer

#### Implementation of

`CustomLayerInterface.id`

***

### type

> `readonly` **type**: `"custom"` = `"custom"`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:158](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L158)

The layer's type. Must be `"custom"`.

#### Implementation of

`CustomLayerInterface.type`

## Methods

### addEventListener()

> **addEventListener**(`type`, `callback`): `AnimatedRouteLayer`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:325](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L325)

Adds an event listener to the animation instance.

#### Parameters

##### type

[`AnimationEventTypes`](../enumerations/AnimationEventTypes.md)

The type of event to listen for

##### callback

[`FrameCallback`](../type-aliases/FrameCallback.md)

The callback function to execute when the event occurs

#### Returns

`AnimatedRouteLayer`

***

### frameAdvance()

> **frameAdvance**(): `AnimatedRouteLayer`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:312](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L312)

This method is used to manually advance the animation

#### Returns

`AnimatedRouteLayer`

- The current instance of AnimatedRouteLayer

***

### getMaptilerAnimationOptions()

> **getMaptilerAnimationOptions**(): `Promise`\<[`MaptilerAnimationOptions`](../interfaces/MaptilerAnimationOptions.md) & `object`\>

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:429](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L429)

Gets the source GeoJSON data from the map instance, parses it, and returns the animation options.

#### Returns

`Promise`\<[`MaptilerAnimationOptions`](../interfaces/MaptilerAnimationOptions.md) & `object`\>

- The MaptilerAnimation constructor options

***

### onAdd()

> **onAdd**(`map`): `Promise`\<`void`\>

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:277](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L277)

This method is called when the layer is added to the map.
It initializes the animation instance and sets up event listeners.

#### Parameters

##### map

`Map$1`

The map instance

#### Returns

`Promise`\<`void`\>

#### Implementation of

`CustomLayerInterface.onAdd`

***

### onRemove()

> **onRemove**(): `void`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:502](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L502)

This method is called when the layer is removed from the map.
It destroys the animation instance.

#### Returns

`void`

#### Implementation of

`CustomLayerInterface.onRemove`

***

### pause()

> **pause**(): `AnimatedRouteLayer`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:413](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L413)

Stops the animation.

#### Returns

`AnimatedRouteLayer`

- The current instance of AnimatedRouteLayer

***

### play()

> **play**(): `AnimatedRouteLayer`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:397](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L397)

Plays the animation.

#### Returns

`AnimatedRouteLayer`

- The current instance of AnimatedRouteLayer

***

### removeEventListener()

> **removeEventListener**(`type`, `callback`): `AnimatedRouteLayer`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:341](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L341)

Removes an event listener from the animation instance.

#### Parameters

##### type

[`AnimationEventTypes`](../enumerations/AnimationEventTypes.md)

The type of event to remove

##### callback

[`FrameCallback`](../type-aliases/FrameCallback.md)

The callback function to remove

#### Returns

`AnimatedRouteLayer`

***

### render()

> **render**(): `void`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:510](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L510)

This method is called to render the layer.
It is a no-op for this layer.

#### Returns

`void`

#### Implementation of

`CustomLayerInterface.render`
