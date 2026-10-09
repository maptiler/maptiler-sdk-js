// Built-in marker icons — the "Icons for export" frame of the Map Controls UI Figma file,
// exported as-is at the L size (16px) and scaled down for M (12px) and S (8px).
// `maptiler` is the MapTiler mark — the default content of the `maptiler` shape.

import attraction from "../style/svg/marker-icons/attraction.svg?raw";
import bar from "../style/svg/marker-icons/bar.svg?raw";
import cafe from "../style/svg/marker-icons/cafe.svg?raw";
import car from "../style/svg/marker-icons/car.svg?raw";
import circle from "../style/svg/marker-icons/circle.svg?raw";
import clothes from "../style/svg/marker-icons/clothes.svg?raw";
import diamond from "../style/svg/marker-icons/diamond.svg?raw";
import flag from "../style/svg/marker-icons/flag.svg?raw";
import heart from "../style/svg/marker-icons/heart.svg?raw";
import hospital from "../style/svg/marker-icons/hospital.svg?raw";
import lodging from "../style/svg/marker-icons/lodging.svg?raw";
import mall from "../style/svg/marker-icons/mall.svg?raw";
import maptiler from "../style/svg/marker-icons/maptiler.svg?raw";
import park from "../style/svg/marker-icons/park.svg?raw";
import restaurant from "../style/svg/marker-icons/restaurant.svg?raw";
import shop from "../style/svg/marker-icons/shop.svg?raw";
import square from "../style/svg/marker-icons/square.svg?raw";
import star from "../style/svg/marker-icons/star.svg?raw";
import triangle from "../style/svg/marker-icons/triangle.svg?raw";
import water from "../style/svg/marker-icons/water.svg?raw";
import type { MapTilerMarkerIcon } from "./types";

/** Names of the built-in marker icons, usable as the marker `icon` option. */
export const MARKER_ICON_NAMES = [
  "attraction",
  "bar",
  "cafe",
  "car",
  "circle",
  "clothes",
  "diamond",
  "flag",
  "heart",
  "hospital",
  "lodging",
  "mall",
  "maptiler",
  "park",
  "restaurant",
  "shop",
  "square",
  "star",
  "triangle",
  "water",
] as const satisfies readonly MapTilerMarkerIcon[];

/** SVG markup of a built-in icon, designed at the L icon size and scaled to the marker size. */
export const BUILT_IN_MARKER_ICONS: Record<MapTilerMarkerIcon, string> = {
  attraction,
  bar,
  cafe,
  car,
  circle,
  clothes,
  diamond,
  flag,
  heart,
  hospital,
  lodging,
  mall,
  maptiler,
  park,
  restaurant,
  shop,
  square,
  star,
  triangle,
  water,
};
