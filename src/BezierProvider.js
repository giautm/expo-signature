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

export function calculateWeight(a, point) {
  const invertLength = Math.max(0, MAX_LENGTH_RANGE - Vec2.distance(a, point));
  return GRADIENT * invertLength + CONSTANT;
};

class BezierProvider extends EventEmitter {
  constructor() {
    super();
    this.length = 0;
    this.points = [
      { point: Vec2.create(), weight: 0 },
      { point: Vec2.create(), weight: 0 },
      { point: Vec2.create(), weight: 0 },
      { point: Vec2.create(), weight: 0 },
    ];
  }

  addPoint = (point) => {
    let weight = DOT_SIGNATURE_WEIGHT;
    if (this.length > 0) {
      const previewPoint = this.points[this.length - 1].point;
      if (Vec2.length(previewPoint, point) < TOUCH_DISTANCE_THRESHOLD) {
        return;
      }

      if (this.length > 2) {
        this.finalizeBezierPath(point);
        this.addPointAndWeight(this.points[3].point, this.points[3].weight);
      }
      weight = calculateWeight(previewPoint, point);
    }
    this.addPointAndWeight(point, weight);

    this.generateBezierPath();
  };

  reset = () => {
    this.length = 0;
  };

  addPointAndWeight = (point, weight) => {
    Vec2.copy(this.points[this.length].point, point);
    this.points[this.length].weight = weight;
    this.length++;
  };

  finalizeBezierPath = (point3rd) => {
    /**
     * Smooth the join between beziers by modifying
     * the last pointof the current bezier to equal
     * the average of the points either side of it.
     */
    const point2nd = this.points[2].point;
    const pointAvg = this.points[3].point;
    Vec2.scale(pointAvg, Vec2.add(pointAvg, point2nd, point3rd), 0.5);
    this.points[3].weight = calculateWeight(point2nd, pointAvg);
    this.length = 4;

    this.generateBezierPath(true);
    this.length = 0;
  };

  generateBezierPath = (finalized = false) => {
    this.emit(EVENTS[this.length - 1], this.points, finalized);
  };
}

export default BezierProvider;