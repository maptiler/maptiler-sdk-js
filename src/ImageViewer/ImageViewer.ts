import type { DoubleClickZoomHandler, DragPanHandler, EaseToOptions, LngLat, PointLike, TwoFingersTouchZoomRotateHandler } from "maplibre-gl";
import { FlyToOptions, MapDataEvent, MapOptions, JumpToOptions, MercatorCoordinate, ScrollZoomHandler, BoxZoomHandler, KeyboardHandler, CooperativeGesturesHandler } from "..";
import { Map } from "../Map";
import MapLibre from "maplibre-gl";
import { setupGlobalMapEventForwarder } from "./events";
import { FetchError } from "./utils";

type AllowedConstrcutorOptions = "container" | "apiKey" | "maxZoom" | "minZoom" | "zoom" | "bearing";

const Evented = MapLibre.Evented;

type ImageViewerConstructorOptions = Pick<MapOptions, AllowedConstrcutorOptions> & {
  imageUUID: string;
  debug?: boolean;
  center?: [number, number];
};

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
  center: [0, 0],
  projection: "mercator",
  projectionControl: false,
  geolocateControl: false,
  hash: false,
  renderWorldCopies: false,
  terrain: false,
};

const imageViewerDefaultOptions: Partial<ImageViewerConstructorOptions> = {
  debug: false,
  center: [0, 0],
};

type ImageMetadata = {
  id: string;
  description: string;
  attribution: string;
  width: number;
  height: number;
  minzoom: number;
  maxzoom: number;
  tileSize: number;
};

export default class ImageViewer extends Evented {
  private imageUUID: string;
  private debug: boolean;
  private imageMetadata?: ImageMetadata;

  /**
   * Why not extend the Map class?
   * Because ImageViewer technically operates in screen space and not in map space.
   * We wrap map and perform calculations in screen space.
   * We do not want to have to extend the Map class and give access to
   * methods and properties that operate in LngLat space.   *
   */
  private sdk: Map;

  private options: ImageViewerConstructorOptions & { center: [number, number] };

  private imageSize?: [number, number];
  private paddedSizeMax?: number;

