/**
 * This is TypeScript rewrite of the Point class to use instead of the version imported in MapLibre.
 * It also uses a class instead of prototypes.
 */

/**
 * Row major 2x2 matrix
 */
export type Matrix2 = [number, number, number, number];

/**
 * a point
 */
export class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  private _matMult(m: Matrix2): Point {
    const x = m[0] * this.x + m[1] * this.y;
    const y = m[2] * this.x + m[3] * this.y;
    this.x = x;
    this.y = y;
    return this;
  }

  private _add(p: Point): Point {
    this.x += p.x;
    this.y += p.y;
    return this;
  }

  private _sub(p: Point): Point {
    this.x -= p.x;
    this.y -= p.y;
    return this;
  }

  private _mult(k: number): Point {
    this.x *= k;
    this.y *= k;
    return this;
  }

  private _div(k: number): Point {
    this.x /= k;
    this.y /= k;
    return this;
  }

  private _multByPoint(p: Point): Point {
    this.x *= p.x;
    this.y *= p.y;
    return this;
  }

  private _divByPoint(p: Point): Point {
    this.x /= p.x;
    this.y /= p.y;
    return this;
  }

  private _unit(): Point {
    this._div(this.mag());
    return this;
  }

  private _perp(): Point {
    const y = this.y;
    this.y = this.x;
    this.x = -y;
    return this;
  }

  private _rotate(angle: number): Point {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = cos * this.x - sin * this.y;
    const y = sin * this.x + cos * this.y;
    this.x = x;
    this.y = y;
    return this;
  }

  private _rotateAround(angle: number, p: Point): Point {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y);
    const y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
    this.x = x;
    this.y = y;
    return this;
  }

  private _round(): Point {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  /**
   * Clone this point, returning a new point that can be modified
   * without affecting the old one.
   * @return {Point} the clone
   */
  clone(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * Add this point's x & y coordinates to another point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  add(p: Point): Point {
    return this.clone()._add(p);
  }

  /**
   * Subtract this point's x & y coordinates to from point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  sub(p: Point): Point {
    return this.clone()._sub(p);
  }

  /**
   * Multiply this point's x & y coordinates by point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  multByPoint(p: Point): Point {
    return this.clone()._multByPoint(p);
  }

  /**
   * Divide this point's x & y coordinates by point,
   * yielding a new point.
   * @param {Point} p the other point
   * @return {Point} output point
   */
  divByPoint(p: Point): Point {
    return this.clone()._divByPoint(p);
  }

  /**
   * Multiply this point's x & y coordinates by a factor,
   * yielding a new point.
   * @param {Number} k factor
   * @return {Point} output point
   */
  mult(k: number): Point {
    return this.clone()._mult(k);
  }

  /**
   * Divide this point's x & y coordinates by a factor,
   * yielding a new point.
   * @param {Point} k factor
   * @return {Point} output point
   */
  div(k: number): Point {
    return this.clone()._div(k);
  }

  /**
   * Rotate this point around the 0, 0 origin by an angle a,
   * given in radians
   * @param {Number} a angle to rotate around, in radians
   * @return {Point} output point
   */
  rotate(a: number): Point {
    return this.clone()._rotate(a);
  }

  /**
   * Rotate this point around p point by an angle a,
   * given in radians
   * @param {Number} a angle to rotate around, in radians
   * @param {Point} p Point to rotate around
   * @return {Point} output point
   */
  rotateAround(a: number, p: Point): Point {
    return this.clone()._rotateAround(a, p);
  }

  /**
   * Multiply this point by a 4x1 transformation matrix
   * @param {Array<Number>} m transformation matrix
   * @return {Point} output point
   */
  matMult(m: Matrix2): Point {
    return this.clone()._matMult(m);
  }

  /**
   * Calculate this point but as a unit vector from 0, 0, meaning
   * that the distance from the resulting point to the 0, 0
   * coordinate will be equal to 1 and the angle from the resulting
   * point to the 0, 0 coordinate will be the same as before.
   * @return {Point} unit vector point
   */
  unit(): Point {
    return this.clone()._unit();
  }

  /**
   * Compute a perpendicular point, where the new y coordinate
   * is the old x coordinate and the new x coordinate is the old y
   * coordinate multiplied by -1
   * @return {Point} perpendicular point
   */
  perp(): Point {
    return this.clone()._perp();
  }

  /**
   * Return a version of this point with the x & y coordinates
   * rounded to integers.
   * @return {Point} rounded point
   */
  round(): Point {
    return this.clone()._round();
  }

  /**
   * Return the magnitude of this point: this is the Euclidean
   * distance from the 0, 0 coordinate to this point's x and y
   * coordinates.
   * @return {Number} magnitude
   */
  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Judge whether this point is equal to another point, returning
   * true or false.
   * @param {Point} other the other point
   * @return {boolean} whether the points are equal
   */
  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Calculate the distance from this point to another point
   * @param {Point} p the other point
   * @return {Number} distance
   */
  dist(p: Point): number {
    return Math.sqrt(this.distSqr(p));
  }

  /**
   * Calculate the distance from this point to another point,
   * without the square root step. Useful if you're comparing
   * relative distances.
   * @param {Point} p the other point
   * @return {Number} distance
   */
  distSqr(p: Point): number {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return dx * dx + dy * dy;
  }

  /**
   * Get the angle from the 0, 0 coordinate to this point, in radians
   * coordinates.
   * @return {Number} angle
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Get the angle from this point to another point, in radians
   * @param {Point} b the other point
   * @return {Number} angle
   */
  angleTo(b: Point): number {
    return Math.atan2(this.y - b.y, this.x - b.x);
  }

  /**
   * Get the angle between this point and another point, in radians
   * @param {Point} b the other point
   * @return {Number} angle
   */
  angleWith(b: Point): number {
    return this.angleWithSep(b.x, b.y);
  }

  /*
   * Find the angle of the two vectors, solving the formula for
   * the cross product a x b = |a||b|sin(θ) for θ.
   * @param {Number} x the x-coordinate
   * @param {Number} y the y-coordinate
   * @return {Number} the angle in radians
   */
  angleWithSep(x: number, y: number): number {
    return Math.atan2(this.x * y - this.y * x, this.x * x + this.y * y);
  }

  /**
   * Construct a point from an array if necessary, otherwise if the input
   * is already a Point, or an unknown type, return it unchanged
   * @param {Array<number> | Point} a any kind of input value
   * @return {Point} constructed point, or passed-through value.
   * @example
   * // this
   * var point = Point.convert([0, 1]);
   * // is equivalent to
   * var point = new Point(0, 1);
   */
  static convert(a: Point | Array<number>) {
    if (a instanceof Point) {
      return a;
    }
    if (Array.isArray(a)) {
      return new Point(a[0], a[1]);
    }
    return a;
  }
}
