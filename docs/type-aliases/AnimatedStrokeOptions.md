[**MapTiler SDK v3.3.0-rc1**](../README.md)

***

[MapTiler SDK](../README.md) / AnimatedStrokeOptions

# Type Alias: AnimatedStrokeOptions

> **AnimatedStrokeOptions** = \{ `activeColor`: \[`number`, `number`, `number`, `number`\]; `inactiveColor`: \[`number`, `number`, `number`, `number`\]; \} \| `false`

Defined in: [src/custom-layers/AnimatedRouteLayer.ts:24](https://github.com/maptiler/maptiler-sdk-js/blob/d9cb958ebf063ecde2f6f583eb172e5a83460e6a/src/custom-layers/AnimatedRouteLayer.ts#L24)

Options for configuring the animated stroke effect for routes.
When an object is provided, it defines colors for active and inactive parts of the route.
When `false`, the animated stroke effect is disabled.
