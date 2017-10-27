import React from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import {
  GLView,
} from 'expo';

import Line from './LineController';

const vertSrc = `
attribute vec2 a_position;

uniform vec2 u_resolution;

void main() {
  // convert the rectangle points from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

const fragSrc = `
void main() {
  gl_FragColor = vec4(255.0/255.0, 255.0/255.0, 255.0/255.0, 1.0);
}
`;

class SignaturePad extends React.Component {

  constructor(props, context) {
    super(props, context);

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: this._onResponderGrant,
      onPanResponderMove: this._onResponderMove,
      onPanResponderRelease: this._onResponderRelease,
    });

    this._lines = [];
  }

  createShaders = () => {

  };

  _initGL = (gl) => {
    this._gl = gl;
    gl.enableLogging = __DEV__;

    // Compile vertex and fragment shader
    console.log('x', gl.VERTEX_ARRAY_BINDING);
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, vertSrc);
    gl.compileShader(vert);

    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragSrc);
    gl.compileShader(frag);

    // Clear
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Link together into a program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);

    // Create buffer
    const buffer = gl.createBuffer();
    // Bind buffer, program and position attribute for use
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Save position attribute
    const positionAttrib = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttrib);

    this._resolutionUniform = gl.getUniformLocation(program, 'u_resolution');
    if (this._layout) {
      console.log('Layout: ', this._layout);
      // _initGL some time call after onLayout call.
      this._gl.uniform2f(this._resolutionUniform,
          this._layout.width, this._layout.height);
    }
  }

  _onLayout = (evt) => {
    this._layout = evt.nativeEvent.layout;
    console.log('Layout: ', this._layout);

    if (this._gl) {
      this._gl.uniform2f(this._resolutionUniform,
          this._layout.width, this._layout.height);
    }
  }

  _onResponderGrant = (evt) => {
    if (!this._currentLine) {
      this._currentLine = new Line(this._gl, {
        minWidth: 4,
        maxWidth: 10,
      });
      this._lines.push(this._currentLine);
      console.log('Lines:', this._lines.length);
    }

    this._currentLine.onBegan(
      this._translationWithPageLayout(evt.nativeEvent));
  }

  _onResponderMove = (evt) => {
    this._currentLine.onMoved(
      this._translationWithPageLayout(evt.nativeEvent));
  }

  _onResponderRelease = (evt) => {
    this._currentLine.onEnded(
      this._translationWithPageLayout(evt.nativeEvent));

    this._currentLine = null;
  }

  _translationWithPageLayout = (page) => {
    if (this._layout) {
      return ([
        page.pageX - this._layout.x,
        page.pageY - this._layout.y,
      ]);
    }

    return ([
      page.pageX,
      page.pageY,
    ]);
  }

  render() {
    return (
      <View
        onLayout={this._onLayout}
        style={styles.container}>
        <GLView
          onContextCreate={this._initGL}
          style={StyleSheet.absoluteFill}
          {...this._panResponder.panHandlers}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 20,
  },
});

export default SignaturePad;