import GUI from "lil-gui";

/**
 * Creates a lil-gui panel for a development fixture (https://lil-gui.georgealways.com).
 * It is moved to the top left, as its default top right corner is where the map controls are.
 */
export function createGui(title: string) {
  const gui = new GUI({ title });
  gui.domElement.style.top = "12px";
  gui.domElement.style.left = "12px";
  gui.domElement.style.right = "auto";
  return gui;
}
