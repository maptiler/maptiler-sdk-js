[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / setWorkerCount

# Variable: setWorkerCount()

> **setWorkerCount**: (`count`) => `void`

Defined in: [src/index.ts:68](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/index.ts#L68)

Sets the number of web workers instantiated on a page with GL JS maps.
By default, workerCount is 1 except for Safari browser where it is set to half the number of CPU cores (capped at 3).
Make sure to set this property before creating any map instances for it to have effect.

## Parameters

### count

`number`

## Returns

`void`

## Example

```ts
setWorkerCount(2);
```
