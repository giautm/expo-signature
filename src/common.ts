import type { vec2 } from "gl-matrix";

const EPSILON = 0.00001;

export const vec2Equals = (a: vec2, b: vec2) => {
  let a0 = a[0], a1 = a[1];
  let b0 = b[0], b1 = b[1];
  return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0))
    && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)));
};
