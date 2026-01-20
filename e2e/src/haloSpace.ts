import "../../dist/maptiler-sdk.css";
import { Map as MapTiler, StyleSpecificationWithMetaData, type MapOptions } from "../../src/index";

function createFixtureManager() {
  let map: MapTiler | undefined;
  let id: string | undefined;

  const cleanup = () => {
    map?.remove();
    map = undefined;
    id = undefined;
  };

  const setNewMap = async (id: string, options: MapOptions) => {
    cleanup();
    console.log("Setting new map", id, options);
    const newMap = new MapTiler({
      ...options,
      container: "map",
      projection: "globe",
    });

    map = newMap;
    id = id;

    await map.onReadyAsync();

    void window.notifyScreenshotStateReady({ id });
  };

  const setStyle = async (style: string | StyleSpecificationWithMetaData) => {
    map?.setStyle(style);
    return new Promise((resolve) => {
      void map?.once("style.load", () => {
        void window.notifyScreenshotStateReady({ id });
        resolve(true);
      });
    });
  };

  return {
    setNewMap,
    cleanup,
    setStyle,
    getMap: () => map,
    getId: () => id,
  };
}

const fixtureManager = createFixtureManager();
console.log("fixtureManager", fixtureManager);
window.setFixtureWithConfig = async function setFixtureWithConfig({ id, options }: { id: string; options: MapOptions }) {
  await fixtureManager.setNewMap(id, options);

  const map = fixtureManager.getMap();
  window.__testUtils = {
    getHaloConfig: () => map?.getHalo()?.getConfig(),
    getSpaceConfig: () => map?.getSpace()?.getConfig(),
    hasHalo: () => map?.getHalo() !== undefined,
    hasSpace: () => map?.getSpace() !== undefined,
  };
};

window.setFixtureMapStyle = async function setStyle(style: string | StyleSpecificationWithMetaData) {
  await fixtureManager.setStyle(style);
};
