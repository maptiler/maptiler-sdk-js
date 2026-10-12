import "../../dist/maptiler-sdk.css";
import { Map as MapTiler, StyleSpecificationWithMetaData, type MapOptions, setWorkerUrl } from "../../src/index";
import { validateSpaceSpecification } from "../../src/custom-layers/CubemapLayer/CubemapLayer";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// MapLibre v6 loads its worker as a separate module, bundlers need its URL set explicitly
setWorkerUrl(workerUrl);

function getSpaceImagesKey(space: unknown) {
  if (typeof space !== "object" || space === null) return undefined;
  const { faces, preset, path } = space as { faces?: unknown; preset?: unknown; path?: unknown };
  return JSON.stringify(faces ?? preset ?? path);
}

// Same checks as Map.setSpaceFromStyle and the CubemapLayer: the style's space is ignored when the space option is
// false or an object, an invalid space is rejected, and the images are only reloaded (and faded in)
// when faces, preset or path change
function spaceImagesWillChange(map: MapTiler | undefined, options: MapOptions | undefined, style: StyleSpecificationWithMetaData) {
  if (options?.space !== true && options?.space !== undefined) return false;

  const space = style.metadata?.maptiler?.space;
  if (validateSpaceSpecification(space).length > 0) return false;

  const nextKey = getSpaceImagesKey(space);
  return nextKey !== undefined && nextKey !== getSpaceImagesKey(map?.getSpace()?.getConfig());
}

function createFixtureManager() {
  const state = {
    map: undefined as MapTiler | undefined,
    options: undefined as MapOptions | undefined,
    id: undefined as string | undefined,
  };

  const cleanup = () => {
    state.map?.remove();
    state.map = undefined;
    state.options = undefined;
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
    state.options = options;
    state.id = id;

    await state.map.onReadyAsync();

    if (requiresScreenShot) {
      await window.notifyScreenshotStateReady({ id: state.id });
    }
  };

  const setStyle = async (style: string | StyleSpecificationWithMetaData) => {
    // When the style changes the space images, the new images are loaded and faded in after the style has loaded.
    // Listen before setting the style, so the event cannot be missed.
    const spaceFadedIn = typeof style !== "string" && spaceImagesWillChange(state.map, state.options, style) ? state.map?.once("cubemaplayer:animateindone") : undefined;

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
        const interval = setInterval(() => {
          if (state.map?.isStyleLoaded()) {
            clearInterval(interval);
            resolve(true);
          }
        }, 1500);
      });

      // isStyleLoaded() does not cover the space images, they load separately
      await spaceFadedIn;

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

    if (options.space) {
      try {
        await new Promise((resolve, reject) => {
          void map?.on("cubemaplayer:animateindone", resolve);
          setTimeout(() => {
            reject(new Error("Timeout waiting for cubemaplayer:animateindone"));
          }, 30000);
        });
      } catch (e) {
        console.error("Error waiting for cubemaplayer:animateindone", e);
        throw e;
      }
    }

    if (options.halo) {
      try {
        await new Promise((resolve, reject) => {
          void map?.on("radialgradientlayer:animateindone", resolve);
          setTimeout(() => {
            reject(new Error("Timeout waiting for radialgradientlayer:animateindone"));
          }, 30000);
        });
      } catch (e) {
        console.error("Error waiting for radialgradientlayer:animateindone", e);
      }
    }

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
