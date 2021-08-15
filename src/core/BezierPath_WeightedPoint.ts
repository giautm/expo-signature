import { vec2 } from "gl-matrix";

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
  if (weight <= 0 || vec2.equals(vec, ZERO_VECTOR)) {
    vec2.copy(out[0], middlePoint);
    vec2.copy(out[1], middlePoint);
  } else {
    const perpendicular = vec2.fromValues(vec[1], -vec[0]);
    vec2.normalize(perpendicular, perpendicular);

    const haflWeight = weight * 0.5;
    vec2.scaleAndAdd(out[0], middlePoint, perpendicular, +haflWeight);
    vec2.scaleAndAdd(out[1], middlePoint, perpendicular, -haflWeight);
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

export interface DrawerHelper {
  circle(center: vec2, radius: number): void;
  lines(...lines: (readonly [vec2, vec2])[]): void;
}

class BezierPath_WeightedPoint {
  static dot(points: readonly [WeightedPoint], helper: DrawerHelper) {
    const { point, weight } = points[0];
    helper.circle(point, weight / 2.0);
  }

  static line(
    points: readonly [WeightedPoint, WeightedPoint],
    helper: DrawerHelper
  ) {
    const { first, second } = linesPerpendicularToLine(points[0], points[1]);
    helper.lines(first, second);
  }

  static quadCurve(
    points: readonly [WeightedPoint, WeightedPoint, WeightedPoint],
    helper: DrawerHelper
  ) {
    const lineAB = linesPerpendicularToLine(points[0], points[1]);
    const lineBC = linesPerpendicularToLine(points[1], points[2]);

    const lineA = lineAB.first;
    const lineB = lineAverage(lineCreate(), lineAB.second, lineBC.first);
    const lineC = lineBC.second;

    helper.lines(lineA, lineB, lineC);
  }

  static bezierCurve(
    points: readonly [
      WeightedPoint,
      WeightedPoint,
      WeightedPoint,
      WeightedPoint
    ],
    helper: DrawerHelper
  ) {
    const lineAB = linesPerpendicularToLine(points[0], points[1]);
    const lineBC = linesPerpendicularToLine(points[1], points[2]);
    const lineCD = linesPerpendicularToLine(points[2], points[3]);

    const lineA = lineAB.first;
    const lineB = lineAverage(lineCreate(), lineAB.second, lineBC.first);
    const lineC = lineAverage(lineCreate(), lineBC.second, lineCD.first);
    const lineD = lineCD.second;

    helper.lines(lineA, lineB, lineC, lineD);
  }
}

export default BezierPath_WeightedPoint;
