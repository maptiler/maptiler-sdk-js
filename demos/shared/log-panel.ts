import { getDockSlot } from "./dock";

/**
 * Shows the demo's console output on the page, e.g. to show an event being fired, in the dock at the top left.
 * It wraps the global console, so everything logged appears, the SDK's own messages included, filtered by level
 * with the toggles of the panel. The browser console still gets every call.
 * Uncaught errors aren't shown: this is demo output, not an error catcher.
 */

export type LogLevel = "log" | "info" | "warn" | "error" | "table";

export type LogPanelOptions = {
  title?: string;
  /** Oldest entries are dropped beyond this */
  maxEntries?: number;
  collapsed?: boolean;
};

const ALL_LEVELS: LogLevel[] = ["log", "info", "warn", "error", "table"];
// Levels shown at first, the others are turned on in the panel
const INITIAL_LEVELS: LogLevel[] = ["log"];

// Formatting limits: one-line entries are cut at MAX_LINE_LENGTH and expand on click
const LINE_DEPTH = 2;
const EXPANDED_DEPTH = 3;
const MAX_LINE_LENGTH = 200;
const MAX_ARRAY_ITEMS = 10;
const MAX_OBJECT_KEYS = 20;
const MAX_TABLE_ROWS = 20;

// Smallest size the panel can be dragged to, the height being the one of its entries
const MIN_WIDTH = 240;
const MIN_BODY_HEIGHT = 80;

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 };

// Colours and fonts of lil-gui's default theme, so the panel looks like a second lil-gui panel
const LOG_PANEL_CSS = `
.demo-log {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: none;
  width: 100%;
  min-height: 0;
  background: #1f1f1f;
  color: #ebebeb;
  font: 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}

.demo-log-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  height: 27px;
  flex: none;
  background: #111111;
}

.demo-log-title button {
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  padding: 0;
}

.demo-log-toggle {
  flex: 1;
  text-align: left;
  font-weight: 600 !important;
}

.demo-log-toggle::before {
  content: "▾ ";
}

.demo-log.collapsed .demo-log-toggle::before {
  content: "▸ ";
}

.demo-log-count {
  color: #b8b8b8;
}

.demo-log-levels {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
  flex: none;
  border-top: 1px solid #2c2c2c;
}

.demo-log-levels button {
  padding: 1px 6px;
  border: 1px solid #424242;
  border-radius: 2px;
  background: none;
  color: #8a8a8a;
  font: 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  text-transform: uppercase;
  cursor: pointer;
}

.demo-log-levels button[aria-pressed="true"] {
  background: #424242;
  color: #ebebeb;
}

.demo-log.collapsed .demo-log-levels {
  display: none;
}

.demo-log-resize {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 14px;
  height: 14px;
  cursor: nwse-resize;
  touch-action: none;
  background: linear-gradient(135deg, transparent 55%, #8a8a8a 55%, #8a8a8a 62%, transparent 62%, transparent 75%, #8a8a8a 75%, #8a8a8a 82%, transparent 82%);
}

.demo-log.collapsed .demo-log-resize {
  display: none;
}

.demo-log-body.hide-log .demo-log-log,
.demo-log-body.hide-info .demo-log-info,
.demo-log-body.hide-warn .demo-log-warn,
.demo-log-body.hide-error .demo-log-error,
.demo-log-body.hide-table .demo-log-table {
  display: none;
}

.demo-log-clear {
  padding: 2px 6px !important;
  background: #424242 !important;
  border-radius: 2px;
}

.demo-log-body {
  min-height: 80px;
  overflow-y: auto;
  font-family: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
}

.demo-log.collapsed .demo-log-body {
  display: none;
}

.demo-log-entry {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 3px 8px;
  border-top: 1px solid #2c2c2c;
}

.demo-log-entry.expandable {
  cursor: pointer;
}

.demo-log-time {
  flex: none;
  color: #8a8a8a;
}

.demo-log-level {
  flex: none;
  padding: 0 4px;
  border-radius: 2px;
  background: #424242;
  font-size: 9px;
  text-transform: uppercase;
}

.demo-log-message {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.demo-log-message pre {
  margin: 0;
  white-space: pre-wrap;
  font: inherit;
}

.demo-log-repeats {
  flex: none;
  padding: 0 5px;
  border-radius: 8px;
  background: #2cc9ff;
  color: #1f1f1f;
}

.demo-log-info .demo-log-level { background: #2c6fbf; }
.demo-log-warn { background: #3a3218; color: #ffd76a; }
.demo-log-warn .demo-log-level { background: #8a6d1a; color: #fff; }
.demo-log-error { background: #3b1e1e; color: #ff8a8a; }
.demo-log-error .demo-log-level { background: #a03a3a; color: #fff; }

.demo-log-message table {
  border-collapse: collapse;
  margin-top: 2px;
}

.demo-log-message th,
.demo-log-message td {
  padding: 1px 6px;
  border: 1px solid #424242;
  text-align: left;
  white-space: nowrap;
}

.demo-log-message th {
  background: #2c2c2c;
}

.demo-log-more {
  color: #8a8a8a;
}
`;

