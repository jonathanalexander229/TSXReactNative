import React, { useRef } from 'react';
import { WebView, WebViewProps, WebViewMessageEvent } from 'react-native-webview';
import * as Notifications from 'expo-notifications';

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

const reactStateObserverScript = `
(function() {
  function waitForReact() {
    if (window.React && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      hook.onCommitFiberRoot = (function(oldHook) {
        return function(...args) {
          const fiberRoot = args[1];
          if (fiberRoot.current.child) {
            traverseFiber(fiberRoot.current.child);
          }
          return oldHook.apply(this, args);
        };
      })(hook.onCommitFiberRoot);
    } else {
      setTimeout(waitForReact, 100);
    }
  }

  function traverseFiber(fiber) {
    if (fiber.stateNode && fiber.stateNode.state) {
      const state = fiber.stateNode.state;
      if (state.notifications || state.userNotifications) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'REACT_STATE_UPDATE',
          data: state.notifications || state.userNotifications
        }));
      }
    }
    if (fiber.child) {
      traverseFiber(fiber.child);
    }
    if (fiber.sibling) {
      traverseFiber(fiber.sibling);
    }
  }

  waitForReact();
})();
`;

const NoZoomWebView: React.FC<WebViewProps> = (props) => {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'REACT_STATE_UPDATE') {
        await processNotifications(message.data);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const processNotifications = async (notificationsData: any) => {
    if (Array.isArray(notificationsData)) {
      for (const notification of notificationsData) {
        if (notification.isNew) {  // Assuming there's an 'isNew' flag for new notifications
          await triggerLocalNotification(notification);
        }
      }
    } else if (notificationsData && typeof notificationsData === 'object') {
      // If it's a single notification object
      await triggerLocalNotification(notificationsData);
    }
  };

  const triggerLocalNotification = async (notificationData: any) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title || "New Notification",
        body: notificationData.message || "You have a new notification",
        data: notificationData,
      },
      trigger: null, // null means the notification triggers immediately
    });
  };

  return (
    <WebView
      {...props}
      ref={webViewRef}
      injectedJavaScript={`${disablePinchZoomJS}${reactStateObserverScript}`}
      onMessage={handleMessage}
    />
  );
};

export default NoZoomWebView;