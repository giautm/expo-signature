/**
 * https://en.wikipedia.org/wiki/Bézier_curve
 */

import { vec2 } from 'gl-matrix';

export function bezierLinear(a, b, t) {
  const nt = 1 - t;

  return vec2.fromValues(
    nt * a[0] + t * b[0],
    nt * a[1] + t * b[1]
  );
}

export function bezierQuadratic(a, p, b, t) {
  const tt = t * t;
  const nt = 1 - t;
  const ntnt = nt * nt;

  return vec2.fromValues(
    ntnt * a[0] + 2 * nt * t * p[0] + tt * b[0],
    ntnt * a[1] + 2 * nt * t * p[1] + tt * b[1]
  );
}

export function bezierCubic(a, p1, p2, b, t) {
  const tt = t * t;
  const nt = 1.0 - t;
  const ntnt = nt * nt;

  return vec2.fromValues(
    ntnt * nt * a[0] + 3 * ntnt * t * p1[0] + 3 * tt * nt * p2[0] + tt * t * b[0],
    ntnt * nt * a[1] + 3 * ntnt * t * p1[1] + 3 * tt * nt * p2[1] + tt * t * b[1]
  );
}