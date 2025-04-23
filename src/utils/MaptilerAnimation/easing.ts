import { EasingFunctionName } from "./types";

const EasingFunctions: Record<EasingFunctionName, (K: number) => number> = {
  Linear: easingLinear,
  QuadraticIn: easingQuadraticIn,
  QuadraticOut: easingQuadraticOut,
  QuadraticInOut: easingQuadraticInOut,
  CubicIn: easingCubicIn,
  CubicOut: easingCubicOut,
  CubicInOut: easingCubicInOut,
  SinusoidalIn: easingSinusoidalIn,
  SinusoidalOut: easingSinusoidalOut,
  SinusoidalInOut: easingSinusoidalInOut,
  ExponentialIn: easingExponentialIn,
  ExponentialOut: easingExponentialOut,
  ExponentialInOut: easingExponentialInOut,
  ElasticIn: easingElasticIn,
  ElasticOut: easingElasticOut,
  ElasticInOut: easingElasticInOut,
  BounceIn: easingBounceIn,
  BounceOut: easingBounceOut,
  BounceInOut: easingBounceInOut,
} as const;

export default EasingFunctions;

function easingLinear(n: number): number {
  return n;
}

function easingQuadraticIn(n: number): number {
  return n * n;
}

function easingQuadraticOut(n: number): number {
  return n * (2 - n);
}

function easingQuadraticInOut(n: number): number {
  let dn = n * 2;
  if (dn < 1) {
    return 0.5 * dn * dn;
  }
  dn -= 1;
  return -0.5 * (dn * (dn - 2) - 1);
}

function easingCubicIn(n: number): number {
  return n * n * n;
}

function easingCubicOut(n: number): number {
  return --n * n * n + 1;
}

function easingCubicInOut(n: number): number {
  let dn = n * 2;
  if (dn < 1) {
    return 0.5 * dn * dn * dn;
  }
  dn -= 2;
  return 0.5 * (dn * dn * dn + 2);
}
function easingSinusoidalIn(n: number): number {
  return 1 - Math.cos((n * Math.PI) / 2);
}

function easingSinusoidalOut(n: number): number {
  return Math.sin((n * Math.PI) / 2);
}

function easingSinusoidalInOut(n: number): number {
  return 0.5 * (1 - Math.cos(Math.PI * n));
}
function easingExponentialIn(n: number): number {
  return n === 0 ? 0 : 1024 ** (n - 1);
}

function easingExponentialOut(n: number): number {
  return n === 1 ? 1 : 1 - 2 ** (-10 * n);
}

function easingExponentialInOut(n: number): number {
  if (n === 0) return 0;
  if (n === 1) return 1;
  const dn = n * 2;
  if (dn < 1) {
    return 0.5 * 1024 ** (dn - 1);
  }
  return 0.5 * (-(2 ** (-10 * (dn - 1))) + 2);
}
function easingElasticIn(n: number): number {
  let a = 0.1;
  const p = 0.4;
  let s;
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (a < 1) {
    a = 1;
    s = p / 4;
  } else {
    s = (p * Math.asin(1 / a)) / (2 * Math.PI);
  }
  n -= 1;
  return -(a * 2 ** (10 * n) * Math.sin(((n - s) * (2 * Math.PI)) / p));
}

function easingElasticOut(n: number): number {
  let a = 0.1;
  const p = 0.4;
  let s;
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (a < 1) {
    a = 1;
    s = p / 4;
  } else {
    s = (p * Math.asin(1 / a)) / (2 * Math.PI);
  }
  return a * 2 ** (-10 * n) * Math.sin(((n - s) * (2 * Math.PI)) / p) + 1;
}

function easingElasticInOut(n: number): number {
  let a = 0.1;
  const p = 0.4;
  let s;
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (a < 1) {
    a = 1;
    s = p / 4;
  } else {
    s = (p * Math.asin(1 / a)) / (2 * Math.PI);
  }
  const dn = n * 2;
  if (dn < 1) {
    const nInner = dn - 1;
    return -0.5 * (a * 2 ** (10 * nInner) * Math.sin(((nInner - s) * (2 * Math.PI)) / p));
  }
  const nInner = dn - 1;
  return a * 2 ** (-10 * nInner) * Math.sin(((nInner - s) * (2 * Math.PI)) / p) * 0.5 + 1;
}

function easingBounceIn(n: number): number {
  return 1 - easingBounceOut(1 - n);
}

function easingBounceOut(n: number): number {
  if (n < 1 / 2.75) {
    return 7.5625 * n * n;
  } else if (n < 2 / 2.75) {
    const n2 = n - 1.5 / 2.75;
    return 7.5625 * n2 * n2 + 0.75;
  } else if (n < 2.5 / 2.75) {
    const n2 = n - 2.25 / 2.75;
    return 7.5625 * n2 * n2 + 0.9375;
  }
  const n2 = n - 2.625 / 2.75;
  return 7.5625 * n2 * n2 + 0.984375;
}

function easingBounceInOut(n: number): number {
  if (n < 0.5) return easingBounceIn(n * 2) * 0.5;
  return easingBounceOut(n * 2 - 1) * 0.5 + 0.5;
}
