export type RgbaColor =
  | [number, number, number]
  | [number, number, number, number];

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
  ArrayColor,
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

function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb: RgbaColor): string {
  return (
    "#" +
    componentToHex(rgb[0]) +
    componentToHex(rgb[1]) +
    componentToHex(rgb[2]) +
    (rgb.length === 4 ? componentToHex(rgb[3]) : "")
  );
}

export class ColorRamp extends Array<ColorStop> {
  /**
   * Converts a array-definition color ramp definition into a usable ColorRamp instance.
   * Note: units are not converted and may need to to be converted beforehand (eg. kelvin to centigrade)
   * @param cr
   * @returns
   */
  static fromArrayDefinition(cr: ArrayColorRamp): ColorRamp {
    return new ColorRamp({
      stops: cr.map((cs: ArrayColorRampStop) => ({
        value: cs[0],
        color: cs[1],
      })),
    });
  }

  private min = 0;
  private max = 1;

  constructor(options: ColorRampOptions = {}) {
    super();

    if ("min" in options) {
      this.min = options.min as number;
    }

    if ("max" in options) {
      this.max = options.max as number;
    }

    if ("stops" in options) {
      this.setStops(options.stops as ColorStop[], { clone: false });
    }
  }

  setStops(
    stops: Array<ColorStop>,
    options: { clone?: boolean } = { clone: true },
  ): ColorRamp {
    const colorRamp = options.clone ? this.clone() : this;

    colorRamp.length = 0;

    let min = +Infinity;
    let max = -Infinity;

    for (let i = 0; i < stops.length; i += 1) {
      min = Math.min(min, stops[i].value);
      max = Math.max(max, stops[i].value);

      colorRamp.push({
        value: stops[i].value,
        color: stops[i].color.slice(), // we want to make sure we do a deep copy and not a reference
      } as ColorStop);
    }

    colorRamp.sort((a: ColorStop, b: ColorStop) =>
      a.value < b.value ? -1 : 1,
    );

    this.min = min;
    this.max = max;

    return colorRamp;
  }

  scale(
    min: number,
    max: number,
    options: { clone?: boolean } = { clone: true },
  ): ColorRamp {
    const clone = options.clone;

    const currentMin = this[0].value;
    const currentMax = this.at(-1).value;
    const currentSpan = currentMax - currentMin;
    const newSpan = max - min;
    const stops = [];

    for (let i = 0; i < this.length; i += 1) {
      const currentValue = this[i].value;
      const normalizedValue = (currentValue - currentMin) / currentSpan; // putting the value in the interval [0, 1]
      const newValue = normalizedValue * newSpan + min; // putting the value in the new interval

      if (clone) {
        stops.push({
          value: newValue,
          color: this[i].color.slice(),
        } as ColorStop);
      } else {
        this[i].value = newValue;
      }
    }

    return clone ? new ColorRamp({ stops }) : this;
  }

  // for some reason, I had to reimplement this
  at(pos: number) {
    if (pos < 0) {
      return this[this.length + pos];
    } else {
      return this[pos];
    }
  }

  clone(): ColorRamp {
    return new ColorRamp({ stops: this.getRawColorStops() });
  }

  getRawColorStops(): Array<ColorStop> {
    const stops = [];

    for (let i = 0; i < this.length; i += 1) {
      stops.push({ value: this[i].value, color: this[i].color });
    }

    return stops;
  }

  reverse(options: { clone?: boolean } = { clone: true }): ColorRamp {
    const colorRamp = options.clone ? this.clone() : this;

    for (let i = 0; i < ~~(colorRamp.length / 2); i += 1) {
      const c = colorRamp[i].color;
      colorRamp[i].color = colorRamp.at(-(i + 1)).color;
      colorRamp.at(-(i + 1)).color = c;
    }
    return colorRamp;
  }

  getBounds(): { min: number; max: number } {
    return { min: this.min, max: this.max };
  }

