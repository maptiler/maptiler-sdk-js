[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / getMaxParallelImageRequests

# Variable: getMaxParallelImageRequests()

> **getMaxParallelImageRequests**: () => `number`

Defined in: [src/index.ts:69](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/index.ts#L69)

Gets and sets the maximum number of images (raster tiles, sprites, icons) to load in parallel,
which affects performance in raster-heavy maps. 16 by default.

## Returns

`number`

Number of parallel requests currently configured.

## Example

```ts
getMaxParallelImageRequests();
```
