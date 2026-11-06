/*
 * @license
 * This comes from:
 * https://github.com/maplibre/maplibre-gl-js/blob/v6.16.0/src/util/dom.ts
 * `DOM.sanitize` and the members of `DOM` it uses are turned into module level functions,
 * otherwise the code is unchanged.
 *
 * Copyright (c) 2023, MapLibre contributors
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *     * Neither the name of MapLibre GL JS nor the names of its contributors
 *       may be used to endorse or promote products derived from this software
 *       without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

const ALLOWED_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "del",
  "div",
  "em",
  "i",
  "img",
  "ins",
  "kbd",
  "li",
  "mark",
  "ol",
  "p",
  "q",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "ul",
  "var",
  "wbr",
]);

const ALLOWED_ATTRIBUTES = new Set([
  "alt",
  "class",
  "datetime",
  "dir",
  "height",
  "href",
  "hreflang",
  "lang",
  "referrerpolicy",
  "rel",
  "role",
  "src",
  "target",
  "title",
  "translate",
  "type",
  "width",
]);

const URL_ATTRIBUTES = new Set(["href", "src"]);

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/**
 * Relative URLs have to resolve against something before their protocol can be read. Only the protocol of the
 * result is used, so the base never leaks into the sanitized markup.
 */
const RELATIVE_URL_BASE = "https://maplibre.invalid/";

type ElementInternals = {
  /** Only ever called with a name `getAttributeNames` just returned, so the attribute is always there. */
  getAttribute: (this: Element, qualifiedName: string) => string;
  getAttributeNames: Element["getAttributeNames"];
  querySelectorAll: (this: Element, selectors: string) => NodeListOf<Element>;
  remove: Element["remove"];
  removeAttribute: Element["removeAttribute"];
  localName: (this: Element) => string;
  namespaceURI: (this: Element) => string;
};

let elementInternals: ElementInternals | undefined;

/**
 * The `Element` members the sanitizer uses, read off the prototype rather than off the element it is looking at.
 * A form control named `children`, `remove` or `localName` shadows the same-named property of its own form element,
 * which would otherwise let untrusted markup pick what the sanitizer walking that tree sees.
 *
 * They are read on first use rather than when this module is loaded, since the module is also imported where there
 * is no DOM at all, such as during server side rendering.
 */
function getElementInternals(): ElementInternals {
  /* eslint-disable @typescript-eslint/unbound-method -- they are always called on an element with .call() */
  elementInternals ??= {
    getAttribute: Element.prototype.getAttribute as ElementInternals["getAttribute"],
    getAttributeNames: Element.prototype.getAttributeNames,
    // only the overload for deprecated tag names is deprecated
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    querySelectorAll: Element.prototype.querySelectorAll,
    remove: Element.prototype.remove,
    removeAttribute: Element.prototype.removeAttribute,
    localName: Object.getOwnPropertyDescriptor(Element.prototype, "localName")?.get as ElementInternals["localName"],
    namespaceURI: Object.getOwnPropertyDescriptor(Element.prototype, "namespaceURI")?.get as ElementInternals["namespaceURI"],
  };
  /* eslint-enable @typescript-eslint/unbound-method */
  return elementInternals;
}

/**
 * Sanitize an untrusted HTML string, such as the attribution a remote TileJSON asks the map to display.
 *
 * Only the elements in `ALLOWED_TAGS` and the attributes in `ALLOWED_ATTRIBUTES` survive; anything else is
 * dropped along with its subtree. An allow list is used rather than a list of known-dangerous markup because
 * the latter silently permits whatever it has not heard of yet, including markup added to HTML after it was
 * written.
 *
 * The sanitized nodes are returned rather than a string: serializing and re-parsing is not a round trip, so
 * a string result lets carefully nested markup mutate into a different - and no longer sanitized - tree.
 */
export function sanitizeHTML(str: string): DocumentFragment {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, "text/html");
  const body = doc.body;

  const { querySelectorAll, remove } = getElementInternals();
  for (const element of Array.from<Element>(querySelectorAll.call(body, "*"))) {
    if (isAllowedElement(element)) {
      removeDisallowedAttributes(element);
    } else {
      remove.call(element);
    }
  }

  const fragment = document.createDocumentFragment();
  fragment.append(...body.childNodes);
  return fragment;
}

/**
 * An element is allowed only when it is plain HTML markup on the allow list. Elements in the SVG and MathML
 * namespaces are rejected even when their local name is allowed, since foreign content follows different
 * parsing rules and is what makes most mutation attacks possible in the first place.
 */
function isAllowedElement(element: Element): boolean {
  const { namespaceURI, localName } = getElementInternals();
  return namespaceURI.call(element) === HTML_NAMESPACE && ALLOWED_TAGS.has(localName.call(element));
}

function removeDisallowedAttributes(element: Element) {
  const { getAttributeNames, getAttribute, removeAttribute } = getElementInternals();
  for (const name of getAttributeNames.call(element)) {
    if (isAllowedAttribute(name, getAttribute.call(element, name))) continue;
    removeAttribute.call(element, name);
  }
}

/**
 * `href` and `src` are further restricted to the protocols in `ALLOWED_PROTOCOLS`, so that `javascript:` and
 * `data:` URLs cannot turn an otherwise harmless link or image into a script. The protocol is taken from a
 * parsed URL rather than matched against the raw string, since the URL parser is what the browser will apply
 * and it ignores tabs, newlines and leading control characters that a string comparison would trip over.
 */
function isAllowedAttribute(name: string, value: string): boolean {
  if (!ALLOWED_ATTRIBUTES.has(name) && !name.startsWith("aria-")) return false;
  if (!URL_ATTRIBUTES.has(name)) return true;
  try {
    return ALLOWED_PROTOCOLS.has(new URL(value, RELATIVE_URL_BASE).protocol);
  } catch {
    return false;
  }
}
