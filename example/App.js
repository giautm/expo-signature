import React from 'react';

import SignaturePad from './src/SignaturePad';

export default class App extends React.Component {
  render() {
    return (
      <SignaturePad style={{flex: 1}}/>
    );
  }
}