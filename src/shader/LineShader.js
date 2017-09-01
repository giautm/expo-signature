import Shader, { VertexAttrib } from './Shader';

const LINE_SHADERS = {
  vert: `
    attribute vec4 position;

    uniform mat4 projection;

    void main() {
      gl_Position = projection * position;
    }
  `,
  frag: `
    void main() {
      gl_FragColor = vec4(255.0/255.0, 255.0/255.0, 255.0/255.0, 1.0);
    }
  `,
};

export class LineShader extends Shader {
  bindAttributeLocations = () => {
    // vec4(255.0/255.0, 255.0/255.0, 255.0/255.0, 1.0)
    this._gl.bindAttribLocation(this.program,
      VertexAttrib.Position, 'position');
    // this._gl.bindAttribLocation(this.program,
    //   VertexAttrib.Color, 'color');
  };

  getUniformLocations = () => {
    this.projectionUniform = this._gl.getUniformLocation(
      this.program, 'projection');
  };
}

export default (gl) => {
  const shader = new LineShader(gl);
  shader.loadProgram(LINE_SHADERS);

  return shader;
};