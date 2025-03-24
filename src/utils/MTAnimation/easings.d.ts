declare module "easing-functions" {
  type EasingFunction = (k: number) => number;

  export interface EasingMethod {
    In(k: number): number;
    Out(k: number): number;
    InOut(k: number): number;
  }

  export interface Easing {
    Linear: EasingFunction;
    quadratic: EasingMethod;
    cubic: EasingMethod;
    quartic: EasingMethod;
    quintic: EasingMethod;
    sinusoidal: EasingMethod;
    exponential: EasingMethod;
    circular: EasingMethod;
    elastic: EasingMethod;
    back: EasingMethod;
    bounce: EasingMethod;

    [key: string]: EasingFunction | EasingMethod;
  }

  const Easing: Easing;

  export = Easing;
}
