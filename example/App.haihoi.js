import React from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { GLView } from 'expo';

const fragSrc = `
void main() {
  gl_FragColor = vec4(80.0/255.0, 0.0/255.0, 160.0/255.0, 1.0);
}
`;

const vertSrc = `
attribute vec2 position;
uniform vec2 u_resolution;
void main() {
  // convert the rectangle points from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = (zeroToTwo - vec2(1,1)) * vec2(1, -1);
  gl_Position = vec4(clipSpace, 0.0, 1.0);
}
`;

export default class App extends React.Component {
  constructor(props, context) {
    super(props, context);

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: (evt, gs) => this.onResponderGrant(evt, gs),
      onPanResponderMove: (evt, gs) => this.onResponderMove(evt, gs),
      onPanResponderRelease: (evt, gs) => this.onResponderRelease(evt, gs)
    });
    this._points = [];
    this._lastTime = null;
    this._oldPoint = [];
    this._newPoint = this._oldPoint;
  }

  onMyTouch(evt) {
    let [x, y] = [evt.nativeEvent.pageX - this.baseX, evt.nativeEvent.pageY - this.baseY];
    console.log(x,y);
    const now = Date.now();
    if (this._lastTime === null) {
      this._lastTime = now;
    }
    const timestamp = now - this._lastTime;
    this._points.push({
      x: x,
      y: y
    });
    // if (this._points.length > 3) {
    //   this.drawTest(new Float32Array([
    //     this._points[0].x, this._points[0].y,
    //     this._points[1].x, this._points[1].y,
    //     this._points[2].x, this._points[2].y,
    //     this._points[3].x, this._points[3].y,
    //   ]), true);
    //   this._points = [];
    // }
  }

  onResponderGrant(evt) {
    this.onMyTouch(evt);
    let [x, y] = [evt.nativeEvent.pageX - this.baseX, evt.nativeEvent.pageY - this.baseY];
    this._newPoint = [x,y];
    this._oldPoint = this._newPoint;
  }

  onResponderMove(evt) {
    this.onMyTouch(evt);
    let [x, y] = [evt.nativeEvent.pageX - this.baseX, evt.nativeEvent.pageY - this.baseY];
    this._newPoint = [x,y];
    const line = this._oldPoint.concat(this._newPoint);
    this.drawLine(new Float32Array(line),true);
   
    console.log('line:', [this._oldPoint, this._newPoint ]);
    this._oldPoint = this._newPoint;
 }

  onResponderRelease(evt) {
    const r = [];
    this._points.forEach(({x,y}) => {
      r.push(x);
      r.push(y);
    });
    console.log('array:', r);
    this.drawLine(new Float32Array(r));
    
  }

  drawLine(verts, flush = true) {
    this._gl.bufferData(this._gl.ARRAY_BUFFER, verts, this._gl.STATIC_DRAW);
    this._gl.drawArrays(this._gl.LINES, 0, verts.length);
    this._gl.flush();
    this._gl.endFrameEXP();
  }
  drawPolygon(verts, flush = true) {
    this._gl.bufferData(this._gl.ARRAY_BUFFER, verts, this._gl.DYNAMIC_DRAW);
    this._gl.drawArrays(this._gl.POLYGONS, 0, verts.length);
    this._gl.flush();
    this._gl.endFrameEXP();
  }

  _onLayout = (evt) => {
    const { x, y, width, height } = evt.nativeEvent.layout;
    this.baseX = x;
    this.baseY = y;
    this.baseWidth = width;
    this.baseHeight = height;
    console.log(width, height, x,y);
    
    this._gl.uniform2f(this.resolutionLocation, this.baseWidth , this.baseHeight);
    this.drawPolygon(new Float32Array([
      280, 0, 280, 528, 0, 528
    ]), true);
  }

  _onContextCreate = (gl) => {
    console.log('a');
    this._gl = gl;
    gl.enableLogging = __DEV__;

    // Compile vertex and fragment shader
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
    const positionAttrib = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionAttrib);
    gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    this.resolutionLocation = resolutionLocation;
    //gl.uniform2f(resolutionLocation, 1, 1);
   
  };

  render() {
    return (
      <View
        onLayout={this._onLayout}
        style={styles.container}>
        <GLView
          onContextCreate={this._onContextCreate}
          style={StyleSheet.absoluteFill}
          {...this._panResponder.panHandlers}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
});
