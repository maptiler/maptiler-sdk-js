import type { Map as MapSDK } from "../Map";

import { CubemapLayer, type CubemapDefinition } from "./CubemapLayer";
import { RadialGradientLayer, type GradientDefinition } from "./RadialGradientLayer";

type SpaceboxConstructorOptions = {
  map: MapSDK;
  space: CubemapDefinition;
  gradient: GradientDefinition;
};

class Spacebox {
  private map: MapSDK;
  private gradientLayer: RadialGradientLayer;
  private cubemapLayer: CubemapLayer;

  constructor({ map, space, gradient }: SpaceboxConstructorOptions) {
    this.map = map;

    const gradientLayer = new RadialGradientLayer({ gradient });
    this.gradientLayer = gradientLayer;


    const cubemapLayer = new CubemapLayer(space);
    this.cubemapLayer = cubemapLayer;

    map.once("load", () => {
      const firstLayer = map.getLayersOrder()[0];

      map.addLayer(cubemapLayer, firstLayer);
      map.addLayer(gradientLayer, firstLayer);
    });
  }

  public show(): void {
    this.map.setLayoutProperty(this.gradientLayer.id, "visibility", "visible");
    this.map.setLayoutProperty(this.cubemapLayer.id, "visibility", "visible");
  }

  public hide(): void {
    this.map.setLayoutProperty(this.gradientLayer.id, "visibility", "none");
    this.map.setLayoutProperty(this.cubemapLayer.id, "visibility", "none");
  }

  public setCubemap(cubemap: CubemapDefinition): void {
    this.cubemapLayer.setCubemap(cubemap);
  }

  public setGradient(gradient: GradientDefinition): void {
    this.gradientLayer.setGradient(gradient);
  }
}

export { Spacebox };
