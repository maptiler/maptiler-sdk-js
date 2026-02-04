import MaplibreGL from "maplibre-gl";
import {
  EaseToOptions,
  DoubleClickZoomHandler,
  DragPanHandler,
  TwoFingersTouchZoomRotateHandler,
  FlyToOptions,
  MapOptions,
  JumpToOptions,
  MercatorCoordinate,
  ScrollZoomHandler,
  BoxZoomHandler,
  KeyboardHandler,
  CooperativeGesturesHandler,
  LngLat,
  LngLatBounds,
  MapDataEvent,
  PointLike,
} from "..";
import { Map } from "../Map";
import { ImageViewerEvent, setupGlobalMapEventForwarder } from "./events";
import { FetchError } from "../utils/errors";
import { config } from "..";
import { overpanningUnderzoomingTransformConstrain } from "./monkeyPatchML";
import { NavigationControl } from "../MLAdapters/NavigationControl";
import { ImageViewerFitImageToBoundsControl } from "../controls/ImageViewerFitImageToBoundsControl";
import { lngLatToPxInternalSymbolKey, pxToLngLatInternalSymbolKey } from "./symbols";

const { Evented } = MaplibreGL;

//#region types

export type AllowedConstructorOptions = "container" | "apiKey" | "maxZoom" | "minZoom" | "zoom" | "bearing";

export type ImageViewerFlyToOptions = Omit<FlyToOptions, "pitch"> & {
  center: [number, number];
};

export type ImageViewerJumpToOptions = Omit<JumpToOptions, "pitch"> & {
  center: [number, number];
};

export type ImageViewerEaseToOptions = Omit<EaseToOptions, "pitch"> & {
  center: [number, number];
};

//#region ImageViewerConstructorOptions
export type ImageViewerConstructorOptions = Pick<MapOptions, AllowedConstructorOptions> & {
  /**
   * The UUID of the image.
   */
  imageUUID: string;
  /**
   * Whether to show debug information.
   */
  debug?: boolean;
  /**
   * The center of the image.
   */
  center?: [number, number];
  /**
   * Whether to show a control to fit the image to the viewport.
   */
  fitToBoundsControl?: boolean;

  /**
   * Whether to show a navigation control.
   */
  navigationControl?: boolean;
};

//#region ImageMetadata
/**
 * The metadata of the image. This is the shape of the response from the API.
 * And used to convert px to lnglat and vice versa.
 */
export type ImageMetadata = {
  id: string;
  description: string;
  attribution: string;
  width: number;
  height: number;
  minzoom: number;
  maxzoom: number;
  tileSize: number;
};

//#region overrideOptions
/**
 * These options cannot be changed externally and are used when creating the map instance.
 *
 * @internal
 */
const overrideOptions: Partial<MapOptions> = {
  style: {
    version: 8,
    sources: {},
    layers: [],
  },
  minPitch: 0,
  maxPitch: 0,
  pitch: 0,
  bearing: 0,
  projection: "mercator",
  geolocateControl: false,
  navigationControl: false,
  projectionControl: false,
  hash: false,
  renderWorldCopies: false,
  terrain: false,
  space: false,
  halo: false,
  transformConstrain: overpanningUnderzoomingTransformConstrain,
};

//#region imageViewerDefaultOptions
const imageViewerDefaultOptions: Partial<ImageViewerConstructorOptions> = {
  debug: false,
  fitToBoundsControl: true,
  navigationControl: true,
};

//#region ImageViewer
export default class ImageViewer extends Evented {
  /**
   * The UUID of the image.
   *
   * @internal
   */
  private imageUUID: string;

  /**
   * Whether to enable debug mode.
   *
   * @internal
   */
  private debug: boolean;

  /**
   * The metadata of the image.
   *
   */
  private imageMetadata?: ImageMetadata;

  /**
   * Why not extend the Map class?
   * Because ImageViewer technically operates in screen space and not in map space.
   * We wrap map and perform calculations in screen space.
   * We do not want to have to extend the Map class and give access to
   * methods and properties that operate in LngLat space.   *
   */
  private sdk!: Map;

