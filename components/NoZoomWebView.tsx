import React from 'react';
import { WebView, WebViewProps, WebViewMessageEvent } from 'react-native-webview';
import { StyleSheet } from 'react-native';

const disablePinchZoomJS = `
(function() {
  function disablePinchZoom() {
    document.addEventListener('touchmove', function(event) {
      if (event.scale !== 1) { event.preventDefault(); }
    }, { passive: false });
  }
  disablePinchZoom();
  document.addEventListener('DOMContentLoaded', disablePinchZoom);
})();
true;
`;

const NoZoomWebView: React.FC<WebViewProps> = (props) => {
  const handleMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    console.log('Received message from WebView:', data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON data:', jsonData);
      // Handle JSON data here if needed
    } catch (error) {
      // If it's not JSON, just log it as a string
      console.log('Received non-JSON message:', data);
    }
  };

  return (
    <WebView
      {...props}
      injectedJavaScript={disablePinchZoomJS}
      style={styles.webview}
      scalesPageToFit={false}
      onMessage={handleMessage}
    />
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});

export default NoZoomWebView;