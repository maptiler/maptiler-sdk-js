/**
 * A column pinned to the top left of the page that holds the demo UI: the performance stats,
 * the lil-gui panel and the console panel, always in that order and only the ones a demo uses.
 * It stops above the bottom left corner, where the MapTiler logo and the scale control are.
 */
export type DockSlot = "stats" | "gui" | "console";

const DOCK_CSS = `
.demo-dock {
  position: fixed;
  top: 12px;
  bottom: 48px;
  left: 12px;
  z-index: 10;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  /* the map stays usable in the gaps between the panels */
  pointer-events: none;
}

.demo-dock > * {
  pointer-events: auto;
}

.demo-dock > :empty {
  display: none;
}

.demo-dock-gui,
.demo-dock-console {
  align-self: stretch;
  min-height: 0;
}

.demo-dock-gui {
  flex: 0 1 auto;
  max-height: 50%;
  overflow-y: auto;
}

.demo-dock-console {
  flex: 0 1 auto;
  display: flex;
}
`;

let slots: Record<DockSlot, HTMLElement> | undefined;

/** Returns the element of the dock to put a slot's UI in, creating the dock the first time. */
export function getDockSlot(slot: DockSlot): HTMLElement {
  if (!slots) {
    const style = document.createElement("style");
    style.textContent = DOCK_CSS;
    document.head.appendChild(style);

    const dock = document.createElement("div");
    dock.className = "demo-dock";
    const createSlot = (name: DockSlot) => {
      const element = document.createElement("div");
      element.className = `demo-dock-${name}`;
      dock.appendChild(element);
      return element;
    };
    slots = { stats: createSlot("stats"), gui: createSlot("gui"), console: createSlot("console") };
    document.body.appendChild(dock);
  }

  return slots[slot];
}
