// @flow
import type { Vector2 } from '../utils/vector2';

import Vector from '../utils/vector2';

import MeshController from './MeshController';
import { VertexAttrib } from '../shader/Shader';

const VERTICES_IN_SEGMENT = 2;
const DATASIZE_OF_SEGMENT = VERTICES_IN_SEGMENT * 2; // multiply 2 for x and y
const INDICIES_IN_SEGMENT = 6;

export type SegmentPoint = {
  first: Vector2,
  second: Vector2
};

class LineMeshController extends MeshController {
  setupVAO = () => {
    const gl = this.getContextGL();
    // this.VAO = gl.createVertexArray();
    // gl.bindVertexArray(this.VAO);

    // Create buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.enableVertexAttribArray(VertexAttrib.Position);
    gl.vertexAttribPointer(VertexAttrib.Position,
      2, gl.FLOAT, false, 0, 0);

    // gl.bindVertexArray(null);
  };

  draw = (segments: Array<SegmentPoint> = []) => {
    if (Array.isArray(segments) && segments.length > 0) {
      const gl = this.getContextGL();

      const vertexData = new Float32Array(
        segments.length * DATASIZE_OF_SEGMENT);
      const indexData = new Uint16Array(
        segments.length * INDICIES_IN_SEGMENT);

      const lastIndex = segments.length - 1;
      for (let index = 0; index <= lastIndex; ++index) {
        const offset = index * DATASIZE_OF_SEGMENT;
        // const subdivision = points[index];
        // const haflWeight = subdivision.w * 0.5;

        // vertexData.set(Vector2.add(subdivision.p,
        //   Vector2.multiplyScalar(subdivision.n, +haflWeight)), offset);
        // vertexData.set(Vector2.add(subdivision.p,
        //   Vector2.multiplyScalar(subdivision.n, -haflWeight)), offset + 2);
        vertexData.set(segments[index].first, offset);
        vertexData.set(segments[index].second, offset + 2);

        if (index < lastIndex) {
          const startVertex = index * VERTICES_IN_SEGMENT;

          indexData.set([
            startVertex,
            startVertex + 2,
            startVertex + 1,
  
            startVertex + 1,
            startVertex + 2,
            startVertex + 3,
          ], index * INDICIES_IN_SEGMENT);
        }
      }

      gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);

      gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
    }
  };
}

export default LineMeshController;