import React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import NoZoomWebView from '../../components/NoZoomWebView';

export default function TradingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NoZoomWebView
          style={styles.webview}
          source={{ uri: 'https://www.topstepx.com' }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});