import regl from 'regl';

const drawTriangle = regl({
  // Shaders in regl are just strings.  You can use glslify or whatever you want
  // to define them.  No need to manually create shader objects.
  frag: `
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }
  `,
  vert: `
    attribute vec4 position;

    uniform mat4 projection;

    void main() {
      gl_Position = projection * position;
    }
  `,
  attributes: {
    position: regl.prop('position'),
  },
  uniforms: {
    color: regl.prop('color'),
    projection: regl.prop('projection'),
  },
  primitive: 'triangles',
});