  getColor(
    value: number,
    options: { smooth?: boolean } = { smooth: true },
  ): RgbaColor {
    if (value <= this[0].value) {
      return this[0].color;
    }

    if (value >= this.at(-1).value) {
      return this.at(-1).color;
    }

    for (let i = 0; i < this.length - 1; i += 1) {
      if (value > this[i + 1].value) {
        continue;
      }

      const colorBefore = this[i].color;

      if (!options.smooth) {
        return colorBefore.slice() as RgbaColor;
      }

      const valueBefore = this[i].value;
      const valueAfter = this[i + 1].value;
      const colorAfter = this[i + 1].color;

      const beforeRatio = (valueAfter - value) / (valueAfter - valueBefore);
      return colorBefore.map((chan, i) =>
        Math.round(chan * beforeRatio + colorAfter[i] * (1 - beforeRatio)),
      ) as RgbaColor;
    }

    return [0, 0, 0] as RgbaColor;
  }

  /**
   * Get the color as an hexadecimal string
   */
  getColorHex(
    value: number,
    options: { smooth?: boolean; withAlpha?: boolean } = {
      smooth: true,
      withAlpha: false,
    },
  ): string {
    return rgbToHex(this.getColor(value, options));
  }

  /**
   * Get the color of the color ramp at a relative position in [0, 1]
   */
  getColorRelative(
    value: number,
    options: { smooth?: boolean } = { smooth: true },
  ): RgbaColor {
    const bounds = this.getBounds();
    return this.getColor(
      bounds.min + value * (bounds.max - bounds.min),
      options,
    );
  }

