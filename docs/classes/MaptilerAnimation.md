[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / MaptilerAnimation

# Class: MaptilerAnimation

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:75](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L75)

Animation controller for keyframe-based animation sequences.

MaptilerAnimation handles interpolation between keyframes, timing control,
and event dispatching during animation playback.

## Example

```typescript
const animation = new MaptilerAnimation({
  keyframes: [
    { delta: 0, props: { x: 0, y: 0 } },
    { delta: 0.5, props: { x: 50, y: 20 } },
    { delta: 1, props: { x: 100, y: 0 } }
  ],
  duration: 1000, // milliseconds
  iterations: 2
});

animation.addEventListener(AnimationEventTypes.TimeUpdate, (event) => {
  // Use interpolated property values to update something
  console.log(event.props);
});

animation.play();
```

## Remarks

The animation supports various playback controls (play, pause, stop, reset),
time manipulation, and an event system for tracking animation progress.
Properties missing in keyframes will be automatically interpolated.

Animation events include play, pause, stop, timeupdate, iteration, and more.

When not using manualMode, animations are automatically added to the AnimationManager.

## Constructors

### Constructor

> **new MaptilerAnimation**(`__namedParameters`): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:139](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L139)

#### Parameters

##### \_\_namedParameters

[`MaptilerAnimationOptions`](../interfaces/MaptilerAnimationOptions.md)

#### Returns

`MaptilerAnimation`

## Properties

### duration

> `readonly` **duration**: `number`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:101](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L101)

The duration of the animation in milliseconds (when playbackRate === 1)

## Accessors

### isPlaying

#### Get Signature

> **get** **isPlaying**(): `boolean`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:82](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L82)

Indicates if the animation is currently playing

##### Returns

`boolean`

- true if the animation is playing, false otherwise

## Methods

### addEventListener()

> **addEventListener**(`type`, `callback`): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:497](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L497)

Adds an event listener to the animation

#### Parameters

##### type

[`AnimationEventTypes`](../enumerations/AnimationEventTypes.md)

The type of event to listen for

##### callback

[`AnimationEventCallback`](../type-aliases/AnimationEventCallback.md)

The callback function to execute when the event occurs

#### Returns

`MaptilerAnimation`

This animation instance for method chaining

***

### clone()

> **clone**(): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:555](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L555)

Creates a clone of this animation

#### Returns

`MaptilerAnimation`

A new animation instance with the same properties as this one

***

### destroy()

> **destroy**(): `void`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:566](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L566)

Destroys the animation instance, removing all event listeners and stopping playback

#### Returns

`void`

***

### emitEvent()

> **emitEvent**(`event`, `keyframe?`, `nextKeyframe?`, `props?`, `previousProps?`): `void`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:535](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L535)

Emits an event to all listeners of a specific type

#### Parameters

##### event

[`AnimationEventTypes`](../enumerations/AnimationEventTypes.md)

The type of event to emit

##### keyframe?

The keyframe that triggered the event

`null` | [`Keyframe`](../type-aliases/Keyframe.md)

##### nextKeyframe?

`null` | [`Keyframe`](../type-aliases/Keyframe.md)

##### props?

`Record`\<`string`, `number`\> = `{}`

The interpolated properties at the current delta

##### previousProps?

`Record`\<`string`, `number`\>

#### Returns

`void`

***

### getCurrentAndNextKeyFramesAtDelta()

> **getCurrentAndNextKeyFramesAtDelta**(`delta`): `object`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:409](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L409)

Gets the current and next keyframes at a specific delta value

#### Parameters

##### delta

`number`

The delta value to query

#### Returns

`object`

Object containing current and next keyframes, which may be null

##### current

> **current**: `null` \| [`InterpolatedKeyFrame`](../type-aliases/InterpolatedKeyFrame.md)

##### next

> **next**: `null` \| [`InterpolatedKeyFrame`](../type-aliases/InterpolatedKeyFrame.md)

***

### getCurrentAndNextKeyFramesAtTime()

> **getCurrentAndNextKeyFramesAtTime**(`time`): `object`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:400](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L400)

Gets the current and next keyframes at a specific time

#### Parameters

##### time

`number`

The time position to query

#### Returns

`object`

