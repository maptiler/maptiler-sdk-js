export type RgbaColor = [number, number, number] | [number, number, number, number];
export type ColorStop = {
    /**
     * The "value" at which this ColorStop should be applied.
     */
    value: number;
    /**
     * RGB[A] - Array of 3-4 numbers. 0-255 per channel.
     */
    color: RgbaColor;
};
/**
 * A RGBA color as per the array definition
 */
export type ArrayColor = [number, number, number, number];
/**
 * A color ramp stop as per array definition
 */
export type ArrayColorRampStop = [
    /**
     * Real world value in a real world unit
     */
    number,
    /**
     * Color RGBA
     */
    ArrayColor
];
/**
 * A color ramp as per array definition
 */
export type ArrayColorRamp = Array<ArrayColorRampStop>;
export type ColorRampOptions = {
    /**
     * The value the colorramp starts
     */
    min?: number;
    /**
     * The value the colorramp ends
     */
    max?: number;
    /**
     * Some color stops to copy from
     */
    stops?: Array<ColorStop>;
};
export declare class ColorRamp extends Array<ColorStop> {
    /**
     * Converts a array-definition color ramp definition into a usable ColorRamp instance.
     * Note: units are not converted and may need to to be converted beforehand (eg. kelvin to centigrade)
     * @param cr
     * @returns
     */
    static fromArrayDefinition(cr: ArrayColorRamp): ColorRamp;
    private min;
    private max;
    constructor(options?: ColorRampOptions);
    setStops(stops: Array<ColorStop>, options?: {
        clone?: boolean;
    }): ColorRamp;
    scale(min: number, max: number, options?: {
        clone?: boolean;
    }): ColorRamp;
    at(pos: number): ColorStop;
    clone(): ColorRamp;
    getRawColorStops(): Array<ColorStop>;
    reverse(options?: {
        clone?: boolean;
    }): ColorRamp;
    getBounds(): {
        min: number;
        max: number;
    };
    getColor(value: number, options?: {
        smooth?: boolean;
    }): RgbaColor;
    /**
     * Get the color as an hexadecimal string
     */
    getColorHex(value: number, options?: {
        smooth?: boolean;
        withAlpha?: boolean;
    }): string;
    /**
     * Get the color of the color ramp at a relative position in [0, 1]
     */
    getColorRelative(value: number, options?: {
        smooth?: boolean;
    }): RgbaColor;
    getCanvasStrip(options?: {
        horizontal?: boolean;
        size?: number;
        smooth?: boolean;
    }): HTMLCanvasElement;
    /**
     * Apply a non-linear ressampling. This will create a new instance of ColorRamp with the same bounds.
     */
    resample(method: "ease-in-square" | "ease-out-square" | "ease-in-sqrt" | "ease-out-sqrt" | "ease-in-exp" | "ease-out-exp", samples?: number): ColorRamp;
    /**
     * Makes a clone of this color ramp that is fully transparant at the begining of their range
     */
    transparentStart(): ColorRamp;
    /**
     * Check if this color ramp has a transparent start
     */
    hasTransparentStart(): boolean;
}
/**
 * This is a collection of built-in color ramps. They are all defined in the range [0, 1]
 * but can be scaled or reversed to fit specific usages.
 */
