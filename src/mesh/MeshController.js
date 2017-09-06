// @flow
import { VertexAttrib } from '../shader/Shader';

class MeshController {
  _gl: any;

  setupWebGL = (gl: any) => {
    this._gl = gl;
    this.setupVAO();
  };

  getContextGL = (): any => {
    if (this._gl) {
      return this._gl;
    }
    throw new Error('WebGL not initialized ');
  };

  setupVAO = () => {
    const gl = this.getContextGL();
    // Create buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.enableVertexAttribArray(VertexAttrib.Position);
    gl.vertexAttribPointer(VertexAttrib.Position,
      2, gl.FLOAT, false, 0, 0);
  };

  draw = (vertexData, elements) => {
    const gl = this.getContextGL();

    gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, elements);
  };
}

export default MeshController;