  get version() {
    return this.sdk.version;
  }

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
    } as ImageViewerConstructorOptions & { center: [number, number] };

    const sdkOptions = {
      ...this.options,
      ...overrideOptions,
    };

    const sdk = new Map(sdkOptions);

    this.sdk = sdk;

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

  async onReadyAsync() {
    try {
      await this.sdk.onReadyAsync();
      await Promise.race([
        new Promise((resolve, reject) => {
          this.on("imageviewerready", resolve);
          this.on("imagevieweriniterror", (e: { error: Error }) => reject(e.error));
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

  async init() {
    try {
      await this.fetchImageMetadata();

      this.addImageSource();

      setupGlobalMapEventForwarder({
        map: this.sdk,
        viewer: this,
        lngLatToPx: (lngLat: LngLat) => this.lngLatToPx(lngLat),
      });

      const { center } = this.options;
      this.setCenter(center);
      this.fire("imageviewerready");
    } catch (e) {
      this.fire("imagevieweriniterror", { error: e });
    }
  }

  async fetchImageMetadata() {
    const url = buildImageMetadataURL(this.imageUUID);
    const response = await fetch(url);

    if (!response.ok) {
      throw new FetchError(response, "image metadata");
    }

    const data = (await response.json()) as ImageMetadata;

    this.imageMetadata = data;
  }

  addImageSource() {
    if (!this.imageMetadata) {
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

  triggerRepaint() {
    this.sdk.triggerRepaint();
  }

  get scrollZoom() {
    return this.sdk.scrollZoom;
  }

  set scrollZoom(value: ScrollZoomHandler) {
    this.sdk.scrollZoom = value;
  }

  get boxZoom() {
    return this.sdk.boxZoom;
  }

  set boxZoom(value: BoxZoomHandler) {
    this.sdk.boxZoom = value;
  }

  get dragPan() {
    return this.sdk.dragPan;
  }

  set dragPan(value: DragPanHandler) {
    this.sdk.dragPan = value;
  }

  get keyboard() {
    return this.sdk.keyboard;
  }

  set keyboard(value: KeyboardHandler) {
    this.sdk.keyboard = value;
  }

  get doubleClickZoom() {
    return this.sdk.doubleClickZoom;
  }

  set doubleClickZoom(value: DoubleClickZoomHandler) {
    this.sdk.doubleClickZoom = value;
  }

  get touchZoomRotate() {
    return this.sdk.touchZoomRotate;
  }

  set touchZoomRotate(value: TwoFingersTouchZoomRotateHandler) {
    this.sdk.touchZoomRotate = value;
  }

  get cooperativeGestures() {
    return this.sdk.cooperativeGestures;
  }

  set cooperativeGestures(value: CooperativeGesturesHandler) {
    this.sdk.cooperativeGestures = value;
  }

  private lngLatToPx(lngLat: LngLat) {
    if (!this.paddedSizeMax) {
      throw new Error("[ImageViewer]: Padded size max not set");
    }
    const merc = MercatorCoordinate.fromLngLat(lngLat.wrap());
    return [merc.x * this.paddedSizeMax, merc.y * this.paddedSizeMax] as [number, number];
  }

  private pxToLngLat(px: [number, number]) {
    if (!this.paddedSizeMax) {
      throw new Error("[ImageViewer]: Padded size max not set");
    }

    const merc = new MercatorCoordinate(px[0] / this.paddedSizeMax, px[1] / this.paddedSizeMax);
    return merc.toLngLat() as LngLat;
  }

  flyTo(options: Omit<ImageViewerFlyToOptions, "bearing" | "pitch">, eventData?: MapDataEvent) {
    const lngLat = this.pxToLngLat(options.center);
    return this.sdk.flyTo({ ...options, bearing: 0, pitch: 0, center: lngLat }, eventData);
  }

  jumpTo(options: Omit<ImageViewerJumpToOptions, "bearing" | "pitch">, eventData?: MapDataEvent) {
    const lngLat = this.pxToLngLat(options.center);
    return this.sdk.jumpTo({ ...options, bearing: 0, pitch: 0, center: lngLat }, eventData);
  }

  setZoom(zoom: number) {
    this.sdk.setZoom(zoom);
  }

  getZoom() {
    return this.sdk.getZoom();
  }

  getCenter() {
    const centerLngLat = this.sdk.getCenter();
    const centerPx = this.lngLatToPx(centerLngLat);
    return centerPx;
  }

  setCenter(center: [number, number]) {
    this.sdk.setCenter(this.pxToLngLat(center));
  }

  setBearing(bearing: number) {
    this.sdk.setBearing(bearing);
  }

  getBearing() {
    return this.sdk.getBearing();
  }

  panBy(delta: PointLike, options?: EaseToOptions, eventData?: any) {
    this.sdk.panBy(delta, options, eventData);
  }

  panTo(center: [number, number], options?: EaseToOptions, eventData?: any) {
    this.sdk.panTo(this.pxToLngLat(center), options, eventData);
  }
}

type ImageViewerFlyToOptions = Omit<FlyToOptions, "bearing" | "pitch"> & {
  center: [number, number];
};

type ImageViewerJumpToOptions = Omit<JumpToOptions, "bearing" | "pitch"> & {
  center: [number, number];
};

function buildImageMetadataURL(uuid: string) {
  return `${getAPIBasePath()}/${uuid}/image.json`;
}

function buildImageTilesURL(uuid: string) {
  return `${getAPIBasePath()}/${uuid}/{z}/{x}/{y}`;
}

// function getAPIBasePath() {
//   return "https://api.maptiler.com/images";
// }
function getAPIBasePath() {
  return "http://localhost:4321";
}

// function getAPIBasePath() {
//   if (import.meta.env.VITE_IMAGE_API_BASE_URL_OVERRIDE) {
// return `${import.meta.env.VITE_IMAGE_API_BASE_URL_OVERRIDE}/images`;
// }
// return "http://api.maptiler.com/images";
// }
