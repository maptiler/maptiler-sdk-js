[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / prewarm

# Variable: prewarm()

> **prewarm**: () => `void`

Defined in: [src/index.ts:56](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/index.ts#L56)

Initializes resources like WebWorkers that can be shared across maps to lower load
times in some situations. `setWorkerUrl()` and `setWorkerCount()`, if being
used, must be set before `prewarm()` is called to have an effect.

By default, the lifecycle of these resources is managed automatically, and they are
lazily initialized when a Map is first created. By invoking `prewarm()`, these
resources will be created ahead of time, and will not be cleared when the last Map
is removed from the page. This allows them to be re-used by new Map instances that
are created later. They can be manually cleared by calling
`clearPrewarmedResources()`. This is only necessary if your web page remains
active but stops using maps altogether.

This is primarily useful when using GL-JS maps in a single page app, wherein a user
would navigate between various views that can cause Map instances to constantly be
created and destroyed.

## Returns

`void`

## Example

```ts
prewarm()
```