function className(value: object): string {
  const name = (Object.getPrototypeOf(value) as { constructor?: { name?: string } } | null)?.constructor?.name;
  return name && name !== "Object" ? `${name} ` : "";
}

/**
 * Formats a value the way the browser console does, compactly: objects show their class name and keys down to `depth`,
 * circular references show as `[Circular]`. With `indent`, objects and arrays are spread over several lines.
 */
function formatValue(value: unknown, depth: number, indent?: string, seen = new WeakSet<object>(), topLevel = true): string {
  if (typeof value === "string") return topLevel ? value : JSON.stringify(value);
  if (typeof value === "function") return `ƒ ${value.name || "anonymous"}()`;
  if (typeof value === "symbol" || typeof value === "bigint") return value.toString();
  if (value === null || typeof value !== "object") return String(value);

  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Date) return value.toISOString();
  if (typeof Node !== "undefined" && value instanceof Node) {
    return value instanceof Element ? `<${value.tagName.toLowerCase()}${value.id ? `#${value.id}` : ""}>` : value.nodeName;
  }
  if (seen.has(value)) return "[Circular]";

  const isArray = Array.isArray(value);
  if (depth <= 0) return isArray ? `Array(${String(value.length)})` : `${className(value)}{…}`;

  seen.add(value);
  const innerIndent = indent === undefined ? undefined : `${indent}  `;
  const format = (item: unknown) => formatValue(item, depth - 1, innerIndent, seen, false);

  let items: string[];
  let hidden: number;
  if (isArray) {
    items = value.slice(0, MAX_ARRAY_ITEMS).map(format);
    hidden = value.length - items.length;
  } else {
    const keys = Object.keys(value);
    items = keys.slice(0, MAX_OBJECT_KEYS).map((key) => {
      let item: unknown;
      try {
        item = (value as Record<string, unknown>)[key];
      } catch {
        item = "[Error]";
      }
      return `${key}: ${format(item)}`;
    });
    hidden = keys.length - items.length;
  }
  seen.delete(value);

  if (hidden > 0) items.push(`…+${String(hidden)}`);
  const [open, close] = isArray ? ["[", "]"] : [`${className(value)}{`, "}"];
  if (items.length === 0) return `${open}${close}`;
  if (innerIndent === undefined) return `${open}${items.join(", ")}${close}`;
  return `${open}\n${innerIndent}${items.join(`,\n${innerIndent}`)}\n${indent ?? ""}${close}`;
}

/** A run of text of a log entry, with the CSS given to it by a `%c` of the format string, if any */
type Segment = { text: string; css: string };

/**
 * Formats the arguments of a console call into runs of text. As in the browser console, a first argument that is a string
 * can hold format specifiers, each using up the next argument: `%c` styles the text after it with that CSS,
 * `%s` `%d` `%i` `%f` `%o` `%O` insert it, and `%%` is a literal `%`. The arguments left over are appended, unstyled.
 */
function formatSegments(args: unknown[], depth: number, indent?: string): Segment[] {
  const segments: Segment[] = [];
  let rest = args;

  const [first] = args;
  if (typeof first === "string" && first.includes("%")) {
    rest = args.slice(1);
    let css = "";
    let text = "";
    const flush = () => {
      if (text) segments.push({ text, css });
      text = "";
    };

    let lastIndex = 0;
    for (const match of first.matchAll(/%([csdifoO%])/g)) {
      text += first.slice(lastIndex, match.index);
      lastIndex = match.index + match[0].length;
      const specifier = match[1];
      if (specifier === "%") {
        text += "%";
        continue;
      }
      // a specifier without an argument left stays as it is
      if (rest.length === 0) {
        text += match[0];
        continue;
      }

      const [value] = rest;
      rest = rest.slice(1);
      if (specifier === "c") {
        flush();
        css = String(value);
      } else if (specifier === "d" || specifier === "i") {
        text += String(parseInt(String(value), 10));
      } else if (specifier === "f") {
        text += String(parseFloat(String(value)));
      } else {
        text += formatValue(value, depth, indent);
      }
    }
    text += first.slice(lastIndex);
    flush();
  }

  for (const arg of rest) {
    segments.push({ text: (segments.length > 0 ? " " : "") + formatValue(arg, depth, indent), css: "" });
  }
  return segments;
}

function segmentsText(segments: Segment[]) {
  return segments.map(({ text }) => text).join("");
}

