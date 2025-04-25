[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / clearPrewarmedResources

# Variable: clearPrewarmedResources()

> **clearPrewarmedResources**: () => `void`

Defined in: [src/index.ts:57](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/index.ts#L57)

Clears up resources that have previously been created by `prewarm()`.
Note that this is typically not necessary. You should only call this function
if you expect the user of your app to not return to a Map view at any point
in your application.

## Returns

`void`

## Example

```ts
clearPrewarmedResources()
```
