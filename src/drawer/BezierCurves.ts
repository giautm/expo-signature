import type { ReadonlyVec2, vec2 } from "gl-matrix";

export function bezierLinear(
  out: vec2,
  a: ReadonlyVec2,
  b: ReadonlyVec2,
  t: number
) {
  const nt = 1 - t;

  out[0] = nt * a[0] + t * b[0];
  out[1] = nt * a[1] + t * b[1];
  return out;
}

export function bezierQuadratic(
  out: vec2,
  a: ReadonlyVec2,
  p: ReadonlyVec2,
  b: ReadonlyVec2,
  t: number
) {
  const tt = t * t;
  const nt = 1 - t;
  const ntnt = nt * nt;

  out[0] = ntnt * a[0] + 2 * nt * t * p[0] + tt * b[0];
  out[1] = ntnt * a[1] + 2 * nt * t * p[1] + tt * b[1];
  return out;
}

export function bezierCubic(
  out: vec2,
  a: ReadonlyVec2,
  p1: ReadonlyVec2,
  p2: ReadonlyVec2,
  b: ReadonlyVec2,
  t: number
) {
  const tt = t * t;
  const nt = 1.0 - t;
  const ntnt = nt * nt;

  out[0] =
    ntnt * nt * a[0] +
    3 * ntnt * t * p1[0] +
    3 * tt * nt * p2[0] +
    tt * t * b[0];
  out[1] =
    ntnt * nt * a[1] +
    3 * ntnt * t * p1[1] +
    3 * tt * nt * p2[1] +
    tt * t * b[1];
  return out;
}
