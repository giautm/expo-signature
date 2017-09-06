import { vec2 } from 'gl-matrix';

import {
  circle,
  linear,
  quadCurve,
  bezierCurve,
} from './BezierPath';
import { vec2Equals } from './common';

const ZERO_VECTOR = vec2.create();

function lineCreate() {
  return [
    vec2.create(),
    vec2.create(),
  ];
}

function lineAverage(out, lineA, lineB) {
  vec2.scale(out[0], vec2.add(out[0], lineA[0], lineB[0]), 0.5);
  vec2.scale(out[1], vec2.add(out[1], lineA[1], lineB[1]), 0.5);
  return out;
}

function singlePoint(point) {
  return ({
    segments: 1,
    generator: function () {
      return point;
    },
  });
}

class Generator {
  constructor(g1, g2) {
    this.g1 = g1;
    this.g2 = g2;
  }

  * getVertexData() {
    const segments = Math.max(this.g1.segments, this.g2.segments);
    for (let i = 0; i <= segments; ++i) {
      const t = i / segments;
      const v1 = this.g1.generator(t, i);
      yield v1[0];
      yield v1[1];
      const v2 = this.g2.generator(t, i);
      yield v2[0];
      yield v2[1];
    }
  }
}

class BezierPath_WeightedPoint {

  dot = (onePoint) => {
    const center = onePoint[0].point;
    const b1 = circle(center, onePoint[0].weight / 2.0);
    return this.withGenerators(b1, singlePoint(center));
  };

  line = (twoPoints) => {
    const linePairAB = this.linesPerpendicularToLine(twoPoints[0], twoPoints[1]);
    const lineA = linePairAB.first;
    const lineB = linePairAB.second;

    const b1 = linear(lineA[0], lineB[0]);
    const b2 = linear(lineA[1], lineB[1]);

    return this.withGenerators(b1, b2);
  };

  quadCurve = (threePoints) => {
    const linePairAB = this.linesPerpendicularToLine(threePoints[0], threePoints[1]);
    const linePairBC = this.linesPerpendicularToLine(threePoints[1], threePoints[2]);

    const lineA = linePairAB.first;
    const lineB = lineAverage(lineCreate(), linePairAB.second, linePairBC.first);
    const lineC = linePairBC.second;

    const b1 = quadCurve(lineA[0], lineB[0], lineC[0]);
    const b2 = quadCurve(lineA[1], lineB[1], lineC[1]);

    return this.withGenerators(b1, b2);
  };

  bezierCurve = (fourPoints) => {
    const linePairAB = this.linesPerpendicularToLine(fourPoints[0], fourPoints[1]);
    const linePairBC = this.linesPerpendicularToLine(fourPoints[1], fourPoints[2]);
    const linePairCD = this.linesPerpendicularToLine(fourPoints[2], fourPoints[3]);

    const lineA = linePairAB.first;
    const lineB = lineAverage(lineCreate(), linePairAB.second, linePairBC.first);
    const lineC = lineAverage(lineCreate(), linePairBC.second, linePairCD.first);
    const lineD = linePairCD.second;

    const b1 = bezierCurve(lineA[0], lineB[0], lineC[0], lineD[0]);
    const b2 = bezierCurve(lineA[1], lineB[1], lineC[1], lineD[1]);

    return this.withGenerators(b1, b2);
  };

  withGenerators(g1, g2) {
    const generator = new Generator(g1, g2);
    return generator.getVertexData.bind(generator);
  }


  linesPerpendicularToLine(pointA, pointB) {
    const lineVec = vec2.subtract(vec2.create(),
      pointB.point, pointA.point);

    return ({
      first: this.linePerpendicularToLine(lineCreate(),
        lineVec, pointA.point, pointA.weight),
      second: this.linePerpendicularToLine(lineCreate(),
        lineVec, pointB.point, pointB.weight),
    });
  }

  linePerpendicularToLine(out, vec, middlePoint, weight) {
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
}

export default BezierPath_WeightedPoint;