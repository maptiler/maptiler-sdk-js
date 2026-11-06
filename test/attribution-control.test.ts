/* eslint-disable @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-empty-function */
import { describe, expect, it } from "vitest";
import maplibregl from "maplibre-gl";
// imported from the SDK entry point, which is what applies the patch to MapLibre AttributionControl
import { AttributionControl } from "../src";

const OPENSTREETMAP_ATTRIBUTION = '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
const MAPTILER_ATTRIBUTION = `<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ${OPENSTREETMAP_ATTRIBUTION}`;

/**
 * The part of a map AttributionControl reads from, with one used source per attribution
 */
function createMapStub(sourceAttributions: string[]) {
  const tileManagers = Object.fromEntries(sourceAttributions.map((attribution, i) => [`source-${i}`, { used: true, usedForTerrain: false, getSource: () => ({ attribution }) }]));

  return {
    style: { stylesheet: {}, tileManagers },
    _getUIString: (key: string) => key,
    getCanvasContainer: () => ({ offsetWidth: 1000 }),
    on: () => {},
    off: () => {},
  } as unknown as maplibregl.Map;
}

/**
 * Adds MapLibre's AttributionControl, the one the map creates by default, to a map whose sources
 * carry the given attributions and returns the element the attributions are rendered into
 */
function renderSourceAttributions(...attributions: string[]): HTMLElement {
  const control = new maplibregl.AttributionControl({});
  control.onAdd(createMapStub(attributions));
  return control._innerContainer;
}

describe("AttributionControl", () => {
  describe("sanitizes attributions", () => {
    it("removes every event handler attribute, also when several follow each other", () => {
      const inner = renderSourceAttributions('<img src="https://example.com/logo.png" onfoo="1" onerror="alert(1)">');
      expect(inner.innerHTML).toBe('<img src="https://example.com/logo.png">');
    });

    it("removes a javascript: URL that follows a removed attribute", () => {
      const inner = renderSourceAttributions('<a onclick="1" href="javascript:alert(1)">© Source</a>');
      expect(inner.innerHTML).toBe("<a>© Source</a>");
    });

    it.each([
      ["an iframe with srcdoc", '<iframe srcdoc="<script>alert(1)</script>"></iframe>'],
      ["a form with a javascript: action", '<form action="javascript:alert(1)"><button>submit</button></form>'],
      ["a button with a javascript: formaction", '<button formaction="javascript:alert(1)">submit</button>'],
      ["SVG animating a link to javascript:", '<svg><a><animate attributeName="href" values="javascript:alert(1)"/><text>link</text></a></svg>'],
      ["MathML", "<math><mi>x</mi></math>"],
      ["base", '<base href="https://evil.example/">'],
      ["style", "<style>body { display: none }</style>"],
      ["a stylesheet link", '<link rel="stylesheet" href="data:text/css,body { display: none }">'],
      ["a meta refresh", '<meta http-equiv="refresh" content="0;url=https://evil.example/">'],
      ["object", '<object data="https://evil.example/"></object>'],
      ["embed", '<embed src="https://evil.example/">'],
      ["noscript", '<noscript><p title="</noscript><img src=x onerror=alert(1)>"></p></noscript>'],
      ["template", "<template><img src=x onerror=alert(1)></template>"],
    ])("removes %s", (_, markup) => {
      const inner = renderSourceAttributions(`© Source ${markup}`);
      expect(inner.innerHTML).toBe("© Source ");
    });

    it.each([
      ["inline style", 'style="position: fixed; inset: 0"'],
      ["id", 'id="config"'],
      ["name", 'name="config"'],
      ["ping", 'ping="https://evil.example/"'],
    ])("removes the %s attribute", (_, attribute) => {
      const inner = renderSourceAttributions(`<a href="https://example.com/" ${attribute}>© Source</a>`);
      expect(inner.innerHTML).toBe('<a href="https://example.com/">© Source</a>');
    });

    it.each(["javascript:alert(1)", " JaVa&#x09;ScRiPt&colon;alert(1)", "data:text/html,<script>alert(1)</script>"])("removes links to %s", (url) => {
      const inner = renderSourceAttributions(`<a href="${url}">© Source</a>`);
      expect(inner.innerHTML).toBe("<a>© Source</a>");
    });

    it("does not let markup left open in one attribution wrap the others", () => {
      const inner = renderSourceAttributions('<a href="//evil.example">', "© OpenStreetMap contributors");
      expect(inner.innerHTML).toBe('<a href="//evil.example"></a> | © OpenStreetMap contributors');
    });

    it("does not break on markup that shadows the DOM properties a sanitizer reads", () => {
      const control = new maplibregl.AttributionControl({});
      const map = createMapStub([
        "© MapTiler",
        '<form><input name="attributes"><input name="children"><input name="localName"><input name="namespaceURI"><input name="remove"></form>',
      ]);

      expect(() => control.onAdd(map)).not.toThrow();
      expect(control._innerContainer.innerHTML).toBe("© MapTiler");
    });

    it("skips attributions that are empty once sanitized", () => {
      const inner = renderSourceAttributions("© First", "<script>alert(1)</script>", "© Second");
      expect(inner.innerHTML).toBe("© First | © Second");
    });

    it("sanitizes customAttribution", () => {
      const control = new maplibregl.AttributionControl({ customAttribution: '© Custom <iframe srcdoc="<script>alert(1)</script>"></iframe>' });
      control.onAdd(createMapStub([]));
      expect(control._innerContainer.innerHTML).toBe("© Custom ");
    });
  });

  describe("keeps legitimate attributions", () => {
    it("renders the MapTiler and OpenStreetMap attribution unchanged", () => {
      const inner = renderSourceAttributions(MAPTILER_ATTRIBUTION);
      expect(inner.innerHTML).toBe(
        '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
      );
    });

    it("keeps the markup and URLs attributions commonly use", () => {
      const attribution =
        '<a href="https://example.com/" target="_blank" rel="noopener" title="Example">© <b>Example</b></a> <a href="http://example.com/">http</a> <a href="mailto:data@example.com">contact</a> <a href="/terms">terms</a> <img src="https://example.com/logo.png" alt="Example" width="16" height="16"><br><small>data <i>2024</i></small>';
      const inner = renderSourceAttributions(attribution);
      expect(inner.innerHTML).toBe(attribution);
    });

    it("joins attributions with a separator and drops the ones contained in another", () => {
      const inner = renderSourceAttributions(OPENSTREETMAP_ATTRIBUTION, MAPTILER_ATTRIBUTION, "© Other source");
      expect(inner.innerHTML).toBe(
        '© Other source | <a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
      );
    });
  });

  it("sanitizes attributions in the SDK AttributionControl", () => {
    const control = new AttributionControl({});
    control.onAdd(createMapStub(['© Source <iframe srcdoc="<script>alert(1)</script>"></iframe>']));
    expect(control._innerContainer.innerHTML).toBe("© Source ");
  });
});
