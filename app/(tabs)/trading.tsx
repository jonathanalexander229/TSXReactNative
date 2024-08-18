import React from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar, Platform } from 'react-native';
import NoZoomWebView from '../../components/NoZoomWebView';

export default function TradingScreen() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});