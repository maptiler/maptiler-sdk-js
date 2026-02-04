import "../../dist/maptiler-sdk.css";
import { Map as MapTiler, StyleSpecificationWithMetaData, type MapOptions } from "../../src/index";

function createFixtureManager() {
  const state = {
    map: undefined as MapTiler | undefined,
    id: undefined as string | undefined,
  };

  const cleanup = () => {
    state.map?.remove();
    state.map = undefined;
    state.id = undefined;
  };

  const setNewMap = async (id: string, options: MapOptions, requiresScreenShot: boolean = true) => {
    cleanup();
    console.log("Setting new map", id, options);
    const newMap = new MapTiler({
      ...options,
      container: "map",
      projection: "globe",
    });

    state.map = newMap;
    state.id = id;

    await state.map.onReadyAsync();

    if (requiresScreenShot) {
      await window.notifyScreenshotStateReady({ id: state.id });
    }
  };

  const setStyle = async (style: string | StyleSpecificationWithMetaData) => {
    state.map?.setStyle(style);
    if (typeof style === "string") {
      return new Promise((resolve) => {
        void state.map?.once("style.load", () => {
          void window.notifyScreenshotStateReady({ id: state.id });
          resolve(true);
        });
      });
    } else {
      await new Promise((resolve) => {
        setInterval(() => {
          if (state.map?.isStyleLoaded()) {
            void window.notifyScreenshotStateReady({ id: state.id });
            resolve(true);
          }
        }, 1500);
      });

      void window.notifyScreenshotStateReady({ id: state.id });
    }
  };

  return {
    setNewMap,
    cleanup,
    setStyle,
    getMap: () => state.map,
    getId: () => state.id,
  };
}

const fixtureManager = createFixtureManager();
window.setFixtureWithConfig = async function setFixtureWithConfig({ id, options, requiresScreenShot }: { id: string; options: MapOptions; requiresScreenShot?: boolean }) {
  try {
    await fixtureManager.setNewMap(id, options, requiresScreenShot);

    const map = fixtureManager.getMap();
    window.__testUtils = {
      getHaloConfig: () => map?.getHalo()?.getConfig(),
      getSpaceConfig: () => map?.getSpace()?.getConfig(),
      hasHalo: () => map?.getHalo() !== undefined,
      hasSpace: () => map?.getSpace() !== undefined,
    };
  } catch (e) {
    console.error("Error setting fixture with config", e);
  }
};

window.setFixtureMapStyle = async function setStyle(style: string | StyleSpecificationWithMetaData) {
  try {
    await fixtureManager.setStyle(style);
  } catch (e) {
    console.error("Error setting fixture map style", e);
  }
};
