// @flow

import type { Vector2 } from './utils/vector2';
import Vector from './utils/vector2';

/**
 * The is the maximum length that will vary weight.
 * Anything higher will return the same weight.
 */
const MAX_LENGTH_RANGE = 80.0;

/**
 * These are based on having a minimum line thickness of 2.0 and maximum of 7.0,
 * linearly over line lengths 0-maxLengthRange.
 * They fit into a typical linear equation: y = mx + c
 * 
 * Note: Only the points of the two parallel bezier curves will be
 * at least as thick as the constant. The bezier curves themselves
 * could still be drawn with sharp angles, meaning there is no true
 * 'minimum thickness' of the signature.
 */
const GRADIENT = 0.1;
const CONSTANT = 2.0;

export type WeightedPoint = {
  p: Vector2,
  w: number
};

export const weightFromVector = (vector: Vector2): number => {
  const length = Vector.length(vector);
  const inversedLength = Math.max(0, MAX_LENGTH_RANGE - length);

  return inversedLength * GRADIENT + CONSTANT;
};

export const makeWeightedPoint = (p1: Vector2, p2: Vector2): WeightedPoint => ({
  p: p2,
  w: weightFromVector(Vector.sub(p2, p1)),
});
