import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { WebView } from 'react-native-webview';

const BACKGROUND_FETCH_TASK = 'background-fetch';

let webViewRef: WebView | null = null;

export const setWebViewRef = (ref: WebView | null) => {
  webViewRef = ref;
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    if (webViewRef) {
      // Inject JavaScript into the WebView to check for notifications
      webViewRef.injectJavaScript(`
        (function() {
          // Your logic to check for notifications in the web page
          // This is just an example, adjust according to your web app's structure
          if (window.checkForNotifications) {
            window.checkForNotifications();
          }
          true;
        })();
      `);
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background fetch failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundFetchAsync = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("Background fetch task registered");
  } catch (err) {
    console.error("Background fetch task registration failed:", err);
  }
};