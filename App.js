import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import Signature from './src';

export default class App extends Component {

  render() {
    return (
      <Signature
        style={styles.container}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
