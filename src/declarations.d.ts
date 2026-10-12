declare module "*?raw" {
  const content: string;
  export default content;
}

declare module "*?worker&url" {
  const url: string;
  export default url;
}

declare const __MT_SDK_VERSION__: string;
declare const __MT_NODE_ENV__: string;
/** Which build the code is part of: "es" (npm), "umd" (CDN), or "dev" (demos, e2e, tests) */
declare const __MT_BUILD_FORMAT__: "es" | "umd" | "dev";
