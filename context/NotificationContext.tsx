import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNotifications, UseNotificationsReturn } from '@/hooks/use-notifications';
import { useAuth } from '@/context/AuthContext';
import { useToastHelpers } from '@/components/ToastProvider';

interface NotificationContextType extends UseNotificationsReturn {
  sendTestNotification: () => Promise<void>;
  registerPushToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const notifications = useNotifications();
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToastHelpers();

  // Send a test notification
  const sendTestNotification = async () => {
    try {
      await notifications.schedulePushNotification(
        '🎉 Only4Kiddos',
        'Push notifications are now active! You\'ll receive updates about new events, bookings, and more.',
        { type: 'test', timestamp: Date.now() }
      );
      toastSuccess('Test notification sent!');
    } catch (error) {
      toastError('Failed to send test notification');
    }
  };

  // Register push token with backend (placeholder for future implementation)
  const registerPushToken = async () => {
    if (!notifications.expoPushToken || !user) {
      return;
    }

    try {
      // TODO: Implement API call to register token with backend
      // await trpc.notifications.registerToken.mutate({
      //   token: notifications.expoPushToken,
      //   userId: user.uid,
      // });
      console.log('Push token registered:', notifications.expoPushToken);
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  };

  // Auto-register token when available and user is logged in
  useEffect(() => {
    if (notifications.expoPushToken && user) {
      registerPushToken();
    }
  }, [notifications.expoPushToken, user]);

  // Show error toasts for notification errors
  useEffect(() => {
    if (notifications.error) {
      toastError(notifications.error);
    }
  }, [notifications.error]);

  const contextValue: NotificationContextType = {
    ...notifications,
    sendTestNotification,
    registerPushToken,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}