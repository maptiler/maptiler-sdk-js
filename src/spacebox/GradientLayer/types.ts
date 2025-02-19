import type { Object3D } from "../../utils/webgl-utils";

type Color = [number, number, number, number];

type GradientStop = number;

type GradientDefinition = (
  | {
      type: "linear";
    }
  | {
      type: "radial";
      radius: number;
    }
) & {
  stops: Array<[GradientStop, Color]>;
};

type GradientAttributeKey = "vertexPosition";

type GradientUniformKey = "gradientType" | "aspect" | "radius" | "center" | "stopsNumber" | "stops" | "colors";

type GradientPlaneObject3D = Pick<Object3D<GradientAttributeKey, GradientUniformKey>, "shaderProgram" | "programInfo" | "positionBuffer">;

export type {
  Color,
  GradientStop,
  GradientDefinition,
  GradientPlaneObject3D,
  GradientAttributeKey,
  GradientUniformKey,
};
