var vl = Object.defineProperty;
var xi = (r) => {
  throw TypeError(r);
};
var bl = (r, e, t) => e in r ? vl(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var y = (r, e, t) => bl(r, typeof e != "symbol" ? e + "" : e, t), Kr = (r, e, t) => e.has(r) || xi("Cannot " + t);
var A = (r, e, t) => (Kr(r, e, "read from private field"), t ? t.call(r) : e.get(r)), te = (r, e, t) => e.has(r) ? xi("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), ie = (r, e, t, n) => (Kr(r, e, "write to private field"), n ? n.call(r, t) : e.set(r, t), t), ae = (r, e, t) => (Kr(r, e, "access private method"), t);
import C from "maplibre-gl";
import { v4 as Bt } from "uuid";
import { Base64 as wl } from "js-base64";
import Sl from "events";
import * as Xt from "@maptiler/client";
import { Language as xl, getLanguageInfoFromCode as Ci, config as Zr, MapStyle as rt, mapStylePresetList as cr, expandMapStyle as Cl, MapStyleVariant as Wa, ReferenceMapStyle as Ya, toLanguageInfo as Ai, getLanguageInfoFromFlag as Al, geolocation as Li } from "@maptiler/client";
import { MapStyle as $m, MapStyleVariant as jm, ReferenceMapStyle as Um, ServiceError as Bm, areSameLanguages as Vm, bufferToPixelDataBrowser as qm, canParsePixelData as Gm, circumferenceAtLatitude as Hm, coordinates as Km, data as Zm, elevation as Wm, expandMapStyle as Ym, geolocation as Xm, getAutoLanguage as Jm, getBufferToPixelDataParser as Qm, getLanguageInfoFromCode as ey, getLanguageInfoFromFlag as ty, getLanguageInfoFromKey as ry, getTileCache as ny, isLanguageInfo as iy, mapStylePresetList as ay, math as oy, misc as sy, staticMaps as ly, styleToStyle as uy, toLanguageInfo as cy } from "@maptiler/client";
(function() {
  typeof window > "u" || (window.requestIdleCallback = window.requestIdleCallback || function(r) {
    const e = Date.now();
    return setTimeout(function() {
      r({
        didTimeout: !1,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - e));
        }
      });
    }, 1);
  }, window.cancelIdleCallback = window.cancelIdleCallback || function(r) {
    clearTimeout(r);
  });
})();
function Sr(r) {
  if (!r)
    return {};
  const e = Object.keys(r).sort().map((t) => [t, r[t]]);
  return Object.fromEntries(e);
}
function Wr(r, e) {
  const t = { ...r };
  for (const n of e)
    delete t[n];
  return t;
}
const Vt = {
  xs: 8,
  s: 24,
  m: 32,
  l: 40
}, Xa = {
  none: "none",
  soft: "drop-shadow(0px 1px 0px rgba(0, 0, 0, 0.2))",
  medium: "drop-shadow(0px 2px 2px rgba(29, 29, 29, 0.2))",
  strong: "drop-shadow(0px 2px 4px rgba(29, 29, 29, 0.2))"
}, ve = {
  circle: {
    viewBox: [32, 32],
    anchor: "center",
    anchorY: 32,
    outerPath: "M16 0A16 16 0 1 0 16 32A16 16 0 1 0 16 0Z",
    inner: { type: "circle", cx: 16, cy: 16, r: 13 },
    content: { cx: 16, cy: 16, r: 10.5 }
  },
  square: {
    viewBox: [32, 32],
    anchor: "center",
    anchorY: 32,
    outerPath: "M6 0H26A6 6 0 0 1 32 6V26A6 6 0 0 1 26 32H6A6 6 0 0 1 0 26V6A6 6 0 0 1 6 0Z",
    inner: { type: "path", d: "M5 3H27A2 2 0 0 1 29 5V27A2 2 0 0 1 27 29H5A2 2 0 0 1 3 27V5A2 2 0 0 1 5 3Z" },
    imageClip: {
      type: "path",
      d: "M5 3H27A2 2 0 0 1 29 5V27A2 2 0 0 1 27 29H5A2 2 0 0 1 3 27V5A2 2 0 0 1 5 3Z",
      x: 3,
      y: 3,
      w: 26,
      h: 26
    },
    content: { cx: 16, cy: 16, r: 10.5 }
  },
  "bubble-circle": {
    viewBox: [35, 35],
    anchor: "bottom",
    anchorY: 35,
    outerPath: "M17.5 0C26.3366 0 33.5 7.16344 33.5 16C33.4998 23.2141 28.7247 29.3114 22.1631 31.3076L18.1943 34.7402C17.7949 35.0856 17.2051 35.0856 16.8057 34.7402L12.8359 31.3076C6.2748 29.3111 1.50016 23.2138 1.5 16C1.5 7.16344 8.66344 0 17.5 0Z",
    inner: { type: "circle", cx: 17.5, cy: 16, r: 13 },
    content: { cx: 17.5, cy: 16, r: 10.5 }
  },
  "bubble-square": {
    viewBox: [34, 34],
    anchor: "bottom",
    anchorY: 34,
    outerPath: "M28 0C31.3137 0 34 2.68629 34 6V24C34 27.3137 31.3137 30 28 30H21.9961L17.6504 33.7568C17.2759 34.0805 16.7241 34.0805 16.3496 33.7568L12.0039 30H6C2.68629 30 4.83208e-08 27.3137 0 24V6C0 2.68629 2.68629 8.0532e-08 6 0H28Z",
    inner: {
      type: "path",
      d: "M3 5C3 3.89543 3.89543 3 5 3H29C30.1046 3 31 3.89543 31 5V25C31 26.1046 30.1046 27 29 27H5C3.89543 27 3 26.1046 3 25V5ZM21.3529 26.71L17 30.5L12.6471 26.71H21.3529Z"
    },
    imageClip: {
      type: "path",
      d: "M3 5C3 3.89543 3.89543 3 5 3H29C30.1046 3 31 3.89543 31 5V25C31 26.1046 30.1046 27 29 27H5C3.89543 27 3 26.1046 3 25V5Z",
      x: 3,
      y: 3,
      w: 28,
      h: 24
    },
    pointerPath: "M21.3529 26.71L17 30.5L12.6471 26.71H21.3529Z",
    content: { cx: 17, cy: 15, r: 10 }
  },
  maptiler: {
    viewBox: [40, 40],
    anchor: "bottom",
    anchorY: 40,
    outerPath: "M20 0C29.3888 0 37 7.55845 37 16.8823C37 22.2594 34.4634 26.5985 30.8308 30.1408C27.1982 33.683 20 40 20 40C20 40 12.95496 33.683 9.16891 30.1408C5.38286 26.5985 3 22.2593 3 16.8823C3 7.55845 10.61116 0 20 0Z",
    inner: { type: "circle", cx: 20, cy: 17, r: 14 },
    content: { cx: 20, cy: 17, r: 11 },
    // the MapTiler diamond mark
    defaultContent: {
      d: "M0.37305 6.90062C-0.12435 6.40322 -0.12435 5.59678 0.37305 5.09938L5.09938 0.37305C5.59678 -0.12435 6.40322 -0.12435 6.90062 0.37305L11.6269 5.09938C12.1243 5.59678 12.1243 6.40322 11.6269 6.90062L6.90062 11.6269C6.40322 12.1243 5.59678 12.1243 5.09938 11.6269L0.37305 6.90062Z",
      size: 12
    }
  },
  "maptiler-full": {
    viewBox: [40, 40],
    anchor: "bottom",
    anchorY: 40,
    outerPath: "M20 0C29.3888 0 37 7.55845 37 16.8823C37 22.2594 34.4634 26.5985 30.8308 30.1408C27.1982 33.683 20 40 20 40C20 40 12.95496 33.683 9.16891 30.1408C5.38286 26.5985 3 22.2593 3 16.8823C3 7.55845 10.61116 0 20 0Z",
    inner: {
      type: "path",
      d: "M20 3C27.732 3 34 9.23572 34 16.9279C34 21.364 31.911 24.9438 28.9195 27.8661C25.9279 30.7885 20 36 20 36C20 36 14.1982 30.7885 11.08028 27.8661C7.96235 24.9438 6 21.3639 6 16.9279C6 9.23572 12.26801 3 20 3Z"
    },
    imageClip: {
      type: "path",
      d: "M20 3C27.732 3 34 9.23572 34 16.9279C34 21.364 31.911 24.9438 28.9195 27.8661C25.9279 30.7885 20 36 20 36C20 36 14.1982 30.7885 11.08028 27.8661C7.96235 24.9438 6 21.3639 6 16.9279C6 9.23572 12.26801 3 20 3Z",
      x: 6,
      y: 3,
      w: 28,
      h: 33
    },
    content: { cx: 20, cy: 17, r: 11 }
  }
}, _e = "maptiler", Oe = "m", Ja = 2;
function yt(r, e) {
  if (e === "xs") return [0, 0];
  const t = ve[r];
  if (t.anchor === "center") return [0, 0];
  const n = Vt[e], i = n / t.viewBox[1];
  return [0, -(t.anchorY * i - n / 2)];
}
const Ei = 24, Ll = /* @__PURE__ */ new Map();
function El(r) {
  return Ll.get(r);
}
const Ti = {
  base: { innerColor: "#4D7FFF", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  "base-dark": { innerColor: "#80A4FF", outerColor: "#292929", contentColor: "#292929", outlineColor: "transparent" },
  streets: { innerColor: "#0060E5", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  "streets-dark": { innerColor: "#4D97FF", outerColor: "#292929", contentColor: "#292929", outlineColor: "transparent" },
  hybrid: { innerColor: "#0073E5", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  dataviz: { innerColor: "#1A94FF", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" },
  "dataviz-dark": { innerColor: "#4DACFF", outerColor: "#292929", contentColor: "#292929", outlineColor: "transparent" },
  topo: { innerColor: "#1A79FF", outerColor: "#FFFFFF", contentColor: "#FFFFFF", outlineColor: "transparent" }
};
function Tl(r) {
  return r.toLowerCase().replace(/-v\d+/, "");
}
function Wn(r) {
  const e = Ti, t = Tl(r), n = t.split("-")[0];
  return e[t] ?? e[n] ?? Ti.base;
}
const kl = "http://www.w3.org/2000/svg";
function H(r) {
  return document.createElementNS(kl, r);
}
const ot = "marker-transform-wrapper", Qa = "maptiler-sdk-marker-font";
function Lt(r) {
  return r.classList.contains(ot) ? r : r.querySelector(`.${ot}`) ?? r;
}
function eo(r, e) {
  const t = Wn("");
  r.style.setProperty("--marker-outer-color", e.outerColor ?? t.outerColor), r.style.setProperty("--marker-inner-color", e.innerColor ?? t.innerColor), r.style.setProperty("--marker-content-color", e.contentColor ?? t.contentColor), r.style.setProperty("--marker-outline-color", e.outlineColor ?? t.outlineColor), r.style.setProperty("--marker-shadow", e.shadow ? Xa[e.shadow] : "none");
}
function Il(r) {
  const e = r.shape ?? _e, t = r.size ?? Oe, n = document.createElement("div");
  n.className = ot, n.style.transformOrigin = ve[e].anchor === "center" ? "center" : "center bottom", n.dataset.markerShape = e, n.dataset.markerSize = t, eo(n, r);
  const [i, a] = r.scale ?? [1, 1];
  n.dataset.scaleX = String(i), n.dataset.scaleY = String(a), n.dataset.rotation = String(r.rotation ?? 0), xr(n), r.opacity !== void 0 && (n.style.opacity = String(r.opacity)), r.name && n.classList.add(r.name), n.appendChild(t === "xs" ? Xn() : Jn(e, t, r)), r.debug && ro(n, !0);
  const o = Wl(n);
  if (r.title && o.setAttribute("title", r.title), r.htmlAttributes)
    for (const [s, l] of Object.entries(r.htmlAttributes))
      o.setAttribute(s, String(l));
  return Yl(o), o;
}
function Jt(r, e, t) {
  const n = Lt(r);
  let i;
  const a = () => i ?? (i = Wn(t ?? ""));
  if ("outerColor" in e && n.style.setProperty("--marker-outer-color", e.outerColor ?? a().outerColor), "innerColor" in e && n.style.setProperty("--marker-inner-color", e.innerColor ?? a().innerColor), "contentColor" in e) {
    n.style.setProperty("--marker-content-color", e.contentColor ?? a().contentColor);
    const o = n.querySelector(".marker-content");
    o && o.setAttribute("fill", "var(--marker-content-color)");
  }
  if ("outlineColor" in e && n.style.setProperty("--marker-outline-color", e.outlineColor ?? a().outlineColor), "outline" in e) {
    const o = n.querySelector(".marker-outer");
    if (e.outline) {
      const s = e.outline === !0 ? Ja : e.outline;
      o == null || o.setAttribute("stroke-width", String(s));
    } else
      o == null || o.removeAttribute("stroke-width");
  }
  if ("shadow" in e && n.style.setProperty("--marker-shadow", e.shadow ? Xa[e.shadow] : "none"), "opacity" in e && (n.style.opacity = e.opacity === void 0 ? "" : String(e.opacity)), "title" in e && (e.title ? r.setAttribute("title", e.title) : r.removeAttribute("title")), "content" in e && Ml(n, e.content), "htmlAttributes" in e && e.htmlAttributes)
    for (const [o, s] of Object.entries(e.htmlAttributes))
      r.setAttribute(o, String(s));
  if ("rotation" in e && (n.dataset.rotation = String(e.rotation ?? 0), xr(n)), "scale" in e) {
    const [o, s] = e.scale ?? [1, 1];
    n.dataset.scaleX = String(o), n.dataset.scaleY = String(s), xr(n);
  }
  "size" in e && Pl(n, e.size ?? Oe), "shape" in e && Rl(n, e.shape ?? _e), "debug" in e && ro(n, !!e.debug), "priority" in e && (typeof e.priority == "number" ? r.style.zIndex = String(e.priority) : r.style.removeProperty("z-index"));
}
const to = "marker-shape";
function Yn(r) {
  return r.querySelector(`svg.${to}`);
}
function Ml(r, e) {
  const t = Yn(r);
  if (!t) return;
  const n = t.querySelector(".marker-content"), i = r.dataset.markerShape ?? _e;
  if (n instanceof SVGTextElement) {
    e ? n.textContent = e : (n.remove(), so(t, ve[i]));
    return;
  }
  e && (n == null || n.remove(), _r(t, e, ve[i]));
}
function Pl(r, e) {
  const t = Yn(r), n = r.querySelector("svg.marker-dot");
  if (r.dataset.markerSize = e, e === "xs") {
    t && (t.style.display = "none"), n || r.appendChild(Xn());
    return;
  }
  if (n == null || n.remove(), !t) {
    const a = r.dataset.markerShape ?? _e;
    r.appendChild(Jn(a, e));
    return;
  }
  t.style.display = "block";
  const i = String(Vt[e]);
  t.setAttribute("width", i), t.setAttribute("height", i);
}
const _l = "#ff00ff";
function ro(r, e) {
  const t = r.classList.contains(ot) ? r : r.querySelector(`.${ot}`);
  if (!t) return;
  const n = t.querySelector(".marker-debug");
  if (!e) {
    n == null || n.remove();
    return;
  }
  n || (t.style.position = "relative", t.appendChild(Ol()));
}
function Ol() {
  const r = H("svg");
  r.classList.add("marker-debug"), r.style.position = "absolute", r.style.inset = "0", r.style.width = "100%", r.style.height = "100%", r.style.overflow = "visible", r.style.pointerEvents = "none";
  const e = H("rect");
  e.setAttribute("x", "0"), e.setAttribute("y", "0"), e.setAttribute("width", "100%"), e.setAttribute("height", "100%"), e.setAttribute("fill", "none"), e.setAttribute("stroke-dasharray", "4 4"), r.appendChild(e);
  const t = H("line");
  t.setAttribute("x1", "0"), t.setAttribute("y1", "50%"), t.setAttribute("x2", "100%"), t.setAttribute("y2", "50%"), t.setAttribute("opacity", "0.5"), r.appendChild(t);
  const n = H("line");
  n.setAttribute("x1", "50%"), n.setAttribute("y1", "0"), n.setAttribute("x2", "50%"), n.setAttribute("y2", "100%"), n.setAttribute("opacity", "0.5"), r.appendChild(n);
  const i = H("line");
  i.setAttribute("x1", "50%"), i.setAttribute("y1", "50%"), i.setAttribute("x2", "50%"), i.setAttribute("y2", "50%"), i.setAttribute("stroke-linecap", "round"), i.setAttribute("stroke-width", "5"), r.appendChild(i);
  for (const a of [e, t, n, i])
    a.setAttribute("stroke", _l), a.hasAttribute("stroke-width") || a.setAttribute("stroke-width", "1"), a.setAttribute("vector-effect", "non-scaling-stroke");
  return r;
}
function Rl(r, e) {
  var o, s;
  r.dataset.markerShape = e, r.style.transformOrigin = ve[e].anchor === "center" ? "center" : "center bottom";
  const t = Yn(r);
  if (!t) return;
  const n = r.dataset.markerSize ?? Oe, i = Jn(e, n === "xs" ? Oe : n), a = (o = t.querySelector(".marker-outer")) == null ? void 0 : o.getAttribute("stroke-width");
  a && ((s = i.querySelector(".marker-outer")) == null || s.setAttribute("stroke-width", a)), Fl(t, i, ve[e]), so(i, ve[e]), i.style.display = t.style.display, t.replaceWith(i);
}
function Fl(r, e, t) {
  const n = r.querySelector(".marker-content");
  if (!(!n || n.classList.contains(ao))) {
    if (n instanceof SVGGElement) {
      n.setAttribute("transform", lo(t)), e.appendChild(n);
      return;
    }
    if (n instanceof SVGImageElement) {
      const i = n.getAttribute("href");
      i && uo(e, i, t);
      return;
    }
    if (n instanceof SVGForeignObjectElement) {
      const i = n.firstElementChild;
      (i instanceof HTMLElement || i instanceof SVGElement) && ei(e, i, t);
      return;
    }
    n instanceof SVGTextElement && n.textContent && _r(e, n.textContent, t);
  }
}
let ki;
function Xn() {
  return ki ?? (ki = zl()), ki.cloneNode(!0);
}
function zl() {
  const r = H("svg");
  r.classList.add("marker-dot");
  const e = Vt.xs;
  r.setAttribute("viewBox", `0 0 ${String(e)} ${String(e)}`), r.setAttribute("width", String(e)), r.setAttribute("height", String(e)), r.style.display = "block", r.style.overflow = "visible", r.style.filter = "none";
  const t = H("circle");
  return t.setAttribute("cx", String(e / 2)), t.setAttribute("cy", String(e / 2)), t.setAttribute("r", String(e / 2)), t.setAttribute("stroke-width", "1"), t.setAttribute("vector-effect", "non-scaling-stroke"), t.style.fill = "var(--marker-inner-color)", t.style.stroke = "var(--marker-outer-color)", r.appendChild(t), r;
}
const no = "maptiler-marker-collision-fade", Dl = "maptiler-marker-collision-hidden", yn = 150;
function Nl(r, e) {
  r.classList.add(no), r.classList.toggle(Dl, e);
}
function $l(r) {
  r.classList.remove(no);
}
const Qt = "maptiler-marker-collision-culled";
function gn(r, e) {
  return e ? r.classList.contains(Qt) ? !1 : (r.classList.add(Qt), !0) : r.classList.contains(Qt) ? (r.classList.remove(Qt), !0) : !1;
}
const jl = "maptiler-marker-altitude-hidden", Ii = "maptiler-marker-groundline";
function Ul(r, e) {
  r.classList.toggle(jl, e);
}
const Bl = "maptiler-marker-altitude-occluded";
function Mi(r, e) {
  r.classList.toggle(Bl, e);
}
const Pi = "marker-minimized-dot";
function _i(r, e, t) {
  const n = r.querySelector(`svg.${Pi}`);
  if (!t) {
    n == null || n.remove(), r.style.visibility = "";
    return;
  }
  if (r.style.visibility = "hidden", n || !(r instanceof HTMLElement)) return;
  const i = Xn();
  i.classList.add(Pi), i.style.visibility = "visible", i.style.position = "absolute", i.style.left = e.includes("left") ? "0%" : e.includes("right") ? "100%" : "50%", i.style.top = e.includes("top") ? "0%" : e.includes("bottom") ? "100%" : "50%", i.style.transform = "translate(-50%, -50%)", r.style.position = "relative", r.appendChild(i);
}
const Oi = /* @__PURE__ */ new Map();
function Jn(r, e, t) {
  const n = `${r}:${e}`;
  let i = Oi.get(n);
  i || (i = Vl(r, e), Oi.set(n, i));
  const a = i.cloneNode(!0);
  return t && (Gl(a.firstElementChild, t), Hl(a, t, ve[r])), a;
}
function Vl(r, e) {
  const t = ve[r], n = Vt[e], [i, a] = t.viewBox, o = H("svg");
  o.classList.add(to), o.setAttribute("viewBox", `0 0 ${String(i)} ${String(a)}`), o.setAttribute("width", String(n)), o.setAttribute("height", String(n)), o.style.display = "block", o.style.overflow = "visible", o.style.filter = "var(--marker-shadow)";
  const s = H("path");
  s.classList.add("marker-outer"), s.setAttribute("d", t.outerPath), s.setAttribute("vector-effect", "non-scaling-stroke"), s.style.fill = "var(--marker-outer-color)", s.style.stroke = "var(--marker-outline-color)", o.appendChild(s);
  const l = ql(t.inner);
  return l.classList.add("marker-inner"), l.style.fill = "var(--marker-inner-color)", o.appendChild(l), o;
}
function ql(r) {
  if (r.type === "circle") {
    const t = H("circle");
    return t.setAttribute("cx", String(r.cx)), t.setAttribute("cy", String(r.cy)), t.setAttribute("r", String(r.r)), t;
  }
  const e = H("path");
  return e.setAttribute("d", r.d), e;
}
function xr(r) {
  const e = r.dataset.scaleX ?? "1", t = r.dataset.scaleY ?? "1", n = r.dataset.rotation ?? "0", i = r.dataset.lift ?? "0";
  r.style.transform = `translateY(${i}px) scale(${e}, ${t}) rotate(${n}deg)`;
}
function Yr(r, e) {
  const t = Lt(r);
  t.dataset.lift = String(e), xr(t);
}
function Gl(r, e) {
  if (!e.outline) return;
  const t = e.outline === !0 ? Ja : e.outline;
  r.setAttribute("stroke-width", String(t));
}
let io = 0;
function Hl(r, e, t) {
  if ("icon" in e && e.icon) {
    e.icon;
    return;
  }
  if ("url" in e && e.url) {
    uo(r, e.url, t);
    return;
  }
  if ("template" in e && e.template) {
    Kl(r, e.template, e.templateParams, t);
    return;
  }
  if ("element" in e && e.element) {
    ei(r, e.element, t);
    return;
  }
  if (e.content) {
    _r(r, e.content, t);
    return;
  }
  oo(r, t);
}
const ao = "marker-default-content";
function oo(r, e) {
  const { defaultContent: t } = e;
  if (!t) return;
  const { cx: n, cy: i } = e.content, a = t.size / 2, o = H("g");
  o.classList.add("marker-content", ao), o.setAttribute("fill", "var(--marker-content-color)"), o.setAttribute("transform", `translate(${String(n - a)}, ${String(i - a)})`);
  const s = H("path");
  s.setAttribute("d", t.d), o.appendChild(s), r.appendChild(o);
}
function so(r, e) {
  r.querySelector(".marker-content") || oo(r, e);
}
function Kl(r, e, t, n) {
  const i = El(e);
  if (!i) {
    console.warn(`Unknown marker template "${e}".`);
    return;
  }
  const a = i(t);
  typeof a == "string" ? _r(r, a, n) : a instanceof SVGElement ? Zl(r, a, n) : ei(r, a, n);
}
function Zl(r, e, t) {
  const n = H("g");
  n.classList.add("marker-content"), n.setAttribute("fill", "var(--marker-content-color)"), n.setAttribute("transform", lo(t)), n.appendChild(e), r.appendChild(n);
}
function lo(r) {
  const { cx: e, cy: t, r: n } = r.content, i = n * 1.4 / Ei, a = Ei / 2 * i;
  return `translate(${String(e - a)}, ${String(t - a)}) scale(${String(i)})`;
}
function uo(r, e, t) {
  const n = H("image");
  if (n.classList.add("marker-content"), n.setAttribute("href", e), n.setAttribute("preserveAspectRatio", "xMidYMid slice"), t.imageClip) {
    const i = `maptiler-marker-clip-${String(++io)}`, a = H("clipPath");
    a.setAttribute("id", i);
    const o = H("path");
    o.setAttribute("d", t.imageClip.d), a.appendChild(o), r.appendChild(a), n.setAttribute("clip-path", `url(#${i})`), n.setAttribute("x", String(t.imageClip.x)), n.setAttribute("y", String(t.imageClip.y)), n.setAttribute("width", String(t.imageClip.w)), n.setAttribute("height", String(t.imageClip.h));
  } else {
    const { cx: i, cy: a, r: o } = t.content;
    n.setAttribute("clip-path", Qn(r, t)), n.setAttribute("x", String(i - o)), n.setAttribute("y", String(a - o)), n.setAttribute("width", String(o * 2)), n.setAttribute("height", String(o * 2));
  }
  if (r.appendChild(n), t.pointerPath) {
    const i = H("path");
    i.setAttribute("d", t.pointerPath), i.style.fill = "var(--marker-inner-color)", r.appendChild(i);
  }
}
function Qn(r, e, t) {
  const { cx: n, cy: i, r: a } = e.content, o = `maptiler-marker-clip-${String(++io)}`, s = H("clipPath");
  s.setAttribute("id", o);
  const l = H("circle");
  return l.setAttribute("cx", String(n)), l.setAttribute("cy", String(i)), l.setAttribute("r", String(t ?? a)), s.appendChild(l), r.appendChild(s), `url(#${o})`;
}
function ei(r, e, t) {
  const { cx: n, cy: i, r: a } = t.content, o = a * 1.4, s = H("foreignObject");
  s.classList.add("marker-content"), s.setAttribute("x", String(n - o / 2)), s.setAttribute("y", String(i - o / 2)), s.setAttribute("width", String(o)), s.setAttribute("height", String(o)), s.setAttribute("clip-path", Qn(r, t)), s.appendChild(e), r.appendChild(s);
}
function _r(r, e, t, n = "marker-content") {
  const { cx: i, cy: a } = t.content, o = 14, s = H("text");
  return s.classList.add(n, Qa), s.setAttribute("clip-path", Qn(r, t, 14)), s.setAttribute("x", String(i)), s.setAttribute("y", String(a)), s.setAttribute("text-anchor", "middle"), s.setAttribute("dominant-baseline", "central"), s.setAttribute("font-weight", "500"), s.setAttribute("font-size", String(o)), s.style.fill = "var(--marker-content-color)", s.style.userSelect = "none", s.style.fontVariantNumeric = "tabular-nums", s.textContent = e, r.appendChild(s), s;
}
function Wl(r) {
  const e = document.createElement("div");
  return e.appendChild(r), e;
}
function Yl(r) {
  const e = r.querySelector(`.${ot}`);
  e && (r.style.pointerEvents = "none", e.style.pointerEvents = "auto");
}
const Xr = {
  /** No collision detection — marker is always shown. */
  ALWAYS_SHOW: "always-show",
  /** Marker is hidden when it collides with a higher-priority marker. */
  HIDE_BY_PRIORITY: "hide-by-priority",
  /** Marker is minimised to a simple point/circle when colliding with a higher-priority marker. */
  MINIMIZE_BY_PRIORITY: "minimize-by-priority"
}, Xl = 4;
function Jl(r, e, t) {
  const n = r.includes("left") ? e / 2 : r.includes("right") ? -e / 2 : 0, i = r.includes("top") ? t / 2 : r.includes("bottom") ? -t / 2 : 0;
  return [n, i];
}
function Ql(r, e, t) {
  const n = t * Math.PI / 180, i = Math.cos(n), a = Math.sin(n), [o, s] = Jl(e.anchor, e.width, e.height), [l, u] = e.pivot, c = r.x + e.offset[0] + o + l - (l * i - u * a), p = r.y + e.offset[1] + s + u - (l * a + u * i);
  return { cx: c, cy: p, hw: e.width / 2, hh: e.height / 2, cos: i, sin: a };
}
function vn(r, e = 0) {
  const t = r.hw * Math.abs(r.cos) + r.hh * Math.abs(r.sin) + e, n = r.hw * Math.abs(r.sin) + r.hh * Math.abs(r.cos) + e;
  return { left: r.cx - t, right: r.cx + t, top: r.cy - n, bottom: r.cy + n };
}
function bn(r, e, t = 0) {
  const n = r.hw + t, i = r.hh + t, a = e.hw + t, o = e.hh + t, s = e.cx - r.cx, l = e.cy - r.cy, u = [
    [r.cos, r.sin],
    [-r.sin, r.cos],
    [e.cos, e.sin],
    [-e.sin, e.cos]
  ];
  for (const [c, p] of u) {
    const f = n * Math.abs(r.cos * c + r.sin * p) + i * Math.abs(-r.sin * c + r.cos * p), d = a * Math.abs(e.cos * c + e.sin * p) + o * Math.abs(-e.sin * c + e.cos * p);
    if (Math.abs(s * c + l * p) > f + d) return !1;
  }
  return !0;
}
function eu(r, e) {
  return {
    left: r.left - e,
    right: r.right + e,
    top: r.top - e,
    bottom: r.bottom + e
  };
}
function pr(r, e) {
  return r.left <= e.right && e.left <= r.right && r.top <= e.bottom && e.top <= r.bottom;
}
function tu(r, e = !0) {
  const t = r.map((s, l) => l).sort((s, l) => r[l].priority - r[s].priority || s - l), n = new Array(r.length).fill("visible"), i = [], a = (s, l) => i.some((u) => pr(u.bounds, l) && (!e || bn(u.obb, s))), o = (s) => {
    i.push({ obb: s, bounds: vn(s) });
  };
  for (const s of t) {
    const l = r[s];
    if (l.mode === "always" || !a(l.obb, vn(l.obb))) {
      o(l.obb);
      continue;
    }
    if (l.mode === "hide") {
      n[s] = "hidden";
      continue;
    }
    n[s] = "minimized", o(l.obb);
  }
  return n;
}
function Ri(r, e) {
  const t = r.map((a, o) => o), n = (a) => {
    for (; t[a] !== a; )
      t[a] = t[t[a]], a = t[a];
    return a;
  };
  for (const [a, o] of e)
    t[n(a)] = n(o);
  const i = /* @__PURE__ */ new Map();
  for (let a = 0; a < r.length; a++) {
    const o = n(a), s = i.get(o);
    s ? s.push(r[a]) : i.set(o, [r[a]]);
  }
  return [...i.values()].filter((a) => a.length > 1);
}
const co = Symbol("MapTiler:Marker:flushDOMUpdates"), bt = Symbol("MapTiler:Marker:pendingUpdates"), Z = Symbol("MapTiler:Marker:markerElement"), fr = Symbol("MapTiler:Marker:detachFromDOM"), wn = Symbol("MapTiler:Marker:refreshAdaptiveColor"), po = Symbol("MapTiler:Marker:collisionFootprint"), fo = Symbol("MapTiler:Marker:emitCollisionDiff"), dr = Symbol("MapTiler:Marker:applyCollisionDisplayState"), Et = Symbol("MapTiler:Marker:measuredElementSize"), ho = Symbol("MapTiler:Marker:clearFocusState"), mo = Symbol("MapTiler:Marker:applyAltitudeFrame"), ru = ["shape", "size", "scale", "rotation"], er = 200, nu = 1e3, Fi = /* @__PURE__ */ new Set();
function iu(r) {
  const e = r.getPriority();
  return typeof e == "number" ? e : 0;
}
class au {
  constructor() {
    //#region State
    // the markers that require updates
    y(this, "dirty", /* @__PURE__ */ new Set());
    // the current rAF ID
    y(this, "animationFrameID", null);
    // A WeakMap to store which Marker belongs to which Map.
    // When a map is removed from the page the WeakMap clears the state, so no manual clean up needed.
    y(this, "markerMap", /* @__PURE__ */ new WeakMap());
    // Lookup in the opposite direction, gets the markers for a given map.
    // When a map is removed from the page the WeakMap clears the state, so no manual clean up needed.
    y(this, "mapIndex", /* @__PURE__ */ new WeakMap());
    // Last style id seen per map — used to skip redundant adaptive-colour
    // refreshes, since `styledata` fires many times per style load.
    y(this, "lastStyleId", /* @__PURE__ */ new WeakMap());
    // Per-map collision detection state (previous pass, groups, config).
    y(this, "collisionState", /* @__PURE__ */ new WeakMap());
    // Maps with a collision pass pending on the next animation frame. All
    // invalidations coalesce here so a bulk add runs the pass once, not N times.
    y(this, "collisionPending", /* @__PURE__ */ new Set());
    // Per-marker drag handlers (`drag` + `dragend`), kept so deregister can detach them.
    y(this, "dragEndHandlers", /* @__PURE__ */ new WeakMap());
    // Per-map altitude render-loop state (see MapAltitudeState).
    y(this, "altitudeState", /* @__PURE__ */ new WeakMap());
    y(this, "altitudeLayerSequence", 0);
  }
  //#endregion
  //#region Internal
  // Queues the DOM updates into an animation frame (if updates aren't already scheduled)
  scheduleFlush() {
    this.animationFrameID === null && (this.animationFrameID = requestAnimationFrame(() => {
      this.animationFrameID = null, this.flushUpdates();
    }));
  }
  // lazy initialisation of map indexes
  getOrCreateIndex(e) {
    const t = this.mapIndex.get(e);
    if (t) return t;
    const n = /* @__PURE__ */ new Map();
    return this.mapIndex.set(e, n), e.on("styledata", () => {
      this.refreshAdaptiveColors(e);
    }), e.on("click", (i) => {
      const a = i.originalEvent.target;
      for (const o of n.values())
        a && o[Z].contains(a) || o[ho]();
    }), n;
  }
  // queues an adaptive-colour re-resolution for every marker of a map,
  // skipping when the style id has not actually changed
  refreshAdaptiveColors(e) {
    const t = this.getMapStyleId(e);
    if (this.lastStyleId.get(e) === t) return;
    this.lastStyleId.set(e, t);
    const n = this.mapIndex.get(e);
    if (n)
      for (const i of n.values())
        i[wn]();
  }
  //#endregion
  //#region Registration
  // registers a marker to be managed, called internally in Map.addMarker
  register(e, t) {
    e.addTo(t), this.markerMap.set(e, t), this.getOrCreateIndex(t).set(e.id, e);
    const n = e.options.element;
    if (n && !e[Et])
      if (n instanceof HTMLElement)
        e[Et] = [n.offsetWidth, n.offsetHeight];
      else {
        const a = n.getBoundingClientRect();
        e[Et] = [a.width, a.height];
      }
    const i = () => {
      this.invalidateCollisions(t), e.hasActiveAltitude() && t.triggerRepaint();
    };
    e.on("drag", i), e.on("dragend", i), this.dragEndHandlers.set(e, i), this.invalidateCollisions(t), e[wn](), e.hasActiveAltitude() && this.registerAltitudeParticipant(e, t);
  }
  // unregisters a Marker that no longer needs to be managed. `deferDetach`
  // skips the final DOM detach — used by Marker.remove() to play an exit
  // animation while every other bookkeeping (index, collisions, drag
  // handlers) updates immediately, same as a normal removal.
  deregister(e, t) {
    var o;
    const n = this.markerMap.get(e);
    if (!n) return;
    this.markerMap.delete(e), (o = this.mapIndex.get(n)) == null || o.delete(e.id), this.cancelCuedUpdatesForMarker(e), this.deregisterAltitudeParticipant(e, n);
    const i = this.dragEndHandlers.get(e);
    i && (e.off("drag", i), e.off("dragend", i), this.dragEndHandlers.delete(e));
    const a = this.collisionState.get(n);
    a && (a.previous.overlap.delete(e.id), a.previous.proximity.delete(e.id)), e[dr]("visible"), this.invalidateCollisions(n), t != null && t.deferDetach || e[fr]();
  }
  // As above but with a Markers ID instead.
  deregisterById(e, t) {
    var i;
    const n = (i = this.mapIndex.get(e)) == null ? void 0 : i.get(t);
    n && this.deregister(n);
  }
  // removes all markers, or a specified list of markers by ID, from a map
  deregisterAll(e, t) {
    const n = this.mapIndex.get(e);
    if (!n) return;
    const i = t ? t.map((a) => n.get(a)) : [...n.values()];
    for (const a of i)
      a && this.deregister(a);
  }
  //#endregion
  //#region Queries
  // gets the map a marker belongs to
  getMap(e) {
    return this.markerMap.get(e);
  }
  /**
   * Returns the id of the map's current style (e.g. `"streets-v4-dark"`), or
   * `undefined` when it cannot be determined (custom style spec / URL).
   * Falls back to the raw stylesheet's `id` field, since the id is not part
   * of the serialized `StyleSpecification` returned by `map.getStyle()`.
   */
  getMapStyleId(e) {
    const t = e.getStyleId();
    if (t) return t;
    const n = e.style.stylesheet;
    return typeof (n == null ? void 0 : n.id) == "string" ? n.id : void 0;
  }
  // gets the markers for a given map
  getMarkers(e) {
    const t = this.mapIndex.get(e);
    return t ? Array.from(t.values()) : [];
  }
  // gets a specific marker from a specific map
  getMarker(e, t) {
    var n;
    return (n = this.mapIndex.get(e)) == null ? void 0 : n.get(t);
  }
  //#endregion
  //#region DOM Updates
  // iterates through the markers that require updates and applies then to the DOM.
  flushUpdates() {
    for (const t of this.dirty) {
      if (ru.some((n) => n in t[bt])) {
        const n = this.markerMap.get(t);
        n && this.collisionPending.add(n);
      }
      t[co]();
    }
    this.dirty.clear();
    const e = [...this.collisionPending];
    this.collisionPending.clear();
    for (const t of e)
      this.runCollisionPass(t);
  }
  // called when a marker state is updated
  addMarkerUpdateToQueue(e) {
    this.dirty.add(e), this.scheduleFlush();
  }
  // abort any updates
  cancelCuedUpdatesForMarker(e) {
    this.dirty.delete(e);
  }
  //#endregion
  //#region Collision Detection
  /**
   * Requests a full collision detection pass for a map's markers.
   *
   * The single entry point for everything that can change collisions —
   * marker add / remove / move / drag, footprint changes, and camera
   * `moveend`. Requests coalesce onto one animation frame, so a bulk add
   * runs the pass once. During camera movement markers track their positions
   * via MapLibre's own per-frame update; the pass itself only runs when
   * movement settles (dense fields make it quadratic in overlapping pairs).
   */
  invalidateCollisions(e) {
    this.getOrCreateCollisionState(e), this.collisionPending.add(e), this.scheduleFlush();
  }
  /**
   * Collision groups from the latest detection pass: the full sets of
   * mutually-colliding markers, with no priority or winner/loser resolution.
   * The behaviour layer consumes these to decide what to do about collisions.
   */
  getCollisionGroups(e) {
    var t;
    return ((t = this.collisionState.get(e)) == null ? void 0 : t.groups) ?? { overlap: [], proximity: [] };
  }
  /**
   * Configures collision detection for a map.
   * @param options.proximityPadding - Distance in CSS px within which two
   *   markers count as "in proximity". Overlap always uses 0.
   * @param options.accuracy - `high` (default) tests rotated markers with
   *   their actual rotated box; `low` uses the enclosing upright box, which
   *   is cheaper but over-reports collisions for rotated markers.
   * @param options.behaviour - Default collision behaviour for every marker
   *   on the map; a marker's own `collisionBehaviour` option overrides it.
   *   Defaults to `always-show`.
   * @param options.transitionDuration - Duration in ms of the hide/show/minimize fade. Defaults to `150`.
   * @param options.transitionEasing - CSS easing function for the fade. Defaults to `"ease"`.
   */
  setCollisionOptions(e, t) {
    const n = this.getOrCreateCollisionState(e);
    t.proximityPadding !== void 0 && (n.proximityPadding = t.proximityPadding), t.accuracy !== void 0 && (n.accuracy = t.accuracy), t.behaviour !== void 0 && (n.behaviour = t.behaviour), t.transitionDuration !== void 0 && (n.transitionDuration = t.transitionDuration), t.transitionEasing !== void 0 && (n.transitionEasing = t.transitionEasing), this.applyCollisionTransitionVars(e, n), this.invalidateCollisions(e);
  }
  /** Returns the fade-transition duration (ms) configured for `map`, or the SDK default if never configured. */
  getCollisionTransitionDuration(e) {
    var t;
    return ((t = this.collisionState.get(e)) == null ? void 0 : t.transitionDuration) ?? yn;
  }
  // exposes the per-map fade duration/easing to CSS, so the collision fade
  // classes (defined once in the stylesheet) pick up per-map overrides
  applyCollisionTransitionVars(e, t) {
    const n = e.getContainer();
    n.style.setProperty("--maptiler-collision-transition-duration", `${t.transitionDuration}ms`), n.style.setProperty("--maptiler-collision-transition-easing", t.transitionEasing);
  }
  // lazily creates the per-map collision state and attaches the camera
  // trigger; `remove` tears both down along with any pending pass
  getOrCreateCollisionState(e) {
    const t = this.collisionState.get(e);
    if (t) return t;
    const n = {
      previous: { overlap: /* @__PURE__ */ new Map(), proximity: /* @__PURE__ */ new Map() },
      groups: { overlap: [], proximity: [] },
      proximityPadding: Xl,
      accuracy: "high",
      behaviour: Xr.ALWAYS_SHOW,
      transitionDuration: yn,
      transitionEasing: "ease"
    };
    this.collisionState.set(e, n), this.applyCollisionTransitionVars(e, n);
    const i = () => {
      this.invalidateCollisions(e);
    };
    return e.on("moveend", i), e.once("remove", () => {
      e.off("moveend", i), this.collisionPending.delete(e), this.collisionState.delete(e);
    }), n;
  }
  /**
   * The full detection pass. Builds each marker's screen box from its stored
   * footprint and projected position (no DOM reads), finds intersecting
   * pairs, derives collision groups, then diffs against the previous pass so
   * markers only emit enter/exit transitions.
   *
   * Markers outside the (margin-padded) viewport never enter the pass: they
   * are hidden outright — off screen there is nothing to show, and skipping
   * them keeps the pair scan and placement proportional to what is actually
   * visible. They rejoin (and fade back in) on the first pass that finds
   * them near the viewport again. Consequence: collision events and
   * `getCollisionGroups` only cover on-screen markers.
   */
  runCollisionPass(e) {
    const t = this.collisionState.get(e), n = this.mapIndex.get(e);
    if (!t || !n) return;
    const i = e.getBearing(), a = t.proximityPadding / 2, o = t.accuracy === "high", s = e.getCanvas(), l = {
      left: -er,
      top: -er,
      right: s.clientWidth + er,
      bottom: s.clientHeight + er
    }, u = [], c = [];
    for (const h of n.values()) {
      const m = h[po](), g = (m.mapAligned ? i : 0) + m.rotation, v = Ql(e.project(h.getLngLat()), m, g), b = vn(v);
      if (!pr(b, l)) {
        c.push(h);
        continue;
      }
      u.push({
        index: u.length,
        marker: h,
        obb: v,
        bounds: b,
        proximityBounds: eu(b, a),
        rotated: g % 360 !== 0
      });
    }
    for (const h of c)
      h[dr]("hidden");
    const p = [], f = [], d = { overlap: /* @__PURE__ */ new Map(), proximity: /* @__PURE__ */ new Map() };
    for (let h = 0; h < u.length; h++) {
      const m = u[h];
      for (let g = h + 1; g < u.length; g++) {
        const v = u[g];
        if (!pr(m.proximityBounds, v.proximityBounds)) continue;
        const b = o && (m.rotated || v.rotated);
        if (b && !bn(m.obb, v.obb, a)) continue;
        f.push([h, g]), this.linkCollision(d.proximity, m.marker, v.marker), (b ? bn(m.obb, v.obb) : pr(m.bounds, v.bounds)) && (p.push([h, g]), this.linkCollision(d.overlap, m.marker, v.marker));
      }
    }
    t.groups = {
      overlap: Ri(u, p).map((h) => h.map((m) => m.marker)),
      proximity: Ri(u, f).map((h) => h.map((m) => m.marker))
    }, this.emitCollisionDiffs(n, t.previous.proximity, d.proximity, "proximity"), this.emitCollisionDiffs(n, t.previous.overlap, d.overlap, "overlap"), t.previous = d, this.applyCollisionBehaviours(e, t, u);
  }
  /**
   * The behaviour layer: turns the pass's geometry into display states via
   * greedy priority placement — `hide-by-priority` losers hide (and stop
   * blocking), `minimize-by-priority` losers minimize (and keep reserving
   * their full-size box, so priority order is strict). See
   * {@link resolveDisplayStates}.
   *
   * Hide/minimize act on *overlap* only — the proximity padding stays an
   * events-only concern; `collisionRadius` is the per-marker way to act at a
   * distance.
   */
  applyCollisionBehaviours(e, t, n) {
    const i = n.map((s) => {
      const l = this.effectiveBehaviour(s.marker, t);
      return { mode: l === Xr.HIDE_BY_PRIORITY ? "hide" : l === Xr.MINIMIZE_BY_PRIORITY ? "minimize" : "always", priority: iu(s.marker), obb: s.obb };
    }), a = tu(i, t.accuracy === "high");
    n.reduce(
      (s, l) => a[l.index] === "hidden" ? s : gn(l.marker.getElement(), !1) || s,
      !1
    ) && e.getContainer().offsetWidth;
    for (const s of n)
      s.marker[dr](a[s.index]);
  }
  /** Resolves a marker's collision behaviour against the map default. */
  effectiveBehaviour(e, t) {
    return e.options.collisionBehaviour ?? t.behaviour;
  }
  getOrCreateCollisionSet(e, t) {
    const n = e.get(t);
    if (n) return n;
    const i = /* @__PURE__ */ new Set();
    return e.set(t, i), i;
  }
  // records a colliding pair in both markers' collision sets
  linkCollision(e, t, n) {
    this.getOrCreateCollisionSet(e, t.id).add(n), this.getOrCreateCollisionSet(e, n.id).add(t);
  }
  /** Allocation-free set equality — dense passes must not allocate for unchanged collisions. */
  collisionSetsEqual(e, t) {
    if (e.size !== t.size) return !1;
    for (const n of t)
      if (!e.has(n)) return !1;
    return !0;
  }
  // diffs each marker's collision set against the previous pass and has the
  // marker emit only the transitions — unchanged collisions stay silent
  emitCollisionDiffs(e, t, n, i) {
    for (const a of e.values()) {
      const o = t.get(a.id) ?? Fi, s = n.get(a.id) ?? Fi;
      if (this.collisionSetsEqual(o, s)) continue;
      const l = [...s].filter((c) => !o.has(c)), u = [...o].filter((c) => !s.has(c));
      l.length === 0 && u.length === 0 || a[fo]({ kind: i, entered: l, exited: u, current: [...s] });
    }
  }
  //#endregion
  //#region Altitude
  /**
   * Starts driving `marker`'s per-frame altitude projection on `map`. Shared
   * across every altitude-active marker on the map — several markers here
   * still cost one no-op custom layer and one `render` listener, not one
   * each. Called by {@link Marker.setAltitude} (and by {@link register} for
   * a marker whose altitude was set before it had a map).
   */
  registerAltitudeParticipant(e, t) {
    const n = this.getOrCreateAltitudeState(t);
    n.participants.add(e), this.ensureAltitudeLayerInstalled(t, n);
  }
  /** Stops driving `marker`'s altitude projection. Tears down the shared layer/listener once the last participant on `map` leaves. */
  deregisterAltitudeParticipant(e, t) {
    const n = this.altitudeState.get(t);
    n && (n.participants.delete(e), n.participants.size === 0 && this.teardownAltitudeLayer(t, n));
  }
  /**
   * The shared, always-behind-markers container every marker's ground-line
   * element gets appended to on this map — a sibling of the marker elements
   * (both live in `map.getCanvasContainer()`), not a descendant of any one
   * marker, so a long line can never inherit a marker's camera-depth
   * z-index and paint over some *other* marker's icon. Created together
   * with the rest of the per-map altitude state.
   */
  getGroundLineContainer(e) {
    return this.getOrCreateAltitudeState(e).groundLineContainer;
  }
  // lazily creates the per-map altitude state; final cleanup on map removal
  // mirrors getOrCreateCollisionState's — release what this added, nothing
  // heavier, since the map itself is already going away
  getOrCreateAltitudeState(e) {
    const t = this.altitudeState.get(e);
    if (t) return t;
    const n = document.createElement("div");
    n.style.position = "absolute", n.style.inset = "0", n.style.pointerEvents = "none", e.getCanvas().after(n);
    const i = {
      participants: /* @__PURE__ */ new Set(),
      layerId: `__maptiler-altitude-capture-${String(this.altitudeLayerSequence++)}__`,
      currentMatrix: null,
      currentProjectionTransition: null,
      installed: !1,
      renderListener: null,
      styleLoadListener: null,
      terrainListener: null,
      groundLineContainer: n
    };
    return this.altitudeState.set(e, i), e.once("remove", () => {
      i.renderListener && e.off("render", i.renderListener), i.styleLoadListener && e.off("style.load", i.styleLoadListener), i.terrainListener && (e.off("terrain", i.terrainListener), e.off("terrainAnimationStop", i.terrainListener), e.off("loadWithTerrain", i.terrainListener)), this.altitudeState.delete(e);
    }), i;
  }
  // MapLibre throws if you `addLayer` before the style has finished loading
  // — defer installation until then. Safe to call redundantly; only the
  // first call (with participants still non-empty) actually installs.
  //
  // Waits on "idle", not "load": "load" fires exactly once per map, ever.
  // Markers are almost always registered well *after* the map's initial
  // load (typically from application code that itself awaits load first),
  // so by the time this runs "load" has usually already fired and been
  // consumed — if `isStyleLoaded()` happens to be false at that exact
  // moment (e.g. right after applying a style with extra sources/sprites
  // still settling, like a terrain source), `once("load", ...)` would wait
  // forever for an event that's never coming again. "idle" fires every time
  // the map has no pending work, so it's safe to wait on regardless of
  // where in the map's lifecycle this gets called.
  ensureAltitudeLayerInstalled(e, t) {
    if (!t.installed) {
      if (e.isStyleLoaded()) {
        this.installAltitudeLayer(e, t);
        return;
      }
      e.once("idle", () => {
        this.ensureAltitudeLayerInstalled(e, t);
      });
    }
  }
  installAltitudeLayer(e, t) {
    if (t.installed || t.participants.size === 0 || e.getLayer(t.layerId)) return;
    e.addLayer({
      id: t.layerId,
      type: "custom",
      // "2d" is enough — this layer never draws anything, it only reads the
      // projection args MapLibre hands to every custom layer.
      renderingMode: "2d",
      render: (o, s) => {
        t.currentMatrix = s.defaultProjectionData.mainMatrix, t.currentProjectionTransition = s.defaultProjectionData.projectionTransition;
      }
    });
    const n = () => {
      if (!t.currentMatrix || t.currentProjectionTransition !== 0 && t.currentProjectionTransition !== 1) return;
      const o = [];
      for (const s of t.participants) {
        const l = s[mo](t.currentMatrix, e);
        l !== null && o.push({ marker: s, depth: l });
      }
      o.sort((s, l) => l.depth - s.depth), o.forEach(({ marker: s }, l) => {
        s[Z].style.zIndex = String(nu + l);
      });
    }, i = () => {
      t.installed = !1, t.currentMatrix = null, this.ensureAltitudeLayerInstalled(e, t);
    }, a = () => {
      e.triggerRepaint();
    };
    e.on("render", n), e.on("style.load", i), e.on("terrain", a), e.on("terrainAnimationStop", a), e.on("loadWithTerrain", a), t.renderListener = n, t.styleLoadListener = i, t.terrainListener = a, t.installed = !0;
  }
  // the map is still alive here (unlike the 'remove' cleanup above) — actually remove the layer, not just the listeners
  teardownAltitudeLayer(e, t) {
    t.renderListener && e.off("render", t.renderListener), t.styleLoadListener && e.off("style.load", t.styleLoadListener), t.terrainListener && (e.off("terrain", t.terrainListener), e.off("terrainAnimationStop", t.terrainListener), e.off("loadWithTerrain", t.terrainListener)), e.getLayer(t.layerId) && e.removeLayer(t.layerId), t.groundLineContainer.remove(), t.installed = !1, t.currentMatrix = null, t.renderListener = null, t.styleLoadListener = null, t.terrainListener = null, this.altitudeState.delete(e);
  }
  //#endregion
}
const $ = new au(), ou = ["hover", "focus", "active", "dragging"];
function su(r, e) {
  const t = {};
  for (const n of ou) {
    if (!e.has(n)) continue;
    const i = r[n];
    i && Object.assign(t, i);
  }
  return t;
}
function zi(r, e, t, n) {
  const i = n.transform.getMatrixForModel(r, e), a = i[12], o = i[13], s = i[14], l = t[0] * a + t[4] * o + t[8] * s + t[12], u = t[1] * a + t[5] * o + t[9] * s + t[13], c = t[3] * a + t[7] * o + t[11] * s + t[15];
  if (c <= 0) return null;
  const p = l / c, f = u / c, d = n.getCanvas().clientWidth, h = n.getCanvas().clientHeight;
  return {
    x: (p * 0.5 + 0.5) * d,
    y: (1 - (f * 0.5 + 0.5)) * h,
    depth: c
  };
}
function lu(r, e, t, n, i) {
  const a = n.getTerrain() ? n.queryTerrainElevation(r) ?? 0 : 0, o = zi(r, a, t, n), s = i === "ground" ? a + e : e, l = zi(r, s, t, n);
  return !o || !l ? null : { groundBase: o, elevated: l, belowGround: s < a };
}
function uu(...r) {
  const e = r[0].length;
  return r.every((t) => t.length === e);
}
function cu(r, e, t) {
  return [
    J(r[0], e[0], t),
    J(r[1], e[1], t),
    J(r[2], e[2], t),
    J(r[3], e[3], t)
  ];
}
function J(r, e, t) {
  return r + (e - r) * t;
}
function yo(r) {
  if (r.length === 0)
    throw new Error("[lerpArrayValues]: Array empty, nothing to interpolate");
  if (r.every((e) => e === null))
    throw new Error("[lerpArrayValues]: Cannot interpolate an array where all values are `null`");
  return r.map((e, t, n) => {
    if (typeof e == "number")
      return e;
    const [i, a] = fu(n, t), [o, s] = pu(n, t);
    if (i === null || a === null)
      return n[t + 1];
    if (o === null || s === null)
      return a;
    const l = (t - i) / (o - i);
    return J(a, s, l);
  });
}
function pu(r, e) {
  for (let t = e + 1; t < r.length; t++)
    if (r[t] !== null)
      return [t, r[t]];
  return [null, null];
}
function fu(r, e) {
  for (let t = e - 1; t >= 0; t--)
    if (r[t] !== null)
      return [t, r[t]];
  return [null, null];
}
const du = {
  defaultEasing: "Linear",
  pathSmoothing: {
    resolution: 20,
    epsilon: 5
  }
}, Di = ["MultiPoint", "LineString", "MultiLineString", "Polygon"];
function hu(r, e = {}) {
  const { defaultEasing: t, pathSmoothing: n, ignoreFields: i } = {
    ...du,
    ...e
  }, a = r.geometry, o = r.properties ?? {}, s = o["@easing"];
  s || console.warn(`[parseGeoJSONFeatureToKeyframes]: No '@easing' property found in GeoJSON properties, using default easing ${t}`);
  const l = o["@delta"];
  if (l || console.warn("[parseGeoJSONFeatureToKeyframes]: No '@delta' property found in GeoJSON properties, delta for each frame will default to its index divided by the total"), !a.type)
    throw new Error("[parseGeoJSONFeatureToKeyframes]: No geometry found in feature");
  if (!Di.includes(a.type))
    throw new Error(`[parseGeoJSONFeatureToKeyframes]: Geometry type '${a.type}' is not supported. Accepted types are: ${Di.join(", ")}`);
  const c = a.type !== "LineString" && a.type !== "MultiPoint" ? a.coordinates.flat() : a.coordinates, p = c.map((g) => g.length > 2 ? g[2] : null), f = p.every((g) => g === null), d = Object.entries({
    ...o,
    ...!f && { altitude: p }
  }).reduce((g, [v, b]) => v.startsWith("@") || i != null && i.includes(v) ? g : {
    ...g,
    [v]: b
  }, {}), h = l ?? c.map((g, v) => v / c.length), m = s ?? h.map(() => t ?? "Linear");
  if (c.some((g) => g.length > 2) && console.warn("[parseGeoJSONFeatureToKeyframes]: Smoothing is not supported for 3D paths, only 2D smoothing will be applied, ignoring altitude"), n) {
    const g = mu(c, n.resolution, n.epsilon), v = yo(Ni([0, 1], g.length)), b = v.map(() => t ?? "Linear"), x = Object.entries(d).reduce((k, [L, E]) => {
      if (!Array.isArray(E))
        return k;
      const N = g.length, fe = Ni(E, N);
      return {
        ...k,
        [L]: fe
      };
    }, {});
    return $i(g, v, b, x);
  }
  return $i(c, h, m, d);
}
function Ni(r, e) {
  const t = r.map((n, i) => {
    const a = i / (r.length - 1);
    return Math.round(a * (e - 1));
  });
  return Array.from({ length: e }, (n, i) => t.includes(i) ? r[t.indexOf(i)] : null);
}
function $i(r, e, t, n = {}) {
  if (!uu(r, e, t, ...Object.values(n)))
    throw new Error(`
      [parseGeoJSONFeatureToKeyframes]: If smoothing is not applied, coordinates, deltas, easings and property arrays must be the same length

      Coordinates: ${r.length}
      Deltas: ${e.length}
      Easing: ${t.length}
      Properties:
        ${Object.entries(n).map(([a, o]) => `"${a}": ${o.length}`).join(`,
        `)}
    `);
  const i = r.some((a) => a.length > 2);
  return r.map((a, o) => {
    const s = e[o], l = t[o];
    return {
      props: {
        ...Object.entries(n).reduce((p, [f, d]) => ({
          ...p,
          [f]: d[o]
        }), {}),
        lng: a[0],
        lat: a[1],
        ...i && { altitude: a[2] ?? null }
      },
      delta: s,
      easing: l
    };
  });
}
function Jr(r, e, t, n, i, a, o, s) {
  const l = [t[0] + (n[0] - e[0]) / 6, t[1] + (n[1] - e[1]) / 6], u = [n[0] - (i[0] - t[0]) / 6, n[1] - (i[1] - t[1]) / 6], c = 1 / a;
  let p = o - c;
  for (let h = o; h <= s; h += c) {
    const m = (1 - h) ** 3 * t[0] + 3 * (1 - h) ** 2 * h * l[0] + 3 * (1 - h) * h ** 2 * u[0] + h ** 3 * n[0], g = (1 - h) ** 3 * t[1] + 3 * (1 - h) ** 2 * h * l[1] + 3 * (1 - h) * h ** 2 * u[1] + h ** 3 * n[1];
    r.push([m, g]), p = h;
  }
  const f = (1 - s) ** 3 * t[0] + 3 * (1 - s) ** 2 * s * l[0] + 3 * (1 - s) * s ** 2 * u[0] + s ** 3 * n[0], d = (1 - s) ** 3 * t[1] + 3 * (1 - s) ** 2 * s * l[1] + 3 * (1 - s) * s ** 2 * u[1] + s ** 3 * n[1];
  s - p > 1e-10 ? r.push([f, d]) : r[r.length - 1] = [f, d];
}
function mu(r, e = 20, t) {
  const n = typeof t == "number" ? gu(r, t) : r;
  if (n.length < 4) return n;
  typeof t == "number" && (n[n.length - 1] = [...r[r.length - 1]]);
  const i = [], a = [2 * n[0][0] - n[1][0], 2 * n[0][1] - n[1][1]];
  Jr(i, a, n[0], n[1], n[2], e, 0, 1);
  const o = 1 / e;
  for (let l = 1; l < n.length - 2; l++) {
    const u = n[l - 1], c = n[l], p = n[l + 1], f = n[l + 2];
    Jr(i, u, c, p, f, e, o, 1);
  }
  const s = [2 * n[n.length - 1][0] - n[n.length - 2][0], 2 * n[n.length - 1][1] - n[n.length - 2][1]];
  return Jr(i, n[n.length - 3], n[n.length - 2], n[n.length - 1], s, e, o, 1), i;
}
function yu(r) {
  return r.map((e, t) => {
    if (t === 0) return 0;
    const n = r[t - 1], i = new Le(e[0], e[1]), a = new Le(n[0], n[1]);
    return i.distanceTo(a);
  }).reduce((e, t) => e + t, 0) / r.length;
}
function gu(r, e) {
  const t = vu(r, yu(r) * e);
  if (t.length < 2) return t;
  const n = [t[0]];
  let i = t[0];
  for (let a = 1; a < t.length; a++) {
    const o = t[a], s = new Le(i[0], i[1]), l = new Le(o[0], o[1]);
    s.distanceTo(l) >= e && (n.push(o), i = o);
  }
  return n.push([...r[r.length - 1]]), n;
}
function vu(r, e = 10) {
  if (r.length < 2) return r;
  const t = [r[0]];
  let n = e;
  for (let o = 0; o < r.length - 1; ) {
    const s = Le.convert(r[o]), l = Le.convert(r[o + 1]), u = s.distanceTo(l);
    if (u < n)
      n -= u, o++;
    else {
      const c = n / u, p = [J(s.lng, l.lng, c), J(s.lat, l.lat, c)];
      t.push(p), r[o] = p, n = e;
    }
  }
  const i = r[r.length - 1], a = t[t.length - 1];
  return (a[0] !== i[0] || a[1] !== i[1]) && t.push([i[0], i[1]]), t;
}
const ji = {
  animations: new Array(),
  running: !1,
  /**
   * Adds an animation to the manager. If this is the first animation added,
   * it starts the animation loop.
   *
   * @param {MaptilerAnimation} animation - The animation to add.
   */
  add(r) {
    this.animations.push(r), this.running || (this.running = !0, this.start());
  },
  /**
   * Removes an animation from the manager. If there are no more animations,
   * it stops the animation loop.
   *
   * @param {MaptilerAnimation} animation - The animation to remove.
   */
  remove(r) {
    this.animations = this.animations.filter((e) => e !== r), this.animations.length === 0 && this.stop();
  },
  /**
   * Stops the animation loop.
   */
  stop() {
    this.running = !1;
  },
  /**
   * Starts the animation loop. This function is called recursively using
   * requestAnimationFrame to ensure smooth updates.
   */
  start() {
    if (!this.running)
      return;
    const r = () => {
      if (this.animations.length === 0) {
        this.running = !1;
        return;
      }
      this.animations.forEach((e) => {
        e.isPlaying && e.updateInternal();
      }), requestAnimationFrame(r);
    };
    r();
  }
}, Sn = [
  "pause",
  "reset",
  "play",
  "stop",
  "timeupdate",
  "scrub",
  "playbackratechange",
  "animationstart",
  "animationend",
  "keyframe",
  "iteration"
], bu = {
  Linear: wu,
  QuadraticIn: Su,
  QuadraticOut: xu,
  QuadraticInOut: Cu,
  CubicIn: Au,
  CubicOut: Lu,
  CubicInOut: Eu,
  SinusoidalIn: Tu,
  SinusoidalOut: ku,
  SinusoidalInOut: Iu,
  ExponentialIn: Mu,
  ExponentialOut: Pu,
  ExponentialInOut: _u,
  ElasticIn: Ou,
  ElasticOut: Ru,
  ElasticInOut: Fu,
  BounceIn: go,
  BounceOut: ti,
  BounceInOut: zu
};
function wu(r) {
  return r;
}
function Su(r) {
  return r * r;
}
function xu(r) {
  return r * (2 - r);
}
function Cu(r) {
  let e = r * 2;
  return e < 1 ? 0.5 * e * e : (e -= 1, -0.5 * (e * (e - 2) - 1));
}
function Au(r) {
  return r * r * r;
}
function Lu(r) {
  return --r * r * r + 1;
}
function Eu(r) {
  let e = r * 2;
  return e < 1 ? 0.5 * e * e * e : (e -= 2, 0.5 * (e * e * e + 2));
}
function Tu(r) {
  return 1 - Math.cos(r * Math.PI / 2);
}
function ku(r) {
  return Math.sin(r * Math.PI / 2);
}
function Iu(r) {
  return 0.5 * (1 - Math.cos(Math.PI * r));
}
function Mu(r) {
  return r === 0 ? 0 : 1024 ** (r - 1);
}
function Pu(r) {
  return r === 1 ? 1 : 1 - 2 ** (-10 * r);
}
function _u(r) {
  if (r === 0) return 0;
  if (r === 1) return 1;
  const e = r * 2;
  return e < 1 ? 0.5 * 1024 ** (e - 1) : 0.5 * (-(2 ** (-10 * (e - 1))) + 2);
}
function Ou(r) {
  let e = 0.1;
  const t = 0.4;
  let n;
  return r === 0 ? 0 : r === 1 ? 1 : (e < 1 ? (e = 1, n = t / 4) : n = t * Math.asin(1 / e) / (2 * Math.PI), r -= 1, -(e * 2 ** (10 * r) * Math.sin((r - n) * (2 * Math.PI) / t)));
}
function Ru(r) {
  let e = 0.1;
  const t = 0.4;
  let n;
  return r === 0 ? 0 : r === 1 ? 1 : (e < 1 ? (e = 1, n = t / 4) : n = t * Math.asin(1 / e) / (2 * Math.PI), e * 2 ** (-10 * r) * Math.sin((r - n) * (2 * Math.PI) / t) + 1);
}
function Fu(r) {
  let e = 0.1;
  const t = 0.4;
  let n;
  if (r === 0) return 0;
  if (r === 1) return 1;
  e < 1 ? (e = 1, n = t / 4) : n = t * Math.asin(1 / e) / (2 * Math.PI);
  const i = r * 2;
  if (i < 1) {
    const o = i - 1;
    return -0.5 * (e * 2 ** (10 * o) * Math.sin((o - n) * (2 * Math.PI) / t));
  }
  const a = i - 1;
  return e * 2 ** (-10 * a) * Math.sin((a - n) * (2 * Math.PI) / t) * 0.5 + 1;
}
function go(r) {
  return 1 - ti(1 - r);
}
function ti(r) {
  if (r < 1 / 2.75)
    return 7.5625 * r * r;
  if (r < 2 / 2.75) {
    const t = r - 0.5454545454545454;
    return 7.5625 * t * t + 0.75;
  } else if (r < 2.5 / 2.75) {
    const t = r - 0.8181818181818182;
    return 7.5625 * t * t + 0.9375;
  }
  const e = r - 2.625 / 2.75;
  return 7.5625 * e * e + 0.984375;
}
function zu(r) {
  return r < 0.5 ? go(r * 2) * 0.5 : ti(r * 2 - 1) * 0.5 + 0.5;
}
class qt {
  constructor({ keyframes: e, duration: t, iterations: n, manualMode: i, delay: a }) {
    y(this, "playing", !1);
    /**
     * The number of times to repeat the animation
     * 0 is no repeat, Infinity is infinite repeat
     */
    y(this, "iterations");
    y(this, "currentIteration", 0);
    /** An array of keyframes animations to interpolate between */
    y(this, "keyframes");
    /** The current keyframe id */
    y(this, "currentKeyframe");
    /**The duration of the animation in milliseconds (when playbackRate === 1) */
    y(this, "duration");
    /**
     * The duration of the animation affected by the playback rate
     * if playback rate is 2, the effective duration is double
     */
    y(this, "effectiveDuration");
    /** the rate at which the animation is playing */
    y(this, "playbackRate");
    /** the current time in milliseconds */
    y(this, "currentTime");
    /** 0 start of the animation, 1 end of the animation */
    y(this, "currentDelta");
    /** The time at which the animation started */
    y(this, "animationStartTime", 0);
    /** The time at which the last frame was rendered */
    y(this, "lastFrameAt", 0);
    /** The delay before the animation starts */
    y(this, "delay", 0);
    /** The timeout ID for the delay before the animation starts */
    y(this, "delayTimeoutID");
    /** The listeners added for each event */
    y(this, "listeners", Sn.reduce((e, t) => (e[t] = [], e), {}));
    /** The props from the previous frame */
    y(this, "previousProps");
    const o = e.map(({ props: c }) => Object.keys(c)).flat().reduce((c, p) => (p && !c.includes(p) && c.push(p), c), []), s = e.sort((c, p) => c.delta - p.delta).map((c) => {
      const p = o.reduce((f, d) => d in f ? f : {
        ...f,
        // set as null to infer that this proprty
        // does not have a value but will need to be
        [d]: null
      }, c.props);
      return {
        ...c,
        props: p
      };
    }), l = s.map(({ props: c }) => c).reduce((c, p) => {
      for (const [f, d] of Object.entries(p))
        f in c || (c[f] = []), c[f].push(d);
      return c;
    }, {}), u = Object.entries(l).reduce((c, [p, f]) => (c[p] = yo(f), c), {});
    this.keyframes = s.map((c, p) => ({
      ...c,
      props: o.reduce((f, d) => (f[d] = u[d][p], f), {}),
      easing: c.easing ?? "Linear",
      id: Bt()
    })), this.duration = t, this.iterations = n, this.delay = a ?? 0, this.playbackRate = 1, this.effectiveDuration = t / this.playbackRate, this.currentTime = 0, this.currentDelta = 0, i || ji.add(this);
  }
  /**
   * Indicates if the animation is currently playing
   * @returns {boolean} - true if the animation is playing, false otherwise
   */
  get isPlaying() {
    return this.playing;
  }
  /**
   * Starts or resumes the animation
   * @returns This animation instance for method chaining
   * @event "play"
   */
  play() {
    if (this.playing)
      return this;
    if (this.delayTimeoutID)
      return this;
    const e = () => {
      this.playing = !0, this.animationStartTime = performance.now(), this.lastFrameAt = this.animationStartTime, this.emitEvent("play");
    };
    return this.delay > 0 ? this.delayTimeoutID = window.setTimeout(() => {
      e(), this.delayTimeoutID = void 0;
    }, this.delay / this.playbackRate) : e(), this;
  }
  /**
   * Pauses the animation
   * @returns This animation instance for method chaining
   * @event "pause"
   */
  pause() {
    return this.playing = !1, this.emitEvent("pause"), this;
  }
  /**
   * Stops the animation and resets to initial state
   * @returns This animation instance for method chaining
   * @event "stop"
   */
  stop(e = !1) {
    return this.playing = !1, e || this.emitEvent("stop"), this;
  }
  /**
   * Resets the animation to its initial state without stopping
   * @returns This animation instance for method chaining
   * @event "reset"
   */
  reset(e = !0) {
    return this.stop(!0), window.clearTimeout(this.delayTimeoutID), this.currentTime = 0, this.currentDelta = this.playbackRate < 0 ? 1 : 0, this.emitEvent("reset"), this.update(!1, !0), e || this.play(), this;
  }
  /**
   * Updates the animation state if playing, this is used by the AnimationManager
   * to update all animations in the loop
   * @returns This animation instance for method chaining
   */
  updateInternal() {
    return this.playing ? this.update(!1) : this;
  }
  /**
   * Updates the animation state, interpolating between keyframes
   * and emitting events as necessary
   * @event "timeupdate"
   * @event "keyframe"
   * @event "iteration"
   * @event "animationend"
   * @returns This animation instance for method chaining
   */
  update(e = !0, t = !1) {
    const n = performance.now();
    if (this.currentDelta >= 1 || this.currentDelta < 0)
      if (this.emitEvent("animationend"), this.iterations === 0 || this.currentIteration < this.iterations)
        this.reset(e);
      else
        return this.stop(), this;
    if (!t) {
      const l = e ? 16 : n - this.lastFrameAt, u = n - this.animationStartTime;
      this.lastFrameAt = n;
      const c = u * this.playbackRate;
      this.currentTime = c, this.currentDelta += l / this.effectiveDuration;
    }
    this.currentDelta > 1 && (this.currentIteration = 1), this.currentDelta < 0 && (this.currentDelta = 0);
    const { next: a, current: o } = this.getCurrentAndNextKeyFramesAtDelta(this.currentDelta);
    (o == null ? void 0 : o.id) !== this.currentKeyframe && this.emitEvent("keyframe", o, a), this.currentKeyframe = o == null ? void 0 : o.id;
    const s = Object.keys((o == null ? void 0 : o.props) ?? {}).reduce((l, u) => {
      if (o && a) {
        const c = o.props[u], p = a.props[u], f = (this.currentDelta - o.delta) / (a.delta - o.delta), h = (bu[o.easing] ?? ((m) => m))(f);
        l[u] = J(c, p, h);
      }
      return o && !a && (l[u] = o.props[u]), l;
    }, {});
    return this.previousProps || (this.previousProps = this.keyframes[0].props), this.emitEvent("timeupdate", o, a, s, this.previousProps), (this.currentDelta >= 1 || this.currentDelta < 0) && !t && (this.currentIteration += 1, this.emitEvent("iteration", null, null, {})), this.previousProps = { ...s }, this;
  }
  /**
   * Gets the current and next keyframes at a specific time
   * @param time - The time position to query
   * @returns Object containing current and next keyframes, which may be null
   */
  getCurrentAndNextKeyFramesAtTime(e) {
    return this.getCurrentAndNextKeyFramesAtDelta(e / this.effectiveDuration);
  }
  /**
   * Gets the current and next keyframes at a specific delta value
   * @param delta - The delta value to query
   * @returns Object containing current and next keyframes, which may be null
   */
  getCurrentAndNextKeyFramesAtDelta(e) {
    const t = this.keyframes.find((i) => i.delta > e) ?? null;
    return { current: this.keyframes.findLast((i) => i.delta <= e) ?? null, next: t };
  }
  /**
   * Gets the current time position of the animation
   * @returns The current time in milliseconds
   */
  getCurrentTime() {
    return this.currentTime;
  }
  /**
   * Sets the current time position of the animation
   * @param time - The time to set in milliseconds
   * @returns This animation instance for method chaining
   * @throws Error if time is greater than the duration
   * @event "scrub"
   */
  setCurrentTime(e) {
    if (e > this.effectiveDuration)
      throw new Error("Cannot set time greater than duration");
    return this.currentTime = e, this.currentDelta = e / this.effectiveDuration, this.emitEvent("scrub"), this;
  }
  /**
   * Gets the current delta value of the animation
   * @returns The current delta value (normalized progress between 0 and 1)
   */
  getCurrentDelta() {
    return this.currentDelta;
  }
  /**
   * Sets the current delta value of the animation
   * @param delta - The delta value to set (normalized progress between 0 and 1)
   * @returns This animation instance for method chaining
   * @throws Error if delta is greater than 1
   * @event "scrub"
   */
  setCurrentDelta(e) {
    if (e > 1)
      throw new Error("Cannot set delta greater than 1");
    return this.animationStartTime = performance.now(), this.lastFrameAt = this.animationStartTime, this.currentDelta = e, this.currentTime = e * this.effectiveDuration, this.update(!1, !0), this.emitEvent("scrub"), this;
  }
  /**
   * Sets the playback rate of the animation
   * @param rate - The playback rate (1.0 is normal speed)
   * @returns This animation instance for method chaining
   * @event "playbackratechange"
   */
  setPlaybackRate(e) {
    return this.playbackRate = e, this.effectiveDuration = this.duration / this.playbackRate, this.emitEvent("playbackratechange"), this;
  }
  /**
   * Gets the current playback rate
   * @returns The current playback rate
   */
  getPlaybackRate() {
    return this.playbackRate;
  }
  /**
   * Adds an event listener to the animation
   * @param type - The type of event to listen for
   * @param callback - The callback function to execute when the event occurs
   * @returns This animation instance for method chaining
   */
  addEventListener(e, t) {
    return e in this.listeners ? (this.listeners[e].push(t), this) : (console.warn(`Event type ${e} does not exist, ignoring`), this);
  }
  /**
   * Removes an event listener from the animation
   * @param type - The type of event to remove
   * @param callback - The callback function to remove
   * @returns This animation instance for method chaining
   */
  removeEventListener(e, t) {
    return e in this.listeners ? (this.listeners[e] = this.listeners[e].filter((n) => n !== t), this) : (console.warn(`Event type ${e} does not exist, ignoring`), this);
  }
  /**
   * Emits an event to all listeners of a specific type
   * @param event - The type of event to emit
   * @param keyframe - The keyframe that triggered the event
   * @param props - The interpolated properties at the current delta
   */
  emitEvent(e, t, n, i = {}, a) {
    this.listeners[e].forEach((o) => {
      o({
        type: e,
        target: this,
        currentTime: this.currentTime,
        currentDelta: this.currentDelta,
        playbackRate: this.playbackRate,
        keyframe: t,
        nextKeyframe: n ?? t,
        props: i,
        previousProps: a ?? i
      });
    });
  }
  /**
   * Creates a clone of this animation
   * @returns A new animation instance with the same properties as this one
   */
  clone() {
    return new qt({
      keyframes: structuredClone(this.keyframes),
      duration: this.duration,
      iterations: this.iterations
    });
  }
  /**
   * Destroys the animation instance, removing all event listeners and stopping playback
   */
  destroy() {
    this.stop(), this.listeners = Sn.reduce((e, t) => (e[t] = [], e), {}), ji.remove(this);
  }
}
function Du(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var Qr, Ui;
function Nu() {
  return Ui || (Ui = 1, Qr = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  }), Qr;
}
var en, Bi;
function vo() {
  if (Bi) return en;
  Bi = 1;
  const r = Nu(), e = {};
  for (const i of Object.keys(r))
    e[r[i]] = i;
  const t = {
    rgb: { channels: 3, labels: "rgb" },
    hsl: { channels: 3, labels: "hsl" },
    hsv: { channels: 3, labels: "hsv" },
    hwb: { channels: 3, labels: "hwb" },
    cmyk: { channels: 4, labels: "cmyk" },
    xyz: { channels: 3, labels: "xyz" },
    lab: { channels: 3, labels: "lab" },
    lch: { channels: 3, labels: "lch" },
    hex: { channels: 1, labels: ["hex"] },
    keyword: { channels: 1, labels: ["keyword"] },
    ansi16: { channels: 1, labels: ["ansi16"] },
    ansi256: { channels: 1, labels: ["ansi256"] },
    hcg: { channels: 3, labels: ["h", "c", "g"] },
    apple: { channels: 3, labels: ["r16", "g16", "b16"] },
    gray: { channels: 1, labels: ["gray"] }
  };
  en = t;
  for (const i of Object.keys(t)) {
    if (!("channels" in t[i]))
      throw new Error("missing channels property: " + i);
    if (!("labels" in t[i]))
      throw new Error("missing channel labels property: " + i);
    if (t[i].labels.length !== t[i].channels)
      throw new Error("channel and label counts mismatch: " + i);
    const { channels: a, labels: o } = t[i];
    delete t[i].channels, delete t[i].labels, Object.defineProperty(t[i], "channels", { value: a }), Object.defineProperty(t[i], "labels", { value: o });
  }
  t.rgb.hsl = function(i) {
    const a = i[0] / 255, o = i[1] / 255, s = i[2] / 255, l = Math.min(a, o, s), u = Math.max(a, o, s), c = u - l;
    let p, f;
    u === l ? p = 0 : a === u ? p = (o - s) / c : o === u ? p = 2 + (s - a) / c : s === u && (p = 4 + (a - o) / c), p = Math.min(p * 60, 360), p < 0 && (p += 360);
    const d = (l + u) / 2;
    return u === l ? f = 0 : d <= 0.5 ? f = c / (u + l) : f = c / (2 - u - l), [p, f * 100, d * 100];
  }, t.rgb.hsv = function(i) {
    let a, o, s, l, u;
    const c = i[0] / 255, p = i[1] / 255, f = i[2] / 255, d = Math.max(c, p, f), h = d - Math.min(c, p, f), m = function(g) {
      return (d - g) / 6 / h + 1 / 2;
    };
    return h === 0 ? (l = 0, u = 0) : (u = h / d, a = m(c), o = m(p), s = m(f), c === d ? l = s - o : p === d ? l = 1 / 3 + a - s : f === d && (l = 2 / 3 + o - a), l < 0 ? l += 1 : l > 1 && (l -= 1)), [
      l * 360,
      u * 100,
      d * 100
    ];
  }, t.rgb.hwb = function(i) {
    const a = i[0], o = i[1];
    let s = i[2];
    const l = t.rgb.hsl(i)[0], u = 1 / 255 * Math.min(a, Math.min(o, s));
    return s = 1 - 1 / 255 * Math.max(a, Math.max(o, s)), [l, u * 100, s * 100];
  }, t.rgb.cmyk = function(i) {
    const a = i[0] / 255, o = i[1] / 255, s = i[2] / 255, l = Math.min(1 - a, 1 - o, 1 - s), u = (1 - a - l) / (1 - l) || 0, c = (1 - o - l) / (1 - l) || 0, p = (1 - s - l) / (1 - l) || 0;
    return [u * 100, c * 100, p * 100, l * 100];
  };
  function n(i, a) {
    return (i[0] - a[0]) ** 2 + (i[1] - a[1]) ** 2 + (i[2] - a[2]) ** 2;
  }
  return t.rgb.keyword = function(i) {
    const a = e[i];
    if (a)
      return a;
    let o = 1 / 0, s;
    for (const l of Object.keys(r)) {
      const u = r[l], c = n(i, u);
      c < o && (o = c, s = l);
    }
    return s;
  }, t.keyword.rgb = function(i) {
    return r[i];
  }, t.rgb.xyz = function(i) {
    let a = i[0] / 255, o = i[1] / 255, s = i[2] / 255;
    a = a > 0.04045 ? ((a + 0.055) / 1.055) ** 2.4 : a / 12.92, o = o > 0.04045 ? ((o + 0.055) / 1.055) ** 2.4 : o / 12.92, s = s > 0.04045 ? ((s + 0.055) / 1.055) ** 2.4 : s / 12.92;
    const l = a * 0.4124 + o * 0.3576 + s * 0.1805, u = a * 0.2126 + o * 0.7152 + s * 0.0722, c = a * 0.0193 + o * 0.1192 + s * 0.9505;
    return [l * 100, u * 100, c * 100];
  }, t.rgb.lab = function(i) {
    const a = t.rgb.xyz(i);
    let o = a[0], s = a[1], l = a[2];
    o /= 95.047, s /= 100, l /= 108.883, o = o > 8856e-6 ? o ** (1 / 3) : 7.787 * o + 16 / 116, s = s > 8856e-6 ? s ** (1 / 3) : 7.787 * s + 16 / 116, l = l > 8856e-6 ? l ** (1 / 3) : 7.787 * l + 16 / 116;
    const u = 116 * s - 16, c = 500 * (o - s), p = 200 * (s - l);
    return [u, c, p];
  }, t.hsl.rgb = function(i) {
    const a = i[0] / 360, o = i[1] / 100, s = i[2] / 100;
    let l, u, c;
    if (o === 0)
      return c = s * 255, [c, c, c];
    s < 0.5 ? l = s * (1 + o) : l = s + o - s * o;
    const p = 2 * s - l, f = [0, 0, 0];
    for (let d = 0; d < 3; d++)
      u = a + 1 / 3 * -(d - 1), u < 0 && u++, u > 1 && u--, 6 * u < 1 ? c = p + (l - p) * 6 * u : 2 * u < 1 ? c = l : 3 * u < 2 ? c = p + (l - p) * (2 / 3 - u) * 6 : c = p, f[d] = c * 255;
    return f;
  }, t.hsl.hsv = function(i) {
    const a = i[0];
    let o = i[1] / 100, s = i[2] / 100, l = o;
    const u = Math.max(s, 0.01);
    s *= 2, o *= s <= 1 ? s : 2 - s, l *= u <= 1 ? u : 2 - u;
    const c = (s + o) / 2, p = s === 0 ? 2 * l / (u + l) : 2 * o / (s + o);
    return [a, p * 100, c * 100];
  }, t.hsv.rgb = function(i) {
    const a = i[0] / 60, o = i[1] / 100;
    let s = i[2] / 100;
    const l = Math.floor(a) % 6, u = a - Math.floor(a), c = 255 * s * (1 - o), p = 255 * s * (1 - o * u), f = 255 * s * (1 - o * (1 - u));
    switch (s *= 255, l) {
      case 0:
        return [s, f, c];
      case 1:
        return [p, s, c];
      case 2:
        return [c, s, f];
      case 3:
        return [c, p, s];
      case 4:
        return [f, c, s];
      case 5:
        return [s, c, p];
    }
  }, t.hsv.hsl = function(i) {
    const a = i[0], o = i[1] / 100, s = i[2] / 100, l = Math.max(s, 0.01);
    let u, c;
    c = (2 - o) * s;
    const p = (2 - o) * l;
    return u = o * l, u /= p <= 1 ? p : 2 - p, u = u || 0, c /= 2, [a, u * 100, c * 100];
  }, t.hwb.rgb = function(i) {
    const a = i[0] / 360;
    let o = i[1] / 100, s = i[2] / 100;
    const l = o + s;
    let u;
    l > 1 && (o /= l, s /= l);
    const c = Math.floor(6 * a), p = 1 - s;
    u = 6 * a - c, (c & 1) !== 0 && (u = 1 - u);
    const f = o + u * (p - o);
    let d, h, m;
    switch (c) {
      default:
      case 6:
      case 0:
        d = p, h = f, m = o;
        break;
      case 1:
        d = f, h = p, m = o;
        break;
      case 2:
        d = o, h = p, m = f;
        break;
      case 3:
        d = o, h = f, m = p;
        break;
      case 4:
        d = f, h = o, m = p;
        break;
      case 5:
        d = p, h = o, m = f;
        break;
    }
    return [d * 255, h * 255, m * 255];
  }, t.cmyk.rgb = function(i) {
    const a = i[0] / 100, o = i[1] / 100, s = i[2] / 100, l = i[3] / 100, u = 1 - Math.min(1, a * (1 - l) + l), c = 1 - Math.min(1, o * (1 - l) + l), p = 1 - Math.min(1, s * (1 - l) + l);
    return [u * 255, c * 255, p * 255];
  }, t.xyz.rgb = function(i) {
    const a = i[0] / 100, o = i[1] / 100, s = i[2] / 100;
    let l, u, c;
    return l = a * 3.2406 + o * -1.5372 + s * -0.4986, u = a * -0.9689 + o * 1.8758 + s * 0.0415, c = a * 0.0557 + o * -0.204 + s * 1.057, l = l > 31308e-7 ? 1.055 * l ** (1 / 2.4) - 0.055 : l * 12.92, u = u > 31308e-7 ? 1.055 * u ** (1 / 2.4) - 0.055 : u * 12.92, c = c > 31308e-7 ? 1.055 * c ** (1 / 2.4) - 0.055 : c * 12.92, l = Math.min(Math.max(0, l), 1), u = Math.min(Math.max(0, u), 1), c = Math.min(Math.max(0, c), 1), [l * 255, u * 255, c * 255];
  }, t.xyz.lab = function(i) {
    let a = i[0], o = i[1], s = i[2];
    a /= 95.047, o /= 100, s /= 108.883, a = a > 8856e-6 ? a ** (1 / 3) : 7.787 * a + 16 / 116, o = o > 8856e-6 ? o ** (1 / 3) : 7.787 * o + 16 / 116, s = s > 8856e-6 ? s ** (1 / 3) : 7.787 * s + 16 / 116;
    const l = 116 * o - 16, u = 500 * (a - o), c = 200 * (o - s);
    return [l, u, c];
  }, t.lab.xyz = function(i) {
    const a = i[0], o = i[1], s = i[2];
    let l, u, c;
    u = (a + 16) / 116, l = o / 500 + u, c = u - s / 200;
    const p = u ** 3, f = l ** 3, d = c ** 3;
    return u = p > 8856e-6 ? p : (u - 16 / 116) / 7.787, l = f > 8856e-6 ? f : (l - 16 / 116) / 7.787, c = d > 8856e-6 ? d : (c - 16 / 116) / 7.787, l *= 95.047, u *= 100, c *= 108.883, [l, u, c];
  }, t.lab.lch = function(i) {
    const a = i[0], o = i[1], s = i[2];
    let l;
    l = Math.atan2(s, o) * 360 / 2 / Math.PI, l < 0 && (l += 360);
    const c = Math.sqrt(o * o + s * s);
    return [a, c, l];
  }, t.lch.lab = function(i) {
    const a = i[0], o = i[1], l = i[2] / 360 * 2 * Math.PI, u = o * Math.cos(l), c = o * Math.sin(l);
    return [a, u, c];
  }, t.rgb.ansi16 = function(i, a = null) {
    const [o, s, l] = i;
    let u = a === null ? t.rgb.hsv(i)[2] : a;
    if (u = Math.round(u / 50), u === 0)
      return 30;
    let c = 30 + (Math.round(l / 255) << 2 | Math.round(s / 255) << 1 | Math.round(o / 255));
    return u === 2 && (c += 60), c;
  }, t.hsv.ansi16 = function(i) {
    return t.rgb.ansi16(t.hsv.rgb(i), i[2]);
  }, t.rgb.ansi256 = function(i) {
    const a = i[0], o = i[1], s = i[2];
    return a === o && o === s ? a < 8 ? 16 : a > 248 ? 231 : Math.round((a - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(a / 255 * 5) + 6 * Math.round(o / 255 * 5) + Math.round(s / 255 * 5);
  }, t.ansi16.rgb = function(i) {
    let a = i % 10;
    if (a === 0 || a === 7)
      return i > 50 && (a += 3.5), a = a / 10.5 * 255, [a, a, a];
    const o = (~~(i > 50) + 1) * 0.5, s = (a & 1) * o * 255, l = (a >> 1 & 1) * o * 255, u = (a >> 2 & 1) * o * 255;
    return [s, l, u];
  }, t.ansi256.rgb = function(i) {
    if (i >= 232) {
      const u = (i - 232) * 10 + 8;
      return [u, u, u];
    }
    i -= 16;
    let a;
    const o = Math.floor(i / 36) / 5 * 255, s = Math.floor((a = i % 36) / 6) / 5 * 255, l = a % 6 / 5 * 255;
    return [o, s, l];
  }, t.rgb.hex = function(i) {
    const o = (((Math.round(i[0]) & 255) << 16) + ((Math.round(i[1]) & 255) << 8) + (Math.round(i[2]) & 255)).toString(16).toUpperCase();
    return "000000".substring(o.length) + o;
  }, t.hex.rgb = function(i) {
    const a = i.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!a)
      return [0, 0, 0];
    let o = a[0];
    a[0].length === 3 && (o = o.split("").map((p) => p + p).join(""));
    const s = parseInt(o, 16), l = s >> 16 & 255, u = s >> 8 & 255, c = s & 255;
    return [l, u, c];
  }, t.rgb.hcg = function(i) {
    const a = i[0] / 255, o = i[1] / 255, s = i[2] / 255, l = Math.max(Math.max(a, o), s), u = Math.min(Math.min(a, o), s), c = l - u;
    let p, f;
    return c < 1 ? p = u / (1 - c) : p = 0, c <= 0 ? f = 0 : l === a ? f = (o - s) / c % 6 : l === o ? f = 2 + (s - a) / c : f = 4 + (a - o) / c, f /= 6, f %= 1, [f * 360, c * 100, p * 100];
  }, t.hsl.hcg = function(i) {
    const a = i[1] / 100, o = i[2] / 100, s = o < 0.5 ? 2 * a * o : 2 * a * (1 - o);
    let l = 0;
    return s < 1 && (l = (o - 0.5 * s) / (1 - s)), [i[0], s * 100, l * 100];
  }, t.hsv.hcg = function(i) {
    const a = i[1] / 100, o = i[2] / 100, s = a * o;
    let l = 0;
    return s < 1 && (l = (o - s) / (1 - s)), [i[0], s * 100, l * 100];
  }, t.hcg.rgb = function(i) {
    const a = i[0] / 360, o = i[1] / 100, s = i[2] / 100;
    if (o === 0)
      return [s * 255, s * 255, s * 255];
    const l = [0, 0, 0], u = a % 1 * 6, c = u % 1, p = 1 - c;
    let f = 0;
    switch (Math.floor(u)) {
      case 0:
        l[0] = 1, l[1] = c, l[2] = 0;
        break;
      case 1:
        l[0] = p, l[1] = 1, l[2] = 0;
        break;
      case 2:
        l[0] = 0, l[1] = 1, l[2] = c;
        break;
      case 3:
        l[0] = 0, l[1] = p, l[2] = 1;
        break;
      case 4:
        l[0] = c, l[1] = 0, l[2] = 1;
        break;
      default:
        l[0] = 1, l[1] = 0, l[2] = p;
    }
    return f = (1 - o) * s, [
      (o * l[0] + f) * 255,
      (o * l[1] + f) * 255,
      (o * l[2] + f) * 255
    ];
  }, t.hcg.hsv = function(i) {
    const a = i[1] / 100, o = i[2] / 100, s = a + o * (1 - a);
    let l = 0;
    return s > 0 && (l = a / s), [i[0], l * 100, s * 100];
  }, t.hcg.hsl = function(i) {
    const a = i[1] / 100, s = i[2] / 100 * (1 - a) + 0.5 * a;
    let l = 0;
    return s > 0 && s < 0.5 ? l = a / (2 * s) : s >= 0.5 && s < 1 && (l = a / (2 * (1 - s))), [i[0], l * 100, s * 100];
  }, t.hcg.hwb = function(i) {
    const a = i[1] / 100, o = i[2] / 100, s = a + o * (1 - a);
    return [i[0], (s - a) * 100, (1 - s) * 100];
  }, t.hwb.hcg = function(i) {
    const a = i[1] / 100, s = 1 - i[2] / 100, l = s - a;
    let u = 0;
    return l < 1 && (u = (s - l) / (1 - l)), [i[0], l * 100, u * 100];
  }, t.apple.rgb = function(i) {
    return [i[0] / 65535 * 255, i[1] / 65535 * 255, i[2] / 65535 * 255];
  }, t.rgb.apple = function(i) {
    return [i[0] / 255 * 65535, i[1] / 255 * 65535, i[2] / 255 * 65535];
  }, t.gray.rgb = function(i) {
    return [i[0] / 100 * 255, i[0] / 100 * 255, i[0] / 100 * 255];
  }, t.gray.hsl = function(i) {
    return [0, 0, i[0]];
  }, t.gray.hsv = t.gray.hsl, t.gray.hwb = function(i) {
    return [0, 100, i[0]];
  }, t.gray.cmyk = function(i) {
    return [0, 0, 0, i[0]];
  }, t.gray.lab = function(i) {
    return [i[0], 0, 0];
  }, t.gray.hex = function(i) {
    const a = Math.round(i[0] / 100 * 255) & 255, s = ((a << 16) + (a << 8) + a).toString(16).toUpperCase();
    return "000000".substring(s.length) + s;
  }, t.rgb.gray = function(i) {
    return [(i[0] + i[1] + i[2]) / 3 / 255 * 100];
  }, en;
}
var tn, Vi;
function $u() {
  if (Vi) return tn;
  Vi = 1;
  const r = vo();
  function e() {
    const a = {}, o = Object.keys(r);
    for (let s = o.length, l = 0; l < s; l++)
      a[o[l]] = {
        // http://jsperf.com/1-vs-infinity
        // micro-opt, but this is simple.
        distance: -1,
        parent: null
      };
    return a;
  }
  function t(a) {
    const o = e(), s = [a];
    for (o[a].distance = 0; s.length; ) {
      const l = s.pop(), u = Object.keys(r[l]);
      for (let c = u.length, p = 0; p < c; p++) {
        const f = u[p], d = o[f];
        d.distance === -1 && (d.distance = o[l].distance + 1, d.parent = l, s.unshift(f));
      }
    }
    return o;
  }
  function n(a, o) {
    return function(s) {
      return o(a(s));
    };
  }
  function i(a, o) {
    const s = [o[a].parent, a];
    let l = r[o[a].parent][a], u = o[a].parent;
    for (; o[u].parent; )
      s.unshift(o[u].parent), l = n(r[o[u].parent][u], l), u = o[u].parent;
    return l.conversion = s, l;
  }
  return tn = function(a) {
    const o = t(a), s = {}, l = Object.keys(o);
    for (let u = l.length, c = 0; c < u; c++) {
      const p = l[c];
      o[p].parent !== null && (s[p] = i(p, o));
    }
    return s;
  }, tn;
}
var rn, qi;
function ju() {
  if (qi) return rn;
  qi = 1;
  const r = vo(), e = $u(), t = {}, n = Object.keys(r);
  function i(o) {
    const s = function(...l) {
      const u = l[0];
      return u == null ? u : (u.length > 1 && (l = u), o(l));
    };
    return "conversion" in o && (s.conversion = o.conversion), s;
  }
  function a(o) {
    const s = function(...l) {
      const u = l[0];
      if (u == null)
        return u;
      u.length > 1 && (l = u);
      const c = o(l);
      if (typeof c == "object")
        for (let p = c.length, f = 0; f < p; f++)
          c[f] = Math.round(c[f]);
      return c;
    };
    return "conversion" in o && (s.conversion = o.conversion), s;
  }
  return n.forEach((o) => {
    t[o] = {}, Object.defineProperty(t[o], "channels", { value: r[o].channels }), Object.defineProperty(t[o], "labels", { value: r[o].labels });
    const s = e(o);
    Object.keys(s).forEach((u) => {
      const c = s[u];
      t[o][u] = a(c), t[o][u].raw = i(c);
    });
  }), rn = t, rn;
}
var Uu = ju();
const Bu = /* @__PURE__ */ Du(Uu);
function Gi({ gl: r, type: e, source: t }) {
  const n = r.createShader(e);
  if (n === null)
    throw new Error("Cannot create shader");
  if (r.shaderSource(n, t), r.compileShader(n), !r.getShaderParameter(n, r.COMPILE_STATUS))
    throw console.error("Shader compilation error:", r.getShaderInfoLog(n)), r.deleteShader(n), new Error("Cannot compile shader");
  return n;
}
function Vu({ gl: r, vertexShaderSource: e, fragmentShaderSource: t }) {
  const n = Gi({
    gl: r,
    type: r.VERTEX_SHADER,
    source: e
  }), i = Gi({ gl: r, type: r.FRAGMENT_SHADER, source: t }), a = r.createProgram();
  if (r.attachShader(a, n), r.attachShader(a, i), r.linkProgram(a), !r.getProgramParameter(a, r.LINK_STATUS))
    throw console.error("Error: ", r.getProgramInfoLog(a)), new Error("Cannot link shader program");
  return a;
}
function qu(r, e, t) {
  const n = r.getUniformLocation(e, t);
  if (n === null)
    throw new Error(`Cannot get uniform location for ${t}`);
  return n;
}
function bo({
  gl: r,
  vertexShaderSource: e,
  fragmentShaderSource: t,
  attributesKeys: n,
  uniformsKeys: i,
  vertices: a,
  indices: o
}) {
  const s = Vu({ gl: r, vertexShaderSource: e, fragmentShaderSource: t }), l = n.reduce((d, h) => (d[h] = r.getAttribLocation(s, `a_${h}`), d), {}), u = i.reduce((d, h) => (d[h] = qu(r, s, `u_${h}`), d), {}), c = r.createBuffer();
  r.bindBuffer(r.ARRAY_BUFFER, c), r.bufferData(r.ARRAY_BUFFER, new Float32Array(a), r.STATIC_DRAW);
  let p, f;
  return o !== void 0 && (p = r.createBuffer(), f = o.length, r.bindBuffer(r.ELEMENT_ARRAY_BUFFER, p), r.bufferData(r.ELEMENT_ARRAY_BUFFER, new Uint16Array(o), r.STATIC_DRAW)), {
    shaderProgram: s,
    programInfo: {
      attributesLocations: l,
      uniformsLocations: u
    },
    positionBuffer: c,
    indexBuffer: p,
    indexBufferLength: f
  };
}
function Tt(r) {
  if (!r)
    return [1, 1, 1, 0];
  if (r === "transparent")
    return [1, 1, 1, 0];
  try {
    const e = Gu(r), t = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(e);
    if (t != null && t.length) {
      const i = !!t[4];
      return [...Bu.hex.rgb(e).map((a) => a / 255), i ? parseInt(t[4], 16) / 255 : 1];
    }
    const n = e.match(/(\d\.\d(\d+)?|\d{3}|\d{2}|\d{1})/gi) ?? ["0", "0", "0"];
    if (e.includes("rgb")) {
      const i = e.includes("rgba"), a = [
        ...n.map((o) => parseFloat(o)).map((o, s) => s < 3 ? o / 255 : o)
        // because alpha is in the range 0 - 1, not 0 - 255
      ];
      return i || a.push(1), a;
    }
  } catch {
  }
  return console.warn([`[parseColorStringToVec4]: Color ${r} is either not a valid color or its type is not supported, defaulting to black`]), [0, 0, 0, 1];
}
let gt;
function Gu(r) {
  return gt = gt ?? document.createElement("canvas").getContext("2d"), gt ? (gt.fillStyle = r, gt.fillStyle) : "#000000";
}
const Hu = {
  toNumeric: ([r, e]) => ({ x: r, y: e }),
  fromNumeric: (r) => [r.x, r.y]
}, Ku = {
  toNumeric: (r) => ({ value: r }),
  fromNumeric: (r) => r.value
}, Zu = {
  toNumeric: (r) => ({ value: r }),
  fromNumeric: (r) => r.value
}, Wu = {
  toNumeric: ({ opacity: r, scale: [e, t], lift: n }) => ({ opacity: r, scaleX: e, scaleY: t, lift: n }),
  fromNumeric: ({ opacity: r, scaleX: e, scaleY: t, lift: n }) => ({ opacity: r, scale: [e, t], lift: n })
}, Yu = {
  // this looks pointless, but its designed to strip the LngLat object of its type
  // so that it can be passed to the MaptilerAnimation engine
  toNumeric: ({ lng: r, lat: e }) => ({ lng: r, lat: e }),
  fromNumeric: ({ lng: r, lat: e }) => new Le(r, e)
}, Xu = {
  toNumeric: (r) => {
    if (r === void 0) return { r: 0, g: 0, b: 0, a: 0 };
    const [e, t, n, i] = Tt(r);
    return { r: e, g: t, b: n, a: i };
  },
  fromNumeric: ({ r, g: e, b: t, a: n }) => `rgba(${Math.round(r * 255)}, ${Math.round(e * 255)}, ${Math.round(t * 255)}, ${n})`
};
function nn(r, e, t, n) {
  const [i, a, o] = t, s = new qt({
    keyframes: [
      { delta: 0, props: n.codec.toNumeric(r), easing: a ?? "Linear" },
      { delta: 1, props: n.codec.toNumeric(e) }
    ],
    duration: i,
    iterations: 1,
    delay: o ?? 0
  });
  return s.addEventListener("play", () => {
    n.onStart();
  }), s.addEventListener("timeupdate", (l) => {
    n.onUpdate(n.codec.fromNumeric(l.props));
  }), s.addEventListener("animationend", () => {
    n.onEnd(e), s.destroy();
  }), s.play(), s;
}
const Ju = {
  fade: "Linear",
  grow: "CubicOut",
  pop: "ElasticOut",
  drop: "CubicOut",
  bounce: "BounceOut"
};
function Qu(r, e, t) {
  switch (r) {
    case "fade":
      return { opacity: 0, scale: t, lift: 0 };
    case "grow":
    case "pop":
      return { opacity: 0, scale: [0, 0], lift: 0 };
    case "drop":
      return { opacity: 0, scale: t, lift: -48 };
    case "bounce":
      return { opacity: e, scale: t, lift: -48 };
  }
}
const ec = {
  fade: "Linear",
  shrink: "CubicIn",
  pop: "ElasticIn",
  explode: "CubicOut"
}, Hi = 2;
function tc(r, e, t) {
  switch (r) {
    case "fade":
      return { opacity: 0, scale: t, lift: 0 };
    case "shrink":
      return { opacity: e, scale: [0, 0], lift: 0 };
    case "pop":
      return { opacity: 0, scale: [0, 0], lift: 0 };
    case "explode":
      return { opacity: 0, scale: [t[0] * Hi, t[1] * Hi], lift: 0 };
  }
}
function Ki(r, e, t) {
  const n = (i, a) => i + (a - i) * t;
  return {
    opacity: n(r.opacity, e.opacity),
    scale: [n(r.scale[0], e.scale[0]), n(r.scale[1], e.scale[1])],
    lift: n(r.lift, e.lift)
  };
}
function rc(r, e, t) {
  const n = r === "scale" || r === "opacity" ? 1 : 0;
  return n + (e - n) * t;
}
const nc = 1.15, ic = 0.45, an = 12, ac = {
  //region pulsescale
  // Rest for the first/last ~35%, a single smooth "breathing" scale pulse in between.
  pulsescale: {
    channel: "scale",
    keyframes: [
      { delta: 0, value: 1 },
      { delta: 0.4, value: 1 },
      { delta: 0.5, value: nc, easing: "SinusoidalInOut" },
      { delta: 0.65, value: 1, easing: "SinusoidalInOut" },
      { delta: 1, value: 1 }
    ]
  },
  //endregion
  //region pulseopacity
  // Same shape as pulsescale, on opacity instead of scale.
  pulseopacity: {
    channel: "opacity",
    keyframes: [
      { delta: 0, value: 1 },
      { delta: 0.5, value: ic, easing: "SinusoidalInOut" },
      { delta: 1, value: 1, easing: "SinusoidalInOut" }
    ]
  },
  //endregion
  //region ring
  // Rest for the first/last ~40%, several alternating rotation wiggles clustered around the midpoint.
  ring: {
    channel: "rotation",
    keyframes: [
      { delta: 0, value: 0 },
      { delta: 0.4, value: 0 },
      { delta: 0.45, value: -an, easing: "SinusoidalInOut" },
      { delta: 0.5, value: an, easing: "SinusoidalInOut" },
      { delta: 0.55, value: -an * 0.6, easing: "SinusoidalInOut" },
      { delta: 0.6, value: 0, easing: "SinusoidalInOut" },
      { delta: 1, value: 0 }
    ]
  },
  //endregion
  //region bounce
  // Rest to 0.25, rise to the peak by the midpoint, bounce back down to rest by 0.75, rest out the rest.
  bounce: {
    channel: "lift",
    keyframes: [
      { delta: 0, value: 0 },
      { delta: 0.45, value: 0, easing: "SinusoidalOut" },
      { delta: 0.5, value: -14, easing: "BounceOut" },
      { delta: 0.7, value: 0 },
      { delta: 1, value: 0 }
    ]
  }
  //endregion
}, oc = {
  pulsescale: 1e3,
  pulseopacity: 1e3,
  ring: 3e3,
  bounce: 3e3
}, sc = {
  scale: 1
  // scale in our class will be a 2D vector.
};
function lc(r) {
  return Array.isArray(r) ? [r[0], r[1]] : [r.x, r.y];
}
const uc = ["innerColor", "outerColor", "contentColor", "shadow", "opacity"], cc = ["outerColor", "innerColor", "contentColor", "outlineColor"], pc = [
  "shape",
  "size",
  "innerColor",
  "outerColor",
  "contentColor",
  "outline",
  "outlineColor",
  "shadow",
  "opacity",
  "opacityWhenCovered",
  "name",
  "title",
  "content",
  "htmlAttributes",
  "scale",
  "visible",
  "priority",
  "userData",
  "collisionBehaviour",
  "collisionRadius",
  "minimizedOptions",
  "rotation",
  "debug",
  "states",
  "transitions"
];
var Va, qa, Ga;
let xn = class extends C.Marker {
  constructor(t) {
    var o;
    const n = t.size ?? Oe, i = {
      ...Wr(t, pc),
      // custom-element markers get no automatic offset — their geometry is unknown
      offset: t.offset ?? (t.element ? void 0 : yt(t.shape ?? _e, n))
    }, a = t.element ?? Il(t);
    super({
      element: a,
      ...i,
      ...sc
    });
    /** Construction-time options snapshot — not updated by setters. */
    y(this, "options");
    y(this, "_scale", 1);
    // MapLibre only scales in 1D; ours is 2D via `props.scale`, so this is unused.
    //#region Marker Properties
    /** Current values of all element-affecting properties. Written only via {@link setProp}. */
    y(this, "props");
    /** Whether the shape anchor offset is auto-managed — `false` with an explicit `offset` or custom `element`. */
    y(this, "managesOffset");
    /** The DOM element **/
    y(this, Ga);
    /** Property updates waiting to be flushed to the DOM on the next animation frame. */
    y(this, qa, {});
    /** Unscaled CSS pixel size of a custom `element`, measured once at registration. `null` until measured; unused for built-in SVG markers. */
    y(this, Va, null);
    /** UUID that uniquely identifies this marker instance. */
    y(this, "id", Bt());
    /** How the collision engine is currently displaying this marker. */
    y(this, "collisionDisplayState", "visible");
    /** Visual props overridden while minimized, restored from {@link props} on un-minimize. Empty when not minimized. */
    y(this, "minimizedKeys", []);
    /** Whether the minimized appearance is currently applied to the DOM. Lags {@link collisionDisplayState} during fades. */
    y(this, "minimizedApplied", !1);
    /** Pending mid-fade appearance swap for minimize transitions. */
    y(this, "minimizeSwapTimer", null);
    /** Pending post-fade cull (`display: none`) while hidden. */
    y(this, "cullTimer", null);
    /** Pending release of the collision fade class once no fade/dip is in flight. */
    y(this, "fadeClassReleaseTimer", null);
    /** Registered property overrides per UI state, keyed by state name. */
    y(this, "uiStates");
    /** UI states currently active (interaction-driven). */
    y(this, "activeUIStates", /* @__PURE__ */ new Set());
    /** Keys owned by the flattened active UI state, masked out of DOM flushes like {@link minimizedKeys}. */
    y(this, "appliedUIStateKeys", []);
    /** Registered per-property transition config, keyed by property name. */
    y(this, "transitions");
    /** In-flight transitions, keyed by property — at most one each. `"opacity"` isn't a public {@link MarkerTransitionProperty}, reused for enter/exit fades. */
    y(this, "activeTransitions", /* @__PURE__ */ new Map());
    /** The currently-looping `idle` animation, if any — started after `enter` finishes (or immediately), stopped on `remove()`. */
    y(this, "idleAnimation", null);
    /** Configured enter/idle/exit lifecycle animations. */
    y(this, "animations");
    /** Set during `addTo()`'s call into the base `addTo()`, which calls `this.remove()` first to detach from any previous map. */
    y(this, "suppressLifecycleAnimations", !1);
    /** Altitude in meters, faked via a per-frame pixel offset (MapLibre's Marker has no native Z). 0 by default — see {@link setAltitude}. */
    y(this, "altitudeMeters", 0);
    /** What {@link altitudeMeters} is measured from — see {@link AltitudeReference}. */
    y(this, "altitudeReference", "ground");
    /** True once {@link setAltitude} has been called at least once — see {@link hasActiveAltitude}. */
    y(this, "altitudeEngaged", !1);
    /** The offset MapLibre would show with no altitude applied. Only {@link writeOffset} should write the real offset — anything that calls `super.setOffset` directly clobbers altitude. */
    y(this, "baseOffset", [0, 0]);
    /** Pixel delta from `groundBase` to `elevated`, added to {@link baseOffset}. Null when off-screen/behind camera. */
    y(this, "altitudeDelta", null);
    /** The `elevated` point in absolute canvas CSS pixels — the ground line's position. */
    y(this, "groundLineOrigin", null);
    /** True when off-screen/behind the camera. Not the below-ground case — see {@link altitudeOccluded}. */
    y(this, "altitudeHidden", !1);
    /** True when below ground (`computeAltitudeProjection`'s `belowGround`). */
    y(this, "altitudeOccluded", !1);
    y(this, "groundLineEnabled", !1);
    y(this, "groundLineOptions", {});
    y(this, "groundLineEl", null);
    this[Z] = a, this.classList.add(Qa), this.baseOffset = i.offset ?? [0, 0], t.element && eo(t.element, t), (o = t.animations) != null && o.enter && (a.style.opacity = "0"), this.managesOffset = !t.offset && !t.element, this.props = {
      shape: t.shape,
      size: t.size,
      scale: Array.from(t.scale ?? [1, 1]),
      shadow: t.shadow,
      outerColor: t.outerColor,
      innerColor: t.innerColor,
      contentColor: t.contentColor,
      outlineColor: t.outlineColor,
      outline: t.outline,
      opacity: t.opacity,
      title: t.title,
      content: t.content,
      htmlAttributes: t.htmlAttributes,
      rotation: t.rotation,
      debug: t.debug,
      priority: t.priority
    }, typeof t.priority == "number" && (a.style.zIndex = String(t.priority)), this.options = t, this.uiStates = { ...t.states }, this.transitions = { ...t.transitions }, this.animations = { ...t.animations }, this.attachUIStateListeners();
  }
  /**
   * The `classList` of the marker's wrapper element — the inner transform
   * wrapper of a built-in marker, or the custom `element` itself. Read-only
   * reference; add and remove classes through the returned list.
   */
  get classList() {
    return Lt(this[Z]).classList;
  }
  //#endregion
  //#region Internal
  /**
   * Adds the marker to a map, and plays the configured `enter` animation (if any) once attached.
   * @param map - Target map instance.
   */
  addTo(t) {
    this.suppressLifecycleAnimations = !0, super.addTo(t), this.suppressLifecycleAnimations = !1;
    const n = this.animations.enter, i = this.animations.idle;
    return n ? this.playEnterAnimation(n, () => {
      i && this.startIdleAnimation(i);
    }) : i && this.startIdleAnimation(i), this;
  }
  /** Recomputes the shape anchor offset so the shape's tip stays on the lngLat. No-op with an explicit `offset` or custom `element`. */
  applyShapeAnchorOffset() {
    this.managesOffset && (this.minimizedApplied || this.setOffset(yt(this.props.shape ?? _e, this.props.size ?? Oe)));
  }
  /**
   * Records a property's new value and schedules a DOM flush on the next
   * animation frame via {@link MarkerManager}.
   * @param prop - The element property to update.
   * @param value - The new value for the property.
   */
  setProp(t, n) {
    this.props[t] = n, this[bt][t] = n, $.addMarkerUpdateToQueue(this);
  }
  /**
   * Applies all pending property updates to the marker element and clears
   * the batch. Called by {@link MarkerManager} on the next animation frame.
   */
  [(Ga = Z, qa = bt, Va = Et, co)]() {
    const t = this[bt];
    this[bt] = {};
    const n = [...this.minimizedApplied ? this.minimizedKeys : [], ...this.appliedUIStateKeys], i = n.length > 0 ? Wr(t, n) : t;
    Object.keys(i).length !== 0 && Jt(this[Z], i, this.getCurrentStyleId());
  }
  /** Returns the style id of the map this marker is on, or `undefined` when detached. */
  getCurrentStyleId() {
    const t = $.getMap(this);
    return t ? $.getMapStyleId(t) : void 0;
  }
  /** Queues re-resolving every unset colour against the current map style. */
  [wn]() {
    for (const t of cc)
      this.props[t] === void 0 && this.setProp(t, void 0);
  }
  /** Sets one colour prop; `undefined` returns it to its map-style default (resolved at flush time, so nothing to transition to). */
  setColorProp(t, n) {
    if (n === void 0) {
      this.cancelTransition(t), this.setProp(t, void 0);
      return;
    }
    this.applyTransitionable(t, this.getEffectiveColor(t), n, Xu, (i) => {
      this.setProp(t, i);
    });
  }
  /** A colour prop's value in effect — the explicit one, else the default for the map's style. */
  getEffectiveColor(t) {
    return this.props[t] ?? Wn(this.getCurrentStyleId() ?? "")[t];
  }
  //#endregion
  //#region Collision
  /** Resolves the marker's screen footprint for collision detection. Always full-size, even minimized. */
  [po]() {
    const [t, n] = this.props.scale ?? [1, 1], i = {
      rotation: this.props.rotation ?? 0,
      mapAligned: this.getRotationAlignment() === "map"
    }, a = this.options.collisionRadius;
    if (a && a > 0)
      return { width: a * 2, height: a * 2, anchor: "center", offset: this.footprintOffset(), ...i, pivot: [0, 0] };
    const o = this.options.anchor ?? "center";
    if (this.options.element) {
      const [d, h] = this[Et] ?? [0, 0];
      return { width: d * t, height: h * n, anchor: o, offset: this.footprintOffset(), ...i, pivot: [0, 0] };
    }
    const { shape: s, size: l } = this.effectiveShapeAndSize(!1), u = Vt[l], c = ve[s], p = u * n, f = c.anchor === "center" ? [0, 0] : [0, p / 2];
    return { width: u * t, height: p, anchor: o, offset: this.footprintOffset(), ...i, pivot: f };
  }
  /** Shape/size keys, or minimized substitutes. */
  effectiveShapeAndSize(t) {
    const n = this.props.shape ?? _e, i = this.props.size ?? Oe;
    if (!t) return { shape: n, size: i };
    const a = this.options.minimizedOptions;
    return { shape: (a == null ? void 0 : a.shape) ?? n, size: (a == null ? void 0 : a.size) ?? "xs" };
  }
  /** Screen offset for the collision footprint. */
  footprintOffset() {
    if (this.managesOffset) {
      const { shape: n, size: i } = this.effectiveShapeAndSize(!1);
      return yt(n, i);
    }
    const t = this.getOffset();
    return [t.x, t.y];
  }
  /** Fires the collision transition event (`markeroverlap`/`markerproximity`). */
  [fo](t) {
    this.fire(t.kind === "overlap" ? "markeroverlap" : "markerproximity", t);
  }
  /**
   * Applies the collision engine's display-state decision.
   *
   * Every transition fades. Hide/show fade in place; visible<->minimized
   * fades *through* zero (dip out, swap at the invisible midpoint, fade back in).
   */
  [dr](t) {
    if (t === this.collisionDisplayState) return;
    const n = this.collisionDisplayState;
    this.collisionDisplayState = t, this.minimizeSwapTimer !== null && (clearTimeout(this.minimizeSwapTimer), this.minimizeSwapTimer = null), this.cullTimer !== null && (clearTimeout(this.cullTimer), this.cullTimer = null);
    const i = this.getElement();
    if (t === "hidden") {
      this.setCollisionHidden(!0), this.cullTimer = setTimeout(() => {
        this.cullTimer = null, gn(this.getElement(), !0);
      }, this.collisionTransitionMs());
      return;
    }
    const a = t === "minimized";
    if (n === "hidden") {
      gn(i, !1), this.setMinimizedApplied(a), this.setCollisionHidden(!1);
      return;
    }
    if (this.minimizedApplied === a) {
      this.setCollisionHidden(!1);
      return;
    }
    this.setCollisionHidden(!0), this.minimizeSwapTimer = setTimeout(() => {
      this.minimizeSwapTimer = null, this.setMinimizedApplied(a), this.setCollisionHidden(!1);
    }, this.collisionTransitionMs());
  }
  /** Toggles the collision-hidden fade and reschedules releasing the fade class — see {@link fadeClassReleaseTimer}. */
  setCollisionHidden(t) {
    Nl(this.getElement(), t), this.fadeClassReleaseTimer !== null && clearTimeout(this.fadeClassReleaseTimer), this.fadeClassReleaseTimer = setTimeout(() => {
      this.fadeClassReleaseTimer = null, $l(this.getElement());
    }, this.collisionTransitionMs());
  }
  /** The fade duration (ms) configured for this marker's map, or the SDK default when off a map. */
  collisionTransitionMs() {
    const t = $.getMap(this);
    return t ? $.getCollisionTransitionDuration(t) : yn;
  }
  /** Applies or restores the minimized appearance if it differs from what the DOM shows. */
  setMinimizedApplied(t) {
    this.minimizedApplied !== t && (this.minimizedApplied = t, this.applyMinimizedAppearance(t));
  }
  /** Returns how the collision engine is currently displaying this marker. */
  getCollisionDisplayState() {
    return this.collisionDisplayState;
  }
  /** The visual props the minimized appearance overrides for this marker. */
  minimizedOverrides() {
    const t = this.options.minimizedOptions ?? {};
    if (!this.options.element) return { size: "xs", ...t };
    const n = {};
    for (const i of uc)
      i in t && (n[i] = t[i]);
    return n;
  }
  /** Applies or restores the minimized appearance, straight to the DOM (never {@link setProp}). */
  applyMinimizedAppearance(t) {
    const n = this.getCurrentStyleId();
    if (t) {
      const a = this.minimizedOverrides();
      if (this.minimizedKeys = Object.keys(a), this.options.element && _i(this.options.element, this.options.anchor ?? "center", !0), this.minimizedKeys.length > 0 && Jt(this[Z], a, n), this.managesOffset) {
        const { shape: o, size: s } = this.effectiveShapeAndSize(!0);
        this.writeOffset(yt(o, s));
      }
      return;
    }
    const i = this.restoreUpdates(this.minimizedKeys);
    this.minimizedKeys = [], this.options.element && _i(this.options.element, this.options.anchor ?? "center", !1), Object.keys(i).length > 0 && Jt(this[Z], i, n), this.managesOffset && this.writeOffset(yt(this.props.shape ?? _e, this.props.size ?? Oe));
  }
  /** Builds the batch restoring `keys` to their prop values. */
  restoreUpdates(t) {
    const n = {};
    for (const i of t) n[i] = this.props[i];
    return n;
  }
  /**
   * Sets the marker's geographical position.
   * @param lnglat - The new position.
   */
  setLngLat(t) {
    const n = C.LngLat.convert(t);
    return this.applyTransitionable("position", this.getLngLat(), n, Yu, (i) => {
      super.setLngLat(i);
      const a = $.getMap(this);
      a && $.invalidateCollisions(a);
    }), this;
  }
  /**
   * Sets the marker's screen-space pixel offset. Composes with altitude (see {@link writeOffset}) rather than replacing it.
   * @param offset - Offset in pixels (+y down).
   */
  setOffset(t) {
    this.writeOffset(t);
    const n = $.getMap(this);
    return n && $.invalidateCollisions(n), this;
  }
  /** The only path that should write MapLibre's real offset: records `offset` as {@link baseOffset}, then writes `base + altitudeDelta`. Callers must never use `super.setOffset` directly, or altitude gets silently dropped. */
  writeOffset(t) {
    var s, l;
    this.baseOffset = t;
    const [n, i] = lc(t), a = ((s = this.altitudeDelta) == null ? void 0 : s.x) ?? 0, o = ((l = this.altitudeDelta) == null ? void 0 : l.y) ?? 0;
    super.setOffset([n + a, i + o]);
  }
  //#endregion
  //#region Getters & Setters
  //#region Scale
  /**
   * Sets the 2-D scale of the marker as `[x, y]`.
   * @param scaleVector - Scale factors for the x and y axes.
   */
  setScale(t) {
    this.applyTransitionable("scale", this.props.scale ?? [1, 1], t, Hu, (n) => {
      this.setProp("scale", n);
    });
  }
  /** Returns the current 2-D scale. Defaults to `[1, 1]`. */
  getScale() {
    return this.props.scale;
  }
  //#endregion
  //#region Shape
  /**
   * Sets the marker shape. Applies the new anchor offset (see {@link applyShapeAnchorOffset}).
   * @param shape - Marker shape key.
   */
  setShape(t) {
    this.setProp("shape", t), this.applyShapeAnchorOffset();
  }
  /** Returns the current shape, or `undefined` if never set. */
  getShape() {
    return this.props.shape;
  }
  //#endregion
  //#region Size
  /**
   * Sets the marker size.
   * @param size - Marker size key.
   */
  setSize(t) {
    this.setProp("size", t), this.applyShapeAnchorOffset();
  }
  /** Returns the current size, or `undefined` if never explicitly set. */
  getSize() {
    return this.props.size;
  }
  //#endregion
  //#region Shadow
  /**
   * Sets the drop-shadow intensity.
   * @param shadow - Shadow intensity preset, or `undefined` to remove it.
   */
  setShadow(t) {
    this.setProp("shadow", t);
  }
  /** Returns the current shadow preset, or `undefined` if none is set. */
  getShadow() {
    return this.props.shadow;
  }
  //#endregion
  //#region Outer Color
  /**
   * Sets the fill colour of the outer body of the marker.
   * @param color - Any valid CSS colour string, or `undefined` to return to the map-style default.
   */
  setOuterColor(t) {
    this.setColorProp("outerColor", t);
  }
  /** Returns the outer body colour currently in effect — the explicit `outerColor`, else the default for the map's style. */
  getOuterColor() {
    return this.getEffectiveColor("outerColor");
  }
  //#endregion
  //#region Inner Color
  /**
   * Sets an explicit fill colour for the inner area of the marker, replacing
   * the map-style default.
   * @param color - Any valid CSS colour string, or `undefined` to return to the map-style default.
   */
  setInnerColor(t) {
    this.setColorProp("innerColor", t);
  }
  /** Returns the inner area colour currently in effect — the explicit `innerColor`, else the default for the map's style. */
  getInnerColor() {
    return this.getEffectiveColor("innerColor");
  }
  //#endregion
  //#region Content Color
  /**
   * Sets the colour applied to the marker content (icon, text, etc.).
   * @param color - Any valid CSS colour string, or `undefined` to return to the map-style default.
   */
  setContentColor(t) {
    this.setColorProp("contentColor", t);
  }
  /** Returns the content colour currently in effect — the explicit `contentColor`, else the default for the map's style. */
  getContentColor() {
    return this.getEffectiveColor("contentColor");
  }
  //#endregion
  //#region Outline Color
  /**
   * Sets the stroke colour of the marker outline.
   * Has no visible effect unless {@link setOutline} is also called.
   * @param color - Any valid CSS colour string, or `undefined` to return to the map-style default.
   */
  setOutlineColor(t) {
    this.setColorProp("outlineColor", t);
  }
  /** Returns the outline stroke colour currently in effect — the explicit `outlineColor`, else the default for the map's style. */
  getOutlineColor() {
    return this.getEffectiveColor("outlineColor");
  }
  //#endregion
  //#region Outline
  /**
   * Sets the outline stroke width on the marker body.
   * @param outline - `true` for the default width, a positive `number` for an
   *   explicit pixel width, or `undefined` to remove the outline.
   */
  setOutline(t) {
    this.setProp("outline", t);
  }
  /** Returns the current outline value (`true`, a pixel width, or `undefined`). */
  getOutline() {
    return this.props.outline;
  }
  //#endregion
  //#region Title
  /**
   * Sets the `title` attribute on the marker's root element (native tooltip).
   * @param title - Tooltip string, or `undefined` to remove the attribute.
   */
  setTitle(t) {
    this.setProp("title", t);
  }
  /** Returns the current title string. */
  getTitle() {
    return this.props.title;
  }
  //#endregion
  //#region Content
  /**
   * Sets the text content displayed inside the marker body.
   * @param content - Label string, or `undefined` to clear.
   */
  setContent(t) {
    this.setProp("content", t);
  }
  /** Returns the current content string. */
  getContent() {
    return this.props.content;
  }
  //#endregion
  //#region Priority
  /**
   * Sets the rendering priority.
   * @param priority - Numeric priority, a MapLibre-style expression, or
   *   `undefined` to restore DOM-order stacking.
   */
  setPriority(t) {
    this.setProp("priority", t);
  }
  /** Returns the current rendering priority, or `undefined` if never set. */
  getPriority() {
    return this.props.priority;
  }
  //#endregion
  //#region Debug
  /**
   * Shows or hides the debug overlay, which renders the marker's bounding
   * box and center point on top of the marker element.
   * @param debug - `true` to show the overlay, `false`/`undefined` to hide it.
   */
  setDebug(t) {
    this.setProp("debug", t);
  }
  /** Returns whether the debug overlay is currently enabled. */
  getDebug() {
    return this.props.debug ?? !1;
  }
  //#endregion
  //#region Rotation
  /**
   * Rotates the marker's inner shell element in degrees, via the CSS
   * `scale(x, y) rotate(deg)` transform on the inner wrapper — independent
   * of MapLibre's own rotation on the outer container.
   * @param rotation - Clockwise rotation in degrees.
   */
  setRotation(t) {
    return this.applyTransitionable("rotation", this.props.rotation ?? 0, t, Ku, (n) => {
      this.setProp("rotation", n);
    }), this;
  }
  /**
   * Returns the current inner-shell rotation in degrees.
   * @returns Rotation in degrees; `0` if never set.
   */
  getRotation() {
    return this.props.rotation ?? 0;
  }
  //#endregion
  //#endregion
  //#region UI States
  attachUIStateListeners() {
    const t = Lt(this[Z]);
    t.hasAttribute("tabindex") || (t.tabIndex = 0), t.addEventListener("pointerenter", () => {
      this.setUIStateActive("hover", !0);
    }), t.addEventListener("pointerleave", () => {
      this.setUIStateActive("active", !1), this.setUIStateActive("hover", !1);
    }), t.addEventListener("pointerdown", () => {
      this.setUIStateActive("active", !0);
    }), t.addEventListener("pointerup", () => {
      this.setUIStateActive("active", !1);
    }), t.addEventListener("pointercancel", () => {
      this.setUIStateActive("active", !1);
    }), t.addEventListener("focus", () => {
      this.setUIStateActive("focus", !0);
    }), t.addEventListener("pointerdown", () => {
      t.focus();
    }), t.addEventListener("blur", () => {
      this.setUIStateActive("focus", !1);
    }), this.on("dragstart", () => {
      this.setUIStateActive("dragging", !0);
    }), this.on("dragend", () => {
      this.setUIStateActive("dragging", !1);
    });
  }
  /** Blurs the marker's focusable element. Called by {@link MarkerManager} on map `click`. */
  [ho]() {
    Lt(this[Z]).blur();
  }
  setUIStateActive(t, n) {
    n !== this.activeUIStates.has(t) && (n ? this.activeUIStates.add(t) : this.activeUIStates.delete(t), this.applyUIStates());
  }
  applyUIStates() {
    const t = su(this.uiStates, this.activeUIStates), n = Object.keys(t), i = this.appliedUIStateKeys.filter((s) => !(s in t)), a = i.length > 0 ? this.restoreUpdates(i) : {};
    this.appliedUIStateKeys = n;
    const o = { ...a, ...t };
    Object.keys(o).length !== 0 && Jt(this[Z], o, this.getCurrentStyleId());
  }
  /**
   * Registers (or replaces) the property overrides applied while `name` is
   * active. Applies immediately if that state is currently active.
   * @param name - UI state to configure.
   * @param spec - Property overrides to apply while the state is active.
   */
  setUIState(t, n) {
    this.uiStates[t] = n, this.activeUIStates.has(t) && this.applyUIStates();
  }
  //#endregion
  //#region Transitions
  /**
   * Configures (or clears) the easing used the next time `property` changes.
   * @param property - Transitionable property to configure.
   * @param transition - `[duration, easing?, delay?]` in milliseconds, or `null` to make future changes snap immediately again.
   */
  setTransitionForProperty(t, n) {
    if (n) {
      this.transitions[t] = n;
      return;
    }
    this.transitions = Wr(this.transitions, [t]);
  }
  /** Returns a copy of the currently configured per-property transitions. */
  getTransitions() {
    return { ...this.transitions };
  }
  /**
   * Applies `to` to `property`, either immediately or by easing from `from`
   * when a transition is configured. Fires `transitionstart`/`transitionend`.
   * @param property - Transitionable property being changed.
   * @param from - Current value.
   * @param to - Value being set.
   * @param codec - Bridges `T` to/from the flat numeric props the underlying animation interpolates.
   * @param apply - Writes an interpolated (or the immediate) value to the marker.
   */
  applyTransitionable(t, n, i, a, o) {
    this.cancelTransition(t);
    const s = this.transitions[t];
    if (!s || !$.getMap(this)) {
      o(i);
      return;
    }
    const l = nn(n, i, s, {
      codec: a,
      onUpdate: o,
      onStart: () => this.fire("transitionstart", { props: { [t]: n } }),
      onEnd: (u) => {
        this.activeTransitions.delete(t), o(u), this.fire("transitionend", { props: { [t]: u } });
      }
    });
    this.activeTransitions.set(t, l);
  }
  /** Cancels any transition in flight for `property`, leaving its current (mid-transition) value as-is. */
  cancelTransition(t) {
    const n = this.activeTransitions.get(t);
    n && (n.destroy(), this.activeTransitions.delete(t));
  }
  /** Cancels every transition in flight. Called on removal so a destroyed marker's props can't keep animating. */
  cancelAllTransitions() {
    for (const t of [...this.activeTransitions.keys()]) this.cancelTransition(t);
  }
  //#endregion
  //#region Lifecycle Animations
  /** Runs `preset`'s enter/exit motion (opacity + scale + lift) from `from` to `to`. */
  playLifecycleTransition(t, n, i, a, o, s, l) {
    this.cancelTransition("opacity"), this.cancelTransition("scale");
    const u = nn(n, i, [o.duration ?? 1e3, a, o.delay ?? 0], {
      codec: Wu,
      onUpdate: (c) => {
        this.clearEnterMask(), this.setProp("opacity", c.opacity), this.setProp("scale", c.scale), Yr(this[Z], c.lift);
      },
      onStart: () => this.fire(`${t}animationstart`, { preset: s }),
      onEnd: (c) => {
        this.clearEnterMask(), this.activeTransitions.delete("opacity"), this.activeTransitions.delete("scale"), this.setProp("opacity", c.opacity), this.setProp("scale", c.scale), Yr(this[Z], c.lift), this.fire(`${t}animationend`, { preset: s }), l == null || l();
      }
    });
    this.activeTransitions.set("opacity", u), this.activeTransitions.set("scale", u);
  }
  /** Runs a `custom` enter/exit animation: an eased `0`→`1` alpha handed to `spec.custom` every frame. */
  playCustomLifecycleAnimation(t, n, i) {
    this.cancelTransition("opacity"), this.cancelTransition("scale");
    const a = nn(0, 1, [n.duration ?? 1e3, n.easing, n.delay ?? 0], {
      codec: Zu,
      onUpdate: (o) => {
        this.clearEnterMask(), n.custom(o, this);
      },
      onStart: () => this.fire(`${t}animationstart`, { preset: "custom" }),
      onEnd: (o) => {
        this.clearEnterMask(), this.activeTransitions.delete("opacity"), n.custom(o, this), this.fire(`${t}animationend`, { preset: "custom" }), i == null || i();
      }
    });
    this.activeTransitions.set("opacity", a);
  }
  /** Clears the enter-mask opacity set at construction. Idempotent, safe to call unconditionally — each enter/exit path (preset or `custom`) is responsible for calling it on its own first frame, since the SDK can't know in advance whether a `custom` callback touches opacity. */
  clearEnterMask() {
    this[Z].style.opacity = "";
  }
  /** Plays the configured `enter` animation, easing from {@link enterPresetHiddenValue} up to the marker's own configured state. */
  playEnterAnimation(t, n) {
    if (typeof t.custom == "function") {
      this.playCustomLifecycleAnimation("enter", t, n);
      return;
    }
    const i = this.props.opacity ?? 1, a = this.props.scale ?? [1, 1], o = { opacity: i, scale: a, lift: 0 }, s = Ki(o, Qu(t.preset, i, a), t.magnitude ?? 1);
    this.playLifecycleTransition("enter", s, o, t.easing ?? Ju[t.preset], t, t.preset, n);
  }
  /** Plays the configured `exit` animation, easing from the marker's own configured state down to {@link exitPresetHiddenValue}. */
  playExitAnimation(t, n) {
    if (typeof t.custom == "function") {
      this.playCustomLifecycleAnimation("exit", t, n);
      return;
    }
    const i = this.props.opacity ?? 1, a = this.props.scale ?? [1, 1], o = { opacity: i, scale: a, lift: 0 }, s = Ki(o, tc(t.preset, i, a), t.magnitude ?? 1);
    this.playLifecycleTransition("exit", o, s, t.easing ?? ec[t.preset], t, t.preset, n);
  }
  /** Wires play/iteration/stop bookkeeping around a `value`-keyframed animation, and plays it. */
  runIdleAnimation(t, n, i, a, o, s) {
    const l = new qt({ keyframes: n, duration: a, iterations: o, delay: s });
    l.addEventListener("play", () => this.fire("idleanimationstart", { preset: t })), l.addEventListener("timeupdate", (u) => {
      i(u.props.value);
    }), l.addEventListener("iteration", () => this.fire("idleanimationiteration", { preset: t })), l.addEventListener("stop", () => {
      this.idleAnimation = null, this.fire("idleanimationend", { preset: t });
    }), this.idleAnimation = l, l.play();
  }
  /** Starts the configured `idle` loop — `preset`'s single channel (see {@link IDLE_PRESET_CONFIG}), or a `custom` callback fed a `0`→`1` alpha. */
  startIdleAnimation(t) {
    if (this.stopIdleAnimation(), typeof t.custom == "function") {
      this.runIdleAnimation(
        "custom",
        [
          { delta: 0, props: { value: 0 }, easing: t.easing ?? "Linear" },
          { delta: 1, props: { value: 1 } }
        ],
        (c) => {
          t.custom(c, this);
        },
        t.duration ?? 1e3,
        t.iterations ?? 1 / 0,
        t.delay ?? 0
      );
      return;
    }
    const { channel: n, keyframes: i } = ac[t.preset], a = t.magnitude ?? 1, o = this.props.opacity ?? 1, s = this.props.scale ?? [1, 1], l = this.props.rotation ?? 0, u = (c) => {
      switch (n) {
        case "scale":
          this.setProp("scale", [s[0] * c, s[1] * c]);
          break;
        case "opacity":
          this.setProp("opacity", o * c);
          break;
        case "rotation":
          this.setRotation(l + c);
          break;
        case "lift":
          Yr(this[Z], c);
          break;
      }
    };
    this.runIdleAnimation(
      t.preset,
      i.map((c) => ({ delta: c.delta, props: { value: rc(n, c.value, a) }, easing: c.easing ?? "Linear" })),
      u,
      t.duration ?? oc[t.preset],
      t.iterations ?? 1 / 0,
      t.delay ?? 0
    );
  }
  /** Stops the currently-looping `idle` animation, if any, leaving the marker at its current (mid-loop) state. */
  stopIdleAnimation() {
    this.idleAnimation && (this.idleAnimation.destroy(), this.idleAnimation = null);
  }
  setAltitude(t, n = {}) {
    if (t === !1) {
      if (!this.altitudeEngaged) return this;
      this.altitudeEngaged = !1, this.altitudeMeters = 0, this.altitudeReference = "ground";
      const o = $.getMap(this);
      return o && $.deregisterAltitudeParticipant(this, o), this.altitudeDelta = null, this.groundLineOrigin = null, this.writeOffset(this.baseOffset), this.setAltitudeHidden(!1), this.setAltitudeOccluded(!1), this.updateGroundLineElement(), typeof this.options.priority == "number" ? this[Z].style.zIndex = String(this.options.priority) : this[Z].style.removeProperty("z-index"), this;
    }
    const i = n.relativeTo ?? this.altitudeReference;
    if (this.altitudeEngaged && this.altitudeMeters === t && this.altitudeReference === i) return this;
    this.altitudeEngaged = !0, this.altitudeMeters = t, this.altitudeReference = i;
    const a = $.getMap(this);
    return a && ($.registerAltitudeParticipant(this, a), a.triggerRepaint()), this;
  }
  /** Returns the current altitude in meters, or 0 if never set. */
  getAltitude() {
    return this.altitudeMeters;
  }
  /** Returns what {@link getAltitude}'s meters are measured from. Defaults to `"ground"`. */
  getAltitudeReference() {
    return this.altitudeReference;
  }
  /** True from the first {@link setAltitude} call onward. */
  hasActiveAltitude() {
    return this.altitudeEngaged;
  }
  /** Stamps `altitude`/`altitudeReference`/`altitudeEngaged` onto every `dragstart`/`drag`/`dragend` event. */
  fire(t, n) {
    const i = typeof t == "string" ? t : t.type;
    if (i === "dragstart" || i === "drag" || i === "dragend") {
      const a = {
        altitude: this.getAltitude(),
        altitudeReference: this.getAltitudeReference(),
        altitudeEngaged: this.hasActiveAltitude()
      };
      typeof t == "string" ? n = { ...n, ...a } : Object.assign(t, a);
    }
    return super.fire(t, n);
  }
  /**
   * Toggles a dashed line from the marker down (or up) to its ground point.
   * Off by default. See `.maptiler-marker-groundline` in
   * the SDK stylesheet and {@link GroundLineOptions.className}.
   * @param enabled - Whether to show the line.
   * @param options - Optional extra CSS class for styling.
   */
  setGroundLine(t, n = {}) {
    var a;
    if (this.groundLineEnabled = t, this.groundLineOptions = n, !t)
      return (a = this.groundLineEl) == null || a.remove(), this.groundLineEl = null, this;
    this.updateGroundLineElement();
    const i = $.getMap(this);
    return i && this.altitudeMeters !== 0 && i.triggerRepaint(), this;
  }
  /**
   * Per-frame altitude hook, called by {@link MarkerManager} for every altitude-active marker. Returns the elevated point's camera depth (used to rank z-index among altitude-active markers), or `null` when off-screen/behind the camera.
   */
  [mo](t, n) {
    if (!this.altitudeEngaged) return null;
    const i = lu(this.getLngLat(), this.altitudeMeters, t, n, this.altitudeReference);
    return i ? (this.setAltitudeHidden(!1), this.setAltitudeOccluded(i.belowGround), this.altitudeDelta = {
      x: i.elevated.x - i.groundBase.x,
      y: i.elevated.y - i.groundBase.y
    }, this.groundLineOrigin = { x: i.elevated.x, y: i.elevated.y }, this.writeOffset(this.baseOffset), this.updateGroundLineElement(), i.elevated.depth) : (this.altitudeDelta = null, this.groundLineOrigin = null, this.setAltitudeHidden(!0), this.setAltitudeOccluded(!1), this.updateGroundLineElement(), null);
  }
  /** Idempotent toggle for {@link altitudeHidden} — cheap to call every frame regardless of whether the state actually changed. */
  setAltitudeHidden(t) {
    this.altitudeHidden !== t && (this.altitudeHidden = t, Ul(this[Z], t));
  }
  /** Idempotent toggle for {@link altitudeOccluded} — cheap to call every frame regardless of whether the state actually changed. */
  setAltitudeOccluded(t) {
    this.altitudeOccluded !== t && (this.altitudeOccluded = t, Mi(this[Z], t));
  }
  /**
   * Creates/updates/removes the ground-line element. Geometry (position/width/rotation) comes from {@link altitudeDelta}/{@link groundLineOrigin}. Lives in a shared container at the map level ({@link MarkerManager.getGroundLineContainer}), not nested in this marker's own element — otherwise a long line would inherit its marker's camera-depth z-index and could paint over another marker's icon.
   */
  updateGroundLineElement() {
    var s, l;
    if (!this.groundLineEnabled) return;
    if (!this.altitudeDelta || !this.groundLineOrigin || this.altitudeHidden) {
      (s = this.groundLineEl) == null || s.remove(), this.groundLineEl = null;
      return;
    }
    const t = $.getMap(this);
    if (!t) {
      (l = this.groundLineEl) == null || l.remove(), this.groundLineEl = null;
      return;
    }
    if (!this.groundLineEl) {
      const u = document.createElement("div");
      u.className = this.groundLineOptions.className ? `${Ii} ${this.groundLineOptions.className}` : Ii, u.style.position = "absolute", u.style.pointerEvents = "none", $.getGroundLineContainer(t).appendChild(u), this.groundLineEl = u;
    }
    this.groundLineEl.style.left = `${String(this.groundLineOrigin.x)}px`, this.groundLineEl.style.top = `${String(this.groundLineOrigin.y)}px`, Mi(this.groundLineEl, this.altitudeOccluded);
    const { x: n, y: i } = this.altitudeDelta, a = Math.hypot(n, i);
    if (a === 0) {
      this.groundLineEl.style.width = "0px";
      return;
    }
    const o = Math.atan2(-i, -n);
    this.groundLineEl.style.width = `${String(a)}px`, this.groundLineEl.style.transform = `rotate(${String(o)}rad)`;
  }
  //#endregion
  //#region Lifecycle
  /** Removes the marker from the DOM directly, bypassing {@link MarkerManager}. */
  [fr]() {
    this.stopIdleAnimation(), this.cancelAllTransitions(), super.remove();
  }
  /** Removes the marker, playing the configured `exit` animation first (if any) before detaching from the DOM. */
  remove() {
    if (this.suppressLifecycleAnimations)
      return this.detachImmediately(), this;
    this.stopIdleAnimation();
    const t = this.animations.exit;
    return !t || !$.getMap(this) ? (this.detachImmediately(), this) : ($.deregister(this, { deferDetach: !0 }), this.playExitAnimation(t, () => {
      this[fr]();
    }), this);
  }
  /** Deregisters (if registered) and detaches from the DOM immediately — no exit animation. */
  detachImmediately() {
    $.getMap(this) ? $.deregister(this) : this[fr]();
  }
  //#endregion
};
class yh extends C.Popup {
  addTo(e) {
    return super.addTo(e);
  }
}
class gh extends C.Style {
  constructor(e, t = {}) {
    super(e, t);
  }
}
class vh extends C.CanvasSource {
  onAdd(e) {
    super.onAdd(e);
  }
}
class bh extends C.GeoJSONSource {
  onAdd(e) {
    super.onAdd(e);
  }
}
class wh extends C.ImageSource {
  onAdd(e) {
    super.onAdd(e);
  }
}
class Sh extends C.RasterTileSource {
  onAdd(e) {
    super.onAdd(e);
  }
}
class xh extends C.RasterDEMTileSource {
  onAdd(e) {
    super.onAdd(e);
  }
}
class Ch extends C.VectorTileSource {
  onAdd(e) {
    super.onAdd(e);
  }
}
class Ah extends C.VideoSource {
  onAdd(e) {
    super.onAdd(e);
  }
}
class wo extends C.NavigationControl {
  onAdd(e) {
    return super.onAdd(e);
  }
}
class fc extends C.GeolocateControl {
  onAdd(e) {
    return super.onAdd(e);
  }
}
class Lh extends C.AttributionControl {
  onAdd(e) {
    return super.onAdd(e);
  }
}
class dc extends C.LogoControl {
  onAdd(e) {
    return super.onAdd(e);
  }
}
class hc extends C.ScaleControl {
  onAdd(e) {
    return super.onAdd(e);
  }
}
class mc extends C.FullscreenControl {
  onAdd(e) {
    return super.onAdd(e);
  }
}
class Eh extends C.TerrainControl {
  onAdd(e) {
    return super.onAdd(e);
  }
}
class Th extends C.BoxZoomHandler {
  constructor(e, t) {
    super(e, t);
  }
}
class kh extends C.ScrollZoomHandler {
  constructor(e, t) {
    super(e, t);
  }
}
class Ih extends C.CooperativeGesturesHandler {
  constructor(e, t) {
    super(e, t);
  }
}
class Mh extends C.KeyboardHandler {
  constructor(e) {
    super(e);
  }
}
class Ph extends C.TwoFingersTouchPitchHandler {
  constructor(e) {
    super(e);
  }
}
class _h extends C.MapWheelEvent {
  constructor(e, t, n) {
    super(e, t, n);
  }
}
class Oh extends C.MapTouchEvent {
  constructor(e, t, n) {
    super(e, t, n);
  }
}
class Rh extends C.MapMouseEvent {
  constructor(e, t, n, i = {}) {
    super(e, t, n, i);
  }
}
const R = {
  /**
   * Language mode to display labels in both the local language and the language of the visitor's device, concatenated.
   * Note that if those two languages are the same, labels won't be duplicated.
   */
  VISITOR: {
    code: null,
    flag: "visitor",
    name: "Visitor",
    latin: !0,
    isMode: !0,
    geocoding: !1
  },
  /**
   * Language mode to display labels in both the local language and English, concatenated.
   * Note that if those two languages are the same, labels won't be duplicated.
   */
  VISITOR_ENGLISH: {
    code: null,
    flag: "visitor_en",
    name: "Visitor English",
    latin: !0,
    isMode: !0,
    geocoding: !1
  },
  /**
   * Language mode to display labels in a language enforced in the style.
   */
  STYLE: {
    code: null,
    flag: "style",
    name: "Style",
    latin: !1,
    isMode: !0,
    geocoding: !1
  },
  /**
   * Language mode to display labels in a language enforced in the style. The language cannot be further modified.
   */
  STYLE_LOCK: {
    code: null,
    flag: "style_lock",
    name: "Style Lock",
    latin: !1,
    isMode: !0,
    geocoding: !1
  },
  ...xl
};
function Zi() {
  if (typeof navigator > "u") {
    const e = Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0], t = Ci(e);
    return t || R.ENGLISH;
  }
  return Array.from(new Set(navigator.languages.map((e) => e.split("-")[0]))).map((e) => Ci(e)).filter((e) => e)[0] ?? R.LOCAL;
}
const re = {
  maptilerLogoURL: "https://api.maptiler.com/resources/logo.svg",
  maptilerURL: "https://www.maptiler.com/",
  maptilerApiHost: "api.maptiler.com",
  telemetryURL: "https://api.maptiler.com/metrics",
  rtlPluginURL: "https://cdn.maptiler.com/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.min.js",
  primaryLanguage: R.STYLE,
  secondaryLanguage: R.LOCAL,
  terrainSourceURL: "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json",
  terrainSourceId: "maptiler-terrain"
};
Object.freeze(re);
const Or = Bt();
class yc extends Sl {
  constructor() {
    super(...arguments);
    /**
     * The primary language. By default, the language of the web browser is used.
     */
    y(this, "primaryLanguage", re.primaryLanguage);
    /**
     * The secondary language, to overwrite the default language defined in the map style.
     * This settings is highly dependant on the style compatibility and may not work in most cases.
     */
    y(this, "secondaryLanguage");
    /**
     * Setting on whether of not the SDK runs with a session logic.
     * A "session" is started at the initialization of the SDK and finished when the browser
     * page is being closed or refreshed.
     * When `session` is enabled (default: true), the extra URL param `mtsid` is added to queries
     * to the MapTiler Cloud API. This allows MapTiler to enable "session based billing".
     */
    y(this, "session", !0);
    /**
     * Enables client-side caching of requests for tiles and fonts.
     * The cached requests persist multiple browser sessions and will be reused when possible.
     * Works only for requests to the MapTiler Cloud API when sessions are enabled.
     */
    y(this, "caching", !0);
    /**
     * Telemetry is enabled by default but can be opted-out by setting this value to `false`.
     * The telemetry is very valuable to the team at MapTiler because it shares information
     * about where to add the extra effort. It also helps spotting some incompatibility issues
     * that may arise between the SDK and a specific version of a module.
     *
     * It consists in sending metrics about usage of the following features:
     * - SDK version [string]
     * - API key [string]
     * - MapTiler sesion ID (if opted-in) [string]
     * - if tile caching is enabled [boolean]
     * - if language specified at initialization [boolean]
     * - if terrain is activated at initialization [boolean]
     * - if globe projection is activated at initialization [boolean]
     *
     * In addition, each official module will be added to a list, alongside its version number.
     */
    y(this, "telemetry", !0);
    /**
     * Unit to be used
     */
    y(this, "_unit", "metric");
    /**
     * MapTiler Cloud API key
     */
    y(this, "_apiKey", "");
    /**
     * The default number of steps to sample for the experimental flyTo path preloading.
     */
    y(this, "_experimentalDefaultPathSampleSteps", 4);
    y(this, "_experimentalDefaultWorkerCount", 4);
  }
  /**
   * Set the unit system
   */
  set unit(t) {
    this._unit = t, this.emit("unit", t);
  }
  /**
   * Get the unit system
   */
  get unit() {
    return this._unit;
  }
  /**
   * Set the MapTiler Cloud API key
   */
  set apiKey(t) {
    this._apiKey = t, Zr.apiKey = t, this.emit("apiKey", t);
  }
  /**
   * Get the MapTiler Cloud API key
   */
  get apiKey() {
    return this._apiKey;
  }
  /**
   * Set a the custom fetch function to replace the default one
   */
  set fetch(t) {
    Zr.fetch = t;
  }
  /**
   * Get the fetch fucntion
   */
  get fetch() {
    return Zr.fetch;
  }
  get experimental_defaultPathSampleSteps() {
    return this._experimentalDefaultPathSampleSteps;
  }
  set experimental_defaultPathSampleSteps(t) {
    this._experimentalDefaultPathSampleSteps = t, this.emit("experimentalDefaultPathSampleSteps", t);
  }
  get experimental_defaultWorkerCount() {
    return this._experimentalDefaultWorkerCount;
  }
  set experimental_defaultWorkerCount(t) {
    this._experimentalDefaultWorkerCount = t, this.emit("experimentalDefaultWorkerCount", t);
  }
}
const D = new yc();
class Wi extends dc {
  constructor(t = {}) {
    super(t);
    y(this, "logoURL", "");
    y(this, "linkURL", "");
    this.logoURL = t.logoURL ?? re.maptilerLogoURL, this.linkURL = t.linkURL ?? re.maptilerURL;
  }
  onAdd(t) {
    this._map = t, this._compact = this.options.compact ?? !1, this._container = window.document.createElement("div"), this._container.className = "maplibregl-ctrl";
    const n = window.document.createElement("a");
    return n.style.backgroundRepeat = "no-repeat", n.style.cursor = "pointer", n.style.display = "block", n.style.height = "23px", n.style.margin = "0 0 -4px -4px", n.style.overflow = "hidden", n.style.width = "88px", n.style.backgroundImage = `url(${this.logoURL})`, n.style.backgroundSize = "100px 30px", n.style.width = "100px", n.style.height = "30px", n.target = "_blank", n.rel = "noopener", n.href = this.linkURL, n.setAttribute("aria-label", "MapTiler logo"), n.setAttribute("rel", "noopener"), this._container.appendChild(n), this._container.style.display = "block", this._map.on("resize", this._updateCompact), this._updateCompact(), this._container;
  }
}
const Cn = "localcache_source", An = "localcache", gc = "maptiler_sdk", vc = 1e3, bc = 100, Cr = typeof caches < "u", { addProtocol: Yi } = C;
function wc(r, e) {
  if (Cr && D.caching && D.session && r.host === re.maptilerApiHost) {
    if (e === "Source" && r.href.includes("tiles.json"))
      return r.href.replace("https://", `${Cn}://`);
    if (e === "Tile" || e === "Glyphs")
      return r.href.replace("https://", `${An}://`);
  }
  return r.href;
}
function So(r) {
  const e = new URL(r instanceof URL ? r.href : r);
  return e.searchParams.delete("key"), e.searchParams.delete("mtsid"), e.toString();
}
let on;
async function ri() {
  return on || (on = await caches.open(gc)), on;
}
let Xi = 0;
async function Sc() {
  const r = await ri(), e = await r.keys(), t = e.slice(0, Math.max(e.length - vc, 0));
  for (const n of t)
    r.delete(n);
}
async function xc(r, e) {
  const t = new URL(r), n = So(t), i = Cr ? await ri() : null;
  if (i && await i.match(n))
    return;
  const a = new URL(t), o = await fetch(a.toString(), { signal: e });
  if (i && o.ok)
    try {
      await i.put(n, o);
    } catch {
    }
}
function Cc() {
  Yi(
    Cn,
    async (r, e) => {
      if (!r.url) throw new Error("");
      r.url = r.url.replace(`${Cn}://`, "https://");
      const t = r;
      t.signal = e.signal;
      const n = await fetch(r.url, t), i = await n.json();
      return i.tiles && i.tiles.length > 0 && (i.tiles[0] = `${i.tiles[0]}&last-modified=${n.headers.get("Last-Modified") ?? ""}`), {
        data: i,
        cacheControl: n.headers.get("Cache-Control"),
        expires: n.headers.get("Expires")
      };
    }
  ), Yi(An, async (r, e) => {
    if (!r.url) throw new Error("");
    r.url = r.url.replace(`${An}://`, "https://");
    const t = new URL(r.url), n = So(t), i = new URL(t);
    i.searchParams.delete("last-modified");
    const a = i.toString(), o = async (p) => ({
      data: await p.arrayBuffer(),
      cacheControl: p.headers.get("Cache-Control"),
      expires: p.headers.get("Expires")
    }), s = await ri(), l = await s.match(n);
    if (l)
      return await o(l);
    const u = r;
    u.signal = e.signal;
    const c = await fetch(a, u);
    return c.status >= 200 && c.status < 300 && (s.put(n, c.clone()).catch(() => {
    }), ++Xi > bc && (Sc(), Xi = 0)), o(c);
  });
}
async function Ac(r) {
  if (typeof window > "u") return;
  const e = C.getRTLTextPluginStatus();
  if (e === "unavailable" || e === "requested")
    try {
      await C.setRTLTextPlugin(r ?? re.rtlPluginURL, !0);
    } catch (t) {
      console.error("Error enabling RTL plugin. It is enabled by default and cannot be unset after. Are you attempting to enable it twice?", t);
    }
}
function Lc(r, e) {
  for (const t of r)
    typeof e[t] == "function" && (e[t] = e[t].bind(e));
}
function Ji(r, e) {
  let t = null;
  try {
    t = new URL(r);
  } catch {
    return {
      url: r
    };
  }
  return t.host === re.maptilerApiHost && (t.searchParams.has("key") || t.searchParams.append("key", D.apiKey), D.session && t.searchParams.append("mtsid", Or)), {
    url: wc(t, e)
  };
}
function Qi(r) {
  return async (e, t) => {
    if (r != null) {
      const n = await r(e, t), i = Ji((n == null ? void 0 : n.url) ?? "", t);
      return {
        ...n,
        ...i
      };
    }
    return Ji(e, t);
  };
}
function xo() {
  return Math.random().toString(36).substring(2);
}
function Rr(r) {
  return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(r);
}
function Ec(r) {
  try {
    return JSON.parse(r);
  } catch {
  }
  return null;
}
function Tc() {
  return document.createElement("canvas").getContext("webgl2") ? null : typeof WebGL2RenderingContext < "u" ? "Graphic rendering with WebGL2 has been disabled or is not supported by your graphic card. The map cannot be displayed." : "Your browser does not support graphic rendering with WebGL2. The map cannot be displayed.";
}
function kc(r) {
  const e = Tc();
  if (!e) return;
  let t = null;
  if (typeof r == "string" ? t = document.getElementById(r) : r instanceof HTMLElement && (t = r), !t)
    throw new Error("The Map container must be provided.");
  const n = document.createElement("div");
  throw n.innerHTML = e, n.classList.add("webgl-warning-div"), t.appendChild(n), new Error(e);
}
function Fh(r) {
  const e = "The WebGL context was lost.", t = r.getContainer(), n = document.createElement("div");
  n.innerHTML = e, n.classList.add("webgl-warning-div"), t.appendChild(n);
}
function Ic(r, e) {
  const t = e ? /\{name:\S+\}/ : /\{name\}/;
  return {
    contains: t.test(r),
    exactMatch: new RegExp(`^${t.source}$`).test(r)
  };
}
function Mc(r, e, t) {
  const n = t ? /\{name:\S+\}/ : /\{name\}/, i = r.split(n);
  return ["concat", ...i.flatMap((s, l) => {
    const u = Pc(s);
    return l === i.length - 1 ? [u] : [u, e];
  })];
}
function Pc(r) {
  return typeof r != "string" || !r.includes("{ele}") ? r : [
    "case",
    // if the value contains {ele}
    ["has", "ele"],
    // then concat the expression with the elevation and the unit and "m"
    [
      "concat",
      [
        // if the value contains {name} add a new line otherwise use an empty string
        "case",
        ["has", "name"],
        `
`,
        ""
      ],
      ["get", "ele"],
      " m"
    ],
    // if the value does not contain {ele} use an empty string
    ""
  ];
}
function _c(r) {
  var n;
  const e = /\{name(?::(?<language>\S+))?\}/g, t = [];
  for (; ; ) {
    const i = e.exec(r);
    if (!i) break;
    const a = ((n = i.groups) == null ? void 0 : n.language) ?? null;
    t.push(a);
  }
  return t;
}
function Oc(r) {
  return !Array.isArray(r) || r.length !== 2 || r[0] !== "get" || typeof r[1] != "string" ? null : r[1].trim() === "name" ? {
    isLanguage: !0,
    localization: null
  } : r[1].trim().startsWith("name:") ? {
    isLanguage: !0,
    localization: r[1].trim().split(":").pop()
  } : null;
}
function Rc(r) {
  const e = [], t = structuredClone(r), n = (i) => {
    if (typeof i != "string")
      for (let a = 0; a < i.length; a += 1) {
        const o = Oc(i[a]);
        o ? e.push(o.localization) : n(i[a]);
      }
  };
  return n([t]), e;
}
function Fc(r, e) {
  const t = [];
  for (const a of r) {
    if (a.type !== "symbol")
      continue;
    const o = a, { id: s, layout: l } = o;
    if (!l || !("text-field" in l))
      continue;
    const u = e.getLayoutProperty(s, "text-field");
    if (u)
      if (typeof u == "string") {
        const c = _c(u);
        t.push(c);
      } else {
        const c = Rc(u);
        t.push(c);
      }
  }
  const n = t.flat(), i = {
    unlocalized: 0,
    localized: {}
  };
  for (const a of n)
    a === null ? i.unlocalized += 1 : (a in i.localized || (i.localized[a] = 0), i.localized[a] += 1);
  return i;
}
var zc = [
  "layout_fill",
  "layout_line",
  "layout_circle",
  "layout_heatmap",
  "layout_fill-extrusion",
  "layout_symbol",
  "layout_raster",
  "layout_hillshade",
  "layout_color-relief",
  "layout_background"
], Dc = [
  "paint_fill",
  "paint_line",
  "paint_circle",
  "paint_heatmap",
  "paint_fill-extrusion",
  "paint_symbol",
  "paint_raster",
  "paint_hillshade",
  "paint_color-relief",
  "paint_background"
], Nc = {
  $version: 8,
  $root: {
    version: {
      required: !0,
      type: "enum",
      values: [8]
    },
    name: { type: "string" },
    metadata: { type: "*" },
    center: {
      type: "array",
      value: "number",
      length: 2
    },
    centerAltitude: { type: "number" },
    zoom: { type: "number" },
    bearing: {
      type: "number",
      default: 0,
      period: 360,
      units: "degrees"
    },
    pitch: {
      type: "number",
      default: 0,
      units: "degrees"
    },
    roll: {
      type: "number",
      default: 0,
      units: "degrees"
    },
    state: {
      type: "state",
      default: {}
    },
    light: { type: "light" },
    sky: { type: "sky" },
    projection: { type: "projection" },
    terrain: { type: "terrain" },
    sources: {
      required: !0,
      type: "sources"
    },
    sprite: { type: "sprite" },
    glyphs: { type: "string" },
    "font-faces": { type: "fontFaces" },
    transition: { type: "transition" },
    layers: {
      required: !0,
      type: "array",
      value: "layer"
    }
  },
  sources: { "*": { type: "source" } },
  source: [
    "source_vector",
    "source_raster",
    "source_raster_dem",
    "source_geojson",
    "source_video",
    "source_image"
  ],
  source_vector: {
    type: {
      required: !0,
      type: "enum",
      values: { vector: {} }
    },
    url: { type: "string" },
    tiles: {
      type: "array",
      value: "string"
    },
    bounds: {
      type: "array",
      value: "number",
      length: 4,
      default: [
        -180,
        -85.051129,
        180,
        85.051129
      ]
    },
    scheme: {
      type: "enum",
      values: {
        xyz: {},
        tms: {}
      },
      default: "xyz"
    },
    minzoom: {
      type: "number",
      default: 0
    },
    maxzoom: {
      type: "number",
      default: 22
    },
    attribution: { type: "string" },
    promoteId: { type: "promoteId" },
    volatile: {
      type: "boolean",
      default: !1
    },
    encoding: {
      type: "enum",
      values: {
        mvt: {},
        mlt: {}
      },
      default: "mvt"
    },
    "*": { type: "*" }
  },
  source_raster: {
    type: {
      required: !0,
      type: "enum",
      values: { raster: {} }
    },
    url: { type: "string" },
    tiles: {
      type: "array",
      value: "string"
    },
    bounds: {
      type: "array",
      value: "number",
      length: 4,
      default: [
        -180,
        -85.051129,
        180,
        85.051129
      ]
    },
    minzoom: {
      type: "number",
      default: 0
    },
    maxzoom: {
      type: "number",
      default: 22
    },
    tileSize: {
      type: "number",
      default: 512,
      units: "pixels"
    },
    scheme: {
      type: "enum",
      values: {
        xyz: {},
        tms: {}
      },
      default: "xyz"
    },
    attribution: { type: "string" },
    volatile: {
      type: "boolean",
      default: !1
    },
    "*": { type: "*" }
  },
  source_raster_dem: {
    type: {
      required: !0,
      type: "enum",
      values: { "raster-dem": {} }
    },
    url: { type: "string" },
    tiles: {
      type: "array",
      value: "string"
    },
    bounds: {
      type: "array",
      value: "number",
      length: 4,
      default: [
        -180,
        -85.051129,
        180,
        85.051129
      ]
    },
    minzoom: {
      type: "number",
      default: 0
    },
    maxzoom: {
      type: "number",
      default: 22
    },
    tileSize: {
      type: "number",
      default: 512,
      units: "pixels"
    },
    attribution: { type: "string" },
    encoding: {
      type: "enum",
      values: {
        terrarium: {},
        mapbox: {},
        custom: {}
      },
      default: "mapbox"
    },
    redFactor: {
      type: "number",
      default: 1
    },
    blueFactor: {
      type: "number",
      default: 1
    },
    greenFactor: {
      type: "number",
      default: 1
    },
    baseShift: {
      type: "number",
      default: 0
    },
    volatile: {
      type: "boolean",
      default: !1
    },
    "*": { type: "*" }
  },
  source_geojson: {
    type: {
      required: !0,
      type: "enum",
      values: { geojson: {} }
    },
    data: {
      required: !0,
      type: "*"
    },
    maxzoom: {
      type: "number",
      default: 18
    },
    attribution: { type: "string" },
    buffer: {
      type: "number",
      default: 128,
      maximum: 512,
      minimum: 0
    },
    filter: { type: "filter" },
    tolerance: {
      type: "number",
      default: 0.375
    },
    cluster: {
      type: "boolean",
      default: !1
    },
    clusterRadius: {
      type: "number",
      default: 50,
      minimum: 0
    },
    clusterMaxZoom: { type: "number" },
    clusterMinPoints: { type: "number" },
    clusterProperties: { type: "*" },
    lineMetrics: {
      type: "boolean",
      default: !1
    },
    generateId: {
      type: "boolean",
      default: !1
    },
    promoteId: { type: "promoteId" }
  },
  source_video: {
    type: {
      required: !0,
      type: "enum",
      values: { video: {} }
    },
    urls: {
      required: !0,
      type: "array",
      value: "string"
    },
    coordinates: {
      required: !0,
      type: "array",
      length: 4,
      value: {
        type: "array",
        length: 2,
        value: "number"
      }
    }
  },
  source_image: {
    type: {
      required: !0,
      type: "enum",
      values: { image: {} }
    },
    url: {
      required: !0,
      type: "string"
    },
    coordinates: {
      required: !0,
      type: "array",
      length: 4,
      value: {
        type: "array",
        length: 2,
        value: "number"
      }
    }
  },
  layer: {
    id: {
      type: "string",
      required: !0
    },
    type: {
      type: "enum",
      values: {
        fill: {},
        line: {},
        symbol: {},
        circle: {},
        heatmap: {},
        "fill-extrusion": {},
        raster: {},
        hillshade: {},
        "color-relief": {},
        background: {}
      },
      required: !0
    },
    metadata: { type: "*" },
    source: { type: "string" },
    "source-layer": { type: "string" },
    minzoom: {
      type: "number",
      minimum: 0,
      maximum: 24
    },
    maxzoom: {
      type: "number",
      minimum: 0,
      maximum: 24
    },
    filter: { type: "filter" },
    layout: { type: "layout" },
    paint: { type: "paint" }
  },
  layout: zc,
  layout_background: { visibility: {
    type: "enum",
    values: {
      visible: {},
      none: {}
    },
    default: "visible",
    expression: {
      interpolated: !1,
      parameters: ["global-state"]
    },
    "property-type": "data-constant"
  } },
  layout_fill: {
    "fill-sort-key": {
      type: "number",
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    visibility: {
      type: "enum",
      values: {
        visible: {},
        none: {}
      },
      default: "visible",
      expression: {
        interpolated: !1,
        parameters: ["global-state"]
      },
      "property-type": "data-constant"
    }
  },
  layout_circle: {
    "circle-sort-key": {
      type: "number",
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    visibility: {
      type: "enum",
      values: {
        visible: {},
        none: {}
      },
      default: "visible",
      expression: {
        interpolated: !1,
        parameters: ["global-state"]
      },
      "property-type": "data-constant"
    }
  },
  layout_heatmap: { visibility: {
    type: "enum",
    values: {
      visible: {},
      none: {}
    },
    default: "visible",
    expression: {
      interpolated: !1,
      parameters: ["global-state"]
    },
    "property-type": "data-constant"
  } },
  "layout_fill-extrusion": { visibility: {
    type: "enum",
    values: {
      visible: {},
      none: {}
    },
    default: "visible",
    expression: {
      interpolated: !1,
      parameters: ["global-state"]
    },
    "property-type": "data-constant"
  } },
  layout_line: {
    "line-cap": {
      type: "enum",
      values: {
        butt: {},
        round: {},
        square: {}
      },
      default: "butt",
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "line-join": {
      type: "enum",
      values: {
        bevel: {},
        round: {},
        miter: {}
      },
      default: "miter",
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "line-miter-limit": {
      type: "number",
      default: 2,
      requires: [{ "line-join": "miter" }],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "line-round-limit": {
      type: "number",
      default: 1.05,
      requires: [{ "line-join": "round" }],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "line-sort-key": {
      type: "number",
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    visibility: {
      type: "enum",
      values: {
        visible: {},
        none: {}
      },
      default: "visible",
      expression: {
        interpolated: !1,
        parameters: ["global-state"]
      },
      "property-type": "data-constant"
    }
  },
  layout_symbol: {
    "symbol-placement": {
      type: "enum",
      values: {
        point: {},
        line: {},
        "line-center": {}
      },
      default: "point",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "symbol-spacing": {
      type: "number",
      default: 250,
      minimum: 1,
      units: "pixels",
      requires: [{ "symbol-placement": "line" }],
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "symbol-avoid-edges": {
      type: "boolean",
      default: !1,
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "symbol-sort-key": {
      type: "number",
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "symbol-z-order": {
      type: "enum",
      values: {
        auto: {},
        "viewport-y": {},
        source: {}
      },
      default: "auto",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-allow-overlap": {
      type: "boolean",
      default: !1,
      requires: ["icon-image", { "!": "icon-overlap" }],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-overlap": {
      type: "enum",
      values: {
        never: {},
        always: {},
        cooperative: {}
      },
      requires: ["icon-image"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-ignore-placement": {
      type: "boolean",
      default: !1,
      requires: ["icon-image"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-optional": {
      type: "boolean",
      default: !1,
      requires: ["icon-image", "text-field"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-rotation-alignment": {
      type: "enum",
      values: {
        map: {},
        viewport: {},
        auto: {}
      },
      default: "auto",
      requires: ["icon-image"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-size": {
      type: "number",
      default: 1,
      minimum: 0,
      units: "factor of the original icon size",
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "icon-text-fit": {
      type: "enum",
      values: {
        none: {},
        width: {},
        height: {},
        both: {}
      },
      default: "none",
      requires: ["icon-image", "text-field"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-text-fit-padding": {
      type: "array",
      value: "number",
      length: 4,
      default: [
        0,
        0,
        0,
        0
      ],
      units: "pixels",
      requires: [
        "icon-image",
        "text-field",
        { "icon-text-fit": [
          "both",
          "width",
          "height"
        ] }
      ],
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-image": {
      type: "resolvedImage",
      tokens: !0,
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "icon-rotate": {
      type: "number",
      default: 0,
      period: 360,
      units: "degrees",
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "icon-padding": {
      type: "padding",
      default: [2],
      units: "pixels",
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "icon-keep-upright": {
      type: "boolean",
      default: !1,
      requires: [
        "icon-image",
        { "icon-rotation-alignment": "map" },
        { "symbol-placement": ["line", "line-center"] }
      ],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-offset": {
      type: "array",
      value: "number",
      length: 2,
      default: [0, 0],
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "icon-anchor": {
      type: "enum",
      values: {
        center: {},
        left: {},
        right: {},
        top: {},
        bottom: {},
        "top-left": {},
        "top-right": {},
        "bottom-left": {},
        "bottom-right": {}
      },
      default: "center",
      requires: ["icon-image"],
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "icon-pitch-alignment": {
      type: "enum",
      values: {
        map: {},
        viewport: {},
        auto: {}
      },
      default: "auto",
      requires: ["icon-image"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-pitch-alignment": {
      type: "enum",
      values: {
        map: {},
        viewport: {},
        auto: {}
      },
      default: "auto",
      requires: ["text-field"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-rotation-alignment": {
      type: "enum",
      values: {
        map: {},
        viewport: {},
        "viewport-glyph": {},
        auto: {}
      },
      default: "auto",
      requires: ["text-field"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-field": {
      type: "formatted",
      default: "",
      tokens: !0,
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-font": {
      type: "array",
      value: "string",
      default: ["Open Sans Regular", "Arial Unicode MS Regular"],
      requires: ["text-field"],
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-size": {
      type: "number",
      default: 16,
      minimum: 0,
      units: "pixels",
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-max-width": {
      type: "number",
      default: 10,
      minimum: 0,
      units: "ems",
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-line-height": {
      type: "number",
      default: 1.2,
      units: "ems",
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-letter-spacing": {
      type: "number",
      default: 0,
      units: "ems",
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-justify": {
      type: "enum",
      values: {
        auto: {},
        left: {},
        center: {},
        right: {}
      },
      default: "center",
      requires: ["text-field"],
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-radial-offset": {
      type: "number",
      units: "ems",
      default: 0,
      requires: ["text-field"],
      "property-type": "data-driven",
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      }
    },
    "text-variable-anchor": {
      type: "array",
      value: "enum",
      values: {
        center: {},
        left: {},
        right: {},
        top: {},
        bottom: {},
        "top-left": {},
        "top-right": {},
        "bottom-left": {},
        "bottom-right": {}
      },
      requires: ["text-field", { "symbol-placement": ["point"] }],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-variable-anchor-offset": {
      type: "variableAnchorOffsetCollection",
      requires: ["text-field", { "symbol-placement": ["point"] }],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-anchor": {
      type: "enum",
      values: {
        center: {},
        left: {},
        right: {},
        top: {},
        bottom: {},
        "top-left": {},
        "top-right": {},
        "bottom-left": {},
        "bottom-right": {}
      },
      default: "center",
      requires: ["text-field", { "!": "text-variable-anchor" }],
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-max-angle": {
      type: "number",
      default: 45,
      units: "degrees",
      requires: ["text-field", { "symbol-placement": ["line", "line-center"] }],
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-writing-mode": {
      type: "array",
      value: "enum",
      values: {
        horizontal: {},
        vertical: {}
      },
      requires: ["text-field", { "symbol-placement": ["point"] }],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-rotate": {
      type: "number",
      default: 0,
      period: 360,
      units: "degrees",
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-padding": {
      type: "number",
      default: 2,
      minimum: 0,
      units: "pixels",
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-keep-upright": {
      type: "boolean",
      default: !0,
      requires: [
        "text-field",
        { "text-rotation-alignment": "map" },
        { "symbol-placement": ["line", "line-center"] }
      ],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-transform": {
      type: "enum",
      values: {
        none: {},
        uppercase: {},
        lowercase: {}
      },
      default: "none",
      requires: ["text-field"],
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-offset": {
      type: "array",
      value: "number",
      units: "ems",
      length: 2,
      default: [0, 0],
      requires: ["text-field", { "!": "text-radial-offset" }],
      expression: {
        interpolated: !0,
        parameters: ["zoom", "feature"]
      },
      "property-type": "data-driven"
    },
    "text-allow-overlap": {
      type: "boolean",
      default: !1,
      requires: ["text-field", { "!": "text-overlap" }],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-overlap": {
      type: "enum",
      values: {
        never: {},
        always: {},
        cooperative: {}
      },
      requires: ["text-field"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-ignore-placement": {
      type: "boolean",
      default: !1,
      requires: ["text-field"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-optional": {
      type: "boolean",
      default: !1,
      requires: ["text-field", "icon-image"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    visibility: {
      type: "enum",
      values: {
        visible: {},
        none: {}
      },
      default: "visible",
      expression: {
        interpolated: !1,
        parameters: ["global-state"]
      },
      "property-type": "data-constant"
    }
  },
  layout_raster: { visibility: {
    type: "enum",
    values: {
      visible: {},
      none: {}
    },
    default: "visible",
    expression: {
      interpolated: !1,
      parameters: ["global-state"]
    },
    "property-type": "data-constant"
  } },
  layout_hillshade: { visibility: {
    type: "enum",
    values: {
      visible: {},
      none: {}
    },
    default: "visible",
    expression: {
      interpolated: !1,
      parameters: ["global-state"]
    },
    "property-type": "data-constant"
  } },
  "layout_color-relief": { visibility: {
    type: "enum",
    values: {
      visible: {},
      none: {}
    },
    default: "visible",
    expression: {
      interpolated: !1,
      parameters: ["global-state"]
    },
    "property-type": "data-constant"
  } },
  filter: {
    type: "boolean",
    expression: {
      interpolated: !1,
      parameters: ["zoom", "feature"]
    },
    "property-type": "data-driven"
  },
  filter_operator: {
    type: "enum",
    values: {
      "==": {},
      "!=": {},
      ">": {},
      ">=": {},
      "<": {},
      "<=": {},
      in: {},
      "!in": {},
      all: {},
      any: {},
      none: {},
      has: {},
      "!has": {}
    }
  },
  geometry_type: {
    type: "enum",
    values: {
      Point: {},
      LineString: {},
      Polygon: {}
    }
  },
  function: {
    expression: { type: "expression" },
    stops: {
      type: "array",
      value: "function_stop"
    },
    base: {
      type: "number",
      default: 1,
      minimum: 0
    },
    property: {
      type: "string",
      default: "$zoom"
    },
    type: {
      type: "enum",
      values: {
        identity: {},
        exponential: {},
        interval: {},
        categorical: {}
      },
      default: "exponential"
    },
    colorSpace: {
      type: "enum",
      values: {
        rgb: {},
        lab: {},
        hcl: {}
      },
      default: "rgb"
    },
    default: {
      type: "*",
      required: !1
    }
  },
  function_stop: {
    type: "array",
    minimum: 0,
    maximum: 24,
    value: ["number", "color"],
    length: 2
  },
  expression: {
    type: "array",
    value: "expression_name",
    minimum: 1
  },
  light: {
    anchor: {
      type: "enum",
      default: "viewport",
      values: {
        map: {},
        viewport: {}
      },
      "property-type": "data-constant",
      transition: !1,
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      }
    },
    position: {
      type: "array",
      default: [
        1.15,
        210,
        30
      ],
      length: 3,
      value: "number",
      "property-type": "data-constant",
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      }
    },
    color: {
      type: "color",
      "property-type": "data-constant",
      default: "#ffffff",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      transition: !0
    },
    intensity: {
      type: "number",
      "property-type": "data-constant",
      default: 0.5,
      minimum: 0,
      maximum: 1,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      transition: !0
    }
  },
  sky: {
    "sky-color": {
      type: "color",
      "property-type": "data-constant",
      default: "#88C6FC",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      transition: !0
    },
    "horizon-color": {
      type: "color",
      "property-type": "data-constant",
      default: "#ffffff",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      transition: !0
    },
    "fog-color": {
      type: "color",
      "property-type": "data-constant",
      default: "#ffffff",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      transition: !0
    },
    "fog-ground-blend": {
      type: "number",
      "property-type": "data-constant",
      default: 0.5,
      minimum: 0,
      maximum: 1,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      transition: !0
    },
    "horizon-fog-blend": {
      type: "number",
      "property-type": "data-constant",
      default: 0.8,
      minimum: 0,
      maximum: 1,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      transition: !0
    },
    "sky-horizon-blend": {
      type: "number",
      "property-type": "data-constant",
      default: 0.8,
      minimum: 0,
      maximum: 1,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      transition: !0
    },
    "atmosphere-blend": {
      type: "number",
      "property-type": "data-constant",
      default: 0.8,
      minimum: 0,
      maximum: 1,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      transition: !0
    }
  },
  terrain: {
    source: {
      type: "string",
      required: !0
    },
    exaggeration: {
      type: "number",
      minimum: 0,
      default: 1
    }
  },
  projection: { type: {
    type: "projectionDefinition",
    default: "mercator",
    "property-type": "data-constant",
    transition: !1,
    expression: {
      interpolated: !0,
      parameters: ["zoom"]
    }
  } },
  paint: Dc,
  paint_fill: {
    "fill-antialias": {
      type: "boolean",
      default: !0,
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "fill-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "fill-layer-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "fill-color": {
      type: "color",
      default: "#000000",
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "fill-outline-color": {
      type: "color",
      transition: !0,
      requires: [{ "!": "fill-pattern" }, { "fill-antialias": !0 }],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "fill-translate": {
      type: "array",
      value: "number",
      length: 2,
      default: [0, 0],
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "fill-translate-anchor": {
      type: "enum",
      values: {
        map: {},
        viewport: {}
      },
      default: "map",
      requires: ["fill-translate"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "fill-pattern": {
      type: "resolvedImage",
      transition: !0,
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "cross-faded-data-driven"
    }
  },
  "paint_fill-extrusion": {
    "fill-extrusion-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "fill-extrusion-color": {
      type: "color",
      default: "#000000",
      transition: !0,
      requires: [{ "!": "fill-extrusion-pattern" }],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "fill-extrusion-translate": {
      type: "array",
      value: "number",
      length: 2,
      default: [0, 0],
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "fill-extrusion-translate-anchor": {
      type: "enum",
      values: {
        map: {},
        viewport: {}
      },
      default: "map",
      requires: ["fill-extrusion-translate"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "fill-extrusion-pattern": {
      type: "resolvedImage",
      transition: !0,
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "cross-faded-data-driven"
    },
    "fill-extrusion-height": {
      type: "number",
      default: 0,
      minimum: 0,
      units: "meters",
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "fill-extrusion-base": {
      type: "number",
      default: 0,
      minimum: 0,
      units: "meters",
      transition: !0,
      requires: ["fill-extrusion-height"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "fill-extrusion-vertical-gradient": {
      type: "boolean",
      default: !0,
      transition: !1,
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    }
  },
  paint_line: {
    "line-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "line-layer-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "line-color": {
      type: "color",
      default: "#000000",
      transition: !0,
      requires: [{ "!": "line-pattern" }],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "line-translate": {
      type: "array",
      value: "number",
      length: 2,
      default: [0, 0],
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "line-translate-anchor": {
      type: "enum",
      values: {
        map: {},
        viewport: {}
      },
      default: "map",
      requires: ["line-translate"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "line-width": {
      type: "number",
      default: 1,
      minimum: 0,
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "line-gap-width": {
      type: "number",
      default: 0,
      minimum: 0,
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "line-offset": {
      type: "number",
      default: 0,
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "line-blur": {
      type: "number",
      default: 0,
      minimum: 0,
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "line-dasharray": {
      type: "array",
      value: "number",
      minimum: 0,
      transition: !0,
      units: "line widths",
      requires: [{ "!": "line-pattern" }],
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "cross-faded-data-driven"
    },
    "line-pattern": {
      type: "resolvedImage",
      transition: !0,
      expression: {
        interpolated: !1,
        parameters: ["zoom", "feature"]
      },
      "property-type": "cross-faded-data-driven"
    },
    "line-gradient": {
      type: "color",
      transition: !1,
      requires: [
        { "!": "line-dasharray" },
        { "!": "line-pattern" },
        {
          source: "geojson",
          has: { lineMetrics: !0 }
        }
      ],
      expression: {
        interpolated: !0,
        parameters: ["line-progress"]
      },
      "property-type": "color-ramp"
    }
  },
  paint_circle: {
    "circle-radius": {
      type: "number",
      default: 5,
      minimum: 0,
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "circle-color": {
      type: "color",
      default: "#000000",
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "circle-blur": {
      type: "number",
      default: 0,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "circle-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "circle-translate": {
      type: "array",
      value: "number",
      length: 2,
      default: [0, 0],
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "circle-translate-anchor": {
      type: "enum",
      values: {
        map: {},
        viewport: {}
      },
      default: "map",
      requires: ["circle-translate"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "circle-pitch-scale": {
      type: "enum",
      values: {
        map: {},
        viewport: {}
      },
      default: "map",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "circle-pitch-alignment": {
      type: "enum",
      values: {
        map: {},
        viewport: {}
      },
      default: "viewport",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "circle-stroke-width": {
      type: "number",
      default: 0,
      minimum: 0,
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "circle-stroke-color": {
      type: "color",
      default: "#000000",
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "circle-stroke-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    }
  },
  paint_heatmap: {
    "heatmap-radius": {
      type: "number",
      default: 30,
      minimum: 1,
      transition: !0,
      units: "pixels",
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "heatmap-weight": {
      type: "number",
      default: 1,
      minimum: 0,
      transition: !1,
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "heatmap-intensity": {
      type: "number",
      default: 1,
      minimum: 0,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "heatmap-color": {
      type: "color",
      default: [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0, 0, 255, 0)",
        0.1,
        "royalblue",
        0.3,
        "cyan",
        0.5,
        "lime",
        0.7,
        "yellow",
        1,
        "red"
      ],
      transition: !1,
      expression: {
        interpolated: !0,
        parameters: ["heatmap-density"]
      },
      "property-type": "color-ramp"
    },
    "heatmap-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    }
  },
  paint_symbol: {
    "icon-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "icon-color": {
      type: "color",
      default: "#000000",
      transition: !0,
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "icon-halo-color": {
      type: "color",
      default: "rgba(0, 0, 0, 0)",
      transition: !0,
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "icon-halo-width": {
      type: "number",
      default: 0,
      minimum: 0,
      transition: !0,
      units: "pixels",
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "icon-halo-blur": {
      type: "number",
      default: 0,
      minimum: 0,
      transition: !0,
      units: "pixels",
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "icon-translate": {
      type: "array",
      value: "number",
      length: 2,
      default: [0, 0],
      transition: !0,
      units: "pixels",
      requires: ["icon-image"],
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "icon-translate-anchor": {
      type: "enum",
      values: {
        map: {},
        viewport: {}
      },
      default: "map",
      requires: ["icon-image", "icon-translate"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "text-color": {
      type: "color",
      default: "#000000",
      transition: !0,
      overridable: !0,
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "text-halo-color": {
      type: "color",
      default: "rgba(0, 0, 0, 0)",
      transition: !0,
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "text-halo-width": {
      type: "number",
      default: 0,
      minimum: 0,
      transition: !0,
      units: "pixels",
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "text-halo-blur": {
      type: "number",
      default: 0,
      minimum: 0,
      transition: !0,
      units: "pixels",
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: [
          "zoom",
          "feature",
          "feature-state"
        ]
      },
      "property-type": "data-driven"
    },
    "text-translate": {
      type: "array",
      value: "number",
      length: 2,
      default: [0, 0],
      transition: !0,
      units: "pixels",
      requires: ["text-field"],
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "text-translate-anchor": {
      type: "enum",
      values: {
        map: {},
        viewport: {}
      },
      default: "map",
      requires: ["text-field", "text-translate"],
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    }
  },
  paint_raster: {
    "raster-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "raster-hue-rotate": {
      type: "number",
      default: 0,
      period: 360,
      transition: !0,
      units: "degrees",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "raster-brightness-min": {
      type: "number",
      default: 0,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "raster-brightness-max": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "raster-saturation": {
      type: "number",
      default: 0,
      minimum: -1,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "raster-contrast": {
      type: "number",
      default: 0,
      minimum: -1,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    resampling: {
      type: "enum",
      values: {
        linear: {},
        nearest: {}
      },
      default: "linear",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "raster-resampling": {
      type: "enum",
      values: {
        linear: {},
        nearest: {}
      },
      default: "linear",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "raster-fade-duration": {
      type: "number",
      default: 300,
      minimum: 0,
      transition: !1,
      units: "milliseconds",
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    }
  },
  paint_hillshade: {
    "hillshade-illumination-direction": {
      type: "numberArray",
      default: 335,
      minimum: 0,
      maximum: 359,
      transition: !1,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "hillshade-illumination-altitude": {
      type: "numberArray",
      default: 45,
      minimum: 0,
      maximum: 90,
      transition: !1,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "hillshade-illumination-anchor": {
      type: "enum",
      values: {
        map: {},
        viewport: {}
      },
      default: "viewport",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "hillshade-exaggeration": {
      type: "number",
      default: 0.5,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "hillshade-shadow-color": {
      type: "colorArray",
      default: "#000000",
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "hillshade-highlight-color": {
      type: "colorArray",
      default: "#FFFFFF",
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "hillshade-accent-color": {
      type: "color",
      default: "#000000",
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "hillshade-method": {
      type: "enum",
      values: {
        standard: {},
        basic: {},
        combined: {},
        igor: {},
        multidirectional: {}
      },
      default: "standard",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    resampling: {
      type: "enum",
      values: {
        linear: {},
        nearest: {}
      },
      default: "linear",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    }
  },
  "paint_color-relief": {
    "color-relief-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "color-relief-color": {
      type: "color",
      transition: !1,
      expression: {
        interpolated: !0,
        parameters: ["elevation"]
      },
      "property-type": "color-ramp"
    },
    resampling: {
      type: "enum",
      values: {
        linear: {},
        nearest: {}
      },
      default: "linear",
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    }
  },
  paint_background: {
    "background-color": {
      type: "color",
      default: "#000000",
      transition: !0,
      requires: [{ "!": "background-pattern" }],
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    },
    "background-pattern": {
      type: "resolvedImage",
      transition: !0,
      expression: {
        interpolated: !1,
        parameters: ["zoom"]
      },
      "property-type": "cross-faded"
    },
    "background-opacity": {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1,
      transition: !0,
      expression: {
        interpolated: !0,
        parameters: ["zoom"]
      },
      "property-type": "data-constant"
    }
  },
  transition: {
    duration: {
      type: "number",
      default: 300,
      minimum: 0,
      units: "milliseconds"
    },
    delay: {
      type: "number",
      default: 0,
      minimum: 0,
      units: "milliseconds"
    }
  },
  "property-type": {
    "data-driven": { type: "property-type" },
    "cross-faded": { type: "property-type" },
    "cross-faded-data-driven": { type: "property-type" },
    "color-ramp": { type: "property-type" },
    "data-constant": { type: "property-type" },
    constant: { type: "property-type" }
  },
  promoteId: { "*": { type: "string" } },
  interpolation: {
    type: "array",
    value: "interpolation_name",
    minimum: 1
  },
  interpolation_name: {
    type: "enum",
    values: {
      linear: { syntax: {
        overloads: [{
          parameters: [],
          "output-type": "interpolation"
        }],
        parameters: []
      } },
      exponential: { syntax: {
        overloads: [{
          parameters: ["base"],
          "output-type": "interpolation"
        }],
        parameters: [{
          name: "base",
          type: "number literal"
        }]
      } },
      "cubic-bezier": { syntax: {
        overloads: [{
          parameters: [
            "x1",
            "y1",
            "x2",
            "y2"
          ],
          "output-type": "interpolation"
        }],
        parameters: [
          {
            name: "x1",
            type: "number literal"
          },
          {
            name: "y1",
            type: "number literal"
          },
          {
            name: "x2",
            type: "number literal"
          },
          {
            name: "y2",
            type: "number literal"
          }
        ]
      } }
    }
  }
}, w = class {
  constructor(r, e, t, n) {
    this.message = (r ? `${r}: ` : "") + t, n && (this.identifier = n), e != null && e.__line__ && (this.line = e.__line__);
  }
};
function Ar(r, ...e) {
  for (const t of e) for (const n in t) r[n] = t[n];
  return r;
}
var ge = class extends Error {
  constructor(r, e) {
    super(e), this.message = e, this.key = r;
  }
}, $c = class Co {
  constructor(e, t = []) {
    this.parent = e, this.bindings = {};
    for (const [n, i] of t) this.bindings[n] = i;
  }
  concat(e) {
    return new Co(this, e);
  }
  get(e) {
    if (this.bindings[e]) return this.bindings[e];
    if (this.parent) return this.parent.get(e);
    throw new Error(`${e} not found in scope.`);
  }
  has(e) {
    return this.bindings[e] ? !0 : this.parent ? this.parent.has(e) : !1;
  }
};
const Fr = { kind: "null" }, S = { kind: "number" }, I = { kind: "string" }, _ = { kind: "boolean" }, be = { kind: "color" }, zr = { kind: "projectionDefinition" }, Ue = { kind: "object" }, P = { kind: "value" }, jc = { kind: "error" }, Dr = { kind: "collator" }, Nr = { kind: "formatted" }, $r = { kind: "padding" }, Pt = { kind: "colorArray" }, jr = { kind: "numberArray" }, Gt = { kind: "resolvedImage" }, Ur = { kind: "variableAnchorOffsetCollection" };
function ne(r, e) {
  return {
    kind: "array",
    itemType: r,
    N: e
  };
}
function j(r) {
  if (r.kind === "array") {
    const e = j(r.itemType);
    return typeof r.N == "number" ? `array<${e}, ${r.N}>` : r.itemType.kind === "value" ? "array" : `array<${e}>`;
  } else return r.kind;
}
const Uc = [
  Fr,
  S,
  I,
  _,
  be,
  zr,
  Nr,
  Ue,
  ne(P),
  $r,
  jr,
  Pt,
  Gt,
  Ur
];
function _t(r, e) {
  if (e.kind === "error") return null;
  if (r.kind === "array") {
    if (e.kind === "array" && (e.N === 0 && e.itemType.kind === "value" || !_t(r.itemType, e.itemType)) && (typeof r.N != "number" || r.N === e.N)) return null;
  } else {
    if (r.kind === e.kind) return null;
    if (r.kind === "value") {
      for (const t of Uc) if (!_t(t, e)) return null;
    }
  }
  return `Expected ${j(r)} but found ${j(e)} instead.`;
}
function ni(r, e) {
  return e.some((t) => t.kind === r.kind);
}
function Be(r, e) {
  return e.some((t) => t === "null" ? r === null : t === "array" ? Array.isArray(r) : t === "object" ? r && !Array.isArray(r) && typeof r == "object" : t === typeof r);
}
function Ee(r, e) {
  return r.kind === "array" && e.kind === "array" ? r.itemType.kind === e.itemType.kind && typeof r.N == "number" : r.kind === e.kind;
}
const Ao = 0.96422, Lo = 1, Eo = 0.82521, To = 4 / 29, nt = 6 / 29, ko = 3 * nt * nt, Bc = nt * nt * nt, Vc = Math.PI / 180, qc = 180 / Math.PI;
function Io(r) {
  return r = r % 360, r < 0 && (r += 360), r;
}
function Mo([r, e, t, n]) {
  r = sn(r), e = sn(e), t = sn(t);
  let i, a;
  const o = ln((0.2225045 * r + 0.7168786 * e + 0.0606169 * t) / Lo);
  r === e && e === t ? i = a = o : (i = ln((0.4360747 * r + 0.3850649 * e + 0.1430804 * t) / Ao), a = ln((0.0139322 * r + 0.0971045 * e + 0.7141733 * t) / Eo));
  const s = 116 * o - 16;
  return [
    s < 0 ? 0 : s,
    500 * (i - o),
    200 * (o - a),
    n
  ];
}
function sn(r) {
  return r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
}
function ln(r) {
  return r > Bc ? Math.pow(r, 1 / 3) : r / ko + To;
}
function Po([r, e, t, n]) {
  let i = (r + 16) / 116, a = isNaN(e) ? i : i + e / 500, o = isNaN(t) ? i : i - t / 200;
  return i = Lo * cn(i), a = Ao * cn(a), o = Eo * cn(o), [
    un(3.1338561 * a - 1.6168667 * i - 0.4906146 * o),
    un(-0.9787684 * a + 1.9161415 * i + 0.033454 * o),
    un(0.0719453 * a - 0.2289914 * i + 1.4052427 * o),
    n
  ];
}
function un(r) {
  return r = r <= 304e-5 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055, r < 0 ? 0 : r > 1 ? 1 : r;
}
function cn(r) {
  return r > nt ? r * r * r : ko * (r - To);
}
function Gc(r) {
  const [e, t, n, i] = Mo(r), a = Math.sqrt(t * t + n * n);
  return [
    Math.round(a * 1e4) ? Io(Math.atan2(n, t) * qc) : NaN,
    a,
    e,
    i
  ];
}
function Hc([r, e, t, n]) {
  return r = isNaN(r) ? 0 : r * Vc, Po([
    t,
    Math.cos(r) * e,
    Math.sin(r) * e,
    n
  ]);
}
function Kc([r, e, t, n]) {
  r = Io(r), e /= 100, t /= 100;
  function i(a) {
    const o = (a + r / 30) % 12, s = e * Math.min(t, 1 - t);
    return t - s * Math.max(-1, Math.min(o - 3, 9 - o, 1));
  }
  return [
    i(0),
    i(8),
    i(4),
    n
  ];
}
const Zc = Object.hasOwn || function(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
};
function kt(r, e) {
  return Zc(r, e) ? r[e] : void 0;
}
function Wc(r) {
  if (r = r.toLowerCase().trim(), r === "transparent") return [
    0,
    0,
    0,
    0
  ];
  const e = kt(Yc, r);
  if (e) {
    const [n, i, a] = e;
    return [
      n / 255,
      i / 255,
      a / 255,
      1
    ];
  }
  if (r.startsWith("#") && /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(r)) {
    const n = r.length < 6 ? 1 : 2;
    let i = 1;
    return [
      tr(r.slice(i, i += n)),
      tr(r.slice(i, i += n)),
      tr(r.slice(i, i += n)),
      tr(r.slice(i, i + n) || "ff")
    ];
  }
  if (r.startsWith("rgb")) {
    const n = r.match(/^rgba?\(\s*([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/);
    if (n) {
      const [i, a, o, s, l, u, c, p, f, d, h, m] = n, g = [
        s || " ",
        c || " ",
        d
      ].join("");
      if (g === "  " || g === "  /" || g === ",," || g === ",,,") {
        const v = [
          o,
          u,
          f
        ].join(""), b = v === "%%%" ? 100 : v === "" ? 255 : 0;
        if (b) {
          const x = [
            Xe(+a / b, 0, 1),
            Xe(+l / b, 0, 1),
            Xe(+p / b, 0, 1),
            h ? ea(+h, m) : 1
          ];
          if (ta(x)) return x;
        }
      }
      return;
    }
  }
  const t = r.match(/^hsla?\(\s*([\de.+-]+)(?:deg)?(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/);
  if (t) {
    const [n, i, a, o, s, l, u, c, p] = t, f = [
      a || " ",
      s || " ",
      u
    ].join("");
    if (f === "  " || f === "  /" || f === ",," || f === ",,,") {
      const d = [
        +i,
        Xe(+o, 0, 100),
        Xe(+l, 0, 100),
        c ? ea(+c, p) : 1
      ];
      if (ta(d)) return Kc(d);
    }
  }
}
function tr(r) {
  return parseInt(r.padEnd(2, r), 16) / 255;
}
function ea(r, e) {
  return Xe(e ? r / 100 : r, 0, 1);
}
function Xe(r, e, t) {
  return Math.min(Math.max(e, r), t);
}
function ta(r) {
  return !r.some(Number.isNaN);
}
const Yc = {
  aliceblue: [
    240,
    248,
    255
  ],
  antiquewhite: [
    250,
    235,
    215
  ],
  aqua: [
    0,
    255,
    255
  ],
  aquamarine: [
    127,
    255,
    212
  ],
  azure: [
    240,
    255,
    255
  ],
  beige: [
    245,
    245,
    220
  ],
  bisque: [
    255,
    228,
    196
  ],
  black: [
    0,
    0,
    0
  ],
  blanchedalmond: [
    255,
    235,
    205
  ],
  blue: [
    0,
    0,
    255
  ],
  blueviolet: [
    138,
    43,
    226
  ],
  brown: [
    165,
    42,
    42
  ],
  burlywood: [
    222,
    184,
    135
  ],
  cadetblue: [
    95,
    158,
    160
  ],
  chartreuse: [
    127,
    255,
    0
  ],
  chocolate: [
    210,
    105,
    30
  ],
  coral: [
    255,
    127,
    80
  ],
  cornflowerblue: [
    100,
    149,
    237
  ],
  cornsilk: [
    255,
    248,
    220
  ],
  crimson: [
    220,
    20,
    60
  ],
  cyan: [
    0,
    255,
    255
  ],
  darkblue: [
    0,
    0,
    139
  ],
  darkcyan: [
    0,
    139,
    139
  ],
  darkgoldenrod: [
    184,
    134,
    11
  ],
  darkgray: [
    169,
    169,
    169
  ],
  darkgreen: [
    0,
    100,
    0
  ],
  darkgrey: [
    169,
    169,
    169
  ],
  darkkhaki: [
    189,
    183,
    107
  ],
  darkmagenta: [
    139,
    0,
    139
  ],
  darkolivegreen: [
    85,
    107,
    47
  ],
  darkorange: [
    255,
    140,
    0
  ],
  darkorchid: [
    153,
    50,
    204
  ],
  darkred: [
    139,
    0,
    0
  ],
  darksalmon: [
    233,
    150,
    122
  ],
  darkseagreen: [
    143,
    188,
    143
  ],
  darkslateblue: [
    72,
    61,
    139
  ],
  darkslategray: [
    47,
    79,
    79
  ],
  darkslategrey: [
    47,
    79,
    79
  ],
  darkturquoise: [
    0,
    206,
    209
  ],
  darkviolet: [
    148,
    0,
    211
  ],
  deeppink: [
    255,
    20,
    147
  ],
  deepskyblue: [
    0,
    191,
    255
  ],
  dimgray: [
    105,
    105,
    105
  ],
  dimgrey: [
    105,
    105,
    105
  ],
  dodgerblue: [
    30,
    144,
    255
  ],
  firebrick: [
    178,
    34,
    34
  ],
  floralwhite: [
    255,
    250,
    240
  ],
  forestgreen: [
    34,
    139,
    34
  ],
  fuchsia: [
    255,
    0,
    255
  ],
  gainsboro: [
    220,
    220,
    220
  ],
  ghostwhite: [
    248,
    248,
    255
  ],
  gold: [
    255,
    215,
    0
  ],
  goldenrod: [
    218,
    165,
    32
  ],
  gray: [
    128,
    128,
    128
  ],
  green: [
    0,
    128,
    0
  ],
  greenyellow: [
    173,
    255,
    47
  ],
  grey: [
    128,
    128,
    128
  ],
  honeydew: [
    240,
    255,
    240
  ],
  hotpink: [
    255,
    105,
    180
  ],
  indianred: [
    205,
    92,
    92
  ],
  indigo: [
    75,
    0,
    130
  ],
  ivory: [
    255,
    255,
    240
  ],
  khaki: [
    240,
    230,
    140
  ],
  lavender: [
    230,
    230,
    250
  ],
  lavenderblush: [
    255,
    240,
    245
  ],
  lawngreen: [
    124,
    252,
    0
  ],
  lemonchiffon: [
    255,
    250,
    205
  ],
  lightblue: [
    173,
    216,
    230
  ],
  lightcoral: [
    240,
    128,
    128
  ],
  lightcyan: [
    224,
    255,
    255
  ],
  lightgoldenrodyellow: [
    250,
    250,
    210
  ],
  lightgray: [
    211,
    211,
    211
  ],
  lightgreen: [
    144,
    238,
    144
  ],
  lightgrey: [
    211,
    211,
    211
  ],
  lightpink: [
    255,
    182,
    193
  ],
  lightsalmon: [
    255,
    160,
    122
  ],
  lightseagreen: [
    32,
    178,
    170
  ],
  lightskyblue: [
    135,
    206,
    250
  ],
  lightslategray: [
    119,
    136,
    153
  ],
  lightslategrey: [
    119,
    136,
    153
  ],
  lightsteelblue: [
    176,
    196,
    222
  ],
  lightyellow: [
    255,
    255,
    224
  ],
  lime: [
    0,
    255,
    0
  ],
  limegreen: [
    50,
    205,
    50
  ],
  linen: [
    250,
    240,
    230
  ],
  magenta: [
    255,
    0,
    255
  ],
  maroon: [
    128,
    0,
    0
  ],
  mediumaquamarine: [
    102,
    205,
    170
  ],
  mediumblue: [
    0,
    0,
    205
  ],
  mediumorchid: [
    186,
    85,
    211
  ],
  mediumpurple: [
    147,
    112,
    219
  ],
  mediumseagreen: [
    60,
    179,
    113
  ],
  mediumslateblue: [
    123,
    104,
    238
  ],
  mediumspringgreen: [
    0,
    250,
    154
  ],
  mediumturquoise: [
    72,
    209,
    204
  ],
  mediumvioletred: [
    199,
    21,
    133
  ],
  midnightblue: [
    25,
    25,
    112
  ],
  mintcream: [
    245,
    255,
    250
  ],
  mistyrose: [
    255,
    228,
    225
  ],
  moccasin: [
    255,
    228,
    181
  ],
  navajowhite: [
    255,
    222,
    173
  ],
  navy: [
    0,
    0,
    128
  ],
  oldlace: [
    253,
    245,
    230
  ],
  olive: [
    128,
    128,
    0
  ],
  olivedrab: [
    107,
    142,
    35
  ],
  orange: [
    255,
    165,
    0
  ],
  orangered: [
    255,
    69,
    0
  ],
  orchid: [
    218,
    112,
    214
  ],
  palegoldenrod: [
    238,
    232,
    170
  ],
  palegreen: [
    152,
    251,
    152
  ],
  paleturquoise: [
    175,
    238,
    238
  ],
  palevioletred: [
    219,
    112,
    147
  ],
  papayawhip: [
    255,
    239,
    213
  ],
  peachpuff: [
    255,
    218,
    185
  ],
  peru: [
    205,
    133,
    63
  ],
  pink: [
    255,
    192,
    203
  ],
  plum: [
    221,
    160,
    221
  ],
  powderblue: [
    176,
    224,
    230
  ],
  purple: [
    128,
    0,
    128
  ],
  rebeccapurple: [
    102,
    51,
    153
  ],
  red: [
    255,
    0,
    0
  ],
  rosybrown: [
    188,
    143,
    143
  ],
  royalblue: [
    65,
    105,
    225
  ],
  saddlebrown: [
    139,
    69,
    19
  ],
  salmon: [
    250,
    128,
    114
  ],
  sandybrown: [
    244,
    164,
    96
  ],
  seagreen: [
    46,
    139,
    87
  ],
  seashell: [
    255,
    245,
    238
  ],
  sienna: [
    160,
    82,
    45
  ],
  silver: [
    192,
    192,
    192
  ],
  skyblue: [
    135,
    206,
    235
  ],
  slateblue: [
    106,
    90,
    205
  ],
  slategray: [
    112,
    128,
    144
  ],
  slategrey: [
    112,
    128,
    144
  ],
  snow: [
    255,
    250,
    250
  ],
  springgreen: [
    0,
    255,
    127
  ],
  steelblue: [
    70,
    130,
    180
  ],
  tan: [
    210,
    180,
    140
  ],
  teal: [
    0,
    128,
    128
  ],
  thistle: [
    216,
    191,
    216
  ],
  tomato: [
    255,
    99,
    71
  ],
  turquoise: [
    64,
    224,
    208
  ],
  violet: [
    238,
    130,
    238
  ],
  wheat: [
    245,
    222,
    179
  ],
  white: [
    255,
    255,
    255
  ],
  whitesmoke: [
    245,
    245,
    245
  ],
  yellow: [
    255,
    255,
    0
  ],
  yellowgreen: [
    154,
    205,
    50
  ]
};
function Ve(r, e, t) {
  return r + t * (e - r);
}
function Ot(r, e, t) {
  return r.map((n, i) => Ve(n, e[i], t));
}
var W, ee = (W = class {
  /**
  * @param r Red component premultiplied by `alpha` 0..1
  * @param g Green component premultiplied by `alpha` 0..1
  * @param b Blue component premultiplied by `alpha` 0..1
  * @param [alpha=1] Alpha component 0..1
  * @param [premultiplied=true] Whether the `r`, `g` and `b` values have already
  * been multiplied by alpha. If `true` nothing happens if `false` then they will
  * be multiplied automatically.
  */
  constructor(e, t, n, i = 1, a = !0) {
    this.r = e, this.g = t, this.b = n, this.a = i, a || (this.r *= i, this.g *= i, this.b *= i, i || this.overwriteGetter("rgb", [
      e,
      t,
      n,
      i
    ]));
  }
  /**
  * Parses CSS color strings and converts colors to sRGB color space if needed.
  * Officially supported color formats:
  * - keyword, e.g. 'aquamarine' or 'steelblue'
  * - hex (with 3, 4, 6 or 8 digits), e.g. '#f0f' or '#e9bebea9'
  * - rgb and rgba, e.g. 'rgb(0,240,120)' or 'rgba(0%,94%,47%,0.1)' or 'rgb(0 240 120 / .3)'
  * - hsl and hsla, e.g. 'hsl(0,0%,83%)' or 'hsla(0,0%,83%,.5)' or 'hsl(0 0% 83% / 20%)'
  *
  * @param input CSS color string to parse.
  * @returns A `Color` instance, or `undefined` if the input is not a valid color string.
  */
  static parse(e) {
    if (e instanceof W) return e;
    if (typeof e != "string") return;
    const t = Wc(e);
    if (t) return new W(...t, !1);
  }
  /**
  * Used in color interpolation and by 'to-rgba' expression.
  *
  * @returns Gien color, with reversed alpha blending, in sRGB color space.
  */
  get rgb() {
    const { r: e, g: t, b: n, a: i } = this, a = i || 1 / 0;
    return this.overwriteGetter("rgb", [
      e / a,
      t / a,
      n / a,
      i
    ]);
  }
  /**
  * Used in color interpolation.
  *
  * @returns Gien color, with reversed alpha blending, in HCL color space.
  */
  get hcl() {
    return this.overwriteGetter("hcl", Gc(this.rgb));
  }
  /**
  * Used in color interpolation.
  *
  * @returns Gien color, with reversed alpha blending, in LAB color space.
  */
  get lab() {
    return this.overwriteGetter("lab", Mo(this.rgb));
  }
  /**
  * Lazy getter pattern. When getter is called for the first time lazy value
  * is calculated and then overwrites getter function in given object instance.
  *
  * @example:
  * const redColor = Color.parse('red');
  * let x = redColor.hcl; // this will invoke `get hcl()`, which will calculate
  * // the value of red in HCL space and invoke this `overwriteGetter` function
  * // which in turn will set a field with a key 'hcl' in the `redColor` object.
  * // In other words it will override `get hcl()` from its `Color` prototype
  * // with its own property: hcl = [calculated red value in hcl].
  * let y = redColor.hcl; // next call will no longer invoke getter but simply
  * // return the previously calculated value
  * x === y; // true - `x` is exactly the same object as `y`
  *
  * @param getterKey Getter key
  * @param lazyValue Lazily calculated value to be memoized by current instance
  * @private
  */
  overwriteGetter(e, t) {
    return Object.defineProperty(this, e, { value: t }), t;
  }
  /**
  * Used by 'to-string' expression.
  *
  * @returns Serialized color in format `rgba(r,g,b,a)`
  * where r,g,b are numbers within 0..255 and alpha is number within 1..0
  *
  * @example
  * var purple = new Color.parse('purple');
  * purple.toString; // = "rgba(128,0,128,1)"
  * var translucentGreen = new Color.parse('rgba(26, 207, 26, .73)');
  * translucentGreen.toString(); // = "rgba(26,207,26,0.73)"
  */
  toString() {
    const [e, t, n, i] = this.rgb;
    return `rgba(${[
      e,
      t,
      n
    ].map((a) => Math.round(a * 255)).join(",")},${i})`;
  }
  static interpolate(e, t, n, i = "rgb") {
    switch (i) {
      case "rgb": {
        const [a, o, s, l] = Ot(e.rgb, t.rgb, n);
        return new W(a, o, s, l, !1);
      }
      case "hcl": {
        const [a, o, s, l] = e.hcl, [u, c, p, f] = t.hcl;
        let d, h;
        if (!isNaN(a) && !isNaN(u)) {
          let x = u - a;
          u > a && x > 180 ? x -= 360 : u < a && a - u > 180 && (x += 360), d = a + n * x;
        } else isNaN(a) ? isNaN(u) ? d = NaN : (d = u, (s === 1 || s === 0) && (h = c)) : (d = a, (p === 1 || p === 0) && (h = o));
        const [m, g, v, b] = Hc([
          d,
          h ?? Ve(o, c, n),
          Ve(s, p, n),
          Ve(l, f, n)
        ]);
        return new W(m, g, v, b, !1);
      }
      case "lab": {
        const [a, o, s, l] = Po(Ot(e.lab, t.lab, n));
        return new W(a, o, s, l, !1);
      }
    }
  }
}, W.black = new W(0, 0, 0, 1), W.white = new W(1, 1, 1, 1), W.transparent = new W(0, 0, 0, 0), W.red = new W(1, 0, 0, 1), W), ii = class {
  constructor(r, e, t) {
    r ? this.sensitivity = e ? "variant" : "case" : this.sensitivity = e ? "accent" : "base", this.locale = t, this.collator = new Intl.Collator(this.locale ? this.locale : [], {
      sensitivity: this.sensitivity,
      usage: "search"
    });
  }
  compare(r, e) {
    return this.collator.compare(r, e);
  }
  resolvedLocale() {
    return new Intl.Collator(this.locale ? this.locale : []).resolvedOptions().locale;
  }
};
const Xc = [
  "bottom",
  "center",
  "top"
];
var Ln = class {
  constructor(r, e, t, n, i, a) {
    this.text = r, this.image = e, this.scale = t, this.fontStack = n, this.textColor = i, this.verticalAlign = a;
  }
}, Ht = class hr {
  constructor(e) {
    this.sections = e;
  }
  static fromString(e) {
    return new hr([new Ln(e, null, null, null, null, null)]);
  }
  isEmpty() {
    return this.sections.length === 0 ? !0 : !this.sections.some((e) => e.text.length !== 0 || e.image && e.image.name.length !== 0);
  }
  static factory(e) {
    return e instanceof hr ? e : hr.fromString(e);
  }
  toString() {
    return this.sections.length === 0 ? "" : this.sections.map((e) => e.text).join("");
  }
}, ut = class wt {
  constructor(e) {
    this.values = e.slice();
  }
  /**
  * Numeric padding values
  * @param input A padding value
  * @returns A `Padding` instance, or `undefined` if the input is not a valid padding value.
  */
  static parse(e) {
    if (e instanceof wt) return e;
    if (typeof e == "number") return new wt([
      e,
      e,
      e,
      e
    ]);
    if (Array.isArray(e) && !(e.length < 1 || e.length > 4)) {
      for (const t of e) if (typeof t != "number") return;
      switch (e.length) {
        case 1:
          e = [
            e[0],
            e[0],
            e[0],
            e[0]
          ];
          break;
        case 2:
          e = [
            e[0],
            e[1],
            e[0],
            e[1]
          ];
          break;
        case 3:
          e = [
            e[0],
            e[1],
            e[2],
            e[1]
          ];
          break;
      }
      return new wt(e);
    }
  }
  toString() {
    return JSON.stringify(this.values);
  }
  static interpolate(e, t, n) {
    return new wt(Ot(e.values, t.values, n));
  }
}, ct = class St {
  constructor(e) {
    this.values = e.slice();
  }
  /**
  * Numeric NumberArray values
  * @param input A NumberArray value
  * @returns A `NumberArray` instance, or `undefined` if the input is not a valid NumberArray value.
  */
  static parse(e) {
    if (e instanceof St) return e;
    if (typeof e == "number") return new St([e]);
    if (Array.isArray(e)) {
      for (const t of e) if (typeof t != "number") return;
      return new St(e);
    }
  }
  toString() {
    return JSON.stringify(this.values);
  }
  static interpolate(e, t, n) {
    return new St(Ot(e.values, t.values, n));
  }
}, Re = class xt {
  constructor(e) {
    this.values = e.slice();
  }
  /**
  * ColorArray values
  * @param input A ColorArray value
  * @returns A `ColorArray` instance, or `undefined` if the input is not a valid ColorArray value.
  */
  static parse(e) {
    if (e instanceof xt) return e;
    if (typeof e == "string") {
      const n = ee.parse(e);
      return n ? new xt([n]) : void 0;
    }
    if (!Array.isArray(e)) return;
    const t = [];
    for (const n of e) {
      if (typeof n != "string") return;
      const i = ee.parse(n);
      if (!i) return;
      t.push(i);
    }
    return new xt(t);
  }
  toString() {
    return JSON.stringify(this.values);
  }
  static interpolate(e, t, n, i = "rgb") {
    const a = [];
    if (e.values.length != t.values.length) throw new Error(`colorArray: Arrays have mismatched length (${e.values.length} vs. ${t.values.length}), cannot interpolate.`);
    for (let o = 0; o < e.values.length; o++) a.push(ee.interpolate(e.values[o], t.values[o], n, i));
    return new xt(a);
  }
}, q = class extends Error {
  constructor(r) {
    super(r), this.name = "RuntimeError";
  }
  toJSON() {
    return this.message;
  }
};
const Jc = /* @__PURE__ */ new Set([
  "center",
  "left",
  "right",
  "top",
  "bottom",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right"
]);
var pt = class mr {
  constructor(e) {
    this.values = e.slice();
  }
  static parse(e) {
    if (e instanceof mr) return e;
    if (!(!Array.isArray(e) || e.length < 1 || e.length % 2 !== 0)) {
      for (let t = 0; t < e.length; t += 2) {
        const n = e[t], i = e[t + 1];
        if (typeof n != "string" || !Jc.has(n) || !Array.isArray(i) || i.length !== 2 || typeof i[0] != "number" || typeof i[1] != "number") return;
      }
      return new mr(e);
    }
  }
  toString() {
    return JSON.stringify(this.values);
  }
  static interpolate(e, t, n) {
    const i = e.values, a = t.values;
    if (i.length !== a.length) throw new q(`Cannot interpolate values of different length. from: ${e.toString()}, to: ${t.toString()}`);
    const o = [];
    for (let s = 0; s < i.length; s += 2) {
      if (i[s] !== a[s]) throw new q(`Cannot interpolate values containing mismatched anchors. from[${s}]: ${i[s]}, to[${s}]: ${a[s]}`);
      o.push(i[s]);
      const [l, u] = i[s + 1], [c, p] = a[s + 1];
      o.push([Ve(l, c, n), Ve(u, p, n)]);
    }
    return new mr(o);
  }
}, ft = class _o {
  constructor(e) {
    this.name = e.name, this.available = e.available;
  }
  toString() {
    return this.name;
  }
  static fromString(e) {
    return e ? new _o({
      name: e,
      available: !1
    }) : null;
  }
}, Kt = class Je {
  constructor(e, t, n) {
    this.from = e, this.to = t, this.transition = n;
  }
  static interpolate(e, t, n) {
    return new Je(e, t, n);
  }
  static parse(e) {
    if (e instanceof Je) return e;
    if (Array.isArray(e) && e.length === 3 && typeof e[0] == "string" && typeof e[1] == "string" && typeof e[2] == "number") return new Je(e[0], e[1], e[2]);
    if (typeof e == "object" && typeof e.from == "string" && typeof e.to == "string" && typeof e.transition == "number") return new Je(e.from, e.to, e.transition);
    if (typeof e == "string") return new Je(e, e, 1);
  }
};
function Oo(r, e, t, n) {
  return typeof r == "number" && r >= 0 && r <= 255 && typeof e == "number" && e >= 0 && e <= 255 && typeof t == "number" && t >= 0 && t <= 255 ? typeof n > "u" || typeof n == "number" && n >= 0 && n <= 1 ? null : `Invalid rgba value [${[
    r,
    e,
    t,
    n
  ].join(", ")}]: 'a' must be between 0 and 1.` : `Invalid rgba value [${(typeof n == "number" ? [
    r,
    e,
    t,
    n
  ] : [
    r,
    e,
    t
  ]).join(", ")}]: 'r', 'g', and 'b' must be between 0 and 255.`;
}
function Rt(r) {
  if (r === null || typeof r == "string" || typeof r == "boolean" || typeof r == "number" || r instanceof Kt || r instanceof ee || r instanceof ii || r instanceof Ht || r instanceof ut || r instanceof ct || r instanceof Re || r instanceof pt || r instanceof ft) return !0;
  if (Array.isArray(r)) {
    for (const e of r) if (!Rt(e)) return !1;
    return !0;
  } else if (typeof r == "object") {
    for (const e in r) if (!Rt(r[e])) return !1;
    return !0;
  } else return !1;
}
function K(r) {
  if (r === null) return Fr;
  if (typeof r == "string") return I;
  if (typeof r == "boolean") return _;
  if (typeof r == "number") return S;
  if (r instanceof ee) return be;
  if (r instanceof Kt) return zr;
  if (r instanceof ii) return Dr;
  if (r instanceof Ht) return Nr;
  if (r instanceof ut) return $r;
  if (r instanceof ct) return jr;
  if (r instanceof Re) return Pt;
  if (r instanceof pt) return Ur;
  if (r instanceof ft) return Gt;
  if (Array.isArray(r)) {
    const e = r.length;
    let t;
    for (const n of r) {
      const i = K(n);
      if (!t) t = i;
      else {
        if (t === i) continue;
        t = P;
        break;
      }
    }
    return ne(t || P, e);
  } else return Ue;
}
function It(r) {
  const e = typeof r;
  return r === null ? "" : e === "string" || e === "number" || e === "boolean" ? String(r) : r instanceof ee || r instanceof Kt || r instanceof Ht || r instanceof ut || r instanceof ct || r instanceof Re || r instanceof pt || r instanceof ft ? r.toString() : JSON.stringify(r);
}
var Lr = class Ro {
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  static parse(e, t) {
    if (e.length !== 2) return t.error(`'literal' expression requires exactly one argument, but found ${e.length - 1} instead.`);
    if (!Rt(e[1])) return t.error("invalid value");
    const n = e[1];
    let i = K(n);
    const a = t.expectedType;
    return i.kind === "array" && i.N === 0 && a && a.kind === "array" && (typeof a.N != "number" || a.N === 0) && (i = a), new Ro(i, n);
  }
  evaluate() {
    return this.value;
  }
  eachChild() {
  }
  outputDefined() {
    return !0;
  }
};
const rr = {
  string: I,
  number: S,
  boolean: _,
  object: Ue
};
var xe = class Fo {
  constructor(e, t) {
    this.type = e, this.args = t;
  }
  static parse(e, t) {
    if (e.length < 2) return t.error("Expected at least one argument.");
    let n = 1, i;
    const a = e[0];
    if (a === "array") {
      let s;
      if (e.length > 2) {
        const u = e[1];
        if (typeof u != "string" || !(u in rr) || u === "object") return t.error('The item type argument of "array" must be one of string, number, boolean', 1);
        s = rr[u], n++;
      } else s = P;
      let l;
      if (e.length > 3) {
        if (e[2] !== null && (typeof e[2] != "number" || e[2] < 0 || e[2] !== Math.floor(e[2]))) return t.error('The length argument to "array" must be a positive integer literal', 2);
        l = e[2], n++;
      }
      i = ne(s, l);
    } else {
      if (!rr[a]) throw new Error(`Types doesn't contain name = ${a}`);
      i = rr[a];
    }
    const o = [];
    for (; n < e.length; n++) {
      const s = t.parse(e[n], n, P);
      if (!s) return null;
      o.push(s);
    }
    return new Fo(i, o);
  }
  evaluate(e) {
    for (let t = 0; t < this.args.length; t++) {
      const n = this.args[t].evaluate(e);
      if (_t(this.type, K(n))) {
        if (t === this.args.length - 1) throw new q(`Expected value to be of type ${j(this.type)}, but found ${j(K(n))} instead.`);
      } else return n;
    }
    throw new Error();
  }
  eachChild(e) {
    this.args.forEach(e);
  }
  outputDefined() {
    return this.args.every((e) => e.outputDefined());
  }
};
const ra = {
  "to-boolean": _,
  "to-color": be,
  "to-number": S,
  "to-string": I
};
var et = class zo {
  constructor(e, t) {
    this.type = e, this.args = t;
  }
  static parse(e, t) {
    if (e.length < 2) return t.error("Expected at least one argument.");
    const n = e[0];
    if (!ra[n]) throw new Error(`Can't parse ${n} as it is not part of the known types`);
    if ((n === "to-boolean" || n === "to-string") && e.length !== 2) return t.error("Expected one argument.");
    const i = ra[n], a = [];
    for (let o = 1; o < e.length; o++) {
      const s = t.parse(e[o], o, P);
      if (!s) return null;
      a.push(s);
    }
    return new zo(i, a);
  }
  evaluate(e) {
    switch (this.type.kind) {
      case "boolean":
        return !!this.args[0].evaluate(e);
      case "color": {
        let t, n;
        for (const i of this.args) {
          if (t = i.evaluate(e), n = null, t instanceof ee) return t;
          if (typeof t == "string") {
            const a = e.parseColor(t);
            if (a) return a;
          } else if (Array.isArray(t) && (t.length < 3 || t.length > 4 ? n = `Invalid rgba value ${JSON.stringify(t)}: expected an array containing either three or four numeric values.` : n = Oo(t[0], t[1], t[2], t[3]), !n))
            return new ee(t[0] / 255, t[1] / 255, t[2] / 255, t[3]);
        }
        throw new q(n || `Could not parse color from value '${typeof t == "string" ? t : JSON.stringify(t)}'`);
      }
      case "padding": {
        let t;
        for (const n of this.args) {
          t = n.evaluate(e);
          const i = ut.parse(t);
          if (i) return i;
        }
        throw new q(`Could not parse padding from value '${typeof t == "string" ? t : JSON.stringify(t)}'`);
      }
      case "numberArray": {
        let t;
        for (const n of this.args) {
          t = n.evaluate(e);
          const i = ct.parse(t);
          if (i) return i;
        }
        throw new q(`Could not parse numberArray from value '${typeof t == "string" ? t : JSON.stringify(t)}'`);
      }
      case "colorArray": {
        let t;
        for (const n of this.args) {
          t = n.evaluate(e);
          const i = Re.parse(t);
          if (i) return i;
        }
        throw new q(`Could not parse colorArray from value '${typeof t == "string" ? t : JSON.stringify(t)}'`);
      }
      case "variableAnchorOffsetCollection": {
        let t;
        for (const n of this.args) {
          t = n.evaluate(e);
          const i = pt.parse(t);
          if (i) return i;
        }
        throw new q(`Could not parse variableAnchorOffsetCollection from value '${typeof t == "string" ? t : JSON.stringify(t)}'`);
      }
      case "number": {
        let t = null;
        for (const n of this.args) {
          if (t = n.evaluate(e), t === null) return 0;
          const i = Number(t);
          if (!isNaN(i))
            return i;
        }
        throw new q(`Could not convert ${JSON.stringify(t)} to number.`);
      }
      case "formatted":
        return Ht.fromString(It(this.args[0].evaluate(e)));
      case "resolvedImage":
        return ft.fromString(It(this.args[0].evaluate(e)));
      case "projectionDefinition":
        return this.args[0].evaluate(e);
      default:
        return It(this.args[0].evaluate(e));
    }
  }
  eachChild(e) {
    this.args.forEach(e);
  }
  outputDefined() {
    return this.args.every((e) => e.outputDefined());
  }
};
const Qc = [
  "Unknown",
  "Point",
  "LineString",
  "Polygon"
];
var Do = class {
  constructor() {
    this.globals = null, this.feature = null, this.featureState = null, this.formattedSection = null, this._parseColorCache = /* @__PURE__ */ new Map(), this.availableImages = null, this.canonical = null;
  }
  id() {
    return this.feature && "id" in this.feature ? this.feature.id : null;
  }
  geometryType() {
    return this.feature ? typeof this.feature.type == "number" ? Qc[this.feature.type] : this.feature.type : null;
  }
  geometry() {
    return this.feature && "geometry" in this.feature ? this.feature.geometry : null;
  }
  canonicalID() {
    return this.canonical;
  }
  properties() {
    return this.feature && this.feature.properties || {};
  }
  parseColor(r) {
    let e = this._parseColorCache.get(r);
    return e || (e = ee.parse(r), this._parseColorCache.set(r, e)), e;
  }
}, No = class $o {
  constructor(e, t, n = [], i, a = new $c(), o = []) {
    this.registry = e, this.path = n, this.key = n.map((s) => `[${s}]`).join(""), this.scope = a, this.errors = o, this.expectedType = i, this._isConstant = t;
  }
  /**
  * @param expr the JSON expression to parse
  * @param index the optional argument index if this expression is an argument of a parent expression that's being parsed
  * @param options
  * @param options.omitTypeAnnotations set true to omit inferred type annotations.  Caller beware: with this option set, the parsed expression's type will NOT satisfy `expectedType` if it would normally be wrapped in an inferred annotation.
  * @private
  */
  parse(e, t, n, i, a = {}) {
    return t ? this.concat(t, n, i)._parse(e, a) : this._parse(e, a);
  }
  _parse(e, t) {
    (e === null || typeof e == "string" || typeof e == "boolean" || typeof e == "number") && (e = ["literal", e]);
    function n(i, a, o) {
      return o === "assert" ? new xe(a, [i]) : o === "coerce" ? new et(a, [i]) : i;
    }
    if (Array.isArray(e)) {
      if (e.length === 0) return this.error('Expected an array with at least one element. If you wanted a literal array, use ["literal", []].');
      const i = e[0];
      if (typeof i != "string")
        return this.error(`Expression name must be a string, but found ${typeof i} instead. If you wanted a literal array, use ["literal", [...]].`, 0), null;
      const a = this.registry[i];
      if (a) {
        let o = a.parse(e, this);
        if (!o) return null;
        if (this.expectedType) {
          const s = this.expectedType, l = o.type;
          if ((s.kind === "string" || s.kind === "number" || s.kind === "boolean" || s.kind === "object" || s.kind === "array") && l.kind === "value") o = n(o, s, t.typeAnnotation || "assert");
          else if (s.kind === "projectionDefinition" && ["string", "array"].includes(l.kind) || [
            "color",
            "formatted",
            "resolvedImage"
          ].includes(s.kind) && ["value", "string"].includes(l.kind) || ["padding", "numberArray"].includes(s.kind) && [
            "value",
            "number",
            "array"
          ].includes(l.kind) || s.kind === "colorArray" && [
            "value",
            "string",
            "array"
          ].includes(l.kind) || s.kind === "variableAnchorOffsetCollection" && ["value", "array"].includes(l.kind)) o = n(o, s, t.typeAnnotation || "coerce");
          else if (this.checkSubtype(s, l)) return null;
        }
        if (!(o instanceof Lr) && o.type.kind !== "resolvedImage" && this._isConstant(o)) {
          const s = new Do();
          try {
            o = new Lr(o.type, o.evaluate(s));
          } catch (l) {
            return this.error(l.message), null;
          }
        }
        return o;
      }
      return this.error(`Unknown expression "${i}". If you wanted a literal array, use ["literal", [...]].`, 0);
    } else return typeof e > "u" ? this.error("'undefined' value invalid. Use null instead.") : typeof e == "object" ? this.error('Bare objects invalid. Use ["literal", {...}] instead.') : this.error(`Expected an array, but found ${typeof e} instead.`);
  }
  /**
  * Returns a copy of this context suitable for parsing the subexpression at
  * index `index`, optionally appending to 'let' binding map.
  *
  * Note that `errors` property, intended for collecting errors while
  * parsing, is copied by reference rather than cloned.
  * @private
  */
  concat(e, t, n) {
    const i = typeof e == "number" ? this.path.concat(e) : this.path, a = n ? this.scope.concat(n) : this.scope;
    return new $o(this.registry, this._isConstant, i, t || null, a, this.errors);
  }
  /**
  * Push a parsing (or type checking) error into the `this.errors`
  * @param error The message
  * @param keys Optionally specify the source of the error at a child
  * of the current expression at `this.key`.
  * @private
  */
  error(e, ...t) {
    const n = `${this.key}${t.map((i) => `[${i}]`).join("")}`;
    this.errors.push(new ge(n, e));
  }
  /**
  * Returns null if `t` is a subtype of `expected`; otherwise returns an
  * error message and also pushes it to `this.errors`.
  * @param expected The expected type
  * @param t The actual type
  * @returns null if `t` is a subtype of `expected`; otherwise returns an error message
  */
  checkSubtype(e, t) {
    const n = _t(e, t);
    return n && this.error(n), n;
  }
}, jo = class Uo {
  constructor(e, t) {
    this.type = t.type, this.bindings = [].concat(e), this.result = t;
  }
  evaluate(e) {
    return this.result.evaluate(e);
  }
  eachChild(e) {
    for (const t of this.bindings) e(t[1]);
    e(this.result);
  }
  static parse(e, t) {
    if (e.length < 4) return t.error(`Expected at least 3 arguments, but found ${e.length - 1} instead.`);
    const n = [];
    for (let a = 1; a < e.length - 1; a += 2) {
      const o = e[a];
      if (typeof o != "string") return t.error(`Expected string, but found ${typeof o} instead.`, a);
      if (/[^a-zA-Z0-9_]/.test(o)) return t.error("Variable names must contain only alphanumeric characters or '_'.", a);
      const s = t.parse(e[a + 1], a + 1);
      if (!s) return null;
      n.push([o, s]);
    }
    const i = t.parse(e[e.length - 1], e.length - 1, t.expectedType, n);
    return i ? new Uo(n, i) : null;
  }
  outputDefined() {
    return this.result.outputDefined();
  }
}, Bo = class Vo {
  constructor(e, t) {
    this.type = t.type, this.name = e, this.boundExpression = t;
  }
  static parse(e, t) {
    if (e.length !== 2 || typeof e[1] != "string") return t.error("'var' expression requires exactly one string literal argument.");
    const n = e[1];
    return t.scope.has(n) ? new Vo(n, t.scope.get(n)) : t.error(`Unknown variable "${n}". Make sure "${n}" has been bound in an enclosing "let" expression before using it.`, 1);
  }
  evaluate(e) {
    return this.boundExpression.evaluate(e);
  }
  eachChild() {
  }
  outputDefined() {
    return !1;
  }
}, ep = class qo {
  constructor(e, t, n) {
    this.type = e, this.index = t, this.input = n;
  }
  static parse(e, t) {
    if (e.length !== 3) return t.error(`Expected 2 arguments, but found ${e.length - 1} instead.`);
    const n = t.parse(e[1], 1, S), i = t.parse(e[2], 2, ne(t.expectedType || P));
    if (!n || !i) return null;
    const a = i.type;
    return new qo(a.itemType, n, i);
  }
  evaluate(e) {
    const t = this.index.evaluate(e), n = this.input.evaluate(e);
    if (t < 0) throw new q(`Array index out of bounds: ${t} < 0.`);
    if (t >= n.length) throw new q(`Array index out of bounds: ${t} > ${n.length - 1}.`);
    if (t !== Math.floor(t)) throw new q(`Array index must be an integer, but found ${t} instead.`);
    return n[t];
  }
  eachChild(e) {
    e(this.index), e(this.input);
  }
  outputDefined() {
    return !1;
  }
}, tp = class Go {
  constructor(e, t) {
    this.type = _, this.needle = e, this.haystack = t;
  }
  static parse(e, t) {
    if (e.length !== 3) return t.error(`Expected 2 arguments, but found ${e.length - 1} instead.`);
    const n = t.parse(e[1], 1, P), i = t.parse(e[2], 2, P);
    return !n || !i ? null : ni(n.type, [
      _,
      I,
      S,
      Fr,
      P
    ]) ? new Go(n, i) : t.error(`Expected first argument to be of type boolean, string, number or null, but found ${j(n.type)} instead`);
  }
  evaluate(e) {
    const t = this.needle.evaluate(e), n = this.haystack.evaluate(e);
    if (!n) return !1;
    if (!Be(t, [
      "boolean",
      "string",
      "number",
      "null"
    ])) throw new q(`Expected first argument to be of type boolean, string, number or null, but found ${j(K(t))} instead.`);
    if (!Be(n, ["string", "array"])) throw new q(`Expected second argument to be of type array or string, but found ${j(K(n))} instead.`);
    return n.indexOf(t) >= 0;
  }
  eachChild(e) {
    e(this.needle), e(this.haystack);
  }
  outputDefined() {
    return !0;
  }
}, rp = class En {
  constructor(e, t, n) {
    this.type = S, this.needle = e, this.haystack = t, this.fromIndex = n;
  }
  static parse(e, t) {
    if (e.length <= 2 || e.length >= 5) return t.error(`Expected 2 or 3 arguments, but found ${e.length - 1} instead.`);
    const n = t.parse(e[1], 1, P), i = t.parse(e[2], 2, P);
    if (!n || !i) return null;
    if (!ni(n.type, [
      _,
      I,
      S,
      Fr,
      P
    ])) return t.error(`Expected first argument to be of type boolean, string, number or null, but found ${j(n.type)} instead`);
    if (e.length === 4) {
      const a = t.parse(e[3], 3, S);
      return a ? new En(n, i, a) : null;
    } else return new En(n, i);
  }
  evaluate(e) {
    const t = this.needle.evaluate(e), n = this.haystack.evaluate(e);
    if (!Be(t, [
      "boolean",
      "string",
      "number",
      "null"
    ])) throw new q(`Expected first argument to be of type boolean, string, number or null, but found ${j(K(t))} instead.`);
    let i;
    if (this.fromIndex && (i = this.fromIndex.evaluate(e)), Be(n, ["string"])) {
      const a = n.indexOf(t, i);
      return a === -1 ? -1 : [...n.slice(0, a)].length;
    } else {
      if (Be(n, ["array"])) return n.indexOf(t, i);
      throw new q(`Expected second argument to be of type array or string, but found ${j(K(n))} instead.`);
    }
  }
  eachChild(e) {
    e(this.needle), e(this.haystack), this.fromIndex && e(this.fromIndex);
  }
  outputDefined() {
    return !1;
  }
}, np = class Ho {
  constructor(e, t, n, i, a, o) {
    this.inputType = e, this.type = t, this.input = n, this.cases = i, this.outputs = a, this.otherwise = o;
  }
  static parse(e, t) {
    if (e.length < 5) return t.error(`Expected at least 4 arguments, but found only ${e.length - 1}.`);
    if (e.length % 2 !== 1) return t.error("Expected an even number of arguments.");
    let n, i;
    t.expectedType && t.expectedType.kind !== "value" && (i = t.expectedType);
    const a = {}, o = [];
    for (let u = 2; u < e.length - 1; u += 2) {
      let c = e[u];
      const p = e[u + 1];
      Array.isArray(c) || (c = [c]);
      const f = t.concat(u);
      if (c.length === 0) return f.error("Expected at least one branch label.");
      for (const h of c) {
        if (typeof h != "number" && typeof h != "string") return f.error("Branch labels must be numbers or strings.");
        if (typeof h == "number" && Math.abs(h) > Number.MAX_SAFE_INTEGER) return f.error(`Branch labels must be integers no larger than ${Number.MAX_SAFE_INTEGER}.`);
        if (typeof h == "number" && Math.floor(h) !== h) return f.error("Numeric branch labels must be integer values.");
        if (!n) n = K(h);
        else if (f.checkSubtype(n, K(h))) return null;
        if (typeof a[String(h)] < "u") return f.error("Branch labels must be unique.");
        a[String(h)] = o.length;
      }
      const d = t.parse(p, u, i);
      if (!d) return null;
      i = i || d.type, o.push(d);
    }
    const s = t.parse(e[1], 1, P);
    if (!s) return null;
    const l = t.parse(e[e.length - 1], e.length - 1, i);
    return !l || s.type.kind !== "value" && t.concat(1).checkSubtype(n, s.type) ? null : new Ho(n, i, s, a, o, l);
  }
  evaluate(e) {
    const t = this.input.evaluate(e);
    return (K(t) === this.inputType && this.outputs[this.cases[t]] || this.otherwise).evaluate(e);
  }
  eachChild(e) {
    e(this.input), this.outputs.forEach(e), e(this.otherwise);
  }
  outputDefined() {
    return this.outputs.every((e) => e.outputDefined()) && this.otherwise.outputDefined();
  }
}, ip = class Ko {
  constructor(e, t, n) {
    this.type = e, this.branches = t, this.otherwise = n;
  }
  static parse(e, t) {
    if (e.length < 4) return t.error(`Expected at least 3 arguments, but found only ${e.length - 1}.`);
    if (e.length % 2 !== 0) return t.error("Expected an odd number of arguments.");
    let n;
    t.expectedType && t.expectedType.kind !== "value" && (n = t.expectedType);
    const i = [];
    for (let o = 1; o < e.length - 1; o += 2) {
      const s = t.parse(e[o], o, _);
      if (!s) return null;
      const l = t.parse(e[o + 1], o + 1, n);
      if (!l) return null;
      i.push([s, l]), n = n || l.type;
    }
    const a = t.parse(e[e.length - 1], e.length - 1, n);
    if (!a) return null;
    if (!n) throw new Error("Can't infer output type");
    return new Ko(n, i, a);
  }
  evaluate(e) {
    for (const [t, n] of this.branches) if (t.evaluate(e)) return n.evaluate(e);
    return this.otherwise.evaluate(e);
  }
  eachChild(e) {
    for (const [t, n] of this.branches)
      e(t), e(n);
    e(this.otherwise);
  }
  outputDefined() {
    return this.branches.every(([e, t]) => t.outputDefined()) && this.otherwise.outputDefined();
  }
}, ap = class Tn {
  constructor(e, t, n, i) {
    this.type = e, this.input = t, this.beginIndex = n, this.endIndex = i;
  }
  static parse(e, t) {
    if (e.length <= 2 || e.length >= 5) return t.error(`Expected 2 or 3 arguments, but found ${e.length - 1} instead.`);
    const n = t.parse(e[1], 1, P), i = t.parse(e[2], 2, S);
    if (!n || !i) return null;
    if (!ni(n.type, [
      ne(P),
      I,
      P
    ])) return t.error(`Expected first argument to be of type array or string, but found ${j(n.type)} instead`);
    if (e.length === 4) {
      const a = t.parse(e[3], 3, S);
      return a ? new Tn(n.type, n, i, a) : null;
    } else return new Tn(n.type, n, i);
  }
  evaluate(e) {
    const t = this.input.evaluate(e), n = this.beginIndex.evaluate(e);
    let i;
    if (this.endIndex && (i = this.endIndex.evaluate(e)), Be(t, ["string"])) return [...t].slice(n, i).join("");
    if (Be(t, ["array"])) return t.slice(n, i);
    throw new q(`Expected first argument to be of type array or string, but found ${j(K(t))} instead.`);
  }
  eachChild(e) {
    e(this.input), e(this.beginIndex), this.endIndex && e(this.endIndex);
  }
  outputDefined() {
    return !1;
  }
};
function Zo(r, e) {
  const t = r.length - 1;
  let n = 0, i = t, a = 0, o, s;
  for (; n <= i; )
    if (a = Math.floor((n + i) / 2), o = r[a], s = r[a + 1], o <= e) {
      if (a === t || e < s) return a;
      n = a + 1;
    } else if (o > e) i = a - 1;
    else throw new q("Input is not a number.");
  return 0;
}
var Wo = class Yo {
  constructor(e, t, n) {
    this.type = e, this.input = t, this.labels = [], this.outputs = [];
    for (const [i, a] of n)
      this.labels.push(i), this.outputs.push(a);
  }
  static parse(e, t) {
    if (e.length - 1 < 4) return t.error(`Expected at least 4 arguments, but found only ${e.length - 1}.`);
    if ((e.length - 1) % 2 !== 0) return t.error("Expected an even number of arguments.");
    const n = t.parse(e[1], 1, S);
    if (!n) return null;
    const i = [];
    let a = null;
    t.expectedType && t.expectedType.kind !== "value" && (a = t.expectedType);
    for (let o = 1; o < e.length; o += 2) {
      const s = o === 1 ? -1 / 0 : e[o], l = e[o + 1], u = o, c = o + 1;
      if (typeof s != "number") return t.error('Input/output pairs for "step" expressions must be defined using literal numeric values (not computed expressions) for the input values.', u);
      if (i.length && i[i.length - 1][0] >= s) return t.error('Input/output pairs for "step" expressions must be arranged with input values in strictly ascending order.', u);
      const p = t.parse(l, c, a);
      if (!p) return null;
      a = a || p.type, i.push([s, p]);
    }
    return new Yo(a, n, i);
  }
  evaluate(e) {
    const t = this.labels, n = this.outputs;
    if (t.length === 1) return n[0].evaluate(e);
    const i = this.input.evaluate(e);
    if (i <= t[0]) return n[0].evaluate(e);
    const a = t.length;
    return i >= t[a - 1] ? n[a - 1].evaluate(e) : n[Zo(t, i)].evaluate(e);
  }
  eachChild(e) {
    e(this.input);
    for (const t of this.outputs) e(t);
  }
  outputDefined() {
    return this.outputs.every((e) => e.outputDefined());
  }
};
function op(r, e, t, n) {
  const i = 3 * r, a = 3 * (t - r) - i, o = 1 - i - a, s = 3 * e, l = 3 * (n - e) - s, u = 1 - s - l;
  return function(p, f = 1e-6) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let d = p;
    for (let g = 0; g < 8; g++) {
      const v = ((o * d + a) * d + i) * d - p;
      if (Math.abs(v) < f) return ((u * d + l) * d + s) * d;
      const b = (3 * o * d + 2 * a) * d + i;
      if (Math.abs(b) < 1e-6) break;
      d -= v / b;
    }
    let h = 0, m = 1;
    d = p;
    for (let g = 0; g < 20; g++) {
      const v = ((o * d + a) * d + i) * d;
      if (Math.abs(v - p) < f) break;
      p > v ? h = d : m = d, d = (h + m) * 0.5;
    }
    return ((u * d + l) * d + s) * d;
  };
}
var qe = class kn {
  constructor(e, t, n, i, a) {
    this.type = e, this.operator = t, this.interpolation = n, this.input = i, this.labels = [], this.outputs = [];
    for (const [o, s] of a)
      this.labels.push(o), this.outputs.push(s);
  }
  static interpolationFactor(e, t, n, i) {
    let a = 0;
    if (e.name === "exponential") a = pn(t, e.base, n, i);
    else if (e.name === "linear") a = pn(t, 1, n, i);
    else if (e.name === "cubic-bezier") {
      const o = e.controlPoints;
      a = op(o[0], o[1], o[2], o[3])(pn(t, 1, n, i));
    }
    return a;
  }
  static parse(e, t) {
    let [n, i, a, ...o] = e;
    if (!Array.isArray(i) || i.length === 0) return t.error("Expected an interpolation type expression.", 1);
    if (i[0] === "linear") i = { name: "linear" };
    else if (i[0] === "exponential") {
      const u = i[1];
      if (typeof u != "number") return t.error("Exponential interpolation requires a numeric base.", 1, 1);
      i = {
        name: "exponential",
        base: u
      };
    } else if (i[0] === "cubic-bezier") {
      const u = i.slice(1);
      if (u.length !== 4 || u.some((c) => typeof c != "number" || c < 0 || c > 1)) return t.error("Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.", 1);
      i = {
        name: "cubic-bezier",
        controlPoints: u
      };
    } else return t.error(`Unknown interpolation type ${String(i[0])}`, 1, 0);
    if (e.length - 1 < 4) return t.error(`Expected at least 4 arguments, but found only ${e.length - 1}.`);
    if ((e.length - 1) % 2 !== 0) return t.error("Expected an even number of arguments.");
    if (a = t.parse(a, 2, S), !a) return null;
    const s = [];
    let l = null;
    (n === "interpolate-hcl" || n === "interpolate-lab") && t.expectedType != Pt ? l = be : t.expectedType && t.expectedType.kind !== "value" && (l = t.expectedType);
    for (let u = 0; u < o.length; u += 2) {
      const c = o[u], p = o[u + 1], f = u + 3, d = u + 4;
      if (typeof c != "number") return t.error('Input/output pairs for "interpolate" expressions must be defined using literal numeric values (not computed expressions) for the input values.', f);
      if (s.length && s[s.length - 1][0] >= c) return t.error('Input/output pairs for "interpolate" expressions must be arranged with input values in strictly ascending order.', f);
      const h = t.parse(p, d, l);
      if (!h) return null;
      l = l || h.type, s.push([c, h]);
    }
    return !Ee(l, S) && !Ee(l, zr) && !Ee(l, be) && !Ee(l, $r) && !Ee(l, jr) && !Ee(l, Pt) && !Ee(l, Ur) && !Ee(l, ne(S)) ? t.error(`Type ${j(l)} is not interpolatable.`) : new kn(l, n, i, a, s);
  }
  evaluate(e) {
    const t = this.labels, n = this.outputs;
    if (t.length === 1) return n[0].evaluate(e);
    const i = this.input.evaluate(e);
    if (i <= t[0]) return n[0].evaluate(e);
    const a = t.length;
    if (i >= t[a - 1]) return n[a - 1].evaluate(e);
    const o = Zo(t, i), s = t[o], l = t[o + 1], u = kn.interpolationFactor(this.interpolation, i, s, l), c = n[o].evaluate(e), p = n[o + 1].evaluate(e);
    switch (this.operator) {
      case "interpolate":
        switch (this.type.kind) {
          case "number":
            return Ve(c, p, u);
          case "color":
            return ee.interpolate(c, p, u);
          case "padding":
            return ut.interpolate(c, p, u);
          case "colorArray":
            return Re.interpolate(c, p, u);
          case "numberArray":
            return ct.interpolate(c, p, u);
          case "variableAnchorOffsetCollection":
            return pt.interpolate(c, p, u);
          case "array":
            return Ot(c, p, u);
          case "projectionDefinition":
            return Kt.interpolate(c, p, u);
        }
      case "interpolate-hcl":
        switch (this.type.kind) {
          case "color":
            return ee.interpolate(c, p, u, "hcl");
          case "colorArray":
            return Re.interpolate(c, p, u, "hcl");
        }
      case "interpolate-lab":
        switch (this.type.kind) {
          case "color":
            return ee.interpolate(c, p, u, "lab");
          case "colorArray":
            return Re.interpolate(c, p, u, "lab");
        }
    }
  }
  eachChild(e) {
    e(this.input);
    for (const t of this.outputs) e(t);
  }
  outputDefined() {
    return this.outputs.every((e) => e.outputDefined());
  }
};
function pn(r, e, t, n) {
  const i = n - t, a = r - t;
  return i === 0 ? 0 : e === 1 ? a / i : (Math.pow(e, a) - 1) / (Math.pow(e, i) - 1);
}
var Xo = class In {
  constructor(e, t) {
    this.type = e, this.args = t;
  }
  static parse(e, t) {
    if (e.length < 2) return t.error("Expected at least one argument.");
    let n = null;
    const i = t.expectedType;
    i && i.kind !== "value" && (n = i);
    const a = [];
    for (const o of e.slice(1)) {
      const s = t.parse(o, 1 + a.length, n, void 0, { typeAnnotation: "omit" });
      if (!s) return null;
      n = n || s.type, a.push(s);
    }
    if (!n) throw new Error("No output type");
    return i && a.some((o) => _t(i, o.type)) ? new In(P, a) : new In(n, a);
  }
  evaluate(e) {
    let t = null, n = 0, i;
    for (const a of this.args)
      if (n++, t = a.evaluate(e), t && t instanceof ft && !t.available && (i || (i = t.name), t = null, n === this.args.length && (t = i)), t !== null) break;
    return t;
  }
  eachChild(e) {
    this.args.forEach(e);
  }
  outputDefined() {
    return this.args.every((e) => e.outputDefined());
  }
};
function na(r, e) {
  return r === "==" || r === "!=" ? e.kind === "boolean" || e.kind === "string" || e.kind === "number" || e.kind === "null" || e.kind === "value" : e.kind === "string" || e.kind === "number" || e.kind === "value";
}
function sp(r, e, t) {
  return e === t;
}
function lp(r, e, t) {
  return e !== t;
}
function up(r, e, t) {
  return e < t;
}
function cp(r, e, t) {
  return e > t;
}
function pp(r, e, t) {
  return e <= t;
}
function fp(r, e, t) {
  return e >= t;
}
function Jo(r, e, t, n) {
  return n.compare(e, t) === 0;
}
function dp(r, e, t, n) {
  return !Jo(r, e, t, n);
}
function hp(r, e, t, n) {
  return n.compare(e, t) < 0;
}
function mp(r, e, t, n) {
  return n.compare(e, t) > 0;
}
function yp(r, e, t, n) {
  return n.compare(e, t) <= 0;
}
function gp(r, e, t, n) {
  return n.compare(e, t) >= 0;
}
function dt(r, e, t) {
  const n = r !== "==" && r !== "!=";
  return class Qo {
    constructor(a, o, s) {
      this.type = _, this.lhs = a, this.rhs = o, this.collator = s, this.hasUntypedArgument = a.type.kind === "value" || o.type.kind === "value";
    }
    static parse(a, o) {
      if (a.length !== 3 && a.length !== 4) return o.error("Expected two or three arguments.");
      const s = a[0];
      let l = o.parse(a[1], 1, P);
      if (!l) return null;
      if (!na(s, l.type)) return o.concat(1).error(`"${s}" comparisons are not supported for type '${j(l.type)}'.`);
      let u = o.parse(a[2], 2, P);
      if (!u) return null;
      if (!na(s, u.type)) return o.concat(2).error(`"${s}" comparisons are not supported for type '${j(u.type)}'.`);
      if (l.type.kind !== u.type.kind && l.type.kind !== "value" && u.type.kind !== "value") return o.error(`Cannot compare types '${j(l.type)}' and '${j(u.type)}'.`);
      n && (l.type.kind === "value" && u.type.kind !== "value" ? l = new xe(u.type, [l]) : l.type.kind !== "value" && u.type.kind === "value" && (u = new xe(l.type, [u])));
      let c = null;
      if (a.length === 4) {
        if (l.type.kind !== "string" && u.type.kind !== "string" && l.type.kind !== "value" && u.type.kind !== "value") return o.error("Cannot use collator to compare non-string types.");
        if (c = o.parse(a[3], 3, Dr), !c) return null;
      }
      return new Qo(l, u, c);
    }
    evaluate(a) {
      const o = this.lhs.evaluate(a), s = this.rhs.evaluate(a);
      if (n && this.hasUntypedArgument) {
        const l = K(o), u = K(s);
        if (l.kind !== u.kind || !(l.kind === "string" || l.kind === "number")) throw new q(`Expected arguments for "${r}" to be (string, string) or (number, number), but found (${l.kind}, ${u.kind}) instead.`);
      }
      if (this.collator && !n && this.hasUntypedArgument) {
        const l = K(o), u = K(s);
        if (l.kind !== "string" || u.kind !== "string") return e(a, o, s);
      }
      return this.collator ? t(a, o, s, this.collator.evaluate(a)) : e(a, o, s);
    }
    eachChild(a) {
      a(this.lhs), a(this.rhs), this.collator && a(this.collator);
    }
    outputDefined() {
      return !0;
    }
  };
}
const vp = dt("==", sp, Jo), bp = dt("!=", lp, dp), wp = dt("<", up, hp), Sp = dt(">", cp, mp), xp = dt("<=", pp, yp), Cp = dt(">=", fp, gp);
var es = class ts {
  constructor(e, t, n) {
    this.type = Dr, this.locale = n, this.caseSensitive = e, this.diacriticSensitive = t;
  }
  static parse(e, t) {
    if (e.length !== 2) return t.error("Expected one argument.");
    const n = e[1];
    if (typeof n != "object" || Array.isArray(n)) return t.error("Collator options argument must be an object.");
    const i = t.parse(n["case-sensitive"] === void 0 ? !1 : n["case-sensitive"], 1, _);
    if (!i) return null;
    const a = t.parse(n["diacritic-sensitive"] === void 0 ? !1 : n["diacritic-sensitive"], 1, _);
    if (!a) return null;
    let o = null;
    return n.locale && (o = t.parse(n.locale, 1, I), !o) ? null : new ts(i, a, o);
  }
  evaluate(e) {
    return new ii(this.caseSensitive.evaluate(e), this.diacriticSensitive.evaluate(e), this.locale ? this.locale.evaluate(e) : null);
  }
  eachChild(e) {
    e(this.caseSensitive), e(this.diacriticSensitive), this.locale && e(this.locale);
  }
  outputDefined() {
    return !1;
  }
}, Ap = class rs {
  constructor(e, t, n, i, a, o) {
    this.type = I, this.number = e, this.locale = t, this.currency = n, this.unit = i, this.minFractionDigits = a, this.maxFractionDigits = o;
  }
  static parse(e, t) {
    if (e.length !== 3) return t.error("Expected two arguments.");
    const n = t.parse(e[1], 1, S);
    if (!n) return null;
    const i = e[2];
    if (typeof i != "object" || Array.isArray(i)) return t.error("NumberFormat options argument must be an object.");
    let a = null;
    if (i.locale && (a = t.parse(i.locale, 1, I), !a))
      return null;
    let o = null;
    if (i.currency && (o = t.parse(i.currency, 1, I), !o))
      return null;
    let s = null;
    if (i.unit && (s = t.parse(i.unit, 1, I), !s))
      return null;
    if (o && s) return t.error("NumberFormat options `currency` and `unit` are mutually exclusive");
    let l = null;
    if (i["min-fraction-digits"] && (l = t.parse(i["min-fraction-digits"], 1, S), !l))
      return null;
    let u = null;
    return i["max-fraction-digits"] && (u = t.parse(i["max-fraction-digits"], 1, S), !u) ? null : new rs(n, a, o, s, l, u);
  }
  evaluate(e) {
    return new Intl.NumberFormat(this.locale ? this.locale.evaluate(e) : [], {
      style: this.currency ? "currency" : this.unit ? "unit" : "decimal",
      currency: this.currency ? this.currency.evaluate(e) : void 0,
      unit: this.unit ? this.unit.evaluate(e) : void 0,
      minimumFractionDigits: this.minFractionDigits ? this.minFractionDigits.evaluate(e) : void 0,
      maximumFractionDigits: this.maxFractionDigits ? this.maxFractionDigits.evaluate(e) : void 0
    }).format(this.number.evaluate(e));
  }
  eachChild(e) {
    e(this.number), this.locale && e(this.locale), this.currency && e(this.currency), this.unit && e(this.unit), this.minFractionDigits && e(this.minFractionDigits), this.maxFractionDigits && e(this.maxFractionDigits);
  }
  outputDefined() {
    return !1;
  }
}, Lp = class ns {
  constructor(e) {
    this.type = Nr, this.sections = e;
  }
  static parse(e, t) {
    if (e.length < 2) return t.error("Expected at least one argument.");
    const n = e[1];
    if (!Array.isArray(n) && typeof n == "object") return t.error("First argument must be an image or text section.");
    const i = [];
    let a = !1;
    for (let o = 1; o <= e.length - 1; ++o) {
      const s = e[o];
      if (a && typeof s == "object" && !Array.isArray(s)) {
        a = !1;
        let l = null;
        if (s["font-scale"] && (l = t.parse(s["font-scale"], 1, S), !l))
          return null;
        let u = null;
        if (s["text-font"] && (u = t.parse(s["text-font"], 1, ne(I)), !u))
          return null;
        let c = null;
        if (s["text-color"] && (c = t.parse(s["text-color"], 1, be), !c))
          return null;
        let p = null;
        if (s["vertical-align"]) {
          if (typeof s["vertical-align"] == "string" && !Xc.includes(s["vertical-align"])) return t.error(`'vertical-align' must be one of: 'bottom', 'center', 'top' but found '${s["vertical-align"]}' instead.`);
          if (p = t.parse(s["vertical-align"], 1, I), !p) return null;
        }
        const f = i[i.length - 1];
        f.scale = l, f.font = u, f.textColor = c, f.verticalAlign = p;
      } else {
        const l = t.parse(e[o], 1, P);
        if (!l) return null;
        const u = l.type.kind;
        if (u !== "string" && u !== "value" && u !== "null" && u !== "resolvedImage") return t.error("Formatted text type must be 'string', 'value', 'image' or 'null'.");
        a = !0, i.push({
          content: l,
          scale: null,
          font: null,
          textColor: null,
          verticalAlign: null
        });
      }
    }
    return new ns(i);
  }
  evaluate(e) {
    const t = (n) => {
      const i = n.content.evaluate(e);
      return K(i) === Gt ? new Ln("", i, null, null, null, n.verticalAlign ? n.verticalAlign.evaluate(e) : null) : new Ln(It(i), null, n.scale ? n.scale.evaluate(e) : null, n.font ? n.font.evaluate(e).join(",") : null, n.textColor ? n.textColor.evaluate(e) : null, n.verticalAlign ? n.verticalAlign.evaluate(e) : null);
    };
    return new Ht(this.sections.map(t));
  }
  eachChild(e) {
    for (const t of this.sections)
      e(t.content), t.scale && e(t.scale), t.font && e(t.font), t.textColor && e(t.textColor), t.verticalAlign && e(t.verticalAlign);
  }
  outputDefined() {
    return !1;
  }
}, Ep = class is {
  constructor(e) {
    this.type = Gt, this.input = e;
  }
  static parse(e, t) {
    if (e.length !== 2) return t.error("Expected two arguments.");
    const n = t.parse(e[1], 1, I);
    return n ? new is(n) : t.error("No image name provided.");
  }
  evaluate(e) {
    const t = this.input.evaluate(e), n = ft.fromString(t);
    return n && e.availableImages && (n.available = e.availableImages.indexOf(t) > -1), n;
  }
  eachChild(e) {
    e(this.input);
  }
  outputDefined() {
    return !1;
  }
}, Tp = class as {
  constructor(e) {
    this.type = S, this.input = e;
  }
  static parse(e, t) {
    if (e.length !== 2) return t.error(`Expected 1 argument, but found ${e.length - 1} instead.`);
    const n = t.parse(e[1], 1);
    return n ? n.type.kind !== "array" && n.type.kind !== "string" && n.type.kind !== "value" ? t.error(`Expected argument of type string or array, but found ${j(n.type)} instead.`) : new as(n) : null;
  }
  evaluate(e) {
    const t = this.input.evaluate(e);
    if (typeof t == "string") return [...t].length;
    if (Array.isArray(t)) return t.length;
    throw new q(`Expected value to be of type string or array, but found ${j(K(t))} instead.`);
  }
  eachChild(e) {
    e(this.input);
  }
  outputDefined() {
    return !1;
  }
};
const we = 8192;
function kp(r, e) {
  const t = Ip(r[0]), n = Pp(r[1]), i = Math.pow(2, e.z);
  return [Math.round(t * i * we), Math.round(n * i * we)];
}
function ai(r, e) {
  const t = Math.pow(2, e.z), n = (r[0] / we + e.x) / t, i = (r[1] / we + e.y) / t;
  return [Mp(n), _p(i)];
}
function Ip(r) {
  return (180 + r) / 360;
}
function Mp(r) {
  return r * 360 - 180;
}
function Pp(r) {
  return (180 - 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + r * Math.PI / 360))) / 360;
}
function _p(r) {
  return 360 / Math.PI * Math.atan(Math.exp((180 - r * 360) * Math.PI / 180)) - 90;
}
function Zt(r, e) {
  r[0] = Math.min(r[0], e[0]), r[1] = Math.min(r[1], e[1]), r[2] = Math.max(r[2], e[0]), r[3] = Math.max(r[3], e[1]);
}
function Ft(r, e) {
  return !(r[0] <= e[0] || r[2] >= e[2] || r[1] <= e[1] || r[3] >= e[3]);
}
function Op(r, e, t) {
  return e[1] > r[1] != t[1] > r[1] && r[0] < (t[0] - e[0]) * (r[1] - e[1]) / (t[1] - e[1]) + e[0];
}
function Rp(r, e, t) {
  const n = r[0] - e[0], i = r[1] - e[1], a = r[0] - t[0], o = r[1] - t[1];
  return n * o - a * i === 0 && n * a <= 0 && i * o <= 0;
}
function Br(r, e, t, n) {
  const i = [e[0] - r[0], e[1] - r[1]];
  return Np([n[0] - t[0], n[1] - t[1]], i) === 0 ? !1 : !!(ia(r, e, t, n) && ia(t, n, r, e));
}
function Fp(r, e, t) {
  for (const n of t) for (let i = 0; i < n.length - 1; ++i) if (Br(r, e, n[i], n[i + 1])) return !0;
  return !1;
}
function ht(r, e, t = !1) {
  let n = !1;
  for (const i of e) for (let a = 0; a < i.length - 1; a++) {
    if (Rp(r, i[a], i[a + 1])) return t;
    Op(r, i[a], i[a + 1]) && (n = !n);
  }
  return n;
}
function zp(r, e) {
  for (const t of e) if (ht(r, t)) return !0;
  return !1;
}
function os(r, e) {
  for (const t of r) if (!ht(t, e)) return !1;
  for (let t = 0; t < r.length - 1; ++t) if (Fp(r[t], r[t + 1], e)) return !1;
  return !0;
}
function Dp(r, e) {
  for (const t of e) if (os(r, t)) return !0;
  return !1;
}
function Np(r, e) {
  return r[0] * e[1] - r[1] * e[0];
}
function ia(r, e, t, n) {
  const i = r[0] - t[0], a = r[1] - t[1], o = e[0] - t[0], s = e[1] - t[1], l = n[0] - t[0], u = n[1] - t[1], c = i * u - l * a, p = o * u - l * s;
  return c > 0 && p < 0 || c < 0 && p > 0;
}
function oi(r, e, t) {
  const n = [];
  for (let i = 0; i < r.length; i++) {
    const a = [];
    for (let o = 0; o < r[i].length; o++) {
      const s = kp(r[i][o], t);
      Zt(e, s), a.push(s);
    }
    n.push(a);
  }
  return n;
}
function ss(r, e, t) {
  const n = [];
  for (let i = 0; i < r.length; i++) {
    const a = oi(r[i], e, t);
    n.push(a);
  }
  return n;
}
function ls(r, e, t, n) {
  if (r[0] < t[0] || r[0] > t[2]) {
    const i = n * 0.5;
    let a = r[0] - t[0] > i ? -n : t[0] - r[0] > i ? n : 0;
    a === 0 && (a = r[0] - t[2] > i ? -n : t[2] - r[0] > i ? n : 0), r[0] += a;
  }
  Zt(e, r);
}
function $p(r) {
  r[0] = r[1] = 1 / 0, r[2] = r[3] = -1 / 0;
}
function aa(r, e, t, n) {
  const i = Math.pow(2, n.z) * we, a = [n.x * we, n.y * we], o = [];
  for (const s of r) for (const l of s) {
    const u = [l.x + a[0], l.y + a[1]];
    ls(u, e, t, i), o.push(u);
  }
  return o;
}
function oa(r, e, t, n) {
  const i = Math.pow(2, n.z) * we, a = [n.x * we, n.y * we], o = [];
  for (const s of r) {
    const l = [];
    for (const u of s) {
      const c = [u.x + a[0], u.y + a[1]];
      Zt(e, c), l.push(c);
    }
    o.push(l);
  }
  if (e[2] - e[0] <= i / 2) {
    $p(e);
    for (const s of o) for (const l of s) ls(l, e, t, i);
  }
  return o;
}
function jp(r, e) {
  const t = [
    1 / 0,
    1 / 0,
    -1 / 0,
    -1 / 0
  ], n = [
    1 / 0,
    1 / 0,
    -1 / 0,
    -1 / 0
  ], i = r.canonicalID();
  if (e.type === "Polygon") {
    const a = oi(e.coordinates, n, i), o = aa(r.geometry(), t, n, i);
    if (!Ft(t, n)) return !1;
    for (const s of o) if (!ht(s, a)) return !1;
  }
  if (e.type === "MultiPolygon") {
    const a = ss(e.coordinates, n, i), o = aa(r.geometry(), t, n, i);
    if (!Ft(t, n)) return !1;
    for (const s of o) if (!zp(s, a)) return !1;
  }
  return !0;
}
function Up(r, e) {
  const t = [
    1 / 0,
    1 / 0,
    -1 / 0,
    -1 / 0
  ], n = [
    1 / 0,
    1 / 0,
    -1 / 0,
    -1 / 0
  ], i = r.canonicalID();
  if (e.type === "Polygon") {
    const a = oi(e.coordinates, n, i), o = oa(r.geometry(), t, n, i);
    if (!Ft(t, n)) return !1;
    for (const s of o) if (!os(s, a)) return !1;
  }
  if (e.type === "MultiPolygon") {
    const a = ss(e.coordinates, n, i), o = oa(r.geometry(), t, n, i);
    if (!Ft(t, n)) return !1;
    for (const s of o) if (!Dp(s, a)) return !1;
  }
  return !0;
}
var si = class yr {
  constructor(e, t) {
    this.type = _, this.geojson = e, this.geometries = t;
  }
  static parse(e, t) {
    if (e.length !== 2) return t.error(`'within' expression requires exactly one argument, but found ${e.length - 1} instead.`);
    if (Rt(e[1])) {
      const n = e[1];
      if (n.type === "FeatureCollection") {
        const i = [];
        for (const a of n.features) {
          const { type: o, coordinates: s } = a.geometry;
          o === "Polygon" && i.push(s), o === "MultiPolygon" && i.push(...s);
        }
        if (i.length) return new yr(n, {
          type: "MultiPolygon",
          coordinates: i
        });
      } else if (n.type === "Feature") {
        const i = n.geometry.type;
        if (i === "Polygon" || i === "MultiPolygon") return new yr(n, n.geometry);
      } else if (n.type === "Polygon" || n.type === "MultiPolygon") return new yr(n, n);
    }
    return t.error("'within' expression requires valid geojson object that contains polygon geometry type.");
  }
  evaluate(e) {
    if (e.geometry() != null && e.canonicalID() != null) {
      if (e.geometryType() === "Point") return jp(e, this.geometries);
      if (e.geometryType() === "LineString") return Up(e, this.geometries);
    }
    return !1;
  }
  eachChild() {
  }
  outputDefined() {
    return !0;
  }
}, us = class {
  constructor(r = [], e = (t, n) => t < n ? -1 : t > n ? 1 : 0) {
    if (this.data = r, this.length = this.data.length, this.compare = e, this.length > 0) for (let t = (this.length >> 1) - 1; t >= 0; t--) this._down(t);
  }
  push(r) {
    this.data.push(r), this._up(this.length++);
  }
  pop() {
    if (this.length === 0) return;
    const r = this.data[0], e = this.data.pop();
    return --this.length > 0 && (this.data[0] = e, this._down(0)), r;
  }
  peek() {
    return this.data[0];
  }
  _up(r) {
    const { data: e, compare: t } = this, n = e[r];
    for (; r > 0; ) {
      const i = r - 1 >> 1, a = e[i];
      if (t(n, a) >= 0) break;
      e[r] = a, r = i;
    }
    e[r] = n;
  }
  _down(r) {
    const { data: e, compare: t } = this, n = this.length >> 1, i = e[r];
    for (; r < n; ) {
      let a = (r << 1) + 1;
      const o = a + 1;
      if (o < this.length && t(e[o], e[a]) < 0 && (a = o), t(e[a], i) >= 0) break;
      e[r] = e[a], r = a;
    }
    e[r] = i;
  }
};
function Bp(r, e) {
  if (r.length <= 1) return [r];
  const t = [];
  let n, i;
  for (const a of r) {
    const o = Vp(a);
    o !== 0 && (a.area = Math.abs(o), i === void 0 && (i = o < 0), i === o < 0 ? (n && t.push(n), n = [a]) : n.push(a));
  }
  return n && t.push(n), t;
}
function Vp(r) {
  let e = 0;
  for (let t = 0, n = r.length, i = n - 1, a, o; t < n; i = t++)
    a = r[t], o = r[i], e += (o.x - a.x) * (a.y + o.y);
  return e;
}
const qp = 6378.137, sa = 1 / 298.257223563, la = sa * (2 - sa), ua = Math.PI / 180;
var li = class {
  constructor(r) {
    const e = ua * qp * 1e3, t = Math.cos(r * ua), n = 1 / (1 - la * (1 - t * t)), i = Math.sqrt(n);
    this.kx = e * i * t, this.ky = e * i * n * (1 - la);
  }
  /**
  * Given two points of the form [longitude, latitude], returns the distance.
  *
  * @param a - point [longitude, latitude]
  * @param b - point [longitude, latitude]
  * @returns distance
  * @example
  * const distance = ruler.distance([30.5, 50.5], [30.51, 50.49]);
  * //=distance
  */
  distance(r, e) {
    const t = this.wrap(r[0] - e[0]) * this.kx, n = (r[1] - e[1]) * this.ky;
    return Math.sqrt(t * t + n * n);
  }
  /**
  * Returns an object of the form {point, index, t}, where point is closest point on the line
  * from the given point, index is the start index of the segment with the closest point,
  * and t is a parameter from 0 to 1 that indicates where the closest point is on that segment.
  *
  * @param line - an array of points that form the line
  * @param p - point [longitude, latitude]
  * @returns the nearest point, its index in the array and the proportion along the line
  * @example
  * const point = ruler.pointOnLine(line, [-67.04, 50.5]).point;
  * //=point
  */
  pointOnLine(r, e) {
    let t = 1 / 0, n, i, a, o;
    for (let s = 0; s < r.length - 1; s++) {
      let l = r[s][0], u = r[s][1], c = this.wrap(r[s + 1][0] - l) * this.kx, p = (r[s + 1][1] - u) * this.ky, f = 0;
      (c !== 0 || p !== 0) && (f = (this.wrap(e[0] - l) * this.kx * c + (e[1] - u) * this.ky * p) / (c * c + p * p), f > 1 ? (l = r[s + 1][0], u = r[s + 1][1]) : f > 0 && (l += c / this.kx * f, u += p / this.ky * f)), c = this.wrap(e[0] - l) * this.kx, p = (e[1] - u) * this.ky;
      const d = c * c + p * p;
      d < t && (t = d, n = l, i = u, a = s, o = f);
    }
    return {
      point: [n, i],
      index: a,
      t: Math.max(0, Math.min(1, o))
    };
  }
  wrap(r) {
    for (; r < -180; ) r += 360;
    for (; r > 180; ) r -= 360;
    return r;
  }
};
const Mn = 100, Pn = 50;
function cs(r, e) {
  return e[0] - r[0];
}
function Er(r) {
  return r[1] - r[0] + 1;
}
function Ae(r, e) {
  return r[1] >= r[0] && r[1] < e;
}
function _n(r, e) {
  if (r[0] > r[1]) return [null, null];
  const t = Er(r);
  if (e) {
    if (t === 2) return [r, null];
    const i = Math.floor(t / 2);
    return [[r[0], r[0] + i], [r[0] + i, r[1]]];
  }
  if (t === 1) return [r, null];
  const n = Math.floor(t / 2) - 1;
  return [[r[0], r[0] + n], [r[0] + n + 1, r[1]]];
}
function On(r, e) {
  if (!Ae(e, r.length)) return [
    1 / 0,
    1 / 0,
    -1 / 0,
    -1 / 0
  ];
  const t = [
    1 / 0,
    1 / 0,
    -1 / 0,
    -1 / 0
  ];
  for (let n = e[0]; n <= e[1]; ++n) Zt(t, r[n]);
  return t;
}
function Rn(r) {
  const e = [
    1 / 0,
    1 / 0,
    -1 / 0,
    -1 / 0
  ];
  for (const t of r) for (const n of t) Zt(e, n);
  return e;
}
function ca(r) {
  return r[0] !== -1 / 0 && r[1] !== -1 / 0 && r[2] !== 1 / 0 && r[3] !== 1 / 0;
}
function ui(r, e, t) {
  if (!ca(r) || !ca(e)) return NaN;
  let n = 0, i = 0;
  return r[2] < e[0] && (n = e[0] - r[2]), r[0] > e[2] && (n = r[0] - e[2]), r[1] > e[3] && (i = r[1] - e[3]), r[3] < e[1] && (i = e[1] - r[3]), t.distance([0, 0], [n, i]);
}
function je(r, e, t) {
  const n = t.pointOnLine(e, r);
  return t.distance(r, n.point);
}
function ci(r, e, t, n, i) {
  const a = Math.min(je(r, [t, n], i), je(e, [t, n], i)), o = Math.min(je(t, [r, e], i), je(n, [r, e], i));
  return Math.min(a, o);
}
function Gp(r, e, t, n, i) {
  if (!(Ae(e, r.length) && Ae(n, t.length))) return 1 / 0;
  let a = 1 / 0;
  for (let o = e[0]; o < e[1]; ++o) {
    const s = r[o], l = r[o + 1];
    for (let u = n[0]; u < n[1]; ++u) {
      const c = t[u], p = t[u + 1];
      if (Br(s, l, c, p)) return 0;
      a = Math.min(a, ci(s, l, c, p, i));
    }
  }
  return a;
}
function Hp(r, e, t, n, i) {
  if (!(Ae(e, r.length) && Ae(n, t.length))) return NaN;
  let a = 1 / 0;
  for (let o = e[0]; o <= e[1]; ++o) for (let s = n[0]; s <= n[1]; ++s)
    if (a = Math.min(a, i.distance(r[o], t[s])), a === 0) return a;
  return a;
}
function Kp(r, e, t) {
  if (ht(r, e, !0)) return 0;
  let n = 1 / 0;
  for (const i of e) {
    const a = i[0], o = i[i.length - 1];
    if (a !== o && (n = Math.min(n, je(r, [o, a], t)), n === 0))
      return n;
    const s = t.pointOnLine(i, r);
    if (n = Math.min(n, t.distance(r, s.point)), n === 0) return n;
  }
  return n;
}
function Zp(r, e, t, n) {
  if (!Ae(e, r.length)) return NaN;
  for (let a = e[0]; a <= e[1]; ++a) if (ht(r[a], t, !0)) return 0;
  let i = 1 / 0;
  for (let a = e[0]; a < e[1]; ++a) {
    const o = r[a], s = r[a + 1];
    for (const l of t) for (let u = 0, c = l.length, p = c - 1; u < c; p = u++) {
      const f = l[p], d = l[u];
      if (Br(o, s, f, d)) return 0;
      i = Math.min(i, ci(o, s, f, d, n));
    }
  }
  return i;
}
function pa(r, e) {
  for (const t of r) for (const n of t) if (ht(n, e, !0)) return !0;
  return !1;
}
function Wp(r, e, t, n = 1 / 0) {
  const i = Rn(r), a = Rn(e);
  if (n !== 1 / 0 && ui(i, a, t) >= n) return n;
  if (Ft(i, a)) {
    if (pa(r, e)) return 0;
  } else if (pa(e, r)) return 0;
  let o = 1 / 0;
  for (const s of r) for (let l = 0, u = s.length, c = u - 1; l < u; c = l++) {
    const p = s[c], f = s[l];
    for (const d of e) for (let h = 0, m = d.length, g = m - 1; h < m; g = h++) {
      const v = d[g], b = d[h];
      if (Br(p, f, v, b)) return 0;
      o = Math.min(o, ci(p, f, v, b, t));
    }
  }
  return o;
}
function fa(r, e, t, n, i, a) {
  if (!a) return;
  const o = ui(On(n, a), i, t);
  o < e && r.push([
    o,
    a,
    [0, 0]
  ]);
}
function nr(r, e, t, n, i, a, o) {
  if (!a || !o) return;
  const s = ui(On(n, a), On(i, o), t);
  s < e && r.push([
    s,
    a,
    o
  ]);
}
function Tr(r, e, t, n, i = 1 / 0) {
  let a = Math.min(n.distance(r[0], t[0][0]), i);
  if (a === 0) return a;
  const o = new us([[
    0,
    [0, r.length - 1],
    [0, 0]
  ]], cs), s = Rn(t);
  for (; o.length > 0; ) {
    const l = o.pop();
    if (l[0] >= a) continue;
    const u = l[1], c = e ? Pn : Mn;
    if (Er(u) <= c) {
      if (!Ae(u, r.length)) return NaN;
      if (e) {
        const p = Zp(r, u, t, n);
        if (isNaN(p) || p === 0) return p;
        a = Math.min(a, p);
      } else for (let p = u[0]; p <= u[1]; ++p) {
        const f = Kp(r[p], t, n);
        if (a = Math.min(a, f), a === 0) return 0;
      }
    } else {
      const p = _n(u, e);
      fa(o, a, n, r, s, p[0]), fa(o, a, n, r, s, p[1]);
    }
  }
  return a;
}
function kr(r, e, t, n, i, a = 1 / 0) {
  let o = Math.min(a, i.distance(r[0], t[0]));
  if (o === 0) return o;
  const s = new us([[
    0,
    [0, r.length - 1],
    [0, t.length - 1]
  ]], cs);
  for (; s.length > 0; ) {
    const l = s.pop();
    if (l[0] >= o) continue;
    const u = l[1], c = l[2], p = e ? Pn : Mn, f = n ? Pn : Mn;
    if (Er(u) <= p && Er(c) <= f) {
      if (!Ae(u, r.length) && Ae(c, t.length)) return NaN;
      let d;
      if (e && n)
        d = Gp(r, u, t, c, i), o = Math.min(o, d);
      else if (e && !n) {
        const h = r.slice(u[0], u[1] + 1);
        for (let m = c[0]; m <= c[1]; ++m)
          if (d = je(t[m], h, i), o = Math.min(o, d), o === 0) return o;
      } else if (!e && n) {
        const h = t.slice(c[0], c[1] + 1);
        for (let m = u[0]; m <= u[1]; ++m)
          if (d = je(r[m], h, i), o = Math.min(o, d), o === 0) return o;
      } else
        d = Hp(r, u, t, c, i), o = Math.min(o, d);
    } else {
      const d = _n(u, e), h = _n(c, n);
      nr(s, o, i, r, t, d[0], h[0]), nr(s, o, i, r, t, d[0], h[1]), nr(s, o, i, r, t, d[1], h[0]), nr(s, o, i, r, t, d[1], h[1]);
    }
  }
  return o;
}
function Yp(r, e) {
  const t = r.geometry(), n = t.flat().map((o) => ai([o.x, o.y], r.canonical));
  if (t.length === 0) return NaN;
  const i = new li(n[0][1]);
  let a = 1 / 0;
  for (const o of e) {
    switch (o.type) {
      case "Point":
        a = Math.min(a, kr(n, !1, [o.coordinates], !1, i, a));
        break;
      case "LineString":
        a = Math.min(a, kr(n, !1, o.coordinates, !0, i, a));
        break;
      case "Polygon":
        a = Math.min(a, Tr(n, !1, o.coordinates, i, a));
        break;
    }
    if (a === 0) return a;
  }
  return a;
}
function Xp(r, e) {
  const t = r.geometry(), n = t.flat().map((o) => ai([o.x, o.y], r.canonical));
  if (t.length === 0) return NaN;
  const i = new li(n[0][1]);
  let a = 1 / 0;
  for (const o of e) {
    switch (o.type) {
      case "Point":
        a = Math.min(a, kr(n, !0, [o.coordinates], !1, i, a));
        break;
      case "LineString":
        a = Math.min(a, kr(n, !0, o.coordinates, !0, i, a));
        break;
      case "Polygon":
        a = Math.min(a, Tr(n, !0, o.coordinates, i, a));
        break;
    }
    if (a === 0) return a;
  }
  return a;
}
function Jp(r, e) {
  const t = r.geometry();
  if (t.length === 0 || t[0].length === 0) return NaN;
  const n = Bp(t).map((o) => o.map((s) => s.map((l) => ai([l.x, l.y], r.canonical)))), i = new li(n[0][0][0][1]);
  let a = 1 / 0;
  for (const o of e) for (const s of n) {
    switch (o.type) {
      case "Point":
        a = Math.min(a, Tr([o.coordinates], !1, s, i, a));
        break;
      case "LineString":
        a = Math.min(a, Tr(o.coordinates, !0, s, i, a));
        break;
      case "Polygon":
        a = Math.min(a, Wp(s, o.coordinates, i, a));
        break;
    }
    if (a === 0) return a;
  }
  return a;
}
function fn(r) {
  return r.type === "MultiPolygon" ? r.coordinates.map((e) => ({
    type: "Polygon",
    coordinates: e
  })) : r.type === "MultiLineString" ? r.coordinates.map((e) => ({
    type: "LineString",
    coordinates: e
  })) : r.type === "MultiPoint" ? r.coordinates.map((e) => ({
    type: "Point",
    coordinates: e
  })) : [r];
}
var pi = class gr {
  constructor(e, t) {
    this.type = S, this.geojson = e, this.geometries = t;
  }
  static parse(e, t) {
    if (e.length !== 2) return t.error(`'distance' expression requires exactly one argument, but found ${e.length - 1} instead.`);
    if (Rt(e[1])) {
      const n = e[1];
      if (n.type === "FeatureCollection") return new gr(n, n.features.map((i) => fn(i.geometry)).flat());
      if (n.type === "Feature") return new gr(n, fn(n.geometry));
      if ("type" in n && "coordinates" in n) return new gr(n, fn(n));
    }
    return t.error("'distance' expression requires valid geojson object that contains polygon geometry type.");
  }
  evaluate(e) {
    if (e.geometry() != null && e.canonicalID() != null) {
      if (e.geometryType() === "Point") return Yp(e, this.geometries);
      if (e.geometryType() === "LineString") return Xp(e, this.geometries);
      if (e.geometryType() === "Polygon") return Jp(e, this.geometries);
    }
    return NaN;
  }
  eachChild() {
  }
  outputDefined() {
    return !0;
  }
}, fi = class ps {
  constructor(e) {
    this.type = P, this.key = e;
  }
  static parse(e, t) {
    if (e.length !== 2) return t.error(`Expected 1 argument, but found ${e.length - 1} instead.`);
    const n = e[1];
    return n == null ? t.error("Global state property must be defined.") : typeof n != "string" ? t.error(`Global state property must be string, but found ${typeof e[1]} instead.`) : new ps(n);
  }
  evaluate(e) {
    var n;
    const t = (n = e.globals) == null ? void 0 : n.globalState;
    return !t || Object.keys(t).length === 0 ? null : kt(t, this.key) ?? null;
  }
  eachChild() {
  }
  outputDefined() {
    return !1;
  }
};
const di = {
  "==": vp,
  "!=": bp,
  ">": Sp,
  "<": wp,
  ">=": Cp,
  "<=": xp,
  array: xe,
  at: ep,
  boolean: xe,
  case: ip,
  coalesce: Xo,
  collator: es,
  format: Lp,
  image: Ep,
  in: tp,
  "index-of": rp,
  interpolate: qe,
  "interpolate-hcl": qe,
  "interpolate-lab": qe,
  length: Tp,
  let: jo,
  literal: Lr,
  match: np,
  number: xe,
  "number-format": Ap,
  object: xe,
  slice: ap,
  step: Wo,
  string: xe,
  "to-boolean": et,
  "to-color": et,
  "to-number": et,
  "to-string": et,
  var: Bo,
  within: si,
  distance: pi,
  "global-state": fi
};
var mt = class Ct {
  constructor(e, t, n, i) {
    this.name = e, this.type = t, this._evaluate = n, this.args = i;
  }
  evaluate(e) {
    return this._evaluate(e, this.args);
  }
  eachChild(e) {
    this.args.forEach(e);
  }
  outputDefined() {
    return !1;
  }
  static parse(e, t) {
    const n = e[0], i = Ct.definitions[n];
    if (!i) return t.error(`Unknown expression "${n}". If you wanted a literal array, use ["literal", [...]].`, 0);
    const a = Array.isArray(i) ? i[0] : i.type, o = Array.isArray(i) ? [[i[1], i[2]]] : i.overloads, s = o.filter(([u]) => !Array.isArray(u) || u.length === e.length - 1);
    let l = null;
    for (const [u, c] of s) {
      l = new No(t.registry, Ir, t.path, null, t.scope);
      const p = [];
      let f = !1;
      for (let d = 1; d < e.length; d++) {
        const h = e[d], m = Array.isArray(u) ? u[d - 1] : u.type, g = l.parse(h, 1 + p.length, m);
        if (!g) {
          f = !0;
          break;
        }
        p.push(g);
      }
      if (!f) {
        if (Array.isArray(u) && u.length !== p.length) {
          l.error(`Expected ${u.length} arguments, but found ${p.length} instead.`);
          continue;
        }
        for (let d = 0; d < p.length; d++) {
          const h = Array.isArray(u) ? u[d] : u.type, m = p[d];
          l.concat(d + 1).checkSubtype(h, m.type);
        }
        if (l.errors.length === 0) return new Ct(n, a, c, p);
      }
    }
    if (s.length === 1) t.errors.push(...l.errors);
    else {
      const u = (s.length ? s : o).map(([p]) => ef(p)).join(" | "), c = [];
      for (let p = 1; p < e.length; p++) {
        const f = t.parse(e[p], 1 + c.length);
        if (!f) return null;
        c.push(j(f.type));
      }
      t.error(`Expected arguments of type ${u}, but found (${c.join(", ")}) instead.`);
    }
    return null;
  }
  static register(e, t) {
    Ct.definitions = t;
    for (const n in t) e[n] = Ct;
  }
};
function da(r, [e, t, n, i]) {
  e = e.evaluate(r), t = t.evaluate(r), n = n.evaluate(r);
  const a = i ? i.evaluate(r) : 1, o = Oo(e, t, n, a);
  if (o) throw new q(o);
  return new ee(e / 255, t / 255, n / 255, a, !1);
}
function ha(r, e) {
  return r in e;
}
function dn(r, e) {
  const t = e[r];
  return typeof t > "u" ? null : t;
}
function Qp(r, e, t, n) {
  for (; t <= n; ) {
    const i = t + n >> 1;
    if (e[i] === r) return !0;
    e[i] > r ? n = i - 1 : t = i + 1;
  }
  return !1;
}
function Ne(r) {
  return { type: r };
}
mt.register(di, {
  error: [
    jc,
    [I],
    (r, [e]) => {
      throw new q(e.evaluate(r));
    }
  ],
  typeof: [
    I,
    [P],
    (r, [e]) => j(K(e.evaluate(r)))
  ],
  "to-rgba": [
    ne(S, 4),
    [be],
    (r, [e]) => {
      const [t, n, i, a] = e.evaluate(r).rgb;
      return [
        t * 255,
        n * 255,
        i * 255,
        a
      ];
    }
  ],
  rgb: [
    be,
    [
      S,
      S,
      S
    ],
    da
  ],
  rgba: [
    be,
    [
      S,
      S,
      S,
      S
    ],
    da
  ],
  has: {
    type: _,
    overloads: [[[I], (r, [e]) => ha(e.evaluate(r), r.properties())], [[I, Ue], (r, [e, t]) => ha(e.evaluate(r), t.evaluate(r))]]
  },
  get: {
    type: P,
    overloads: [[[I], (r, [e]) => dn(e.evaluate(r), r.properties())], [[I, Ue], (r, [e, t]) => dn(e.evaluate(r), t.evaluate(r))]]
  },
  "feature-state": [
    P,
    [I],
    (r, [e]) => dn(e.evaluate(r), r.featureState || {})
  ],
  properties: [
    Ue,
    [],
    (r) => r.properties()
  ],
  "geometry-type": [
    I,
    [],
    (r) => r.geometryType()
  ],
  id: [
    P,
    [],
    (r) => r.id()
  ],
  zoom: [
    S,
    [],
    (r) => r.globals.zoom
  ],
  "heatmap-density": [
    S,
    [],
    (r) => r.globals.heatmapDensity || 0
  ],
  elevation: [
    S,
    [],
    (r) => r.globals.elevation || 0
  ],
  "line-progress": [
    S,
    [],
    (r) => r.globals.lineProgress || 0
  ],
  accumulated: [
    P,
    [],
    (r) => r.globals.accumulated === void 0 ? null : r.globals.accumulated
  ],
  "+": [
    S,
    Ne(S),
    (r, e) => {
      let t = 0;
      for (const n of e) t += n.evaluate(r);
      return t;
    }
  ],
  "*": [
    S,
    Ne(S),
    (r, e) => {
      let t = 1;
      for (const n of e) t *= n.evaluate(r);
      return t;
    }
  ],
  "-": {
    type: S,
    overloads: [[[S, S], (r, [e, t]) => e.evaluate(r) - t.evaluate(r)], [[S], (r, [e]) => -e.evaluate(r)]]
  },
  "/": [
    S,
    [S, S],
    (r, [e, t]) => e.evaluate(r) / t.evaluate(r)
  ],
  "%": [
    S,
    [S, S],
    (r, [e, t]) => e.evaluate(r) % t.evaluate(r)
  ],
  ln2: [
    S,
    [],
    () => Math.LN2
  ],
  pi: [
    S,
    [],
    () => Math.PI
  ],
  e: [
    S,
    [],
    () => Math.E
  ],
  "^": [
    S,
    [S, S],
    (r, [e, t]) => Math.pow(e.evaluate(r), t.evaluate(r))
  ],
  sqrt: [
    S,
    [S],
    (r, [e]) => Math.sqrt(e.evaluate(r))
  ],
  log10: [
    S,
    [S],
    (r, [e]) => Math.log(e.evaluate(r)) / Math.LN10
  ],
  ln: [
    S,
    [S],
    (r, [e]) => Math.log(e.evaluate(r))
  ],
  log2: [
    S,
    [S],
    (r, [e]) => Math.log(e.evaluate(r)) / Math.LN2
  ],
  sin: [
    S,
    [S],
    (r, [e]) => Math.sin(e.evaluate(r))
  ],
  cos: [
    S,
    [S],
    (r, [e]) => Math.cos(e.evaluate(r))
  ],
  tan: [
    S,
    [S],
    (r, [e]) => Math.tan(e.evaluate(r))
  ],
  asin: [
    S,
    [S],
    (r, [e]) => Math.asin(e.evaluate(r))
  ],
  acos: [
    S,
    [S],
    (r, [e]) => Math.acos(e.evaluate(r))
  ],
  atan: [
    S,
    [S],
    (r, [e]) => Math.atan(e.evaluate(r))
  ],
  min: [
    S,
    Ne(S),
    (r, e) => Math.min(...e.map((t) => t.evaluate(r)))
  ],
  max: [
    S,
    Ne(S),
    (r, e) => Math.max(...e.map((t) => t.evaluate(r)))
  ],
  abs: [
    S,
    [S],
    (r, [e]) => Math.abs(e.evaluate(r))
  ],
  round: [
    S,
    [S],
    (r, [e]) => {
      const t = e.evaluate(r);
      return t < 0 ? -Math.round(-t) : Math.round(t);
    }
  ],
  floor: [
    S,
    [S],
    (r, [e]) => Math.floor(e.evaluate(r))
  ],
  ceil: [
    S,
    [S],
    (r, [e]) => Math.ceil(e.evaluate(r))
  ],
  "filter-==": [
    _,
    [I, P],
    (r, [e, t]) => r.properties()[e.value] === t.value
  ],
  "filter-id-==": [
    _,
    [P],
    (r, [e]) => r.id() === e.value
  ],
  "filter-type-==": [
    _,
    [I],
    (r, [e]) => r.geometryType() === e.value
  ],
  "filter-<": [
    _,
    [I, P],
    (r, [e, t]) => {
      const n = r.properties()[e.value], i = t.value;
      return typeof n == typeof i && n < i;
    }
  ],
  "filter-id-<": [
    _,
    [P],
    (r, [e]) => {
      const t = r.id(), n = e.value;
      return typeof t == typeof n && t < n;
    }
  ],
  "filter->": [
    _,
    [I, P],
    (r, [e, t]) => {
      const n = r.properties()[e.value], i = t.value;
      return typeof n == typeof i && n > i;
    }
  ],
  "filter-id->": [
    _,
    [P],
    (r, [e]) => {
      const t = r.id(), n = e.value;
      return typeof t == typeof n && t > n;
    }
  ],
  "filter-<=": [
    _,
    [I, P],
    (r, [e, t]) => {
      const n = r.properties()[e.value], i = t.value;
      return typeof n == typeof i && n <= i;
    }
  ],
  "filter-id-<=": [
    _,
    [P],
    (r, [e]) => {
      const t = r.id(), n = e.value;
      return typeof t == typeof n && t <= n;
    }
  ],
  "filter->=": [
    _,
    [I, P],
    (r, [e, t]) => {
      const n = r.properties()[e.value], i = t.value;
      return typeof n == typeof i && n >= i;
    }
  ],
  "filter-id->=": [
    _,
    [P],
    (r, [e]) => {
      const t = r.id(), n = e.value;
      return typeof t == typeof n && t >= n;
    }
  ],
  "filter-has": [
    _,
    [P],
    (r, [e]) => e.value in r.properties()
  ],
  "filter-has-id": [
    _,
    [],
    (r) => r.id() !== null && r.id() !== void 0
  ],
  "filter-type-in": [
    _,
    [ne(I)],
    (r, [e]) => e.value.indexOf(r.geometryType()) >= 0
  ],
  "filter-id-in": [
    _,
    [ne(P)],
    (r, [e]) => e.value.indexOf(r.id()) >= 0
  ],
  "filter-in-small": [
    _,
    [I, ne(P)],
    (r, [e, t]) => t.value.indexOf(r.properties()[e.value]) >= 0
  ],
  "filter-in-large": [
    _,
    [I, ne(P)],
    (r, [e, t]) => Qp(r.properties()[e.value], t.value, 0, t.value.length - 1)
  ],
  all: {
    type: _,
    overloads: [[[_, _], (r, [e, t]) => e.evaluate(r) && t.evaluate(r)], [Ne(_), (r, e) => {
      for (const t of e) if (!t.evaluate(r)) return !1;
      return !0;
    }]]
  },
  any: {
    type: _,
    overloads: [[[_, _], (r, [e, t]) => e.evaluate(r) || t.evaluate(r)], [Ne(_), (r, e) => {
      for (const t of e) if (t.evaluate(r)) return !0;
      return !1;
    }]]
  },
  "!": [
    _,
    [_],
    (r, [e]) => !e.evaluate(r)
  ],
  "is-supported-script": [
    _,
    [I],
    (r, [e]) => {
      const t = r.globals && r.globals.isSupportedScript;
      return t ? t(e.evaluate(r)) : !0;
    }
  ],
  upcase: [
    I,
    [I],
    (r, [e]) => e.evaluate(r).toUpperCase()
  ],
  downcase: [
    I,
    [I],
    (r, [e]) => e.evaluate(r).toLowerCase()
  ],
  concat: [
    I,
    Ne(P),
    (r, e) => e.map((t) => It(t.evaluate(r))).join("")
  ],
  split: [
    ne(I),
    [I, I],
    (r, [e, t]) => e.evaluate(r).split(t.evaluate(r))
  ],
  join: [
    I,
    [ne(I), I],
    (r, [e, t]) => e.evaluate(r).join(t.evaluate(r))
  ],
  "resolved-locale": [
    I,
    [Dr],
    (r, [e]) => e.evaluate(r).resolvedLocale()
  ]
});
function ef(r) {
  return Array.isArray(r) ? `(${r.map(j).join(", ")})` : `(${j(r.type)}...)`;
}
function Ir(r) {
  if (r instanceof Bo) return Ir(r.boundExpression);
  if (r instanceof mt && r.name === "error") return !1;
  if (r instanceof es) return !1;
  if (r instanceof si) return !1;
  if (r instanceof pi) return !1;
  if (r instanceof fi) return !1;
  const e = r instanceof et || r instanceof xe;
  let t = !0;
  return r.eachChild((n) => {
    e ? t = t && Ir(n) : t = t && n instanceof Lr;
  }), t ? Vr(r) && qr(r, [
    "zoom",
    "heatmap-density",
    "elevation",
    "line-progress",
    "accumulated",
    "is-supported-script"
  ]) : !1;
}
function Vr(r) {
  if (r instanceof mt) {
    if (r.name === "get" && r.args.length === 1) return !1;
    if (r.name === "feature-state") return !1;
    if (r.name === "has" && r.args.length === 1) return !1;
    if (r.name === "properties" || r.name === "geometry-type" || r.name === "id") return !1;
    if (/^filter-/.test(r.name)) return !1;
  }
  if (r instanceof si || r instanceof pi) return !1;
  let e = !0;
  return r.eachChild((t) => {
    e && !Vr(t) && (e = !1);
  }), e;
}
function zt(r) {
  if (r instanceof mt && r.name === "feature-state")
    return !1;
  let e = !0;
  return r.eachChild((t) => {
    e && !zt(t) && (e = !1);
  }), e;
}
function qr(r, e) {
  if (r instanceof mt && e.indexOf(r.name) >= 0) return !1;
  let t = !0;
  return r.eachChild((n) => {
    t && !qr(n, e) && (t = !1);
  }), t;
}
function Fn(r) {
  return {
    result: "success",
    value: r
  };
}
function Qe(r) {
  return {
    result: "error",
    value: r
  };
}
function Mr(r) {
  return r["property-type"] === "data-driven" || r["property-type"] === "cross-faded-data-driven";
}
function fs(r) {
  return !!r.expression && r.expression.parameters.indexOf("zoom") > -1;
}
function ds(r) {
  return !!r.expression && r.expression.interpolated;
}
function O(r) {
  return r instanceof Number ? "number" : r instanceof String ? "string" : r instanceof Boolean ? "boolean" : Array.isArray(r) ? "array" : r === null ? "null" : typeof r;
}
function hi(r) {
  return typeof r == "object" && r !== null && !Array.isArray(r) && K(r) === Ue;
}
var tf = class {
  constructor(r, e, t) {
    this.expression = r, this._warningHistory = {}, this._evaluator = new Do(), this._defaultValue = e ? af(e) : null, this._enumValues = e && e.type === "enum" ? e.values : null, this._globalState = t;
  }
  evaluateWithoutErrorHandling(r, e, t, n, i, a) {
    return this._globalState && (r = st(r, this._globalState)), this._evaluator.globals = r, this._evaluator.feature = e, this._evaluator.featureState = t, this._evaluator.canonical = n, this._evaluator.availableImages = i || null, this._evaluator.formattedSection = a, this.expression.evaluate(this._evaluator);
  }
  evaluate(r, e, t, n, i, a) {
    this._globalState && (r = st(r, this._globalState)), this._evaluator.globals = r, this._evaluator.feature = e || null, this._evaluator.featureState = t || null, this._evaluator.canonical = n, this._evaluator.availableImages = i || null, this._evaluator.formattedSection = a || null;
    try {
      const o = this.expression.evaluate(this._evaluator);
      if (o == null || typeof o == "number" && o !== o) return this._defaultValue;
      if (this._enumValues && !(o in this._enumValues)) throw new q(`Expected value to be one of ${Object.keys(this._enumValues).map((s) => JSON.stringify(s)).join(", ")}, but found ${JSON.stringify(o)} instead.`);
      return o;
    } catch (o) {
      return this._warningHistory[o.message] || (this._warningHistory[o.message] = !0, typeof console < "u" && console.warn(o.message)), this._defaultValue;
    }
  }
};
function hs(r) {
  return Array.isArray(r) && r.length > 0 && typeof r[0] == "string" && r[0] in di;
}
function ms(r, e, t) {
  const n = new No(di, Ir, [], e ? nf(e) : void 0), i = n.parse(r, void 0, void 0, void 0, e && e.type === "string" ? { typeAnnotation: "coerce" } : void 0);
  return i ? Fn(new tf(i, e, t)) : Qe(n.errors);
}
var ma = class {
  constructor(r, e, t) {
    this.kind = r, this._styleExpression = e, this.isStateDependent = r !== "constant" && !zt(e.expression), this.globalStateRefs = mi(e.expression), this._globalState = t;
  }
  evaluateWithoutErrorHandling(r, e, t, n, i, a) {
    return this._globalState && (r = st(r, this._globalState)), this._styleExpression.evaluateWithoutErrorHandling(r, e, t, n, i, a);
  }
  evaluate(r, e, t, n, i, a) {
    return this._globalState && (r = st(r, this._globalState)), this._styleExpression.evaluate(r, e, t, n, i, a);
  }
}, ya = class {
  constructor(r, e, t, n, i) {
    this.kind = r, this.zoomStops = t, this._styleExpression = e, this.isStateDependent = r !== "camera" && !zt(e.expression), this.globalStateRefs = mi(e.expression), this.interpolationType = n, this._globalState = i;
  }
  evaluateWithoutErrorHandling(r, e, t, n, i, a) {
    return this._globalState && (r = st(r, this._globalState)), this._styleExpression.evaluateWithoutErrorHandling(r, e, t, n, i, a);
  }
  evaluate(r, e, t, n, i, a) {
    return this._globalState && (r = st(r, this._globalState)), this._styleExpression.evaluate(r, e, t, n, i, a);
  }
  interpolationFactor(r, e, t) {
    return this.interpolationType ? qe.interpolationFactor(this.interpolationType, r, e, t) : 0;
  }
};
function rf(r, e, t) {
  const n = ms(r, e, t);
  if (n.result === "error") return n;
  const i = n.value.expression, a = Vr(i);
  if (!a && !Mr(e)) return Qe([new ge("", "data expressions not supported")]);
  const o = qr(i, ["zoom"]);
  if (!o && !fs(e)) return Qe([new ge("", "zoom expressions not supported")]);
  const s = vr(i);
  if (!s && !o) return Qe([new ge("", '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.')]);
  if (s instanceof ge) return Qe([s]);
  if (s instanceof qe && !ds(e)) return Qe([new ge("", '"interpolate" expressions cannot be used with this property')]);
  if (!s) return Fn(a ? new ma("constant", n.value, t) : new ma("source", n.value, t));
  const l = s instanceof qe ? s.interpolation : void 0;
  return Fn(a ? new ya("camera", n.value, s.labels, l, t) : new ya("composite", n.value, s.labels, l, t));
}
function vr(r) {
  let e = null;
  if (r instanceof jo) e = vr(r.result);
  else if (r instanceof Xo) {
    for (const t of r.args)
      if (e = vr(t), e) break;
  } else (r instanceof Wo || r instanceof qe) && r.input instanceof mt && r.input.name === "zoom" && (e = r);
  return e instanceof ge || r.eachChild((t) => {
    const n = vr(t);
    n instanceof ge ? e = n : !e && n ? e = new ge("", '"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.') : e && n && e !== n && (e = new ge("", 'Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.'));
  }), e;
}
function mi(r, e = /* @__PURE__ */ new Set()) {
  return r instanceof fi && e.add(r.key), r.eachChild((t) => {
    mi(t, e);
  }), e;
}
function nf(r) {
  const e = {
    color: be,
    string: I,
    number: S,
    enum: I,
    boolean: _,
    formatted: Nr,
    padding: $r,
    numberArray: jr,
    colorArray: Pt,
    projectionDefinition: zr,
    resolvedImage: Gt,
    variableAnchorOffsetCollection: Ur
  };
  return r.type === "array" ? ne(e[r.value] || P, r.length) : e[r.type];
}
function af(r) {
  if (r.type === "color" && hi(r.default)) return new ee(0, 0, 0, 0);
  switch (r.type) {
    case "color":
      return ee.parse(r.default) || null;
    case "padding":
      return ut.parse(r.default) || null;
    case "numberArray":
      return ct.parse(r.default) || null;
    case "colorArray":
      return Re.parse(r.default) || null;
    case "variableAnchorOffsetCollection":
      return pt.parse(r.default) || null;
    case "projectionDefinition":
      return Kt.parse(r.default) || null;
    default:
      return r.default === void 0 ? null : r.default;
  }
}
function st(r, e) {
  const { zoom: t, heatmapDensity: n, elevation: i, lineProgress: a, isSupportedScript: o, accumulated: s } = r ?? {};
  return {
    zoom: t,
    heatmapDensity: n,
    elevation: i,
    lineProgress: a,
    isSupportedScript: o,
    accumulated: s,
    globalState: e
  };
}
function ys(r) {
  if (r === !0 || r === !1) return !0;
  if (!Array.isArray(r) || r.length === 0) return !1;
  switch (r[0]) {
    case "has":
      return r.length >= 2 && r[1] !== "$id" && r[1] !== "$type";
    case "in":
      return r.length >= 3 && (typeof r[1] != "string" || Array.isArray(r[2]));
    case "!in":
    case "!has":
    case "none":
      return !1;
    case "==":
    case "!=":
    case ">":
    case ">=":
    case "<":
    case "<=":
      return r.length !== 3 || Array.isArray(r[1]) || Array.isArray(r[2]);
    case "any":
    case "all":
      for (const e of r.slice(1)) if (!ys(e) && typeof e != "boolean") return !1;
      return !0;
    default:
      return !0;
  }
}
function gs(r) {
  const e = r.key, t = r.value;
  return t ? [new w(e, t, "constants have been deprecated as of v8")] : [];
}
function G(r) {
  return r instanceof Number || r instanceof String || r instanceof Boolean ? r.valueOf() : r;
}
function He(r) {
  if (Array.isArray(r)) return r.map(He);
  if (r instanceof Object && !(r instanceof Number || r instanceof String || r instanceof Boolean)) {
    const e = {};
    for (const t in r) e[t] = He(r[t]);
    return e;
  }
  return G(r);
}
function ce(r) {
  const e = r.key, t = r.value, n = r.valueSpec || {}, i = r.objectElementValidators || {}, a = r.style, o = r.styleSpec, s = r.validateSpec;
  let l = [];
  const u = O(t);
  if (u !== "object") return [new w(e, t, `object expected, ${u} found`)];
  for (const c in t) {
    const p = c.split(".")[0], f = kt(n, p) || n["*"];
    let d;
    if (kt(i, p)) d = i[p];
    else if (kt(n, p)) {
      if (t[c] === void 0) continue;
      d = s;
    } else if (i["*"]) d = i["*"];
    else if (n["*"]) d = s;
    else {
      l.push(new w(e, t[c], `unknown property "${c}"`));
      continue;
    }
    l = l.concat(d({
      key: (e && `${e}.`) + c,
      value: t[c],
      valueSpec: f,
      style: a,
      styleSpec: o,
      object: t,
      objectKey: c,
      validateSpec: s
    }, t));
  }
  for (const c in n)
    i[c] || n[c].required && n[c].default === void 0 && t[c] === void 0 && l.push(new w(e, t, `missing required property "${c}"`));
  return l;
}
function yi(r) {
  const e = r.value, t = r.valueSpec, n = r.validateSpec, i = r.style, a = r.styleSpec, o = r.key, s = r.arrayElementValidator || n;
  if (O(e) !== "array") return [new w(o, e, `array expected, ${O(e)} found`)];
  if (t.length && e.length !== t.length) return [new w(o, e, `array length ${t.length} expected, length ${e.length} found`)];
  let l = {
    type: t.value,
    values: t.values
  };
  a.$version < 7 && (l.function = t.function), O(t.value) === "object" && (l = t.value);
  let u = [];
  for (let c = 0; c < e.length; c++) u = u.concat(s({
    array: e,
    arrayIndex: c,
    value: e[c],
    valueSpec: l,
    validateSpec: r.validateSpec,
    style: i,
    styleSpec: a,
    key: `${o}[${c}]`
  }));
  return u;
}
function Gr(r) {
  const e = r.key, t = r.value, n = r.valueSpec;
  let i = O(t);
  return i === "number" && t !== t && (i = "NaN"), i !== "number" ? [new w(e, t, `number expected, ${i} found`)] : "minimum" in n && t < n.minimum ? [new w(e, t, `${t} is less than the minimum value ${n.minimum}`)] : "maximum" in n && t > n.maximum ? [new w(e, t, `${t} is greater than the maximum value ${n.maximum}`)] : [];
}
function vs(r) {
  const e = r.valueSpec, t = G(r.value.type);
  let n, i = {}, a, o;
  const s = t !== "categorical" && r.value.property === void 0, l = !s, u = O(r.value.stops) === "array" && O(r.value.stops[0]) === "array" && O(r.value.stops[0][0]) === "object", c = ce({
    key: r.key,
    value: r.value,
    valueSpec: r.styleSpec.function,
    validateSpec: r.validateSpec,
    style: r.style,
    styleSpec: r.styleSpec,
    objectElementValidators: {
      stops: p,
      default: h
    }
  });
  return t === "identity" && s && c.push(new w(r.key, r.value, 'missing required property "property"')), t !== "identity" && !r.value.stops && c.push(new w(r.key, r.value, 'missing required property "stops"')), t === "exponential" && r.valueSpec.expression && !ds(r.valueSpec) && c.push(new w(r.key, r.value, "exponential functions not supported")), r.styleSpec.$version >= 8 && (l && !Mr(r.valueSpec) ? c.push(new w(r.key, r.value, "property functions not supported")) : s && !fs(r.valueSpec) && c.push(new w(r.key, r.value, "zoom functions not supported"))), (t === "categorical" || u) && r.value.property === void 0 && c.push(new w(r.key, r.value, '"property" property is required')), c;
  function p(m) {
    if (t === "identity") return [new w(m.key, m.value, 'identity function may not have a "stops" property')];
    let g = [];
    const v = m.value;
    return g = g.concat(yi({
      key: m.key,
      value: v,
      valueSpec: m.valueSpec,
      validateSpec: m.validateSpec,
      style: m.style,
      styleSpec: m.styleSpec,
      arrayElementValidator: f
    })), O(v) === "array" && v.length === 0 && g.push(new w(m.key, v, "array must have at least one stop")), g;
  }
  function f(m) {
    let g = [];
    const v = m.value, b = m.key;
    if (O(v) !== "array") return [new w(b, v, `array expected, ${O(v)} found`)];
    if (v.length !== 2) return [new w(b, v, `array length 2 expected, length ${v.length} found`)];
    if (u) {
      if (O(v[0]) !== "object") return [new w(b, v, `object expected, ${O(v[0])} found`)];
      if (v[0].zoom === void 0) return [new w(b, v, "object stop key must have zoom")];
      if (v[0].value === void 0) return [new w(b, v, "object stop key must have value")];
      if (o && o > G(v[0].zoom)) return [new w(b, v[0].zoom, "stop zoom values must appear in ascending order")];
      G(v[0].zoom) !== o && (o = G(v[0].zoom), a = void 0, i = {}), g = g.concat(ce({
        key: `${b}[0]`,
        value: v[0],
        valueSpec: { zoom: {} },
        validateSpec: m.validateSpec,
        style: m.style,
        styleSpec: m.styleSpec,
        objectElementValidators: {
          zoom: Gr,
          value: d
        }
      }));
    } else g = g.concat(d({
      key: `${b}[0]`,
      value: v[0],
      validateSpec: m.validateSpec,
      style: m.style,
      styleSpec: m.styleSpec
    }, v));
    return hs(He(v[1])) ? g.concat([new w(`${b}[1]`, v[1], "expressions are not allowed in function stops.")]) : g.concat(m.validateSpec({
      key: `${b}[1]`,
      value: v[1],
      valueSpec: e,
      validateSpec: m.validateSpec,
      style: m.style,
      styleSpec: m.styleSpec
    }));
  }
  function d(m, g) {
    const v = O(m.value), b = G(m.value), x = m.value !== null ? m.value : g;
    if (!n) n = v;
    else if (v !== n) return [new w(m.key, x, `${v} stop domain type must match previous stop domain type ${n}`)];
    if (v !== "number" && v !== "string" && v !== "boolean") return [new w(m.key, x, "stop domain value must be a number, string, or boolean")];
    if (v !== "number" && t !== "categorical") {
      let k = `number expected, ${v} found`;
      return Mr(e) && t === void 0 && (k += '\nIf you intended to use a categorical function, specify `"type": "categorical"`.'), [new w(m.key, x, k)];
    }
    return t === "categorical" && v === "number" && (!isFinite(b) || Math.floor(b) !== b) ? [new w(m.key, x, `integer expected, found ${b}`)] : t !== "categorical" && v === "number" && a !== void 0 && b < a ? [new w(m.key, x, "stop domain values must appear in ascending order")] : (a = b, t === "categorical" && b in i ? [new w(m.key, x, "stop domain values must be unique")] : (i[b] = !0, []));
  }
  function h(m) {
    return m.validateSpec({
      key: m.key,
      value: m.value,
      valueSpec: e,
      validateSpec: m.validateSpec,
      style: m.style,
      styleSpec: m.styleSpec
    });
  }
}
function lt(r) {
  const e = (r.expressionContext === "property" ? rf : ms)(He(r.value), r.valueSpec);
  if (e.result === "error") return e.value.map((n) => new w(`${r.key}${n.key}`, r.value, n.message));
  const t = e.value.expression || e.value._styleExpression.expression;
  if (r.expressionContext === "property" && r.propertyKey === "text-font" && !t.outputDefined()) return [new w(r.key, r.value, `Invalid data expression for "${r.propertyKey}". Output values must be contained as literals within the expression.`)];
  if (r.expressionContext === "property" && r.propertyType === "layout" && !zt(t)) return [new w(r.key, r.value, '"feature-state" data expressions are not supported with layout properties.')];
  if (r.expressionContext === "filter" && !zt(t)) return [new w(r.key, r.value, '"feature-state" data expressions are not supported with filters.')];
  if (r.expressionContext && r.expressionContext.indexOf("cluster") === 0) {
    if (!qr(t, ["zoom", "feature-state"])) return [new w(r.key, r.value, '"zoom" and "feature-state" expressions are not supported with cluster properties.')];
    if (r.expressionContext === "cluster-initial" && !Vr(t)) return [new w(r.key, r.value, "Feature data expressions are not supported with initial expression part of cluster properties.")];
  }
  return [];
}
function of(r) {
  const e = r.value, t = r.key, n = O(e);
  return n !== "boolean" ? [new w(t, e, `boolean expected, ${n} found`)] : [];
}
function zn(r) {
  const e = r.key, t = r.value, n = O(t);
  return n !== "string" ? [new w(e, t, `color expected, ${n} found`)] : ee.parse(String(t)) ? [] : [new w(e, t, `color expected, "${t}" found`)];
}
function Dt(r) {
  const e = r.key, t = r.value, n = r.valueSpec, i = [];
  return Array.isArray(n.values) ? n.values.indexOf(G(t)) === -1 && i.push(new w(e, t, `expected one of [${n.values.join(", ")}], ${JSON.stringify(t)} found`)) : Object.keys(n.values).indexOf(G(t)) === -1 && i.push(new w(e, t, `expected one of [${Object.keys(n.values).join(", ")}], ${JSON.stringify(t)} found`)), i;
}
function gi(r) {
  return ys(He(r.value)) ? lt(Ar({}, r, {
    expressionContext: "filter",
    valueSpec: { value: "boolean" }
  })) : bs(r);
}
function bs(r) {
  const e = r.value, t = r.key;
  if (O(e) !== "array") return [new w(t, e, `array expected, ${O(e)} found`)];
  const n = r.styleSpec;
  let i, a = [];
  if (e.length < 1) return [new w(t, e, "filter array must have at least 1 element")];
  switch (a = a.concat(Dt({
    key: `${t}[0]`,
    value: e[0],
    valueSpec: n.filter_operator,
    style: r.style,
    styleSpec: r.styleSpec
  })), G(e[0])) {
    case "<":
    case "<=":
    case ">":
    case ">=":
      e.length >= 2 && G(e[1]) === "$type" && a.push(new w(t, e, `"$type" cannot be use with operator "${e[0]}"`));
    case "==":
    case "!=":
      e.length !== 3 && a.push(new w(t, e, `filter array for operator "${e[0]}" must have 3 elements`));
    case "in":
    case "!in":
      e.length >= 2 && (i = O(e[1]), i !== "string" && a.push(new w(`${t}[1]`, e[1], `string expected, ${i} found`)));
      for (let o = 2; o < e.length; o++)
        i = O(e[o]), G(e[1]) === "$type" ? a = a.concat(Dt({
          key: `${t}[${o}]`,
          value: e[o],
          valueSpec: n.geometry_type,
          style: r.style,
          styleSpec: r.styleSpec
        })) : i !== "string" && i !== "number" && i !== "boolean" && a.push(new w(`${t}[${o}]`, e[o], `string, number, or boolean expected, ${i} found`));
      break;
    case "any":
    case "all":
    case "none":
      for (let o = 1; o < e.length; o++) a = a.concat(bs({
        key: `${t}[${o}]`,
        value: e[o],
        style: r.style,
        styleSpec: r.styleSpec
      }));
      break;
    case "has":
    case "!has":
      i = O(e[1]), e.length !== 2 ? a.push(new w(t, e, `filter array for "${e[0]}" operator must have 2 elements`)) : i !== "string" && a.push(new w(`${t}[1]`, e[1], `string expected, ${i} found`));
      break;
  }
  return a;
}
function ws(r, e) {
  const t = r.key, n = r.validateSpec, i = r.style, a = r.styleSpec, o = r.value, s = r.objectKey, l = a[`${e}_${r.layerType}`];
  if (!l) return [];
  const u = s.match(/^(.*)-transition$/);
  if (e === "paint" && u && l[u[1]] && l[u[1]].transition) return n({
    key: t,
    value: o,
    valueSpec: a.transition,
    style: i,
    styleSpec: a
  });
  const c = r.valueSpec || l[s];
  if (!c) return [new w(t, o, `unknown property "${s}"`)];
  let p;
  if (O(o) === "string" && Mr(c) && !c.tokens && (p = /^{([^}]+)}$/.exec(o))) return [new w(t, o, `"${s}" does not support interpolation syntax
Use an identity property function instead: \`{ "type": "identity", "property": ${JSON.stringify(p[1])} }\`.`)];
  const f = [];
  return r.layerType === "symbol" && s === "text-font" && hi(He(o)) && G(o.type) === "identity" && f.push(new w(t, o, '"text-font" does not support identity functions')), f.concat(n({
    key: r.key,
    value: o,
    valueSpec: c,
    style: i,
    styleSpec: a,
    expressionContext: "property",
    propertyType: e,
    propertyKey: s
  }));
}
function Ss(r) {
  return ws(r, "paint");
}
function xs(r) {
  return ws(r, "layout");
}
function Cs(r) {
  var l, u;
  let e = [];
  const t = r.value, n = r.key, i = r.style, a = r.styleSpec;
  if (O(t) !== "object") return [new w(n, t, `object expected, ${O(t)} found`)];
  !t.type && !t.ref && e.push(new w(n, t, 'either "type" or "ref" is required'));
  let o = G(t.type);
  const s = G(t.ref);
  if (t.id) {
    const c = G(t.id);
    for (let p = 0; p < r.arrayIndex; p++) {
      const f = i.layers[p];
      G(f.id) === c && e.push(new w(n, t.id, `duplicate layer id "${t.id}", previously used at line ${f.id.__line__}`));
    }
  }
  if ("ref" in t) {
    [
      "type",
      "source",
      "source-layer",
      "filter",
      "layout"
    ].forEach((p) => {
      p in t && e.push(new w(n, t[p], `"${p}" is prohibited for ref layers`));
    });
    let c;
    i.layers.forEach((p) => {
      G(p.id) === s && (c = p);
    }), c ? c.ref ? e.push(new w(n, t.ref, "ref cannot reference another ref layer")) : o = G(c.type) : e.push(new w(n, t.ref, `ref layer "${s}" not found`));
  } else if (o !== "background") if (!t.source) e.push(new w(n, t, 'missing required property "source"'));
  else {
    const c = i.sources && i.sources[t.source], p = c && G(c.type);
    c ? p === "vector" && o === "raster" ? e.push(new w(n, t.source, `layer "${t.id}" requires a raster source`)) : p !== "raster-dem" && o === "hillshade" ? e.push(new w(n, t.source, `layer "${t.id}" requires a raster-dem source`)) : p !== "raster-dem" && o === "color-relief" ? e.push(new w(n, t.source, `layer "${t.id}" requires a raster-dem source`)) : p === "raster" && o !== "raster" ? e.push(new w(n, t.source, `layer "${t.id}" requires a vector source`)) : p === "vector" && !t["source-layer"] ? e.push(new w(n, t, `layer "${t.id}" must specify a "source-layer"`)) : p === "raster-dem" && o !== "hillshade" && o !== "color-relief" ? e.push(new w(n, t.source, "raster-dem source can only be used with layer type 'hillshade' or 'color-relief'.")) : o === "line" && t.paint && t.paint["line-gradient"] && (p !== "geojson" || !c.lineMetrics) && e.push(new w(n, t, `layer "${t.id}" specifies a line-gradient, which requires a GeoJSON source with \`lineMetrics\` enabled.`)) : e.push(new w(n, t.source, `source "${t.source}" not found`));
  }
  return o === "raster" && ((l = t.paint) != null && l.resampling) && ((u = t.paint) != null && u["raster-resampling"]) && e.push(new w(n, t.paint, `layer "${t.id}" redundantly specifies "resampling" and "raster-resampling" paint properties, but only one is allowed. It is advised to use "resampling".`)), e = e.concat(ce({
    key: n,
    value: t,
    valueSpec: a.layer,
    style: r.style,
    styleSpec: r.styleSpec,
    validateSpec: r.validateSpec,
    objectElementValidators: {
      "*"() {
        return [];
      },
      type() {
        return r.validateSpec({
          key: `${n}.type`,
          value: t.type,
          valueSpec: a.layer.type,
          style: r.style,
          styleSpec: r.styleSpec,
          validateSpec: r.validateSpec,
          object: t,
          objectKey: "type"
        });
      },
      filter: gi,
      layout(c) {
        return ce({
          layer: t,
          key: c.key,
          value: c.value,
          style: c.style,
          styleSpec: c.styleSpec,
          validateSpec: c.validateSpec,
          objectElementValidators: { "*"(p) {
            return xs(Ar({ layerType: o }, p));
          } }
        });
      },
      paint(c) {
        return ce({
          layer: t,
          key: c.key,
          value: c.value,
          style: c.style,
          styleSpec: c.styleSpec,
          validateSpec: c.validateSpec,
          objectElementValidators: { "*"(p) {
            return Ss(Ar({ layerType: o }, p));
          } }
        });
      }
    }
  })), e;
}
function De(r) {
  const e = r.value, t = r.key, n = O(e);
  return n !== "string" ? [new w(t, e, `string expected, ${n} found`)] : [];
}
function sf(r) {
  const e = r.sourceName ?? "", t = r.value, n = r.styleSpec, i = n.source_raster_dem, a = r.style;
  let o = [];
  const s = O(t);
  if (t === void 0) return o;
  if (s !== "object")
    return o.push(new w("source_raster_dem", t, `object expected, ${s} found`)), o;
  const l = G(t.encoding) === "custom", u = [
    "redFactor",
    "greenFactor",
    "blueFactor",
    "baseShift"
  ], c = r.value.encoding ? `"${r.value.encoding}"` : "Default";
  for (const p in t) !l && u.includes(p) ? o.push(new w(p, t[p], `In "${e}": "${p}" is only valid when "encoding" is set to "custom". ${c} encoding found`)) : i[p] ? o = o.concat(r.validateSpec({
    key: p,
    value: t[p],
    valueSpec: i[p],
    validateSpec: r.validateSpec,
    style: a,
    styleSpec: n
  })) : o.push(new w(p, t[p], `unknown property "${p}"`));
  return o;
}
const ga = { promoteId: lf };
function As(r) {
  const e = r.value, t = r.key, n = r.styleSpec, i = r.style, a = r.validateSpec;
  if (!e.type) return [new w(t, e, '"type" is required')];
  const o = G(e.type);
  let s;
  switch (o) {
    case "vector":
    case "raster":
      return s = ce({
        key: t,
        value: e,
        valueSpec: n[`source_${o.replace("-", "_")}`],
        style: r.style,
        styleSpec: n,
        objectElementValidators: ga,
        validateSpec: a
      }), s;
    case "raster-dem":
      return s = sf({
        sourceName: t,
        value: e,
        style: r.style,
        styleSpec: n,
        validateSpec: a
      }), s;
    case "geojson":
      if (s = ce({
        key: t,
        value: e,
        valueSpec: n.source_geojson,
        style: i,
        styleSpec: n,
        validateSpec: a,
        objectElementValidators: ga
      }), e.cluster) for (const l in e.clusterProperties) {
        const [u, c] = e.clusterProperties[l], p = typeof u == "string" ? [
          u,
          ["accumulated"],
          ["get", l]
        ] : u;
        s.push(...lt({
          key: `${t}.${l}.map`,
          value: c,
          expressionContext: "cluster-map"
        })), s.push(...lt({
          key: `${t}.${l}.reduce`,
          value: p,
          expressionContext: "cluster-reduce"
        }));
      }
      return s;
    case "video":
      return ce({
        key: t,
        value: e,
        valueSpec: n.source_video,
        style: i,
        validateSpec: a,
        styleSpec: n
      });
    case "image":
      return ce({
        key: t,
        value: e,
        valueSpec: n.source_image,
        style: i,
        validateSpec: a,
        styleSpec: n
      });
    case "canvas":
      return [new w(t, null, "Please use runtime APIs to add canvas sources, rather than including them in stylesheets.", "source.canvas")];
    default:
      return Dt({
        key: `${t}.type`,
        value: e.type,
        valueSpec: { values: [
          "vector",
          "raster",
          "raster-dem",
          "geojson",
          "video",
          "image"
        ] }
      });
  }
}
function lf({ key: r, value: e }) {
  if (O(e) === "string") return De({
    key: r,
    value: e
  });
  {
    const t = [];
    for (const n in e) t.push(...De({
      key: `${r}.${n}`,
      value: e[n]
    }));
    return t;
  }
}
function Ls(r) {
  const e = r.value, t = r.styleSpec, n = t.light, i = r.style;
  let a = [];
  const o = O(e);
  if (e === void 0) return a;
  if (o !== "object")
    return a = a.concat([new w("light", e, `object expected, ${o} found`)]), a;
  for (const s in e) {
    const l = s.match(/^(.*)-transition$/);
    l && n[l[1]] && n[l[1]].transition ? a = a.concat(r.validateSpec({
      key: s,
      value: e[s],
      valueSpec: t.transition,
      validateSpec: r.validateSpec,
      style: i,
      styleSpec: t
    })) : n[s] ? a = a.concat(r.validateSpec({
      key: s,
      value: e[s],
      valueSpec: n[s],
      validateSpec: r.validateSpec,
      style: i,
      styleSpec: t
    })) : a = a.concat([new w(s, e[s], `unknown property "${s}"`)]);
  }
  return a;
}
function Es(r) {
  const e = r.value, t = r.styleSpec, n = t.sky, i = r.style, a = O(e);
  if (e === void 0) return [];
  if (a !== "object") return [new w("sky", e, `object expected, ${a} found`)];
  let o = [];
  for (const s in e) n[s] ? o = o.concat(r.validateSpec({
    key: s,
    value: e[s],
    valueSpec: n[s],
    style: i,
    styleSpec: t
  })) : o = o.concat([new w(s, e[s], `unknown property "${s}"`)]);
  return o;
}
function Ts(r) {
  const e = r.value, t = r.styleSpec, n = t.terrain, i = r.style;
  let a = [];
  const o = O(e);
  if (e === void 0) return a;
  if (o !== "object")
    return a = a.concat([new w("terrain", e, `object expected, ${o} found`)]), a;
  for (const s in e) n[s] ? a = a.concat(r.validateSpec({
    key: s,
    value: e[s],
    valueSpec: n[s],
    validateSpec: r.validateSpec,
    style: i,
    styleSpec: t
  })) : a = a.concat([new w(s, e[s], `unknown property "${s}"`)]);
  return a;
}
function uf(r) {
  return De(r).length === 0 ? [] : lt(r);
}
function cf(r) {
  return De(r).length === 0 ? [] : lt(r);
}
function pf(r) {
  const e = r.key, t = r.value;
  if (O(t) === "array") {
    if (t.length < 1 || t.length > 4) return [new w(e, t, `padding requires 1 to 4 values; ${t.length} values found`)];
    const n = { type: "number" };
    let i = [];
    for (let a = 0; a < t.length; a++) i = i.concat(r.validateSpec({
      key: `${e}[${a}]`,
      value: t[a],
      validateSpec: r.validateSpec,
      valueSpec: n
    }));
    return i;
  } else return Gr({
    key: e,
    value: t,
    valueSpec: {}
  });
}
function ff(r) {
  const e = r.key, t = r.value;
  if (O(t) === "array") {
    const n = { type: "number" };
    if (t.length < 1) return [new w(e, t, "array length at least 1 expected, length 0 found")];
    let i = [];
    for (let a = 0; a < t.length; a++) i = i.concat(r.validateSpec({
      key: `${e}[${a}]`,
      value: t[a],
      validateSpec: r.validateSpec,
      valueSpec: n
    }));
    return i;
  } else return Gr({
    key: e,
    value: t,
    valueSpec: {}
  });
}
function df(r) {
  const e = r.key, t = r.value;
  if (O(t) === "array") {
    if (t.length < 1) return [new w(e, t, "array length at least 1 expected, length 0 found")];
    let n = [];
    for (let i = 0; i < t.length; i++) n = n.concat(zn({
      key: `${e}[${i}]`,
      value: t[i]
    }));
    return n;
  } else return zn({
    key: e,
    value: t
  });
}
function hf(r) {
  const e = r.key, t = r.value, n = O(t), i = r.styleSpec;
  if (n !== "array" || t.length < 1 || t.length % 2 !== 0) return [new w(e, t, "variableAnchorOffsetCollection requires a non-empty array of even length")];
  let a = [];
  for (let o = 0; o < t.length; o += 2)
    a = a.concat(Dt({
      key: `${e}[${o}]`,
      value: t[o],
      valueSpec: i.layout_symbol["text-anchor"]
    })), a = a.concat(yi({
      key: `${e}[${o + 1}]`,
      value: t[o + 1],
      valueSpec: {
        length: 2,
        value: "number"
      },
      validateSpec: r.validateSpec,
      style: r.style,
      styleSpec: i
    }));
  return a;
}
function ks(r) {
  let e = [];
  const t = r.value, n = r.key;
  if (Array.isArray(t)) {
    const i = [], a = [];
    for (const o in t)
      t[o].id && i.includes(t[o].id) && e.push(new w(n, t, `all the sprites' ids must be unique, but ${t[o].id} is duplicated`)), i.push(t[o].id), t[o].url && a.includes(t[o].url) && e.push(new w(n, t, `all the sprites' URLs must be unique, but ${t[o].url} is duplicated`)), a.push(t[o].url), e = e.concat(ce({
        key: `${n}[${o}]`,
        value: t[o],
        valueSpec: {
          id: {
            type: "string",
            required: !0
          },
          url: {
            type: "string",
            required: !0
          }
        },
        validateSpec: r.validateSpec
      }));
    return e;
  } else
    return De({
      key: n,
      value: t
    });
}
function mf(r) {
  const e = r.value, t = r.styleSpec, n = t.projection, i = r.style, a = O(e);
  if (e === void 0) return [];
  if (a !== "object") return [new w("projection", e, `object expected, ${a} found`)];
  let o = [];
  for (const s in e) n[s] ? o = o.concat(r.validateSpec({
    key: s,
    value: e[s],
    valueSpec: n[s],
    style: i,
    styleSpec: t
  })) : o = o.concat([new w(s, e[s], `unknown property "${s}"`)]);
  return o;
}
function yf(r) {
  const e = r.key;
  let t = r.value;
  t = t instanceof String ? t.valueOf() : t;
  const n = O(t);
  return n === "array" && !vf(t) && !gf(t) ? [new w(e, t, `projection expected, invalid array ${JSON.stringify(t)} found`)] : ["array", "string"].includes(n) ? [] : [new w(e, t, `projection expected, invalid type "${n}" found`)];
}
function gf(r) {
  return !![
    "interpolate",
    "step",
    "literal"
  ].includes(r[0]);
}
function vf(r) {
  return Array.isArray(r) && r.length === 3 && typeof r[0] == "string" && typeof r[1] == "string" && typeof r[2] == "number";
}
function Is(r) {
  return !!r && r.constructor === Object;
}
function Ms(r) {
  return Is(r.value) ? [] : [new w(r.key, r.value, `object expected, ${O(r.value)} found`)];
}
function bf(r) {
  const e = r.key, t = r.value, n = r.validateSpec, i = r.styleSpec, a = r.style;
  if (!Is(t)) return [new w(e, t, `object expected, ${O(t)} found`)];
  const o = [];
  for (const s in t) {
    const l = t[s], u = O(l);
    if (u === "string") o.push(...De({
      key: `${e}.${s}`,
      value: l
    }));
    else if (u === "array") {
      const c = {
        url: {
          type: "string",
          required: !0
        },
        "unicode-range": {
          type: "array",
          value: "string"
        }
      };
      for (const [p, f] of l.entries()) o.push(...ce({
        key: `${e}.${s}[${p}]`,
        value: f,
        valueSpec: c,
        styleSpec: i,
        style: a,
        validateSpec: n
      }));
    } else o.push(new w(`${e}.${s}`, l, `string or array expected, ${u} found`));
  }
  return o;
}
const va = {
  "*"() {
    return [];
  },
  array: yi,
  boolean: of,
  number: Gr,
  color: zn,
  constants: gs,
  enum: Dt,
  filter: gi,
  function: vs,
  layer: Cs,
  object: ce,
  source: As,
  light: Ls,
  sky: Es,
  terrain: Ts,
  projection: mf,
  projectionDefinition: yf,
  string: De,
  formatted: uf,
  resolvedImage: cf,
  padding: pf,
  numberArray: ff,
  colorArray: df,
  variableAnchorOffsetCollection: hf,
  sprite: ks,
  state: Ms,
  fontFaces: bf
};
function Pr(r) {
  const e = r.value, t = r.valueSpec, n = r.styleSpec;
  return r.validateSpec = Pr, t.expression && hi(G(e)) ? vs(r) : t.expression && hs(He(e)) ? lt(r) : t.type && va[t.type] ? va[t.type](r) : ce(Ar({}, r, { valueSpec: t.type ? n[t.type] : t }));
}
function Ps(r) {
  const e = r.value, t = r.key, n = De(r);
  return n.length || (e.indexOf("{fontstack}") === -1 && n.push(new w(t, e, '"glyphs" url must include a "{fontstack}" token')), e.indexOf("{range}") === -1 && n.push(new w(t, e, '"glyphs" url must include a "{range}" token'))), n;
}
function pe(r, e = Nc) {
  let t = [];
  return t = t.concat(Pr({
    key: "",
    value: r,
    valueSpec: e.$root,
    styleSpec: e,
    style: r,
    validateSpec: Pr,
    objectElementValidators: {
      glyphs: Ps,
      "*"() {
        return [];
      }
    }
  })), r.constants && (t = t.concat(gs({
    key: "constants",
    value: r.constants
  }))), _s(t);
}
pe.source = ye(me(As));
pe.sprite = ye(me(ks));
pe.glyphs = ye(me(Ps));
pe.light = ye(me(Ls));
pe.sky = ye(me(Es));
pe.terrain = ye(me(Ts));
pe.state = ye(me(Ms));
pe.layer = ye(me(Cs));
pe.filter = ye(me(gi));
pe.paintProperty = ye(me(Ss));
pe.layoutProperty = ye(me(xs));
function me(r) {
  return function(e) {
    return r(Object.assign({}, e, { validateSpec: Pr }));
  };
}
function _s(r) {
  return [].concat(r).sort((e, t) => e.line - t.line);
}
function ye(r) {
  return function(...e) {
    return _s(r.apply(this, e));
  };
}
function ba(r) {
  if (!r)
    return {
      style: rt[cr[0].referenceStyleID].getDefaultVariant().getExpandedStyleURL(),
      requiresUrlMonitoring: !1,
      // default styles don't require URL monitoring
      isFallback: !0
    };
  if (typeof r == "string") {
    const t = Sf(r);
    return t.isValidStyle ? {
      style: t.styleObject,
      requiresUrlMonitoring: !1,
      isFallback: !1
    } : t.isValidJSON ? {
      style: rt[cr[0].referenceStyleID].getDefaultVariant().getExpandedStyleURL(),
      requiresUrlMonitoring: !1,
      // default styles don't require URL monitoring
      isFallback: !0
    } : r.startsWith("http") ? { style: r, requiresUrlMonitoring: !0, isFallback: !1 } : r.toLowerCase().includes(".json") ? {
      style: wf(r),
      requiresUrlMonitoring: !0,
      isFallback: !1
    } : {
      style: Cl(r),
      requiresUrlMonitoring: !0,
      isFallback: !1
    };
  }
  return r instanceof Wa ? {
    style: r.getExpandedStyleURL(),
    requiresUrlMonitoring: !1,
    isFallback: !1
  } : r instanceof Ya ? {
    style: r.getDefaultVariant().getExpandedStyleURL(),
    requiresUrlMonitoring: !1,
    isFallback: !1
  } : pe(r).length === 0 ? {
    style: r,
    requiresUrlMonitoring: !1,
    isFallback: !1,
    isJSON: !0
  } : {
    style: rt[cr[0].referenceStyleID].getDefaultVariant().getExpandedStyleURL(),
    requiresUrlMonitoring: !1,
    // default styles don't require URL monitoring
    isFallback: !0
  };
}
function wf(r) {
  try {
    return new URL(r).href;
  } catch {
  }
  return new URL(r, location.origin).href;
}
function Sf(r) {
  try {
    const e = JSON.parse(r), t = pe(e);
    return {
      isValidJSON: !0,
      isValidStyle: t.length === 0,
      styleObject: t.length === 0 ? e : null
    };
  } catch {
    return {
      isValidJSON: !1,
      isValidStyle: !1,
      styleObject: null
    };
  }
}
function xf(r) {
  if (!r)
    return rt[cr[0].referenceStyleID].getDefaultVariant().getId();
  if (r instanceof Wa) return r.getId();
  if (r instanceof Ya) return r.getDefaultVariant().getId();
  if (typeof r == "string") {
    const t = /\/maps\/([^/]+)\/style\.json/.exec(r);
    return t ? t[1] : r.startsWith("http") || r.toLowerCase().includes(".json") || r.trim().startsWith("{") ? void 0 : r.replace("maptiler://", "");
  }
  const e = r.id;
  return typeof e == "string" ? e : void 0;
}
function Ce(r, e, t) {
  const n = window.document.createElement(r);
  return e !== void 0 && (n.className = e), t && t.appendChild(n), n;
}
function Nt(r) {
  r.parentNode && r.parentNode.removeChild(r);
}
class Cf {
  constructor() {
    y(this, "_map");
    y(this, "_container");
    y(this, "_terrainButton");
    Lc(["_toggleTerrain", "_updateTerrainIcon"], this);
  }
  onAdd(e) {
    return this._map = e, this._container = Ce("div", "maplibregl-ctrl maplibregl-ctrl-group"), this._terrainButton = Ce("button", "maplibregl-ctrl-terrain", this._container), Ce("span", "maplibregl-ctrl-icon", this._terrainButton).setAttribute("aria-hidden", "true"), this._terrainButton.type = "button", this._terrainButton.addEventListener("click", this._toggleTerrain), this._updateTerrainIcon(), this._map.on("terrain", this._updateTerrainIcon), this._container;
  }
  onRemove() {
    Nt(this._container), this._map.off("terrain", this._updateTerrainIcon), this._map = void 0;
  }
  _toggleTerrain() {
    Os(this._map), this._updateTerrainIcon();
  }
  _updateTerrainIcon() {
    this._terrainButton.classList.remove("maplibregl-ctrl-terrain"), this._terrainButton.classList.remove("maplibregl-ctrl-terrain-enabled"), this._map.hasTerrain() ? (this._terrainButton.classList.add("maplibregl-ctrl-terrain-enabled"), this._terrainButton.title = this._map._getUIString("TerrainControl.Disable")) : (this._terrainButton.classList.add("maplibregl-ctrl-terrain"), this._terrainButton.title = this._map._getUIString("TerrainControl.Enable"));
  }
}
function Os(r) {
  r.hasTerrain() ? r.disableTerrain() : r.enableTerrain();
}
class Af extends wo {
  constructor(t = {}) {
    super({
      showCompass: t.showCompass ?? !0,
      showZoom: t.showZoom ?? !0,
      visualizePitch: t.visualizePitch ?? !0
    });
    /**
     * Overloading: Limit how flat the compass icon can get
     */
    y(this, "_rotateCompassArrow", () => {
      const t = this._map.getBearing(), n = this._map.getPitch(), i = this.options.visualizePitch ? `scale(${Math.min(1.5, 1 / Math.cos(n * (Math.PI / 180)) ** 0.5)}) rotateX(${Math.min(70, n)}deg) rotateZ(${-t}deg)` : `rotate(${-t}deg)`;
      this._compassIcon.style.transform = i;
    });
    this._compass && (this._compass.removeEventListener("click", this._compass.clickFunction), this._compass.addEventListener("click", (n) => {
      this._map.getPitch() === 0 ? this._map.easeTo({ pitch: Math.min(this._map.getMaxPitch(), 80) }) : this.options.visualizePitch ? this._map.resetNorthPitch({}, { originalEvent: n }) : this._map.resetNorth({}, { originalEvent: n });
    }));
  }
  /**
   * Overloading: the button now stores its click callback so that we can later on delete it and replace it
   */
  _createButton(t, n) {
    const i = super._createButton(t, n);
    return i.clickFunction = n, i;
  }
}
const wa = C.Marker, Sa = C.LngLat, Lf = C.LngLatBounds;
class Ef extends fc {
  constructor() {
    super(...arguments);
    y(this, "lastUpdatedCenter", new Sa(0, 0));
    /**
     * Update the camera location to center on the current position
     *
     * @param {Position} position the Geolocation API Position
     * @private
     */
    y(this, "_updateCamera", (t) => {
      var c;
      const n = new Sa(t.coords.longitude, t.coords.latitude), i = t.coords.accuracy, o = {
        bearing: this._map.getBearing(),
        ...this.options.fitBoundsOptions,
        linear: !0
      }, s = this._map.getZoom();
      s > (((c = this.options.fitBoundsOptions) == null ? void 0 : c.maxZoom) ?? 30) && (o.zoom = s), this._map.fitBounds(Lf.fromLngLat(n, i), o, {
        geolocateSource: !0
        // tag this camera change so it won't cause the control to change to background state
      });
      let l = !1;
      const u = () => {
        l = !0;
      };
      this._map.once("click", u), this._map.once("dblclick", u), this._map.once("dragstart", u), this._map.once("mousedown", u), this._map.once("touchstart", u), this._map.once("wheel", u), this._map.once("moveend", () => {
        this._map.off("click", u), this._map.off("dblclick", u), this._map.off("dragstart", u), this._map.off("mousedown", u), this._map.off("touchstart", u), this._map.off("wheel", u), !l && (this.lastUpdatedCenter = this._map.getCenter());
      });
    });
    y(this, "_finishSetupUI", (t) => {
      if (this._map) {
        if (t === !1) {
          const n = this._map._getUIString("GeolocateControl.LocationNotAvailable");
          this._geolocateButton.disabled = !0, this._geolocateButton.title = n, this._geolocateButton.setAttribute("aria-label", n);
        } else {
          const n = this._map._getUIString("GeolocateControl.FindMyLocation");
          this._geolocateButton.disabled = !1, this._geolocateButton.title = n, this._geolocateButton.setAttribute("aria-label", n);
        }
        this.options.trackUserLocation && (this._geolocateButton.setAttribute("aria-pressed", "false"), this._watchState = "OFF"), this.options.showUserLocation && (this._dotElement = Ce("div", "maplibregl-user-location-dot"), this._userLocationDotMarker = new wa({ element: this._dotElement }), this._circleElement = Ce("div", "maplibregl-user-location-accuracy-circle"), this._accuracyCircleMarker = new wa({
          element: this._circleElement,
          pitchAlignment: "map"
        }), this.options.trackUserLocation && (this._watchState = "OFF"), this._map.on("move", this._onZoom)), this._geolocateButton.addEventListener("click", this.trigger.bind(this)), this._setup = !0, this.options.trackUserLocation && this._map.on("moveend", (n) => {
          const i = n.originalEvent && n.originalEvent.type === "resize", a = this.lastUpdatedCenter.distanceTo(this._map.getCenter());
          !n.geolocateSource && this._watchState === "ACTIVE_LOCK" && !i && a > 1 && (this._watchState = "BACKGROUND", this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-background"), this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active"), this.fire(new Event("trackuserlocationend")));
        });
      }
    });
    y(this, "_onZoom", () => {
      this.options.showUserLocation && this.options.showAccuracyCircle && this._updateCircleRadius();
    });
  }
  _updateCircleRadius() {
    if (this._watchState !== "BACKGROUND" && this._watchState !== "ACTIVE_LOCK")
      return;
    const t = [this._lastKnownPosition.coords.longitude, this._lastKnownPosition.coords.latitude], n = this._map.project(t), i = this._map.unproject([n.x, n.y]), a = this._map.unproject([n.x + 20, n.y]), o = i.distanceTo(a) / 20, s = Math.ceil(2 * this._accuracy / o);
    this._circleElement.style.width = `${s}px`, this._circleElement.style.height = `${s}px`;
  }
  // We are overwriting the method _setErrorState from Maplibre's GeolocateControl because the
  // case BACKGROUND_ERROR is not dealt with in the original function and yields an error.
  // Related issue: https://github.com/maplibre/maplibre-gl-js/issues/2294
  _setErrorState() {
    switch (this._watchState) {
      case "WAITING_ACTIVE":
        this._watchState = "ACTIVE_ERROR", this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active"), this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-active-error");
        break;
      case "ACTIVE_LOCK":
        this._watchState = "ACTIVE_ERROR", this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active"), this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-active-error"), this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-waiting");
        break;
      case "BACKGROUND":
        this._watchState = "BACKGROUND_ERROR", this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-background"), this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-background-error"), this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-waiting");
        break;
      case "ACTIVE_ERROR":
        break;
      case "BACKGROUND_ERROR":
        break;
      default:
        throw new Error(`Unexpected watchState ${this._watchState}`);
    }
  }
}
var Te, oe, ke, Ie, it;
class Tf {
  /**
   * @param selectorOrElement Element to be used as control, specified as either reference to element itself or a CSS selector to find the element in DOM
   * @param onClick Function called when the element is clicked
   * @param onRender Function called every time the underlying map renders a new state
   */
  constructor(e, t, n) {
    te(this, Te);
    te(this, oe);
    te(this, ke);
    te(this, Ie);
    te(this, it);
    if (typeof e == "string") {
      const i = document.querySelector(e);
      if (!i) throw new Error(`No element has been found with selector "${e}" when creating an external control.`);
      ie(this, oe, i);
    } else
      ie(this, oe, e);
    t && ie(this, ke, (i) => {
      t(A(this, Te), A(this, oe), i);
    }), n && ie(this, Ie, (i) => {
      n(A(this, Te), A(this, oe), i);
    }), ie(this, it, A(this, oe).parentElement);
  }
  onAdd(e) {
    return ie(this, Te, e), A(this, ke) && A(this, oe).addEventListener("click", A(this, ke)), A(this, Ie) && A(this, Te).on("render", A(this, Ie)), Nt(A(this, oe)), A(this, oe);
  }
  onRemove() {
    A(this, ke) && A(this, oe).removeEventListener("click", A(this, ke)), A(this, Ie) && A(this, Te).off("render", A(this, Ie)), A(this, it) ? A(this, it).appendChild(A(this, oe)) : Nt(A(this, oe));
  }
}
Te = new WeakMap(), oe = new WeakMap(), ke = new WeakMap(), Ie = new WeakMap(), it = new WeakMap();
class kf {
  constructor() {
    y(this, "map");
    y(this, "container");
    y(this, "projectionButton");
  }
  onAdd(e) {
    return this.map = e, this.container = Ce("div", "maplibregl-ctrl maplibregl-ctrl-group"), this.projectionButton = Ce("button", "maplibregl-ctrl-projection", this.container), Ce("span", "maplibregl-ctrl-icon", this.projectionButton).setAttribute("aria-hidden", "true"), this.projectionButton.type = "button", this.projectionButton.addEventListener("click", this.toggleProjection.bind(this)), e.on("projectiontransition", this.updateProjectionIcon.bind(this)), this.updateProjectionIcon(), this.container;
  }
  onRemove() {
    Nt(this.container), this.map.off("projectiontransition", this.updateProjectionIcon), this.map = void 0;
  }
  toggleProjection() {
    Rs(this.map), this.updateProjectionIcon();
  }
  updateProjectionIcon() {
    this.projectionButton.classList.remove("maplibregl-ctrl-projection-globe"), this.projectionButton.classList.remove("maplibregl-ctrl-projection-mercator"), this.map.isGlobeProjection() ? (this.projectionButton.classList.add("maplibregl-ctrl-projection-mercator"), this.projectionButton.title = "Enable Mercator projection") : (this.projectionButton.classList.add("maplibregl-ctrl-projection-globe"), this.projectionButton.title = "Enable Globe projection");
  }
}
function Rs(r) {
  r.getProjection() === void 0 && r.setProjection({ type: "mercator" }), r.isGlobeProjection() ? r.setProjection("mercator", { persist: !0 }) : r.setProjection("globe", { persist: !0 });
}
const vt = {
  "zoom-in": (r) => r.zoomIn(),
  "zoom-out": (r) => r.zoomOut(),
  "toggle-projection": Rs,
  "toggle-terrain": Os,
  "reset-view": (r) => {
    r.getPitch() === 0 ? r.easeTo({ pitch: Math.min(r.getMaxPitch(), 80) }) : r.resetNorthPitch();
  },
  "reset-bearing": (r) => {
    r.rotateTo(0);
  },
  "reset-pitch": (r) => {
    r.setPitch(0);
  },
  "reset-roll": (r) => {
    r.setRoll(0);
  }
};
var jt, at;
class Dn extends Tf {
  /**
   * Constructs an instance of External Control to have a predefined functionality
   * @param controlElement Element to be used as control, specified as reference to element itself
   * @param controlType One of the predefined types of functionality
   */
  constructor(t, n) {
    if (n && !(n in vt)) throw new Error(`data-maptiler-control value "${n}" is invalid.`);
    super(t, n && vt[n]);
    te(this, jt);
    te(this, at, /* @__PURE__ */ new Map());
  }
  onAdd(t) {
    return ie(this, jt, t), super.onAdd(t);
  }
  onRemove() {
    for (const [t, n] of A(this, at)) {
      const i = t.deref();
      i && i.removeEventListener("click", n);
    }
    A(this, at).clear(), super.onRemove();
  }
  /**
   * Configure a child element to be part of this control and to have a predefined functionality added
   * @param controlElement Element that is a descendant of the control element and that optionally should have some functionality
   * @param controlType One of the predefined types of functionality
   */
  configureGroupItem(t, n) {
    if (!n) return;
    if (!(n in vt)) throw new Error(`data-maptiler-control value "${n}" is invalid.`);
    const i = (a) => {
      vt[n](A(this, jt), t, a);
    };
    t.addEventListener("click", i), A(this, at).set(new WeakRef(t), i);
  }
}
jt = new WeakMap(), at = new WeakMap(), y(Dn, "controlCallbacks", vt);
var se, he, Me, Pe, le, Ut, Y, Fs, de, zs;
class hn {
  constructor(e, t) {
    te(this, Y);
    te(this, se);
    y(this, "map");
    te(this, he);
    te(this, Me);
    te(this, Pe);
    te(this, le, !1);
    te(this, Ut);
    e.style !== void 0 && ie(this, le, !0), ie(this, se, {
      // set defaults
      zoomAdjust: -4,
      position: "top-right",
      // inherit map options
      ...t,
      // override any lingering control options
      forceNoAttributionControl: !0,
      navigationControl: !1,
      geolocateControl: !1,
      maptilerLogo: !1,
      minimap: !1,
      hash: !1,
      pitchAdjust: !1,
      // override map options with new user defined minimap options
      ...e,
      containerStyle: {
        border: "1px solid #000",
        width: "400px",
        height: "300px",
        ...e.containerStyle ?? {}
      }
    }), e.lockZoom !== void 0 && (A(this, se).minZoom = e.lockZoom, A(this, se).maxZoom = e.lockZoom);
  }
  setStyle(e, t) {
    A(this, le) || this.map.setStyle(e, t), ae(this, Y, de).call(this);
  }
  addLayer(e, t) {
    return A(this, le) || this.map.addLayer(e, t), ae(this, Y, de).call(this), this.map;
  }
  moveLayer(e, t) {
    return A(this, le) || this.map.moveLayer(e, t), ae(this, Y, de).call(this), this.map;
  }
  removeLayer(e) {
    return A(this, le) || this.map.removeLayer(e), ae(this, Y, de).call(this), this;
  }
  setLayerZoomRange(e, t, n) {
    return A(this, le) || this.map.setLayerZoomRange(e, t, n), ae(this, Y, de).call(this), this;
  }
  setFilter(e, t, n) {
    return A(this, le) || this.map.setFilter(e, t, n), ae(this, Y, de).call(this), this;
  }
  setPaintProperty(e, t, n, i) {
    return A(this, le) || this.map.setPaintProperty(e, t, n, i), ae(this, Y, de).call(this), this;
  }
  setLayoutProperty(e, t, n, i) {
    return A(this, le) || this.map.setLayoutProperty(e, t, n, i), ae(this, Y, de).call(this), this;
  }
  setGlyphs(e, t) {
    return A(this, le) || this.map.setGlyphs(e, t), ae(this, Y, de).call(this), this;
  }
  onAdd(e) {
    ie(this, he, e), ie(this, Me, Ce("div", "maplibregl-ctrl maplibregl-ctrl-group"));
    for (const [t, n] of Object.entries(A(this, se).containerStyle))
      A(this, Me).style.setProperty(t, n);
    return A(this, se).container = A(this, Me), A(this, se).zoom = e.getZoom() + A(this, se).zoomAdjust, this.map = new Ns(A(this, se)), this.map.once("style.load", () => {
      this.map.resize();
    }), this.map.once("load", () => {
      ae(this, Y, Fs).call(this, A(this, se).parentRect), ie(this, Ut, ae(this, Y, zs).call(this));
    }), A(this, Me);
  }
  onRemove() {
    var e;
    (e = A(this, Ut)) == null || e.call(this), Nt(A(this, Me));
  }
}
se = new WeakMap(), he = new WeakMap(), Me = new WeakMap(), Pe = new WeakMap(), le = new WeakMap(), Ut = new WeakMap(), Y = new WeakSet(), Fs = function(e) {
  e === void 0 || e.linePaint === void 0 && e.fillPaint === void 0 || (ie(this, Pe, {
    type: "Feature",
    properties: {
      name: "parentRect"
    },
    geometry: {
      type: "Polygon",
      coordinates: [[[], [], [], [], []]]
    }
  }), this.map.addSource("parentRect", {
    type: "geojson",
    data: A(this, Pe)
  }), (e.lineLayout !== void 0 || e.linePaint !== void 0) && this.map.addLayer({
    id: "parentRectOutline",
    type: "line",
    source: "parentRect",
    layout: {
      ...e.lineLayout
    },
    paint: {
      "line-color": "#FFF",
      "line-width": 1,
      "line-opacity": 0.85,
      ...e.linePaint
    }
  }), e.fillPaint !== void 0 && this.map.addLayer({
    id: "parentRectFill",
    type: "fill",
    source: "parentRect",
    layout: {},
    paint: {
      "fill-color": "#08F",
      "fill-opacity": 0.135,
      ...e.fillPaint
    }
  }), ae(this, Y, de).call(this));
}, de = function() {
  if (A(this, Pe) === void 0) return;
  const { devicePixelRatio: e } = window, t = A(this, he).getCanvas(), n = t.width / e, i = t.height / e, a = A(this, he).unproject.bind(A(this, he)), o = a([0, 0]), s = a([n, 0]), l = a([0, i]), u = a([n, i]);
  A(this, Pe).geometry.coordinates = [[l.toArray(), u.toArray(), s.toArray(), o.toArray(), l.toArray()]];
  const c = this.map.getSource("parentRect");
  c !== void 0 && c.setData(A(this, Pe));
}, zs = function() {
  const { pitchAdjust: e } = A(this, se), t = () => {
    o("parent");
  }, n = () => {
    o("minimap");
  }, i = () => {
    A(this, he).on("move", t), this.map.on("move", n);
  }, a = () => {
    A(this, he).off("move", t), this.map.off("move", n);
  }, o = (s) => {
    a();
    const l = s === "parent" ? A(this, he) : this.map, u = s === "parent" ? this.map : A(this, he), c = l.getCenter(), p = l.getZoom() + A(this, se).zoomAdjust * (s === "parent" ? 1 : -1), f = l.getBearing(), d = l.getPitch();
    u.jumpTo({
      center: c,
      zoom: p,
      bearing: f,
      pitch: e ? d : 0
    }), ae(this, Y, de).call(this), i();
  };
  return i(), () => {
    a();
  };
};
const xa = 256, If = C.LngLatBounds;
function At(r, e) {
  const t = Math.pow(2, e);
  return (r + 180) / 360 * t;
}
function Nn(r, e) {
  const t = r * Math.PI / 180, n = Math.pow(2, e);
  return (1 - Math.log(Math.tan(t) + 1 / Math.cos(t)) / Math.PI) / 2 * n;
}
function Mf(r, e, t) {
  const n = If.convert(r), i = n.getSouthWest(), a = n.getNorthEast(), o = [];
  for (let s = Math.floor(e); s <= Math.ceil(t); s++) {
    const l = Math.pow(2, s), u = Math.floor(Math.min(At(i.lng, s), At(a.lng, s))), c = Math.floor(Math.max(At(i.lng, s), At(a.lng, s))), p = Math.floor(Nn(i.lat, s)), f = Math.floor(Nn(a.lat, s)), d = Math.min(p, f), h = Math.max(p, f);
    for (let m = u; m <= c; m++)
      for (let g = d; g <= h; g++) {
        const v = (m % l + l) % l;
        g >= 0 && g < l && o.push({ z: s, x: v, y: g });
      }
  }
  return o;
}
function Pf(r, e, t) {
  const n = Math.floor(r.zoom), i = Math.pow(2, n), a = At(r.lng, n), o = Nn(r.lat, n), s = e / xa, l = t / xa, u = (r.pitch ?? 0) / 90 * l, c = Math.floor(a - s / 2) - 1, p = Math.ceil(a + s / 2) + 1, f = Math.floor(o - l / 2 - u) - 1, d = Math.ceil(o + l / 2) + 1, h = [];
  for (let m = c; m <= p; m++)
    for (let g = f; g <= d; g++) {
      const v = (m % i + i) % i;
      g >= 0 && g < i && h.push({ z: n, x: v, y: g });
    }
  return h;
}
function _f(r, e, t) {
  const n = [];
  for (let i = 0; i <= t; i++) {
    const a = i / t;
    n.push({
      lng: J(r.lng, e.lng, a),
      lat: J(r.lat, e.lat, a),
      zoom: J(r.zoom, e.zoom, a),
      pitch: J(r.pitch ?? 0, e.pitch ?? 0, a),
      bearing: J(r.bearing ?? 0, e.bearing ?? 0, a)
    });
  }
  return n;
}
function Of(r) {
  const e = r.split("/");
  if (e.length !== 3) return null;
  const [t, n, i] = e.map(Number);
  return isNaN(t) || isNaN(n) || isNaN(i) ? null : { z: t, x: n, y: i };
}
function Ds(r) {
  return [r.z, r.x, r.y].join("/");
}
function Rf(r, e) {
  return r.replace("{z}", String(e.z)).replace("{x}", String(e.x)).replace("{y}", String(e.y));
}
function Ca(r) {
  const e = /* @__PURE__ */ new Set();
  return r.filter((t) => {
    const n = Ds(t);
    return e.has(n) ? !1 : (e.add(n), !0);
  });
}
const Ff = 16;
function zf(r) {
  const e = r.getStyle();
  if (!(e != null && e.sources)) return {};
  const t = {};
  for (const n of Object.keys(e.sources)) {
    const i = r.getSource(n);
    if (!i) continue;
    const a = i;
    Array.isArray(a.tiles) && a.tiles.length > 0 && (t[n] = a);
  }
  return t;
}
function Df(r, e) {
  const t = Ds(e), n = [];
  for (const i of Object.values(r)) {
    const a = Rf(i.tiles[0], e);
    n.push({ url: a, tileID: t });
  }
  return n;
}
class Nf {
  constructor(e) {
    y(this, "map");
    y(this, "activeAbortControllers", /* @__PURE__ */ new Map());
    this.map = e;
  }
  /**
   * Cancels all in-flight preload requests. Called automatically when a new
   * camera movement begins so stale prefetches do not waste quota.
   */
  abortAll() {
    for (const e of this.activeAbortControllers.values())
      e.abort();
    this.activeAbortControllers.clear();
  }
  /**
   * Preloads all tiles within a geographic bounds across a range of zoom levels.
   *
   * @remarks
   * **API Key Usage**: Tile count grows exponentially with zoom level. A wide zoom
   * range over a large area can trigger thousands of requests.
   * @param {PreloadTilesForBoundsOptions} options Options for preloading tiles for bounds.
   * @returns A promise that resolves when the preloading is complete.
   * @example
   * ```ts
   * await map.preloadTilesForBounds({
   *   bounds: map.getBounds(),
   *   minZoom: 8,
   *   maxZoom: 12,
   * });
   */
  async preloadForBounds({ bounds: e, minZoom: t, maxZoom: n, onProgress: i, onError: a }) {
    const o = Ca(Mf(e, t, n));
    await this.fetchTiles(o, { onProgress: i, onError: a });
  }
  /**
   * Preloads tiles visible from each of the given camera positions.
   *
   * @remarks
   * **API Key Usage**: Each position triggers requests for all tiles visible from
   * that viewpoint. More positions at higher zoom levels increase API usage significantly.
   */
  async preloadForCameraPositions({ positions: e, onProgress: t, onError: n }) {
    const { width: i, height: a } = this.map.transform, o = [];
    for (const s of e)
      o.push(...Pf(s, i, a));
    return await this.fetchTiles(Ca(o), { onProgress: t, onError: n }), o;
  }
  /**
   * Preloads a specific set of tiles by their IDs (`"z/x/y"` format).
   * @param {PreloadTilesOptions} options - The options for preloading tiles by tile IDs.
   * @returns A promise that resolves when the preloading is complete.
   * @example
   * ```ts
   * await map.preloadByTileIDs({
   *   tileIDs: ["12/1205/1540", "12/1206/1540"],
   * });
   * ```
   */
  async preloadByTileIDs({ tileIDs: e, onProgress: t, onError: n }) {
    const i = [];
    for (const a of e) {
      const o = Of(a);
      o && i.push(o);
    }
    await this.fetchTiles(i, { onProgress: t, onError: n });
  }
  /**
   * Preloads tiles along a linear camera path (used by panTo and easeTo overrides).
   * @param {PreloadTilesForLinearPathOptions} options - The options for preloading tiles along a linear camera path.
   * @returns A promise that resolves when the preloading is complete.
   * @example
   * ```ts
   * await map.preloadForLinearPath({
   *   start: { lng: -74.006, lat: 40.7128, zoom: 12 },
   *   end: { lng: -73.935, lat: 40.730, zoom: 14 },
   * });
   * ```
   */
  preloadForLinearPath({ start: e, end: t, onProgress: n, onError: i }) {
    const a = _f(e, t, D.experimental_defaultPathSampleSteps);
    return this.preloadForCameraPositions({ positions: a, onProgress: n, onError: i });
  }
  //#region fetchTiles
  /**
   * Fetches tiles for the given tile coordinates and stores them in the SDK tile cache.
   * @param tiles - The tile coordinates to fetch.
   * @param {TilePreloadOptions} callbacks - The callbacks for the preloading.
   * @returns A promise that resolves when the preloading is complete.
   */
  async fetchTiles(e, t) {
    const n = zf(this.map), i = (t == null ? void 0 : t.maxTiles) ?? 512, a = [];
    for (const f of e)
      if (a.push(...Df(n, f)), a.length >= i) break;
    a.length >= i && console.warn(
      // we are okay with type coercion here, it's just a warning message
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `[MapTiler SDK] Tile preloading capped at ${i} tiles, the remaining ${a.length - i} tile preloads will be skipped. Increase the \`maxTiles\` option to load more.`
    );
    const o = a.length;
    let s = 0;
    const l = new AbortController(), u = Bt();
    this.activeAbortControllers.set(u, l);
    const c = Math.min(Ff, o), p = a.slice();
    try {
      await Promise.all(
        Array.from({ length: c }, async () => {
          var f, d;
          for (; ; ) {
            const h = p.shift();
            if (!h) break;
            try {
              await xc(h.url, l.signal);
            } catch (m) {
              (f = t == null ? void 0 : t.onError) == null || f.call(t, m);
            } finally {
              s++, (d = t == null ? void 0 : t.onProgress) == null || d.call(t, s, o, h.tileID);
            }
          }
        })
      );
    } finally {
      this.activeAbortControllers.delete(u);
    }
  }
  //#endregion
}
class $f {
  /**
   *
   * @param map : a Map instance
   * @param delay : a delay in milliseconds after which the payload is sent to MapTiler cloud (cannot be less than 1000ms)
   */
  constructor(e, t = 2e3) {
    y(this, "map");
    y(this, "registeredModules", /* @__PURE__ */ new Set());
    y(this, "viewerType");
    this.map = e, this.viewerType = "Map", setTimeout(
      async () => {
        if (!D.telemetry)
          return;
        const n = this.preparePayload();
        try {
          (await fetch(n, { method: "POST" })).ok || console.warn("The metrics could not be sent to MapTiler Cloud");
        } catch (i) {
          console.warn("The metrics could not be sent to MapTiler Cloud", i);
        }
      },
      Math.max(1e3, t)
    );
  }
  /**
   * Register a module to the telemetry system of the SDK.
   * The arguments `name` and `version` likely come from the package.json
   * of each module.
   */
  registerModule(e, t) {
    this.registeredModules.add(`${e}:${t}`);
  }
  registerViewerType(e = "Map") {
    this.viewerType = e;
  }
  preparePayload() {
    const e = new URL(re.telemetryURL);
    return e.searchParams.append("sdk", ul()), e.searchParams.append("key", D.apiKey), e.searchParams.append("mtsid", Or), e.searchParams.append("session", D.session ? "1" : "0"), e.searchParams.append("caching", D.caching ? "1" : "0"), e.searchParams.append("lang-updated", this.map.isLanguageUpdated() ? "1" : "0"), e.searchParams.append("terrain", this.map.getTerrain() ? "1" : "0"), e.searchParams.append("globe", this.map.isGlobeProjection() ? "1" : "0"), e.searchParams.append("viewerType", this.viewerType), this.registeredModules.size > 0 && e.searchParams.append("modules", Array.from(this.registeredModules).join("|")), e.href;
  }
}
var $t = typeof Float32Array < "u" ? Float32Array : Array;
function Mt() {
  var r = new $t(16);
  return $t != Float32Array && (r[1] = 0, r[2] = 0, r[3] = 0, r[4] = 0, r[6] = 0, r[7] = 0, r[8] = 0, r[9] = 0, r[11] = 0, r[12] = 0, r[13] = 0, r[14] = 0), r[0] = 1, r[5] = 1, r[10] = 1, r[15] = 1, r;
}
function jf(r, e, t, n, i, a, o, s, l, u, c, p, f, d, h, m, g) {
  return r[0] = e, r[1] = t, r[2] = n, r[3] = i, r[4] = a, r[5] = o, r[6] = s, r[7] = l, r[8] = u, r[9] = c, r[10] = p, r[11] = f, r[12] = d, r[13] = h, r[14] = m, r[15] = g, r;
}
function Uf(r, e, t) {
  var n = e[0], i = e[1], a = e[2], o = e[3], s = e[4], l = e[5], u = e[6], c = e[7], p = e[8], f = e[9], d = e[10], h = e[11], m = e[12], g = e[13], v = e[14], b = e[15], x = t[0], k = t[1], L = t[2], E = t[3];
  return r[0] = x * n + k * s + L * p + E * m, r[1] = x * i + k * l + L * f + E * g, r[2] = x * a + k * u + L * d + E * v, r[3] = x * o + k * c + L * h + E * b, x = t[4], k = t[5], L = t[6], E = t[7], r[4] = x * n + k * s + L * p + E * m, r[5] = x * i + k * l + L * f + E * g, r[6] = x * a + k * u + L * d + E * v, r[7] = x * o + k * c + L * h + E * b, x = t[8], k = t[9], L = t[10], E = t[11], r[8] = x * n + k * s + L * p + E * m, r[9] = x * i + k * l + L * f + E * g, r[10] = x * a + k * u + L * d + E * v, r[11] = x * o + k * c + L * h + E * b, x = t[12], k = t[13], L = t[14], E = t[15], r[12] = x * n + k * s + L * p + E * m, r[13] = x * i + k * l + L * f + E * g, r[14] = x * a + k * u + L * d + E * v, r[15] = x * o + k * c + L * h + E * b, r;
}
function Bf(r, e, t) {
  var n = t[0], i = t[1], a = t[2];
  return r[0] = e[0] * n, r[1] = e[1] * n, r[2] = e[2] * n, r[3] = e[3] * n, r[4] = e[4] * i, r[5] = e[5] * i, r[6] = e[6] * i, r[7] = e[7] * i, r[8] = e[8] * a, r[9] = e[9] * a, r[10] = e[10] * a, r[11] = e[11] * a, r[12] = e[12], r[13] = e[13], r[14] = e[14], r[15] = e[15], r;
}
function Aa(r, e, t) {
  var n = Math.sin(t), i = Math.cos(t), a = e[4], o = e[5], s = e[6], l = e[7], u = e[8], c = e[9], p = e[10], f = e[11];
  return e !== r && (r[0] = e[0], r[1] = e[1], r[2] = e[2], r[3] = e[3], r[12] = e[12], r[13] = e[13], r[14] = e[14], r[15] = e[15]), r[4] = a * i + u * n, r[5] = o * i + c * n, r[6] = s * i + p * n, r[7] = l * i + f * n, r[8] = u * i - a * n, r[9] = c * i - o * n, r[10] = p * i - s * n, r[11] = f * i - l * n, r;
}
function Vf(r, e, t) {
  var n = Math.sin(t), i = Math.cos(t), a = e[0], o = e[1], s = e[2], l = e[3], u = e[8], c = e[9], p = e[10], f = e[11];
  return e !== r && (r[4] = e[4], r[5] = e[5], r[6] = e[6], r[7] = e[7], r[12] = e[12], r[13] = e[13], r[14] = e[14], r[15] = e[15]), r[0] = a * i - u * n, r[1] = o * i - c * n, r[2] = s * i - p * n, r[3] = l * i - f * n, r[8] = a * n + u * i, r[9] = o * n + c * i, r[10] = s * n + p * i, r[11] = l * n + f * i, r;
}
function La(r, e, t) {
  var n = Math.sin(t), i = Math.cos(t), a = e[0], o = e[1], s = e[2], l = e[3], u = e[4], c = e[5], p = e[6], f = e[7];
  return e !== r && (r[8] = e[8], r[9] = e[9], r[10] = e[10], r[11] = e[11], r[12] = e[12], r[13] = e[13], r[14] = e[14], r[15] = e[15]), r[0] = a * i + u * n, r[1] = o * i + c * n, r[2] = s * i + p * n, r[3] = l * i + f * n, r[4] = u * i - a * n, r[5] = c * i - o * n, r[6] = p * i - s * n, r[7] = f * i - l * n, r;
}
function qf(r, e, t, n, i) {
  var a = 1 / Math.tan(e / 2);
  if (r[0] = a / t, r[1] = 0, r[2] = 0, r[3] = 0, r[4] = 0, r[5] = a, r[6] = 0, r[7] = 0, r[8] = 0, r[9] = 0, r[11] = -1, r[12] = 0, r[13] = 0, r[15] = 0, i != null && i !== 1 / 0) {
    var o = 1 / (n - i);
    r[10] = (i + n) * o, r[14] = 2 * i * n * o;
  } else
    r[10] = -1, r[14] = -2 * n;
  return r;
}
var Gf = qf;
function br() {
  var r = new $t(3);
  return $t != Float32Array && (r[0] = 0, r[1] = 0, r[2] = 0), r;
}
function Hf(r, e, t) {
  var n = new $t(3);
  return n[0] = r, n[1] = e, n[2] = t, n;
}
function mn(r, e) {
  var t = e[0], n = e[1], i = e[2], a = t * t + n * n + i * i;
  return a > 0 && (a = 1 / Math.sqrt(a)), r[0] = e[0] * a, r[1] = e[1] * a, r[2] = e[2] * a, r;
}
function Ea(r, e, t) {
  var n = e[0], i = e[1], a = e[2], o = t[0], s = t[1], l = t[2];
  return r[0] = i * l - a * s, r[1] = a * o - n * l, r[2] = n * s - i * o, r;
}
(function() {
  var r = br();
  return function(e, t, n, i, a, o) {
    var s, l;
    for (t || (t = 3), n || (n = 0), i ? l = Math.min(i * t + n, e.length) : l = e.length, s = n; s < l; s += t)
      r[0] = e[s], r[1] = e[s + 1], r[2] = e[s + 2], a(r, r, o), e[s] = r[0], e[s + 1] = r[1], e[s + 2] = r[2];
    return e;
  };
})();
const vi = 1, U = vi / 2, B = vi / 2, V = vi / 2, Kf = [-U, -B, V, U, -B, V, U, B, V, -U, B, V], Zf = [-U, -B, -V, -U, B, -V, U, B, -V, U, -B, -V], Wf = [-U, B, -V, -U, B, V, U, B, V, U, B, -V], Yf = [-U, -B, -V, U, -B, -V, U, -B, V, -U, -B, V], Xf = [U, -B, -V, U, B, -V, U, B, V, U, -B, V], Jf = [-U, -B, -V, -U, -B, V, -U, B, V, -U, B, -V], Qf = [...Kf, ...Zf, ...Wf, ...Yf, ...Xf, ...Jf], ed = [
  // Front
  0,
  1,
  2,
  0,
  2,
  3,
  // Back
  4,
  5,
  6,
  4,
  6,
  7,
  // Left
  8,
  9,
  10,
  8,
  10,
  11,
  // Right
  12,
  13,
  14,
  12,
  14,
  15,
  // Up
  16,
  17,
  18,
  16,
  18,
  19,
  // Down
  20,
  21,
  22,
  20,
  22,
  23
], td = `attribute vec3 a_vertexPosition;
varying vec3 vTextureCoord;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;
  
void main(void) {
  vTextureCoord = vec3(-a_vertexPosition.x, a_vertexPosition.y, a_vertexPosition.z);
  gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_vertexPosition, 1.0);
}
`, Ta = `precision mediump float;

varying vec3 vTextureCoord;

%USE_TEXTURE_MACRO_MARKER%

# ifdef USE_TEXTURE
uniform samplerCube u_cubeSampler;
uniform float u_fadeOpacity;
# endif

uniform vec4 u_bgColor;

void main(void) {
  #ifdef USE_TEXTURE
  vec4 texColor = textureCube(u_cubeSampler, vTextureCoord);

    gl_FragColor = mix(
      u_bgColor,
      texColor,
      min(texColor.a, u_fadeOpacity)
    );

    gl_FragColor.a = max(gl_FragColor.a, u_fadeOpacity);

  #else
  gl_FragColor = u_bgColor;
  #endif
}
`;
var rd = /* @__PURE__ */ ((r) => (r.UNIVERSE_DARK = "universe-dark", r))(rd || {});
const Fe = {
  stars: {
    color: "hsl(233,100%,92%)",
    preset: "stars"
  },
  space: {
    color: "hsl(210, 100%, 4%)",
    preset: "space"
  },
  milkyway: {
    color: "hsl(233,100%,92%)",
    preset: "milkyway"
  },
  "milkyway-subtle": {
    color: "hsl(233,100%,92%)",
    preset: "milkyway-subtle"
  },
  "milkyway-bright": {
    color: "hsl(233,100%,92%)",
    preset: "milkyway-bright"
  },
  "milkyway-colored": {
    color: "black",
    preset: "milkyway-colored"
  }
};
var $e = /* @__PURE__ */ ((r) => (r.POSITIVE_X = "pX", r.NEGATIVE_X = "nX", r.POSITIVE_Y = "pY", r.NEGATIVE_Y = "nY", r.POSITIVE_Z = "pZ", r.NEGATIVE_Z = "nZ", r))($e || {});
const tt = /* @__PURE__ */ new Map();
function nd(r) {
  const e = tt.get(r);
  e && (tt.delete(r), r.deleteTexture(e));
}
const ka = /* @__PURE__ */ new Map();
let Ia;
function id({ gl: r, faces: e, onReady: t, forceRefresh: n }) {
  if (tt.get(r) && !n && Ia === JSON.stringify(e)) {
    t(tt.get(r), ka.get(r));
    return;
  }
  Ia = JSON.stringify(e);
  const i = tt.get(r) ?? r.createTexture();
  if (r.bindTexture(r.TEXTURE_CUBE_MAP, i), !e) {
    console.warn("[CubemapLayer][loadCubemapTexture]: Faces are null");
    return;
  }
  const a = Object.keys(e).length;
  if (a !== 6) {
    console.warn(`[CubemapLayer][loadCubemapTexture]: Faces should contain exactly 6 images, but found ${a}`);
    return;
  }
  const o = Object.entries(e).map(([s, l]) => new Promise((u, c) => {
    const p = s;
    if (l === void 0) {
      c(new Error(`[CubemapLayer][loadCubemapTexture]: Face ${s} is undefined`));
      return;
    }
    const f = new Image();
    f.crossOrigin = "anonymous";
    const d = () => {
      u({ image: f, key: p });
    };
    f.src = l, f.complete && f.naturalWidth > 0 ? d() : f.onload = d, f.onerror = () => {
      c(new Error(`[CubemapLayer][loadCubemapTexture]: Error loading image ${l}`));
    };
  }));
  Promise.all(o).then((s) => {
    for (let u = 0; u < s.length; u++) {
      const p = r.RGBA, f = r.RGBA, d = r.UNSIGNED_BYTE, { image: h, key: m } = s[u] ?? {};
      if (!h || !m) {
        console.warn("[CubemapLayer][loadCubemapTexture]: Image or key is null");
        continue;
      }
      const g = ad(r, m);
      r.bindTexture(r.TEXTURE_CUBE_MAP, i), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_MAG_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_MIN_FILTER, r.LINEAR), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_WRAP_S, r.CLAMP_TO_EDGE), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_WRAP_T, r.CLAMP_TO_EDGE), r.texImage2D(g, 0, p, f, d, h);
    }
    r.bindTexture(r.TEXTURE_CUBE_MAP, i), r.generateMipmap(r.TEXTURE_CUBE_MAP), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_MIN_FILTER, r.LINEAR_MIPMAP_LINEAR), r.texParameteri(r.TEXTURE_CUBE_MAP, r.TEXTURE_MAG_FILTER, r.LINEAR);
    const l = s.map((u) => u.image);
    t(i, l), ka.set(r, l), tt.set(r, i);
  }).catch((s) => {
    console.error("[CubemapLayer][loadCubemapTexture]: Error loading cubemap texture", s);
  });
}
function ad(r, e) {
  if (e === $e.POSITIVE_X)
    return r.TEXTURE_CUBE_MAP_POSITIVE_X;
  if (e === $e.NEGATIVE_X)
    return r.TEXTURE_CUBE_MAP_NEGATIVE_X;
  if (e === $e.POSITIVE_Y)
    return r.TEXTURE_CUBE_MAP_POSITIVE_Y;
  if (e === $e.NEGATIVE_Y)
    return r.TEXTURE_CUBE_MAP_NEGATIVE_Y;
  if (e === $e.POSITIVE_Z)
    return r.TEXTURE_CUBE_MAP_POSITIVE_Z;
  if (e === $e.NEGATIVE_Z)
    return r.TEXTURE_CUBE_MAP_NEGATIVE_Z;
  throw new Error(`[CubemapLayer][loadCubemapTexture]: Invalid key ${e}`);
}
const Ye = "https://api.maptiler.com/resources/space", od = ["vertexPosition"], sd = ["projectionMatrix", "modelViewMatrix", "cubeSampler", "bgColor", "fadeOpacity"], Ma = "%USE_TEXTURE_MACRO_MARKER%", ld = "#define USE_TEXTURE", Pa = Fe.stars;
function ud(r, e) {
  if (!$n(r))
    return {
      color: "transparent"
    };
  if (r === !0)
    return e;
  const t = {
    ...r
  };
  if (r.faces || r.path)
    return delete t.preset, t;
  const n = r.preset;
  if (!(n === void 0) && !(n in Fe))
    throw new Error(`[CubemapLayer]: Invalid preset "${n}". Available presets: ${Object.keys(Fe).join(", ")}`);
  return {
    ...t,
    // this _could_ be nullish_
    color: t.color ?? Fe[n].color ?? "hsl(233,100%,92%)"
  };
}
class ir {
  /**
   * Creates a new instance of CubemapLayer
   *
   * @param {CubemapLayerConstructorOptions | true} cubemapConfig - Configuration options for the cubemap layer or `true` to use default options.
   * Can specify faces, preset, path, and color properties to configure the cubemap.
   *
   * @remarks You shouldn't have to use this class directly.
   * Instead, use the `Map.setHalo` method to create and add a halo layer to the map.
   * The constructor initializes the cubemap with the provided configuration.
   * It processes the faces definition, sets up background colors, and determines
   * whether to use a cubemap texture based on the provided options.
   */
  constructor(e) {
    y(this, "id", "Cubemap Layer");
    y(this, "type", "custom");
    y(this, "renderingMode", "3d");
    /**
     * The map instance to which this layer is added.
     * @type {MapSDK}
     * @private
     */
    y(this, "map");
    /**
     * The cubemap faces definition, which can be either a preset, path, or explicit face URLs.
     * @type {CubemapFaces | null}
     * @remarks
     * This property is set during the initialization of the layer and can be updated later.
     * If no faces are defined, it will be `null`.
     */
    y(this, "faces");
    /**
     * Indicates whether to use a cubemap texture for rendering.
     * @type {boolean}
     * @private
     * @default true
     */
    y(this, "useCubemapTexture", !0);
    /**
     * The current opacity of the fade effect applied to the cubemap image texture, used for fading in and out.
     * @type {number}
     * @private
     * @default 0.0
     */
    y(this, "currentFadeOpacity", 0);
    /**
     * Indicates whether the cubemap needs to be updated, typically when the faces or texture changes.
     * @type {boolean}
     * @private
     * @default false
     */
    y(this, "cubeMapNeedsUpdate", !1);
    /**
     * The background color of the cubemap layer, represented as a Vec4 (RGBA).
     * @type {Vec4}
     * @private
     */
    y(this, "bgColor");
    /**
     * The previous background color used for transition animations.
     * @type {Vec4}
     * @private
     */
    y(this, "previousBgColor", [0, 0, 0, 0]);
    /**
     * The target background color to which the layer will transition.
     * @type {Vec4}
     * @private
     */
    y(this, "targetBgColor", [0, 0, 0, 0]);
    /**
     * The delta value used for transitioning the background color. 0 = start of transition, 1 = end of transition.
     * This value is incremented over time to create a smooth transition effect.
     * @type {number}
     * @private
     */
    y(this, "transitionDelta", 0);
    /**
     * The WebGL context used for rendering the cubemap layer.
     * @type {WebGLContext}
     * @private
     */
    y(this, "gl");
    /**
     * The cubemap object that contains the shader program, buffers and uniform locations for rendering.
     * @type {Object3D}
     * @private
     */
    y(this, "cubemap");
    /**
     * The WebGL texture used for the cubemap, which is created from the defined faces.
     * This texture is used to render the cubemap in the scene.
     * @type {WebGLTexture | undefined}
     * @private
     */
    y(this, "texture");
    /**
     * The key representing the current faces definition, used to diff / track changes in the cubemap faces.
     * @type {string}
     */
    y(this, "currentFacesDefinitionKey", "");
    /**
     * The configuration options for the cubemap layer.
     * @type {CubemapLayerConstructorOptions}
     * @private
     */
    y(this, "options");
    y(this, "animationActive", !0);
    /**
     * Animates the cubemap image fading in.
     * This method gradually increases the opacity of the cubemap image to create a fade-in effect.
     *
     * @private
     */
    y(this, "imageIsAnimating", !1);
    /**
     * The delta value used for the image fade-in animation.
     * This value is incremented over time to create a smooth fade-in effect.
     * @type {number}
     * @private
     */
    y(this, "imageFadeInDelta", 0);
    const t = $n(e);
    if (t.length > 0)
      throw new Error(`[CubemapLayer]: Invalid cubemap specification:
- ${t.join(`
 - `)}`);
    const n = ud(e, Pa);
    this.options = n, this.currentFacesDefinitionKey = JSON.stringify(n.faces ?? n.preset ?? n.path), this.bgColor = [0, 0, 0, 0], this.targetBgColor = Tt(n.color), this.faces = _a(n), this.useCubemapTexture = this.faces !== null;
  }
  /**
   * Updates the cubemap object with the current faces and shader configuration.
   * This method is called when the cubemap faces change or when the layer is initialized.
   * @returns {void}
   * @remarks
   * It creates a new Object3D instance with the specified vertex and fragment shaders,
   * attributes, and uniforms. The cubemap will be rendered using this configuration.
   */
  updateCubemap({ facesNeedUpdate: e } = { facesNeedUpdate: !0 }) {
    this.useCubemapTexture = this.faces !== null;
    const t = sd.filter((n) => n === "cubeSampler" || n === "fadeOpacity" ? this.useCubemapTexture : !0);
    this.cubemap = bo({
      gl: this.gl,
      vertexShaderSource: td,
      // Because we only want to use the read the texture in gl if we're supposed to
      fragmentShaderSource: this.useCubemapTexture ? Ta.replace(Ma, ld) : Ta.replace(Ma, ""),
      attributesKeys: od,
      uniformsKeys: t,
      vertices: Qf,
      indices: ed
    }), this.cubeMapNeedsUpdate = e, this.useCubemapTexture && this.updateTexture(this.gl, this.faces), this.animateColorChange();
  }
  /**
   * Called when the layer is added to the map.
   * Initializes the cubemap and sets up the WebGL context.
   *
   * @param {MapSDK} map - The map instance to which this layer is added.
   * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL context used for rendering.
   */
  onAdd(e, t) {
    this.map = e, this.gl = t, this.updateCubemap();
  }
  /**
   * Called when the layer is removed from the map.
   * Cleans up the cubemap resources and WebGL buffers.
   *
   * @param {MapSDK} _map - The map instance from which this layer is removed.
   * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL context used for rendering.
   */
  onRemove(e, t) {
    this.cubemap && (this.texture && (nd(t), this.texture = void 0), t.deleteProgram(this.cubemap.shaderProgram), t.deleteBuffer(this.cubemap.positionBuffer), this.fireEvent("cubemaplayer:onremove", this));
  }
  /**
   * Updates the cubemap texture with the provided faces.
   * This method is called when the cubemap faces change or when the layer is initialized.
   *
   * @param {WebGLContext} gl - The WebGL context used for rendering.
   * @param {CubemapFaces} faces - The cubemap faces to be loaded into the texture.
   */
  updateTexture(e, t) {
    if (this.cubeMapNeedsUpdate === !0 && !this.imageIsAnimating) {
      if (this.cubeMapNeedsUpdate = !1, !this.useCubemapTexture)
        return;
      id({
        gl: e,
        faces: t,
        onReady: (n) => {
          this.texture = n, this.animateIn();
        }
      });
    }
  }
  /**
   * Called before the layer is rendered.
   * Updates the cubemap texture with the current faces.
   *
   * @param {WebGLContext} gl - The WebGL context used for rendering.
   * @param {CustomRenderMethodInput} _options - Additional options for the render method.
   */
  prerender(e, t) {
    this.faces && this.updateTexture(this.gl, this.faces);
  }
  /**
   * Lerps the background color transition of the cubemap layer.
   * This method smoothly transitions the background color from the previous color to the target color.
   *
   * @private
   */
  animateColorChange() {
    const e = () => {
      this.transitionDelta < 1 && (requestAnimationFrame(e), this.bgColor = cu(this.previousBgColor, this.targetBgColor, this.transitionDelta), this.transitionDelta += 0.075, this.map.triggerRepaint());
    };
    requestAnimationFrame(e);
  }
  /**
   * Animates the cubemap image fading in.
   * This method gradually increases the opacity of the cubemap image to create a fade-in effect.
   * @private
   */
  async animateIn() {
    if (!this.imageIsAnimating) {
      if (!this.animationActive) {
        this.currentFadeOpacity = 1, this.imageFadeInDelta = 1, this.map.triggerRepaint();
        return;
      }
      return new Promise((e) => {
        this.imageIsAnimating = !0;
        const t = () => {
          if (this.imageFadeInDelta = Math.min(this.imageFadeInDelta + 0.05, 1), this.currentFadeOpacity = J(0, 1, this.imageFadeInDelta), this.map.triggerRepaint(), this.imageFadeInDelta < 1) {
            requestAnimationFrame(t);
            return;
          }
          this.imageIsAnimating = !1, this.imageFadeInDelta = 0, this.fireEvent("cubemaplayer:animateindone", this), e();
        };
        requestAnimationFrame(t);
      });
    }
  }
  /**
   * Animates the cubemap image fading out.
   * This method gradually decreases the opacity of the cubemap image to create a fade-out effect.
   * @returns {Promise<void>} A promise that resolves when the animation is complete.
   * @private
   */
  async animateOut() {
    if (!(this.imageIsAnimating || !this.animationActive))
      return new Promise((e) => {
        const t = () => {
          if (this.imageFadeInDelta = Math.min(this.imageFadeInDelta + 0.05, 1), this.currentFadeOpacity = J(1, 0, this.imageFadeInDelta), this.map.triggerRepaint(), this.imageFadeInDelta >= 1) {
            this.imageIsAnimating = !1, this.imageFadeInDelta = 0, this.fireEvent("cubemaplayer:animateoutdone", this), e();
            return;
          }
          requestAnimationFrame(t);
        };
        requestAnimationFrame(t);
      });
  }
  fireEvent(e, t) {
    this.map.fire(e, t);
  }
  setAnimationActive(e) {
    this.animationActive = e;
  }
  /**
   * Renders the cubemap layer to the WebGL context.
   * This method is called internally during the rendering phase of the map.
   *
   * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL context used for rendering.
   * @param {CustomRenderMethodInput} _options - Additional options for the render method.
   * @throws Error if the map, cubemap, or texture is undefined.
   */
  render(e, t) {
    if (!this.map.isGlobeProjection())
      return;
    if (this.map === void 0)
      throw new Error("[CubemapLayer]: Map is undefined");
    if (this.cubemap === void 0)
      throw new Error("[CubemapLayer]: Cubemap is undefined");
    this.texture, e.disable(e.DEPTH_TEST), e.enable(e.BLEND), e.blendFunc(e.SRC_ALPHA, e.DST_ALPHA), e.useProgram(this.cubemap.shaderProgram), e.bindBuffer(e.ARRAY_BUFFER, this.cubemap.positionBuffer), e.vertexAttribPointer(this.cubemap.programInfo.attributesLocations.vertexPosition, 3, e.FLOAT, !1, 0, 0), e.enableVertexAttribArray(this.cubemap.programInfo.attributesLocations.vertexPosition);
    const n = 0.1, i = 1e4, a = e.canvas, o = a.clientWidth / a.clientHeight, s = this.map.transform, l = s.fov * (Math.PI / 180), u = Mt();
    Gf(u, l, o, n, i), La(u, u, s.rollInRadians), Aa(u, u, -s.pitchInRadians), La(u, u, s.bearingInRadians);
    const c = s.center.lat * Math.PI / 180, p = s.center.lng * Math.PI / 180;
    Aa(u, u, c), Vf(u, u, -p), e.uniformMatrix4fv(this.cubemap.programInfo.uniformsLocations.projectionMatrix, !1, u);
    const f = Mt();
    if (e.uniformMatrix4fv(this.cubemap.programInfo.uniformsLocations.modelViewMatrix, !1, f), e.uniform4fv(this.cubemap.programInfo.uniformsLocations.bgColor, new Float32Array(this.bgColor)), e.uniform1f(this.cubemap.programInfo.uniformsLocations.fadeOpacity, this.currentFadeOpacity), this.useCubemapTexture && this.texture && (e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_CUBE_MAP, this.texture), e.uniform1i(this.cubemap.programInfo.uniformsLocations.cubeSampler, 0)), this.cubemap.indexBuffer === void 0)
      throw new Error("Index buffer is undefined");
    if (this.cubemap.indexBufferLength === void 0)
      throw new Error("Index buffer length is undefined");
    e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, this.cubemap.indexBuffer), e.drawElements(e.TRIANGLES, this.cubemap.indexBufferLength, e.UNSIGNED_SHORT, 0);
  }
  setBgColor(e) {
    this.targetBgColor = e, this.previousBgColor = this.bgColor, this.transitionDelta = 0;
  }
  /**
   * Returns the current configuration options for the cubemap layer.
   * @returns {CubemapLayerConstructorOptions} The current configuration options.
   */
  getConfig() {
    return this.options;
  }
  /**
   * Checks if the cubemap needs to be updated based on the provided specification.
   *
   * @param {CubemapDefinition} spec - The cubemap specification to compare with the current cubemap.
   * @returns {boolean} True if the cubemap needs to be updated, false otherwise.
   */
  shouldUpdate(e) {
    const t = this.getConfig();
    if (e === void 0 && t)
      return !0;
    const n = typeof e == "boolean" ? e : Sr(e), i = Sr(t);
    return JSON.stringify(n) !== JSON.stringify(i);
  }
  async setCubemapFaces(e) {
    if (await this.animateOut(), !e.faces && !e.preset && !e.path) {
      this.faces = null, this.useCubemapTexture = !1, this.currentFacesDefinitionKey = "empty", await this.animateIn();
      return;
    }
    this.faces = _a(e), this.currentFacesDefinitionKey = JSON.stringify(e.faces ?? e.preset ?? e.path);
  }
  /**
   * Sets the cubemap for the layer based on the provided definition.
   * This method updates the cubemap faces, background color, and triggers a repaint of the map.
   *
   * @param {CubemapDefinition} cubemap - The cubemap definition containing faces, preset, path, or color.
   * @returns {Promise<void>} A promise that resolves when the cubemap is set and the map is updated.
   * @remarks
   * This method checks if the provided cubemap definition has a color, and if so, it updates the background color.
   * It also checks if the faces definition has changed compared to the current one,
   * and if so, it updates the cubemap faces.
   * Finally, it calls `updateCubemap` to apply the changes and trigger a repaint of the map.
   */
  async setCubemap(e) {
    const t = $n(e);
    if (t.length > 0)
      throw new Error(`[CubemapLayer]: Invalid cubemap specification:
- ${t.join(`
 - `)}`);
    const n = typeof e == "boolean" ? Pa : e;
    this.options = n;
    const i = JSON.stringify(n.faces ?? n.preset ?? n.path), a = this.currentFacesDefinitionKey !== i;
    a && (await this.setCubemapFaces(n), this.cubeMapNeedsUpdate = !0);
    const o = Tt(n.color);
    if (n.color && this.targetBgColor.toString() !== o.toString())
      this.setBgColor(o);
    else if (!n.color && n.preset && n.preset in Fe) {
      const s = Fe[n.preset];
      this.setBgColor(Tt(s.color));
    }
    this.updateCubemap({ facesNeedUpdate: a });
  }
  /**
   * Shows the cubemap layer by setting its visibility to "visible".
   * This method is used to make the cubemap layer visible on the map.
   */
  show() {
    this.map.setLayoutProperty(this.id, "visibility", "visible");
  }
  /**
   * Hides the cubemap layer by setting its visibility to "none".
   * This method is used to remove the cubemap layer from the map without deleting it.
   */
  hide() {
    this.map.setLayoutProperty(this.id, "visibility", "none");
  }
}
function $n(r) {
  const e = [];
  if (typeof r > "u")
    return e.push("Space specification is undefined."), e;
  if (typeof r == "boolean")
    return [];
  if (Object.keys(r).length === 0)
    return e.push("Space specification is an empty object."), e;
  const t = ["color", "preset", "path", "faces"], n = Object.keys(r).filter((a) => !t.includes(a));
  if (n.length > 0)
    return e.push(
      `Space specification contains unsupported properties: ${n.map((a) => `\`${a}\``).join(", ")}. Supported properties: \`color\`, \`preset\`, \`path\`, \`faces\`.`
    ), e;
  if (!r.path && !r.preset && !r.faces && !r.color)
    return e.push("Space specification contains neither a path, preset, faces, nor color."), e;
  r.preset && !(r.preset in Fe) && e.push(`Space preset "${r.preset}" is not a valid preset. Available presets: ${Object.keys(Fe).join(", ")}`);
  const i = Object.keys(r).filter((a) => a !== "color").filter((a) => a === "preset" || a === "path" || a === "faces");
  return i.length > 1 && e.push(
    `Space specification contains multiple properties for cubemap definition: ${i.join(", ")}. Only one of \`path\`, \`preset\`, or \`faces\` should be defined.`
  ), r.faces && (!r.faces.pX || !r.faces.nX || !r.faces.pY || !r.faces.nY || !r.faces.pZ || !r.faces.nZ) && e.push("Space specification contains faces but one or more of the faces are undefined."), r.faces && Object.values(r.faces).every((a) => typeof a != "string") && e.push("Space specification contains faces but one or more of the faces are not strings."), e;
}
function _a(r) {
  if (r.faces)
    return r.faces;
  if (r.preset)
    return {
      pX: `${Ye}/${r.preset}/px.webp`,
      nX: `${Ye}/${r.preset}/nx.webp`,
      pY: `${Ye}/${r.preset}/py.webp`,
      nY: `${Ye}/${r.preset}/ny.webp`,
      pZ: `${Ye}/${r.preset}/pz.webp`,
      nZ: `${Ye}/${r.preset}/nz.webp`
    };
  if (r.path) {
    const e = r.path.baseUrl, t = r.path.format ?? "png";
    return {
      pX: `${e}/px.${t}`,
      nX: `${e}/nx.${t}`,
      pY: `${e}/py.${t}`,
      nY: `${e}/ny.${t}`,
      pZ: `${e}/pz.${t}`,
      nZ: `${e}/nz.${t}`
    };
  }
  return null;
}
const cd = `attribute vec3 a_position;

uniform mat4 u_matrix;
uniform mat4 u_rotationMatrix;

uniform float u_scale;

varying vec2 v_pos;
varying float v_scale;

void main() {
  v_scale = u_scale;
  v_pos = a_position.xy * u_scale;
  gl_Position = u_matrix * u_rotationMatrix * vec4(a_position, 1.0);
}
`, pd = `precision mediump float;
varying vec2 v_pos;
      
uniform int u_stopsNumber;
uniform float u_stops[100];
uniform vec4 u_colors[100];
uniform float u_maxDistance;

varying float v_scale;

const float EPSILON = 0.000001;

vec2 center = vec2(0.0, 0.0);
void main() {
  float rawDistance = distance(center, v_pos);
  float distanceFromGlobeEdge = rawDistance - 1.0;

    vec4 color = u_colors[0];

  // if we're further than the max distance, we should not render anything.
  // This is to always render a circle, otherwise we end up rendering
  // to the corners of the plane.
  if (distance(center, v_pos) > u_maxDistance * v_scale) {
    discard;
  }

  for (int i = 1; i < 100; i++) {
    // if we're past the last stop
    // we should fill to the end with the last stop color
    if (i >= u_stopsNumber) {
      color = u_colors[i - 1];
      break;
    }

    float scaledStopPosition = u_stops[i] * pow(v_scale, 1.6);
    float lastStopValue = u_stops[i - 1];
    float thisStopValue = u_stops[i];

    // this is to avoid blending errors when the stops are the same
    // eg when you would want a sharp edge between two stops.
    // \`numbersAreEqual\` will be 1.0 if the numbers are equal, 0.0 if they are not.
    // We then subtract EPSILON from the last stop making the stop value _almost_ equal
    // to the next stop but not enough to cause blending issues.
    // It's more efficient to do this than an if / else statement.
    float numbersAreEqual = 1.0 - step(EPSILON, abs(lastStopValue - thisStopValue));
    lastStopValue = lastStopValue - numbersAreEqual * EPSILON;

    float lastScaledStopPosition = lastStopValue * pow(v_scale, 1.6);

    if (distanceFromGlobeEdge <= scaledStopPosition) {
      float stopBlendFactor = (distanceFromGlobeEdge - lastScaledStopPosition) / (scaledStopPosition - lastScaledStopPosition);
      color = mix(u_colors[i - 1], u_colors[i], stopBlendFactor);
      break;
    }
  }
  
  // gl_FragColor = color;
  gl_FragColor = vec4(color.rgb * color.a, color.a);
}
`, Se = 2, fd = ["position"], dd = ["matrix", "rotationMatrix", "stopsNumber", "stops", "colors", "maxDistance", "scale"], hd = [
  -Se,
  -Se,
  0,
  Se,
  -Se,
  0,
  -Se,
  Se,
  0,
  Se,
  Se,
  0
], ar = [
  [0, "rgba(176, 208, 240, 1)"],
  [0.1, "rgba(98, 168, 229, 0.3)"],
  [0.2, "rgba(98, 168, 229, 0.0)"]
], or = 0.9, Oa = 0.06;
class sr {
  /**
   * Creates a new RadialGradientLayer instance.
   *
   * @param {RadialGradientLayerConstructorOptions | boolean} gradient - Configuration options for the radial gradient or a boolean value.
   * If a boolean is provided, default configuration options will be used.
   * If an `RadialGradientLayerConstructorOptions` is provided, it will be merged with default options.
   */
  constructor(e) {
    y(this, "id", "Halo Layer");
    y(this, "type", "custom");
    y(this, "renderingMode", "3d");
    /**
     * The gradient definition used by this layer.
     * It contains the stops and scale for the radial gradient.
     * @private
     * @type {GradientDefinition}
     */
    y(this, "gradient");
    /**
     * The scale of the radial gradient, which determines its size.
     * This value is animated from 0 to the target scale during the layer's appearance.
     * @private
     * @type {number}
     */
    y(this, "scale", 0);
    /**
     * The animation delta value used to control the progress of the gradient's appearance animation.
     * It is incremented during each frame of the animation until it reaches 1.
     * @private
     * @type {number}
     */
    y(this, "animationDelta", 0);
    /**
     * The MapSDK instance to which this layer is added.
     * This is set when the layer is added to the map.
     * @private
     * @type {MapSDK}
     */
    y(this, "map");
    /**
     * The 3D object representing the radial gradient plane.
     * This object is created when the layer is added to the map and contains the shader program and buffers.
     * It is used for rendering the radial gradient effect.
     * @private
     * @type {Object3D<(typeof ATTRIBUTES_KEYS)[number], (typeof UNIFORMS_KEYS)[number]>}
     */
    y(this, "plane");
    /**
     * Whether the halo should be animated in and out.
     * @private
     * @type {boolean}
     */
    y(this, "animationActive", !0);
    if (typeof e == "boolean") {
      this.gradient = {
        scale: or,
        stops: ar
      };
      return;
    }
    const t = Ra(e);
    if (t.length > 0)
      throw new Error(`[RadialGradientLayer]: Invalid Halo specification:
 - ${t.join(`
 - `)}
    `);
    this.gradient = {
      scale: e.scale ?? or,
      stops: e.stops ?? ar
    };
  }
  /**
   * Adds the radial gradient layer to the specified map.
   * This method is called by the map when the layer is added to it.
   *
   * @param {MapSDK} map - The MapSDK instance to which this layer is being added
   * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL rendering context used for rendering the layer
   * @returns void
   */
  onAdd(e, t) {
    this.map = e, this.plane = bo({
      gl: t,
      vertexShaderSource: cd,
      fragmentShaderSource: pd,
      attributesKeys: fd,
      uniformsKeys: dd,
      vertices: hd
    }), this.animateIn();
  }
  /**
   * Returns the current gradient configuration of the radial gradient layer.
   *
   * @returns {GradientDefinition} The current gradient configuration.
   */
  getConfig() {
    return this.gradient;
  }
  /**
   * Checks if the gradient needs to be updated based on the provided specification.
   *
   * @param {GradientDefinition} spec - The gradient specification to compare with the current gradient.
   * @returns {boolean} True if the gradient needs to be updated, false otherwise.
   */
  shouldUpdate(e) {
    const t = this.getConfig();
    if (e === void 0 && t)
      return !0;
    const n = typeof e == "boolean" ? e : Sr(e), i = Sr(t);
    return JSON.stringify(n) !== JSON.stringify(i);
  }
  /**
   * Animates the radial gradient into view by gradually scaling from 0 to the target scale.
   *
   * This method uses requestAnimationFrame to create a smooth scaling animation effect.
   * During each frame, it:
   *   1. Interpolates the scale value between 0 and the target scale
   *   2. Increments the animation progress (animationDelta)
   *   3. Triggers a map repaint
   *
   * @private
   * @returns {Promise<void>} A promise that resolves when the animation completes
   */
  async animateIn() {
    if (!this.animationActive) {
      this.scale = this.gradient.scale, this.animationDelta = 1, this.map.triggerRepaint();
      return;
    }
    return new Promise((e) => {
      this.animationDelta = 0;
      const t = () => {
        if (this.animationDelta <= 1) {
          this.scale = J(0, this.gradient.scale, this.animationDelta), this.animationDelta += Oa, this.map.triggerRepaint(), requestAnimationFrame(t);
          return;
        }
        this.fireEvent("radialgradientlayer:animateindone", this), e();
      };
      requestAnimationFrame(t);
    });
  }
  /**
   * Animates the radial gradient layer out by gradually reducing its scale to zero.
   *
   * This method creates a smooth transition effect by linearly interpolating the scale
   * from its current value to zero over multiple animation frames. During each frame,
   * the animation progresses by incrementing the internal animation delta value.
   *
   * The map is repainted after each animation step to reflect the updated scale.
   *
   * @private
   * @returns A Promise that resolves when the animation is complete.
   */
  async animateOut() {
    if (this.animationActive)
      return this.animationDelta = 0, new Promise((e) => {
        const t = () => {
          if (this.animationDelta < 1) {
            this.scale = J(this.gradient.scale, 0, this.animationDelta), this.animationDelta += Oa, this.map.triggerRepaint(), requestAnimationFrame(t);
            return;
          }
          e(), this.fireEvent("radialgradientlayer:animateoutdone", this);
        };
        t();
      });
  }
  onRemove(e, t) {
    this.plane !== void 0 && (t.deleteProgram(this.plane.shaderProgram), t.deleteBuffer(this.plane.positionBuffer)), this.fireEvent("radialgradientlayer:onremove", this);
  }
  fireEvent(e, t) {
    this.map.fire(e, t);
  }
  prerender(e, t) {
  }
  render(e, t) {
    if (this.map === void 0)
      throw new Error("[RadialGradientLayer]: Map is undefined");
    if (!this.map.isGlobeProjection())
      return;
    if (this.plane === void 0)
      throw new Error("[RadialGradientLayer]: Plane is undefined");
    e.disable(e.DEPTH_TEST), e.enable(e.BLEND), e.useProgram(this.plane.shaderProgram), e.bindBuffer(e.ARRAY_BUFFER, this.plane.positionBuffer);
    const n = this.plane.programInfo.attributesLocations.position;
    e.enableVertexAttribArray(n), e.vertexAttribPointer(n, 3, e.FLOAT, !1, 0, 0);
    const i = Mt(), a = this.scale;
    Bf(i, i, [a, a, a]);
    const o = Mt();
    Uf(o, t.defaultProjectionData.mainMatrix, i);
    const s = this.plane.programInfo.uniformsLocations.matrix;
    e.uniformMatrix4fv(s, !1, o);
    const l = Mt(), u = this.map.transform.cameraPosition, c = mn(br(), u), p = Hf(0, 1, 0), f = br();
    Ea(f, p, c), mn(f, f);
    const d = br();
    Ea(d, c, f), mn(d, d), jf(l, f[0], f[1], f[2], 0, d[0], d[1], d[2], 0, c[0], c[1], c[2], 0, 0, 0, 0, 1);
    const h = this.plane.programInfo.uniformsLocations.rotationMatrix;
    e.uniformMatrix4fv(h, !1, l);
    const m = this.gradient.stops.length, g = [], v = [];
    for (let b = 0; b <= m; b++)
      if (b < m) {
        g[b] = this.gradient.stops[b][0];
        const x = Tt(this.gradient.stops[b][1]);
        v.push(...x);
      }
    e.uniform1i(this.plane.programInfo.uniformsLocations.stopsNumber, m), e.uniform1fv(this.plane.programInfo.uniformsLocations.stops, new Float32Array(g)), e.uniform4fv(this.plane.programInfo.uniformsLocations.colors, new Float32Array(v)), e.uniform1f(this.plane.programInfo.uniformsLocations.maxDistance, Se), e.uniform1f(this.plane.programInfo.uniformsLocations.scale, a), e.drawArrays(e.TRIANGLE_STRIP, 0, 4);
  }
  /**
   * Sets a new gradient for the radial gradient layer and animates the transition.
   *
   * This method first animates the current gradient out, then updates the gradient
   * property with the new gradient definition, and finally animates the new gradient in.
   *
   * @param {GradientDefinition} gradient - The new gradient definition to set for this layer.
   * @returns {Promise<void>} A promise that resolves when the new gradient is set and animated in.
   */
  async setGradient(e) {
    if (e === !1) {
      await this.animateOut();
      return;
    }
    await this.animateOut();
    const t = Ra(e);
    if (t.length > 0)
      throw new Error(`[RadialGradientLayer]: Invalid Halo specification:
 - ${t.join(`
 - `)}
    `);
    e === !0 ? (this.gradient.scale = or, this.gradient.stops = ar) : (this.gradient.scale = e.scale ?? or, this.gradient.stops = e.stops ?? ar), await this.animateIn();
  }
  setAnimationActive(e) {
    this.animationActive = e;
  }
  show() {
    this.map.setLayoutProperty(this.id, "visibility", "visible");
  }
  hide() {
    this.map.setLayoutProperty(this.id, "visibility", "none");
  }
}
const md = ["scale", "stops"];
function Ra(r) {
  var t;
  const e = [];
  if (typeof r == "boolean")
    return [];
  try {
    const n = Object.keys(r).filter((i) => !md.includes(i));
    n.length > 0 && e.push(`Properties ${n.map((i) => `\`${i}\``).join(", ")} are not supported.`);
  } catch {
    e.push("Halo specification is not an object.");
  }
  return typeof r.scale != "number" && e.push("Halo `scale` property is not a number."), !r.stops || r.stops.length === 0 || !Array.isArray(r.stops) ? (e.push("Halo `stops` property is not an array."), e) : ((t = r.stops) != null && t.some((n) => typeof n[0] != "number" || typeof n[1] != "string") && e.push("Halo `stops` property is not an array of [number, string]"), e);
}
function yd() {
  const r = "color: #3A1888; background: white; padding: 5px 0; font-weight: bold;", e = "color: #FBC935; background: white; padding: 5px; font-weight: bold;", t = "color: #F1175D; background: white; padding: 5px 0; font-weight: bold;";
  console.info(
    `%c❖%c❖%c❖ %cMapTiler SDK JS v${ul()} %c❖%c❖%c❖`,
    e + "padding-right: 0;",
    r,
    t,
    "color: #333; background: white; padding: 5px 0; font-weight: bold;",
    t,
    r,
    e + "padding-left: 0;"
  );
}
const gd = "0.1.0", vd = {
  POINT: "POINT",
  COUNTRY: "COUNTRY"
}, bd = 11;
let Ns = class $s extends C.Map {
  constructor(t) {
    t.logSDKVersion !== !1 && yd(), kc(t.container), t.apiKey && (D.apiKey = t.apiKey);
    const { style: n, requiresUrlMonitoring: i, isFallback: a } = ba(t.style);
    a && console.warn(
      "Invalid style. A style must be a valid URL to a style.json, a JSON string representing a valid StyleSpecification or a valid StyleSpecification object. Fallback to default MapTiler style."
    ), D.apiKey || console.warn("MapTiler Cloud API key is not set. Visit https://maptiler.com and try Cloud for free!");
    const o = location.hash;
    let s = {
      compact: !1
    };
    t.customAttribution ? s.customAttribution = t.customAttribution : t.attributionControl && typeof t.attributionControl == "object" && (s = {
      ...s,
      ...t.attributionControl
    }), s.compact === "auto" && (s.compact = void 0);
    const l = {
      ...t,
      style: n,
      maplibreLogo: !1,
      transformRequest: Qi(t.transformRequest),
      attributionControl: t.forceNoAttributionControl === !0 ? !1 : s
    };
    delete l.style, t.useExperimentalTilePreloading && (lh(D.experimental_defaultWorkerCount), console.info(`Using ${D.experimental_defaultWorkerCount} workers for experimental tile preloading.`));
    super(l);
    y(this, "telemetry");
    y(this, "space");
    y(this, "halo");
    y(this, "options");
    y(this, "tilePreloader");
    y(this, "isTerrainEnabled", !1);
    y(this, "terrainExaggeration", 1);
    y(this, "primaryLanguage");
    y(this, "terrainGrowing", !1);
    y(this, "terrainFlattening", !1);
    y(this, "minimap");
    y(this, "forceLanguageUpdate");
    y(this, "languageAlwaysBeenStyle");
    y(this, "isReady", !1);
    y(this, "terrainAnimationDuration", 1e3);
    y(this, "monitoredStyleUrls");
    y(this, "styleInProcess", !1);
    y(this, "currentStyleId");
    y(this, "curentProjection");
    y(this, "originalLabelStyle", new window.Map());
    y(this, "isStyleLocalized", !1);
    y(this, "languageIsUpdated", !1);
    y(this, "spaceboxLoadingState", {
      styleLoadCallbackSet: !1,
      styleLoadedCallbackFired: !1
    });
    this.getContainer().classList.add("maptiler-map"), this.options = t, this.setStyle(n), i && this.monitorStyleUrl(n);
    const u = () => {
      let h = "The distant style could not be loaded.";
      this.getStyle() ? h += " Leaving the style as is." : (this.setStyle(rt.STREETS), h += `Loading default MapTiler Cloud style "${rt.STREETS.getDefaultVariant().getId()}" as a fallback.`), console.warn(h);
    };
    if (this.on("style.load", () => {
      if (this.styleInProcess = !1, t.useExperimentalTilePreloading && !this.tilePreloader) {
        this.tilePreloader = new Nf(this);
        try {
          this.telemetry.registerModule("experimental-tile-preloader", gd);
        } catch {
        }
      }
      (typeof t.rtlTextPlugin == "string" || typeof t.rtlTextPlugin > "u") && Ac(t.rtlTextPlugin);
    }), this.on("error", (h) => {
      if (h.error instanceof C.AJAXError) {
        const g = h.error.url, v = new URL(g);
        v.search = "";
        const b = v.href;
        this.monitoredStyleUrls && this.monitoredStyleUrls.has(b) && (this.monitoredStyleUrls.delete(b), u());
        return;
      }
      if (this.styleInProcess) {
        u();
        return;
      }
    }), D.caching && !Cr && console.warn("The cache API is only available in secure contexts. More info at https://developer.mozilla.org/en-US/docs/Web/API/Cache"), D.caching && Cr && Cc(), typeof t.language > "u")
      this.primaryLanguage = D.primaryLanguage;
    else {
      const h = Ai(t.language, R);
      this.primaryLanguage = h ?? D.primaryLanguage;
    }
    this.forceLanguageUpdate = !(this.primaryLanguage === R.STYLE || this.primaryLanguage === R.STYLE_LOCK), this.languageAlwaysBeenStyle = this.primaryLanguage === R.STYLE, this.terrainExaggeration = t.terrainExaggeration ?? this.terrainExaggeration, this.curentProjection = t.projection, this.on("style.load", (h) => {
      this.curentProjection === "mercator" ? this.setProjection({ type: "mercator" }) : this.curentProjection === "globe" && this.setProjection({ type: "globe" });
    }), this.once("styledata", async () => {
      if (!t.geolocate || t.center || t.hash && o)
        return;
      try {
        if (t.geolocate === vd.COUNTRY) {
          await this.fitToIpBounds();
          return;
        }
      } catch (g) {
        console.warn(g.message);
      }
      let h;
      try {
        await this.centerOnIpPoint(t.zoom), h = this.getCameraHash();
      } catch (g) {
        console.warn(g.message);
      }
      (await navigator.permissions.query({
        name: "geolocation"
      })).state === "granted" && navigator.geolocation.getCurrentPosition(
        // success callback
        (g) => {
          h === this.getCameraHash() && (this.terrain ? this.easeTo({
            center: [g.coords.longitude, g.coords.latitude],
            zoom: t.zoom || 12,
            duration: 2e3
          }) : this.once("terrain", () => {
            this.easeTo({
              center: [g.coords.longitude, g.coords.latitude],
              zoom: t.zoom || 12,
              duration: 2e3
            });
          }));
        },
        // error callback
        null,
        // options
        {
          maximumAge: 24 * 3600 * 1e3,
          // a day in millisec
          timeout: 5e3,
          // milliseconds
          enableHighAccuracy: !1
        }
      );
    }), this.on("styledata", () => {
      this.setPrimaryLanguage(this.primaryLanguage);
    }), this.on("styledata", () => {
      this.getTerrain() === null && this.isTerrainEnabled && this.enableTerrain(this.terrainExaggeration);
    }), this.once("load", async () => {
      let h = { logo: null };
      try {
        const m = Object.keys(this.style.tileManagers).map((b) => this.getSource(b)).filter((b) => b && "url" in b && typeof b.url == "string" && b.url.includes("tiles.json")), g = new URL(m[0].url);
        g.searchParams.has("key") || g.searchParams.append("key", D.apiKey), h = await (await fetch(g.href)).json();
      } catch {
      }
      if (t.customControls) {
        const m = "[data-maptiler-control-group]", g = "[data-maptiler-control]", v = (E) => {
          let N = E.dataset.maptilerControl;
          return (N === "true" || N === "") && (N = void 0), N;
        }, b = (E) => E.dataset.maptilerPosition;
        let x = [...this._container.ownerDocument.querySelectorAll(m)], k = [...this._container.ownerDocument.querySelectorAll(g)].filter(
          (E) => E.closest(m) === null
        );
        if (typeof t.customControls == "string") {
          const E = t.customControls;
          x = x.filter((N) => N.matches(E) || N.closest(E) !== null), k = k.filter((N) => N.matches(E) || N.closest(E) !== null);
        }
        for (const E of x) {
          const N = new Dn(E);
          this.addControl(N, b(E));
          for (const fe of E.querySelectorAll(g))
            N.configureGroupItem(fe, v(fe));
        }
        for (const E of k)
          this.addControl(new Dn(E, v(E)), b(E));
        const L = () => {
          const { lng: E, lat: N } = this.getCenter();
          this._container.style.setProperty("--maptiler-center-lng", String(E)), this._container.style.setProperty("--maptiler-center-lat", String(N)), this._container.style.setProperty("--maptiler-zoom", String(this.getZoom())), this._container.style.setProperty("--maptiler-bearing", String(this.getBearing())), this._container.style.setProperty("--maptiler-pitch", String(this.getPitch())), this._container.style.setProperty("--maptiler-roll", String(this.getRoll())), this._container.style.setProperty("--maptiler-is-globe-projection", String(this.isGlobeProjection())), this._container.style.setProperty("--maptiler-has-terrain", String(this.hasTerrain()));
        };
        L(), this.on("render", L);
      }
      if (t.forceNoAttributionControl !== !0)
        if ("logo" in h && h.logo) {
          const m = h.logo;
          this.addControl(new Wi({ logoURL: m }), t.logoPosition);
        } else t.maptilerLogo && this.addControl(new Wi(), t.logoPosition);
      if (t.scaleControl) {
        const m = t.scaleControl === !0 || t.scaleControl === void 0 ? "bottom-right" : t.scaleControl, g = new hc({ unit: D.unit });
        this.addControl(g, m), D.on("unit", (v) => {
          g.setUnit(v);
        });
      }
      if (t.navigationControl !== !1) {
        const m = t.navigationControl === !0 || t.navigationControl === void 0 ? "top-right" : t.navigationControl;
        this.addControl(new Af(), m);
      }
      if (t.geolocateControl !== !1) {
        const m = t.geolocateControl === !0 || t.geolocateControl === void 0 ? "top-right" : t.geolocateControl;
        this.addControl(
          // new maplibregl.GeolocateControl({
          new Ef({
            positionOptions: {
              enableHighAccuracy: !0,
              maximumAge: 0,
              timeout: 6e3
            },
            fitBoundsOptions: {
              maxZoom: 15
            },
            trackUserLocation: !0,
            showAccuracyCircle: !0,
            showUserLocation: !0
          }),
          m
        );
      }
      if (t.terrainControl) {
        const m = t.terrainControl === !0 || t.terrainControl === void 0 ? "top-right" : t.terrainControl;
        this.addControl(new Cf(), m);
      }
      if (t.projectionControl) {
        const m = t.projectionControl === !0 || t.projectionControl === void 0 ? "top-right" : t.projectionControl;
        this.addControl(new kf(), m);
      }
      if (t.fullscreenControl) {
        const m = t.fullscreenControl === !0 || t.fullscreenControl === void 0 ? "top-right" : t.fullscreenControl;
        this.addControl(new mc({}), m);
      }
      this.isReady = !0, this.fire("ready", { target: this });
    });
    let c = !1, p = !1, f;
    this.once("ready", () => {
      c = !0, p && this.fire("loadWithTerrain", f);
    }), this.once("style.load", () => {
      const { minimap: h } = t;
      if (typeof h == "object") {
        const {
          zoom: m,
          center: g,
          style: v,
          language: b,
          apiKey: x,
          maptilerLogo: k,
          canvasContextAttributes: L,
          refreshExpiredTiles: E,
          maxBounds: N,
          scrollZoom: fe,
          minZoom: Ke,
          maxZoom: Ze,
          boxZoom: Q,
          locale: We,
          fadeDuration: pl,
          crossSourceCollisions: fl,
          clickTolerance: dl,
          bounds: hl,
          fitBoundsOptions: ml,
          pixelRatio: yl,
          validateStyle: gl
        } = t;
        this.minimap = new hn(h, {
          zoom: m,
          center: g,
          style: v,
          language: b,
          apiKey: x,
          container: "null",
          maptilerLogo: k,
          canvasContextAttributes: L,
          refreshExpiredTiles: E,
          maxBounds: N,
          scrollZoom: fe,
          minZoom: Ke,
          maxZoom: Ze,
          boxZoom: Q,
          locale: We,
          fadeDuration: pl,
          crossSourceCollisions: fl,
          clickTolerance: dl,
          bounds: hl,
          fitBoundsOptions: ml,
          pixelRatio: yl,
          validateStyle: gl
        }), this.addControl(this.minimap, h.position ?? "bottom-left");
      } else h === !0 ? (this.minimap = new hn({}, t), this.addControl(this.minimap, "bottom-left")) : h !== void 0 && h !== !1 && (this.minimap = new hn({}, t), this.addControl(this.minimap, h));
    });
    const d = (h) => {
      h.terrain && (p = !0, f = {
        type: "loadWithTerrain",
        target: this,
        terrain: h.terrain
      }, this.off("terrain", d), c && this.fire("loadWithTerrain", f));
    };
    this.on("terrain", d), t.terrain && this.enableTerrain(t.terrainExaggeration ?? this.terrainExaggeration), this.once("load", () => {
      this.getCanvas().addEventListener("webglcontextlost", (m) => {
        if (this._removed === !0) {
          console.warn("[webglcontextlost]", "WebGL context lost after map removal. This is harmless.");
          return;
        }
        console.warn("[webglcontextlost]", "Unexpected loss of WebGL context!"), this.fire("webglContextLost", m);
      });
      const h = this.getLayersOrder()[0];
      t.space && this.initSpace({ options: t, before: h }), t.halo && this.initHalo({ options: t, before: h });
    }), this.telemetry = new $f(this);
  }
  getSpace() {
    return this.space;
  }
  /**
   * Sets the space for the map.
   * @param {CubemapDefinition} space the `CubemapDefinition` options to set.
   * @remarks This method, at present, ** overwrites ** the current config.
   * If an option is not set it will internally revert to the default option
   * unless explicitly set when calling.
   */
  setSpace(t, n = !0) {
    if (n && (this.options.space = t), t === !1) {
      this.space = void 0;
      return;
    }
    if (this.space) {
      this.space.setCubemap(t), this.getLayer(this.space.id) || this.addLayer(this.space, this.getLayersOrder()[0]);
      return;
    }
    this.space = new ir(t), this.once("load", () => {
      const i = this.getLayersOrder()[0];
      this.space && this.addLayer(this.space, i);
    });
  }
  /**
   * Enables the animations for the space layer.
   */
  enableSpaceAnimations() {
    this.setSpaceAnimationActive(!0);
  }
  /**
   * Disables the animations for the space layer.
   */
  disableSpaceAnimations() {
    this.setSpaceAnimationActive(!1);
  }
  /**
   * Enables the animations for the halo layer.
   */
  enableHaloAnimations() {
    this.setHaloAnimationActive(!0);
  }
  /**
   * Disables the animations for the halo layer.
   */
  disableHaloAnimations() {
    this.setHaloAnimationActive(!1);
  }
  /**
   * Sets whether the halo layer should be animated in and out.
   * @param active - Whether the animation should be active.
   */
  setHaloAnimationActive(t) {
    this.halo ? this.halo.setAnimationActive(t) : this.once("load", () => {
      var n;
      (n = this.halo) == null || n.setAnimationActive(t);
    });
  }
  /**
   * Sets whether the space layer should be animated in and out.
   * @param active - Whether the animation should be active.
   */
  setSpaceAnimationActive(t) {
    this.space ? this.space.setAnimationActive(t) : this.once("load", () => {
      var n;
      (n = this.space) == null || n.setAnimationActive(t);
    });
  }
  setSpaceFromStyle({ style: t }) {
    var i, a, o;
    if (this.options.space !== !0 && typeof this.options.space < "u") {
      this.setSpace(this.options.space);
      return;
    }
    const n = (a = (i = t.metadata) == null ? void 0 : i.maptiler) == null ? void 0 : a.space;
    if (!this.options.space && !n) {
      this.setSpace(!1, !1);
      return;
    }
    if (JSON.stringify((o = this.space) == null ? void 0 : o.getConfig()) === JSON.stringify(n)) {
      if (this.space && !this.getLayer(this.space.id)) {
        const s = this.getLayersOrder()[0];
        this.addLayer(this.space, s);
      }
      return;
    }
    if (this.options.space === !0) {
      this.setSpace(n ?? !0);
      return;
    }
    if (this.space && this.isGlobeProjection()) {
      if (!this.getLayer(this.space.id)) {
        const s = this.getLayersOrder()[0];
        this.addLayer(this.space, s);
      }
      this.space.setCubemap(n);
    }
  }
  setHaloFromStyle({ style: t }) {
    var a, o, s;
    if (this.options.halo === !1)
      return;
    const n = (a = t.metadata) == null ? void 0 : a.maptiler;
    if (JSON.stringify((o = this.halo) == null ? void 0 : o.getConfig()) === JSON.stringify(n == null ? void 0 : n.halo)) {
      if (this.halo && !this.getLayer(this.halo.id)) {
        const l = this.getLayersOrder().indexOf(((s = this.space) == null ? void 0 : s.id) ?? "") + 1, u = this.getLayersOrder()[l];
        this.addLayer(this.halo, u);
      }
      return;
    }
    if (!(n != null && n.halo) && !this.options.halo) {
      this.setHalo({
        stops: [
          [0, "transparent"],
          [0.01, "transparent"]
        ],
        scale: 1
      });
      return;
    }
    (() => {
      var l;
      if (this.halo) {
        if (!this.getLayer(this.halo.id)) {
          const c = this.getLayersOrder().indexOf(((l = this.space) == null ? void 0 : l.id) ?? "") + 1, p = this.getLayersOrder()[c];
          this.addLayer(this.halo, p);
        }
        const u = (n == null ? void 0 : n.halo) ?? this.options.halo;
        u && this.halo.setGradient(u);
      }
    })();
  }
  initSpace({ options: t = this.options, before: n, spec: i }) {
    if (this.space) {
      this.getLayer(this.space.id) || this.addLayer(this.space, n);
      return;
    }
    if (t.space === !1) return;
    if (t.space && t.space !== !0) {
      this.space = new ir(t.space), this.addLayer(this.space, n);
      return;
    }
    const a = i;
    if (a) {
      this.space = new ir(a), this.addLayer(this.space, n);
      return;
    }
    this.options.space === !0 && (this.space = new ir(!0), this.addLayer(this.space, n));
  }
  initHalo({ options: t = this.options, before: n, spec: i }) {
    if (this.halo && this.getLayer(this.halo.id) || t.halo === !1) return;
    const a = i;
    if (t.halo && t.halo !== !0) {
      this.halo = new sr(t.halo), this.removeLayer(this.halo.id), this.addLayer(this.halo, n);
      return;
    }
    if (a) {
      this.halo = new sr(a), this.removeLayer(this.halo.id), this.addLayer(this.halo, n);
      return;
    }
    if (this.options.halo === !0) {
      this.halo = new sr(!0), this.removeLayer(this.halo.id), this.addLayer(this.halo, n);
      return;
    }
  }
  getHalo() {
    return this.halo;
  }
  setHalo(t) {
    if (this.options.halo = t, !!this.isGlobeProjection()) {
      if (this.halo) {
        this.halo.setGradient(t);
        return;
      }
      this.halo = new sr(t), this.once("load", () => {
        var s;
        const n = this.getLayersOrder(), i = n[0], a = n.indexOf(((s = this.space) == null ? void 0 : s.id) ?? "") + 2, o = n[a];
        this.halo && this.addLayer(this.halo, this.space ? o : i);
      });
    }
  }
  /**
   * Recreates the map instance with the same options.
   * Useful for WebGL context loss.
   */
  recreate() {
    const t = {
      center: this.getCenter(),
      zoom: this.getZoom(),
      bearing: this.getBearing(),
      pitch: this.getPitch()
    };
    this.remove(), Object.assign(this, new $s({ ...this.options })), this.once("load", () => {
      this.jumpTo(t);
    });
  }
  /**
   * Set the duration (millisec) of the terrain animation for growing or flattening.
   * Must be positive. (Built-in default: `1000` milliseconds)
   */
  setTerrainAnimationDuration(t) {
    this.terrainAnimationDuration = Math.max(t, 0);
  }
  /**
   * Awaits for _this_ Map instance to be "loaded" and returns a Promise to the Map.
   * If _this_ Map instance is already loaded, the Promise is resolved directly,
   * otherwise, it is resolved as a result of the "load" event.
   * @returns
   */
  async onLoadAsync() {
    return new Promise((t) => {
      if (this.loaded()) {
        t(this);
        return;
      }
      this.once("load", () => {
        t(this);
      });
    });
  }
  /**
   * Awaits for _this_ Map instance to be "ready" and returns a Promise to the Map.
   * If _this_ Map instance is already ready, the Promise is resolved directly,
   * otherwise, it is resolved as a result of the "ready" event.
   * A map instance is "ready" when all the controls that can be managed by the contructor are
   * dealt with. This happens after the "load" event, due to the asynchronous nature
   * of some built-in controls.
   */
  async onReadyAsync() {
    return new Promise((t) => {
      if (this.isReady) {
        t(this);
        return;
      }
      this.once("ready", () => {
        t(this);
      });
    });
  }
  /**
   * Awaits for _this_ Map instance to be "loaded" as well as with terrain being non-null for the first time
   * and returns a Promise to the Map.
   * If _this_ Map instance is already loaded with terrain, the Promise is resolved directly,
   * otherwise, it is resolved as a result of the "loadWithTerrain" event.
   * @returns
   */
  async onLoadWithTerrainAsync() {
    return new Promise((t) => {
      if (this.isReady && this.terrain) {
        t(this);
        return;
      }
      this.once("loadWithTerrain", () => {
        t(this);
      });
    });
  }
  monitorStyleUrl(t) {
    typeof this.monitoredStyleUrls > "u" && (this.monitoredStyleUrls = /* @__PURE__ */ new Set());
    const n = new URL(t);
    n.search = "", this.monitoredStyleUrls.add(n.href);
  }
  /**
   * Update the style of the map.
   * Can be:
   * - a full style URL (possibly with API key)
   * - a shorthand with only the MapTIler style name (eg. `"streets-v2"`)
   * - a longer form with the prefix `"maptiler://"` (eg. `"maptiler://streets-v2"`)
   */
  setStyle(t, n) {
    var c, p, f, d, h;
    this.originalLabelStyle.clear(), (c = this.minimap) == null || c.setStyle(t), this.forceLanguageUpdate = !0, this.once("idle", () => {
      this.forceLanguageUpdate = !1;
    });
    const i = ba(t);
    if (i.requiresUrlMonitoring && this.monitorStyleUrl(i.style), i.isFallback) {
      if (this.getStyle())
        return console.warn(
          "[Map.setStyle]: Invalid style. A style must be a valid URL to a style.json, a JSON string representing a valid StyleSpecification or a valid StyleSpecification object. Keeping the curent style instead."
        ), this;
      console.warn(
        "[Map.setStyle]: Invalid style. A style must be a valid URL to a style.json, a JSON string representing a valid StyleSpecification or a valid StyleSpecification object. Fallback to default MapTiler style."
      );
    }
    this.currentStyleId = xf(i.isFallback ? null : t), this.spaceboxLoadingState.styleLoadedCallbackFired = !1, this.spaceboxLoadingState.styleLoadCallbackSet = !1;
    const a = this.getStyle(), o = i.style;
    try {
      super.setStyle(i.style, { ...n, diff: typeof i.style != "string" }), this.styleInProcess = !0;
    } catch (m) {
      this.styleInProcess = !1, console.error("[Map.setStyle]: Error while setting style:", m);
    }
    const s = () => {
      const m = i.style;
      if (!m.projection || m.projection.type === "mercator") {
        console.warn("[Map.setStyle]: Neither space nor halo is supported for mercator projection. Ignoring...");
        return;
      }
      this.setSpaceFromStyle({ style: i.style }), this.setHaloFromStyle({ style: i.style });
    }, l = (m) => {
      var v, b, x, k;
      const g = (m == null ? void 0 : m.target.getStyle()) ?? i.style;
      if (!this.spaceboxLoadingState.styleLoadedCallbackFired && (this.spaceboxLoadingState.styleLoadedCallbackFired = !0, this.spaceboxLoadingState.styleLoadCallbackSet = !1, typeof g != "string"))
        try {
          const L = this.getLayersOrder()[0];
          this.space ? this.setSpaceFromStyle({ style: g }) : this.initSpace({ before: L, spec: (b = (v = g.metadata) == null ? void 0 : v.maptiler) == null ? void 0 : b.space }), this.halo ? this.setHaloFromStyle({ style: g }) : this.initHalo({ before: L, spec: (k = (x = g.metadata) == null ? void 0 : x.maptiler) == null ? void 0 : k.halo });
        } catch (L) {
          console.error(L);
        }
    };
    return typeof i.style == "string" || i.requiresUrlMonitoring ? (this.once("style.load", l), this) : (requestIdleCallback(() => {
      try {
        l();
      } catch (m) {
        console.error(m);
      }
    }), this.spaceboxLoadingState.styleLoadCallbackSet ? ((p = a == null ? void 0 : a.terrain) == null ? void 0 : p.source) !== ((f = o == null ? void 0 : o.terrain) == null ? void 0 : f.source) || ((d = a == null ? void 0 : a.terrain) == null ? void 0 : d.exaggeration) !== ((h = o == null ? void 0 : o.terrain) == null ? void 0 : h.exaggeration) ? (this.once("terrain", s), this) : this : (this.once("style.load", l), this.once("projection.change", l), this.spaceboxLoadingState.styleLoadCallbackSet = !0, this));
  }
  /**
   * Returns the id of the current MapTiler style (e.g. `"streets-v4-dark"`),
   * derived from the value passed to the constructor or `setStyle`.
   * `undefined` when the style is a custom `StyleSpecification` or a URL that
   * doesn't follow the MapTiler Cloud `/maps/<id>/style.json` shape.
   */
  getStyleId() {
    return this.currentStyleId;
  }
  /**
   * Adds a [MapLibre style layer](https://maplibre.org/maplibre-style-spec/layers)
   * to the map's style.
   *
   * A layer defines how data from a specified source will be styled. Read more about layer types
   * and available paint and layout properties in the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/layers).
   *
   * @param layer - The layer to add,
   * conforming to either the MapLibre Style Specification's [layer definition](https://maplibre.org/maplibre-style-spec/layers) or,
   * less commonly, the {@link CustomLayerInterface} specification.
   * The MapLibre Style Specification's layer definition is appropriate for most layers.
   *
   * @param beforeId - The ID of an existing layer to insert the new layer before,
   * resulting in the new layer appearing visually beneath the existing layer.
   * If this argument is not specified, the layer will be appended to the end of the layers array
   * and appear visually above all other layers.
   *
   * @returns `this`
   */
  addLayer(t, n) {
    var i;
    return (i = this.minimap) == null || i.addLayer(t, n), super.addLayer(t, n);
  }
  /**
   * Moves a layer to a different z-position.
   *
   * @param id - The ID of the layer to move.
   * @param beforeId - The ID of an existing layer to insert the new layer before. When viewing the map, the `id` layer will appear beneath the `beforeId` layer. If `beforeId` is omitted, the layer will be appended to the end of the layers array and appear above all other layers on the map.
   * @returns `this`
   *
   * @example
   * Move a layer with ID 'polygon' before the layer with ID 'country-label'. The `polygon` layer will appear beneath the `country-label` layer on the map.
   * ```ts
   * map.moveLayer('polygon', 'country-label');
   * ```
   */
  moveLayer(t, n) {
    var i;
    return (i = this.minimap) == null || i.moveLayer(t, n), super.moveLayer(t, n);
  }
  /**
   * Removes the layer with the given ID from the map's style.
   *
   * An {@link ErrorEvent} will be fired if the image parameter is invald.
   *
   * @param id - The ID of the layer to remove
   * @returns `this`
   *
   * @example
   * If a layer with ID 'state-data' exists, remove it.
   * ```ts
   * if (map.getLayer('state-data')) map.removeLayer('state-data');
   * ```
   */
  removeLayer(t) {
    var n;
    return (n = this.minimap) == null || n.removeLayer(t), super.removeLayer(t);
  }
  /**
   * TODO document this
   */
  addMarker(t) {
    const n = t instanceof xn ? t : new xn(t);
    return $.register(n, this), this;
  }
  removeMarker(t) {
    return $.deregisterById(this, t), this;
  }
  addMarkers(t) {
    return t.forEach((n) => this.addMarker(n)), this;
  }
  removeMarkers(t) {
    return $.deregisterAll(this, t), this;
  }
  getMarkers() {
    return $.getMarkers(this);
  }
  getMarker(t) {
    return $.getMarker(this, t);
  }
  /**
   * Configures marker collision detection for this map.
   * @param options.proximityPadding - Distance in CSS px within which two
   *   markers count as "in proximity". Overlap always uses 0.
   * @param options.accuracy - `high` (default) tests rotated markers with
   *   their actual rotated box; `low` uses the upright box enclosing it,
   *   which is cheaper per pair but over-reports collisions for rotated
   *   markers (it never misses a real one).
   * @param options.behaviour - Default collision behaviour applied to every
   *   marker on this map (`always-show` | `hide-by-priority` |
   *   `minimize-by-priority`). A marker's own `collisionBehaviour` option
   *   overrides it. Defaults to `always-show`.
   * @param options.transitionDuration - Duration in ms of the hide/show/minimize fade. Defaults to `150`.
   * @param options.transitionEasing - CSS easing function for the fade. Defaults to `"ease"`.
   */
  setMarkerCollisionOptions(t) {
    return $.setCollisionOptions(this, t), this;
  }
  /**
   * Sets the zoom extent for the specified style layer. The zoom extent includes the
   * [minimum zoom level](https://maplibre.org/maplibre-style-spec/layers/#minzoom)
   * and [maximum zoom level](https://maplibre.org/maplibre-style-spec/layers/#maxzoom))
   * at which the layer will be rendered.
   *
   * Note: For style layers using vector sources, style layers cannot be rendered at zoom levels lower than the
   * minimum zoom level of the _source layer_ because the data does not exist at those zoom levels. If the minimum
   * zoom level of the source layer is higher than the minimum zoom level defined in the style layer, the style
   * layer will not be rendered at all zoom levels in the zoom range.
   */
  setLayerZoomRange(t, n, i) {
    var a;
    return (a = this.minimap) == null || a.setLayerZoomRange(t, n, i), super.setLayerZoomRange(t, n, i);
  }
  /**
   * Sets the filter for the specified style layer.
   *
   * Filters control which features a style layer renders from its source.
   * Any feature for which the filter expression evaluates to `true` will be
   * rendered on the map. Those that are false will be hidden.
   *
   * Use `setFilter` to show a subset of your source data.
   *
   * To clear the filter, pass `null` or `undefined` as the second parameter.
   */
  setFilter(t, n, i) {
    var a;
    return (a = this.minimap) == null || a.setFilter(t, n, i), super.setFilter(t, n, i);
  }
  /**
   * Sets the value of a paint property in the specified style layer.
   *
   * @param layerId - The ID of the layer to set the paint property in.
   * @param name - The name of the paint property to set.
   * @param value - The value of the paint property to set.
   * Must be of a type appropriate for the property, as defined in the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/).
   * @param options - Options object.
   * @returns `this`
   * @example
   * ```ts
   * map.setPaintProperty('my-layer', 'fill-color', '#faafee');
   * ```
   */
  setPaintProperty(t, n, i, a) {
    var o;
    return (o = this.minimap) == null || o.setPaintProperty(t, n, i, a), super.setPaintProperty(t, n, i, a);
  }
  /**
   * Sets the value of a layout property in the specified style layer.
   * Layout properties define how the layer is styled.
   * Layout properties for layers of the same type are documented together.
   * Layers of different types have different layout properties.
   * See the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/) for the complete list of layout properties.
   * @param layerId - The ID of the layer to set the layout property in.
   * @param name - The name of the layout property to set.
   * @param value - The value of the layout property to set.
   * Must be of a type appropriate for the property, as defined in the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/).
   * @param options - Options object.
   * @returns `this`
   */
  setLayoutProperty(t, n, i, a) {
    var o;
    return (o = this.minimap) == null || o.setLayoutProperty(t, n, i, a), super.setLayoutProperty(t, n, i, a);
  }
  /**
   * Sets the value of the style's glyphs property.
   *
   * @param glyphsUrl - Glyph URL to set. Must conform to the [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/glyphs/).
   * @param options - Options object.
   * @returns `this`
   * @example
   * ```ts
   * map.setGlyphs('https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf');
   * ```
   */
  setGlyphs(t, n) {
    var i;
    return (i = this.minimap) == null || i.setGlyphs(t, n), super.setGlyphs(t, n);
  }
  getStyleLanguage() {
    return !this.style || !this.style.stylesheet || !this.style.stylesheet.metadata || typeof this.style.stylesheet.metadata != "object" ? null : "maptiler:language" in this.style.stylesheet.metadata && typeof this.style.stylesheet.metadata["maptiler:language"] == "string" ? Al(this.style.stylesheet.metadata["maptiler:language"]) : null;
  }
  /**
   * Define the primary language of the map. Note that not all the languages shorthands provided are available.
   */
  setLanguage(t) {
    var n;
    (n = this.minimap) == null || n.map.setLanguage(t), this.onStyleReady(() => {
      this.setPrimaryLanguage(t);
    });
  }
  /**
   * Define the primary language of the map. Note that not all the languages shorthands provided are available.
   */
  setPrimaryLanguage(t) {
    const n = this.getStyleLanguage(), i = Ai(t, R);
    if (!i) {
      console.warn(`The language "${i}" is not supported.`);
      return;
    }
    if (!(i.flag === R.STYLE.flag && n && (n.flag === R.AUTO.flag || n.flag === R.VISITOR.flag)) && (i.flag !== R.STYLE.flag && (this.languageAlwaysBeenStyle = !1), this.languageAlwaysBeenStyle || this.primaryLanguage === i && !this.forceLanguageUpdate))
      return;
    if (this.primaryLanguage.flag === R.STYLE_LOCK.flag) {
      console.warn("The language cannot be changed because this map has been instantiated with the STYLE_LOCK language flag.");
      return;
    }
    this.primaryLanguage = i;
    let a = i;
    if (i.flag === R.STYLE.flag) {
      if (!n) {
        console.warn("The style has no default languages or has an invalid one.");
        return;
      }
      a = n;
    }
    let o = R.LOCAL.flag, s = ["get", o];
    a.flag === R.VISITOR.flag ? (o = Zi().flag, s = [
      "case",
      ["all", ["has", o], ["has", R.LOCAL.flag]],
      [
        "case",
        ["==", ["get", o], ["get", R.LOCAL.flag]],
        ["get", R.LOCAL.flag],
        ["format", ["get", o], { "font-scale": 0.8 }, `
`, ["get", R.LOCAL.flag], { "font-scale": 1.1 }]
      ],
      ["get", R.LOCAL.flag]
    ]) : a.flag === R.VISITOR_ENGLISH.flag ? (o = R.ENGLISH.flag, s = [
      "case",
      ["all", ["has", o], ["has", R.LOCAL.flag]],
      [
        "case",
        ["==", ["get", o], ["get", R.LOCAL.flag]],
        ["get", R.LOCAL.flag],
        ["format", ["get", o], { "font-scale": 0.8 }, `
`, ["get", R.LOCAL.flag], { "font-scale": 1.1 }]
      ],
      ["get", R.LOCAL.flag]
    ]) : a.flag === R.AUTO.flag ? (o = Zi().flag, s = ["coalesce", ["get", o], ["get", R.LOCAL.flag]]) : a === R.LOCAL ? (o = R.LOCAL.flag, s = ["get", o]) : (o = a.flag, s = ["coalesce", ["get", o], ["get", R.LOCAL.flag]]);
    const { layers: l } = this.getStyle(), u = this.originalLabelStyle.size === 0;
    if (u) {
      const c = Fc(l, this);
      this.isStyleLocalized = Object.keys(c.localized).length > 0;
    }
    for (const c of l) {
      if (c.type !== "symbol")
        continue;
      const p = c, f = this.getSource(p.source);
      if (!f || !("url" in f && typeof f.url == "string") || new URL(f.url).host !== re.maptilerApiHost)
        continue;
      const { id: h, layout: m } = p;
      if (!m || !("text-field" in m))
        continue;
      let g;
      if (u ? (g = this.getLayoutProperty(h, "text-field"), this.originalLabelStyle.set(h, g)) : g = this.originalLabelStyle.get(h), typeof g == "string") {
        const { contains: v, exactMatch: b } = Ic(g, this.isStyleLocalized);
        if (!v) continue;
        if (b)
          this.setLayoutProperty(h, "text-field", s);
        else {
          const x = Mc(g, s, this.isStyleLocalized);
          this.setLayoutProperty(h, "text-field", x);
        }
      } else {
        const v = JSON.stringify(g);
        (v.includes('"name"') || v.includes('"name:')) && this.setLayoutProperty(h, "text-field", s);
      }
    }
    this.languageIsUpdated = !0;
  }
  /**
   * Get the primary language
   * @returns
   */
  getPrimaryLanguage() {
    return this.primaryLanguage;
  }
  /**
   * Get the exaggeration factor applied to the terrain
   * @returns
   */
  getTerrainExaggeration() {
    return this.terrainExaggeration;
  }
  /**
   * Know if terrian is enabled or not
   * @returns
   */
  hasTerrain() {
    return this.isTerrainEnabled;
  }
  growTerrain(t) {
    if (!this.terrain)
      return;
    const n = performance.now(), i = this.terrain.exaggeration, a = t - i, o = () => {
      if (!this.terrain || this.terrainFlattening)
        return;
      const s = (performance.now() - n) / this.terrainAnimationDuration;
      if (s < 0.99) {
        const l = 1 - (1 - s) ** 4, u = i + l * a;
        this.terrain.exaggeration = u, requestAnimationFrame(o);
      } else
        this.terrainGrowing = !1, this.terrainFlattening = !1, this.terrain.exaggeration = t, this.fire("terrainAnimationStop", { terrain: this.terrain });
      this._elevationFreeze = !1, this.triggerRepaint();
    };
    !this.terrainGrowing && !this.terrainFlattening && this.fire("terrainAnimationStart", { terrain: this.terrain }), this.terrainGrowing = !0, this.terrainFlattening = !1, requestAnimationFrame(o);
  }
  /**
   * Enables the 3D terrain visualization
   */
  enableTerrain(t = this.terrainExaggeration) {
    if (t < 0) {
      console.warn("Terrain exaggeration cannot be negative.");
      return;
    }
    const n = (a) => {
      !this.terrain || a.type !== "data" || a.dataType !== "source" || !("source" in a) || a.sourceId !== "maptiler-terrain" || a.source.type !== "raster-dem" || a.isSourceLoaded && (this.off("data", n), this.growTerrain(t));
    }, i = () => {
      this.isTerrainEnabled = !0, this.terrainExaggeration = t, this.on("data", n), this.addSource(re.terrainSourceId, {
        type: "raster-dem",
        url: re.terrainSourceURL
      }), this.setTerrain({
        source: re.terrainSourceId,
        exaggeration: 0
      });
    };
    if (this.getTerrain()) {
      this.isTerrainEnabled = !0, this.growTerrain(t);
      return;
    }
    if (this.loaded() || this.isTerrainEnabled)
      i();
    else {
      const a = () => {
        this.getTerrain() && this.getSource(re.terrainSourceId) || i();
      };
      this.once(this.style._loaded ? "render" : "load", () => {
        a();
      }), this.once("moveend", () => {
        a();
      });
    }
  }
  /**
   * Disable the 3D terrain visualization
   */
  disableTerrain() {
    if (!this.terrain)
      return;
    this.isTerrainEnabled = !1;
    const t = performance.now(), n = this.terrain.exaggeration, i = () => {
      if (!this.terrain || this.terrainGrowing)
        return;
      const a = (performance.now() - t) / this.terrainAnimationDuration;
      if (this._elevationFreeze = !1, a < 0.99) {
        const o = (1 - a) ** 4, s = n * o;
        this.terrain.exaggeration = s, requestAnimationFrame(i);
      } else
        this.terrain.exaggeration = 0, this.terrainGrowing = !1, this.terrainFlattening = !1, this.setTerrain(), this.getSource(re.terrainSourceId) && this.removeSource(re.terrainSourceId), this.fire("terrainAnimationStop", { terrain: null });
      this.triggerRepaint();
    };
    !this.terrainGrowing && !this.terrainFlattening && this.fire("terrainAnimationStart", { terrain: this.terrain }), this.terrainGrowing = !1, this.terrainFlattening = !0, requestAnimationFrame(i);
  }
  /**
   * Sets the 3D terrain exageration factor.
   * If the terrain was not enabled prior to the call of this method,
   * the method `.enableTerrain()` will be called.
   * If `animate` is `true`, the terrain transformation will be animated in the span of 1 second.
   * If `animate` is `false`, no animated transition to the newly defined exaggeration.
   */
  setTerrainExaggeration(t, n = !0) {
    !n && this.terrain ? (this.terrainExaggeration = t, this.terrain.exaggeration = t, this.triggerRepaint()) : this.enableTerrain(t);
  }
  /**
   * Perform an action when the style is ready. It could be at the moment of calling this method
   * or later.
   */
  onStyleReady(t) {
    this.isStyleLoaded() ? t() : this.once("styledata", () => {
      t();
    });
  }
  async fitToIpBounds() {
    const t = await Li.info();
    this.fitBounds(t.country_bounds, {
      duration: 0,
      padding: 100
    });
  }
  async centerOnIpPoint(t) {
    const n = await Li.info();
    this.jumpTo({
      center: [n.longitude ?? 0, n.latitude ?? 0],
      zoom: t || 11
    });
  }
  getCameraHash() {
    const t = new Float32Array(5), n = this.getCenter();
    return t[0] = n.lng, t[1] = n.lat, t[2] = this.getZoom(), t[3] = this.getPitch(), t[4] = this.getBearing(), wl.fromUint8Array(new Uint8Array(t.buffer));
  }
  /**
   * Get the SDK config object.
   * This is convenient to dispatch the SDK configuration to externally built layers
   * that do not directly have access to the SDK configuration but do have access to a Map instance.
   */
  getSdkConfig() {
    return D;
  }
  /**
   * Get the MapTiler session ID. Convenient to dispatch to externaly built component
   * that do not directly have access to the SDK configuration but do have access to a Map instance.
   * @returns
   */
  getMaptilerSessionId() {
    return Or;
  }
  /**
   *  Updates the requestManager's transform request with a new function.
   *
   * @param transformRequest A callback run before the Map makes a request for an external URL. The callback can be used to modify the url, set headers, or set the credentials property for cross-origin requests.
   *    Expected to return an object with a `url` property and optionally `headers` and `credentials` properties
   *
   * @returns {Map} `this`
   *
   *  @example
   *  map.setTransformRequest((url: string, resourceType: string) => {});
   */
  setTransformRequest(t) {
    return super.setTransformRequest(Qi(t)), this;
  }
  /**
   * Gets the {@link ProjectionSpecification}.
   * @returns the projection specification.
   * @example
   * ```ts
   * let projection = map.getProjection();
   * ```
   */
  getProjection() {
    const t = this.style.getProjection();
    return t === void 0 && this.style.projection ? { type: this.style.projection.name } : t;
  }
  /**
   * Returns whether a globe-family projection is currently configured — `"globe"`,
   * `"vertical-perspective"`, or the `globeMercatorSwitchZoom` step expression this class
   * requests for `"globe"` (see {@link MapOptions.globeMercatorSwitchZoom}). This reflects the
   * configured projection, not the instantaneous rendered state — under the step expression it
   * stays `true` even after zooming past the switch threshold into flat mercator rendering.
   */
  isGlobeProjection() {
    const t = this.getProjection();
    return t ? t.type !== "mercator" : !1;
  }
  setProjection(t, n) {
    if (typeof t == "string" && (t = { type: t }), (t.type === "mercator" || t.type === "globe") && (n != null && n.persist) && (this.curentProjection = t.type), t.type === "globe" && this.options.globeMercatorSwitchZoom !== !1) {
      const i = this.options.globeMercatorSwitchZoom ?? bd;
      t = { type: ["step", ["zoom"], "vertical-perspective", i, "mercator"] };
    }
    return this.fire("projection.change", { target: this, projection: t }), super.setProjection(t);
  }
  /**
   * Forget the persisted projection - from both constructor option and result of any `map.setProjection(..., { persist: true })` calls.
   */
  forgetPersistedProjection() {
    return this.curentProjection = void 0, this;
  }
  /**
   * Returns `true` is the language was ever updated, meaning changed
   * from what is delivered in the style.
   * Returns `false` if language in use is the language from the style
   * and has never been changed.
   */
  isLanguageUpdated() {
    return this.languageIsUpdated;
  }
  // ─── Tile Preloading ─────────────────────────────────────────────────────────
  /**
   * Preloads all tiles within a geographic bounds across a range of zoom levels,
   * storing them in the SDK tile cache so subsequent renders are served instantly.
   *
   * @remarks
   * **API Key Usage**: This method issues one tile request per tile per active source.
   * Tile count grows exponentially with zoom level — a wide zoom range over a large
   * area can trigger thousands of requests, each counting against your MapTiler Cloud
   * API key quota. Use narrow zoom ranges and small bounds wherever possible, and
   * monitor consumption via the `onProgress` callback.
   * @experimental
   * @param {PreloadTilesForBoundsOptions} options - The options for the preload.
   * @returns A promise that resolves when the preload is complete.
   * @example
   * ```ts
   * await map.experimental_preloadTilesForBounds({
   *   bounds: map.getBounds(),
   *   minZoom: 8,
   *   maxZoom: 12,
   * });
   * ```
   */
  async experimental_preloadTilesForBounds(t) {
    var n;
    this.options.useExperimentalTilePreloading && await ((n = this.tilePreloader) == null ? void 0 : n.preloadForBounds(t));
  }
  /**
   * Preloads tiles visible from each of the given camera positions, storing them
   * in the SDK tile cache so renders at those viewpoints are served instantly.
   *
   * Use this method before a planned `flyTo` or `panTo` to ensure tiles along
   * the path are ready when the animation reaches them.
   * @experimental
   * @param {PreloadTilesForCameraPositionsOptions} options - The options for the preload.
   * @returns A promise that resolves when the preload is complete.
   * @remarks
   * **API Key Usage**: Each position triggers one request per visible tile per
   * active source. More positions at higher zoom levels significantly increase
   * API usage, each request counting against your MapTiler Cloud API key quota.
   *
   * @example
   * ```ts
   * await map.preloadTilesForCameraPositions({
   *   positions: [
   *     { lng: -74.006, lat: 40.7128, zoom: 12 },
   *     { lng: -73.935, lat: 40.730,  zoom: 14 },
   *   ],
   *   onProgress: (done, total, tileID) => console.log(tileID),
   * });
   * ```
   */
  async experimental_preloadTilesForCameraPositions(t) {
    var n;
    this.options.useExperimentalTilePreloading && await ((n = this.tilePreloader) == null ? void 0 : n.preloadForCameraPositions(t));
  }
  /**
   * Preloads a specific set of tiles identified by their `"z/x/y"` tile IDs,
   * storing them in the SDK tile cache.
   *
   * @experimental
   * @param {PreloadTilesOptions} options - The options for the preload.
   * @returns A promise that resolves when the preload is complete.
   * @remarks
   * **API Key Usage**: Each tile ID results in one request per active source,
   * counting against your MapTiler Cloud API key quota.
   *
   * @example
   * ```ts
   * await map.preloadTiles({
   *   tileIDs: ["12/1205/1540", "12/1206/1540"],
   *   onError: (err) => console.error(err),
   * });
   * ```
   */
  async experimental_preloadTiles(t) {
    var n;
    this.options.useExperimentalTilePreloading && await ((n = this.tilePreloader) == null ? void 0 : n.preloadByTileIDs(t));
  }
  // ─── Camera method overrides with optional tile preloading ───────────────────
  /**
   * Changes any combination of center, zoom, bearing, and pitch, animating the
   * transition along a curve that evokes flight. The animation seamlessly incorporates
   * zooming and panning to help the user maintain her bearings even after traversing
   * a great distance.
   *
   * If `options.experimental_preload` is provided, tiles along the flight path are fetched and
   * cached before the animation begins so they are ready when rendered.
   *
   * @remarks
   * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for positions
   * sampled along the flight path. These count against your MapTiler Cloud API key quota.
   */
  flyTo(t, n) {
    var o, s;
    const { experimental_preload: i, ...a } = t;
    if (i) {
      (o = this.tilePreloader) == null || o.abortAll();
      const l = this.resolveCameraPosition(a);
      return (s = this.tilePreloader) == null || s.preloadForCameraPositions({ positions: [l], ...i }).then(() => super.flyTo(a, n)), this;
    }
    return super.flyTo(a, n);
  }
  /**
   * Pans the map to the specified location with an animated transition.
   *
   * If `options.experimental_preload` is provided, tiles along the pan path are fetched and
   * cached before the animation begins.
   *
   * @remarks
   * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for positions
   * sampled along the pan path. These count against your MapTiler Cloud API key quota.
   */
  panTo(t, n, i) {
    var s, l;
    const { experimental_preload: a, ...o } = n ?? {};
    if (a && this.options.useExperimentalTilePreloading) {
      (s = this.tilePreloader) == null || s.abortAll();
      const u = C.LngLat.convert(t), c = this.currentCameraPosition(), p = { lng: u.lng, lat: u.lat, zoom: c.zoom, pitch: c.pitch, bearing: c.bearing }, f = super.panTo.bind(this);
      return (l = this.tilePreloader) == null || l.preloadForLinearPath({ start: c, end: p, ...a }).then(() => f(t, o, i)), this;
    }
    return super.panTo(t, o, i);
  }
  /**
   * Changes any combination of center, zoom, bearing, pitch, and roll, with an
   * animated transition between old and new values.
   *
   * If `options.experimental_preload` is provided, tiles along the ease path are fetched and
   * cached before the animation begins.
   *
   * @remarks
   * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for positions
   * sampled along the ease path. These count against your MapTiler Cloud API key quota.
   */
  easeTo(t, n) {
    var o, s;
    const { experimental_preload: i, ...a } = t;
    if (i && this.options.useExperimentalTilePreloading) {
      (o = this.tilePreloader) == null || o.abortAll();
      const l = this.currentCameraPosition(), u = this.resolveCameraPosition(a), c = super.easeTo.bind(this);
      return (s = this.tilePreloader) == null || s.preloadForLinearPath({ start: l, end: u, ...i }).then(() => c(a, n)), this;
    }
    return super.easeTo(a, n);
  }
  /**
   * Pans and zooms the map to contain its visible area within the specified
   * geographical bounds. This function will also reset the map's bearing to 0
   * if options.bearing is not specified.
   *
   * If `options.experimental_preload` is provided, tiles for the target view are fetched and
   * cached before the animation begins.
   *
   * @remarks
   * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for the
   * destination viewport. These count against your MapTiler Cloud API key quota.
   */
  fitBounds(t, n, i) {
    var s, l;
    const { experimental_preload: a, ...o } = n ?? {};
    if (a && this.options.useExperimentalTilePreloading) {
      (s = this.tilePreloader) == null || s.abortAll();
      const u = this.cameraForBounds(t, o);
      if (u != null && u.center) {
        const c = this.currentCameraPosition(), p = C.LngLat.convert(u.center), f = {
          lng: p.lng,
          lat: p.lat,
          zoom: u.zoom ?? c.zoom,
          pitch: c.pitch,
          bearing: u.bearing ?? c.bearing
        }, d = super.fitBounds.bind(this);
        return (l = this.tilePreloader) == null || l.preloadForLinearPath({ start: c, end: f, ...a }).then(() => d(t, o, i)), this;
      }
    }
    return super.fitBounds(t, o, i);
  }
  /**
   * Zooms the map to the specified zoom level, with an animated transition.
   *
   * If `options.experimental_preload` is provided, tiles for the target zoom level are fetched
   * and cached before the animation begins.
   *
   * @remarks
   * **API Key Usage**: When `experimental_preload` is set, tile requests are issued for the
   * target zoom. These count against your MapTiler Cloud API key quota.
   */
  zoomTo(t, n, i) {
    var s, l;
    const { experimental_preload: a, ...o } = n ?? {};
    if (a && this.options.useExperimentalTilePreloading) {
      (s = this.tilePreloader) == null || s.abortAll();
      const u = this.currentCameraPosition(), c = { ...u, zoom: t }, p = super.zoomTo.bind(this);
      return (l = this.tilePreloader) == null || l.preloadForLinearPath({ start: u, end: c, ...a }).then(() => p(t, o, i)), this;
    }
    return super.zoomTo(t, o, i);
  }
  /**
   * Returns the map's current camera state as a {@link CameraPosition}.
   */
  currentCameraPosition() {
    const t = this.getCenter();
    return {
      lng: t.lng,
      lat: t.lat,
      zoom: this.getZoom(),
      pitch: this.getPitch(),
      bearing: this.getBearing()
    };
  }
  /**
   * Resolves camera method options into a {@link CameraPosition}, filling in
   * current map state for any properties not specified in the options.
   */
  resolveCameraPosition(t) {
    const n = this.currentCameraPosition();
    let i = n.lng, a = n.lat;
    if (t.center) {
      const o = C.LngLat.convert(t.center);
      i = o.lng, a = o.lat;
    }
    return {
      lng: i,
      lat: a,
      zoom: t.zoom ?? n.zoom,
      pitch: t.pitch ?? n.pitch,
      bearing: t.bearing ?? n.bearing
    };
  }
};
function lr(r) {
  if (r = { ...r }, D.session ? r.session !== !1 : r.session === !0) {
    const e = r.adjustSearchParams;
    r.adjustSearchParams = (t) => {
      typeof e == "function" && e(t), t.append("mtsid", Or);
    };
  }
  return delete r.session, r;
}
const zh = {
  forward: (r, e = {}) => Xt.geocoding.forward(r, lr(e)),
  reverse: (r, e = {}) => Xt.geocoding.reverse(r, lr(e)),
  byId: (r, e = {}) => Xt.geocoding.byId(r, lr(e)),
  batch: (r, e = {}) => Xt.geocoding.batch(r, lr(e))
};
class ue {
  constructor(e, t, n, i = {}) {
    y(this, "type");
    y(this, "target");
    y(this, "originalEvent");
    y(this, "imageX");
    y(this, "imageY");
    y(this, "isOutOfBounds");
    this.type = e, this.target = t, this.originalEvent = n ?? null, Object.assign(this, i);
  }
}
const js = [
  // pass nothing other than target (map / viewer) and type
  "idle",
  "render",
  "load",
  "remove",
  "idle"
  // these are fired on layers, not the map,
  // keeping them for reference
  // "content",
  // "visibility",
], Us = [
  "error"
  // ErrorEvent
], Bs = ["resize"], Vs = ["webglcontextlost", "webglcontextrestored"], qs = [
  "moveend",
  "movestart",
  "move",
  "zoomend",
  "zoomstart",
  "zoom",
  "rotatestart",
  "rotateend",
  "rotate",
  "dragstart",
  "dragend",
  "drag",
  "boxzoomcancel",
  "boxzoomend",
  "boxzoomstart"
], Gs = ["click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseout", "mouseover", "contextmenu", "touchstart", "touchend", "touchmove", "touchcancel"], Hs = ["cooperativegestureprevented"], Ks = [
  "data",
  "dataloading",
  "sourcedata",
  "sourcedataloading",
  "dataabort",
  "sourcedataabort"
  // this is fired on layers, not the map
  // keeping it for reference
  // "metadata",
], wd = [
  ...js,
  ...Us,
  ...Bs,
  ...Vs,
  ...qs,
  ...Gs,
  ...Ks,
  ...Hs
], Sd = ["lngLat", "_defaultPrevented"];
function xd({ map: r, viewer: e, lngLatToPx: t }) {
  wd.forEach((n) => {
    try {
      r.on(n, (i) => {
        const a = n;
        if (Gs.includes(a)) {
          const d = i, h = d.lngLat && t(d.lngLat), m = e.getImageMetadata(), v = {
            isOutOfBounds: m ? h[0] < 0 || h[0] > m.width || h[1] < 0 || h[1] > m.height : !0,
            imageX: h[0],
            imageY: h[1],
            ...Object.fromEntries(Object.entries(i).filter(([b]) => !Sd.includes(b)))
          };
          e.fire(new ue(n, e, d.originalEvent, v));
          return;
        }
        const o = n;
        if (qs.includes(o)) {
          const d = i;
          e.fire(new ue(n, e, d.originalEvent, d));
          return;
        }
        const s = n;
        if (Us.includes(s)) {
          const d = i;
          e.fire(new ue(n, e, null, d));
          return;
        }
        const l = n;
        if (Bs.includes(l)) {
          const d = i;
          e.fire(new ue(n, e, null, d));
          return;
        }
        const u = n;
        if (Vs.includes(u)) {
          const d = i;
          e.fire(new ue(n, e, d.originalEvent, d));
          return;
        }
        const c = n;
        if (Ks.includes(c)) {
          const d = i;
          e.fire(new ue(n, e, null, d));
          return;
        }
        const p = n;
        if (Hs.includes(p)) {
          const d = i;
          e.fire(new ue(n, e, null, d));
          return;
        }
        const f = n;
        if (js.includes(f)) {
          e.fire(new ue(n, e));
          return;
        }
      });
    } catch (i) {
      console.error(`Error forwarding event to ImageViewer, event of type "${n}" is not supported`, i);
    }
  });
}
class Cd extends Error {
  constructor(t, n, i) {
    const a = `[${i}]: Failed to fetch ${n} at ${t.url}: ${t.status.toString()}: ${t.statusText}`;
    super(a);
    y(this, "status");
    y(this, "statusText");
    this.name = "FetchError", this.message = a, this.status = t.status, this.statusText = t.statusText;
  }
}
const Fa = 85.051129;
function Ad(r, e) {
  return new Zn(e.x / r, e.y / r).toLngLat();
}
function Ld(r) {
  return Math.pow(2, r);
}
function Ed(r) {
  return Math.log(r) / Math.LN2;
}
function Zs(r, e, t) {
  return Math.min(t, Math.max(e, r));
}
function jn(r) {
  return (180 - 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + r * Math.PI / 360))) / 360;
}
function Un(r) {
  return (180 + r) / 360;
}
function za(r, e, t) {
  const n = t - e, i = ((r - e) % n + n) % n + e;
  return i === e ? t : i;
}
function Td(r, e) {
  const t = Zs(e.lat, -Fa, Fa);
  return new cl(Un(e.lng) * r, jn(t) * r);
}
const kd = function(r, e) {
  e = Zs(e, this.minZoom, this.maxZoom);
  const t = {
    center: new Le(r.lng, r.lat),
    zoom: e
  };
  let n = this.lngRange;
  const i = this.latRange;
  if (n === null) {
    const Q = 179.9999999999;
    n = [-Q, Q];
  }
  const a = this.tileSize * Ld(t.zoom);
  let o = 0, s = a, l = 0, u = a, c = 0, p = 0;
  const { x: f, y: d } = this.size, h = 0.5;
  i && (o = jn(i[1]) * a, s = jn(i[0]) * a, s - o < h * d && (c = h * d / (s - o))), n && (l = za(Un(n[0]) * a, 0, a), u = za(Un(n[1]) * a, 0, a), u < l && (u += a), u - l < h * f && (p = h * f / (u - l)));
  const { x: m, y: g } = Td(a, r);
  let v, b;
  const x = Math.min(p || 0, c || 0);
  if (x)
    return t.zoom += Ed(x), t;
  let k = 0, L = 0;
  const E = 1, N = 1 - (s - o) / d, fe = 1 - (u - l) / f;
  k = Math.max(fe, E), L = Math.max(N, E);
  const Ke = 1 - k, Ze = 1 - L;
  if (i) {
    const Q = Ze * d / 2;
    g - Q < o && (b = o + Q), g + Q > s && (b = s - Q);
  }
  if (n) {
    const Q = m, We = Ke * f / 2;
    Q - We < l && (v = l + We), Q + We > u && (v = u - We);
  }
  if (v !== void 0 || b !== void 0) {
    const Q = new cl(v ?? m, b ?? g);
    t.center = Ad(a, Q).wrap();
  }
  return t;
}, Id = {
  center: "translate(-50%,-50%)",
  top: "translate(-50%,0)",
  "top-left": "translate(0,0)",
  "top-right": "translate(-100%,0)",
  bottom: "translate(-50%,-100%)",
  "bottom-left": "translate(0,-100%)",
  "bottom-right": "translate(-100%,-100%)",
  left: "translate(0,-50%)",
  right: "translate(-100%,-50%)"
};
function Md(r) {
  function e(t) {
    if (!this._map) return;
    const n = this._map.loaded() && !this._map.isMoving();
    ((t == null ? void 0 : t.type) === "terrain" || (t == null ? void 0 : t.type) === "render" && !n) && this._map.once("render", this._update), this._flatPos = this._pos = this._map.project(this._lngLat)._add(this._offset), this._map.terrain && (this._flatPos = this._map.transform.locationToScreenPoint(this._lngLat)._add(this._offset));
    let i = "";
    this._rotationAlignment === "viewport" || this._rotationAlignment === "auto" ? i = `rotateZ(${this._rotation}deg)` : this._rotationAlignment === "map" && (i = `rotateZ(${this._rotation - this._map.getBearing()}deg)`);
    let a = "";
    this._pitchAlignment === "viewport" || this._pitchAlignment === "auto" ? a = "rotateX(0deg)" : this._pitchAlignment === "map" && (a = `rotateX(${this._map.getPitch()}deg)`), !this._subpixelPositioning && (!t || t.type === "moveend") && (this._pos = this._pos.round());
    const o = `${Id[this._anchor]} translate(${this._pos.x}px, ${this._pos.y}px) ${a} ${i}`;
    this._element.style.transform = o;
  }
  r._update = e.bind(r);
}
class Pd {
  constructor({ imageViewer: e }) {
    y(this, "viewer");
    y(this, "container");
    y(this, "handleClick", () => {
      this.viewer.fitImageToViewport({ ease: !0 });
    });
    if (!e)
      throw new Error("ImageViewerFitImageToBoundsControl: an instance of 'ImageViewer' is required");
    this.viewer = e;
  }
  onAdd(e) {
    const t = document.createElement("button");
    this.container = document.createElement("div"), this.container.classList.add("maplibregl-ctrl", "maplibregl-ctrl-group"), t.classList.add("maplibregl-ctrl-fit-image-to-bounds");
    const n = document.createElement("span");
    return n.classList.add("maplibregl-ctrl-icon"), t.title = "Zoom image to viewport bounds", t.appendChild(n), t.addEventListener("click", this.handleClick), this.container.appendChild(t), this.container;
  }
  onRemove() {
    this.container.remove();
  }
}
const Ws = Symbol("MapTiler:ImageViewer:Internal:lngLatToPxInternal"), Ys = Symbol("MapTiler:ImageViewer:Internal:pxToLngLatInternal"), { Evented: _d } = C, Od = {
  style: {
    version: 8,
    sources: {},
    layers: []
  },
  minPitch: 0,
  maxPitch: 0,
  pitch: 0,
  bearing: 0,
  projection: "mercator",
  geolocateControl: !1,
  navigationControl: !1,
  projectionControl: !1,
  hash: !1,
  renderWorldCopies: !1,
  terrain: !1,
  space: !1,
  halo: !1,
  transformConstrain: kd
}, Rd = {
  debug: !1,
  fitToBoundsControl: !0,
  navigationControl: !0
};
var Ha, Ka, Za;
class Fd extends (Za = _d, Ka = Ws, Ha = Ys, Za) {
  //#region constructor
  /**
   * The constructor for the ImageViewer.
   *
   * @param {Partial<ImageViewerConstructorOptions>} imageViewerConstructorOptions - The options for the ImageViewer.
   * @example
   * ```ts
   * import "@maptiler/sdk/dist/maptiler-sdk.css"; // import css
   * import { ImageViewer } from "@maptiler/sdk"; // import the sdk
   *
   * const imageViewer = new ImageViewer({
   *   container: document.getElementById("map"),
   *   imageUUID: "01986025-ceb9-7487-9ea6-7a8637dcc1a1",
   *   debug: true, // show tile boundaries, padding, collision boxes etc
   *   fitToBoundsControl: true, // show a control to fit the image to the viewport
   *   navigationControl: true, // show a navigation control
   *   center: [0, 0], // center in pixels
   *   zoom: 1, // zoom level
   *   bearing: 0, // bearing
   * });
   * ```
   */
  constructor(t) {
    super();
    /**
     * The UUID of the image.
     *
     * @internal
     */
    y(this, "imageUUID");
    /**
     * Whether to enable debug mode.
     *
     * @internal
     */
    y(this, "debug");
    /**
     * The metadata of the image.
     *
     */
    y(this, "imageMetadata");
    /**
     * Why not extend the Map class?
     * Because ImageViewer technically operates in screen space and not in map space.
     * We wrap map and perform calculations in screen space.
     * We do not want to have to extend the Map class and give access to
     * methods and properties that operate in LngLat space.   *
     */
    y(this, "sdk");
    /**
     * The options for the ImageViewer.
     *
     * @internal
     */
    y(this, "options");
    /**
     * The size of the image.
     *
     * @internal
     */
    y(this, "imageSize");
    /**
     * The padded size max.
     *
     * @internal
     */
    y(this, "paddedSizeMax");
    /**
     * The control to fit the image to the viewport.
     */
    y(this, "fitToBoundsControlInstance");
    // this flag is used to determine if the image should be fit to the viewport
    // when the map is resized
    y(this, "shouldFitImageToViewport", !0);
    // aliases for methods that are not exposed by the SDK
    // but used internally (ImageMarkers)
    y(this, Ka, this.lngLatToPx.bind(this));
    y(this, Ha, this.pxToLngLat.bind(this));
    if (!t.imageUUID)
      throw new Error("[ImageViewer]: `imageUUID` is required");
    if (typeof t.container != "string" && !(t.container instanceof HTMLElement))
      throw new Error("[ImageViewer]: `container` is required and must be a string or HTMLElement");
    this.options = {
      ...Rd,
      ...t
    };
    const n = {
      ...this.options,
      ...Od
    };
    delete n.center, this.sdk = new Ns(n), this.sdk.telemetry.registerViewerType("ImageViewer");
    const { imageUUID: i, debug: a } = t;
    this.imageUUID = i, this.debug = a ?? !1, this.debug && (this.sdk.showTileBoundaries = this.debug, this.sdk.showPadding = this.debug, this.sdk.showCollisionBoxes = this.debug, this.sdk.repaint = this.debug), this.init();
  }
  /**
   * The version of the ImageViewer / SDK.
   */
  get version() {
    return this.sdk.version;
  }
  //#region onReadyAsync
  /**
   * Waits for the ImageViewer to be ready.
   *
   * @returns {Promise<void>}
   */
  async onReadyAsync() {
    try {
      await Promise.race([
        new Promise((t, n) => {
          this.once("imageviewerready", (i) => {
            t(i);
          }), this.once("imagevieweriniterror", (i) => {
            n(i.error);
          });
        }),
        new Promise((t, n) => {
          setTimeout(() => {
            n(new Error("Timeout waiting for image viewer to be ready"));
          }, 5e3);
        })
      ]);
    } catch (t) {
      throw t;
    }
  }
  //#region init
  /**
   * Initializes the ImageViewer
   *  - fetches the image metadata
   *  - adds the image source to the sdk instance
   *  - sets the center to the middle of the image (if center is not provided)
   *  - monkeypatches the maplibre-gl sdk transform method to allow for overpanning and underzooming.
   *  - sets up global event forwarding / intercepting from the map instance
   *  - sets the center to the middle of the image (if center is not provided)
   *
   * @internal
   * @returns {Promise<void>}
   */
  async init() {
    var t, n, i;
    try {
      await this.sdk.onReadyAsync(), await this.fetchImageMetadata(), this.addImageSource(), this.options.navigationControl && this.sdk.addControl(
        new wo({
          visualizePitch: !1,
          visualizeRoll: !1
        })
      ), this.fitToBoundsControlInstance = new Pd({ imageViewer: this }), this.options.fitToBoundsControl && this.sdk.addControl(this.fitToBoundsControlInstance), xd({
        map: this.sdk,
        viewer: this,
        lngLatToPx: (u) => this.lngLatToPx(u)
      });
      const { center: a, zoom: o, bearing: s } = this.options, l = a ?? [(((t = this.imageMetadata) == null ? void 0 : t.width) ?? 0) / 2, (((n = this.imageMetadata) == null ? void 0 : n.height) ?? 0) / 2];
      this.setCenter(l), this.setBearing(s ?? 0), this.options.zoom ? this.setZoom(o ?? ((i = this.imageMetadata) == null ? void 0 : i.maxzoom) ?? 5) : this.fitImageToViewport(), this.sdk.on("wheel", () => {
        this.shouldFitImageToViewport = !1;
      }), this.sdk.on("touchstart", () => {
        this.shouldFitImageToViewport = !1;
      }), this.sdk.on("drag", () => {
        this.shouldFitImageToViewport = !1;
      }), this.sdk.on("resize", () => {
        var f, d;
        const u = this.getCenter(), c = ((f = this.imageMetadata) == null ? void 0 : f.width) ?? 0, p = ((d = this.imageMetadata) == null ? void 0 : d.height) ?? 0;
        this.shouldFitImageToViewport && this.fitImageToViewport(), (u[0] !== c / 2 || u[1] !== p / 2) && this.setCenter(u);
      }), this.fire("imageviewerready", new ue("imageviewerready", this));
    } catch (a) {
      this.fire("imagevieweriniterror", { error: a });
    }
  }
  //#region fitImageToViewport
  /**
   * Fits the image to the viewport.
   *
   * @param {Object} options - The options for the fit image to viewport.
   * @param {boolean} options.ease - Whether to ease to the viewport bounds.
   */
  fitImageToViewport({ ease: t = !1 } = {}) {
    if (!this.imageMetadata)
      throw new Error("[ImageViewer]: Image metadata not found");
    const n = this.pxToLngLat([0, 0]), i = this.pxToLngLat([this.imageMetadata.width ?? 0, this.imageMetadata.height ?? 0]), a = this.sdk.cameraForBounds([n, i], { padding: 50 });
    a && (t ? this.sdk.easeTo({ ...a, pitch: 0 }) : this.sdk.jumpTo({ ...a, pitch: 0 }, null)), this.shouldFitImageToViewport = !0;
  }
  //#region fetchImageMetadata
  /**
   * Fetches the image metadata from the API.
   *
   * @internal
   * @returns {Promise<void>}
   */
  async fetchImageMetadata() {
    const t = zd(this.imageUUID), n = await fetch(t);
    if (!n.ok)
      throw new Cd(n, "image metadata", "ImageViewer");
    const i = await n.json();
    this.imageMetadata = i, Object.freeze(this.imageMetadata);
  }
  //#region addImageSource
  /**
   * Adds the image source to the sdk instance.
   *
   * @internal
   * @returns {void}
   */
  addImageSource() {
    if (!this.imageMetadata)
      throw this.fire("error", new ue("error", this, null, { error: new Error("[ImageViewer]: Image metadata not found") })), new Error("[ImageViewer]: Image metadata not found");
    const t = Dd(this.imageUUID), n = (s) => Math.pow(2, Math.ceil(Math.log(s) / Math.LN2));
    this.imageSize = [this.imageMetadata.width, this.imageMetadata.height], this.paddedSizeMax = Math.max(n(this.imageSize[0]), n(this.imageSize[1]));
    const i = this.pxToLngLat([0, 0]), a = this.pxToLngLat(this.imageSize), o = [i.lng, a.lat, a.lng, i.lat];
    this.sdk.addSource("image", {
      ...this.imageMetadata,
      type: "raster",
      bounds: o,
      tiles: [t]
    }), this.sdk.addLayer({
      id: "image",
      type: "raster",
      source: "image"
    });
  }
  //#region SDK mappings
  /**
   * Triggers a repaint of the ImageViewer. Same as map.triggerRepaint().
   *
   * @internal
   * @returns {void}
   */
  triggerRepaint() {
    this.sdk.triggerRepaint();
  }
  /**
   * The scroll zoom handler.
   *
   * @internal
   * @returns {ScrollZoomHandler}
   */
  get scrollZoom() {
    return this.sdk.scrollZoom;
  }
  /**
   * The scroll zoom handler.
   *
   * @internal
   * @param {ScrollZoomHandler} value - The scroll zoom handler.
   */
  set scrollZoom(t) {
    this.sdk.scrollZoom = t;
  }
  /**
   * The box zoom handler.
   *
   * @internal
   * @returns {BoxZoomHandler}
   */
  get boxZoom() {
    return this.sdk.boxZoom;
  }
  /**
   * The box zoom handler.
   *
   * @internal
   * @param {BoxZoomHandler} value - The box zoom handler.
   */
  set boxZoom(t) {
    this.sdk.boxZoom = t;
  }
  /**
   * The drag pan handler.
   *
   * @internal
   * @returns {DragPanHandler}
   */
  get dragPan() {
    return this.sdk.dragPan;
  }
  /**
   * The drag pan handler.
   *
   * @internal
   * @param {DragPanHandler} value - The drag pan handler.
   */
  set dragPan(t) {
    this.sdk.dragPan = t;
  }
  /**
   * The keyboard handler.
   *
   * @internal
   * @returns {KeyboardHandler}
   */
  get keyboard() {
    return this.sdk.keyboard;
  }
  /**
   * The keyboard handler.
   *
   * @internal
   * @param {KeyboardHandler} value - The keyboard handler.
   */
  set keyboard(t) {
    this.sdk.keyboard = t;
  }
  /**
   * The double click zoom handler.
   *
   * @internal
   * @returns {DoubleClickZoomHandler}
   */
  get doubleClickZoom() {
    return this.sdk.doubleClickZoom;
  }
  /**
   * The double click zoom handler.
   *
   * @internal
   * @param {DoubleClickZoomHandler} value - The double click zoom handler.
   */
  set doubleClickZoom(t) {
    this.sdk.doubleClickZoom = t;
  }
  /**
   * The touch zoom rotate handler.
   *
   * @internal
   * @returns {TwoFingersTouchZoomRotateHandler}
   */
  get touchZoomRotate() {
    return this.sdk.touchZoomRotate;
  }
  /**
   * The touch zoom rotate handler.
   *
   * @internal
   * @param {TwoFingersTouchZoomRotateHandler} value - The touch zoom rotate handler.
   */
  set touchZoomRotate(t) {
    this.sdk.touchZoomRotate = t;
  }
  /**
   * The cooperative gestures handler.
   *
   * @internal
   * @returns {CooperativeGesturesHandler}
   */
  get cooperativeGestures() {
    return this.sdk.cooperativeGestures;
  }
  /**
   * The cooperative gestures handler.
   *
   * @internal
   * @param {CooperativeGesturesHandler} value - The cooperative gestures handler.
   */
  set cooperativeGestures(t) {
    this.sdk.cooperativeGestures = t;
  }
  //#endregion SDK Mappings
  //#region lngLatToPx
  /**
   * Converts a LngLat to a px coordinate, based on the image metadata.
   *
   * @internal
   * @param {LngLat} lngLat - The LngLat to convert.
   * @returns {[number, number]} The px coordinate.
   */
  lngLatToPx(t) {
    if (!this.paddedSizeMax) {
      const i = "[ImageViewer]: Unable to convert LngLat to px, padded size max not set";
      throw this.fire("error", new ue("error", this, null, { error: new Error(i) })), new Error(i);
    }
    const n = Zn.fromLngLat(t);
    return [n.x * this.paddedSizeMax, n.y * this.paddedSizeMax];
  }
  //#region pxToLngLat
  /**
   * Converts a px coordinate to a LngLat, based on the image metadata.
   *
   * @internal
   * @param {LngLat} lngLat - The LngLat to convert.
   * @returns {[number, number]} The px coordinate.
   */
  pxToLngLat(t) {
    if (!this.paddedSizeMax) {
      const i = "[ImageViewer]: Unable to convert px to LngLat, padded size max not set";
      throw this.fire("error", new ue("error", this, null, { error: new Error(i) })), new Error(i);
    }
    return new Zn(t[0] / this.paddedSizeMax, t[1] / this.paddedSizeMax).toLngLat();
  }
  //#region getSDKInternal
  /**
   * Get the internal SDK instance.
   *
   * @returns {Map} The internal SDK instance.
   * @internal
   */
  getSDKInternal() {
    return this.sdk;
  }
  /**
   * Get the canvas of the internal SDK instance.
   *
   * @returns {HTMLCanvasElement} The canvas of the internal SDK instance.
   */
  getCanvas() {
    return this.sdk.getCanvas();
  }
  //#region flyTo
  /**
   * Fly to a given center.
   *
   * @param {ImageViewerFlyToOptions} options - The options for the fly to.
   * @param {MapDataEvent} eventData - The event data.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  flyTo(t, n) {
    const i = this.pxToLngLat(t.center);
    return this.sdk.flyTo({ ...t, pitch: 0, center: i }, n), this;
  }
  //#region jumpTo
  /**
   * Jump to a given center.
   *
   * @param {ImageViewerJumpToOptions} options - The options for the jump to.
   * @param {MapDataEvent} eventData - The event data.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  jumpTo(t, n) {
    const i = this.pxToLngLat(t.center);
    return this.sdk.jumpTo({ ...t, pitch: 0, center: i }, n), this;
  }
  //#region setZoom
  /**
   * Set the zoom level.
   *
   * @param {number} zoom - The zoom level.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  setZoom(t) {
    return this.sdk.setZoom(t), this;
  }
  //#region getZoom
  /**
   * Get the zoom level.
   *
   * @returns {number} The zoom level.
   */
  getZoom() {
    return this.sdk.getZoom();
  }
  //#region getCenter
  /**
   * Get the center of the ImageViewer in pixels.
   *
   * @internal
   * @returns {[number, number]} The center of the ImageViewer.
   */
  getCenter() {
    const t = this.sdk.getCenter();
    return this.lngLatToPx(t);
  }
  //#region setCenter
  /**
   * Set the center of the ImageViewer in pixels.
   *
   * @param {number} center - The center of the ImageViewer.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  setCenter(t) {
    return this.sdk.setCenter(this.pxToLngLat(t)), this;
  }
  //#region setBearing
  /**
   * Set the bearing of the ImageViewer in degrees.
   *
   * @param {number} bearing - The bearing of the ImageViewer.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  setBearing(t) {
    return this.sdk.setBearing(t), this;
  }
  //#region getBearing
  /**
   * Get the bearing of the ImageViewer in degrees.
   *
   * @returns {number} The bearing of the ImageViewer.
   */
  getBearing() {
    return this.sdk.getBearing();
  }
  //#region panBy
  /**
   * Pan by a given delta in pixels.
   *
   * @param {PointLike} delta - The delta to pan by.
   * @param {ImageViewerEaseToOptions} options - The options for the pan.
   * @param {any} eventData - The event data.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  panBy(t, n, i) {
    return this.sdk.panBy(t, { ...n, pitch: 0 }, i), this;
  }
  //#region panTo
  /**
   * Pan to a given center in pixels.
   *
   * @param {number} center - The center to pan to.
   * @param {ImageViewerEaseToOptions} options - The options for the pan.
   * @param {any} eventData - The event data.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  panTo(t, n, i) {
    return this.sdk.panTo(this.pxToLngLat(t), { ...n, pitch: 0 }, i), this;
  }
  //#region getImageMetadata
  /**
   * Get the image metadata.
   *
   * @returns {ImageMetadata} The image metadata.
   */
  getImageMetadata() {
    return this.imageMetadata;
  }
  //#region getImageBounds
  /**
   * Get the visible bounds of the image in the viewport in imagePixels.
   * [topLeft, bottomRight]
   *
   * @returns {[[number, number], [number, number]]} The visible bounds of the image.
   */
  getImageBounds() {
    const n = this.sdk.getBounds().toArray().map((o) => this.lngLatToPx(Le.convert(o))), i = [n[0][0], n[1][1]], a = [n[1][0], n[0][1]];
    return [i, a];
  }
  //#region fitImageBounds
  /**
   * Set the bounds of the image.
   *
   * @param {[[number, number], [number, number]]} bounds - The bounds of the image.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  fitImageBounds([t, n]) {
    const i = this.pxToLngLat(t), a = this.pxToLngLat(n), o = sh.convert([i, a]);
    return this.sdk.fitBounds(o), this;
  }
  //#region remove
  /**
   * Destroys the ImageViewer, removes the map instance and all event listeners. Useful for cleanup.
   *
   * @returns {ImageViewer} The ImageViewer instance.
   */
  remove() {
    this.fire("beforeremove", new ue("beforeremove", this)), this.sdk.remove(), this._listeners && Object.entries(this._listeners).forEach(([t, n]) => {
      n.forEach((i) => {
        this.off(t, i);
      });
    }), this._oneTimeListeners && Object.entries(this._oneTimeListeners).forEach(([t, n]) => {
      n.forEach((i) => {
        this.off(t, i);
      });
    });
  }
  pointIsWithinImageBounds(t) {
    const n = this.getImageMetadata();
    if (!n)
      return !1;
    const i = [
      [0, 0],
      [n.width, n.height]
    ];
    return t[0] >= i[0][0] && t[0] <= i[1][0] && t[1] >= i[0][1] && t[1] <= i[1][1];
  }
}
function zd(r) {
  return `${Xs()}/${r}/image.json?key=${D.apiKey}`;
}
function Dd(r) {
  return `${Xs()}/${r}/{z}/{x}/{y}?key=${D.apiKey}`;
}
function Xs() {
  return "https://api.maptiler.com/images";
}
const { Evented: Nd } = C;
class Dh extends Nd {
  constructor({ ...t }) {
    super();
    y(this, "viewer");
    y(this, "marker");
    y(this, "position", [0, 0]);
    this.marker = new xn(t);
  }
  /**
   * Adds the ImageViewerMarker to an instance of ImageViewer.
   *
   * @param {ImageViewer} viewer - The instance of ImageViewer to add the ImageViewerMarker to.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  addTo(t) {
    if (!(t instanceof Fd))
      throw new Error("[ImageViewerMarker]: an ImageViewerMarker must be added to an instance of ImageViewer");
    this.viewer = t, Bd(this.marker, this, this.viewer[Ws]);
    const n = this.viewer.getSDKInternal();
    return this.setPosition(this.position), Md(this.marker), this.marker.addTo(n), this;
  }
  /**
   * Adds a class name to the ImageViewerMarker.
   *
   * @param {string} className - The class name to add to the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  addClassName(t) {
    return this.marker.addClassName(t), this;
  }
  /**
   * Gets the element of the ImageViewerMarker.
   *
   * @returns {HTMLElement} The element of the ImageViewerMarker.
   */
  getElement() {
    return this.marker.getElement();
  }
  /**
   * Gets the position of the ImageViewerMarker.
   *
   * @returns {PointLike} The position of the ImageViewerMarker.
   * @see  [PointLike](https://docs.maptiler.com/sdk-js/api/geography/#pointlike)
   *
   */
  getPosition() {
    return this.position;
  }
  /**
   * Gets the offset of the ImageViewerMarker.
   *
   * @returns {PointLike} The offset of the ImageViewerMarker.
   * @see  [PointLike](https://docs.maptiler.com/sdk-js/api/geography/#pointlike)
   */
  getOffset() {
    return this.marker.getOffset();
  }
  /**
   * Gets the pitch alignment of the ImageViewerMarker.
   *
   * @returns {Alignment} The pitch alignment of the ImageViewerMarker.
   * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
   */
  getPitchAlignment() {
    return this.marker.getPitchAlignment();
  }
  /**
   * Gets the popup of the ImageViewerMarker.
   *
   * @returns {Popup} The popup of the ImageViewerMarker.
   * @see [Popup](https://docs.maptiler.com/sdk-js/api/markers/#popup)
   */
  getPopup() {
    return this.marker.getPopup();
  }
  /**
   * Gets the rotation of the ImageViewerMarker.
   *
   * @returns {number} The rotation of the ImageViewerMarker.
   */
  getRotation() {
    return this.marker.getRotation();
  }
  /**
   * Gets the rotation alignment of the ImageViewerMarker.
   *
   * @returns {Alignment} The rotation alignment of the ImageViewerMarker.
   * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
   */
  getRotationAlignment() {
    return this.marker.getRotationAlignment();
  }
  /**
   * Checks if the ImageViewerMarker is draggable.
   *
   * @returns {boolean} True if the ImageViewerMarker is draggable, false otherwise.
   */
  isDraggable() {
    return this.marker.isDraggable();
  }
  /**
   * Fires an event on the ImageViewerMarker.
   *
   * @param {MarkerEventTypes | Event} event - The event to fire.
   * @param {Record<string, any>} data - The data to fire the event with.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  fire(t, n) {
    return super.fire(t, n), this;
  }
  /**
   * Removes an event listener from the ImageViewerMarker.
   *
   * @param {MarkerEventTypes} event - The event to remove the listener from.
   * @param {ImageViewerMarkerEvent} listener - The listener to remove.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  off(t, n) {
    return super.off(t, n), this;
  }
  /**
   * Adds an event listener to the ImageViewerMarker.
   *
   * @param {MarkerEventTypes} event - The event to add the listener to.
   * @param {ImageViewerMarkerEvent} listener - The listener to add.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  on(t, n) {
    return super.on(t, n);
  }
  /**
   * Checks if the ImageViewerMarker is within the image bounds.
   *
   * @returns {boolean} True if the ImageViewerMarker is within the image bounds, false otherwise.
   */
  isWithinImageBounds() {
    return this.viewer.pointIsWithinImageBounds(this.position);
  }
  /**
   * Removes the ImageViewerMarker from the ImageViewer and cleans up the event listeners.
   *
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  remove() {
    return this.marker.remove(), this.marker._listeners && Object.entries(this.marker._listeners).forEach(([t, n]) => {
      n.forEach((i) => {
        this.off(t, i);
      });
    }), this.marker._oneTimeListeners && Object.entries(this.marker._oneTimeListeners).forEach(([t, n]) => {
      n.forEach((i) => {
        this.off(t, i);
      });
    }), this;
  }
  /**
   * Removes a class name from the ImageViewerMarker dom element.
   *
   * @param {string} className - The class name to remove from the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  removeClassName(t) {
    return this.marker.removeClassName(t), this;
  }
  /**
   * Sets the draggable state of the ImageViewerMarker.
   *
   * @param {boolean} draggable - The draggable state of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setDraggable(t) {
    return this.marker.setDraggable(t), this;
  }
  /**
   * Sets the position of the ImageViewerMarker.
   *
   * @param {[number, number]} px - The position of the ImageViewerMarker in image pixels.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setPosition(t) {
    if (this.position[0] = t[0], this.position[1] = t[1], !this.viewer)
      return this;
    const n = this.viewer[Ys](t);
    return this.marker.setLngLat(n), this;
  }
  /**
   * Sets the offset of the ImageViewerMarker.
   *
   * @param {PointLike} offset - The offset of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setOffset(t) {
    return this.marker.setOffset(t), this;
  }
  /**
   * Sets the opacity of the ImageViewerMarker.
   *
   * @param {string} opacity - The opacity of the ImageViewerMarker.
   * @param {string} opacityWhenCovered - The opacity of the ImageViewerMarker when covered.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setOpacity(t, n) {
    return this.marker.setOpacity(t, n), this;
  }
  /**
   * Sets the pitch alignment of the ImageViewerMarker.
   *
   * @param {Alignment} pitchAlignment - The pitch alignment of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
   */
  setPitchAlignment(t) {
    return this.marker.setPitchAlignment(t), this;
  }
  /**
   * Sets the popup of the ImageViewerMarker.
   *
   * @param {Popup} popup - The popup of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   * @see [Popup](https://docs.maptiler.com/sdk-js/api/markers/#popup)
   */
  setPopup(t) {
    return this.marker.setPopup(t), this;
  }
  /**
   * Sets the rotation of the ImageViewerMarker.
   *
   * @param {number} rotation - The rotation of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setRotation(t) {
    return this.marker.setRotation(t), this;
  }
  /**
   * Sets the rotation alignment of the ImageViewerMarker.
   *
   * @param {Alignment} rotationAlignment - The rotation alignment of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
   */
  setRotationAlignment(t) {
    return this.marker.setRotationAlignment(t), this;
  }
  /**
   * Sets if subpixel positioning is enabled for the ImageViewerMarker.
   *
   * @param {boolean} subpixelPositioning - The subpixel positioning of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setSubpixelPositioning(t) {
    return this.marker.setSubpixelPositioning(t), this;
  }
  /**
   * Toggles a class name on the ImageViewerMarker dom element.
   *
   * @param {string} className - The class name to toggle on the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  toggleClassName(t) {
    return this.marker.toggleClassName(t), this;
  }
  /**
   * Toggles the popup of the ImageViewerMarker.
   *
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  togglePopup() {
    return this.marker.togglePopup(), this;
  }
}
const $d = ["dragstart", "drag", "dragend"], jd = ["lngLat", "_defaultPrevented", "target"];
class Ud {
  constructor(e, t, n) {
    y(this, "type");
    y(this, "target");
    this.type = e, this.target = t, Object.assign(this, n);
  }
}
function Bd(r, e, t) {
  $d.forEach((n) => {
    r.on(n, (i) => {
      var o, s;
      if ((o = i.target) == null ? void 0 : o.getLngLat()) {
        const l = t((s = i.target) == null ? void 0 : s.getLngLat());
        e.setPosition(l);
      }
      e.fire(
        n,
        new Ud(n, e, {
          ...Object.fromEntries(Object.entries(i).filter(([l]) => !jd.includes(l)))
        })
      );
    });
  });
}
function bi(r) {
  if (typeof DOMParser < "u") {
    const e = new DOMParser().parseFromString(r, "application/xml");
    if (e.querySelector("parsererror"))
      throw new Error("The provided string is not valid XML");
    return e;
  }
  throw new Error("No XML parser found");
}
function Js(r, e) {
  if (!r.hasChildNodes())
    return !1;
  for (const t of Array.from(r.childNodes)) {
    const n = t.nodeName;
    if (typeof n == "string" && n.trim().toLowerCase() === e.toLowerCase())
      return !0;
  }
  return !1;
}
function Da(r) {
  if (typeof XMLSerializer < "u")
    return new XMLSerializer().serializeToString(r);
  throw new Error("No XML serializer found");
}
function Vd(r) {
  const e = typeof r == "string" ? bi(r) : r;
  if (!Js(e, "gpx"))
    throw new Error("The XML document is not valid GPX");
  const t = X(e, "trk"), n = X(e, "rte"), i = X(e, "wpt"), a = {
    type: "FeatureCollection",
    features: []
  };
  for (const o of Array.from(t)) {
    const s = Zd(o);
    s && a.features.push(s);
  }
  for (const o of Array.from(n)) {
    const s = Wd(o);
    s && a.features.push(s);
  }
  for (const o of Array.from(i))
    a.features.push(Yd(o));
  return a;
}
function qd(r, e) {
  let t = r;
  if (typeof t == "string" && (t = bi(t)), !Js(t, "kml"))
    throw new Error("The XML document is not valid KML");
  const n = {
    type: "FeatureCollection",
    features: []
  }, i = {}, a = {}, o = {}, s = X(t, "Placemark"), l = X(t, "Style"), u = X(t, "StyleMap");
  for (const c of Array.from(l)) {
    const p = $a(e !== void 0 ? e(c) : Da(c)).toString(16);
    i[`#${Ge(c, "id")}`] = p, a[p] = c;
  }
  for (const c of Array.from(u)) {
    i[`#${Ge(c, "id")}`] = $a(e !== void 0 ? e(c) : Da(c)).toString(16);
    const p = X(c, "Pair"), f = {};
    for (const d of Array.from(p))
      f[z(M(d, "key")) ?? ""] = z(M(d, "styleUrl"));
    o[`#${Ge(c, "id")}`] = f;
  }
  for (const c of Array.from(s))
    n.features = n.features.concat(Kd(c, i, a, o));
  return n;
}
function Na(r) {
  if (r === null) return ["#000000", 1];
  let e = "", t = 1, n = r;
  return n.startsWith("#") && (n = n.substring(1)), (n.length === 6 || n.length === 3) && (e = n), n.length === 8 && (t = Number.parseInt(n.substring(0, 2), 16) / 255, e = `#${n.substring(6, 8)}${n.substring(4, 6)}${n.substring(2, 4)}`), [e ?? "#000000", t ?? 1];
}
function Gd(r) {
  return tl(r.split(" "));
}
function Hd(r) {
  let e = X(r, "coord");
  const t = [], n = [];
  e.length === 0 && (e = X(r, "gx:coord"));
  for (const a of Array.from(e))
    t.push(Gd(z(a) ?? ""));
  const i = X(r, "when");
  for (const a of Array.from(i)) n.push(z(a));
  return {
    coords: t,
    times: n
  };
}
function wr(r) {
  const e = ["Polygon", "LineString", "Point", "Track", "gx:Track"];
  let t, n, i, a, o;
  const s = [], l = [];
  if (M(r, "MultiGeometry") !== null)
    return wr(M(r, "MultiGeometry"));
  if (M(r, "MultiTrack") !== null)
    return wr(M(r, "MultiTrack"));
  if (M(r, "gx:MultiTrack") !== null)
    return wr(M(r, "gx:MultiTrack"));
  for (i = 0; i < e.length; i++)
    if (n = X(r, e[i]), n) {
      for (a = 0; a < n.length; a++)
        if (t = n[a], e[i] === "Point")
          s.push({
            type: "Point",
            coordinates: rl(z(M(t, "coordinates")) ?? "")
          });
        else if (e[i] === "LineString")
          s.push({
            type: "LineString",
            coordinates: Ua(z(M(t, "coordinates")) ?? "")
          });
        else if (e[i] === "Polygon") {
          const u = X(t, "LinearRing"), c = [];
          for (o = 0; o < u.length; o++)
            c.push(Ua(z(M(u[o], "coordinates")) ?? ""));
          s.push({
            type: "Polygon",
            coordinates: c
          });
        } else if (e[i] === "Track" || e[i] === "gx:Track") {
          const u = Hd(t);
          s.push({
            type: "LineString",
            coordinates: u.coords
          }), u.times.length && l.push(u.times);
        }
    }
  return { geoms: s, coordTimes: l };
}
function Kd(r, e, t, n) {
  const i = wr(r), a = {}, o = z(M(r, "name")), s = z(M(r, "address")), l = z(M(r, "description")), u = M(r, "TimeSpan"), c = M(r, "TimeStamp"), p = M(r, "ExtendedData"), f = M(r, "visibility");
  let d, h = z(M(r, "styleUrl")), m = M(r, "LineStyle"), g = M(r, "PolyStyle");
  if (!i.geoms.length) return [];
  if (o && (a.name = o), s && (a.address = s), h) {
    h.startsWith("#") || (h = `#${h}`), a.styleUrl = h, e[h] && (a.styleHash = e[h]), n[h] && (a.styleMapHash = n[h], a.styleHash = e[n[h].normal ?? ""]);
    const b = t[a.styleHash ?? ""];
    if (b) {
      m || (m = M(b, "LineStyle")), g || (g = M(b, "PolyStyle"));
      const x = M(b, "IconStyle");
      if (x) {
        const k = M(x, "Icon");
        if (k) {
          const L = z(M(k, "href"));
          L && (a.icon = L);
        }
      }
    }
  }
  if (l && (a.description = l), u) {
    const b = z(M(u, "begin")), x = z(M(u, "end"));
    b && x && (a.timespan = { begin: b, end: x });
  }
  if (c !== null && (a.timestamp = z(M(c, "when")) ?? (/* @__PURE__ */ new Date()).toISOString()), m !== null) {
    const b = Na(z(M(m, "color"))), x = b[0], k = b[1], L = Number.parseFloat(z(M(m, "width")) ?? "");
    x && (a.stroke = x), Number.isNaN(k) || (a["stroke-opacity"] = k), Number.isNaN(L) || (a["stroke-width"] = L);
  }
  if (g) {
    const b = Na(z(M(g, "color"))), x = b[0], k = b[1], L = z(M(g, "fill")), E = z(M(g, "outline"));
    x && (a.fill = x), Number.isNaN(k) || (a["fill-opacity"] = k), L && (a["fill-opacity"] = L === "1" ? a["fill-opacity"] || 1 : 0), E && (a["stroke-opacity"] = E === "1" ? a["stroke-opacity"] || 1 : 0);
  }
  if (p) {
    const b = X(p, "Data"), x = X(p, "SimpleData");
    for (d = 0; d < b.length; d++)
      a[b[d].getAttribute("name") ?? ""] = z(M(b[d], "value")) ?? "";
    for (d = 0; d < x.length; d++)
      a[x[d].getAttribute("name") ?? ""] = z(x[d]) ?? "";
  }
  f !== null && (a.visibility = z(f) ?? ""), i.coordTimes.length !== 0 && (a.coordTimes = i.coordTimes.length === 1 ? i.coordTimes[0] : i.coordTimes);
  const v = {
    type: "Feature",
    geometry: i.geoms.length === 1 ? i.geoms[0] : {
      type: "GeometryCollection",
      geometries: i.geoms
    },
    properties: a
  };
  return Ge(r, "id") && (v.id = Ge(r, "id") ?? void 0), [v];
}
function Qs(r, e) {
  const t = X(r, e), n = [], i = [];
  let a = [];
  const o = t.length;
  if (!(o < 2)) {
    for (let s = 0; s < o; s++) {
      const l = nl(t[s]);
      n.push(l.coordinates), l.time && i.push(l.time), (l.heartRate || a.length) && (a.length === 0 && (a = new Array(s).fill(null)), a.push(l.heartRate));
    }
    return {
      line: n,
      times: i,
      heartRates: a
    };
  }
}
function Zd(r) {
  const e = X(r, "trkseg"), t = [], n = [], i = [];
  let a;
  for (let s = 0; s < e.length; s++)
    if (a = Qs(e[s], "trkpt"), a !== void 0 && (a.line && t.push(a.line), a.times && a.times.length && n.push(a.times), i.length || a.heartRates && a.heartRates.length)) {
      if (!i.length)
        for (let l = 0; l < s; l++)
          i.push(new Array(t[l].length).fill(null));
      a.heartRates && a.heartRates.length ? i.push(a.heartRates) : i.push(new Array(a.line.length).fill(null));
    }
  if (t.length === 0) return;
  const o = {
    ...wi(r),
    ...el(M(r, "extensions"))
  };
  return n.length !== 0 && (o.coordTimes = t.length === 1 ? n[0] : n), i.length !== 0 && (o.heartRates = t.length === 1 ? i[0] : i), t.length === 1 ? {
    type: "Feature",
    properties: o,
    geometry: {
      type: "LineString",
      coordinates: t[0]
    }
  } : {
    type: "Feature",
    properties: o,
    geometry: {
      type: "MultiLineString",
      coordinates: t
    }
  };
}
function Wd(r) {
  const e = Qs(r, "rtept");
  return e === void 0 ? void 0 : {
    type: "Feature",
    properties: {
      ...wi(r),
      ...el(M(r, "extensions"))
    },
    geometry: {
      type: "LineString",
      coordinates: e.line
    }
  };
}
function Yd(r) {
  return {
    type: "Feature",
    properties: { ...wi(r), ...Bn(r, ["sym"]) },
    geometry: {
      type: "Point",
      coordinates: nl(r).coordinates
    }
  };
}
function el(r) {
  const e = {};
  if (r) {
    const t = M(r, "line");
    if (t) {
      const n = z(M(t, "color")), i = Number.parseFloat(z(M(t, "opacity")) ?? "0"), a = Number.parseFloat(z(M(t, "width")) ?? "0");
      n && (e.stroke = n), Number.isNaN(i) || (e["stroke-opacity"] = i), Number.isNaN(a) || (e["stroke-width"] = a * 96 / 25.4);
    }
  }
  return e;
}
function wi(r) {
  const e = Bn(r, ["name", "cmt", "desc", "type", "time", "keywords"]), t = X(r, "link");
  if (t.length !== 0) {
    e.links = [];
    for (const n of Array.from(t)) {
      const i = {
        href: Ge(n, "href"),
        ...Bn(n, ["text", "type"])
      };
      e.links.push(i);
    }
  }
  return e;
}
function $a(r) {
  let e = 0;
  if (!r || !r.length) return e;
  for (let t = 0; t < r.length; t++)
    e = (e << 5) - e + r.charCodeAt(t) | 0;
  return e;
}
function X(r, e) {
  return r.getElementsByTagName(e);
}
function Ge(r, e) {
  return r.getAttribute(e);
}
function ja(r, e) {
  return Number.parseFloat(Ge(r, e) ?? "0");
}
function M(r, e) {
  const t = X(r, e);
  return t.length ? t[0] : null;
}
function Xd(r) {
  return r.normalize && r.normalize(), r;
}
function tl(r) {
  return r.map(Number.parseFloat).map((e) => Number.isNaN(e) ? null : e);
}
function z(r) {
  return r && Xd(r), r && r.textContent;
}
function Bn(r, e) {
  const t = {};
  let n, i;
  for (i = 0; i < e.length; i++)
    n = M(r, e[i]), n && (t[e[i]] = z(n) ?? "");
  return t;
}
function rl(r) {
  return tl(r.replace(/\s*/g, "").split(","));
}
function Ua(r) {
  const e = r.replace(/^\s*|\s*$/g, "").split(/\s+/), t = [];
  for (const n of e) t.push(rl(n));
  return t;
}
function nl(r) {
  const e = [ja(r, "lon"), ja(r, "lat")], t = M(r, "ele"), n = M(r, "gpxtpx:hr") || M(r, "hr"), i = M(r, "time");
  let a;
  return t && (a = Number.parseFloat(z(t) ?? "0"), Number.isNaN(a) || e.push(a)), {
    coordinates: e,
    time: i ? z(i) : null,
    heartRate: n !== null ? Number.parseFloat(z(n) ?? "0") : null
  };
}
function Jd(r) {
  let e = r;
  try {
    typeof e == "string" && (e = bi(e));
  } catch {
    return null;
  }
  try {
    return Vd(e);
  } catch {
  }
  try {
    return qd(e);
  } catch {
  }
  return null;
}
async function Qd(r, e = {}) {
  const t = e.download ?? !1, n = await eh(r);
  if (t) {
    const i = e.filename ?? "maptiler_screenshot.png", a = document.createElement("a");
    a.style.display = "none", document.body.appendChild(a), a.href = URL.createObjectURL(n), a.download = i, a.click(), setTimeout(() => {
      document.body.removeChild(a), URL.revokeObjectURL(a.href);
    }, 0);
  }
  return n;
}
function eh(r) {
  return new Promise((e, t) => {
    r.redraw(), r.once("idle", () => {
      r.getCanvas().toBlob((n) => {
        if (!n) {
          t(Error("Screenshot could not be created."));
          return;
        }
        e(n);
      }, "image/png");
    });
  });
}
const Vn = [
  // https://colorhunt.co/palette/1d5b79468b97ef6262f3aa60
  ["#1D5B79", "#468B97", "#EF6262", "#F3AA60"],
  // https://colorhunt.co/palette/614bc333bbc585e6c5c8ffe0
  ["#614BC3", "#33BBC5", "#85E6C5", "#C8FFE0"],
  // https://colorhunt.co/palette/4619597a316fcd6688aed8cc
  ["#461959", "#7A316F", "#CD6688", "#AED8CC"],
  // https://colorhunt.co/palette/0079ff00dfa2f6fa70ff0060
  ["#0079FF", "#00DFA2", "#F6FA70", "#FF0060"],
  //https://colorhunt.co/palette/39b5e0a31acbff78f0f5ea5a
  ["#39B5E0", "#A31ACB", "#FF78F0", "#F5EA5A"],
  // https://colorhunt.co/palette/37e2d5590696c70a80fbcb0a
  ["#37E2D5", "#590696", "#C70A80", "#FBCB0A"],
  // https://colorhunt.co/palette/ffd36efff56d99ffcd9fb4ff
  ["#FFD36E", "#FFF56D", "#99FFCD", "#9FB4FF"],
  // https://colorhunt.co/palette/00ead3fff5b7ff449f005f99
  ["#00EAD3", "#FFF5B7", "#FF449F", "#005F99"],
  // https://colorhunt.co/palette/10a19d540375ff7000ffbf00
  ["#10A19D", "#540375", "#FF7000", "#FFBF00"]
];
function Hr() {
  return Vn[~~(Math.random() * Vn.length)][~~(Math.random() * 4)];
}
function Wt() {
  return `maptiler_source_${xo()}`;
}
function Yt() {
  return `maptiler_layer_${xo()}`;
}
function qn(r, e) {
  if (e <= r[0].zoom)
    return r[0].value;
  if (e >= r[r.length - 1].zoom)
    return r[r.length - 1].value;
  for (let t = 0; t < r.length - 1; t += 1)
    if (e >= r[t].zoom && e < r[t + 1].zoom) {
      const n = r[t + 1].zoom - r[t].zoom, i = (e - r[t].zoom) / n;
      return i * r[t + 1].value + (1 - i) * r[t].value;
    }
  return 0;
}
function ze(r) {
  return ["interpolate", ["linear"], ["zoom"], ...r.flatMap((e) => [e.zoom, e.value])];
}
function F(r) {
  return ["interpolate", ["linear"], ["zoom"], ...r.flatMap((e) => [e.zoom, e.value])];
}
function il(r, e) {
  if (typeof e == "number" && typeof r == "number")
    return 2 * e + r;
  if (typeof e == "number" && Array.isArray(r))
    return ["interpolate", ["linear"], ["zoom"], ...r.flatMap((t) => [t.zoom, 2 * e + t.value])];
  if (typeof r == "number" && Array.isArray(e))
    return ["interpolate", ["linear"], ["zoom"], ...e.flatMap((t) => [t.zoom, 2 * t.value + r])];
  if (Array.isArray(r) && Array.isArray(e)) {
    const t = Array.from(/* @__PURE__ */ new Set([...r.map((n) => n.zoom), ...e.map((n) => n.zoom)])).sort((n, i) => n < i ? -1 : 1);
    return ["interpolate", ["linear"], ["zoom"], ...t.flatMap((n) => [n, 2 * qn(e, n) + qn(r, n)])];
  }
  return 0;
}
function al(r, e) {
  return ["interpolate", ["linear"], ["get", e], ...r.flatMap((t) => [t.propertyValue, t.value])];
}
function Si(r) {
  const e = r.trimStart(), t = `${e}${" ".repeat(r.length - e.length)}`, n = Array.from(t);
  if (!n.every((s) => s === " " || s === "_"))
    throw new Error("A dash pattern must be composed only of whitespace and underscore characters.");
  if (!(n.some((s) => s === "_") && n.some((s) => s === " ")))
    throw new Error("A dash pattern must contain at least one underscore and one whitespace character");
  const o = [1];
  for (let s = 1; s < n.length; s += 1) {
    const l = n[s - 1], u = n[s];
    l === u ? o[o.length - 1] += 1 : o.push(1);
  }
  return o;
}
function Gn(r, e) {
  return ["interpolate", ["linear"], ["get", e], ...r.flatMap((t) => [t.value, t.color])];
}
function Hn(r, e, t = !0) {
  return t ? [
    "interpolate",
    ["linear"],
    ["zoom"],
    0,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.value, n.pointRadius * 0.025])],
    2,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.value, n.pointRadius * 0.05])],
    4,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.value, n.pointRadius * 0.1])],
    8,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.value, n.pointRadius * 0.25])],
    16,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.value, n.pointRadius])]
  ] : ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.value, n.pointRadius])];
}
function ol(r, e, t = !0) {
  return t ? [
    "interpolate",
    ["linear"],
    ["zoom"],
    0,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.propertyValue, n.value * 0.025])],
    2,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.propertyValue, n.value * 0.05])],
    4,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.propertyValue, n.value * 0.1])],
    8,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.propertyValue, n.value * 0.25])],
    16,
    ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.propertyValue, n.value])]
  ] : ["interpolate", ["linear"], ["get", e], ...r.flatMap((n) => [n.propertyValue, n.value])];
}
function Kn(r, e) {
  return r.every((t) => t.color[3] === r[0].color[3]) ? r[0].color[3] ? r[0].color[3] / 255 : 1 : [
    "interpolate",
    ["linear"],
    ["get", e],
    ...r.getRawColorStops().flatMap((t) => {
      const n = t.value, i = t.color;
      return [n, i.length === 4 ? i[3] / 255 : 1];
    })
  ];
}
function sl(r, e = 10) {
  return [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    ...Array.from({ length: e + 1 }, (t, n) => {
      const i = n / e;
      return [i, r.getColorHex(i)];
    }).flat()
  ];
}
function ur(r) {
  const e = r.toString(16);
  return e.length === 1 ? `0${e}` : e;
}
function th(r) {
  return `#${ur(r[0])}${ur(r[1])}${ur(r[2])}${r.length === 4 ? ur(r[3]) : ""}`;
}
class T extends Array {
  constructor(t = {}) {
    super();
    y(this, "min", 0);
    y(this, "max", 1);
    "min" in t && (this.min = t.min), "max" in t && (this.max = t.max), "stops" in t && this.setStops(t.stops, { clone: !1 });
  }
  /**
   * Converts a array-definition color ramp definition into a usable ColorRamp instance.
   * Note: units are not converted and may need to to be converted beforehand (eg. kelvin to centigrade)
   * @param cr
   * @returns
   */
  static fromArrayDefinition(t) {
    return new T({
      stops: t.map((n) => ({
        value: n[0],
        color: n[1]
      }))
    });
  }
  setStops(t, n = { clone: !0 }) {
    const i = n.clone ? this.clone() : this;
    i.length = 0;
    let a = Number.POSITIVE_INFINITY, o = Number.NEGATIVE_INFINITY;
    for (let s = 0; s < t.length; s += 1)
      a = Math.min(a, t[s].value), o = Math.max(o, t[s].value), i.push({
        value: t[s].value,
        color: t[s].color.slice()
        // we want to make sure we do a deep copy and not a reference
      });
    return i.sort((s, l) => s.value < l.value ? -1 : 1), this.min = a, this.max = o, i;
  }
  scale(t, n, i = { clone: !0 }) {
    const a = i.clone, o = this[0].value, l = this.at(-1).value - o, u = n - t, c = [];
    for (let p = 0; p < this.length; p += 1) {
      const h = (this[p].value - o) / l * u + t;
      a ? c.push({
        value: h,
        color: this[p].color.slice()
      }) : this[p].value = h;
    }
    return a ? new T({ stops: c }) : this;
  }
  // for some reason, I had to reimplement this
  at(t) {
    return t < 0 ? this[this.length + t] : this[t];
  }
  clone() {
    return new T({ stops: this.getRawColorStops() });
  }
  getRawColorStops() {
    const t = [];
    for (let n = 0; n < this.length; n += 1)
      t.push({ value: this[n].value, color: this[n].color });
    return t;
  }
  reverse(t = { clone: !0 }) {
    const n = t.clone ? this.clone() : this;
    for (let i = 0; i < ~~(n.length / 2); i += 1) {
      const a = n[i].color;
      n[i].color = n.at(-(i + 1)).color, n.at(-(i + 1)).color = a;
    }
    return n;
  }
  getBounds() {
    return { min: this.min, max: this.max };
  }
  getColor(t, n = { smooth: !0 }) {
    if (t <= this[0].value)
      return this[0].color;
    if (t >= this.at(-1).value)
      return this.at(-1).color;
    for (let i = 0; i < this.length - 1; i += 1) {
      if (t > this[i + 1].value)
        continue;
      const a = this[i].color;
      if (!n.smooth)
        return a.slice();
      const o = this[i].value, s = this[i + 1].value, l = this[i + 1].color, u = (s - t) / (s - o);
      return a.map((c, p) => Math.round(c * u + l[p] * (1 - u)));
    }
    return [0, 0, 0];
  }
  /**
   * Get the color as an hexadecimal string
   */
  getColorHex(t, n = {
    smooth: !0,
    withAlpha: !1
  }) {
    return th(this.getColor(t, n));
  }
  /**
   * Get the color of the color ramp at a relative position in [0, 1]
   */
  getColorRelative(t, n = { smooth: !0 }) {
    const i = this.getBounds();
    return this.getColor(i.min + t * (i.max - i.min), n);
  }
  getCanvasStrip(t = {
    horizontal: !0,
    size: 512,
    smooth: !0
  }) {
    const n = document.createElement("canvas");
    n.width = t.horizontal ? t.size : 1, n.height = t.horizontal ? 1 : t.size;
    const i = n.getContext("2d");
    if (!i) throw new Error("Canvs context is missing");
    const a = i.getImageData(0, 0, n.width, n.height), o = a.data, s = t.size, l = this[0].value, p = (this.at(-1).value - l) / s;
    for (let f = 0; f < s; f += 1) {
      const d = this.getColor(l + f * p, {
        smooth: t.smooth
      });
      o[f * 4] = d[0], o[f * 4 + 1] = d[1], o[f * 4 + 2] = d[2], o[f * 4 + 3] = d.length > 3 ? d[3] : 255;
    }
    return i.putImageData(a, 0, 0), n;
  }
  /**
   * Apply a non-linear ressampling. This will create a new instance of ColorRamp with the same bounds.
   */
  resample(t, n = 15) {
    const i = this.getBounds(), a = this.scale(0, 1), o = 1 / (n - 1);
    let s;
    if (t === "ease-in-square")
      s = Array.from({ length: n }, (c, p) => {
        const f = p * o, d = f ** 2, h = a.getColor(d);
        return { value: f, color: h };
      });
    else if (t === "ease-out-square")
      s = Array.from({ length: n }, (c, p) => {
        const f = p * o, d = 1 - (1 - f) ** 2, h = a.getColor(d);
        return { value: f, color: h };
      });
    else if (t === "ease-out-sqrt")
      s = Array.from({ length: n }, (c, p) => {
        const f = p * o, d = f ** 0.5, h = a.getColor(d);
        return { value: f, color: h };
      });
    else if (t === "ease-in-sqrt")
      s = Array.from({ length: n }, (c, p) => {
        const f = p * o, d = 1 - (1 - f) ** 0.5, h = a.getColor(d);
        return { value: f, color: h };
      });
    else if (t === "ease-out-exp")
      s = Array.from({ length: n }, (c, p) => {
        const f = p * o, d = 1 - 2 ** (-10 * f), h = a.getColor(d);
        return { value: f, color: h };
      });
    else if (t === "ease-in-exp")
      s = Array.from({ length: n }, (c, p) => {
        const f = p * o, d = 2 ** (10 * f - 10), h = a.getColor(d);
        return { value: f, color: h };
      });
    else
      throw new Error("Invalid ressampling method.");
    return new T({ stops: s }).scale(i.min, i.max);
  }
  /**
   * Makes a clone of this color ramp that is fully transparant at the begining of their range
   */
  transparentStart() {
    const t = this.getRawColorStops();
    t.unshift({
      value: t[0].value,
      color: t[0].color.slice()
    }), t[1].value += 1e-3;
    for (const n of t)
      n.color.length === 3 && n.color.push(255);
    return t[0].color[3] = 0, new T({ stops: t });
  }
  /**
   * Check if this color ramp has a transparent start
   */
  hasTransparentStart() {
    return this[0].color.length === 4 && this[0].color[3] === 0;
  }
}
const ll = {
  /**
   * A fully transparent [0, 0, 0, 0] colorramp to hide data.
   * Defined in interval [0, 1], without unit.
   */
  NULL: new T({
    stops: [
      { value: 0, color: [0, 0, 0, 0] },
      { value: 1, color: [0, 0, 0, 0] }
    ]
  }),
  GRAY: new T({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 1, color: [255, 255, 255] }
    ]
  }),
  /**
   * Classic jet color ramp.
   * Defined in interval [0, 1], without unit.
   */
  JET: new T({
    stops: [
      { value: 0, color: [0, 0, 131] },
      { value: 0.125, color: [0, 60, 170] },
      { value: 0.375, color: [5, 255, 255] },
      { value: 0.625, color: [255, 255, 0] },
      { value: 0.875, color: [250, 0, 0] },
      { value: 1, color: [128, 0, 0] }
    ]
  }),
  /**
   * Classic HSV color ramp (hue, saturation, value).
   * Defined in interval [0, 1], without unit.
   */
  HSV: new T({
    stops: [
      { value: 0, color: [255, 0, 0] },
      { value: 0.169, color: [253, 255, 2] },
      { value: 0.173, color: [247, 255, 2] },
      { value: 0.337, color: [0, 252, 4] },
      { value: 0.341, color: [0, 252, 10] },
      { value: 0.506, color: [1, 249, 255] },
      { value: 0.671, color: [2, 0, 253] },
      { value: 0.675, color: [8, 0, 253] },
      { value: 0.839, color: [255, 0, 251] },
      { value: 0.843, color: [255, 0, 245] },
      { value: 1, color: [255, 0, 6] }
    ]
  }),
  /**
   * Classic hot color ramp.
   * Defined in interval [0, 1], without unit.
   */
  HOT: new T({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.3, color: [230, 0, 0] },
      { value: 0.6, color: [255, 210, 0] },
      { value: 1, color: [255, 255, 255] }
    ]
  }),
  /**
   * Classic spring color ramp.
   * Defined in interval [0, 1], without unit.
   */
  SPRING: new T({
    stops: [
      { value: 0, color: [255, 0, 255] },
      { value: 1, color: [255, 255, 0] }
    ]
  }),
  /**
   * Classic summer color ramp.
   * Defined in interval [0, 1], without unit.
   */
  SUMMER: new T({
    stops: [
      { value: 0, color: [0, 128, 102] },
      { value: 1, color: [255, 255, 102] }
    ]
  }),
  /**
   * Classic autommn color ramp.
   * Defined in interval [0, 1], without unit.
   */
  AUTOMN: new T({
    stops: [
      { value: 0, color: [255, 0, 0] },
      { value: 1, color: [255, 255, 0] }
    ]
  }),
  /**
   * Classic winter color ramp.
   * Defined in interval [0, 1], without unit.
   */
  WINTER: new T({
    stops: [
      { value: 0, color: [0, 0, 255] },
      { value: 1, color: [0, 255, 128] }
    ]
  }),
  /**
   * Classic bone color ramp.
   * Defined in interval [0, 1], without unit.
   */
  BONE: new T({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.376, color: [84, 84, 116] },
      { value: 0.753, color: [169, 200, 200] },
      { value: 1, color: [255, 255, 255] }
    ]
  }),
  /**
   * Classic copper color ramp.
   * Defined in interval [0, 1], without unit.
   */
  COPPER: new T({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.804, color: [255, 160, 102] },
      { value: 1, color: [255, 199, 127] }
    ]
  }),
  /**
   * Classic greys color ramp.
   * Defined in interval [0, 1], without unit.
   */
  GREYS: new T({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 1, color: [255, 255, 255] }
    ]
  }),
  /**
   * Classic yignbu color ramp (blue to light yellow).
   * Defined in interval [0, 1], without unit.
   */
  YIGNBU: new T({
    stops: [
      { value: 0, color: [8, 29, 88] },
      { value: 0.125, color: [37, 52, 148] },
      { value: 0.25, color: [34, 94, 168] },
      { value: 0.375, color: [29, 145, 192] },
      { value: 0.5, color: [65, 182, 196] },
      { value: 0.625, color: [127, 205, 187] },
      { value: 0.75, color: [199, 233, 180] },
      { value: 0.875, color: [237, 248, 217] },
      { value: 1, color: [255, 255, 217] }
    ]
  }),
  /**
   * Classic greens color ramp.
   * Defined in interval [0, 1], without unit.
   */
  GREENS: new T({
    stops: [
      { value: 0, color: [0, 68, 27] },
      { value: 0.125, color: [0, 109, 44] },
      { value: 0.25, color: [35, 139, 69] },
      { value: 0.375, color: [65, 171, 93] },
      { value: 0.5, color: [116, 196, 118] },
      { value: 0.625, color: [161, 217, 155] },
      { value: 0.75, color: [199, 233, 192] },
      { value: 0.875, color: [229, 245, 224] },
      { value: 1, color: [247, 252, 245] }
    ]
  }),
  /**
   * Classic yiorrd color ramp (red to light yellow).
   * Defined in interval [0, 1], without unit.
   */
  YIORRD: new T({
    stops: [
      { value: 0, color: [128, 0, 38] },
      { value: 0.125, color: [189, 0, 38] },
      { value: 0.25, color: [227, 26, 28] },
      { value: 0.375, color: [252, 78, 42] },
      { value: 0.5, color: [253, 141, 60] },
      { value: 0.625, color: [254, 178, 76] },
      { value: 0.75, color: [254, 217, 118] },
      { value: 0.875, color: [255, 237, 160] },
      { value: 1, color: [255, 255, 204] }
    ]
  }),
  /**
   * Classic blue-red color ramp.
   * Defined in interval [0, 1], without unit.
   */
  BLUERED: new T({
    stops: [
      { value: 0, color: [0, 0, 255] },
      { value: 1, color: [255, 0, 0] }
    ]
  }),
  /**
   * Classic rdbu color ramp.
   * Defined in interval [0, 1], without unit.
   */
  RDBU: new T({
    stops: [
      { value: 0, color: [5, 10, 172] },
      { value: 0.35, color: [106, 137, 247] },
      { value: 0.5, color: [190, 190, 190] },
      { value: 0.6, color: [220, 170, 132] },
      { value: 0.7, color: [230, 145, 90] },
      { value: 1, color: [178, 10, 28] }
    ]
  }),
  /**
   * Classic picnic color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PICNIC: new T({
    stops: [
      { value: 0, color: [0, 0, 255] },
      { value: 0.1, color: [51, 153, 255] },
      { value: 0.2, color: [102, 204, 255] },
      { value: 0.3, color: [153, 204, 255] },
      { value: 0.4, color: [204, 204, 255] },
      { value: 0.5, color: [255, 255, 255] },
      { value: 0.6, color: [255, 204, 255] },
      { value: 0.7, color: [255, 153, 255] },
      { value: 0.8, color: [255, 102, 204] },
      { value: 0.9, color: [255, 102, 102] },
      { value: 1, color: [255, 0, 0] }
    ]
  }),
  /**
   * Classic rainbow color ramp.
   * Defined in interval [0, 1], without unit.
   */
  RAINBOW: new T({
    stops: [
      { value: 0, color: [150, 0, 90] },
      { value: 0.125, color: [0, 0, 200] },
      { value: 0.25, color: [0, 25, 255] },
      { value: 0.375, color: [0, 152, 255] },
      { value: 0.5, color: [44, 255, 150] },
      { value: 0.625, color: [151, 255, 0] },
      { value: 0.75, color: [255, 234, 0] },
      { value: 0.875, color: [255, 111, 0] },
      { value: 1, color: [255, 0, 0] }
    ]
  }),
  /**
   * Classic Portland color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PORTLAND: new T({
    stops: [
      { value: 0, color: [12, 51, 131] },
      { value: 0.25, color: [10, 136, 186] },
      { value: 0.5, color: [242, 211, 56] },
      { value: 0.75, color: [242, 143, 56] },
      { value: 1, color: [217, 30, 30] }
    ]
  }),
  /**
   * Classic blackbody color ramp.
   * Defined in interval [0, 1], without unit.
   */
  BLACKBODY: new T({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.2, color: [230, 0, 0] },
      { value: 0.4, color: [230, 210, 0] },
      { value: 0.7, color: [255, 255, 255] },
      { value: 1, color: [160, 200, 255] }
    ]
  }),
  /**
   * Classic earth color ramp.
   * Defined in interval [0, 1], without unit.
   */
  EARTH: new T({
    stops: [
      { value: 0, color: [0, 0, 130] },
      { value: 0.1, color: [0, 180, 180] },
      { value: 0.2, color: [40, 210, 40] },
      { value: 0.4, color: [230, 230, 50] },
      { value: 0.6, color: [120, 70, 20] },
      { value: 1, color: [255, 255, 255] }
    ]
  }),
  /**
   * Classic electric color ramp.
   * Defined in interval [0, 1], without unit.
   */
  ELECTRIC: new T({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.15, color: [30, 0, 100] },
      { value: 0.4, color: [120, 0, 100] },
      { value: 0.6, color: [160, 90, 0] },
      { value: 0.8, color: [230, 200, 0] },
      { value: 1, color: [255, 250, 220] }
    ]
  }),
  /**
   * Classic viridis color ramp.
   * Defined in interval [0, 1], without unit.
   */
  VIRIDIS: new T({
    stops: [
      { value: 0, color: [68, 1, 84] },
      { value: 0.13, color: [71, 44, 122] },
      { value: 0.25, color: [59, 81, 139] },
      { value: 0.38, color: [44, 113, 142] },
      { value: 0.5, color: [33, 144, 141] },
      { value: 0.63, color: [39, 173, 129] },
      { value: 0.75, color: [92, 200, 99] },
      { value: 0.88, color: [170, 220, 50] },
      { value: 1, color: [253, 231, 37] }
    ]
  }),
  /**
   * Classic inferno color ramp.
   * Defined in interval [0, 1], without unit.
   */
  INFERNO: new T({
    stops: [
      { value: 0, color: [0, 0, 4] },
      { value: 0.13, color: [31, 12, 72] },
      { value: 0.25, color: [85, 15, 109] },
      { value: 0.38, color: [136, 34, 106] },
      { value: 0.5, color: [186, 54, 85] },
      { value: 0.63, color: [227, 89, 51] },
      { value: 0.75, color: [249, 140, 10] },
      { value: 0.88, color: [249, 201, 50] },
      { value: 1, color: [252, 255, 164] }
    ]
  }),
  /**
   * Classic magma color ramp.
   * Defined in interval [0, 1], without unit.
   */
  MAGMA: new T({
    stops: [
      { value: 0, color: [0, 0, 4] },
      { value: 0.13, color: [28, 16, 68] },
      { value: 0.25, color: [79, 18, 123] },
      { value: 0.38, color: [129, 37, 129] },
      { value: 0.5, color: [181, 54, 122] },
      { value: 0.63, color: [229, 80, 100] },
      { value: 0.75, color: [251, 135, 97] },
      { value: 0.88, color: [254, 194, 135] },
      { value: 1, color: [252, 253, 191] }
    ]
  }),
  /**
   * Classic plasma color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PLASMA: new T({
    stops: [
      { value: 0, color: [13, 8, 135] },
      { value: 0.13, color: [75, 3, 161] },
      { value: 0.25, color: [125, 3, 168] },
      { value: 0.38, color: [168, 34, 150] },
      { value: 0.5, color: [203, 70, 121] },
      { value: 0.63, color: [229, 107, 93] },
      { value: 0.75, color: [248, 148, 65] },
      { value: 0.88, color: [253, 195, 40] },
      { value: 1, color: [240, 249, 33] }
    ]
  }),
  /**
   * Classic warm color ramp.
   * Defined in interval [0, 1], without unit.
   */
  WARM: new T({
    stops: [
      { value: 0, color: [125, 0, 179] },
      { value: 0.13, color: [172, 0, 187] },
      { value: 0.25, color: [219, 0, 170] },
      { value: 0.38, color: [255, 0, 130] },
      { value: 0.5, color: [255, 63, 74] },
      { value: 0.63, color: [255, 123, 0] },
      { value: 0.75, color: [234, 176, 0] },
      { value: 0.88, color: [190, 228, 0] },
      { value: 1, color: [147, 255, 0] }
    ]
  }),
  /**
   * Classic cool color ramp.
   * Defined in interval [0, 1], without unit.
   */
  COOL: new T({
    stops: [
      { value: 0, color: [125, 0, 179] },
      { value: 0.13, color: [116, 0, 218] },
      { value: 0.25, color: [98, 74, 237] },
      { value: 0.38, color: [68, 146, 231] },
      { value: 0.5, color: [0, 204, 197] },
      { value: 0.63, color: [0, 247, 146] },
      { value: 0.75, color: [0, 255, 88] },
      { value: 0.88, color: [40, 255, 8] },
      { value: 1, color: [147, 255, 0] }
    ]
  }),
  /**
   * Classic rainboz soft color ramp.
   * Defined in interval [0, 1], without unit.
   */
  RAINBOW_SOFT: new T({
    stops: [
      { value: 0, color: [125, 0, 179] },
      { value: 0.1, color: [199, 0, 180] },
      { value: 0.2, color: [255, 0, 121] },
      { value: 0.3, color: [255, 108, 0] },
      { value: 0.4, color: [222, 194, 0] },
      { value: 0.5, color: [150, 255, 0] },
      { value: 0.6, color: [0, 255, 55] },
      { value: 0.7, color: [0, 246, 150] },
      { value: 0.8, color: [50, 167, 222] },
      { value: 0.9, color: [103, 51, 235] },
      { value: 1, color: [124, 0, 186] }
    ]
  }),
  /**
   * Classic bathymetry color ramp.
   * Defined in interval [0, 1], without unit.
   */
  BATHYMETRY: new T({
    stops: [
      { value: 0, color: [40, 26, 44] },
      { value: 0.13, color: [59, 49, 90] },
      { value: 0.25, color: [64, 76, 139] },
      { value: 0.38, color: [63, 110, 151] },
      { value: 0.5, color: [72, 142, 158] },
      { value: 0.63, color: [85, 174, 163] },
      { value: 0.75, color: [120, 206, 163] },
      { value: 0.88, color: [187, 230, 172] },
      { value: 1, color: [253, 254, 204] }
    ]
  }),
  /**
   * Classic cdom color ramp.
   * Defined in interval [0, 1], without unit.
   */
  CDOM: new T({
    stops: [
      { value: 0, color: [47, 15, 62] },
      { value: 0.13, color: [87, 23, 86] },
      { value: 0.25, color: [130, 28, 99] },
      { value: 0.38, color: [171, 41, 96] },
      { value: 0.5, color: [206, 67, 86] },
      { value: 0.63, color: [230, 106, 84] },
      { value: 0.75, color: [242, 149, 103] },
      { value: 0.88, color: [249, 193, 135] },
      { value: 1, color: [254, 237, 176] }
    ]
  }),
  /**
   * Classic chlorophyll color ramp.
   * Defined in interval [0, 1], without unit.
   */
  CHLOROPHYLL: new T({
    stops: [
      { value: 0, color: [18, 36, 20] },
      { value: 0.13, color: [25, 63, 41] },
      { value: 0.25, color: [24, 91, 59] },
      { value: 0.38, color: [13, 119, 72] },
      { value: 0.5, color: [18, 148, 80] },
      { value: 0.63, color: [80, 173, 89] },
      { value: 0.75, color: [132, 196, 122] },
      { value: 0.88, color: [175, 221, 162] },
      { value: 1, color: [215, 249, 208] }
    ]
  }),
  /**
   * Classic density color ramp.
   * Defined in interval [0, 1], without unit.
   */
  DENSITY: new T({
    stops: [
      { value: 0, color: [54, 14, 36] },
      { value: 0.13, color: [89, 23, 80] },
      { value: 0.25, color: [110, 45, 132] },
      { value: 0.38, color: [120, 77, 178] },
      { value: 0.5, color: [120, 113, 213] },
      { value: 0.63, color: [115, 151, 228] },
      { value: 0.75, color: [134, 185, 227] },
      { value: 0.88, color: [177, 214, 227] },
      { value: 1, color: [230, 241, 241] }
    ]
  }),
  /**
   * Classic freesurface blue color ramp.
   * Defined in interval [0, 1], without unit.
   */
  FREESURFACE_BLUE: new T({
    stops: [
      { value: 0, color: [30, 4, 110] },
      { value: 0.13, color: [47, 14, 176] },
      { value: 0.25, color: [41, 45, 236] },
      { value: 0.38, color: [25, 99, 212] },
      { value: 0.5, color: [68, 131, 200] },
      { value: 0.63, color: [114, 156, 197] },
      { value: 0.75, color: [157, 181, 203] },
      { value: 0.88, color: [200, 208, 216] },
      { value: 1, color: [241, 237, 236] }
    ]
  }),
  /**
   * Classic freesurface red color ramp.
   * Defined in interval [0, 1], without unit.
   */
  FREESURFACE_RED: new T({
    stops: [
      { value: 0, color: [60, 9, 18] },
      { value: 0.13, color: [100, 17, 27] },
      { value: 0.25, color: [142, 20, 29] },
      { value: 0.38, color: [177, 43, 27] },
      { value: 0.5, color: [192, 87, 63] },
      { value: 0.63, color: [205, 125, 105] },
      { value: 0.75, color: [216, 162, 148] },
      { value: 0.88, color: [227, 199, 193] },
      { value: 1, color: [241, 237, 236] }
    ]
  }),
  /**
   * Classic oxygen color ramp.
   * Defined in interval [0, 1], without unit.
   */
  OXYGEN: new T({
    stops: [
      { value: 0, color: [64, 5, 5] },
      { value: 0.13, color: [106, 6, 15] },
      { value: 0.25, color: [144, 26, 7] },
      { value: 0.38, color: [168, 64, 3] },
      { value: 0.5, color: [188, 100, 4] },
      { value: 0.63, color: [206, 136, 11] },
      { value: 0.75, color: [220, 174, 25] },
      { value: 0.88, color: [231, 215, 44] },
      { value: 1, color: [248, 254, 105] }
    ]
  }),
  /**
   * Classic par color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PAR: new T({
    stops: [
      { value: 0, color: [51, 20, 24] },
      { value: 0.13, color: [90, 32, 35] },
      { value: 0.25, color: [129, 44, 34] },
      { value: 0.38, color: [159, 68, 25] },
      { value: 0.5, color: [182, 99, 19] },
      { value: 0.63, color: [199, 134, 22] },
      { value: 0.75, color: [212, 171, 35] },
      { value: 0.88, color: [221, 210, 54] },
      { value: 1, color: [225, 253, 75] }
    ]
  }),
  /**
   * Classic phase color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PHASE: new T({
    stops: [
      { value: 0, color: [145, 105, 18] },
      { value: 0.13, color: [184, 71, 38] },
      { value: 0.25, color: [186, 58, 115] },
      { value: 0.38, color: [160, 71, 185] },
      { value: 0.5, color: [110, 97, 218] },
      { value: 0.63, color: [50, 123, 164] },
      { value: 0.75, color: [31, 131, 110] },
      { value: 0.88, color: [77, 129, 34] },
      { value: 1, color: [145, 105, 18] }
    ]
  }),
  /**
   * Classic salinity color ramp.
   * Defined in interval [0, 1], without unit.
   */
  SALINITY: new T({
    stops: [
      { value: 0, color: [42, 24, 108] },
      { value: 0.13, color: [33, 50, 162] },
      { value: 0.25, color: [15, 90, 145] },
      { value: 0.38, color: [40, 118, 137] },
      { value: 0.5, color: [59, 146, 135] },
      { value: 0.63, color: [79, 175, 126] },
      { value: 0.75, color: [120, 203, 104] },
      { value: 0.88, color: [193, 221, 100] },
      { value: 1, color: [253, 239, 154] }
    ]
  }),
  /**
   * Classic temperature color ramp.
   * Defined in interval [0, 1], without unit.
   */
  TEMPERATURE: new T({
    stops: [
      { value: 0, color: [4, 35, 51] },
      { value: 0.13, color: [23, 51, 122] },
      { value: 0.25, color: [85, 59, 157] },
      { value: 0.38, color: [129, 79, 143] },
      { value: 0.5, color: [175, 95, 130] },
      { value: 0.63, color: [222, 112, 101] },
      { value: 0.75, color: [249, 146, 66] },
      { value: 0.88, color: [249, 196, 65] },
      { value: 1, color: [232, 250, 91] }
    ]
  }),
  /**
   * Classic turbidity color ramp.
   * Defined in interval [0, 1], without unit.
   */
  TURBIDITY: new T({
    stops: [
      { value: 0, color: [34, 31, 27] },
      { value: 0.13, color: [65, 50, 41] },
      { value: 0.25, color: [98, 69, 52] },
      { value: 0.38, color: [131, 89, 57] },
      { value: 0.5, color: [161, 112, 59] },
      { value: 0.63, color: [185, 140, 66] },
      { value: 0.75, color: [202, 174, 88] },
      { value: 0.88, color: [216, 209, 126] },
      { value: 1, color: [233, 246, 171] }
    ]
  }),
  /**
   * Classic velocity blue color ramp.
   * Defined in interval [0, 1], without unit.
   */
  VELOCITY_BLUE: new T({
    stops: [
      { value: 0, color: [17, 32, 64] },
      { value: 0.13, color: [35, 52, 116] },
      { value: 0.25, color: [29, 81, 156] },
      { value: 0.38, color: [31, 113, 162] },
      { value: 0.5, color: [50, 144, 169] },
      { value: 0.63, color: [87, 173, 176] },
      { value: 0.75, color: [149, 196, 189] },
      { value: 0.88, color: [203, 221, 211] },
      { value: 1, color: [254, 251, 230] }
    ]
  }),
  /**
   * Classic velocity green color ramp.
   * Defined in interval [0, 1], without unit.
   */
  VELOCITY_GREEN: new T({
    stops: [
      { value: 0, color: [23, 35, 19] },
      { value: 0.13, color: [24, 64, 38] },
      { value: 0.25, color: [11, 95, 45] },
      { value: 0.38, color: [39, 123, 35] },
      { value: 0.5, color: [95, 146, 12] },
      { value: 0.63, color: [152, 165, 18] },
      { value: 0.75, color: [201, 186, 69] },
      { value: 0.88, color: [233, 216, 137] },
      { value: 1, color: [255, 253, 205] }
    ]
  }),
  /**
   * Classic cube helix color ramp.
   * Defined in interval [0, 1], without unit.
   */
  CUBEHELIX: new T({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.07, color: [22, 5, 59] },
      { value: 0.13, color: [60, 4, 105] },
      { value: 0.2, color: [109, 1, 135] },
      { value: 0.27, color: [161, 0, 147] },
      { value: 0.33, color: [210, 2, 142] },
      { value: 0.4, color: [251, 11, 123] },
      { value: 0.47, color: [255, 29, 97] },
      { value: 0.53, color: [255, 54, 69] },
      { value: 0.6, color: [255, 85, 46] },
      { value: 0.67, color: [255, 120, 34] },
      { value: 0.73, color: [255, 157, 37] },
      { value: 0.8, color: [241, 191, 57] },
      { value: 0.87, color: [224, 220, 93] },
      { value: 0.93, color: [218, 241, 142] },
      { value: 1, color: [227, 253, 198] }
    ]
  }),
  /**
   * The cividis color ramp is color blind friendly.
   * Read more here https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0199239
   * Defined in interval [0, 1], without unit.
   */
  CIVIDIS: new T({
    stops: [
      { value: 0, color: [0, 32, 77, 255] },
      { value: 0.125, color: [5, 54, 110, 255] },
      { value: 0.25, color: [65, 77, 108, 255] },
      { value: 0.375, color: [97, 100, 111, 255] },
      { value: 0.5, color: [125, 124, 121, 255] },
      { value: 0.625, color: [156, 149, 120, 255] },
      { value: 0.75, color: [190, 175, 111, 255] },
      { value: 0.875, color: [225, 204, 94, 255] },
      { value: 1, color: [255, 235, 70, 255] }
    ]
  }),
  /**
   * Classic turbo color ramp.
   * This is a luminance-constant alternative to the jet, making it more
   * clor-blind friendly.
   * Defined in interval [0, 1], without unit.
   */
  TURBO: new T({
    stops: [
      { value: 0, color: [48, 18, 59, 255] },
      { value: 0.125, color: [70, 107, 227, 255] },
      { value: 0.25, color: [40, 187, 236, 255] },
      { value: 0.375, color: [49, 242, 153, 255] },
      { value: 0.5, color: [162, 252, 60, 255] },
      { value: 0.625, color: [237, 208, 58, 255] },
      { value: 0.75, color: [251, 128, 34, 255] },
      { value: 0.875, color: [210, 49, 5, 255] },
      { value: 1, color: [122, 4, 3, 255] }
    ]
  }),
  /**
   * The rocket color ramp is perceptually uniform, which makes it more
   * color bliend friendly than the classic magma color ramp.
   * Defined in interval [0, 1], without unit.
   */
  ROCKET: new T({
    stops: [
      { value: 0, color: [250, 235, 221, 0] },
      { value: 0.133, color: [250, 235, 221, 255] },
      { value: 0.266, color: [246, 170, 130, 255] },
      { value: 0.4, color: [240, 96, 67, 255] },
      { value: 0.533, color: [203, 27, 79, 255] },
      { value: 0.666, color: [132, 30, 90, 255] },
      { value: 0.8, color: [63, 27, 68, 255] },
      { value: 1, color: [3, 5, 26, 255] }
    ]
  }),
  /**
   * The mako color ramp is perceptually uniform and can be seen as
   * a color blind friendly alternative to bathymetry or yignbu.
   * Defined in interval [0, 1], without unit.
   */
  MAKO: new T({
    stops: [
      { value: 0, color: [11, 4, 5, 255] },
      { value: 0.125, color: [43, 28, 53, 255] },
      { value: 0.25, color: [62, 53, 107, 255] },
      { value: 0.375, color: [59, 86, 152, 255] },
      { value: 0.5, color: [53, 123, 162, 255] },
      { value: 0.625, color: [53, 158, 170, 255] },
      { value: 0.75, color: [73, 193, 173, 255] },
      { value: 0.875, color: [150, 221, 181, 255] },
      { value: 1, color: [222, 245, 229, 255] }
    ]
  })
};
async function rh(r, e, t = {}) {
  if (!e.sourceId && !e.data)
    throw new Error("Creating a polyline layer requires an existing .sourceId or a valid .data property");
  let n = e.data;
  if (typeof n == "string") {
    if (Rr(n))
      n = `https://api.maptiler.com/data/${n}/features.json?key=${D.apiKey}`;
    else {
      if (/^(?:\w+:|\.|\/)/.test(n)) {
        const i = await fetch(n, t);
        if (!i.ok) throw new Error(`Failed to fetch polyline data: fetching URL ${n} failed with status ${String(i.status)}.`);
        n = await i.text();
      }
      n = Ec(n) ?? Jd(n) ?? "";
    }
    if (!n)
      throw new Error("Failed to parse polyline data: expected GeoJSON, GPX, or KML.");
  }
  return nh(r, {
    ...e,
    data: n
  });
}
function nh(r, e) {
  if (e.layerId && r.getLayer(e.layerId))
    throw new Error(`A layer already exists with the layer id: ${e.layerId}`);
  const t = e.sourceId ?? Wt(), n = e.layerId ?? Yt(), i = {
    polylineLayerId: n,
    polylineOutlineLayerId: "",
    polylineSourceId: t
  };
  e.data && !r.getSource(t) && r.addSource(t, {
    type: "geojson",
    data: e.data
  });
  const a = e.lineWidth ?? 3, o = e.lineColor ?? Hr(), s = e.lineOpacity ?? 1, l = e.lineBlur ?? 0, u = e.lineGapWidth ?? 0;
  let c = e.lineDashArray ?? null;
  const p = e.outlineWidth ?? 1, f = e.outlineColor ?? "#FFFFFF", d = e.outlineOpacity ?? 1, h = e.outlineBlur ?? 0;
  if (typeof c == "string" && (c = Si(c)), e.outline === !0) {
    const m = `${n}_outline`;
    i.polylineOutlineLayerId = m, r.addLayer(
      {
        id: m,
        type: "line",
        source: t,
        layout: {
          "line-join": e.lineJoin ?? "round",
          "line-cap": e.lineCap ?? "round"
        },
        minzoom: e.minzoom ?? 0,
        maxzoom: e.maxzoom ?? 23,
        paint: {
          "line-opacity": typeof d == "number" ? d : F(d),
          "line-color": typeof f == "string" ? f : ze(f),
          "line-width": il(a, p),
          "line-blur": typeof h == "number" ? h : F(h)
        }
      },
      e.beforeId
    );
  }
  return r.addLayer(
    {
      id: n,
      type: "line",
      source: t,
      layout: {
        "line-join": e.lineJoin ?? "round",
        "line-cap": e.lineCap ?? "round"
      },
      minzoom: e.minzoom ?? 0,
      maxzoom: e.maxzoom ?? 23,
      paint: {
        "line-opacity": typeof s == "number" ? s : F(s),
        "line-color": typeof o == "string" ? o : ze(o),
        "line-width": typeof a == "number" ? a : F(a),
        "line-blur": typeof l == "number" ? l : F(l),
        "line-gap-width": typeof u == "number" ? u : F(u),
        // For some reasons passing "line-dasharray" with the value "undefined"
        // results in no showing the line while it should have the same behavior
        // of not adding the property "line-dasharray" as all.
        // As a workaround, we are inlining the addition of the prop with a conditional
        // which is less readable.
        ...c && { "line-dasharray": c }
      }
    },
    e.beforeId
  ), i;
}
function ih(r, e) {
  if (e.layerId && r.getLayer(e.layerId))
    throw new Error(`A layer already exists with the layer id: ${e.layerId}`);
  const t = e.sourceId ?? Wt(), n = e.layerId ?? Yt(), i = {
    polygonLayerId: n,
    polygonOutlineLayerId: e.outline ? `${n}_outline` : "",
    polygonSourceId: t
  };
  if (e.data && !r.getSource(t)) {
    let m = e.data;
    typeof m == "string" && Rr(m) && (m = `https://api.maptiler.com/data/${m}/features.json?key=${D.apiKey}`), r.addSource(t, {
      type: "geojson",
      data: m
    });
  }
  let a = e.outlineDashArray ?? null;
  const o = e.outlineWidth ?? 1, s = e.outlineColor ?? "#FFFFFF", l = e.outlineOpacity ?? 1, u = e.outlineBlur ?? 0, c = e.fillColor ?? Hr(), p = e.fillOpacity ?? 1, f = e.outlinePosition ?? "center", d = e.pattern ?? null;
  typeof a == "string" && (a = Si(a));
  const h = (m = null) => {
    if (r.addLayer(
      {
        id: n,
        type: "fill",
        source: t,
        minzoom: e.minzoom ?? 0,
        maxzoom: e.maxzoom ?? 23,
        paint: {
          "fill-color": typeof c == "string" ? c : ze(c),
          "fill-opacity": typeof p == "number" ? p : F(p),
          // Adding a pattern if provided
          ...m && { "fill-pattern": m }
        }
      },
      e.beforeId
    ), e.outline === !0) {
      let g;
      f === "inside" ? typeof o == "number" ? g = 0.5 * o : g = F(
        o.map(({ zoom: v, value: b }) => ({
          zoom: v,
          value: 0.5 * b
        }))
      ) : f === "outside" ? typeof o == "number" ? g = -0.5 * o : g = F(
        o.map((v) => ({
          zoom: v.zoom,
          value: -0.5 * v.value
        }))
      ) : g = 0, r.addLayer(
        {
          id: i.polygonOutlineLayerId,
          type: "line",
          source: t,
          layout: {
            "line-join": e.outlineJoin ?? "round",
            "line-cap": e.outlineCap ?? "butt"
          },
          minzoom: e.minzoom ?? 0,
          maxzoom: e.maxzoom ?? 23,
          paint: {
            "line-opacity": typeof l == "number" ? l : F(l),
            "line-color": typeof s == "string" ? s : ze(s),
            "line-width": typeof o == "number" ? o : F(o),
            "line-blur": typeof u == "number" ? u : F(u),
            "line-offset": g,
            // For some reasons passing "line-dasharray" with the value "undefined"
            // results in no showing the line while it should have the same behavior
            // of not adding the property "line-dasharray" as all.
            // As a workaround, we are inlining the addition of the prop with a conditional
            // which is less readable.
            ...a && {
              "line-dasharray": a
            }
          }
        },
        e.beforeId
      );
    }
  };
  return d ? r.hasImage(d) ? h(d) : r.loadImage(d).then((m) => {
    r.addImage(d, m.data), h(d);
  }).catch((m) => {
    console.error("Could not load the pattern image.", m.message), h();
  }) : h(), i;
}
function ah(r, e) {
  if (e.layerId && r.getLayer(e.layerId))
    throw new Error(`A layer already exists with the layer id: ${e.layerId}`);
  const t = e.minPointRadius ?? 10, n = e.maxPointRadius ?? 50, i = e.cluster ?? !1, a = 20, o = Array.isArray(e.pointColor) ? e.pointColor : ll.TURBO.scale(10, e.cluster ? 1e4 : 1e3).resample("ease-out-square"), s = o.getBounds(), l = e.sourceId ?? Wt(), u = e.layerId ?? Yt(), c = e.showLabel ?? i, p = e.alignOnViewport ?? !0, f = e.outline ?? !1, d = e.outlineOpacity ?? 1, h = e.outlineWidth ?? 1, m = e.outlineColor ?? "#FFFFFF";
  let g;
  const v = e.zoomCompensation ?? !0, b = e.minzoom ?? 0, x = e.maxzoom ?? 23;
  typeof e.pointOpacity == "number" ? g = e.pointOpacity : Array.isArray(e.pointOpacity) ? g = F(e.pointOpacity) : e.cluster ? g = Kn(o, "point_count") : e.property ? g = Kn(o, e.property) : g = F([
    { zoom: b, value: 0 },
    { zoom: b + 0.25, value: 1 },
    { zoom: x - 0.25, value: 1 },
    { zoom: x, value: 0 }
  ]);
  const k = {
    pointLayerId: u,
    clusterLayerId: "",
    labelLayerId: "",
    pointSourceId: l
  };
  if (e.data && !r.getSource(l)) {
    let L = e.data;
    typeof L == "string" && Rr(L) && (L = `https://api.maptiler.com/data/${L}/features.json?key=${D.apiKey}`), r.addSource(l, {
      type: "geojson",
      data: L,
      cluster: i
    });
  }
  if (i) {
    k.clusterLayerId = `${u}_cluster`;
    const L = Array.from({ length: a }, (E, N) => {
      const fe = s.min + N * (s.max - s.min) / (a - 1);
      return {
        value: fe,
        pointRadius: t + (n - t) * (N / (a - 1)) ** 0.5,
        color: o.getColorHex(fe)
      };
    });
    r.addLayer(
      {
        id: k.clusterLayerId,
        type: "circle",
        source: l,
        filter: ["has", "point_count"],
        paint: {
          // 'circle-color': options.pointColor ?? colorDrivenByProperty(clusterStyle, "point_count"),
          "circle-color": typeof e.pointColor == "string" ? e.pointColor : Gn(L, "point_count"),
          "circle-radius": typeof e.pointRadius == "number" ? e.pointRadius : Array.isArray(e.pointRadius) ? F(e.pointRadius) : Hn(L, "point_count", !1),
          "circle-pitch-alignment": p ? "viewport" : "map",
          "circle-pitch-scale": "map",
          // scale with camera distance regardless of viewport/biewport alignement
          "circle-opacity": g,
          ...f && {
            "circle-stroke-opacity": typeof d == "number" ? d : F(d),
            "circle-stroke-width": typeof h == "number" ? h : F(h),
            "circle-stroke-color": typeof m == "string" ? m : ze(m)
          }
        },
        minzoom: b,
        maxzoom: x
      },
      e.beforeId
    ), r.addLayer(
      {
        id: k.pointLayerId,
        type: "circle",
        source: l,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-pitch-alignment": p ? "viewport" : "map",
          "circle-pitch-scale": "map",
          // scale with camera distance regardless of viewport/biewport alignement
          // 'circle-color':  options.pointColor ?? clusterStyle[0].color,
          "circle-color": typeof e.pointColor == "string" ? e.pointColor : o.getColorHex(o.getBounds().min),
          "circle-radius": typeof e.pointRadius == "number" ? e.pointRadius : Array.isArray(e.pointRadius) ? F(e.pointRadius) : L[0].pointRadius * 0.75,
          "circle-opacity": g,
          ...f && {
            "circle-stroke-opacity": typeof d == "number" ? d : F(d),
            "circle-stroke-width": typeof h == "number" ? h : F(h),
            "circle-stroke-color": typeof m == "string" ? m : ze(m)
          }
        },
        minzoom: b,
        maxzoom: x
      },
      e.beforeId
    );
  } else {
    let L = typeof e.pointColor == "string" ? e.pointColor : Array.isArray(e.pointColor) ? e.pointColor.getColorHex(e.pointColor.getBounds().min) : Hr(), E = typeof e.pointRadius == "number" ? v ? F([
      { zoom: 0, value: e.pointRadius * 0.025 },
      { zoom: 2, value: e.pointRadius * 0.05 },
      { zoom: 4, value: e.pointRadius * 0.1 },
      { zoom: 8, value: e.pointRadius * 0.25 },
      { zoom: 16, value: e.pointRadius * 1 }
    ]) : e.pointRadius : Array.isArray(e.pointRadius) ? F(e.pointRadius) : v ? F([
      { zoom: 0, value: t * 0.05 },
      { zoom: 2, value: t * 0.1 },
      { zoom: 4, value: t * 0.2 },
      { zoom: 8, value: t * 0.5 },
      { zoom: 16, value: t * 1 }
    ]) : t;
    if (e.property && Array.isArray(e.pointColor)) {
      const N = Array.from({ length: a }, (fe, Ke) => {
        const Ze = s.min + Ke * (s.max - s.min) / (a - 1);
        return {
          value: Ze,
          pointRadius: typeof e.pointRadius == "number" ? e.pointRadius : t + (n - t) * (Ke / (a - 1)) ** 0.5,
          color: typeof e.pointColor == "string" ? e.pointColor : o.getColorHex(Ze)
        };
      });
      L = Gn(N, e.property), E = Hn(N, e.property, v);
    }
    r.addLayer(
      {
        id: k.pointLayerId,
        type: "circle",
        source: l,
        layout: {
          // Contrary to labels, we want to see the small one in front. Weirdly "circle-sort-key" works in the opposite direction as "symbol-sort-key".
          "circle-sort-key": e.property ? ["/", 1, ["get", e.property]] : 0
        },
        paint: {
          "circle-pitch-alignment": p ? "viewport" : "map",
          "circle-pitch-scale": "map",
          // scale with camera distance regardless of viewport/biewport alignement
          "circle-color": L,
          "circle-opacity": g,
          "circle-radius": E,
          ...f && {
            "circle-stroke-opacity": typeof d == "number" ? d : F(d),
            "circle-stroke-width": typeof h == "number" ? h : F(h),
            "circle-stroke-color": typeof m == "string" ? m : ze(m)
          }
        },
        minzoom: b,
        maxzoom: x
      },
      e.beforeId
    );
  }
  if (c !== !1 && (e.cluster || e.property)) {
    k.labelLayerId = `${u}_label`;
    const L = e.labelColor ?? "#fff", E = e.labelSize ?? 12;
    r.addLayer(
      {
        id: k.labelLayerId,
        type: "symbol",
        source: l,
        filter: ["has", e.cluster ? "point_count" : e.property],
        layout: {
          "text-field": e.cluster ? "{point_count_abbreviated}" : `{${e.property}}`,
          "text-font": ["Noto Sans Regular"],
          "text-size": E,
          "text-pitch-alignment": p ? "viewport" : "map",
          "symbol-sort-key": ["/", 1, ["get", e.cluster ? "point_count" : e.property]]
          // so that the largest value goes on top
        },
        paint: {
          "text-color": L,
          "text-opacity": g
        },
        minzoom: b,
        maxzoom: x
      },
      e.beforeId
    );
  }
  return k;
}
function oh(r, e) {
  if (e.layerId && r.getLayer(e.layerId))
    throw new Error(`A layer already exists with the layer id: ${e.layerId}`);
  const t = e.sourceId ?? Wt(), n = e.layerId ?? Yt(), i = e.minzoom ?? 0, a = e.maxzoom ?? 23, o = e.zoomCompensation ?? !0, s = e.opacity ?? [
    { zoom: i, value: 0 },
    { zoom: i + 0.25, value: 1 },
    { zoom: a - 0.25, value: 1 },
    { zoom: a, value: 0 }
  ];
  let l = Array.isArray(e.colorRamp) ? e.colorRamp : ll.TURBO.transparentStart();
  const u = l.getBounds();
  (u.min !== 0 || u.max !== 1) && (l = l.scale(0, 1)), l.hasTransparentStart() || (l = l.transparentStart());
  const c = e.intensity ?? [
    { zoom: 0, value: 0.01 },
    { zoom: 4, value: 0.2 },
    { zoom: 16, value: 1 }
  ], p = e.property ?? null, f = e.weight ?? 1;
  let d = 1;
  p ? typeof f == "number" ? (d = f, typeof e.weight == "number" && console.warn("The option `.property` is ignored when `.propertyValueWeights` is not of type `PropertyValueWeights`")) : Array.isArray(f) ? d = al(f, p) : console.warn("The option `.property` is ignored when `.propertyValueWeights` is not of type `PropertyValueWeights`") : typeof f == "number" ? d = f : Array.isArray(f) && console.warn("The options `.propertyValueWeights` can only be used when `.property` is provided.");
  const h = [
    { zoom: 0, value: 50 * 0.025 },
    { zoom: 2, value: 50 * 0.05 },
    { zoom: 4, value: 50 * 0.1 },
    { zoom: 8, value: 50 * 0.25 },
    { zoom: 16, value: 50 }
  ], m = e.radius ?? (o ? h : 10);
  let g = 1;
  typeof m == "number" ? g = m : Array.isArray(m) && "zoom" in m[0] ? g = F(m) : p && Array.isArray(m) && "propertyValue" in m[0] ? g = ol(m, p, o) : !p && Array.isArray(m) && "propertyValue" in m[0] ? (g = F(h), console.warn("The option `.radius` can only be property-driven if the option `.property` is provided.")) : g = F(h);
  const v = {
    heatmapLayerId: n,
    heatmapSourceId: t
  };
  if (e.data && !r.getSource(t)) {
    let b = e.data;
    typeof b == "string" && Rr(b) && (b = `https://api.maptiler.com/data/${b}/features.json?key=${D.apiKey}`), r.addSource(t, {
      type: "geojson",
      data: b
    });
  }
  return r.addLayer(
    {
      id: n,
      type: "heatmap",
      source: t,
      minzoom: i,
      maxzoom: a,
      paint: {
        "heatmap-weight": d,
        "heatmap-intensity": typeof c == "number" ? c : F(c),
        "heatmap-color": sl(l),
        "heatmap-radius": g,
        "heatmap-opacity": typeof s == "number" ? s : F(s)
      }
    },
    e.beforeId
  ), v;
}
const Nh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addHeatmap: oh,
  addPoint: ah,
  addPolygon: ih,
  addPolyline: rh,
  colorDrivenByProperty: Gn,
  colorPalettes: Vn,
  computeRampedOutlineWidth: il,
  dashArrayMaker: Si,
  generateRandomLayerName: Yt,
  generateRandomSourceName: Wt,
  getRandomColor: Hr,
  heatmapIntensityFromColorRamp: sl,
  lerpZoomNumberValues: qn,
  opacityDrivenByProperty: Kn,
  paintColorOptionsToPaintSpec: ze,
  radiusDrivenByProperty: Hn,
  radiusDrivenByPropertyHeatmap: ol,
  rampedOptionsToLayerPaintSpec: F,
  rampedPropertyValueWeight: al,
  takeScreenshot: Qd
}, Symbol.toStringTag, { value: "Module" })), Ba = "animated-route-layer";
class $h {
  constructor({
    keyframes: e,
    source: t,
    duration: n,
    iterations: i,
    easing: a,
    delay: o,
    cameraAnimation: s = {},
    pathStrokeAnimation: l = {
      activeColor: [255, 0, 0, 1],
      inactiveColor: [0, 0, 255, 1]
    },
    autoplay: u,
    manualUpdate: c = !1
  }) {
    /** Unique ID for the layer */
    y(this, "id", `${Ba}-${Bt()}`);
    y(this, "type", "custom");
    /** The MaptilerAnimation instance that handles the animation */
    y(this, "animationInstance", null);
    /**
     * Keyframes for the animation
     * If keyframes are provided, they will be used for the animation
     * If a source is provided, the keyframes will be parsed from the GeoJSON feature
     */
    y(this, "keyframes", null);
    /**
     * Source data for the animation
     * If a source is provided, it will be used to get the keyframes
     * If keyframes are provided, this will be ignored
     */
    y(this, "source", null);
    /** The duration of the animation in ms */
    y(this, "duration");
    /** The number of interations */
    y(this, "iterations");
    /** The delay before the animation starts in ms */
    y(this, "delay");
    /** The default easing function for the animation */
    y(this, "easing");
    /** The map instance */
    y(this, "map");
    /** The camera animation options */
    y(this, "cameraMaptilerAnimationOptions");
    /**
     * The path stroke animation options
     * This controls the color of the path during the animation
     */
    y(this, "pathStrokeAnimation");
    /** Whether the animation will autoplay */
    y(this, "autoplay", !1);
    /** Whether the animation will be managed manually */
    y(this, "manualUpdate", !1);
    y(this, "enquedEventHandlers", Sn.reduce((e, t) => (e[t] = [], e), {}));
    y(this, "enquedCommands", []);
    this.keyframes = e ?? null, this.source = t ?? null, n && (this.duration = n), i && (this.iterations = i), o && (this.delay = o), this.easing = a, this.cameraMaptilerAnimationOptions = s ? {
      pathSmoothing: {
        resolution: 20,
        epsilon: 5
      },
      follow: !0,
      ...s && s
    } : !1, l && (this.pathStrokeAnimation = l), this.autoplay = u ?? !1, this.manualUpdate = c, this.update = this.update.bind(this);
  }
  /**
   * This method is called when the layer is added to the map.
   * It initializes the animation instance and sets up event listeners.
   *
   * @param {MapLibreMap} map - The map instance (maplibre Map, but will be MapSDK at runtime)
   * @param {WebGLRenderingContext | WebGL2RenderingContext} _gl - The WebGL context (unused in this layer)
   */
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async onAdd(e) {
    if (this.map = e, this.map.getLayersOrder().some((n) => n.includes(Ba) && this.id !== n))
      throw new Error("[AnimatedRouteLayer.onAdd]: Currently, you can only have one active AnimatedRouteLayer at a time. Please remove the existing one before adding a new one.");
    const t = await this.getMaptilerAnimationOptions();
    this.animationInstance = new qt({
      ...t,
      manualMode: this.manualUpdate
    }), this.animationInstance.addEventListener("timeupdate", this.update), Object.entries(this.enquedEventHandlers).forEach(([n, i]) => {
      const a = n;
      i.forEach((o) => {
        var s;
        (s = this.animationInstance) == null || s.addEventListener(a, o);
      }), this.enquedEventHandlers[a] = [];
    }), this.enquedCommands.forEach((n) => {
      n();
    }), this.enquedCommands = [], this.autoplay && this.animationInstance.play();
  }
  /**
   * Initializes the animation instance asynchronously.
   * This is called from onAdd but runs asynchronously to handle async data loading.
   */
  /**
   * This method is used to manually advance the animation
   *
   * @returns {AnimatedRouteLayer} - The current instance of AnimatedRouteLayer
   */
  frameAdvance() {
    return this.animationInstance && this.manualUpdate && this.animationInstance.update(!0), this;
  }
  /**
   * Adds an event listener to the animation instance.
   *
   * @param {AnimationEventTypes} type - The type of event to listen for
   * @param {FrameCallback} callback - The callback function to execute when the event occurs
   */
  addEventListener(e, t) {
    return this.animationInstance ? (this.animationInstance.addEventListener(e, t), this) : (this.enquedEventHandlers[e].push(t), this);
  }
  /**
   * Removes an event listener from the animation instance.
   *
   * @param {AnimationEventTypes} type - The type of event to remove
   * @param {FrameCallback} callback - The callback function to remove
   */
  removeEventListener(e, t) {
    return this.animationInstance ? (this.animationInstance.removeEventListener(e, t), this) : this;
  }
  updateManual() {
    this.animationInstance && this.manualUpdate && this.animationInstance.update(!0);
  }
  /**
   * Updates the layer's properties based on the animation event.
   * @private
   * @param {AnimationEvent} event - The animation event
   */
  update(e) {
    const { props: t, currentDelta: n } = e;
    if (this.source && this.pathStrokeAnimation) {
      const { activeColor: i, inactiveColor: a } = this.pathStrokeAnimation;
      n >= 1 ? this.map.setPaintProperty(this.source.layerID, "line-gradient", ["interpolate", ["linear"], ["line-progress"], 0, ["rgba", ...i], 1, ["rgba", ...i]]) : this.map.setPaintProperty(this.source.layerID, "line-gradient", [
        "interpolate",
        ["linear"],
        ["line-progress"],
        // Progress along the line
        0,
        ["rgba", ...i],
        // color at the start
        1e-4 + n,
        ["rgba", ...i],
        // color at the start
        11e-5 + n,
        ["rgba", ...a],
        // color at the transition
        1,
        ["rgba", ...a]
        // color at the end
      ]);
    }
    if (t && this.cameraMaptilerAnimationOptions && this.cameraMaptilerAnimationOptions.follow) {
      const { lng: i, lat: a, bearing: o, zoom: s, pitch: l, elevation: u } = t;
      this.map.jumpTo({
        center: [i, a],
        pitch: l ?? this.map.getPitch(),
        zoom: s ?? this.map.getZoom(),
        bearing: o ?? this.map.getBearing(),
        elevation: u ?? this.map.getCenterElevation()
      });
    }
  }
  /**
   * Plays the animation.
   *
   * @returns {AnimatedRouteLayer} - The current instance of AnimatedRouteLayer
   */
  play() {
    return this.animationInstance ? (this.animationInstance.play(), this) : (this.enquedCommands.push(() => {
      var e;
      (e = this.animationInstance) == null || e.play();
    }), this);
  }
  /**
   * Stops the animation.
   *
   * @returns {AnimatedRouteLayer} - The current instance of AnimatedRouteLayer
   */
  pause() {
    return this.animationInstance ? (this.animationInstance.pause(), this) : (this.enquedCommands.push(() => {
      var e;
      (e = this.animationInstance) == null || e.pause();
    }), this);
  }
  /**
   * Gets the source GeoJSON data from the map instance, parses it, and returns the animation options.
   *
   * @returns {Promise<MaptilerAnimationOptions>} - The MaptilerAnimation constructor options
   */
  async getMaptilerAnimationOptions() {
    const e = this.map;
    if (this.source) {
      const t = e.getSource(this.source.id);
      if (t) {
        let n = await (t == null ? void 0 : t.getData());
        if (!n)
          throw new Error("[AnimatedRouteLayer.onAdd]: No feature found in source data");
        if (n.type === "FeatureCollection" && (console.warn("[AnimatedRouteLayer.onAdd]: FeatureCollection found in source data, only single geojson features are currently supported, first feature will be used"), n = n.features[0]), n.type !== "Feature")
          throw new Error("[AnimatedRouteLayer.onAdd]: The first feature in the source data is not a valid GeoJSON of type `Feature`");
        const i = n;
        i.properties["@duration"] && (this.duration = i.properties["@duration"] ?? 1e3), i.properties["@iterations"] && (this.iterations = i.properties["@iterations"] ?? 0), i.properties["@delay"] && (this.delay = i.properties["@delay"] ?? 0), i.properties["@autoplay"] && (this.autoplay = i.properties["@autoplay"] ?? !1);
        const a = hu(i, {
          pathSmoothing: this.cameraMaptilerAnimationOptions ? this.cameraMaptilerAnimationOptions.pathSmoothing : !1,
          defaultEasing: this.easing
        }), o = this.duration, s = this.iterations, l = this.delay, u = this.autoplay;
        return {
          keyframes: a,
          duration: o,
          iterations: s,
          delay: l,
          autoplay: u
        };
      }
    }
    if (this.keyframes)
      return {
        keyframes: this.keyframes,
        duration: this.duration,
        iterations: this.iterations,
        delay: this.delay,
        autoplay: this.autoplay
      };
    throw new Error("[AnimatedRouteLayer.onAdd]: No keyframes or source provided");
  }
  /**
   * This method is called when the layer is removed from the map.
   * It destroys the animation instance.
   */
  onRemove() {
    var e;
    (e = this.animationInstance) == null || e.destroy();
  }
  /**
   * This method is called to render the layer.
   * It is a no-op for this layer.
   */
  render() {
  }
}
function ul() {
  return "4.1.0";
}
const jh = C.Map, Uh = C.Marker, Bh = C.Popup, Vh = C.Style, qh = C.CanvasSource, Gh = C.GeoJSONSource, Hh = C.ImageSource, Kh = C.RasterTileSource, Zh = C.RasterDEMTileSource, Wh = C.VectorTileSource, Yh = C.VideoSource, Xh = C.NavigationControl, Jh = C.GeolocateControl, Qh = C.AttributionControl, em = C.LogoControl, tm = C.ScaleControl, rm = C.FullscreenControl, nm = C.TerrainControl, im = C.BoxZoomHandler, am = C.ScrollZoomHandler, om = C.CooperativeGesturesHandler, sm = C.KeyboardHandler, lm = C.TwoFingersTouchPitchHandler, um = C.MapWheelEvent, cm = C.MapTouchEvent, pm = C.MapMouseEvent, fm = C.config, dm = C.getVersion, {
  setRTLTextPlugin: hm,
  getRTLTextPluginStatus: mm,
  LngLat: Le,
  LngLatBounds: sh,
  MercatorCoordinate: Zn,
  Evented: ym,
  AJAXError: gm,
  prewarm: vm,
  clearPrewarmedResources: bm,
  Hash: wm,
  Point: cl,
  EdgeInsets: Sm,
  DragRotateHandler: xm,
  DragPanHandler: Cm,
  TwoFingersTouchZoomRotateHandler: Am,
  DoubleClickZoomHandler: Lm,
  TwoFingersTouchZoomHandler: Em,
  TwoFingersTouchRotateHandler: Tm,
  getWorkerCount: km,
  setWorkerCount: lh,
  getMaxParallelImageRequests: Im,
  setMaxParallelImageRequests: Mm,
  getWorkerUrl: Pm,
  setWorkerUrl: _m,
  addSourceType: Om,
  importScriptInWorkers: Rm,
  addProtocol: Fm,
  removeProtocol: zm
} = C;
export {
  gm as AJAXError,
  Ba as ANIM_LAYER_PREFIX,
  $h as AnimatedRouteLayer,
  Lh as AttributionControl,
  Qh as AttributionControlMLGL,
  Th as BoxZoomHandler,
  im as BoxZoomHandlerMLGL,
  vh as CanvasSource,
  qh as CanvasSourceMLGL,
  Xr as CollisionBehaviour,
  T as ColorRamp,
  ll as ColorRampCollection,
  Ih as CooperativeGesturesHandler,
  om as CooperativeGesturesHandlerMLGL,
  $e as CubemapFaceNames,
  rd as CubemapImagesPresets,
  ir as CubemapLayer,
  Ce as DOMcreate,
  Nt as DOMremove,
  Lm as DoubleClickZoomHandler,
  Cm as DragPanHandler,
  xm as DragRotateHandler,
  Sm as EdgeInsets,
  ym as Evented,
  mc as FullscreenControl,
  rm as FullscreenControlMLGL,
  bh as GeoJSONSource,
  Gh as GeoJSONSourceMLGL,
  fc as GeolocateControl,
  Jh as GeolocateControlMLGL,
  vd as GeolocationType,
  wm as Hash,
  wh as ImageSource,
  Hh as ImageSourceMLGL,
  Fd as ImageViewer,
  ue as ImageViewerEvent,
  Dh as ImageViewerMarker,
  Ud as ImageViewerMarkerEvent,
  Mh as KeyboardHandler,
  sm as KeyboardHandlerMLGL,
  R as Language,
  Le as LngLat,
  sh as LngLatBounds,
  dc as LogoControl,
  em as LogoControlMLGL,
  Ns as Map,
  jh as MapMLGL,
  Rh as MapMouseEvent,
  pm as MapMouseEventMLGL,
  $m as MapStyle,
  jm as MapStyleVariant,
  Oh as MapTouchEvent,
  cm as MapTouchEventMLGL,
  _h as MapWheelEvent,
  um as MapWheelEventMLGL,
  qt as MaptilerAnimation,
  Tf as MaptilerCustomControl,
  Dn as MaptilerExternalControl,
  Ef as MaptilerGeolocateControl,
  Wi as MaptilerLogoControl,
  Af as MaptilerNavigationControl,
  kf as MaptilerProjectionControl,
  Cf as MaptilerTerrainControl,
  xn as Marker,
  Uh as MarkerMLGL,
  Zn as MercatorCoordinate,
  Xh as NavigationControMLGL,
  wo as NavigationControl,
  cl as Point,
  yh as Popup,
  Bh as PopupMLGL,
  sr as RadialGradientLayer,
  xh as RasterDEMTileSource,
  Zh as RasterDEMTileSourceMLGL,
  Sh as RasterTileSource,
  Kh as RasterTileSourceMLGL,
  Um as ReferenceMapStyle,
  hc as ScaleControl,
  tm as ScaleControlMLGL,
  kh as ScrollZoomHandler,
  am as ScrollZoomHandlerMLGL,
  yc as SdkConfig,
  Bm as ServiceError,
  gh as Style,
  Vh as StyleMLGL,
  nm as TerrainControMLGL,
  Eh as TerrainControl,
  Ph as TwoFingersTouchPitchHandler,
  lm as TwoFingersTouchPitchHandlerMLGL,
  Tm as TwoFingersTouchRotateHandler,
  Em as TwoFingersTouchZoomHandler,
  Am as TwoFingersTouchZoomRotateHandler,
  Ch as VectorTileSource,
  Wh as VectorTileSourceMLGL,
  Ah as VideoSource,
  Yh as VideoSourceMLGL,
  Fm as addProtocol,
  Om as addSourceType,
  Vm as areSameLanguages,
  qm as bufferToPixelDataBrowser,
  Gm as canParsePixelData,
  Hm as circumferenceAtLatitude,
  bm as clearPrewarmedResources,
  D as config,
  fm as configMLGL,
  Km as coordinates,
  mu as createBezierPathFromCoordinates,
  Fe as cubemapPresets,
  Zm as data,
  Fh as displayWebGLContextLostWarning,
  Wm as elevation,
  Ym as expandMapStyle,
  zh as geocoding,
  Xm as geolocation,
  Jm as getAutoLanguage,
  yu as getAverageDistance,
  Zi as getBrowserLanguage,
  Qm as getBufferToPixelDataParser,
  ey as getLanguageInfoFromCode,
  ty as getLanguageInfoFromFlag,
  ry as getLanguageInfoFromKey,
  dm as getMapLibreVersion,
  Im as getMaxParallelImageRequests,
  mm as getRTLTextPluginStatus,
  ny as getTileCache,
  ul as getVersion,
  Tc as getWebGLSupportError,
  km as getWorkerCount,
  Pm as getWorkerUrl,
  Vd as gpx,
  Jd as gpxOrKml,
  Js as hasChildNodeWithName,
  Nh as helpers,
  Rm as importScriptInWorkers,
  iy as isLanguageInfo,
  qd as kml,
  J as lerp,
  yo as lerpArrayValues,
  ay as mapStylePresetList,
  oy as math,
  sy as misc,
  hu as parseGeoJSONFeatureToKeyframes,
  vm as prewarm,
  zm as removeProtocol,
  vu as resamplePath,
  Mm as setMaxParallelImageRequests,
  hm as setRTLTextPlugin,
  lh as setWorkerCount,
  _m as setWorkerUrl,
  gu as simplifyPath,
  ly as staticMaps,
  bi as str2xml,
  Ni as stretchNumericalArray,
  uy as styleToStyle,
  cy as toLanguageInfo,
  Rs as toggleProjection,
  Os as toggleTerrain,
  Da as xml2str
};
//# sourceMappingURL=maptiler-sdk.mjs.map
