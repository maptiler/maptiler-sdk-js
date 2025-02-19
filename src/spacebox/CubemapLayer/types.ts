import type { Object3D } from "../../utils/webgl-utils";

type ChromaKeyDefinition = {
  color: [number, number, number];
  threshold: number;
};

type CubemapDefinition = {
  path: string;
  opacity: number;
  chromaKey?: ChromaKeyDefinition;
};

type CubemapAttributeKey = "vertexPosition";

type CubemapUniformKey =
  | "projectionMatrix"
  | "modelViewMatrix"
  | "cubeSampler"
  | "alpha"
  | "alphaColor"
  | "alphaThreshold";

type CubemapObject3D = Object3D<CubemapAttributeKey, CubemapUniformKey>;

export type { CubemapDefinition, ChromaKeyDefinition, CubemapObject3D, CubemapAttributeKey, CubemapUniformKey };
