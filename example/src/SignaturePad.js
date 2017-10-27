import React from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import {
  GLView,
} from 'expo';

import Matrix4 from './utils/matrix4';
import LineMeshController from './mesh/LineMeshController';
import { createLineShader, VertexAttrib } from './shader';
import SignatureModel from './SignatureModel';

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
    this._model = new SignatureModel();
    this._model.addListener('onDraw', this._drawUpdates);
  }

  _onResponderGrant = (evt) => {
    this._model.onBegan(this._translationWithLayout(evt.nativeEvent));
  }

  _onResponderMove = (evt) => {
    this._model.onMoved(this._translationWithLayout(evt.nativeEvent));
  }

  _onResponderRelease = (evt) => {
    this._model.onEnded(this._translationWithLayout(evt.nativeEvent));
  }

  _drawUpdates = (points) => {
    // this._gl.bindVertexArray(this.lineMeshController.VAO);
    this._gl.useProgram(this.lineShader.program);

    this.lineMeshController.draw(this._gl, points);

    this._gl.flush();
    this._gl.endFrameEXP();
  };

  _setupProjection = () => {
    if (this._layout && this.lineShader) {
      const { width, height } = this._layout;

      const projection = new Float32Array(16);
      Matrix4.ortho(projection, 0, width, height, 0, -1.0, 1.0);

      this._gl.useProgram(this.lineShader.program);
      this._gl.uniformMatrix4fv(this.lineShader.projectionUniform,
        false, projection);

      console.log('_setupProjection: OK!');
    }
  };

  _initWebGL = (gl) => {
    this._gl = gl;

    // Clear
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.lineMeshController = new LineMeshController();
    this.lineMeshController.setupWebGL(gl);
    this.lineShader = createLineShader(gl);
    this._setupProjection();
  };

  _onLayout = (evt) => {
    this._layout = evt.nativeEvent.layout;
    console.log('Layout: ', this._layout);
    this._setupProjection();
  };

  _translationWithLayout = (page) => {
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
  };

  render() {
    return (
      <View
        onLayout={this._onLayout}
        style={styles.container}>
        <GLView
          onContextCreate={this._initWebGL}
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