import {
  mat2,
  vec2,
} from 'gl-matrix';

import {
  bezierCubic,
  bezierLinear,
  bezierQuadratic,
} from './BezierCurves';

function approxLength(...points: vec2[]) {
  let total = 0;
  for (let i = 1, l = points.length; i < l; ++i) {
    total += vec2.distance(arguments[i - 1], arguments[i]);
  }
  return total;
}

function autoSegments(...points: vec2[]) {
  const tmp = approxLength(...points) / 20.0;
  return Math.ceil(Math.sqrt(tmp * tmp * 0.6 + 225.0));
}

// K ~ 0.5522847498307936
const K_CONSTANT = 4.0 * (Math.SQRT2 - 1) / 3.0;
const TRANSFORM_PERPENDICULAR = mat2.fromValues(0, -1, 1, 0);
const SEGS = 8;


export function singlePoint(point: vec2) {
  return {
    segments: 1,
    generator: function () {
      return point;
    },
  };
}

export function circle(center: vec2, radius: number) {
  const adjs = [
    vec2.fromValues(0, radius),
    vec2.fromValues(K_CONSTANT * radius, radius),
    vec2.fromValues(radius, K_CONSTANT * radius),
    vec2.fromValues(radius, 0),
  ];
  const p = adjs.map((v) => vec2.add(vec2.create(), center, v));

  const out = vec2.create();
  return {
    segments: SEGS * 4,
    generator: function (_: number, index: number) {
      const t2 = index % SEGS;
      if (index > 0 && t2 === 0) {
        adjs.forEach((v, i) => vec2.add(p[i], center,
          vec2.transformMat2(v, v, TRANSFORM_PERPENDICULAR)));
      }

      return bezierCubic(out, p[0], p[1], p[2], p[3], t2 / SEGS);
    }
  };
}

export function linear(a: vec2, b: vec2) {
  return ({
    segments: 1,
    generator: (t: number) => bezierLinear(vec2.create(), a, b, t),
  });
};

export function quadCurve(a: vec2, p: vec2, b: vec2) {
  return ({
    segments: autoSegments(a, p, b),
    generator: (t: number) => bezierQuadratic(vec2.create(), a, p, b, t),
  })
};

export function bezierCurve(a: vec2, p1: vec2, p2: vec2, b: vec2) {
  return ({
    segments: autoSegments(a, p1, p2, b),
    generator: (t: number) => bezierCubic(vec2.create(), a, p1, p2, b, t),
  });
};

type Generator = {
  segments: number;
  generator: (t: number, index: number) => vec2;
};

export function createGenerator(g1: Generator, g2: Generator) {
  return function*() {
    const segments = Math.max(g1.segments, g2.segments);
    for (let i = 0; i <= segments; ++i) {
      const t = i / segments;
      const v1 = g1.generator(t, i);
      yield v1[0];
      yield v1[1];
      const v2 = g2.generator(t, i);
      yield v2[0];
      yield v2[1];
    }
  };
}
