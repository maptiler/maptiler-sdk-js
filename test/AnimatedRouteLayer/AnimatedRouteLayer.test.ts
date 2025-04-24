import { describe, expect, vi, test } from "vitest";
// import { AnimatedRouteLayer } from "../../src/custom-layers/AnimatedRouteLayer";
import { EasingFunctionName, Keyframe, MaptilerAnimation } from "../../src/utils";
import { AnimatedRouteLayer } from "../../src/custom-layers/AnimatedRouteLayer";
import { validFixture, validFixtureExpectedKeyframes } from "../fixtures/animations/keyframes.fixture";

vi.mock("uuid", () => ({
  v4: () => "PHONEY-UUID",
}));

const keyframes: Keyframe[] = [
  {
    delta: 0,
    props: {
      opacity: 0,
      scale: 1,
    },
  },
  {
    delta: 0.5,
    props: {
      opacity: 0.5,
      scale: 1.5,
    },
  },
  {
    delta: 1,
    props: {
      scale: 2,
      opacity: 1,
    },
  },
];

const mockSource = {
  getData: vi.fn(() => ({
    type: "FeatureCollection",
    features: [validFixture],
  })),
};

class MockMap {
  setPaintProperty = vi.fn();
  getPitch = vi.fn();
  getZoom = vi.fn();
  getBearing = vi.fn();
  jumpTo = vi.fn();
  getSource = vi.fn(() => mockSource);
  getLayersOrder = vi.fn();
}

describe("AnimatedRouteLayer", () => {
  const map = new MockMap();

  test("Instantiates correctly with the correct options", () => {
    const layer = new AnimatedRouteLayer({
      keyframes,
      duration: 1000,
      iterations: 2,
      easing: EasingFunctionName.Linear,
      autoplay: true,
    });

    expect(layer).toBeInstanceOf(AnimatedRouteLayer);
    expect(layer.id).toBe("animated-route-layer-PHONEY-UUID");
  });

  test("Throws / rejects if the map already has an AnimatedRouteLayer added", () => {
    // fake add a new map
    map.getLayersOrder.mockImplementation(() => ["animated-route-layer-PHONEY-UUID-2"]);

    const layer = new AnimatedRouteLayer({
      keyframes,
      duration: 1000,
      iterations: 2,
      easing: EasingFunctionName.Linear,
      autoplay: true,
    });

    const testFn = async () => {
      //@ts-expect-error map is mocked to avoid webgl explosions...
      await layer.onAdd(map);
    };

    expect(testFn).rejects.toThrowError(
      `[AnimatedRouteLayer.onAdd]: Currently, you can only have one active AnimatedRouteLayer at a time. Please remove the existing one before adding a new one.`,
    );
  });

  test("Initialises the internal animation instance correctly when given keyframes", async () => {
    map.getLayersOrder.mockImplementation(() => []);

    const layer = new AnimatedRouteLayer({
      keyframes,
      duration: 1000,
      iterations: 2,
      easing: EasingFunctionName.Linear,
      autoplay: true,
    });

    //@ts-expect-error map is mocked to avoid webgl explosions...
    await layer.onAdd(map);

    expect(layer.animationInstance).toBeInstanceOf(MaptilerAnimation);

    //@ts-expect-error it is private but we can access it here...
    layer.animationInstance.keyframes.forEach((keyframe, index) => {
      expect(keyframe.delta).toEqual(keyframes[index].delta);
      expect(keyframe.props).toEqual(keyframes[index].props);
      expect(keyframe.easing).toEqual("Linear");
      expect(keyframe.userData).toEqual(keyframes[index].userData);
    });

    expect(layer.animationInstance.duration).toEqual(1000);

    //@ts-expect-error it is private but we can access it here...
    expect(layer.animationInstance.iterations).toEqual(2);
  });

  test("Initialises the internal animation instance correctly when given a geojson source", async () => {
    map.getLayersOrder.mockImplementation(() => []);

    const layer = new AnimatedRouteLayer({
      source: {
        id: "test-source",
        featureSetIndex: 0,
        layerID: "test-layer",
      },
      duration: 1000,
      iterations: 2,
      easing: EasingFunctionName.Linear,
      autoplay: true,
    });

    //@ts-expect-error map is mocked to avoid webgl explosions...
    await layer.onAdd(map);

    expect(layer.animationInstance).toBeInstanceOf(MaptilerAnimation);

    const boundHandler = layer.animationInstance.update.bind(layer.animationInstance);

    layer.animationInstance.addEventListener = vi.fn();

    expect(layer.animationInstance.addEventListener).toHaveBeenCalledWith("timeupdate", boundHandler);

    validFixtureExpectedKeyframes.forEach((keyframe, index) => {
      expect(keyframe.delta).toEqual(validFixtureExpectedKeyframes[index].delta);
      expect(keyframe.props).toEqual(validFixtureExpectedKeyframes[index].props);
      expect(keyframe.easing).toEqual(validFixtureExpectedKeyframes[index].easing);
      expect(keyframe.userData).toEqual(validFixtureExpectedKeyframes[index].userData);
    });

    expect(layer.animationInstance.duration).toEqual(1000);

    //@ts-expect-error it is private but we can access it here...
    expect(layer.animationInstance.iterations).toEqual(5);
  });
});
