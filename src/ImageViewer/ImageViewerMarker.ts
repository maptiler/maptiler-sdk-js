import { Alignment, Subscription, Marker, MarkerOptions, PointLike, Popup } from "../index";
import MapLibreGL from "maplibre-gl";
import ImageViewer from "./ImageViewer";
import { lngLatToPxInternalSymbolKey, pxToLngLatInternalSymbolKey } from "./symbols";
import { monkeyPatchMarkerInstanceToRemoveWrapping } from "./monkeyPatchML";

const { Evented } = MapLibreGL;

export type ImageViewerMarkerOptions = MarkerOptions & {};

export interface ImageViewerMarkerInterface {
  on(event: MarkerEventTypes, listener: (e: ImageViewerMarkerEvent) => void): Subscription;
  off(event: MarkerEventTypes, listener: (e: ImageViewerMarkerEvent) => void): void;
  fire(event: ImageViewerMarkerEvent): void;
  getPosition(): [number, number];
  getOffset(): PointLike;
  getPitchAlignment(): Alignment;
  getPopup(): Popup;
  getRotation(): number;
  getRotationAlignment(): Alignment;
  isDraggable(): boolean;
  remove(): void;
  removeClassName(className: string): void;
  setDraggable(draggable: boolean): void;
  setPosition(px: [number, number]): void;
  setOffset(offset: PointLike): void;
  setOpacity(opacity?: string, opacityWhenCovered?: string): void;
  setPitchAlignment(pitchAlignment: Alignment): void;
  setPopup(popup: Popup): void;
  setRotation(rotation: number): void;
  setRotationAlignment(rotationAlignment: Alignment): void;
  setSubpixelPositioning(subpixelPositioning: boolean): void;
  toggleClassName(className: string): void;
  togglePopup(): void;
}

export class ImageViewerMarker extends Evented {
  private viewer!: ImageViewer;
  private readonly marker: Marker;
  private readonly position: [number, number] = [0, 0];

  constructor({ ...markerOptions }: ImageViewerMarkerOptions) {
    super();
    this.marker = new Marker(markerOptions as MarkerOptions);
  }

  /**
   * Adds the ImageViewerMarker to an instance of ImageViewer.
   *
   * @param {ImageViewer} viewer - The instance of ImageViewer to add the ImageViewerMarker to.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  addTo(viewer: ImageViewer) {
    if (!(viewer instanceof ImageViewer)) {
      throw new Error("[ImageViewerMarker]: an ImageViewerMarker must be added to an instance of ImageViewer");
    }

    this.viewer = viewer;

    setupMarkerEventForwarder(this.marker, this, this.viewer[lngLatToPxInternalSymbolKey]);
    const mapInstance = this.viewer.getSDKInternal();

    this.setPosition(this.position);

    monkeyPatchMarkerInstanceToRemoveWrapping(this.marker);

    this.marker.addTo(mapInstance);

    return this;
  }

  /**
   * Adds a class name to the ImageViewerMarker.
   *
   * @param {string} className - The class name to add to the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  addClassName(className: string) {
    this.marker.addClassName(className);
    return this;
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
  override fire(event: MarkerEventTypes | Event, data?: Record<string, any>) {
    super.fire(event, data);
    return this;
  }

  /**
   * Removes an event listener from the ImageViewerMarker.
   *
   * @param {MarkerEventTypes} event - The event to remove the listener from.
   * @param {ImageViewerMarkerEvent} listener - The listener to remove.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  override off(event: MarkerEventTypes, listener: (e: ImageViewerMarkerEvent) => void) {
    super.off(event, listener);
    return this;
  }

  /**
   * Adds an event listener to the ImageViewerMarker.
   *
   * @param {MarkerEventTypes} event - The event to add the listener to.
   * @param {ImageViewerMarkerEvent} listener - The listener to add.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  override on(event: MarkerEventTypes, listener: (e: ImageViewerMarkerEvent) => void) {
    return super.on(event, listener);
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
    this.marker.remove();
    // the typescript type is incorrect here
    // _listeners is only defined if there are actual listeners
    if (this.marker._listeners) {
      Object.entries(this.marker._listeners).forEach(([event, listeners]) => {
        listeners.forEach((listener) => {
          this.off(event as MarkerEventTypes, listener);
        });
      });
    }

    // the typescript type is incorrect here too
    // _oneTimeListeners is only defined if there are actual listeners
    if (this.marker._oneTimeListeners) {
      Object.entries(this.marker._oneTimeListeners).forEach(([event, listeners]) => {
        listeners.forEach((listener) => {
          this.off(event as MarkerEventTypes, listener);
        });
      });
    }
    return this;
  }

  /**
   * Removes a class name from the ImageViewerMarker dom element.
   *
   * @param {string} className - The class name to remove from the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  removeClassName(className: string) {
    this.marker.removeClassName(className);
    return this;
  }

  /**
   * Sets the draggable state of the ImageViewerMarker.
   *
   * @param {boolean} draggable - The draggable state of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setDraggable(draggable: boolean) {
    this.marker.setDraggable(draggable);
    return this;
  }

  /**
   * Sets the position of the ImageViewerMarker.
   *
   * @param {[number, number]} px - The position of the ImageViewerMarker in image pixels.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setPosition(px: [number, number]) {
    this.position[0] = px[0];
    this.position[1] = px[1];

    if (!this.viewer) {
      return this;
    }

    const lngLat = this.viewer[pxToLngLatInternalSymbolKey](px);
    this.marker.setLngLat(lngLat);
    return this;
  }

  /**
   * Sets the offset of the ImageViewerMarker.
   *
   * @param {PointLike} offset - The offset of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setOffset(offset: PointLike) {
    this.marker.setOffset(offset);
    return this;
  }

  /**
   * Sets the opacity of the ImageViewerMarker.
   *
   * @param {string} opacity - The opacity of the ImageViewerMarker.
   * @param {string} opacityWhenCovered - The opacity of the ImageViewerMarker when covered.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setOpacity(opacity?: string, opacityWhenCovered?: string) {
    this.marker.setOpacity(opacity, opacityWhenCovered);
    return this;
  }

  /**
   * Sets the pitch alignment of the ImageViewerMarker.
   *
   * @param {Alignment} pitchAlignment - The pitch alignment of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
   */
  setPitchAlignment(pitchAlignment: Alignment) {
    this.marker.setPitchAlignment(pitchAlignment);
    return this;
  }

