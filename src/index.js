import React from 'react';
import {
  PanResponder, 
  StyleSheet,
  View,
} from 'react-native';
import { GLView } from 'expo';

import Mat4 from 'gl-matrix-mat4';
import Vec2 from 'gl-matrix-vec2';

import { createLineShader } from './shader';
import BezierProvider from './BezierProvider';
import BezierPathWeightedPoint from './BezierPath_WeightedPoint';
import LineMeshController from './mesh/LineMeshController';

class Signature extends React.Component {

  constructor(props, context) {
    super(props, context);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: this._onResponderGrant,
      onPanResponderMove: this._onResponderMove,
      onPanResponderRelease: this._onResponderRelease,
    });

    const weightedPath = new BezierPathWeightedPoint();
    this.bezierProvider = new BezierProvider();

    // this.bezierProvider.addListener('doDot', (points) => {
    //   this._drawUpdates(weightedPath.dot(points));
    // });
    // this.bezierProvider.addListener('doLinear', (points) => {
    //   this._drawUpdates(weightedPath.linear(points));
    // });
    // this.bezierProvider.addListener('doQuadCurve', (points) => {
    //   this._drawUpdates(weightedPath.quadCurve(points));
    // });
    this.bezierProvider.addListener('doBezierCurve', (points) => {
      // this._drawUpdates(weightedPath.linear(points.slice(2)), true);
      // this._drawUpdates(weightedPath.quadCurve(points.slice(3)), true);
      this._drawUpdates(weightedPath.bezierCurve(points));
    });
  }

  _onResponderGrant = (evt) => {
    this.bezierProvider.addPoint(this._translationWithLayout(evt.nativeEvent));
  }

  _onResponderMove = (evt) => {
    this.bezierProvider.addPoint(this._translationWithLayout(evt.nativeEvent));
  }

  _onResponderRelease = (evt) => {
    this.bezierProvider.reset();
  }

  _drawUpdates = (positions, clear = false) => {
    this._gl.useProgram(this.lineShader.program);

    // if (clear) {
    //   this._gl.uniform4f(this.lineShader.colorUniform,
    //     0,0,0,1);
    // } else {
    //   this._gl.uniform4f(this.lineShader.colorUniform,
    //     1,1,1,1);
    // }
    this.lineMeshController.draw(positions);

    this._gl.flush();
    this._gl.endFrameEXP();
  };

  _setupProjection = () => {
    if (this._layout && this.lineShader) {
      const { width, height } = this._layout;

      const projection = Mat4.ortho(Mat4.create(),
        0, width, height, 0, -1.0, 1.0);

      this._gl.useProgram(this.lineShader.program);
      this._gl.uniformMatrix4fv(this.lineShader.projectionUniform,
        false, projection);
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
    this._setupProjection();
  };

  _translationWithLayout = (page) => {
    if (this._layout) {
      return Vec2.fromValues(page.pageX - this._layout.x,
        page.pageY - this._layout.y);
    }

    return Vec2.fromValues(
      page.pageX, page.pageY);
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 10,
  },
});

export default Signature;