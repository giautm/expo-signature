import {
  mat2,
  vec2,
} from 'gl-matrix';

import {
  bezierCubic,
  bezierLinear,
  bezierQuadratic,
} from './BezierCurves';

function approxLength() {
  let total = 0;
  for (let i = 1, l = arguments.length; i < l; ++i) {
    total += vec2.distance(arguments[i - 1], arguments[i]);
  }
  return total;
}

function autoSegments() {
  const tmp = approxLength.call(null, arguments) / 20.0;
  return Math.ceil(Math.sqrt(tmp * tmp * 0.6 + 225.0));
}

// K ~ 0.5522847498307936
const K_CONSTANT = 4.0 * (Math.SQRT2 - 1) / 3.0;
const TRANSFORM_PERPENDICULAR = mat2.fromValues(0, -1, 1, 0);
const SEGS = 8;

export function circle(center, radius)  {
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
    generator: function (_, index) {
      const t2 = index % SEGS;
      if (index > 0 && t2 === 0) {
        adjs.forEach((v, i) => vec2.add(p[i], center,
          vec2.transformMat2(v, v, TRANSFORM_PERPENDICULAR)));
      }

      return bezierCubic(out, p[0], p[1], p[2], p[3], t2 / SEGS);
    }
  };
}

export function linear(a, b) {
  return ({
    segments: 1,
    generator: bezierLinear.bind(undefined, vec2.create(), a, b),
  });
};

export function quadCurve(a, p, b) {
  return ({
    segments: autoSegments(a, p, b),
    generator: bezierQuadratic.bind(undefined, vec2.create(), a, p, b),
  })
};

export function bezierCurve(a, p1, p2, b) {
  return ({
    segments: autoSegments(a, p1, p2, b),
    generator: bezierCubic.bind(undefined, vec2.create(), a, p1, p2, b),
  });
};
