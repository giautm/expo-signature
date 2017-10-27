// @flow

import { EventEmitter } from 'fbemitter';

import type { Vector2 } from './utils/vector2';
import Vector from './utils/vector2';

import type { WeightedPoint } from './WeightedPoint';
import { makeWeightedPoint } from './WeightedPoint';

const EVENTS: string[] = [
  'doDot',
  'doLine',
  'doQuadCurve',
  'doBezierCurve',
];

const DOT_SIGNATURE_WEIGHT = 3.0;
const TOUCH_DISTANCE_THRESHOLD = 2.0;

const averagePoints = (p1: Vector2, p2: Vector2) => ([
  (p1[0] + p2[0]) * 0.5,
  (p1[1] + p2[1]) * 0.5,
]);

class BezierProvider extends EventEmitter {
  _curPoints: Array<WeightedPoint>;

  constructor() {
    super();
    this._curPoints = [];
  }

  addPoint = (point: Vector2) => {
    if (this._curPoints.length === 0) {
      this._curPoints.push({
        p: point,
        w: DOT_SIGNATURE_WEIGHT,
      });
    } else {
      const previewPoint: Vector2 = this._curPoints[this._curPoints.length - 1].p;
      if (Vector.isEqualPoint(previewPoint, point, TOUCH_DISTANCE_THRESHOLD)) {
        return;
      }

      const isStartPointOfNextLine = this._curPoints.length > 3;
      if (isStartPointOfNextLine) {
        this._finalizeBezierPath(point);
        this._curPoints = this._curPoints.slice(-1);
      }

      this._curPoints.push(makeWeightedPoint(previewPoint, point));
    }

    this._generateBezierPath();
  };

  reset = () => {
    this._curPoints = [];
  };

  _finalizeBezierPath = (nextStartPoint) => {
    /**
     * Smooth the join between beziers by modifying
     * the last pointof the current bezier to equal
     * the average of the points either side of it.
     */
    const touchPoint2 = this._curPoints[2].p;
    const touchPoint3 = averagePoints(touchPoint2, nextStartPoint);
    this._curPoints[3] = makeWeightedPoint(touchPoint2, touchPoint3);

    this._generateBezierPath(true);
  };

  _generateBezierPath = (finalized = false) => {
    const eventIdx = this._curPoints.length - 1;
    if (EVENTS[eventIdx]) {
      this.emit(EVENTS[eventIdx], {
        finalized,
        points: this._curPoints,
      });
    }
  };
}

export default BezierProvider;