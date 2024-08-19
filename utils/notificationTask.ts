
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "New Toast Notification",
        body: "A new toast has been added while you were away.",
      },
      trigger: null,
    });
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundNotificationTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 60, // 1 minute
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("Background notification task registered");
  } catch (err) {
    console.error("Background notification task registration failed:", err);
  }
};