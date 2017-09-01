import { EventEmitter } from 'fbemitter';
import Vec2 from 'gl-matrix-vec2';

const EVENTS = [
  'doDot',
  'doLinear',
  'doQuadCurve',
  'doBezierCurve',
];

const TOUCH_DISTANCE_THRESHOLD = 2.0;

/**
 * Weight for a dot
 */
const DOT_SIGNATURE_WEIGHT = 6.0;

/**
 * The is the maximum length that will vary weight.
 * Anything higher will return the same weight.
 */
const MAX_LENGTH_RANGE = 50.0;

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

export function makeWeightedPoint(a, point) {
  const invertLength = Math.max(0, MAX_LENGTH_RANGE - Vec2.distance(a, point));
  const weight = GRADIENT * invertLength + CONSTANT;
  return ({ point, weight });
};

class BezierProvider extends EventEmitter {
  constructor() {
    super();
    this.points = [];
  }

  addPoint = (point) => {
    if (this.points.length === 0) {
      this.points.push({
        point,
        weight: DOT_SIGNATURE_WEIGHT,
      });
    } else {
      const previewPoint = this.points[this.points.length - 1].point;
      if (Vec2.length(previewPoint, point) < TOUCH_DISTANCE_THRESHOLD) {
        return;
      }

      const isStartPointOfNextLine = this.points.length > 2;
      if (isStartPointOfNextLine) {
        this.finalizeBezierPath(point);
        this.points = this.points.slice(-1);
      }
      this.points.push(makeWeightedPoint(previewPoint, point));
    }

    this.generateBezierPath();
  };

  reset = () => {
    this.points.length = 0;
  };

  finalizeBezierPath = (point3rd) => {
    /**
     * Smooth the join between beziers by modifying
     * the last pointof the current bezier to equal
     * the average of the points either side of it.
     */
    const point2nd = this.points[2].point;
    const pointAvg = Vec2.create();
    Vec2.scale(pointAvg, Vec2.add(pointAvg, point2nd, point3rd), 0.5);
    this.points[3] = makeWeightedPoint(point2nd, pointAvg);

    this.generateBezierPath(true);
  };

  generateBezierPath = (finalized = false) => {
    const event = EVENTS[this.points.length - 1];
    this.emit(event, this.points, finalized);
  };
}

export default BezierProvider;