  /**
   * Sets the popup of the ImageViewerMarker.
   *
   * @param {Popup} popup - The popup of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   * @see [Popup](https://docs.maptiler.com/sdk-js/api/markers/#popup)
   */
  setPopup(popup: Popup) {
    this.marker.setPopup(popup);
    return this;
  }

  /**
   * Sets the rotation of the ImageViewerMarker.
   *
   * @param {number} rotation - The rotation of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setRotation(rotation: number) {
    this.marker.setRotation(rotation);
    return this;
  }

  /**
   * Sets the rotation alignment of the ImageViewerMarker.
   *
   * @param {Alignment} rotationAlignment - The rotation alignment of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   * @see  [MapLibreGL.Alignment](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/Alignment/)
   */
  setRotationAlignment(rotationAlignment: Alignment) {
    this.marker.setRotationAlignment(rotationAlignment);
    return this;
  }

  /**
   * Sets if subpixel positioning is enabled for the ImageViewerMarker.
   *
   * @param {boolean} subpixelPositioning - The subpixel positioning of the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  setSubpixelPositioning(subpixelPositioning: boolean) {
    this.marker.setSubpixelPositioning(subpixelPositioning);
    return this;
  }

  /**
   * Toggles a class name on the ImageViewerMarker dom element.
   *
   * @param {string} className - The class name to toggle on the ImageViewerMarker.
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  toggleClassName(className: string) {
    this.marker.toggleClassName(className);
    return this;
  }

  /**
   * Toggles the popup of the ImageViewerMarker.
   *
   * @returns {ImageViewerMarker} The ImageViewerMarker instance.
   */
  togglePopup() {
    this.marker.togglePopup();
    return this;
  }
}

const MARKER_EVENT_TYPES = ["dragstart", "drag", "dragend"] as const;

type MarkerEventTypes = (typeof MARKER_EVENT_TYPES)[number];

const FORBIDDEN_EVENT_VALUES = ["lngLat", "_defaultPrevented", "target"];

export class ImageViewerMarkerEvent {
  readonly type: string;
  readonly target: ImageViewerMarker;

  [key: string]: any;

  constructor(type: MarkerEventTypes, marker: ImageViewerMarker, data: Record<string, any>) {
    this.type = type;
    this.target = marker;

    Object.assign(this, data);
  }
}

function setupMarkerEventForwarder(mapLibreMarker: Marker, imageViewerMarker: ImageViewerMarker, lngLatToPx: ImageViewer[typeof lngLatToPxInternalSymbolKey]) {
  MARKER_EVENT_TYPES.forEach((eventType) => {
    mapLibreMarker.on(eventType, (e) => {
      const lngLat = e.target?.getLngLat();
      if (lngLat) {
        const px = lngLatToPx(e.target?.getLngLat());
        imageViewerMarker.setPosition(px);
      }
      imageViewerMarker.fire(
        eventType,
        new ImageViewerMarkerEvent(eventType, imageViewerMarker, {
          ...Object.fromEntries(Object.entries(e).filter(([key]) => !FORBIDDEN_EVENT_VALUES.includes(key))),
        }),
      );
    });
  });
}
