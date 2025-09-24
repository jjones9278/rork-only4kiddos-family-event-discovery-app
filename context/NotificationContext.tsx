import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNotifications, UseNotificationsReturn } from '@/hooks/use-notifications';
import { useAuth } from '@/context/AuthContext';
import { useToastHelpers } from '@/components/ToastProvider';
import { trpc } from '@/lib/trpc';

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

  // Send a test notification via backend
  const testNotificationMutation = trpc.notifications.sendTest.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess(result.message);
      } else {
        toastError(result.message);
      }
    },
    onError: (error) => {
      toastError('Failed to send test notification');
      console.error('Test notification error:', error);
    },
  });

  const sendTestNotification = async () => {
    try {
      // Try backend notification first (if user is authenticated)
      if (user) {
        await testNotificationMutation.mutateAsync({
          title: '🎉 Only4Kiddos',
          body: 'Push notifications are now active! You\'ll receive updates about new events, bookings, and more.',
        });
      } else {
        // Fallback to local notification
        await notifications.schedulePushNotification(
          '🎉 Only4Kiddos',
          'Push notifications are now active! You\'ll receive updates about new events, bookings, and more.',
          { type: 'test', timestamp: Date.now() }
        );
        toastSuccess('Test notification sent!');
      }
    } catch (error) {
      toastError('Failed to send test notification');
    }
  };

  // Register push token with backend
  const registerTokenMutation = trpc.notifications.registerToken.useMutation({
    onSuccess: () => {
      console.log('Push token registered successfully');
    },
    onError: (error) => {
      console.error('Failed to register push token:', error);
      toastError('Failed to register for notifications');
    },
  });

  const registerPushToken = async () => {
    if (!notifications.expoPushToken || !user) {
      return;
    }

    try {
      await registerTokenMutation.mutateAsync({
        token: notifications.expoPushToken,
        platform: 'web', // Default to web for Expo web
      });
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