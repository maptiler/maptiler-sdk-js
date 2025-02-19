import type { Map as MapSDK } from "../Map";
import { GradientLayer } from "./GradientLayer/GradientLayer";
import type { GradientDefinition } from "./GradientLayer/types";
import { CubemapLayer } from "./CubemapLayer/CubemapLayer";
import type { CubemapDefinition } from "./CubemapLayer/types";

type Props = {
  map: MapSDK;
  cubemap: CubemapDefinition;
  gradient: GradientDefinition;
};

class Spacebox {
  private map: MapSDK;
  private gradientLayer: GradientLayer;
  private cubemapLayer: CubemapLayer;

  constructor({ map, cubemap, gradient }: Props) {
    this.map = map;

    const gradientLayer = new GradientLayer({ gradient });
    this.gradientLayer = gradientLayer;

    const cubemapLayer = new CubemapLayer({ cubemap });
    this.cubemapLayer = cubemapLayer;
    
    map.once("load", () => {
      const firstLayer = map.getLayersOrder()[0];

      map.addLayer(gradientLayer, firstLayer);
      map.addLayer(cubemapLayer, firstLayer);
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
}

export { Spacebox };
