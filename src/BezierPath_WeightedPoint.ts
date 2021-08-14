import { vec2 } from "gl-matrix";
import { withGenerators } from "./BezierCurves";

import {
  circle,
  linear,
  quadCurve,
  bezierCurve,
  singlePoint,
} from "./BezierPath";
import { vec2Equals } from "./common";

const ZERO_VECTOR = vec2.create();

type Line = readonly [vec2, vec2];

function lineCreate(): Line {
  return [vec2.create(), vec2.create()];
}

function lineAverage(out: Line, lineA: Line, lineB: Line) {
  vec2.scale(out[0], vec2.add(out[0], lineA[0], lineB[0]), 0.5);
  vec2.scale(out[1], vec2.add(out[1], lineA[1], lineB[1]), 0.5);
  return out;
}

export type WeightedPoint = {
  weight: number;
  point: vec2;
};

function linePerpendicularToLine(
  out: Line,
  vec: vec2,
  middlePoint: vec2,
  weight: number
) {
  if (weight > 0 && !vec2Equals(vec, ZERO_VECTOR)) {
    const perpendicular = vec2.fromValues(vec[1], -vec[0]);
    vec2.normalize(perpendicular, perpendicular);

    const haflWeight = weight * 0.5;
    vec2.scaleAndAdd(out[0], middlePoint, perpendicular, +haflWeight);
    vec2.scaleAndAdd(out[1], middlePoint, perpendicular, -haflWeight);
  } else {
    vec2.copy(out[0], middlePoint);
    vec2.copy(out[1], middlePoint);
  }

  return out;
}

function linesPerpendicularToLine(
  pointA: WeightedPoint,
  pointB: WeightedPoint
) {
  const lineVec = vec2.subtract(vec2.create(), pointB.point, pointA.point);

  return {
    first: linePerpendicularToLine(
      lineCreate(),
      lineVec,
      pointA.point,
      pointA.weight
    ),
    second: linePerpendicularToLine(
      lineCreate(),
      lineVec,
      pointB.point,
      pointB.weight
    ),
  };
}

class BezierPath_WeightedPoint {
  static dot = (points: readonly [WeightedPoint]) => {
    const center = points[0].point;

    const g1 = circle(center, points[0].weight / 2.0);
    return withGenerators(g1, singlePoint(center));
  };

  static line = (points: readonly [WeightedPoint, WeightedPoint]) => {
    const lineAB = linesPerpendicularToLine(points[0], points[1]);
    const lineA = lineAB.first;
    const lineB = lineAB.second;

    const g1 = linear(lineA[0], lineB[0]);
    const g2 = linear(lineA[1], lineB[1]);
    return withGenerators(g1, g2);
  };

  static quadCurve = (
    points: readonly [WeightedPoint, WeightedPoint, WeightedPoint]
  ) => {
    const lineAB = linesPerpendicularToLine(points[0], points[1]);
    const lineBC = linesPerpendicularToLine(points[1], points[2]);

    const lineA = lineAB.first;
    const lineB = lineAverage(lineCreate(), lineAB.second, lineBC.first);
    const lineC = lineBC.second;

    const g1 = quadCurve(lineA[0], lineB[0], lineC[0]);
    const g2 = quadCurve(lineA[1], lineB[1], lineC[1]);
    return withGenerators(g1, g2);
  };

  static bezierCurve = (
    points: readonly [
      WeightedPoint,
      WeightedPoint,
      WeightedPoint,
      WeightedPoint
    ]
  ) => {
    const linePairAB = linesPerpendicularToLine(points[0], points[1]);
    const linePairBC = linesPerpendicularToLine(points[1], points[2]);
    const linePairCD = linesPerpendicularToLine(points[2], points[3]);

    const lineA = linePairAB.first;
    const lineB = lineAverage(
      lineCreate(),
      linePairAB.second,
      linePairBC.first
    );
    const lineC = lineAverage(
      lineCreate(),
      linePairBC.second,
      linePairCD.first
    );
    const lineD = linePairCD.second;

    const g1 = bezierCurve(lineA[0], lineB[0], lineC[0], lineD[0]);
    const g2 = bezierCurve(lineA[1], lineB[1], lineC[1], lineD[1]);
    return withGenerators(g1, g2);
  };
}

export default BezierPath_WeightedPoint;
