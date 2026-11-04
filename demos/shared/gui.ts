import GUI from "lil-gui";
import { getDockSlot } from "./dock";

/**
 * Creates a lil-gui panel for a demo (https://lil-gui.georgealways.com), in the dock at the top left of the page,
 * as lil-gui's default top right corner is where the map controls are.
 */
export function createGui(title: string) {
  return new GUI({ title, container: getDockSlot("gui"), width: 300 });
}
