import React from 'react';
import {
  PanResponder, 
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { GLView } from 'expo';
import { EventEmitter } from 'fbemitter';
import { mat4, vec2 } from 'gl-matrix';

import { createLineShader } from './shader';
import BezierProvider from './BezierProvider';
import BezierPathWeightedPoint from './BezierPath_WeightedPoint';
import MeshController from './mesh/MeshController';


class Signature extends React.Component {
  static defaultProps = {
    emitter: new EventEmitter(),
    defaultButtons: true,
  };

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

    this.bezierProvider.addListener('doDot', (points) => {
      this._drawUpdates(weightedPath.dot(points));
    });
    // this.bezierProvider.addListener('doLine', (points) => {
    //   this._drawUpdates(weightedPath.line(points));
    // });
    // this.bezierProvider.addListener('doQuadCurve', (points) => {
    //   this._drawUpdates(weightedPath.quadCurve(points));
    // });
    this.bezierProvider.addListener('doBezierCurve', (points) => {
      // this._drawUpdates(weightedPath.linear(points.slice(2)), true);
      // this._drawUpdates(weightedPath.quadCurve(points.slice(3)), true);
      this._drawUpdates(weightedPath.bezierCurve(points));
    });

    this.props.emitter.addListener('clear', this.clearSignature);
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

  _drawUpdates = (getVertexData, clear = false) => {
    this._gl.useProgram(this.lineShader.program);

    const vertexData = new Float32Array(getVertexData());
    this.meshController.draw(vertexData, vertexData.length / 2);

    this._gl.flush();
    this._gl.endFrameEXP();

    // requestAnimationFrame(() => {

    // });
  };

  _setupProjection = () => {
    if (this._layout && this.lineShader) {
      const { width, height } = this._layout;

      const projection = mat4.ortho(mat4.create(),
        0, width, height, 0, -1.0, 1.0);

      this._gl.useProgram(this.lineShader.program);
      this._gl.uniformMatrix4fv(this.lineShader.projectionUniform,
        false, projection);

        // const weightedPath = new BezierPathWeightedPoint();
        // this._drawUpdates(weightedPath.dot([
        //   {
        //     point: vec2.fromValues(180, 180),
        //     weight: 200,
        //   }
        // ]));
    }
  };

  _initWebGL = (gl) => {
    this._gl = gl;

    // Clear
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.meshController = new MeshController();
    this.meshController.setupWebGL(gl);
    this.lineShader = createLineShader(gl);
    this._setupProjection();
  };

  _onLayout = (evt) => {
    this._layout = evt.nativeEvent.layout;
    this._setupProjection();
  };

  _translationWithLayout = (page) => {
    if (this._layout) {
      return vec2.fromValues(page.pageX - this._layout.x,
        page.pageY - this._layout.y);
    }

    return vec2.fromValues(
      page.pageX, page.pageY);
  };

  clearSignature = () => {
    console.log('Do Clear');
    // Clear
    this._gl.clearColor(0, 0, 0, 1);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

    this._gl.flush();
    this._gl.endFrameEXP();
  };

  _handlePress = () => {
    this.props.emitter.emit('clear');
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
        {this.props.defaultButtons && (
          <TouchableOpacity
          onPress={this._handlePress}
          style={styles.buttonClear}>
            <View style={{flex: 1}}>
              <Text style={styles.buttonClearText}>Xóa</Text>
            </View>
          </TouchableOpacity>
        )}
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
  buttonClear: {
    position: 'absolute',
    top: 5,
    left: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
  },
  buttonClearText: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#fff',
  },
});

export default Signature;