  getCanvasStrip(
    options: { horizontal?: boolean; size?: number; smooth?: boolean } = {
      horizontal: true,
      size: 512,
      smooth: true,
    },
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = options.horizontal ? (options.size as number) : 1;
    canvas.height = options.horizontal ? 1 : (options.size as number);

    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Canvs context is missing");

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const imageDataArray = imageData.data;

    const size = options.size as number;
    const startValue = this[0].value;
    const endValue = this.at(-1).value;
    const valueSpan = endValue - startValue;
    const valueStep = valueSpan / size;

    for (let i = 0; i < size; i += 1) {
      const color = this.getColor(startValue + i * valueStep, {
        smooth: options.smooth,
      });
      imageDataArray[i * 4] = color[0];
      imageDataArray[i * 4 + 1] = color[1];
      imageDataArray[i * 4 + 2] = color[2];
      imageDataArray[i * 4 + 3] = color.length > 3 ? (color[3] as number) : 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Apply a non-linear ressampling. This will create a new instance of ColorRamp with the same bounds.
   */
  resample(
    method:
      | "ease-in-square"
      | "ease-out-square"
      | "ease-in-sqrt"
      | "ease-out-sqrt"
      | "ease-in-exp"
      | "ease-out-exp",
    samples = 15,
  ): ColorRamp {
    const inputBounds = this.getBounds();
    const inputNormalized = this.scale(0, 1);
    const step = 1 / (samples - 1);

    let stops;

    if (method === "ease-in-square") {
      stops = Array.from({ length: samples }, (_, i) => {
        const x = i * step;
        const y = Math.pow(x, 2);
        const color = inputNormalized.getColor(y);
        return { value: x, color };
      });
    } else if (method === "ease-out-square") {
      stops = Array.from({ length: samples }, (_, i) => {
        const x = i * step;
        const y = 1 - Math.pow(1 - x, 2);
        const color = inputNormalized.getColor(y);
        return { value: x, color };
      });
    } else if (method === "ease-out-sqrt") {
      stops = Array.from({ length: samples }, (_, i) => {
        const x = i * step;
        const y = Math.pow(x, 0.5);
        const color = inputNormalized.getColor(y);
        return { value: x, color };
      });
    } else if (method === "ease-in-sqrt") {
      stops = Array.from({ length: samples }, (_, i) => {
        const x = i * step;
        const y = 1 - Math.pow(1 - x, 0.5);
        const color = inputNormalized.getColor(y);
        return { value: x, color };
      });
    } else if (method === "ease-out-exp") {
      stops = Array.from({ length: samples }, (_, i) => {
        const x = i * step;
        const y = 1 - Math.pow(2, -10 * x);
        const color = inputNormalized.getColor(y);
        return { value: x, color };
      });
    } else if (method === "ease-in-exp") {
      stops = Array.from({ length: samples }, (_, i) => {
        const x = i * step;
        const y = Math.pow(2, 10 * x - 10);
        const color = inputNormalized.getColor(y);
        return { value: x, color };
      });
    } else {
      throw new Error("Invalid ressampling method.");
    }

    const outputNormalized = new ColorRamp({ stops });
    const output = outputNormalized.scale(inputBounds.min, inputBounds.max);
    return output;
  }

  /**
   * Makes a clone of this color ramp that is fully transparant at the begining of their range
   */
  transparentStart(): ColorRamp {
    const stops = this.getRawColorStops();
    stops.unshift({
      value: stops[0].value,
      color: stops[0].color.slice() as RgbaColor,
    });
    stops[1].value += 0.001;

    stops.forEach((s) => {
      if (s.color.length === 3) {
        s.color.push(255);
      }
    });

    stops[0].color[3] = 0;

    return new ColorRamp({ stops });
  }

  /**
   * Check if this color ramp has a transparent start
   */
  hasTransparentStart(): boolean {
    return this[0].color.length === 4 && this[0].color[3] === 0;
  }
}

/**
 * This is a collection of built-in color ramps. They are all defined in the range [0, 1]
 * but can be scaled or reversed to fit specific usages.
 */
export const ColorRampCollection = {
  /**
   * A fully transparent [0, 0, 0, 0] colorramp to hide data.
   * Defined in interval [0, 1], without unit.
   */
  NULL: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 0, 0] },
      { value: 1, color: [0, 0, 0, 0] },
    ],
  }),

  GRAY: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 1, color: [255, 255, 255] },
    ],
  }),

  /**
   * Classic jet color ramp.
   * Defined in interval [0, 1], without unit.
   */
  JET: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 131] },
      { value: 0.125, color: [0, 60, 170] },
      { value: 0.375, color: [5, 255, 255] },
      { value: 0.625, color: [255, 255, 0] },
      { value: 0.875, color: [250, 0, 0] },
      { value: 1, color: [128, 0, 0] },
    ],
  }),

  /**
   * Classic HSV color ramp (hue, saturation, value).
   * Defined in interval [0, 1], without unit.
   */
  HSV: new ColorRamp({
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
      { value: 1, color: [255, 0, 6] },
    ],
  }),

  /**
   * Classic hot color ramp.
   * Defined in interval [0, 1], without unit.
   */
  HOT: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.3, color: [230, 0, 0] },
      { value: 0.6, color: [255, 210, 0] },
      { value: 1, color: [255, 255, 255] },
    ],
  }),

  /**
   * Classic spring color ramp.
   * Defined in interval [0, 1], without unit.
   */
  SPRING: new ColorRamp({
    stops: [
      { value: 0, color: [255, 0, 255] },
      { value: 1, color: [255, 255, 0] },
    ],
  }),

  /**
   * Classic summer color ramp.
   * Defined in interval [0, 1], without unit.
   */
  SUMMER: new ColorRamp({
    stops: [
      { value: 0, color: [0, 128, 102] },
      { value: 1, color: [255, 255, 102] },
    ],
  }),

  /**
   * Classic autommn color ramp.
   * Defined in interval [0, 1], without unit.
   */
  AUTOMN: new ColorRamp({
    stops: [
      { value: 0, color: [255, 0, 0] },
      { value: 1, color: [255, 255, 0] },
    ],
  }),

  /**
   * Classic winter color ramp.
   * Defined in interval [0, 1], without unit.
   */
  WINTER: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 255] },
      { value: 1, color: [0, 255, 128] },
    ],
  }),

  /**
   * Classic bone color ramp.
   * Defined in interval [0, 1], without unit.
   */
  BONE: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.376, color: [84, 84, 116] },
      { value: 0.753, color: [169, 200, 200] },
      { value: 1, color: [255, 255, 255] },
    ],
  }),

  /**
   * Classic copper color ramp.
   * Defined in interval [0, 1], without unit.
   */
  COPPER: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.804, color: [255, 160, 102] },
      { value: 1, color: [255, 199, 127] },
    ],
  }),

  /**
   * Classic greys color ramp.
   * Defined in interval [0, 1], without unit.
   */
  GREYS: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 1, color: [255, 255, 255] },
    ],
  }),

  /**
   * Classic yignbu color ramp (blue to light yellow).
   * Defined in interval [0, 1], without unit.
   */
  YIGNBU: new ColorRamp({
    stops: [
      { value: 0, color: [8, 29, 88] },
      { value: 0.125, color: [37, 52, 148] },
      { value: 0.25, color: [34, 94, 168] },
      { value: 0.375, color: [29, 145, 192] },
      { value: 0.5, color: [65, 182, 196] },
      { value: 0.625, color: [127, 205, 187] },
      { value: 0.75, color: [199, 233, 180] },
      { value: 0.875, color: [237, 248, 217] },
      { value: 1, color: [255, 255, 217] },
    ],
  }),

  /**
   * Classic greens color ramp.
   * Defined in interval [0, 1], without unit.
   */
  GREENS: new ColorRamp({
    stops: [
      { value: 0, color: [0, 68, 27] },
      { value: 0.125, color: [0, 109, 44] },
      { value: 0.25, color: [35, 139, 69] },
      { value: 0.375, color: [65, 171, 93] },
      { value: 0.5, color: [116, 196, 118] },
      { value: 0.625, color: [161, 217, 155] },
      { value: 0.75, color: [199, 233, 192] },
      { value: 0.875, color: [229, 245, 224] },
      { value: 1, color: [247, 252, 245] },
    ],
  }),

  /**
   * Classic yiorrd color ramp (red to light yellow).
   * Defined in interval [0, 1], without unit.
   */
  YIORRD: new ColorRamp({
    stops: [
      { value: 0, color: [128, 0, 38] },
      { value: 0.125, color: [189, 0, 38] },
      { value: 0.25, color: [227, 26, 28] },
      { value: 0.375, color: [252, 78, 42] },
      { value: 0.5, color: [253, 141, 60] },
      { value: 0.625, color: [254, 178, 76] },
      { value: 0.75, color: [254, 217, 118] },
      { value: 0.875, color: [255, 237, 160] },
      { value: 1, color: [255, 255, 204] },
    ],
  }),

  /**
   * Classic blue-red color ramp.
   * Defined in interval [0, 1], without unit.
   */
  BLUERED: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 255] },
      { value: 1, color: [255, 0, 0] },
    ],
  }),

  /**
   * Classic rdbu color ramp.
   * Defined in interval [0, 1], without unit.
   */
  RDBU: new ColorRamp({
    stops: [
      { value: 0, color: [5, 10, 172] },
      { value: 0.35, color: [106, 137, 247] },
      { value: 0.5, color: [190, 190, 190] },
      { value: 0.6, color: [220, 170, 132] },
      { value: 0.7, color: [230, 145, 90] },
      { value: 1, color: [178, 10, 28] },
    ],
  }),

  /**
   * Classic picnic color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PICNIC: new ColorRamp({
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
      { value: 1, color: [255, 0, 0] },
    ],
  }),

  /**
   * Classic rainbow color ramp.
   * Defined in interval [0, 1], without unit.
   */
  RAINBOW: new ColorRamp({
    stops: [
      { value: 0, color: [150, 0, 90] },
      { value: 0.125, color: [0, 0, 200] },
      { value: 0.25, color: [0, 25, 255] },
      { value: 0.375, color: [0, 152, 255] },
      { value: 0.5, color: [44, 255, 150] },
      { value: 0.625, color: [151, 255, 0] },
      { value: 0.75, color: [255, 234, 0] },
      { value: 0.875, color: [255, 111, 0] },
      { value: 1, color: [255, 0, 0] },
    ],
  }),

  /**
   * Classic Portland color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PORTLAND: new ColorRamp({
    stops: [
      { value: 0, color: [12, 51, 131] },
      { value: 0.25, color: [10, 136, 186] },
      { value: 0.5, color: [242, 211, 56] },
      { value: 0.75, color: [242, 143, 56] },
      { value: 1, color: [217, 30, 30] },
    ],
  }),

  /**
   * Classic blackbody color ramp.
   * Defined in interval [0, 1], without unit.
   */
  BLACKBODY: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.2, color: [230, 0, 0] },
      { value: 0.4, color: [230, 210, 0] },
      { value: 0.7, color: [255, 255, 255] },
      { value: 1, color: [160, 200, 255] },
    ],
  }),

  /**
   * Classic earth color ramp.
   * Defined in interval [0, 1], without unit.
   */
  EARTH: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 130] },
      { value: 0.1, color: [0, 180, 180] },
      { value: 0.2, color: [40, 210, 40] },
      { value: 0.4, color: [230, 230, 50] },
      { value: 0.6, color: [120, 70, 20] },
      { value: 1, color: [255, 255, 255] },
    ],
  }),

  /**
   * Classic electric color ramp.
   * Defined in interval [0, 1], without unit.
   */
  ELECTRIC: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 0] },
      { value: 0.15, color: [30, 0, 100] },
      { value: 0.4, color: [120, 0, 100] },
      { value: 0.6, color: [160, 90, 0] },
      { value: 0.8, color: [230, 200, 0] },
      { value: 1, color: [255, 250, 220] },
    ],
  }),

  /**
   * Classic viridis color ramp.
   * Defined in interval [0, 1], without unit.
   */
  VIRIDIS: new ColorRamp({
    stops: [
      { value: 0, color: [68, 1, 84] },
      { value: 0.13, color: [71, 44, 122] },
      { value: 0.25, color: [59, 81, 139] },
      { value: 0.38, color: [44, 113, 142] },
      { value: 0.5, color: [33, 144, 141] },
      { value: 0.63, color: [39, 173, 129] },
      { value: 0.75, color: [92, 200, 99] },
      { value: 0.88, color: [170, 220, 50] },
      { value: 1, color: [253, 231, 37] },
    ],
  }),

  /**
   * Classic inferno color ramp.
   * Defined in interval [0, 1], without unit.
   */
  INFERNO: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 4] },
      { value: 0.13, color: [31, 12, 72] },
      { value: 0.25, color: [85, 15, 109] },
      { value: 0.38, color: [136, 34, 106] },
      { value: 0.5, color: [186, 54, 85] },
      { value: 0.63, color: [227, 89, 51] },
      { value: 0.75, color: [249, 140, 10] },
      { value: 0.88, color: [249, 201, 50] },
      { value: 1, color: [252, 255, 164] },
    ],
  }),

  /**
   * Classic magma color ramp.
   * Defined in interval [0, 1], without unit.
   */
  MAGMA: new ColorRamp({
    stops: [
      { value: 0, color: [0, 0, 4] },
      { value: 0.13, color: [28, 16, 68] },
      { value: 0.25, color: [79, 18, 123] },
      { value: 0.38, color: [129, 37, 129] },
      { value: 0.5, color: [181, 54, 122] },
      { value: 0.63, color: [229, 80, 100] },
      { value: 0.75, color: [251, 135, 97] },
      { value: 0.88, color: [254, 194, 135] },
      { value: 1, color: [252, 253, 191] },
    ],
  }),

  /**
   * Classic plasma color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PLASMA: new ColorRamp({
    stops: [
      { value: 0, color: [13, 8, 135] },
      { value: 0.13, color: [75, 3, 161] },
      { value: 0.25, color: [125, 3, 168] },
      { value: 0.38, color: [168, 34, 150] },
      { value: 0.5, color: [203, 70, 121] },
      { value: 0.63, color: [229, 107, 93] },
      { value: 0.75, color: [248, 148, 65] },
      { value: 0.88, color: [253, 195, 40] },
      { value: 1, color: [240, 249, 33] },
    ],
  }),

  /**
   * Classic warm color ramp.
   * Defined in interval [0, 1], without unit.
   */
  WARM: new ColorRamp({
    stops: [
      { value: 0, color: [125, 0, 179] },
      { value: 0.13, color: [172, 0, 187] },
      { value: 0.25, color: [219, 0, 170] },
      { value: 0.38, color: [255, 0, 130] },
      { value: 0.5, color: [255, 63, 74] },
      { value: 0.63, color: [255, 123, 0] },
      { value: 0.75, color: [234, 176, 0] },
      { value: 0.88, color: [190, 228, 0] },
      { value: 1, color: [147, 255, 0] },
    ],
  }),

  /**
   * Classic cool color ramp.
   * Defined in interval [0, 1], without unit.
   */
  COOL: new ColorRamp({
    stops: [
      { value: 0, color: [125, 0, 179] },
      { value: 0.13, color: [116, 0, 218] },
      { value: 0.25, color: [98, 74, 237] },
      { value: 0.38, color: [68, 146, 231] },
      { value: 0.5, color: [0, 204, 197] },
      { value: 0.63, color: [0, 247, 146] },
      { value: 0.75, color: [0, 255, 88] },
      { value: 0.88, color: [40, 255, 8] },
      { value: 1, color: [147, 255, 0] },
    ],
  }),

  /**
   * Classic rainboz soft color ramp.
   * Defined in interval [0, 1], without unit.
   */
  RAINBOW_SOFT: new ColorRamp({
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
      { value: 1, color: [124, 0, 186] },
    ],
  }),

  /**
   * Classic bathymetry color ramp.
   * Defined in interval [0, 1], without unit.
   */
  BATHYMETRY: new ColorRamp({
    stops: [
      { value: 0, color: [40, 26, 44] },
      { value: 0.13, color: [59, 49, 90] },
      { value: 0.25, color: [64, 76, 139] },
      { value: 0.38, color: [63, 110, 151] },
      { value: 0.5, color: [72, 142, 158] },
      { value: 0.63, color: [85, 174, 163] },
      { value: 0.75, color: [120, 206, 163] },
      { value: 0.88, color: [187, 230, 172] },
      { value: 1, color: [253, 254, 204] },
    ],
  }),

  /**
   * Classic cdom color ramp.
   * Defined in interval [0, 1], without unit.
   */
  CDOM: new ColorRamp({
    stops: [
      { value: 0, color: [47, 15, 62] },
      { value: 0.13, color: [87, 23, 86] },
      { value: 0.25, color: [130, 28, 99] },
      { value: 0.38, color: [171, 41, 96] },
      { value: 0.5, color: [206, 67, 86] },
      { value: 0.63, color: [230, 106, 84] },
      { value: 0.75, color: [242, 149, 103] },
      { value: 0.88, color: [249, 193, 135] },
      { value: 1, color: [254, 237, 176] },
    ],
  }),

  /**
   * Classic chlorophyll color ramp.
   * Defined in interval [0, 1], without unit.
   */
  CHLOROPHYLL: new ColorRamp({
    stops: [
      { value: 0, color: [18, 36, 20] },
      { value: 0.13, color: [25, 63, 41] },
      { value: 0.25, color: [24, 91, 59] },
      { value: 0.38, color: [13, 119, 72] },
      { value: 0.5, color: [18, 148, 80] },
      { value: 0.63, color: [80, 173, 89] },
      { value: 0.75, color: [132, 196, 122] },
      { value: 0.88, color: [175, 221, 162] },
      { value: 1, color: [215, 249, 208] },
    ],
  }),

  /**
   * Classic density color ramp.
   * Defined in interval [0, 1], without unit.
   */
  DENSITY: new ColorRamp({
    stops: [
      { value: 0, color: [54, 14, 36] },
      { value: 0.13, color: [89, 23, 80] },
      { value: 0.25, color: [110, 45, 132] },
      { value: 0.38, color: [120, 77, 178] },
      { value: 0.5, color: [120, 113, 213] },
      { value: 0.63, color: [115, 151, 228] },
      { value: 0.75, color: [134, 185, 227] },
      { value: 0.88, color: [177, 214, 227] },
      { value: 1, color: [230, 241, 241] },
    ],
  }),

  /**
   * Classic freesurface blue color ramp.
   * Defined in interval [0, 1], without unit.
   */
  FREESURFACE_BLUE: new ColorRamp({
    stops: [
      { value: 0, color: [30, 4, 110] },
      { value: 0.13, color: [47, 14, 176] },
      { value: 0.25, color: [41, 45, 236] },
      { value: 0.38, color: [25, 99, 212] },
      { value: 0.5, color: [68, 131, 200] },
      { value: 0.63, color: [114, 156, 197] },
      { value: 0.75, color: [157, 181, 203] },
      { value: 0.88, color: [200, 208, 216] },
      { value: 1, color: [241, 237, 236] },
    ],
  }),

  /**
   * Classic freesurface red color ramp.
   * Defined in interval [0, 1], without unit.
   */
  FREESURFACE_RED: new ColorRamp({
    stops: [
      { value: 0, color: [60, 9, 18] },
      { value: 0.13, color: [100, 17, 27] },
      { value: 0.25, color: [142, 20, 29] },
      { value: 0.38, color: [177, 43, 27] },
      { value: 0.5, color: [192, 87, 63] },
      { value: 0.63, color: [205, 125, 105] },
      { value: 0.75, color: [216, 162, 148] },
      { value: 0.88, color: [227, 199, 193] },
      { value: 1, color: [241, 237, 236] },
    ],
  }),

  /**
   * Classic oxygen color ramp.
   * Defined in interval [0, 1], without unit.
   */
  OXYGEN: new ColorRamp({
    stops: [
      { value: 0, color: [64, 5, 5] },
      { value: 0.13, color: [106, 6, 15] },
      { value: 0.25, color: [144, 26, 7] },
      { value: 0.38, color: [168, 64, 3] },
      { value: 0.5, color: [188, 100, 4] },
      { value: 0.63, color: [206, 136, 11] },
      { value: 0.75, color: [220, 174, 25] },
      { value: 0.88, color: [231, 215, 44] },
      { value: 1, color: [248, 254, 105] },
    ],
  }),

  /**
   * Classic par color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PAR: new ColorRamp({
    stops: [
      { value: 0, color: [51, 20, 24] },
      { value: 0.13, color: [90, 32, 35] },
      { value: 0.25, color: [129, 44, 34] },
      { value: 0.38, color: [159, 68, 25] },
      { value: 0.5, color: [182, 99, 19] },
      { value: 0.63, color: [199, 134, 22] },
      { value: 0.75, color: [212, 171, 35] },
      { value: 0.88, color: [221, 210, 54] },
      { value: 1, color: [225, 253, 75] },
    ],
  }),

  /**
   * Classic phase color ramp.
   * Defined in interval [0, 1], without unit.
   */
  PHASE: new ColorRamp({
    stops: [
      { value: 0, color: [145, 105, 18] },
      { value: 0.13, color: [184, 71, 38] },
      { value: 0.25, color: [186, 58, 115] },
      { value: 0.38, color: [160, 71, 185] },
      { value: 0.5, color: [110, 97, 218] },
      { value: 0.63, color: [50, 123, 164] },
      { value: 0.75, color: [31, 131, 110] },
      { value: 0.88, color: [77, 129, 34] },
      { value: 1, color: [145, 105, 18] },
    ],
  }),

  /**
   * Classic salinity color ramp.
   * Defined in interval [0, 1], without unit.
   */
  SALINITY: new ColorRamp({
    stops: [
      { value: 0, color: [42, 24, 108] },
      { value: 0.13, color: [33, 50, 162] },
      { value: 0.25, color: [15, 90, 145] },
      { value: 0.38, color: [40, 118, 137] },
      { value: 0.5, color: [59, 146, 135] },
      { value: 0.63, color: [79, 175, 126] },
      { value: 0.75, color: [120, 203, 104] },
      { value: 0.88, color: [193, 221, 100] },
      { value: 1, color: [253, 239, 154] },
    ],
  }),

  /**
   * Classic temperature color ramp.
   * Defined in interval [0, 1], without unit.
   */
  TEMPERATURE: new ColorRamp({
    stops: [
      { value: 0, color: [4, 35, 51] },
      { value: 0.13, color: [23, 51, 122] },
      { value: 0.25, color: [85, 59, 157] },
      { value: 0.38, color: [129, 79, 143] },
      { value: 0.5, color: [175, 95, 130] },
      { value: 0.63, color: [222, 112, 101] },
      { value: 0.75, color: [249, 146, 66] },
      { value: 0.88, color: [249, 196, 65] },
      { value: 1, color: [232, 250, 91] },
    ],
  }),

  /**
   * Classic turbidity color ramp.
   * Defined in interval [0, 1], without unit.
   */
  TURBIDITY: new ColorRamp({
    stops: [
      { value: 0, color: [34, 31, 27] },
      { value: 0.13, color: [65, 50, 41] },
      { value: 0.25, color: [98, 69, 52] },
      { value: 0.38, color: [131, 89, 57] },
      { value: 0.5, color: [161, 112, 59] },
      { value: 0.63, color: [185, 140, 66] },
      { value: 0.75, color: [202, 174, 88] },
      { value: 0.88, color: [216, 209, 126] },
      { value: 1, color: [233, 246, 171] },
    ],
  }),

  /**
   * Classic velocity blue color ramp.
   * Defined in interval [0, 1], without unit.
   */
  VELOCITY_BLUE: new ColorRamp({
    stops: [
      { value: 0, color: [17, 32, 64] },
      { value: 0.13, color: [35, 52, 116] },
      { value: 0.25, color: [29, 81, 156] },
      { value: 0.38, color: [31, 113, 162] },
      { value: 0.5, color: [50, 144, 169] },
      { value: 0.63, color: [87, 173, 176] },
      { value: 0.75, color: [149, 196, 189] },
      { value: 0.88, color: [203, 221, 211] },
      { value: 1, color: [254, 251, 230] },
    ],
  }),

  /**
   * Classic velocity green color ramp.
   * Defined in interval [0, 1], without unit.
   */
  VELOCITY_GREEN: new ColorRamp({
    stops: [
      { value: 0, color: [23, 35, 19] },
      { value: 0.13, color: [24, 64, 38] },
      { value: 0.25, color: [11, 95, 45] },
      { value: 0.38, color: [39, 123, 35] },
      { value: 0.5, color: [95, 146, 12] },
      { value: 0.63, color: [152, 165, 18] },
      { value: 0.75, color: [201, 186, 69] },
      { value: 0.88, color: [233, 216, 137] },
      { value: 1, color: [255, 253, 205] },
    ],
  }),

  /**
   * Classic cube helix color ramp.
   * Defined in interval [0, 1], without unit.
   */
  CUBEHELIX: new ColorRamp({
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
      { value: 1, color: [227, 253, 198] },
    ],
  }),

  /**
   * The cividis color ramp is color blind friendly.
   * Read more here https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0199239
   * Defined in interval [0, 1], without unit.
   */
  CIVIDIS: new ColorRamp({
    stops: [
      { value: 0, color: [0, 32, 77, 255] },
      { value: 0.125, color: [5, 54, 110, 255] },
      { value: 0.25, color: [65, 77, 108, 255] },
      { value: 0.375, color: [97, 100, 111, 255] },
      { value: 0.5, color: [125, 124, 121, 255] },
      { value: 0.625, color: [156, 149, 120, 255] },
      { value: 0.75, color: [190, 175, 111, 255] },
      { value: 0.875, color: [225, 204, 94, 255] },
      { value: 1, color: [255, 235, 70, 255] },
    ],
  }),

  /**
   * Classic turbo color ramp.
   * This is a luminance-constant alternative to the jet, making it more
   * clor-blind friendly.
   * Defined in interval [0, 1], without unit.
   */
  TURBO: new ColorRamp({
    stops: [
      { value: 0, color: [48, 18, 59, 255] },
      { value: 0.125, color: [70, 107, 227, 255] },
      { value: 0.25, color: [40, 187, 236, 255] },
      { value: 0.375, color: [49, 242, 153, 255] },
      { value: 0.5, color: [162, 252, 60, 255] },
      { value: 0.625, color: [237, 208, 58, 255] },
      { value: 0.75, color: [251, 128, 34, 255] },
      { value: 0.875, color: [210, 49, 5, 255] },
      { value: 1, color: [122, 4, 3, 255] },
    ],
  }),

  /**
   * The rocket color ramp is perceptually uniform, which makes it more
   * color bliend friendly than the classic magma color ramp.
   * Defined in interval [0, 1], without unit.
   */
  ROCKET: new ColorRamp({
    stops: [
      { value: 0, color: [250, 235, 221, 0] },
      { value: 0.133, color: [250, 235, 221, 255] },
      { value: 0.266, color: [246, 170, 130, 255] },
      { value: 0.4, color: [240, 96, 67, 255] },
      { value: 0.533, color: [203, 27, 79, 255] },
      { value: 0.666, color: [132, 30, 90, 255] },
      { value: 0.8, color: [63, 27, 68, 255] },
      { value: 1, color: [3, 5, 26, 255] },
    ],
  }),

  /**
   * The mako color ramp is perceptually uniform and can be seen as
   * a color blind friendly alternative to bathymetry or yignbu.
   * Defined in interval [0, 1], without unit.
   */
  MAKO: new ColorRamp({
    stops: [
      { value: 0, color: [11, 4, 5, 255] },
      { value: 0.125, color: [43, 28, 53, 255] },
      { value: 0.25, color: [62, 53, 107, 255] },
      { value: 0.375, color: [59, 86, 152, 255] },
      { value: 0.5, color: [53, 123, 162, 255] },
      { value: 0.625, color: [53, 158, 170, 255] },
      { value: 0.75, color: [73, 193, 173, 255] },
      { value: 0.875, color: [150, 221, 181, 255] },
      { value: 1, color: [222, 245, 229, 255] },
    ],
  }),
};
