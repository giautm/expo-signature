// @flow
import MeshController from './MeshController';
import { VertexAttrib } from '../shader/Shader';

const VERTICES_IN_SEGMENT = 2;

/**
 * https://github.com/facebook/react-native/issues/14838#issuecomment-318148455
 */
const getIndiesData = function* (totalVertex, startVertex = 0) {
  for (let i = 0, lastIndex = totalVertex - 1; i < lastIndex; ++i) {
    yield startVertex;
    yield startVertex + 2;
    yield startVertex + 1;
    yield startVertex + 1;
    yield startVertex + 2;
    yield startVertex + 3;

    startVertex += VERTICES_IN_SEGMENT;
  }
}

class LineMeshController extends MeshController {
  setupVAO = () => {
    const gl = this.getContextGL();
    // Create buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.enableVertexAttribArray(VertexAttrib.Position);
    gl.vertexAttribPointer(VertexAttrib.Position,
      2, gl.FLOAT, false, 0, 0);
  };

  draw = (getVertexData) => {
    if (typeof (getVertexData) === 'function') {
      const gl = this.getContextGL();

      const vertexData = new Float32Array(getVertexData());

      gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexData.length / VERTICES_IN_SEGMENT);
    }
  };
}

export default LineMeshController;