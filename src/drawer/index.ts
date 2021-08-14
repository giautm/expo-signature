import { mat4 } from "gl-matrix";
import { createLineShader, LineShader } from "./shader";
import MeshController from "./mesh/MeshController";
import BezierPathWeightedPoint, { WeightedPoint } from "./BezierPath_WeightedPoint";

class Drawer {
  controller: MeshController;
  lines: Array<Float32Array>;
  lineShader: LineShader;

  constructor(readonly gl: WebGL2RenderingContext) {
    this.gl = gl;

    this.controller = new MeshController();
    this.controller.setupWebGL(gl);
    this.lineShader = createLineShader(gl);
    this.lines = [];

    this._clear();
  }

  _clear() {
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  resize(width: number, height: number) {
    const projection = mat4.ortho(
      mat4.create(),
      0,
      width,
      height,
      0,
      -1.0,
      1.0
    );

    this.gl.useProgram(this.lineShader.program);
    this.gl.uniformMatrix4fv(
      this.lineShader.projectionUniform,
      false,
      projection
    );
  }

  drawUpdates = (type: string, points: WeightedPoint[]) => {
    // @ts-ignore
    this._drawUpdates(BezierPathWeightedPoint[type](points))
  };

  _drawUpdates = (getVertexData: () => Iterable<number>) => {
    this.gl.useProgram(this.lineShader.program);

    const data = new Float32Array(Array.from(getVertexData()));
    this.controller.draw(data, data.length / 2);

    this.lines.push(data);
    this.gl.flush();

    // @ts-ignore
    this.gl.endFrameEXP();
  }

  redraw() {
    this._clear();

    this.gl.useProgram(this.lineShader.program);
    this.lines.forEach((data) => {
      this.controller.draw(data, data.length / 2);
    });

    this.gl.flush();
    // @ts-ignore
    this.gl.endFrameEXP();
  }

  reset() {
    this.lines = [];

    this._clear();

    this.gl.flush();
    // @ts-ignore
    this.gl.endFrameEXP();
  }
}

export default Drawer;
