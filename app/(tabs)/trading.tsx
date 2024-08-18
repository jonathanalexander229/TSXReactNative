import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, Platform } from 'react-native';

export default function TradingScreen() {
  return (
    <WebView
      style={styles.container}
      source={{ uri: 'https://www.topstepx.com' }}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});