/** Cuts the segments down to `maxLength` characters in all, ending with an ellipsis. */
function truncateSegments(segments: Segment[], maxLength: number): Segment[] {
  const truncated: Segment[] = [];
  let remaining = maxLength;
  for (const segment of segments) {
    if (segment.text.length >= remaining) {
      truncated.push({ ...segment, text: `${segment.text.slice(0, remaining)}…` });
      break;
    }
    truncated.push(segment);
    remaining -= segment.text.length;
  }
  return truncated;
}

/** Replaces the content of `target` with the segments, styled ones in spans. */
function renderSegments(target: HTMLElement, segments: Segment[]) {
  target.replaceChildren(
    ...segments.map(({ text, css }) => {
      if (!css) return document.createTextNode(text);
      const span = document.createElement("span");
      span.style.cssText = css;
      // as in the browser console, the styles can't move the text out of the entry
      span.style.position = "";
      span.style.display = "inline";
      span.textContent = text;
      return span;
    }),
  );
}

/** Renders `console.table(data, columns)` as an HTML table, or returns undefined when `data` isn't tabular. */
function renderTable(data: unknown, columns: unknown): HTMLTableElement | undefined {
  if (data === null || typeof data !== "object") return undefined;

  const rows = Object.entries(data as Record<string, unknown>);
  const hasObjectRows = rows.some(([, row]) => row !== null && typeof row === "object");
  if (!hasObjectRows) return undefined;

  const keys = Array.isArray(columns) ? columns.map(String) : [...new Set(rows.flatMap(([, row]) => (row !== null && typeof row === "object" ? Object.keys(row) : [])))];
  const hasValues = rows.some(([, row]) => row === null || typeof row !== "object");

  const table = document.createElement("table");
  const head = table.insertRow();
  for (const label of ["(index)", ...keys, ...(hasValues ? ["Values"] : [])]) {
    const th = document.createElement("th");
    th.textContent = label;
    head.appendChild(th);
  }

  for (const [index, row] of rows.slice(0, MAX_TABLE_ROWS)) {
    const tr = table.insertRow();
    tr.insertCell().textContent = index;
    const isObject = row !== null && typeof row === "object";
    for (const key of keys) {
      tr.insertCell().textContent = isObject && key in row ? formatValue((row as Record<string, unknown>)[key], 1, undefined, undefined, false) : "";
    }
    if (hasValues) tr.insertCell().textContent = isObject ? "" : formatValue(row, 1, undefined, undefined, false);
  }

  if (rows.length > MAX_TABLE_ROWS) {
    const more = table.insertRow().insertCell();
    more.colSpan = keys.length + (hasValues ? 2 : 1);
    more.className = "demo-log-more";
    more.textContent = `+${String(rows.length - MAX_TABLE_ROWS)} more`;
  }

  return table;
}

let stylesInjected = false;

