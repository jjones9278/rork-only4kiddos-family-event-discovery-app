// Notification service for sending push notifications
import { z } from 'zod';

// Push notification data structures
export const PushTokenSchema = z.object({
  userId: z.string(),
  token: z.string(),
  platform: z.enum(['ios', 'android', 'web']),
  createdAt: z.date().optional(),
  lastUsed: z.date().optional(),
});

export const NotificationPreferenceSchema = z.object({
  userId: z.string(),
  eventNotifications: z.boolean().default(true),
  bookingReminders: z.boolean().default(true),
  newsUpdates: z.boolean().default(false),
  updatedAt: z.date().optional(),
});

export const SendNotificationInputSchema = z.object({
  userIds: z.array(z.string()).optional(),
  tokens: z.array(z.string()).optional(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.any()).optional(),
  sound: z.enum(['default', 'none']).default('default'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

export type PushToken = z.infer<typeof PushTokenSchema>;
export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

// In-memory storage for push tokens and preferences
// In production, these would be stored in a database
const pushTokens = new Map<string, PushToken[]>();
const notificationPreferences = new Map<string, NotificationPreference>();

export class NotificationService {
  // Register a push token for a user
  async registerPushToken(userId: string, token: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    const existingTokens = pushTokens.get(userId) || [];
    
    // Remove any existing token with the same value
    const filteredTokens = existingTokens.filter(t => t.token !== token);
    
    // Add the new token
    const newToken: PushToken = {
      userId,
      token,
      platform,
      createdAt: new Date(),
      lastUsed: new Date(),
    };
    
    filteredTokens.push(newToken);
    pushTokens.set(userId, filteredTokens);
    
    console.log(`Registered push token for user ${userId} on ${platform}`);
  }

  // Remove a push token
  async removePushToken(userId: string, token: string): Promise<void> {
    const existingTokens = pushTokens.get(userId) || [];
    const filteredTokens = existingTokens.filter(t => t.token !== token);
    pushTokens.set(userId, filteredTokens);
    
    console.log(`Removed push token for user ${userId}`);
  }

  // Get all push tokens for a user
  async getUserPushTokens(userId: string): Promise<PushToken[]> {
    return pushTokens.get(userId) || [];
  }

  // Update notification preferences
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const existing = notificationPreferences.get(userId) || {
      userId,
      eventNotifications: true,
      bookingReminders: true,
      newsUpdates: false,
    };

    const updated: NotificationPreference = {
      ...existing,
      ...preferences,
      userId,
      updatedAt: new Date(),
    };

    notificationPreferences.set(userId, updated);
    return updated;
  }

  // Get notification preferences for a user
  async getNotificationPreferences(userId: string): Promise<NotificationPreference> {
    return notificationPreferences.get(userId) || {
      userId,
      eventNotifications: true,
      bookingReminders: true,
      newsUpdates: false,
    };
  }

  // Send a push notification using Expo's push notification service
  async sendPushNotification(input: SendNotificationInput): Promise<{ success: boolean; results: any[] }> {
    const results: any[] = [];
    let success = true;

    try {
      // Get tokens from userIds if provided
      let allTokens = input.tokens || [];
      
      if (input.userIds) {
        for (const userId of input.userIds) {
          const userTokens = await this.getUserPushTokens(userId);
          const preferences = await this.getNotificationPreferences(userId);
          
          // Check if user wants to receive this type of notification
          // For now, we assume all notifications are event-related
          if (preferences.eventNotifications) {
            allTokens.push(...userTokens.map(t => t.token));
          }
        }
      }

      if (allTokens.length === 0) {
        console.log('No valid push tokens found for notification');
        return { success: false, results: [] };
      }

      // Format messages for Expo Push API
      const messages = allTokens.map(token => ({
        to: token,
        title: input.title,
        body: input.body,
        data: input.data || {},
        sound: input.sound,
        priority: input.priority,
      }));

      // In a real implementation, you would send these to Expo's push notification service
      // For now, we'll simulate the API response
      console.log('Simulated push notification send:', {
        messageCount: messages.length,
        title: input.title,
        body: input.body,
      });

      // Simulate successful responses
      for (let i = 0; i < messages.length; i++) {
        results.push({
          status: 'ok',
          id: `notification_${Date.now()}_${i}`,
        });
      }

      return { success, results };
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return {
        success: false,
        results: [{ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }],
      };
    }
  }

  // Send event-related notifications
  async sendEventNotification(eventId: string, title: string, body: string, userIds?: string[]): Promise<void> {
    const input: SendNotificationInput = {
      userIds,
      title,
      body,
      data: { type: 'event', eventId },
      priority: 'normal',
      sound: 'default',
    };

    const result = await this.sendPushNotification(input);
    
    if (result.success) {
      console.log(`Event notification sent for event ${eventId} to ${result.results.length} devices`);
    } else {
      console.error(`Failed to send event notification for event ${eventId}`);
    }
  }

  // Send booking reminder notifications
  async sendBookingReminder(bookingId: string, eventTitle: string, userId: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(userId);
    
    if (!preferences.bookingReminders) {
      console.log(`User ${userId} has disabled booking reminders`);
      return;
    }

    const input: SendNotificationInput = {
      userIds: [userId],
      title: 'Event Reminder',
      body: `Don't forget about "${eventTitle}" coming up soon!`,
      data: { type: 'booking_reminder', bookingId },
      priority: 'high',
      sound: 'default',
    };

    await this.sendPushNotification(input);
  }

  // Send newsletter/news notifications
  async sendNewsNotification(title: string, body: string): Promise<void> {
    // Get all users who have opted in to news updates
    const eligibleUserIds: string[] = [];
    
    for (const [userId, preferences] of notificationPreferences.entries()) {
      if (preferences.newsUpdates) {
        eligibleUserIds.push(userId);
      }
    }

    if (eligibleUserIds.length === 0) {
      console.log('No users have opted in to news notifications');
      return;
    }

    const input: SendNotificationInput = {
      userIds: eligibleUserIds,
      title,
      body,
      data: { type: 'news' },
      priority: 'low',
      sound: 'default',
    };

    await this.sendPushNotification(input);
  }
}

// Singleton instance
export const notificationService = new NotificationService();