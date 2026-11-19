import type { MapTilerMarkerUIStateName, MapTilerMarkerUIStates, UIStateSpec } from "./types";
import { UI_STATE_PRIORITY } from "./marker-constants";

export function flattenUIStates(states: MapTilerMarkerUIStates, active: ReadonlySet<MapTilerMarkerUIStateName>): UIStateSpec {
  const flattened: UIStateSpec = {};
  for (const name of UI_STATE_PRIORITY) {
    if (!active.has(name)) continue;
    const spec = states[name];
    if (spec) Object.assign(flattened, spec);
  }
  return flattened;
}