export function createLogPanelUI({ title = "Console", maxEntries = 200, collapsed = false }: LogPanelOptions = {}) {
  if (!stylesInjected) {
    const style = document.createElement("style");
    style.textContent = LOG_PANEL_CSS;
    document.head.appendChild(style);
    stylesInjected = true;
  }

  const panel = document.createElement("div");
  panel.className = "demo-log";
  panel.classList.toggle("collapsed", collapsed);

  const titleBar = document.createElement("div");
  titleBar.className = "demo-log-title";
  const toggle = document.createElement("button");
  toggle.className = "demo-log-toggle";
  toggle.textContent = title;
  const count = document.createElement("span");
  count.className = "demo-log-count";
  const clearButton = document.createElement("button");
  clearButton.className = "demo-log-clear";
  clearButton.textContent = "clear";
  titleBar.append(toggle, count, clearButton);

  const body = document.createElement("div");
  body.className = "demo-log-body";

  // Every level is captured, the toggles only hide or show entries, so turning a level on shows its earlier entries too
  const shownLevels = new Set(INITIAL_LEVELS);
  const levelToggles = document.createElement("div");
  levelToggles.className = "demo-log-levels";
  for (const level of ALL_LEVELS) {
    const button = document.createElement("button");
    button.textContent = level;
    const update = () => {
      const isShown = shownLevels.has(level);
      button.setAttribute("aria-pressed", String(isShown));
      body.classList.toggle(`hide-${level}`, !isShown);
    };
    button.addEventListener("click", () => {
      if (!shownLevels.delete(level)) shownLevels.add(level);
      update();
      updateCount();
    });
    update();
    levelToggles.appendChild(button);
  }

  // Dragging the bottom right corner resizes the panel. Its height stays within the space the dock has left.
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "demo-log-resize";
  resizeHandle.title = "Drag to resize";
  resizeHandle.addEventListener("pointerdown", (down) => {
    down.preventDefault();
    resizeHandle.setPointerCapture(down.pointerId);
    const start = { x: down.clientX, y: down.clientY, width: panel.offsetWidth, height: body.offsetHeight };
    const maxWidth = window.innerWidth - panel.getBoundingClientRect().left - 12;

    const onMove = (move: PointerEvent) => {
      const width = Math.min(maxWidth, Math.max(MIN_WIDTH, start.width + move.clientX - start.x));
      const height = Math.max(MIN_BODY_HEIGHT, start.height + move.clientY - start.y);
      panel.style.width = `${String(width)}px`;
      body.style.height = `${String(height)}px`;
    };
    const onEnd = () => {
      resizeHandle.removeEventListener("pointermove", onMove);
      resizeHandle.removeEventListener("pointerup", onEnd);
      resizeHandle.removeEventListener("pointercancel", onEnd);
    };
    resizeHandle.addEventListener("pointermove", onMove);
    resizeHandle.addEventListener("pointerup", onEnd);
    resizeHandle.addEventListener("pointercancel", onEnd);
  });

  panel.append(titleBar, levelToggles, body, resizeHandle);
  getDockSlot("console").appendChild(panel);

  let last: { key: string; repeats: number; time: HTMLElement; badge: HTMLElement } | undefined;

  /** Shows the number of entries at the shown levels */
  function updateCount() {
    const entries = Array.from(body.children) as HTMLElement[];
    count.textContent = String(entries.filter((entry) => shownLevels.has(entry.dataset.level as LogLevel)).length);
  }

  function clear() {
    body.replaceChildren();
    last = undefined;
    updateCount();
  }

  toggle.addEventListener("click", () => panel.classList.toggle("collapsed"));
  clearButton.addEventListener("click", clear);

  function addEntry(level: LogLevel, args: unknown[]) {
    const now = new Date().toLocaleTimeString(undefined, TIME_FORMAT_OPTIONS);
    const segments = formatSegments(args, LINE_DEPTH);
    const line = segmentsText(segments);
    const key = `${level}:${line}`;

    // identical back-to-back entries show once, with a count
    if (last?.key === key) {
      last.repeats++;
      last.badge.textContent = `×${String(last.repeats)}`;
      last.badge.hidden = false;
      last.time.textContent = now;
      return;
    }

    const isAtBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 4;

    const entry = document.createElement("div");
    entry.className = `demo-log-entry demo-log-${level}`;
    entry.dataset.level = level;
    const time = document.createElement("span");
    time.className = "demo-log-time";
    time.textContent = now;
    const tag = document.createElement("span");
    tag.className = "demo-log-level";
    tag.textContent = level;
    const message = document.createElement("span");
    message.className = "demo-log-message";
    const badge = document.createElement("span");
    badge.className = "demo-log-repeats";
    badge.hidden = true;

    const table = level === "table" ? renderTable(args[0], args[1]) : undefined;
    if (table) {
      message.appendChild(table);
    } else {
      const isTruncated = line.length > MAX_LINE_LENGTH;
      const hasObjects = args.some((arg) => arg !== null && typeof arg === "object");
      const short = isTruncated ? truncateSegments(segments, MAX_LINE_LENGTH) : segments;
      renderSegments(message, short);

      // a click shows the full value, over several lines and one level deeper
      if (isTruncated || hasObjects) {
        entry.classList.add("expandable");
        let expanded = false;
        entry.addEventListener("click", () => {
          expanded = !expanded;
          if (expanded) {
            const pre = document.createElement("pre");
            renderSegments(pre, formatSegments(args, EXPANDED_DEPTH, ""));
            message.replaceChildren(pre);
          } else {
            renderSegments(message, short);
          }
        });
      }
    }

    entry.append(time, tag, message, badge);
    body.appendChild(entry);
    while (body.childElementCount > maxEntries) body.firstElementChild?.remove();
    last = { key, repeats: 1, time, badge };
    updateCount();

    // follows the newest entry, unless scrolled up to read an older one
    if (isAtBottom) body.scrollTop = body.scrollHeight;
  }

  const originals = new Map<LogLevel, (...args: unknown[]) => void>();
  // set while an entry is added, so a value logging from a getter can't loop back into the panel
  let isAdding = false;

  for (const level of ALL_LEVELS) {
    const original = console[level].bind(console) as (...args: unknown[]) => void;
    originals.set(level, console[level] as (...args: unknown[]) => void);
    console[level] = (...args: unknown[]) => {
      original(...args);
      if (isAdding) return;
      isAdding = true;
      try {
        addEntry(level, args);
      } catch (error) {
        original("Log panel failed to show an entry", error);
      } finally {
        isAdding = false;
      }
    };
  }

  updateCount();

  return {
    clear,
    /** Puts the original console back and removes the panel */
    destroy() {
      for (const [level, original] of originals) console[level] = original;
      panel.remove();
    },
  };
}
