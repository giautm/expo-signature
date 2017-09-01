import Vec2 from 'gl-matrix-vec2';

import {
  arc,
  linear,
  quadCurve,
  bezierCurve,
} from './BezierPath';
import { vec2Equals } from './common';

const ZERO_VECTOR = Vec2.create();


const TWO_PI = Math.PI * 2;
const sin = Math.sin;
const cos = Math.cos;

export function vec2Average(out, a, b) {
  return Vec2.scale(out, Vec2.add(out, a, b), 0.5);
}

class BezierPath_WeightedPoint {

  dot = (onePoint) => {
    const center = onePoint[0].point;
    const b1 = arc(center, onePoint[0].weight / 2.0);
    return this.withGenerators(b1, {
      segments: 1,
      generator: function() {
        return center;
      },
    });
  };

  linear = (twoPoints) => {
    const linePairAB = this.linesPerpendicularToLine(twoPoints[0], twoPoints[1]);
    const lineA = linePairAB.first;
    const lineB = linePairAB.second;

    const b1 = linear(lineA.startPoint, lineB.startPoint);
    const b2 = linear(lineA.endPoint, lineB.endPoint);

    return this.withGenerators(b1, b2);
  };

  quadCurve = (threePoints) => {
    const linePairAB = this.linesPerpendicularToLine(threePoints[0], threePoints[1]);
    const linePairBC = this.linesPerpendicularToLine(threePoints[1], threePoints[2]);

    const lineA = linePairAB.first;
    const lineB = this.averageLine(linePairAB.second, linePairBC.first);
    const lineC = linePairBC.second;

    const b1 = quadCurve(lineA.startPoint, lineB.startPoint, lineC.startPoint);
    const b2 = quadCurve(lineA.endPoint, lineB.endPoint, lineC.endPoint);

    return this.withGenerators(b1, b2);
  };

  bezierCurve = (fourPoints) => {
    const linePairAB = this.linesPerpendicularToLine(fourPoints[0], fourPoints[1]);
    const linePairBC = this.linesPerpendicularToLine(fourPoints[1], fourPoints[2]);
    const linePairCD = this.linesPerpendicularToLine(fourPoints[2], fourPoints[3]);

    const lineA = linePairAB.first;
    const lineB = this.averageLine(linePairAB.second, linePairBC.first);
    const lineC = this.averageLine(linePairBC.second, linePairCD.first);
    const lineD = linePairCD.second;

    const b1 = bezierCurve(lineA.startPoint, lineB.startPoint,
      lineC.startPoint, lineD.startPoint);
    const b2 = bezierCurve(lineA.endPoint, lineB.endPoint,
      lineC.endPoint, lineD.endPoint);

    return this.withGenerators(b1, b2);
  };

  withGenerators(g1, g2) {
    const points = [];
    const segments = Math.max(g1.segments, g2.segments);
    for (let i = 0; i <= segments; ++i) {
      const t = i / segments;

      points.push({
        first: g1.generator(t, i),
        second: g2.generator(t, i),
      });
    }

    return points;
  }

  averageLine(lineA, lineB) {
    return ({
      startPoint: vec2Average(Vec2.create(),
        lineA.startPoint, lineB.startPoint),
      endPoint: vec2Average(Vec2.create(),
        lineA.endPoint, lineB.endPoint),
    });
  }

  linesPerpendicularToLine(pointA, pointB) {
    const lineVec = Vec2.subtract(Vec2.create(),
      pointB.point, pointA.point);

    return ({
      first: this.linePerpendicularToLine(lineVec, pointA.point, pointA.weight),
      second: this.linePerpendicularToLine(lineVec, pointB.point, pointB.weight),
    });
  }

  linePerpendicularToLine(vec, middlePoint, weight) {
    const startPoint = Vec2.clone(middlePoint);
    const endPoint = Vec2.clone(middlePoint);
    if (weight > 0 && !vec2Equals(vec, ZERO_VECTOR)) {
      const perpendicular = Vec2.fromValues(vec[1], -vec[0]);
      Vec2.normalize(perpendicular, perpendicular);

      const haflWeight = weight * 0.5;
      Vec2.scaleAndAdd(startPoint, startPoint, perpendicular, +haflWeight);
      Vec2.scaleAndAdd(endPoint, endPoint, perpendicular, -haflWeight);
    }

    return ({ startPoint, endPoint });
  }
}

export default BezierPath_WeightedPoint;