

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
    const oldWidth = 4;
    const curWidth = 4;

    const x = (endPoint.y - fromPoint.y);
    const y = -(endPoint.x - fromPoint.x);

    const length = Math.sqrt(x * x + y * y);
    const newX = x / length;
    const newY = y / length;

    const A = [
      fromPoint.x + newX * (oldWidth / 2),
      fromPoint.y + newY * (oldWidth / 2),
    ];
    const B = [
      fromPoint.x - newX * (oldWidth / 2),
      fromPoint.y - newY * (oldWidth / 2),
    ];
    const C = [
      endPoint.x + newX * (curWidth / 2),
      endPoint.y + newY * (curWidth / 2),
    ];
    const D = [
      endPoint.x - newX * (curWidth / 2),
      endPoint.y - newY * (curWidth / 2),
    ];

    const verts = new Float32Array(
      A.concat(C).concat(B).concat(C).concat(B).concat(D)
    );

    this._gl.bufferData(this._gl.ARRAY_BUFFER, verts, this._gl.STATIC_DRAW);
    this._gl.drawArrays(this._gl.TRIANGLES, 0, verts.length);
    this._gl.flush();
    this._gl.endFrameEXP();
  }


  toSvgPath = () => {
    // TODO: Implement method that allow convert the points to Svg Path.
  }
};