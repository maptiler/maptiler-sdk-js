import { expect } from "vitest";
import ImageData from "@canvas/image-data";
// @ts-expect-error: Global type missing
global.ImageData = ImageData;


// this is to prevent tests failing because of floating point differences
// between different CI and local
expect.addSnapshotSerializer({
  serialize(val, config, indentation, depth, refs, printer) {
    if (typeof val === 'number') {
      return val.toFixed(10)
    }
    return printer(val, config, indentation, depth, refs)
  },
  test(val) {
    return typeof val === 'number'
  },
})