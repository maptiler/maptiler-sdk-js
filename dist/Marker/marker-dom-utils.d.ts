import { MarkerOptions } from 'maplibre-gl';
import { MapTilerMarkerOptions, PendingMarkerUpdates } from './types';
/** Added to every marker's wrapper element so marker text can pick up the SDK font. */
export declare const MARKER_FONT_CLASSNAME = "maptiler-sdk-marker-font";
/**
 * Resolves the inner transform wrapper from a marker's outer root element
 * (or returns `element` itself when it already is the wrapper, or has none).
 * @param element - The marker's outer root element.
 */
export declare function resolveMarkerWrapper(element: HTMLElement): HTMLElement;
/**
 * Seeds the CSS custom properties that drive marker colors and shadow.
 * Used on the generated wrapper, and on user-supplied custom elements so
 * their styles can consume the same variables.
 * @param element - Element to receive the custom properties.
 * @param options - Resolved marker options.
 */
export declare function applyMarkerStyleVariables(element: HTMLElement | SVGElement, options: MapTilerMarkerOptions): void;
/**
 * Creates the root wrapper `div` for a marker, seeding all CSS custom
 * properties and the initial `data-*` attributes used by {@link applyTransform}.
 * @param options - Resolved marker options.
 * @returns The outer root element, ready to be handed to MapLibre.
 */
export declare function createMarkerElement(options: MapTilerMarkerOptions): HTMLDivElement;
/**
 * Commits a batch of pending property updates onto a live marker element.
 * Called by `Marker[FlushDOMUpdatesSymbol]()` when there are pending updates.
 * A key being present in `props` (even with an `undefined` value) means
 * "apply this property".
 * @param element - The marker's outer root element.
 * @param props - Pending property updates.
 * @param styleId - Current map style id, used to resolve unset colours to their map-style defaults.
 */
export declare function updateMarkerElement(element: HTMLElement, props: PendingMarkerUpdates, styleId?: string): void;
/** Matches the fade duration in the SDK stylesheet (`.maptiler-marker-collision-fade`). */
export declare const COLLISION_FADE_DURATION_MS = 150;
/** Toggles the collision-hidden fade (rules live in the SDK stylesheet). */
export declare function applyCollisionHidden(element: HTMLElement, hidden: boolean): void;
/** Removes the fade class — only call once no fade/dip is in flight, or it cuts the animation short. */
export declare function releaseCollisionFadeClass(element: HTMLElement): void;
/**
 * `display: none`s a collision-hidden marker once its fade completes. Un-culling doesn't flush
 * layout itself — {@link MarkerManagerImpl} batches that once per pass.
 * @returns `true` when the call actually changed the culled state.
 */
export declare function applyCollisionCulled(element: HTMLElement, culled: boolean): boolean;
export declare const GROUND_LINE_CLASSNAME = "maptiler-marker-groundline";
/** Hides a marker with no valid altitude-projected position this frame (off-screen/behind camera). Not the below-ground case — see {@link applyAltitudeOccluded}. */
export declare function applyAltitudeHidden(element: HTMLElement, hidden: boolean): void;
/** Fades a below-ground marker (DOM markers aren't depth-tested against terrain) — position and pointer events stay real, only opacity changes. */
export declare function applyAltitudeOccluded(element: HTMLElement, occluded: boolean): void;
/** Minimized rendering for custom `element` markers: hides its content via `visibility` (keeps the layout box for positioning) and overlays a dot on the anchor point. SVG-root elements get hidden without a dot. */
export declare function applyMinimizedDot(element: HTMLElement | SVGElement, anchor: NonNullable<MarkerOptions["anchor"]>, enabled: boolean): void;
/** Sets the lifecycle-animation vertical offset in CSS px. Animation-only, bypasses {@link updateMarkerElement}'s batching. */
export declare function applyLifecycleLift(element: HTMLElement, liftPx: number): void;
/**
 * Wraps `element` in a new container `div`.
 * MapLibre requires a single root element per marker; this outer wrapper
 * lets MapLibre apply its own transforms without interfering with the
 * inner wrapper's scale/rotation transform.
 * @param element - Element to wrap.
 */
export declare function wrap(element: HTMLElement): HTMLDivElement;
/**
 * Prevents MapLibre element events from firing when the outer root element
 * is clicked but the inner wrapper is not — e.g. whitespace within the
 * MapLibre-positioned container.
 * @param parent - The marker's outer root element.
 */
export declare function forwardPointerEvents(parent: HTMLElement): void;
