import { Map } from "@maptiler/sdk";

declare global {
  interface Window {
    __map: Map;
    __pageLoadTimeout: number;
  }
}
