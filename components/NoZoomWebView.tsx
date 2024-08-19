import React, { useState, useRef } from 'react';
import { WebView, WebViewProps, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';
import RequestsView from './RequestsView';

const monitoringScript = `
(function() {
  var observer = new MutationObserver(function(mutations) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'domChange',
      data: mutations.length + ' changes'
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Intercept console.log calls
  var originalConsoleLog = console.log;
  console.log = function() {
    var args = Array.from(arguments);
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'consoleLog',
      data: args.join(' ')
    }));
    originalConsoleLog.apply(console, args);
  };

  true; // note: this is required, or you'll sometimes get silent failures
})();
`;

const NoZoomWebView: React.FC<WebViewProps> = (props) => {
  const [events, setEvents] = useState<string[]>([]);
  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = event.nativeEvent.data;
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(message);
      } catch (jsonError) {
        // If it's not JSON, treat it as a plain string
        parsedMessage = { type: 'unknown', data: message };
      }

      const { type, data } = parsedMessage;
      let formattedMessage = '';
      switch (type) {
        case 'domChange':
          formattedMessage = `DOM Change: ${data}`;
          break;
        case 'consoleLog':
          formattedMessage = `Console: ${data}`;
          break;
        default:
          formattedMessage = `Unknown: ${JSON.stringify(data)}`;
      }
      setEvents(prevEvents => [...prevEvents, formattedMessage].slice(-50)); // Keep last 50 events
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  };

  const onShouldStartLoadWithRequest = (event: WebViewNavigation) => {
    const { url, method, headers } = event;
    const requestInfo = `${method} ${url}\nHeaders: ${JSON.stringify(headers)}`;
    setEvents(prevEvents => [...prevEvents, requestInfo].slice(-50)); // Keep last 50 events
    return true; // Allow the request to proceed
  };

  return (
    <View style={styles.container}>
      <WebView
        {...props}
        ref={webViewRef}
        injectedJavaScript={monitoringScript}
        style={styles.webview}
        scalesPageToFit={false}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsBackForwardNavigationGestures={false}
        allowsLinkPreview={false}
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        incognito={false}
        applicationNameForUserAgent="TopStep"
      />
      {/* <RequestsView events={events} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default NoZoomWebView;