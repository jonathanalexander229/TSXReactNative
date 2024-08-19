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

  function findToastifyContainer() {
    return document.querySelector('.Toastify');
  }

  function observeToastifyContainer() {
    const container = findToastifyContainer();
    if (container) {
      console.log('Toastify container found and being observed');
      const observer = new MutationObserver(function(mutations) {
        console.log('Mutation detected in Toastify container');
        for (let mutation of mutations) {
          if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);
            const hasNewToast = addedNodes.some(node => 
              node.nodeType === Node.ELEMENT_NODE && 
              (node.classList.contains('Toastify__toast') || node.querySelector('.Toastify__toast'))
            );
            if (hasNewToast) {
              console.log('New toast detected');
              window.ReactNativeWebView.postMessage('newToastAdded');
              return;
            }
          }
        }
        console.log('Mutation did not contain new toast');
      });
      observer.observe(container, { childList: true, subtree: true });
    } else {
      console.log('Toastify container not found');
    }
  }

  // Initial check
  observeToastifyContainer();

  // Set up a MutationObserver for the entire body to catch if the container is added dynamically
  const bodyObserver = new MutationObserver(function(mutations) {
    console.log('Body mutation detected, checking for Toastify container');
    if (findToastifyContainer()) {
      console.log('Toastify container found after body mutation');
      bodyObserver.disconnect();
      observeToastifyContainer();
    } else {
      console.log('Toastify container still not found after body mutation');
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
    if (message === 'newToastAdded') {
      console.log('Preparing to send notification for new toast');
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