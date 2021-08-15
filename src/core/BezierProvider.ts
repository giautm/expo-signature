import { EventEmitter } from 'fbemitter';
import { vec2 } from 'gl-matrix';

const EVENTS = [
  'dot',
  'line',
  'quadCurve',
  'bezierCurve',
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

export function calculateWeight(a: vec2, point: vec2) {
  const invertLength = Math.max(0, MAX_LENGTH_RANGE - vec2.distance(a, point));
  return GRADIENT * invertLength + CONSTANT;
};

class BezierProvider extends EventEmitter {
  length: number = 0
  points = [
    { point: vec2.create(), weight: 0 },
    { point: vec2.create(), weight: 0 },
    { point: vec2.create(), weight: 0 },
    { point: vec2.create(), weight: 0 },
  ];

  addPoint = (point: vec2) => {
    let weight = DOT_SIGNATURE_WEIGHT;
    if (this.length > 0) {
      const previewPoint = this.points[this.length - 1].point;
      if (vec2.distance(previewPoint, point) < TOUCH_DISTANCE_THRESHOLD) {
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

  addPointAndWeight = (point: vec2, weight: number) => {
    vec2.copy(this.points[this.length].point, point);
    this.points[this.length].weight = weight;
    this.length++;
  };

  finalizeBezierPath = (point3rd: vec2) => {
    /**
     * Smooth the join between beziers by modifying
     * the last pointof the current bezier to equal
     * the average of the points either side of it.
     */
    const point2nd = this.points[2].point;
    const pointAvg = this.points[3].point;
    vec2.scale(pointAvg, vec2.add(pointAvg, point2nd, point3rd), 0.5);
    this.points[3].weight = calculateWeight(point2nd, pointAvg);
    this.length = 4;

    this.generateBezierPath(true);
    this.length = 0;
  };

  generateBezierPath = (finalized = false) => {
    this.emit('drawPath', {
      type: EVENTS[this.length - 1],
      points: this.points,
    }, finalized);
  };
}

export default BezierProvider;