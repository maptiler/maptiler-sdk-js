/**
 * Wraps a Next.js config so that the MapLibre worker files are copied into `public/_maptiler/`
 * and their URL is exposed to `@maptiler/sdk/next-worker`.
 * Accepts a config object or a (possibly async) function returning one, as Next.js does.
 */
export declare function withMaptilerWorker<TConfig extends object | ((...args: any[]) => any)>(nextConfig?: TConfig): TConfig;
