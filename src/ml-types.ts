/* eslint-disable
  @typescript-eslint/consistent-indexed-object-style,
  @typescript-eslint/no-deprecated,
  @typescript-eslint/no-empty-object-type,
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-invalid-void-type,
  @typescript-eslint/no-namespace,
  @typescript-eslint/no-unsafe-function-type,
*/
import maplibregl from "maplibre-gl";

import type {
  CompositeExpression,
  Event,
  ErrorEvent as ErrorEvent$1,
  GlyphPosition,
  ICanonicalTileID,
  Map as Map$1,
  Point,
  PropertyValueSpecification,
  SourceExpression,
  StylePropertyExpression,
  StylePropertySpecification,
  Tile,
  Complete,
  MapOptions,
  CollisionBoxArray,
  QueryRenderedFeaturesOptions,
  AlphaImage,
  FeatureIndex,
  MessageType,
  RequestResponseMessageMap,
  Handler,
  Bucket,
  Style,
  StyleImageData,
  StyleLayer,
  RasterDEMTileSource,
  GeoJSONSource,
  Actor,
  WebGLContextAttributesWithType,
} from "maplibre-gl";

// types removed from public API in MapLibre 5.8.0, compatible with 5.14.0

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type Config = typeof maplibregl.config;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SerializedObject<S extends Serialized = any> = {
  [_: string]: S;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type Serialized = Exclude<MessageData["data"], undefined>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ViewType = StructArrayMember["type"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type StructArrayMember = StructArray["members"][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SerializedStructArray = {
  length: number;
  arrayBuffer: ArrayBuffer;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SymbolInstance = SymbolInstanceStruct;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TextAnchorOffset = TextAnchorOffsetStruct;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ErrorLike = ErrorEvent$1["error"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CrossfadeParameters = NonNullable<Parameters<ProgramConfiguration["updatePaintBuffers"]>[0]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TimePoint = TransitionParameters["now"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CrossFaded<T> = {
  to: T;
  from: T;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface Property<T, R> {
  specification: StylePropertySpecification;
  possiblyEvaluate(value: PropertyValue<T, R>, parameters: EvaluationParameters, canonical?: CanonicalTileID, availableImages?: Array<string>): R;
  interpolate(a: R, b: R, t: number): R;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TransitionParameters = Parameters<StyleLayer["updateTransitions"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type PossiblyEvaluatedValue<T> =
  | {
      kind: "constant";
      value: T;
    }
  | SourceExpression
  | CompositeExpression;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type Size = Parameters<AlphaImage["resize"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SpriteOnDemandStyleImage = NonNullable<StyleImageData["spriteData"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type PreparedShader = Projection["shaderPreludeCode"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SerializedFeaturePositionMap = {
  ids: Float64Array;
  positions: Uint32Array;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FeaturePosition = {
  index: number;
  start: number;
  end: number;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type $ObjMap<T extends {}, F extends (v: any) => any> = {
  [K in keyof T]: F extends (v: T[K]) => infer R ? R : never;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type UniformValues<Us extends {}> = $ObjMap<Us, <V>(u: Uniform<V>) => V>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type UniformLocations = Parameters<ProgramConfiguration["getUniforms"]>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type UniformBindings = {
  [_: string]: Uniform<any>;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type Segment = SegmentVector["segments"][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type HeatmapPaintProps = __ExtractProps<HeatmapStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type HeatmapPaintPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<HeatmapStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type BlendFuncConstant = BlendFuncType[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type BlendFuncType = ColorMode$1["blendFunction"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type BlendEquationType = ReturnType<BlendEquation["getDefault"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ColorMaskType = ColorMode$1["mask"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CompareFuncType = DepthFuncType;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type DepthMaskType = DepthMode$1["mask"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type DepthRangeType = DepthMode$1["range"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type DepthFuncType = DepthMode$1["func"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type StencilFuncType = ReturnType<StencilFunc["getDefault"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type StencilOpConstant = StencilOpType[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type StencilOpType = ReturnType<StencilOp["getDefault"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TextureUnitType = ReturnType<ActiveTextureUnit["getDefault"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ViewportType = ReturnType<Viewport["getDefault"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type StencilTestGL = StencilMode["test"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CullFaceModeType = CullFaceMode$1["mode"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FrontFaceType = CullFaceMode$1["frontFace"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface IValue<T> {
  current: T;
  default: T;
  dirty: boolean;
  get(): T;
  setDefault(): void;
  set(value: T): void;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SerializedGrid = {
  buffer: ArrayBuffer;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type IntersectionResult = ReturnType<Aabb["intersectsFrustum"]>;
export namespace IntersectionResult {
  export type None = 0;
  export type Partial = 1;
  export type Full = 2;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type IBoundingVolume = Pick<Frustum["aabb"], "intersectsFrustum" | "intersectsPlane">;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TileResult = ReturnType<TileManager["tilesIn"]>[number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GlyphMetrics = GlyphPosition["metrics"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type Rect = GlyphPosition["rect"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SymbolLayoutProps = __ExtractProps<SymbolStyleLayer["layout"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SymbolLayoutPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<SymbolStyleLayer["layout"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SymbolPaintProps = __ExtractProps<SymbolStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SymbolPaintPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<SymbolStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SymbolQuad = Parameters<SymbolBucket["addSymbols"]>[1][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SizeData = SymbolBucket["textSizeData"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SingleCollisionBox = NonNullable<CollisionArrays["textBox"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CollisionArrays = SymbolBucket["collisionArrays"][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SymbolFeature = SymbolBucket["features"][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SortKeyRange = SymbolBucket["sortKeyRanges"][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type Entry = GlyphManager["entries"][string];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type PoolObject = ReturnType<RenderPool["getObjectForId"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type RenderPass = "offscreen" | "opaque" | "translucent";

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type PainterOptions = Painter["options"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type RenderOptions = Parameters<RenderToTexture["renderLayer"]>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TerrainData = ReturnType<Terrain["getTerrainData"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type PointProjection = ReturnType<IReadonlyTransform["projectTileCoordinates"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type IndexToPointCache = {
  [lineIndex: number]: Point;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ProjectionCache = SymbolProjectionContext["projectionCache"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SymbolProjectionContext = Parameters<CollisionIndex["projectPathToScreenSpace"]>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ProjectionDataParams = Parameters<IReadonlyTransform["getProjectionData"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CoveringTilesDetailsProvider = ReturnType<IReadonlyTransform["getCoveringTilesDetailsProvider"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ITransformGetters = Pick<
  IReadonlyTransform,
  keyof IReadonlyTransform &
    (
      | "tileSize"
      | "tileZoom"
      | "scale"
      | "worldSize"
      | "width"
      | "height"
      | "lngRange"
      | "latRange"
      | "minZoom"
      | "maxZoom"
      | "zoom"
      | "center"
      | "minPitch"
      | "maxPitch"
      | "roll"
      | "rollInRadians"
      | "pitch"
      | "pitchInRadians"
      | "bearing"
      | "bearingInRadians"
      | "fov"
      | "fovInRadians"
      | "elevation"
      | "minElevationForCurrentTile"
      | "padding"
      | "unmodified"
      | "renderWorldCopies"
      | "cameraToCenterDistance"
      | "nearZ"
      | "farZ"
      | "autoCalculateNearFarZ"
    )
>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ITransformMutators = Pick<
  ITransform,
  keyof ITransform &
    (
      | "clone"
      | "apply"
      | "setMinZoom"
      | "setMaxZoom"
      | "setMinPitch"
      | "setMaxPitch"
      | "setRenderWorldCopies"
      | "setBearing"
      | "setPitch"
      | "setRoll"
      | "setFov"
      | "setZoom"
      | "setCenter"
      | "setElevation"
      | "setMinElevationForCurrentTile"
      | "setPadding"
      | "overrideNearFarZ"
      | "clearNearFarZOverride"
      | "resize"
      | "interpolatePadding"
      | "recalculateZoomAndCenter"
      | "setLocationAtPoint"
      | "setMaxBounds"
      | "populateCache"
      | "setTransitionState"
    )
>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type IReadonlyTransform = Painter["transform"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ITransform = TileManager["transform"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type QueryParameters = Parameters<FeatureIndex["query"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type QueryResults = ReturnType<FeatureIndex["query"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type QueryResultsItem = QueryResults[string][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type DEMEncoding = RasterDEMTileSource["encoding"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CircleGranularity = NonNullable<Parameters<CircleBucket["addFeature"]>[4]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TileParameters = RequestResponseMessageMap[MessageType.removeTile][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type WorkerTileParameters = RequestResponseMessageMap[MessageType.loadTile][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type WorkerDEMTileParameters = RequestResponseMessageMap[MessageType.loadDEMTile][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type OverlapMode = Parameters<CollisionIndex["placeCollisionCircles"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type QueryResult<T> = {
  key: T;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GridKey = {
  overlapMode?: OverlapMode;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type PlacedCircles = Parameters<Placement["storeCollisionData"]>[5];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type PlacedBox = Parameters<Placement["storeCollisionData"]>[4];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FeatureKey = CollisionIndex["grid"]["boxKeys"][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TextAnchor = Parameters<Placement["markUsedJustification"]>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CollisionGroup = TileLayerParameters["collisionGroup"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type VariableOffset = Placement["variableOffsets"][string];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TileLayerParameters = BucketPart["parameters"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type BucketPart = Parameters<Placement["placeLayerBucketPart"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CrossTileID = string | number;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type QueryRenderedFeaturesOptionsStrict = Omit<QueryRenderedFeaturesOptions, "layers"> & {
  layers: Set<string> | null;
  globalState?: Record<string, any>;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TileState = Tile["state"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FeatureStates = LayerFeatureStates[string];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LayerFeatureStates = Parameters<Tile["setFeatureState"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CircleLayoutProps = __ExtractProps<CircleStyleLayer["layout"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CircleLayoutPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<CircleStyleLayer["layout"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CirclePaintProps = __ExtractProps<CircleStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CirclePaintPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<CircleStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FillLayoutProps = __ExtractProps<FillStyleLayer["layout"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FillLayoutPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<FillStyleLayer["layout"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FillPaintProps = __ExtractProps<FillStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FillPaintPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<FillStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FillExtrusionPaintProps = __ExtractProps<FillExtrusionStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FillExtrusionPaintPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<FillExtrusionStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type HillshadePaintProps = __ExtractProps<HillshadeStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type HillshadePaintPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<HillshadeStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ColorReliefPaintProps = __ExtractProps<ColorReliefStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ColorReliefPaintPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<ColorReliefStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ColorRampTextures = ColorReliefStyleLayer["colorRampTextures"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LineClips = NonNullable<LineBucket["lineClips"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GradientTexture = LineBucket["gradients"][string];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LineLayoutProps = __ExtractProps<LineStyleLayer["layout"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LineLayoutPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<LineStyleLayer["layout"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LinePaintProps = __ExtractProps<LineStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LinePaintPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<LineStyleLayer["paint"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TypedStyleLayer = Parameters<ProgramConfiguration["updatePaintArrays"]>[3];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type BinderUniform = ReturnType<ProgramConfiguration["getUniforms"]>[number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type AttributeBinder = Extract<ProgramConfiguration["binders"][string], { populatePaintArray: Function }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type UniformBinder = Extract<ProgramConfiguration["binders"][string], { setUniform: Function }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SkyProps = __ExtractProps<Sky["properties"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type SkyPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<Sky["properties"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TerrainPreludeUniformsType = Program$1["terrainUniforms"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ProjectionPreludeUniformsType = Program$1["projectionUniforms"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type DrawMode = Parameters<Program$1["draw"]>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ClearArgs = Parameters<Context["clear"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TextureFormat = Texture["format"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TextureFilter = Texture["filter"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TextureWrap = Texture["wrap"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type EmptyImage = Extract<TextureImage, { data: null }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type DataTextureImage = RGBAImage | AlphaImage | EmptyImage;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TextureImage = Parameters<Texture["update"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type Pattern = ImageManager["patterns"][string];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LightPosition = LightPropsPossiblyEvaluated["position"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LightProps = __ExtractProps<Light["properties"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LightPropsPossiblyEvaluated = __ExtractPropsPossiblyEvaluated<Light["properties"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ProjectionGPUContext = Parameters<Projection["updateGPUdependent"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type TileMeshUsage = Parameters<Projection["getMeshFromTileID"]>[4];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type Projection = NonNullable<Style["projection"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type BucketParameters<Layer extends TypedStyleLayer> = {
  index: number;
  layers: Array<Layer>;
  zoom: number;
  pixelRatio: number;
  overscaling: number;
  collisionBoxArray: CollisionBoxArray;
  sourceLayerIndex: number;
  sourceID: string;
  globalState: Record<string, any>;
};

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type PopulateParameters = Parameters<Bucket["populate"]>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type IndexedFeature = Parameters<Bucket["populate"]>[0][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type BucketFeature = FillBucket["patternFeatures"][number];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type QueryIntersectsFeatureParams = Parameters<NonNullable<StyleLayer["queryIntersectsFeature"]>>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GeoJSONWorkerOptions = GeoJSONSource["workerOptions"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type LoadGeoJSONParameters = RequestResponseMessageMap[MessageType.loadData][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type RTLPluginStatus = PluginState["pluginStatus"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type PluginState = RequestResponseMessageMap[MessageType.syncRTLPluginState][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ClusterIDAndSource = RequestResponseMessageMap[MessageType.getClusterChildren][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GetClusterLeavesParams = RequestResponseMessageMap[MessageType.getClusterLeaves][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GeoJSONWorkerSourceLoadDataResult = RequestResponseMessageMap[MessageType.loadData][1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type RemoveSourceParams = RequestResponseMessageMap[MessageType.removeSource][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type UpdateLayersParameters = RequestResponseMessageMap[MessageType.updateLayers][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GetImagesParameters = RequestResponseMessageMap[MessageType.getImages][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GetGlyphsParameters = RequestResponseMessageMap[MessageType.getGlyphs][0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GetGlyphsResponse = RequestResponseMessageMap[MessageType.getGlyphs][1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GetImagesResponse = RequestResponseMessageMap[MessageType.getImages][1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ActorTarget = Actor["target"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type MessageData = Actor["tasks"][string];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ResolveReject = Actor["resolveRejects"][string];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type MessageHandler<T extends MessageType> = (
  mapId: string | number,
  params: RequestResponseMessageMap[T][0],
  abortController?: AbortController,
) => Promise<RequestResponseMessageMap[T][1]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface DragMovementResult {
  bearingDelta?: number;
  pitchDelta?: number;
  rollDelta?: number;
  around?: Point;
  panDelta?: Point;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface DragPanResult extends DragMovementResult {
  around: Point;
  panDelta: Point;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface DragRotateResult extends DragMovementResult {
  bearingDelta: number;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface DragPitchResult extends DragMovementResult {
  pitchDelta: number;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface DragRollResult extends DragMovementResult {
  rollDelta: number;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface DragMoveHandler<T extends DragMovementResult, E extends Event> extends Handler {
  dragStart: (e: E, point: Point) => void;
  dragMove: (e: E, point: Point) => T | void;
  dragEnd: (e: E) => void;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface MousePanHandler extends DragMoveHandler<DragPanResult, MouseEvent> {}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface MouseRotateHandler extends DragMoveHandler<DragRotateResult, MouseEvent> {}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface MousePitchHandler extends DragMoveHandler<DragPitchResult, MouseEvent> {}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export interface MouseRollHandler extends DragMoveHandler<DragRollResult, MouseEvent> {}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type MapControlsDeltas = Parameters<ICameraHelper["handleMapControlsPan"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CameraForBoxAndBearingHandlerResult = ReturnType<ICameraHelper["cameraForBoxAndBearing"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type EaseToHandlerOptions = Parameters<ICameraHelper["handleEaseTo"]>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type EaseToHandlerResult = ReturnType<ICameraHelper["handleEaseTo"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FlyToHandlerOptions = Parameters<ICameraHelper["handleFlyTo"]>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type FlyToHandlerResult = ReturnType<ICameraHelper["handleFlyTo"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type ICameraHelper = Map$1["cameraHelper"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type EventInProgress = NonNullable<EventsInProgress["zoom"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type EventsInProgress = Parameters<HandlerManager["mergeHandlerResult"]>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type DragRotateHandlerOptions = ConstructorParameters<typeof maplibregl.DragRotateHandler>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type WebGLSupportedVersions = WebGLContextAttributesWithType["contextType"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type CompleteMapOptions = Complete<MapOptions>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type GeoJSONSourceOptions = ConstructorParameters<typeof maplibregl.GeoJSONSource>[1];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
export type VectorTileSourceOptions = ConstructorParameters<typeof maplibregl.VectorTileSource>[1];

// helper types for extracting Prop types

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type __ExtractProps<T> = T extends { _properties: { properties: infer P } } ? P : never;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type __ExtractPropsPossiblyEvaluated<T> = T extends { _values: infer P } ? P : never;

// other MapLibre types needed for the exports above

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Terrain = Map$1["terrain"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Painter = Terrain["painter"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type TerrainTileManager = Terrain["tileManager"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type TileManager = TerrainTileManager["tileManager"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Frustum = ReturnType<IReadonlyTransform["getCameraFrustum"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Aabb = Frustum["aabb"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Framebuffer = ReturnType<Terrain["getFramebuffer"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Texture = ReturnType<Terrain["getCoordsTexture"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Placement = Style["placement"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type GlyphManager = Painter["glyphManager"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type RenderToTexture = Painter["renderToTexture"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type RenderPool = RenderToTexture["pool"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type CollisionIndex = Placement["collisionIndex"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type RGBAImage = StyleImageData["data"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Context = Framebuffer["context"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Program$1 = ReturnType<Painter["useProgram"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type ImageManager = Style["imageManager"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type HandlerManager = Map$1["handlers"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type CircleStyleLayer = Extract<TypedStyleLayer, { paint: { get(name: "circle-color"): any } }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type FillStyleLayer = Extract<TypedStyleLayer, { paint: { get(name: "fill-color"): any } }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type FillExtrusionStyleLayer = Extract<TypedStyleLayer, { paint: { get(name: "fill-extrusion-color"): any } }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type HeatmapStyleLayer = Extract<TypedStyleLayer, { paint: { get(name: "heatmap-color"): any } }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type HillshadeStyleLayer = Extract<TypedStyleLayer, { paint: { get(name: "hillshade-shadow-color"): any } }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type ColorReliefStyleLayer = Extract<TypedStyleLayer, { paint: { get(name: "color-relief-color"): any } }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type LineStyleLayer = Extract<TypedStyleLayer, { paint: { get(name: "line-color"): any } }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type SymbolStyleLayer = Extract<TypedStyleLayer, { paint: { get(name: "icon-color"): any } }>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type CircleBucket = ReturnType<CircleStyleLayer["createBucket"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type FillBucket = ReturnType<FillStyleLayer["createBucket"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type LineBucket = ReturnType<LineStyleLayer["createBucket"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type SymbolBucket = ReturnType<SymbolStyleLayer["createBucket"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Light = Style["light"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Sky = Style["sky"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type CullFaceMode$1 = Parameters<Context["setCullFace"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type DepthMode$1 = Parameters<Context["setDepthMode"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type ColorMode$1 = Parameters<Context["setColorMode"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type StencilMode = Painter["stencilClearMode"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type Viewport = Context["viewport"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type ActiveTextureUnit = Context["activeTexture"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type BlendEquation = Context["blendEquation"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type StencilFunc = Context["stencilFunc"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type StencilOp = Context["stencilOp"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type SymbolInstanceArray = SymbolBucket["symbolInstances"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type TextAnchorOffsetArray = SymbolBucket["textAnchorOffsets"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type SymbolInstanceStruct = ReturnType<SymbolInstanceArray["get"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type TextAnchorOffsetStruct = ReturnType<TextAnchorOffsetArray["get"]>;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type EvaluationParameters = Parameters<Style["update"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type CanonicalTileID = ICanonicalTileID;

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type VertexBuffer = Map$1["painter"]["viewportBuffer"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type SegmentVector = Map$1["painter"]["viewportSegments"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type ProgramConfiguration = Map$1["painter"]["emptyProgramConfiguration"];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
type StructArray = Parameters<VertexBuffer["updateData"]>[0];

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
interface PropertyValue<T, R> {
  property: Property<T, R>;
  value: PropertyValueSpecification<T> | void;
  expression: StylePropertyExpression;
  isDataDriven(): boolean;
  getGlobalStateRefs(): Set<string>;
  possiblyEvaluate(parameters: EvaluationParameters, canonical?: CanonicalTileID, availableImages?: Array<string>): R;
}

/** @deprecated Will be removed from public API in MapTiler SDK v4 */
interface Uniform<T> {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  location: WebGLUniformLocation;
  current: T;
  set(v: T): void;
}
