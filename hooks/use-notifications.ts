import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  permissions: Notifications.NotificationPermissionsStatus | null;
  requestPermissions: () => Promise<boolean>;
  schedulePushNotification: (title: string, body: string, data?: any) => Promise<string | null>;
  cancelNotification: (identifier: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useNotifications(): UseNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permissions, setPermissions] = useState<Notifications.NotificationPermissionsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Register for push notifications token
  async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
      setError('Push notifications only work on physical devices');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setError('Permission not granted for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'a1b2c3d4-5678-4abc-9def-123456789012', // Your EAS project ID
      });

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7C3AED',
        });
      }

      return token.data;
    } catch (error) {
      setError(`Failed to register for push notifications: ${error}`);
      return null;
    }
  }

  // Request permissions
  const requestPermissions = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const permissionStatus = await Notifications.getPermissionsAsync();
      setPermissions(permissionStatus);
      
      if (status === 'granted') {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
        return true;
      }
      return false;
    } catch (error) {
      setError(`Failed to request permissions: ${error}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule a local notification
  const schedulePushNotification = async (
    title: string, 
    body: string, 
    data?: any
  ): Promise<string | null> => {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null,
      });
      return identifier;
    } catch (error) {
      setError(`Failed to schedule notification: ${error}`);
      return null;
    }
  };

  // Cancel a specific notification
  const cancelNotification = async (identifier: string): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      setError(`Failed to cancel notification: ${error}`);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      setError(`Failed to clear notifications: ${error}`);
    }
  };

  useEffect(() => {
    // Initialize permissions and token on mount
    (async () => {
      const permissionStatus = await Notifications.getPermissionsAsync();
      setPermissions(permissionStatus);
      
      if (permissionStatus.status === 'granted') {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
      }
    })();

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    permissions,
    requestPermissions,
    schedulePushNotification,
    cancelNotification,
    clearAllNotifications,
    isLoading,
    error,
  };
}