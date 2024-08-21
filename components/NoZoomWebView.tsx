import React, { useState, useEffect, useRef } from 'react';
import { WebView, WebViewProps, WebViewMessageEvent } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'background-fetch';

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

  // Add a function to check for notifications
  window.checkForNotifications = function() {
    const container = document.querySelector('.Toastify');
    if (container && container.children.length > 0) {
      window.ReactNativeWebView.postMessage('toastifyChildrenBecameNonZero');
    }
  };

  // Call checkForNotifications periodically
  setInterval(window.checkForNotifications, 5000);

  console.log('Injection script completed');
  true;
})();
`;

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const webViewRef = global.webViewRef;
  if (webViewRef) {
    webViewRef.injectJavaScript('window.checkForNotifications()');
  }
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

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

    registerBackgroundFetch();

    return () => {
      BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    };
  }, []);

  const registerBackgroundFetch = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 15, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Background fetch registered");
    } catch (err) {
      console.log("Background fetch failed to register");
    }
  };

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
        ref={(ref) => {
          webViewRef.current = ref;
          global.webViewRef = ref;
        }}
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