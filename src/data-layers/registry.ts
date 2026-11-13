// Data layers on each map, so the map can keep a data layer's sublayers with it
// when layers are added or moved, and put the data layers back in order after
// `map.setStyle()`. Internal — not exported from the package.

/** What the map needs of a data layer on it. */
export type PlacedDataLayer = {
  /** Ids of the sublayers, bottom first. */
  getSublayerIds(): string[];
  /** Called once the controller and its sublayers have been moved. */
  onMove(beforeId: string | undefined): void;
  /** Notes the layer the controller sits beneath now — the hint it puts itself back beneath after `map.setStyle()`. */
  rememberPosition(): void;
  /** Moves the layer beneath `beforeId` while putting the map's data layers back after `map.setStyle()` — not a move of the user's, so no `move` event. */
  restoreBeneath(beforeId: string): void;
};

/** The map methods used here — `SDKMap` has them all. */
type LayerLookup = { getLayer(id: string): unknown };

/** The map methods used around a style change — `SDKMap` has them all. */
type StyleChangeMap = LayerLookup & {
  getLayersOrder(): string[];
  on(type: "style.load", listener: () => void): unknown;
  off(type: "style.load", listener: () => void): unknown;
};

const registries = new WeakMap<object, Map<string, PlacedDataLayer>>();

/** Per map, cancels the order restore waiting for the new style's `style.load`. */
const pendingOrderRestores = new WeakMap<object, () => void>();

export function registerDataLayer(map: object, id: string, layer: PlacedDataLayer): void {
  let registry = registries.get(map);
  if (!registry) registries.set(map, (registry = new Map<string, PlacedDataLayer>()));
  registry.set(id, layer);
}

export function unregisterDataLayer(map: object, id: string): void {
  registries.get(map)?.delete(id);
}

/** Id of the data layer on `map` that `layerId` is a sublayer of. */
export function findSublayerOwner(map: object, layerId: string): string | undefined {
  for (const [id, layer] of registries.get(map) ?? []) {
    if (layer.getSublayerIds().includes(layerId)) return id;
  }
  return undefined;
}

/**
 * `beforeId` adjusted for data layers: a data layer draws through sublayers
 * beneath its controller, so placing a layer before the controller means
 * placing it before the bottom sublayer — unless it's one of those sublayers.
 * @param layerId - Id of the layer being placed.
 */
export function resolveBeforeId(map: LayerLookup, beforeId: string | undefined, layerId?: string): string | undefined {
  if (beforeId === undefined) return undefined;
  const sublayerIds = registries.get(map)?.get(beforeId)?.getSublayerIds();
  if (!sublayerIds || (layerId !== undefined && sublayerIds.includes(layerId))) return beforeId;
  return sublayerIds.find((id) => map.getLayer(id) !== undefined) ?? beforeId;
}

/**
 * Moves the layer `id` before `beforeId` through `move` (the map's own
 * `moveLayer`) — a data layer together with its sublayers, which then hears
 * of the move.
 */
export function moveLayerWithSublayers(map: LayerLookup, id: string, beforeId: string | undefined, move: (id: string, beforeId?: string) => void): void {
  const target = resolveBeforeId(map, beforeId);
  const dataLayer = registries.get(map)?.get(id);

  // bottom first, each straight before the target, so they keep their order beneath the controller
  for (const sublayerId of dataLayer?.getSublayerIds() ?? []) {
    if (map.getLayer(sublayerId) !== undefined) move(sublayerId, target);
  }
  move(id, target);

  dataLayer?.onMove(beforeId);
}

/**
 * Called by `map.setStyle()` just before the style changes, so the data layers
 * on `map` come back in a predictable place. A new style may share none of the
 * old style's layer ids, so there's no way to know where the old positions
 * fall in it. What is known: data layers always come back, as they put
 * themselves back. So positions are restored in two steps:
 *
 * 1. Each data layer puts itself back, on `style.load`, beneath the layer it
 *    sat beneath (noted here), if the new style has a layer with that id — as
 *    variants of the same style often do — else on top. This is a best-effort
 *    hint only.
 * 2. Once they all have, their order among themselves is restored, which wins
 *    over step 1's hints. Whatever the new style holds, data layers keep their
 *    order relative to each other.
 *
 * The step 2 listener is added here, after every data layer's own `style.load`
 * listener, so it runs once they've all put themselves back.
 *
 * A style change made while the previous one is still loading keeps the
 * snapshot taken from the last style the data layers were on.
 *
 * @returns Cancels step 2, for a style change that didn't go ahead.
 */
export function prepareDataLayersForStyleChange(map: StyleChangeMap): () => void {
  const noop = (): void => undefined;
  const registry = registries.get(map);
  if (!registry) return noop;

  const order = map.getLayersOrder().filter((id) => registry.has(id));
  // mid-load, the data layers aren't on the current style — keep the snapshot taken from the last one they were on
  if (order.length === 0) return noop;

  // a style change that never fired `style.load` (e.g. a diff with nothing to change) leaves a stale snapshot behind
  pendingOrderRestores.get(map)?.();

  for (const id of order) registry.get(id)?.rememberPosition();

  const onStyleLoad = () => {
    cancel();
    restoreDataLayerOrder(map, order);
  };
  const cancel = () => {
    if (pendingOrderRestores.get(map) === cancel) pendingOrderRestores.delete(map);
    map.off("style.load", onStyleLoad);
  };

  pendingOrderRestores.set(map, cancel);
  map.on("style.load", onStyleLoad);
  return cancel;
}

/**
 * Step 2 of {@link prepareDataLayersForStyleChange}: puts the data layers back
 * in `order` (bottom first) among themselves. Goes top down, so each layer
 * moves beneath one already in its final place, and a later move never undoes
 * an earlier one. Only layers out of order move. Layers no longer on the map
 * are skipped.
 */
function restoreDataLayerOrder(map: StyleChangeMap, order: string[]): void {
  const registry = registries.get(map);
  let aboveId: string | undefined;

  for (const id of [...order].reverse()) {
    const dataLayer = registry?.get(id);
    if (!dataLayer || map.getLayer(id) === undefined) continue;

    if (aboveId !== undefined) {
      const layersOrder = map.getLayersOrder();
      // beneath the layer above means beneath its bottom sublayer
      if (layersOrder.indexOf(id) > layersOrder.indexOf(resolveBeforeId(map, aboveId) ?? aboveId)) {
        dataLayer.restoreBeneath(aboveId);
      }
    }
    aboveId = id;
  }
}
