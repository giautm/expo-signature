import Vec2 from 'gl-matrix-vec2';

function approxLength(a, p1, p2, b) {
  return Vec2.distance(a, p1) + Vec2.distance(p1, p2) + Vec2.distance(p2, b);
}
function approxLength2(a, p1, p2) {
  return Vec2.distance(a, p1) + Vec2.distance(p1, p2);
}

// K ~ 0.5522847498307936
const K_CONSTANT = 4.0 * (Math.SQRT2 - 1) / 3.0;

export function arc(center, radius)  {
  // return ({
  //   segments: 1,
  //   generator: (t) => (t === 0) ? a : b,
  // });
}

export function linear(a, b) {
  return ({
    segments: 1,
    generator: (t) => (t === 0) ? a : b,
  });
};

export function quadCurve(a, p, b) {
  const tmp = approxLength2(a, p, b) / 20.0;
  const segments = Math.ceil(Math.sqrt(tmp * tmp * 0.6 + 225.0));
  return ({
    segments,
    generator: (t) => {
      const nt = 1 - t;

      return Vec2.fromValues(
        nt * nt * a[0] + 2 * nt * t * p[0] + t * t * b[0],
        nt * nt * a[1] + 2 * nt * t * p[1] + t * t * b[1]
      );
    },
  })
};

export function bezierCurve(a, p1, p2, b) {
  const tmp = approxLength(a, p1, p2, b) / 20.0;
  const segments = Math.ceil(Math.sqrt(tmp * tmp * 0.6 + 225.0));
  return ({
    segments,
    generator: (t) => {
      const tt = t * t;
      const nt = 1.0 - t;
      const ntnt = nt * nt;

      return Vec2.fromValues(
        ntnt * nt * a[0] + 3 * ntnt * t * p1[0] + 3 * tt * nt * p2[0] + tt * t * b[0],
        ntnt * nt * a[1] + 3 * ntnt * t * p1[1] + 3 * tt * nt * p2[1] + tt * t * b[1]
      );
    },
  });
};