  /**
   * The options for the ImageViewer.
   *
   * @internal
   */
  private options: ImageViewerConstructorOptions & { center?: [number, number] };

  /**
   * The size of the image.
   *
   * @internal
   */
  private imageSize?: [number, number];

  /**
   * The padded size max.
   *
   * @internal
   */
  private paddedSizeMax?: number;

  /**
   * The version of the ImageViewer / SDK.
   */
  public get version() {
    return this.sdk.version;
  }

  /**
   * The control to fit the image to the viewport.
   */
  fitToBoundsControlInstance!: ImageViewerFitImageToBoundsControl;

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
  constructor(imageViewerConstructorOptions: Partial<ImageViewerConstructorOptions>) {
    super();

    if (!imageViewerConstructorOptions.imageUUID) {
      throw new Error("[ImageViewer]: `imageUUID` is required");
    }

    if (typeof imageViewerConstructorOptions.container !== "string" && !(imageViewerConstructorOptions.container instanceof HTMLElement)) {
      throw new Error("[ImageViewer]: `container` is required and must be a string or HTMLElement");
    }

    this.options = {
      ...imageViewerDefaultOptions,
      ...imageViewerConstructorOptions,
    } as ImageViewerConstructorOptions & { center?: [number, number] };

    const sdkOptions = {
      ...this.options,
      ...overrideOptions,
    };

    // we don't want to pass the center to the map instance
    // because it will be in px space and not lnglat space
    // we cannot convert it lnglat space until the metadata is fetched
    delete sdkOptions.center;

    this.sdk = new Map(sdkOptions);

    this.sdk.telemetry.registerViewerType("ImageViewer");

    const { imageUUID, debug } = imageViewerConstructorOptions;

    this.imageUUID = imageUUID;

    this.debug = debug ?? false;

    if (this.debug) {
      this.sdk.showTileBoundaries = this.debug;
      this.sdk.showPadding = this.debug;
      this.sdk.showCollisionBoxes = this.debug;
      this.sdk.repaint = this.debug;
    }

    void this.init();
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
        new Promise((resolve, reject) => {
          void this.once("imageviewerready", (evt) => {
            resolve(evt);
          });
          void this.once("imagevieweriniterror", (e: { error: Error }) => {
            reject(e.error);
          });
        }),
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Timeout waiting for image viewer to be ready"));
          }, 5000);
        }),
      ]);
    } catch (e) {
      throw e;
    }
  }

  // this flag is used to determine if the image should be fit to the viewport
  // when the map is resized
  shouldFitImageToViewport = true;

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
  private async init() {
    try {
      await this.sdk.onReadyAsync();

      await this.fetchImageMetadata();

      this.addImageSource();

      if (this.options.navigationControl) {
        this.sdk.addControl(
          new NavigationControl({
            visualizePitch: false,
            visualizeRoll: false,
          }),
        );
      }
      this.fitToBoundsControlInstance = new ImageViewerFitImageToBoundsControl({ imageViewer: this });
      if (this.options.fitToBoundsControl) {
        this.sdk.addControl(this.fitToBoundsControlInstance);
      }

      // TODO return a cleanup function to remove all event listeners
      setupGlobalMapEventForwarder({
        map: this.sdk,
        viewer: this,
        lngLatToPx: (lngLat: LngLat) => this.lngLatToPx(lngLat),
      });

      const { center, zoom, bearing } = this.options;
      const initCenter = center ?? [(this.imageMetadata?.width ?? 0) / 2, (this.imageMetadata?.height ?? 0) / 2];
      this.setCenter(initCenter);

      this.setBearing(bearing ?? 0);

      if (!this.options.zoom) {
        this.fitImageToViewport();
      } else {
        this.setZoom(zoom ?? this.imageMetadata?.maxzoom ?? 5);
      }

      // we want to disable the fit image to viewport on wheel and drag
      // "move" and "zoom" are not viable as they would be fired
      // when `fitImageToViewport` is called making loop
      // so we test for UI events instead
      this.sdk.on("wheel", () => {
        this.shouldFitImageToViewport = false;
      });

      this.sdk.on("touchstart", () => {
        this.shouldFitImageToViewport = false;
      });

      this.sdk.on("drag", () => {
        this.shouldFitImageToViewport = false;
      });

      // checks to see if there have been any UI events
      // if not, then we keep the image centered
      // and zoomed to fit the page.
      this.sdk.on("resize", () => {
        const previousCenter = this.getCenter();
        const width = this.imageMetadata?.width ?? 0;
        const height = this.imageMetadata?.height ?? 0;

        if (this.shouldFitImageToViewport) {
          this.fitImageToViewport();
        }

        if (previousCenter[0] !== width / 2 || previousCenter[1] !== height / 2) {
          this.setCenter(previousCenter);
        }
      });
      this.fire("imageviewerready", new ImageViewerEvent("imageviewerready", this));
    } catch (e) {
      this.fire("imagevieweriniterror", { error: e });
    }
  }

  //#region fitImageToViewport
  /**
   * Fits the image to the viewport.
   *
   * @param {Object} options - The options for the fit image to viewport.
   * @param {boolean} options.ease - Whether to ease to the viewport bounds.
   */
  fitImageToViewport({ ease = false }: { ease?: boolean } = {}) {
    if (!this.imageMetadata) {
      throw new Error("[ImageViewer]: Image metadata not found");
    }

    const tl = this.pxToLngLat([0, 0]);
    const br = this.pxToLngLat([this.imageMetadata.width ?? 0, this.imageMetadata.height ?? 0]);

    const cameraForBounds = this.sdk.cameraForBounds([tl, br], { padding: 50 });
    if (cameraForBounds) {
      if (ease) {
        this.sdk.easeTo({ ...cameraForBounds, pitch: 0 }, null);
      } else {
        this.sdk.jumpTo({ ...cameraForBounds, pitch: 0 }, null);
      }
    }

    // reset the flag to true
    this.shouldFitImageToViewport = true;
  }

  //#region fetchImageMetadata
  /**
   * Fetches the image metadata from the API.
   *
   * @internal
   * @returns {Promise<void>}
   */
  private async fetchImageMetadata() {
    const url = buildImageMetadataURL(this.imageUUID);
    const response = await fetch(url);

    if (!response.ok) {
      throw new FetchError(response, "image metadata", "ImageViewer");
    }

    const data = (await response.json()) as ImageMetadata;

    this.imageMetadata = data;
    Object.freeze(this.imageMetadata);
  }

  //#region addImageSource
  /**
   * Adds the image source to the sdk instance.
   *
   * @internal
   * @returns {void}
   */
  private addImageSource() {
    if (!this.imageMetadata) {
      this.fire("error", new ImageViewerEvent("error", this, null, { error: new Error("[ImageViewer]: Image metadata not found") }));
      throw new Error("[ImageViewer]: Image metadata not found");
    }

    const url = buildImageTilesURL(this.imageUUID);

    const ceilToPow2 = (x: number) => Math.pow(2, Math.ceil(Math.log(x) / Math.LN2));

    this.imageSize = [this.imageMetadata.width, this.imageMetadata.height];
    this.paddedSizeMax = Math.max(ceilToPow2(this.imageSize[0]), ceilToPow2(this.imageSize[1]));

    const nw = this.pxToLngLat([0, 0]);
    const se = this.pxToLngLat(this.imageSize);
    const bounds: [number, number, number, number] = [nw.lng, se.lat, se.lng, nw.lat];

    this.sdk.addSource("image", {
      ...this.imageMetadata,
      type: "raster",
      bounds,
      tiles: [url],
    });

    this.sdk.addLayer({
      id: "image",
      type: "raster",
      source: "image",
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
  set scrollZoom(value: ScrollZoomHandler) {
    this.sdk.scrollZoom = value;
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
  set boxZoom(value: BoxZoomHandler) {
    this.sdk.boxZoom = value;
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
  set dragPan(value: DragPanHandler) {
    this.sdk.dragPan = value;
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
  set keyboard(value: KeyboardHandler) {
    this.sdk.keyboard = value;
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
  set doubleClickZoom(value: DoubleClickZoomHandler) {
    this.sdk.doubleClickZoom = value;
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
  set touchZoomRotate(value: TwoFingersTouchZoomRotateHandler) {
    this.sdk.touchZoomRotate = value;
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
  set cooperativeGestures(value: CooperativeGesturesHandler) {
    this.sdk.cooperativeGestures = value;
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
  private lngLatToPx(lngLat: LngLat) {
    if (!this.paddedSizeMax) {
      const msg = "[ImageViewer]: Unable to convert LngLat to px, padded size max not set";
      this.fire("error", new ImageViewerEvent("error", this, null, { error: new Error(msg) }));
      throw new Error(msg);
    }
    const merc = MercatorCoordinate.fromLngLat(lngLat);
    return [merc.x * this.paddedSizeMax, merc.y * this.paddedSizeMax] as [number, number];
  }

  //#region pxToLngLat
  /**
   * Converts a px coordinate to a LngLat, based on the image metadata.
   *
   * @internal
   * @param {LngLat} lngLat - The LngLat to convert.
   * @returns {[number, number]} The px coordinate.
   */
  private pxToLngLat(px: [number, number]) {
    if (!this.paddedSizeMax) {
      const msg = "[ImageViewer]: Unable to convert px to LngLat, padded size max not set";
      this.fire("error", new ImageViewerEvent("error", this, null, { error: new Error(msg) }));
      throw new Error(msg);
    }

    const merc = new MercatorCoordinate(px[0] / this.paddedSizeMax, px[1] / this.paddedSizeMax);
    return merc.toLngLat() as LngLat;
  }
  //#region getSDKInternal

  /**
   * Get the internal SDK instance.
   *
   * @returns {Map} The internal SDK instance.
   * @internal
   */
  public getSDKInternal() {
    return this.sdk;
  }

  /**
   * Get the canvas of the internal SDK instance.
   *
   * @returns {HTMLCanvasElement} The canvas of the internal SDK instance.
   */
  public getCanvas() {
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
  public flyTo(options: ImageViewerFlyToOptions, eventData?: MapDataEvent) {
    const lngLat = this.pxToLngLat(options.center);
    this.sdk.flyTo({ ...options, pitch: 0, center: lngLat }, eventData);
    return this;
  }

  //#region jumpTo
  /**
   * Jump to a given center.
   *
   * @param {ImageViewerJumpToOptions} options - The options for the jump to.
   * @param {MapDataEvent} eventData - The event data.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  public jumpTo(options: ImageViewerJumpToOptions, eventData?: MapDataEvent) {
    const lngLat = this.pxToLngLat(options.center);
    this.sdk.jumpTo({ ...options, pitch: 0, center: lngLat }, eventData);
    return this;
  }

  //#region setZoom
  /**
   * Set the zoom level.
   *
   * @param {number} zoom - The zoom level.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  public setZoom(zoom: number) {
    this.sdk.setZoom(zoom);
    return this;
  }

  //#region getZoom
  /**
   * Get the zoom level.
   *
   * @returns {number} The zoom level.
   */
  public getZoom() {
    return this.sdk.getZoom();
  }

  //#region getCenter
  /**
   * Get the center of the ImageViewer in pixels.
   *
   * @internal
   * @returns {[number, number]} The center of the ImageViewer.
   */
  public getCenter() {
    const centerLngLat = this.sdk.getCenter();
    const centerPx = this.lngLatToPx(centerLngLat);
    return centerPx;
  }

  //#region setCenter
  /**
   * Set the center of the ImageViewer in pixels.
   *
   * @param {number} center - The center of the ImageViewer.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  public setCenter(center: [number, number]) {
    this.sdk.setCenter(this.pxToLngLat(center));
    return this;
  }

  //#region setBearing
  /**
   * Set the bearing of the ImageViewer in degrees.
   *
   * @param {number} bearing - The bearing of the ImageViewer.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  public setBearing(bearing: number) {
    this.sdk.setBearing(bearing);
    return this;
  }

  //#region getBearing
  /**
   * Get the bearing of the ImageViewer in degrees.
   *
   * @returns {number} The bearing of the ImageViewer.
   */
  public getBearing() {
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
  public panBy(delta: PointLike, options?: ImageViewerEaseToOptions, eventData?: any) {
    this.sdk.panBy(delta, { ...options, pitch: 0 }, eventData);
    return this;
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
  public panTo(center: [number, number], options?: ImageViewerEaseToOptions, eventData?: any) {
    this.sdk.panTo(this.pxToLngLat(center), { ...options, pitch: 0 }, eventData);
    return this;
  }

  //#region getImageMetadata
  /**
   * Get the image metadata.
   *
   * @returns {ImageMetadata} The image metadata.
   */
  public getImageMetadata() {
    return this.imageMetadata;
  }

  //#region getImageBounds
  /**
   * Get the visible bounds of the image in the viewport in imagePixels.
   * [topLeft, bottomRight]
   *
   * @returns {[[number, number], [number, number]]} The visible bounds of the image.
   */
  public getImageBounds() {
    const mapBounds = this.sdk.getBounds().toArray();
    const boundsPx = mapBounds.map((bound) => {
      return this.lngLatToPx(LngLat.convert(bound));
    }) as [[number, number], [number, number]];

    // we need to rearrange the bounds to be in the correct order
    // top left and bottom right
    const tl = [boundsPx[0][0], boundsPx[1][1]];

    const br = [boundsPx[1][0], boundsPx[0][1]];
    return [tl, br];
  }

  //#region fitImageBounds
  /**
   * Set the bounds of the image.
   *
   * @param {[[number, number], [number, number]]} bounds - The bounds of the image.
   * @returns {ImageViewer} The ImageViewer instance.
   */
  public fitImageBounds([tl, br]: [[number, number], [number, number]]) {
    const tlLngLat = this.pxToLngLat(tl);
    const brLngLat = this.pxToLngLat(br);
    const bounds = LngLatBounds.convert([tlLngLat, brLngLat]);
    this.sdk.fitBounds(bounds);
    return this;
  }

  //#region remove
  /**
   * Destroys the ImageViewer, removes the map instance and all event listeners. Useful for cleanup.
   *
   * @returns {ImageViewer} The ImageViewer instance.
   */
  public remove() {
    this.fire("beforeremove", new ImageViewerEvent("beforeremove", this));
    this.sdk.remove();

    // the typescript type is incorrect here
    // _listeners is only defined if there are actual listeners
    if (this._listeners) {
      Object.entries(this._listeners).forEach(([event, listeners]) => {
        listeners.forEach((listener) => {
          this.off(event, listener);
        });
      });
    }

    // the typescript type is incorrect here too
    // _oneTimeListeners is only defined if there are actual listeners
    if (this._oneTimeListeners) {
      Object.entries(this._oneTimeListeners).forEach(([event, listeners]) => {
        listeners.forEach((listener) => {
          this.off(event, listener);
        });
      });
    }
  }

  public pointIsWithinImageBounds(px: [number, number]) {
    const metadata = this.getImageMetadata();
    if (!metadata) {
      return false;
    }

    const bounds = [
      [0, 0],
      [metadata.width, metadata.height],
    ];

    return px[0] >= bounds[0][0] && px[0] <= bounds[1][0] && px[1] >= bounds[0][1] && px[1] <= bounds[1][1];
  }

  // aliases for methods that are not exposed by the SDK
  // but used internally (ImageMarkers)
  [lngLatToPxInternalSymbolKey] = this.lngLatToPx.bind(this);
  [pxToLngLatInternalSymbolKey] = this.pxToLngLat.bind(this);
}

//#region helpers

function buildImageMetadataURL(uuid: string) {
  return `${getAPIBasePath()}/${uuid}/image.json?key=${config.apiKey}`;
}

function buildImageTilesURL(uuid: string) {
  return `${getAPIBasePath()}/${uuid}/{z}/{x}/{y}?key=${config.apiKey}`;
}

function getAPIBasePath() {
  // @ts-expect-error this will be defined if we're in a Vite environment
  const overrideUrl = import.meta.env.VITE_IMAGE_API_BASE_URL_OVERRIDE as string | undefined;

  if (overrideUrl) {
    return overrideUrl;
  }

  return "https://api.maptiler.com/images";
}
