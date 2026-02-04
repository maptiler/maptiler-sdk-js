import { Keyframe, KeyframeableGeoJSONFeature } from "../../../src/MaptilerAnimation";

export const fixtureOne: KeyframeableGeoJSONFeature = {
  type: "Feature",
  properties: {},
  geometry: {
    coordinates: [],
    type: "LineString",
  },
};

export const invalidGeometryFixture: KeyframeableGeoJSONFeature = {
  type: "Feature",
  properties: {},
  // @ts-expect-error this is a duff type to invoke an error
  geometry: {
    coordinates: [],
  },
};

export const validFixture: KeyframeableGeoJSONFeature = {
  type: "Feature",
  properties: {
    "@easing": ["Linear", "BounceIn", "Linear", "Linear", "Linear", "Linear", "Linear", "Linear", "Linear", "Linear", "ElasticIn"],
    "@delta": [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    "@autoplay": true,
    "@duration": 1000,
    "@iterations": 5,
    propertyOne: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    propertyTwo: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0],
  },
  geometry: {
    coordinates: [
      [0, 0],
      [1, 1, 10],
      [2, 2],
      [3, 3, 50],
      [4, 4, 40],
      [5, 5],
      [6, 6, 60],
      [7, 7, Math.PI],
      [8, 8, 1000],
      [9, 9],
      [10, 10, 0],
    ],
    type: "LineString",
  },
};

export const validFixtureExpectedKeyframes: Keyframe[] = [
  {
    easing: "Linear",
    delta: 0,
    props: {
      propertyOne: 0,
      propertyTwo: 100,
      lat: 0,
      lng: 0,
      altitude: null,
    },
  },
  {
    easing: "BounceIn",
    delta: 0.1,
    props: {
      propertyOne: 10,
      propertyTwo: 90,
      lat: 1,
      lng: 1,
      altitude: 10,
    },
  },
  {
    easing: "Linear",
    delta: 0.2,
    props: {
      propertyOne: 20,
      propertyTwo: 80,
      lat: 2,
      lng: 2,
      altitude: null,
    },
  },
  {
    easing: "Linear",
    delta: 0.3,
    props: {
      propertyOne: 30,
      propertyTwo: 70,
      lat: 3,
      lng: 3,
      altitude: 50,
    },
  },
  {
    easing: "Linear",
    delta: 0.4,
    props: {
      propertyOne: 40,
      propertyTwo: 60,
      lat: 4,
      lng: 4,
      altitude: 40,
    },
  },
  {
    easing: "Linear",
    delta: 0.5,
    props: {
      propertyOne: 50,
      propertyTwo: 50,
      lat: 5,
      lng: 5,
      altitude: null,
    },
  },
  {
    easing: "Linear",
    delta: 0.6,
    props: {
      propertyOne: 60,
      propertyTwo: 40,
      lat: 6,
      lng: 6,
      altitude: 60,
    },
  },
  {
    easing: "Linear",
    delta: 0.7,
    props: {
      propertyOne: 70,
      propertyTwo: 30,
      lat: 7,
      lng: 7,
      altitude: Math.PI,
    },
  },
  {
    easing: "Linear",
    delta: 0.8,
    props: {
      propertyOne: 80,
      propertyTwo: 20,
      lat: 8,
      lng: 8,
      altitude: 1000,
    },
  },
  {
    easing: "Linear",
    delta: 0.9,
    props: {
      propertyOne: 90,
      propertyTwo: 10,
      lat: 9,
      lng: 9,
      altitude: null,
    },
  },
  {
    easing: "ElasticIn",
    delta: 1,
    props: {
      propertyOne: 100,
      propertyTwo: 0,
      lat: 10,
      lng: 10,
      altitude: 0,
    },
  },
];
