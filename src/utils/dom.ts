// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/dom.ts#L22
export function DOMcreate<K extends keyof HTMLElementTagNameMap>(tagName: K, className?: string, container?: HTMLElement): HTMLElementTagNameMap[K] {
  const el = window.document.createElement(tagName);
  if (className !== undefined) el.className = className;
  if (container) container.appendChild(el);
  return el;
}

// This comes from:
// https://github.com/maplibre/maplibre-gl-js/blob/v2.4.0/src/util/dom.ts#L111
export function DOMremove(node: HTMLElement) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
