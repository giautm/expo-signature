// @flow

export type Vector2 = Array<number>;

export const ZERO_LENGTH = 0.0001;

export const vectorAdd = (v1: Vector2, v2: Vector2): Vector2 => ([
  v1[0] + v2[0], v1[1] + v2[1],
]);

export const vectorAddArray = (vectors: Array<Vector2>): Vector2 => {
  let result = vectors[0];
  for (let i = 1; i < vectors.length; ++i) {
    result = vectorAdd(result, vectors[i]);
  }
  return result;
};

export const vectorSub = (v1: Vector2, v2: Vector2): Vector2 => ([
  v2[0] - v1[0], v2[1] - v1[1],
]);

export const vectorSubArray = (vectors: Array<Vector2>): Vector2 => {
  let result = vectors[0];
  for (let i = 1; i < vectors.length; ++i) {
    result = vectorSub(vectors[i], result);
  }
  return result;
};

export const vectorMultiplyScalar = (v: Vector2, n: number): Vector2 => ([
  v[0] * n, v[1] * n,
]);

export const vectorAddScalar = (v: Vector2, n: number): Vector2 => ([
  v[0] + n, v[1] + n,
]);

export const vectorLength = (v: Vector2): number => Math.sqrt(v[0] * v[0] + v[1] * v[1]);

export const vectorLengthArray = (vectors: Array<Vector2>): number =>
  vectors.reduce((l, v) => l + vectorLength(v), 0);

export const vectorNormalize = (v: Vector2): Vector2 => {
  const length = vectorLength(v);
  if (length > 0) {
    return ([
      v[0] / length,
      v[1] / length,
    ]);
  }
  return v;
};

export const vectorPerpendicular = (v: Vector2): Vector2 => ([
  v[1], -v[0],
]);

export const vectorIsZero = (v: Vector2, zeroLength: number = ZERO_LENGTH): boolean =>
  vectorLength(v) <= zeroLength;

export const isEqualPoint = (p1: Vector2, p2: Vector2, zeroLength: number = ZERO_LENGTH): boolean =>
  vectorIsZero(vectorSub(p2, p1), zeroLength);

export default {
  add: vectorAdd,
  addArray: vectorAddArray,
  addScalar: vectorAddScalar,
  length: vectorLength,
  lengthArray: vectorLengthArray,
  isZero: vectorIsZero,
  multiplyScalar: vectorMultiplyScalar,
  normalize: vectorNormalize,
  perpendicular: vectorPerpendicular,
  sub: vectorSub,
  subArray: vectorSubArray,
  isEqualPoint: isEqualPoint,
};