import React from 'react';

import SignaturePad from 'expo-signature';

export default class App extends React.Component {
  render() {
    return (
      <SignaturePad style={{flex: 1}}/>
    );
  }
}