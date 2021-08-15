import React from "react";
import {
  AppStateStatus,
  LayoutChangeEvent,
  LayoutRectangle,
  NativeTouchEvent,
  PanResponder,
  PanResponderInstance,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GLView } from "expo-gl";
import { vec2 } from "gl-matrix";
import { AppState } from "react-native";

import BezierProvider from "./core/BezierProvider";
import BezierPath_WeightedPoint from "./core/BezierPath_WeightedPoint";
import Drawer, { WebGLDrawer } from "./drawer";

type Props = {
  defaultButtons?: boolean;
};

class Signature extends React.Component<Props> {
  static defaultProps = {
    defaultButtons: true,
  };

  _layout: LayoutRectangle | null = null;
  _panResponder: PanResponderInstance;
  bezierProvider: BezierProvider;
  drawer: Drawer | null = null;

  constructor(props: Props) {
    super(props);
    this.bezierProvider = new BezierProvider();
    this.bezierProvider.addListener(
      "drawPath",
      (ev: any, finalized: boolean) => {
        const { type, points } = ev;
        if (type === "line" || type === "quadCurve") {
          return;
        }

        if (this.drawer) {
          const helper = new WebGLDrawer(this.drawer.drawUpdates);
          // @ts-ignore
          BezierPath_WeightedPoint[type](points, helper);
        }
      }
    );

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: ({ nativeEvent }) => {
        this.bezierProvider.addPoint(this._translationWithLayout(nativeEvent));
      },
      onPanResponderMove: ({ nativeEvent }) => {
        this.bezierProvider.addPoint(this._translationWithLayout(nativeEvent));
      },
      onPanResponderRelease: () => {
        this.bezierProvider.reset();
      },
    });
  }

  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      console.log("App has come to the foreground!");
      // Trying to redrawing everythings
      this.drawer?.redraw();
    }
  };

  _handleContextCreate = (gl: WebGL2RenderingContext) => {
    this.drawer = new Drawer(gl);
    if (this._layout) {
      this.drawer.resize(this._layout.width, this._layout.height);
    }
  };

  _onLayout = (evt: LayoutChangeEvent) => {
    this._layout = evt.nativeEvent.layout;
    this.drawer?.resize(this._layout.width, this._layout.height);
  };

  _translationWithLayout = (page: NativeTouchEvent) => {
    if (this._layout) {
      return vec2.fromValues(
        page.pageX - this._layout.x,
        page.pageY - this._layout.y
      );
    }

    return vec2.fromValues(page.pageX, page.pageY);
  };

  clearSignature = () => {
    console.log("Do Clear");
    this.drawer?.reset();
  };

  _handlePress = () => {
    this.drawer?.reset();
  };

  render() {
    return (
      <View onLayout={this._onLayout} style={styles.container}>
        <GLView
          onContextCreate={this._handleContextCreate}
          style={StyleSheet.absoluteFill}
          {...this._panResponder.panHandlers}
        />
        {this.props.defaultButtons && (
          <TouchableOpacity
            onPress={this._handlePress}
            style={styles.buttonClear}
          >
            <View style={{ flex: 1 }}>
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
    backgroundColor: "#fff",
    flex: 1,
    margin: 10,
  },
  buttonClear: {
    position: "absolute",
    top: 5,
    left: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 5,
  },
  buttonClearText: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#fff",
  },
});

export default Signature;
