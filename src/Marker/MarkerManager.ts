import type { Marker } from "./Marker";
import type { Map as SDKMap } from "../Map";
import { DetachFromDOMSymbol, FlushDOMUpdatesSymbol } from "./marker-symbols";

/**
 * @class MarkerManagerFactory
 * @description This singleton is used to batch marker updates and flush them to the DOM in a
 * single animation frame to avoid multiple separate attribute writes
 * It is not exposed as a public API and only used internally in the `Map` and `Marker` classes.
 * It _may_ be used by multiple Maps.
 */
class MarkerManagerFactory {
  //#region State

  // the markers that require updates
  private readonly dirty = new Set<Marker>();

  // the current rAF ID
  private animationFrameID: number | null = null;

  // A WeakMap to store which Marker belongs to which Map.
  // When a map is removed from the page the WeakMap clears the state, so no manual clean up needed.
  private readonly markerMap = new WeakMap<Marker, SDKMap>();

  // Lookup in the opposite direction, gets the markers for a given map.
  // When a map is removed from the page the WeakMap clears the state, so no manual clean up needed.
  private readonly mapIndex = new WeakMap<SDKMap, Map<string, Marker>>();

  //#endregion

  //#region Internal

  // Queues the DOM updates into an animation frame (if updates aren't already scheduled)
  private scheduleFlush() {
    // If there is already an update waiting, the changes will be on the next update
    if (this.animationFrameID !== null) return;
    this.animationFrameID = requestAnimationFrame(() => {
      this.animationFrameID = null;
      this.flushUpdates();
    });
  }

  // lazy initialisation of map indexes
  private getOrCreateIndex(map: SDKMap): Map<string, Marker> {
    let index = this.mapIndex.get(map);

    if (!index) {
      index = new Map();
      this.mapIndex.set(map, index);
    }

    return index;
  }

  //#endregion

  //#region Registration

  // registers a marker to be managed, called internally in Map.addMarker
  register(marker: Marker, map: SDKMap): void {
    this.markerMap.set(marker, map);

    this.getOrCreateIndex(map).set(marker.id, marker);

    marker.addTo(map);
  }

  // unregisters a Marker that no longer needs to be managed.
  deregister(marker: Marker): void {
    const map = this.markerMap.get(marker);

    if (!map) return;

    this.markerMap.delete(marker);
    this.mapIndex.get(map)?.delete(marker.id);
    this.cancelCuedUpdatesForMarker(marker);

    marker[DetachFromDOMSymbol]();
  }

  // As above but with a Markers ID instead.
  deregisterById(map: SDKMap, id: string): void {
    const marker = this.mapIndex.get(map)?.get(id);
    if (marker) this.deregister(marker);
  }

  // removes all markers or a specified list of markers with IDs from a map
  deregisterAll(map: SDKMap, ids?: string[]): void {
    const index = this.mapIndex.get(map);
    if (!index) return;
    if (ids) {
      for (const id of ids) {
        const marker = index.get(id);
        if (marker) this.deregister(marker);
      }
    } else {
      for (const marker of index.values()) {
        this.markerMap.delete(marker);
        this.cancelCuedUpdatesForMarker(marker);
        marker[DetachFromDOMSymbol]();
      }
      index.clear();
    }
  }

  //#endregion

  //#region Queries

  // gets the map a marker belongs to
  getMap(marker: Marker): SDKMap | undefined {
    return this.markerMap.get(marker);
  }

  // gets the markers for a given map
  getMarkers(map: SDKMap): Marker[] {
    const index = this.mapIndex.get(map);
    return index ? Array.from(index.values()) : [];
  }

  // gets a specific marker from a specific map
  getMarker(map: SDKMap, id: string): Marker | undefined {
    return this.mapIndex.get(map)?.get(id);
  }

  //#endregion

  //#region DOM Updates

  // iterates through the markers that require updates and applies then to the DOM.
  flushUpdates() {
    // TODO collision logic will go here...

    for (const marker of this.dirty) {
      marker[FlushDOMUpdatesSymbol]();
    }

    // clear updates.
    this.dirty.clear();
  }

  // called when a marker state is updated
  addMarkerUpdateToQueue(marker: Marker): void {
    this.dirty.add(marker);
    this.scheduleFlush();
  }

  // abort any updates
  cancelCuedUpdatesForMarker(marker: Marker): void {
    this.dirty.delete(marker);
  }

  //#endregion
}

export const MarkerManager = new MarkerManagerFactory();