export declare const ColorRampCollection: {
    /**
     * A fully transparent [0, 0, 0, 0] colorramp to hide data.
     * Defined in interval [0, 1], without unit.
     */
    NULL: ColorRamp;
    GRAY: ColorRamp;
    /**
     * Classic jet color ramp.
     * Defined in interval [0, 1], without unit.
     */
    JET: ColorRamp;
    /**
     * Classic HSV color ramp (hue, saturation, value).
     * Defined in interval [0, 1], without unit.
     */
    HSV: ColorRamp;
    /**
     * Classic hot color ramp.
     * Defined in interval [0, 1], without unit.
     */
    HOT: ColorRamp;
    /**
     * Classic spring color ramp.
     * Defined in interval [0, 1], without unit.
     */
    SPRING: ColorRamp;
    /**
     * Classic summer color ramp.
     * Defined in interval [0, 1], without unit.
     */
    SUMMER: ColorRamp;
    /**
     * Classic autommn color ramp.
     * Defined in interval [0, 1], without unit.
     */
    AUTOMN: ColorRamp;
    /**
     * Classic winter color ramp.
     * Defined in interval [0, 1], without unit.
     */
    WINTER: ColorRamp;
    /**
     * Classic bone color ramp.
     * Defined in interval [0, 1], without unit.
     */
    BONE: ColorRamp;
    /**
     * Classic copper color ramp.
     * Defined in interval [0, 1], without unit.
     */
    COPPER: ColorRamp;
    /**
     * Classic greys color ramp.
     * Defined in interval [0, 1], without unit.
     */
    GREYS: ColorRamp;
    /**
     * Classic yignbu color ramp (blue to light yellow).
     * Defined in interval [0, 1], without unit.
     */
    YIGNBU: ColorRamp;
    /**
     * Classic greens color ramp.
     * Defined in interval [0, 1], without unit.
     */
    GREENS: ColorRamp;
    /**
     * Classic yiorrd color ramp (red to light yellow).
     * Defined in interval [0, 1], without unit.
     */
    YIORRD: ColorRamp;
    /**
     * Classic blue-red color ramp.
     * Defined in interval [0, 1], without unit.
     */
    BLUERED: ColorRamp;
    /**
     * Classic rdbu color ramp.
     * Defined in interval [0, 1], without unit.
     */
    RDBU: ColorRamp;
    /**
     * Classic picnic color ramp.
     * Defined in interval [0, 1], without unit.
     */
    PICNIC: ColorRamp;
    /**
     * Classic rainbow color ramp.
     * Defined in interval [0, 1], without unit.
     */
    RAINBOW: ColorRamp;
    /**
     * Classic Portland color ramp.
     * Defined in interval [0, 1], without unit.
     */
    PORTLAND: ColorRamp;
    /**
     * Classic blackbody color ramp.
     * Defined in interval [0, 1], without unit.
     */
    BLACKBODY: ColorRamp;
    /**
     * Classic earth color ramp.
     * Defined in interval [0, 1], without unit.
     */
    EARTH: ColorRamp;
    /**
     * Classic electric color ramp.
     * Defined in interval [0, 1], without unit.
     */
    ELECTRIC: ColorRamp;
    /**
     * Classic viridis color ramp.
     * Defined in interval [0, 1], without unit.
     */
    VIRIDIS: ColorRamp;
    /**
     * Classic inferno color ramp.
     * Defined in interval [0, 1], without unit.
     */
    INFERNO: ColorRamp;
    /**
     * Classic magma color ramp.
     * Defined in interval [0, 1], without unit.
     */
    MAGMA: ColorRamp;
    /**
     * Classic plasma color ramp.
     * Defined in interval [0, 1], without unit.
     */
    PLASMA: ColorRamp;
    /**
     * Classic warm color ramp.
     * Defined in interval [0, 1], without unit.
     */
    WARM: ColorRamp;
    /**
     * Classic cool color ramp.
     * Defined in interval [0, 1], without unit.
     */
    COOL: ColorRamp;
    /**
     * Classic rainboz soft color ramp.
     * Defined in interval [0, 1], without unit.
     */
    RAINBOW_SOFT: ColorRamp;
    /**
     * Classic bathymetry color ramp.
     * Defined in interval [0, 1], without unit.
     */
    BATHYMETRY: ColorRamp;
    /**
     * Classic cdom color ramp.
     * Defined in interval [0, 1], without unit.
     */
    CDOM: ColorRamp;
    /**
     * Classic chlorophyll color ramp.
     * Defined in interval [0, 1], without unit.
     */
    CHLOROPHYLL: ColorRamp;
    /**
     * Classic density color ramp.
     * Defined in interval [0, 1], without unit.
     */
    DENSITY: ColorRamp;
    /**
     * Classic freesurface blue color ramp.
     * Defined in interval [0, 1], without unit.
     */
    FREESURFACE_BLUE: ColorRamp;
    /**
     * Classic freesurface red color ramp.
     * Defined in interval [0, 1], without unit.
     */
    FREESURFACE_RED: ColorRamp;
    /**
     * Classic oxygen color ramp.
     * Defined in interval [0, 1], without unit.
     */
    OXYGEN: ColorRamp;
    /**
     * Classic par color ramp.
     * Defined in interval [0, 1], without unit.
     */
    PAR: ColorRamp;
    /**
     * Classic phase color ramp.
     * Defined in interval [0, 1], without unit.
     */
    PHASE: ColorRamp;
    /**
     * Classic salinity color ramp.
     * Defined in interval [0, 1], without unit.
     */
    SALINITY: ColorRamp;
    /**
     * Classic temperature color ramp.
     * Defined in interval [0, 1], without unit.
     */
    TEMPERATURE: ColorRamp;
    /**
     * Classic turbidity color ramp.
     * Defined in interval [0, 1], without unit.
     */
    TURBIDITY: ColorRamp;
    /**
     * Classic velocity blue color ramp.
     * Defined in interval [0, 1], without unit.
     */
    VELOCITY_BLUE: ColorRamp;
    /**
     * Classic velocity green color ramp.
     * Defined in interval [0, 1], without unit.
     */
    VELOCITY_GREEN: ColorRamp;
    /**
     * Classic cube helix color ramp.
     * Defined in interval [0, 1], without unit.
     */
    CUBEHELIX: ColorRamp;
    /**
     * The cividis color ramp is color blind friendly.
     * Read more here https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0199239
     * Defined in interval [0, 1], without unit.
     */
    CIVIDIS: ColorRamp;
    /**
     * Classic turbo color ramp.
     * This is a luminance-constant alternative to the jet, making it more
     * clor-blind friendly.
     * Defined in interval [0, 1], without unit.
     */
    TURBO: ColorRamp;
    /**
     * The rocket color ramp is perceptually uniform, which makes it more
     * color bliend friendly than the classic magma color ramp.
     * Defined in interval [0, 1], without unit.
     */
    ROCKET: ColorRamp;
    /**
     * The mako color ramp is perceptually uniform and can be seen as
     * a color blind friendly alternative to bathymetry or yignbu.
     * Defined in interval [0, 1], without unit.
     */
    MAKO: ColorRamp;
};
