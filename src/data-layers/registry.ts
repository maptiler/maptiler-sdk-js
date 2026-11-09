// Data layers on each map, so the map can keep a data layer's sublayers with it
// when layers are added or moved. Internal — not exported from the package.

/** What the map needs of a data layer on it. */
export type PlacedDataLayer = {
  /** Ids of the sublayers, bottom first. */
  getSublayerIds(): string[];
  /** Called once the controller and its sublayers have been moved. */
  onMove(beforeId: string | undefined): void;
};

/** The map methods used here — `SDKMap` has them all. */
type LayerLookup = { getLayer(id: string): unknown };

const registries = new WeakMap<object, Map<string, PlacedDataLayer>>();

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
