import { CustomLayerInterface, CustomRenderMethodInput } from 'maplibre-gl';
import { Map as MapSDK } from '../../Map';
import { WebGLContext } from '../../utils/webgl-utils';
import { CubemapDefinition, CubemapFaces, CubemapLayerConstructorOptions } from './types';
declare class CubemapLayer implements CustomLayerInterface {
    id: string;
    type: CustomLayerInterface["type"];
    renderingMode: CustomLayerInterface["renderingMode"];
    /**
     * The map instance to which this layer is added.
     * @type {MapSDK}
     * @private
     */
    private map;
    /**
     * The cubemap faces definition, which can be either a preset, path, or explicit face URLs.
     * @type {CubemapFaces | null}
     * @remarks
     * This property is set during the initialization of the layer and can be updated later.
     * If no faces are defined, it will be `null`.
     */
    private faces?;
    /**
     * Indicates whether to use a cubemap texture for rendering.
     * @type {boolean}
     * @private
     * @default true
     */
    private useCubemapTexture;
    /**
     * The current opacity of the fade effect applied to the cubemap image texture, used for fading in and out.
     * @type {number}
     * @private
     * @default 0.0
     */
    private currentFadeOpacity;
    /**
     * Indicates whether the cubemap needs to be updated, typically when the faces or texture changes.
     * @type {boolean}
     * @private
     * @default false
     */
    private cubeMapNeedsUpdate;
    /**
     * The background color of the cubemap layer, represented as a Vec4 (RGBA).
     * @type {Vec4}
     * @private
     */
    private bgColor;
    /**
     * The previous background color used for transition animations.
     * @type {Vec4}
     * @private
     */
    private previousBgColor;
    /**
     * The target background color to which the layer will transition.
     * @type {Vec4}
     * @private
     */
    private targetBgColor;
    /**
     * The delta value used for transitioning the background color. 0 = start of transition, 1 = end of transition.
     * This value is incremented over time to create a smooth transition effect.
     * @type {number}
     * @private
     */
    private transitionDelta;
    /**
     * The WebGL context used for rendering the cubemap layer.
     * @type {WebGLContext}
     * @private
     */
    private gl;
    /**
     * The cubemap object that contains the shader program, buffers and uniform locations for rendering.
     * @type {Object3D}
     * @private
     */
    private cubemap?;
    /**
     * The WebGL texture used for the cubemap, which is created from the defined faces.
     * This texture is used to render the cubemap in the scene.
     * @type {WebGLTexture | undefined}
     * @private
     */
    private texture?;
    /**
     * The key representing the current faces definition, used to diff / track changes in the cubemap faces.
     * @type {string}
     */
    currentFacesDefinitionKey: string;
    /**
     * The configuration options for the cubemap layer.
     * @type {CubemapLayerConstructorOptions}
     * @private
     */
    private options;
    private animationActive;
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
    constructor(cubemapConfig: CubemapLayerConstructorOptions | true);
    /**
     * Updates the cubemap object with the current faces and shader configuration.
     * This method is called when the cubemap faces change or when the layer is initialized.
     * @returns {void}
     * @remarks
     * It creates a new Object3D instance with the specified vertex and fragment shaders,
     * attributes, and uniforms. The cubemap will be rendered using this configuration.
     */
    updateCubemap({ facesNeedUpdate }?: {
        facesNeedUpdate: boolean;
    }): void;
    /**
     * Called when the layer is added to the map.
     * Initializes the cubemap and sets up the WebGL context.
     *
     * @param {MapSDK} map - The map instance to which this layer is added.
     * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL context used for rendering.
     */
    onAdd(map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void;
    /**
     * Called when the layer is removed from the map.
     * Cleans up the cubemap resources and WebGL buffers.
     *
     * @param {MapSDK} _map - The map instance from which this layer is removed.
     * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL context used for rendering.
     */
    onRemove(_map: MapSDK, gl: WebGLRenderingContext | WebGL2RenderingContext): void;
    /**
     * Updates the cubemap texture with the provided faces.
     * This method is called when the cubemap faces change or when the layer is initialized.
     *
     * @param {WebGLContext} gl - The WebGL context used for rendering.
     * @param {CubemapFaces} faces - The cubemap faces to be loaded into the texture.
     */
    updateTexture(gl: WebGLContext, faces: CubemapFaces): void;
    /**
     * Called before the layer is rendered.
     * Updates the cubemap texture with the current faces.
     *
     * @param {WebGLContext} gl - The WebGL context used for rendering.
     * @param {CustomRenderMethodInput} _options - Additional options for the render method.
     */
    prerender(_gl: WebGLContext, _options: CustomRenderMethodInput): void;
    /**
     * Lerps the background color transition of the cubemap layer.
     * This method smoothly transitions the background color from the previous color to the target color.
     *
     * @private
     */
    private animateColorChange;
    /**
     * Animates the cubemap image fading in.
     * This method gradually increases the opacity of the cubemap image to create a fade-in effect.
     *
     * @private
     */
    private imageIsAnimating;
    /**
     * The delta value used for the image fade-in animation.
     * This value is incremented over time to create a smooth fade-in effect.
     * @type {number}
     * @private
     */
    private imageFadeInDelta;
    /**
     * Animates the cubemap image fading in.
     * This method gradually increases the opacity of the cubemap image to create a fade-in effect.
     * @private
     */
    private animateIn;
    /**
     * Animates the cubemap image fading out.
     * This method gradually decreases the opacity of the cubemap image to create a fade-out effect.
     * @returns {Promise<void>} A promise that resolves when the animation is complete.
     * @private
     */
    private animateOut;
    private fireEvent;
    setAnimationActive(active: boolean): void;
    /**
     * Renders the cubemap layer to the WebGL context.
     * This method is called internally during the rendering phase of the map.
     *
     * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - The WebGL context used for rendering.
     * @param {CustomRenderMethodInput} _options - Additional options for the render method.
     * @throws Error if the map, cubemap, or texture is undefined.
     */
    render(gl: WebGLRenderingContext | WebGL2RenderingContext, _options: CustomRenderMethodInput): void;
    private setBgColor;
    /**
     * Returns the current configuration options for the cubemap layer.
     * @returns {CubemapLayerConstructorOptions} The current configuration options.
     */
    getConfig(): CubemapLayerConstructorOptions;
    /**
     * Checks if the cubemap needs to be updated based on the provided specification.
     *
     * @param {CubemapDefinition} spec - The cubemap specification to compare with the current cubemap.
     * @returns {boolean} True if the cubemap needs to be updated, false otherwise.
     */
    shouldUpdate(newSpec?: CubemapDefinition | boolean): boolean;
    private setCubemapFaces;
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
    setCubemap(spec: CubemapDefinition | boolean): Promise<void>;
    /**
     * Shows the cubemap layer by setting its visibility to "visible".
     * This method is used to make the cubemap layer visible on the map.
     */
    show(): void;
    /**
     * Hides the cubemap layer by setting its visibility to "none".
     * This method is used to remove the cubemap layer from the map without deleting it.
     */
    hide(): void;
}
export declare function validateSpaceSpecification(space?: CubemapDefinition | boolean): string[];
export { CubemapLayer };
