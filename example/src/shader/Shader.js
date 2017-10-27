export const VertexAttrib = {
  Alpha: 4,
  Color: 2,
  Normal: 1,
  Position: 0,
  TexCoord: 3,
};

class Shader {
  constructor(gl) {
    this._gl = gl;
  }

  loadProgram = (shaders) => {
    if (this.program) {
      return true;
    }

    // Compile vertex and fragment shader
    const vertShader = this.compileShader(this._gl.VERTEX_SHADER, shaders.vert);
    const fragShader = this.compileShader(this._gl.FRAGMENT_SHADER, shaders.frag);

    const program = this._gl.createProgram();
    this._gl.attachShader(program, vertShader);
    this._gl.attachShader(program, fragShader);

    this.bindAttributeLocations();
    if (this.linkProgram(program)) {
      this.getUniformLocations();

      this.program = program;

      if (vertShader) {
        this._gl.detachShader(program, vertShader);
        this._gl.deleteShader(vertShader);
      }

      if (fragShader) {
        this._gl.detachShader(program, fragShader);
        this._gl.deleteShader(fragShader);
      }

      return true;
    }

    if (vertShader) {
      this._gl.deleteShader(vertShader);
    }

    if (fragShader) {
      this._gl.deleteShader(fragShader);
    }

    if (program) {
      this._gl.deleteProgram(program);
    }

    return false;
  };

  cleanUp = () => {
    if (this.program) {
      this._gl.deleteProgram(this.program);
      this.program = null;
    }
  };

  linkProgram = (program) => {
    try {
      this._gl.linkProgram(program);

      const error = this._gl.getProgramInfoLog(program);
      if (error.length > 0) {
        throw new Error(error);
      }

      return this._gl.getProgramParameter(program, this._gl.LINK_STATUS);
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  compileShader = (type, src) => {
    if (this._gl) {
      const shader = this._gl.createShader(type);
      this._gl.shaderSource(shader, src);
      this._gl.compileShader(shader);

      const error = this._gl.getShaderInfoLog(shader);
      if (error.length > 0) {
        this._gl.deleteShader(shader);
        throw new Error(error);
      }

      const success = this._gl.getShaderParameter(
        shader, this._gl.COMPILE_STATUS);
      if (success) {
        return shader;
      } else {
        this._gl.deleteShader(shader);
      }
    }

    throw new Error('WebGL not initialized');
  };

  bindAttributeLocations = () => {
    throw new Error('Abstract method, implement in subclass');
  };

  getUniformLocations = () => {
    throw new Error('Abstract method, implement in subclass');
  };
}

export default Shader;