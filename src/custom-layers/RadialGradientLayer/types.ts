import type { Object3D } from "../../utils/webgl-utils";

export type Color = string;

export type GradientStop = number;

export type RadialGradientLayerOptions = GradientDefinition;

export type GradientDefinition = {
  stops: Array<[GradientStop, Color]>;
  scale: number;
};

export type GradientAttributeKey = "vertexPosition";

export type GradientUniformKey = "stopsNumber" | "stops" | "colors";

export type GradientPlaneObject3D = Pick<Object3D<GradientAttributeKey, GradientUniformKey>, "shaderProgram" | "programInfo" | "positionBuffer">;
