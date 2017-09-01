// @flow

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
    throw new Error('Don\'t call me');
  }
}

export default MeshController;