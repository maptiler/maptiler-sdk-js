import type { Object3D } from "../../utils/webgl-utils";

type Color = [number, number, number, number];

type GradientStop = number;

type GradientDefinition = {
  stops: Array<[GradientStop, Color]>;
  scale: number;
};

type GradientAttributeKey = "vertexPosition";

type GradientUniformKey = "stopsNumber" | "stops" | "colors";

type GradientPlaneObject3D = Pick<
  Object3D<GradientAttributeKey, GradientUniformKey>,
  "shaderProgram" | "programInfo" | "positionBuffer"
>;

export type {
  Color,
  GradientStop,
  GradientDefinition,
  GradientPlaneObject3D,
  GradientAttributeKey,
  GradientUniformKey,
};
