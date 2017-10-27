import Vector from './utils/vector2';
const signatureWeightForLineBetweenPoint = (pointA, pointB) => {
  /**
   * The is the maximum length that will vary weight.
   * Anything higher will return the same weight.
   */
  const MAX_LENGTH_RANGE = 500.0;

  /**
   * These are based on having a minimum line thickness of 2.0 and maximum of 7,
   * linearly over line lengths 0-maxLengthRange.
   * They fit into a typical linear equation: y = mx + c
   * 
   * Note: Only the points of the two parallel bezier curves will be
   * at least as thick as the constant. The bezier curves themselves
   * could still be drawn with sharp angles, meaning there is no true
   * 'minimum thickness' of the signature.
   */
  const GRADIENT = 0.01;
  const CONSTANT = 2.0;

  const length = Vector.length(Vector.sub(pointB, pointA));
  const inversedLength = Math.max(0, MAX_LENGTH_RANGE - length);

  return inversedLength * GRADIENT + CONSTANT;
};

export default class Line {
  constructor(gl, options) {
    this._gl = gl;
    this._options = options;
    this._lastPoint = null;
    this._points = [];
  }

  onBegan = (point) => {
    this._lastPoint = point;
    this._points.push(this._lastPoint);
  }

  onMoved = (point) => {
    const fromPoint = this._lastPoint;

    this._lastPoint = point;
    this._points.push(this._lastPoint);

    this.drawLine(fromPoint);
  }

  onEnded = (point) => {
    const fromPoint = this._lastPoint;

    this._lastPoint = point;
    this._points.push(this._lastPoint);

    this.drawLine(fromPoint);
  }

  drawLine = (fromPoint) => {
    const endPoint = this._lastPoint;

    const curWidth = signatureWeightForLineBetweenPoint(fromPoint, endPoint)
    const oldWidth = this._oldWitdh || curWidth;
    this._oldWitdh = curWidth;

    console.log(curWidth);

    const perpendicular = Vector.normalize(Vector.perpendicular(
      Vector.sub(fromPoint, endPoint)));
    const began = Vector.multiplyScalar(perpendicular, (oldWidth / 2));
    const ended = Vector.multiplyScalar(perpendicular, (curWidth / 2));

    const A = Vector.add(began, fromPoint);
    const B = Vector.sub(began, fromPoint);
    const C = Vector.add(ended, endPoint);
    const D = Vector.sub(ended, endPoint);

    const verts = new Float32Array(
      A.concat(C).concat(B).concat(C).concat(B).concat(D));

    this._gl.bufferData(this._gl.ARRAY_BUFFER, verts, this._gl.STATIC_DRAW);
    this._gl.drawArrays(this._gl.TRIANGLES, 0, verts.length);
    this._gl.flush();
    this._gl.endFrameEXP();
  }


  toSvgPath = () => {
    // TODO: Implement method that allow convert the points to Svg Path.
  }
};
