import React, { useState, useEffect, useRef } from 'react';
import { WebView, WebViewProps, WebViewMessageEvent } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';
import * as Notifications from 'expo-notifications';

const injectedJavaScript = `
(function() {
  // Prevent zooming on input fields
  var meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  document.getElementsByTagName('head')[0].appendChild(meta);

  // Disable zooming on input focus
  document.addEventListener('focus', function(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      event.target.style.fontSize = '16px';
    }
  }, true);

  let previousChildCount = 0;

  function findToastifyContainer() {
    return document.querySelector('.Toastify');
  }

  function observeToastifyContainer() {
    const container = findToastifyContainer();
    if (container) {
      console.log('Toastify container found and being observed');
      const observer = new MutationObserver(function(mutations) {
        const currentChildCount = container.children.length;
        if (currentChildCount > 0 && previousChildCount === 0) {
          console.log('Toastify children count changed from 0 to:', currentChildCount);
          window.ReactNativeWebView.postMessage('toastifyChildrenBecameNonZero');
        }
        previousChildCount = currentChildCount;
      });
      observer.observe(container, { childList: true });
    } else {
      console.log('Toastify container not found');
    }
  }

  // Initial check
  observeToastifyContainer();

  // Set up a MutationObserver for the entire body to catch if the container is added dynamically
  const bodyObserver = new MutationObserver(function(mutations) {
    if (findToastifyContainer()) {
      bodyObserver.disconnect();
      observeToastifyContainer();
    }
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  console.log('Injection script completed');
  true;
})();
`;

const NoZoomWebView: React.FC<WebViewProps> = (props) => {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New Toast Notification",
        body: "A new toast has been added.",
      },
      trigger: null,
    });
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;
    console.log('Received message from WebView:', message);
    if (message === 'toastifyChildrenBecameNonZero') {
      sendNotification();
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        {...props}
        ref={webViewRef}
        injectedJavaScript={injectedJavaScript}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
      />
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