Object containing current and next keyframes, which may be null

##### current

> **current**: `null` \| [`InterpolatedKeyFrame`](../type-aliases/InterpolatedKeyFrame.md)

##### next

> **next**: `null` \| [`InterpolatedKeyFrame`](../type-aliases/InterpolatedKeyFrame.md)

***

### getCurrentDelta()

> **getCurrentDelta**(): `number`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:446](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L446)

Gets the current delta value of the animation

#### Returns

`number`

The current delta value (normalized progress between 0 and 1)

***

### getCurrentTime()

> **getCurrentTime**(): `number`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:420](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L420)

Gets the current time position of the animation

#### Returns

`number`

The current time in milliseconds

***

### getPlaybackRate()

> **getPlaybackRate**(): `number`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:487](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L487)

Gets the current playback rate

#### Returns

`number`

The current playback rate

***

### removeEventListener()

> **removeEventListener**(`type`, `callback`): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:516](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L516)

Removes an event listener from the animation

#### Parameters

##### type

[`AnimationEventTypes`](../enumerations/AnimationEventTypes.md)

The type of event to remove

##### callback

[`AnimationEventCallback`](../type-aliases/AnimationEventCallback.md)

The callback function to remove

#### Returns

`MaptilerAnimation`

This animation instance for method chaining

***

### updateInternal()

> **updateInternal**(): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:304](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L304)

Updates the animation state if playing, this is used by the AnimationManager
to update all animations in the loop

#### Returns

`MaptilerAnimation`

This animation instance for method chaining

## Events

### pause()

> **pause**(): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:264](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L264)

Pauses the animation

#### Returns

`MaptilerAnimation`

This animation instance for method chaining
 AnimationEventTypes.Pause

***

### play()

> **play**(): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:231](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L231)

Starts or resumes the animation

#### Returns

`MaptilerAnimation`

This animation instance for method chaining
 AnimationEventTypes.Play

***

### reset()

> **reset**(`manual`): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:286](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L286)

Resets the animation to its initial state without stopping

#### Parameters

##### manual

`boolean` = `true`

#### Returns

`MaptilerAnimation`

This animation instance for method chaining
 AnimationEventTypes.Reset

***

### setCurrentDelta()

> **setCurrentDelta**(`delta`): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:457](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L457)

Sets the current delta value of the animation

#### Parameters

##### delta

`number`

The delta value to set (normalized progress between 0 and 1)

#### Returns

`MaptilerAnimation`

This animation instance for method chaining

#### Throws

Error if delta is greater than 1
 AnimationEventTypes.Scrub

***

### setCurrentTime()

> **setCurrentTime**(`time`): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:431](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L431)

Sets the current time position of the animation

#### Parameters

##### time

`number`

The time to set in milliseconds

#### Returns

`MaptilerAnimation`

This animation instance for method chaining

#### Throws

Error if time is greater than the duration
 AnimationEventTypes.Scrub

***

### setPlaybackRate()

> **setPlaybackRate**(`rate`): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:476](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L476)

Sets the playback rate of the animation

#### Parameters

##### rate

`number`

The playback rate (1.0 is normal speed)

#### Returns

`MaptilerAnimation`

This animation instance for method chaining
 AnimationEventTypes.PlaybackRateChange

***

### stop()

> **stop**(`silent`): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:275](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L275)

Stops the animation and resets to initial state

#### Parameters

##### silent

`boolean` = `false`

#### Returns

`MaptilerAnimation`

This animation instance for method chaining
 AnimationEventTypes.Stop

***

### update()

> **update**(`manual`, `ignoreIteration`): `MaptilerAnimation`

Defined in: [src/utils/MaptilerAnimation/MaptilerAnimation.ts:320](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/utils/MaptilerAnimation/MaptilerAnimation.ts#L320)

Updates the animation state, interpolating between keyframes
and emitting events as necessary
 AnimationEventTypes.TimeUpdate
 AnimationEventTypes.Keyframe
 AnimationEventTypes.Iteration
 AnimationEventTypes.AnimationEnd

#### Parameters

##### manual

`boolean` = `true`

##### ignoreIteration

`boolean` = `false`

#### Returns

`MaptilerAnimation`

This animation instance for method chaining
