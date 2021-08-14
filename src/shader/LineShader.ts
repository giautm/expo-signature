import type { ExpoWebGLRenderingContext } from "expo-gl";
import Shader, { VertexAttrib } from "./Shader";

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
      gl_FragColor = vec4(0.0/255.0, 0.0/255.0, 0.0/255.0, 1.0);
    }
  `,
};

export class LineShader extends Shader {
  projectionUniform: WebGLUniformLocation | null = null

  bindAttributeLocations = () => {
    if (this.program) {
      this._gl.bindAttribLocation(
        this.program,
        VertexAttrib.Position,
        "position"
      );
    }
  };

  getUniformLocations = () => {
    if (this.program) {
      this.projectionUniform = this._gl.getUniformLocation(
        this.program,
        "projection"
      );
    }
  };
}

export default (gl: WebGL2RenderingContext) => {
  const shader = new LineShader(gl);
  shader.loadProgram(LINE_SHADERS);

  return shader;
};
