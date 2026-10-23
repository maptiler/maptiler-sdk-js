import { beforeEach, describe, expect, test, vi } from "vitest";
import type { MissingStyleImageResolver } from "maplibre-gl";
import { Map } from "../src/Map";

type ResolverMap = Map & { _missingStyleImageResolver: MissingStyleImageResolver | null };

/**
 * A map with just the state the resolver methods use — constructing a real
 * one needs WebGL. Class fields don't run through `Object.create`, so they're
 * set up as the constructor would.
 */
function createResolverMap(images: Set<string>): ResolverMap {
  const map = Object.create(Map.prototype) as ResolverMap;
  Object.assign(map, {
    missingStyleImageResolvers: [],
    userMissingStyleImageResolver: null,
    _missingStyleImageResolver: null,
    hasImage: (id: string) => images.has(id),
  });
  return map;
}

/** Calls whatever single resolver the map has handed MapLibre. */
async function resolve(map: ResolverMap, id: string) {
  await map._missingStyleImageResolver?.(id);
}

describe("Map missing-image resolvers", () => {
  let images: Set<string>;
  let map: ResolverMap;

  /** A resolver that adds the ids starting with `prefix`. */
  const owning = (prefix: string) =>
    vi.fn((id: string) => {
      if (id.startsWith(prefix)) images.add(id);
    });

  beforeEach(() => {
    images = new Set();
    map = createResolverMap(images);
  });

  test("tries added resolvers in order until one adds the image", async () => {
    const a = owning("a:");
    const b = owning("b:");
    map.addMissingStyleImageResolver(a).addMissingStyleImageResolver(b);

    await resolve(map, "b:1");
    await resolve(map, "a:1");

    expect(images).toEqual(new Set(["b:1", "a:1"]));
    expect(a).toHaveBeenCalledTimes(2);
    // b isn't asked once a has the image
    expect(b).toHaveBeenCalledTimes(1);
  });

  test("tries the user's resolver after the added ones, and keeps both when either changes", async () => {
    const sdk = owning("sdk:");
    const user = owning("user:");

    map.setMissingStyleImageResolver(user);
    map.addMissingStyleImageResolver(sdk);
    await resolve(map, "user:1");
    await resolve(map, "sdk:1");

    expect(images).toEqual(new Set(["user:1", "sdk:1"]));
    expect(sdk.mock.invocationCallOrder[0]).toBeLessThan(user.mock.invocationCallOrder[0]);
  });

  test("setMissingStyleImageResolver(null) removes only the user's resolver", async () => {
    const sdk = owning("sdk:");
    const user = owning("user:");
    map.addMissingStyleImageResolver(sdk).setMissingStyleImageResolver(user);

    map.setMissingStyleImageResolver(null);
    await resolve(map, "user:1");
    await resolve(map, "sdk:1");

    expect(user).not.toHaveBeenCalled();
    expect(images).toEqual(new Set(["sdk:1"]));
  });

  test("moves on to the next resolver when one throws, with a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    map.addMissingStyleImageResolver(() => {
      throw new Error("boom");
    });
    map.addMissingStyleImageResolver(owning("x:"));

    await resolve(map, "x:1");

    expect(images.has("x:1")).toBe(true);
    expect(warn).toHaveBeenCalledWith('Missing image resolver failed for "x:1":', expect.any(Error));
    warn.mockRestore();
  });

  test("ignores adding the same resolver twice, and removing one never added", async () => {
    const a = owning("a:");
    map.addMissingStyleImageResolver(a).addMissingStyleImageResolver(a);
    map.removeMissingStyleImageResolver(owning("b:"));

    await resolve(map, "nobody:1");

    expect(a).toHaveBeenCalledTimes(1);
  });

  test("hands MapLibre no resolver once the last one is removed", () => {
    const a = owning("a:");
    map.addMissingStyleImageResolver(a);
    expect(map._missingStyleImageResolver).not.toBeNull();

    map.removeMissingStyleImageResolver(a);
    expect(map._missingStyleImageResolver).toBeNull();
  });
});
