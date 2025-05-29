import { Map, ScaleControl, config } from "../../src/index";
import { addPerformanceStats, setupMapTilerApiKey } from "./demo-utils";

addPerformanceStats();
setupMapTilerApiKey({ config });

const container = document.getElementById("map-container") as HTMLElement;

const map = new Map({
  container,
  hash: true,
  maptilerLogo: true,
});

/*
 * The "ready" event happens only once, after the "load" event when all the controls that can be configured from
 * the constructor are dealt with. The logo control can be enforced depending on the type of MapTiler Cloud account,
 * and this is addressed with an asynchronous request. Because of this, the controls that can be added from the constructor
 * are added in an asynchronous fashion.
 * As a result, later on adding a custom control from within the "load" event callback does not guarrantee that these
 * first async controls are done added and the placement of the new control may be be stacked in the wrong order.
 *
 * The "ready" event guarantees the placemtn order of controls added later on.
 */
void map.on("load", (e) => {
  console.log(e);
  const scaleControl = new ScaleControl();
  map.addControl(scaleControl, "bottom-left");
});
