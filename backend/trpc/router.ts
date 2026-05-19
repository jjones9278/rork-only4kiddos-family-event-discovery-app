// Main tRPC router for Only4kiddos backend
import { router, publicProcedure, protectedProcedure, hostProcedure } from './procedures';
import { mailerLiteService } from '../services/mailerlite';
import { notificationService } from '../services/notifications';
import { eventStore, childStore, bookingStore, favoritesStore } from '../store/data';
import {
  FilterInputSchema,
  CreateEventInputSchema,
  CreateChildInputSchema,
  CreateBookingInputSchema,
  FavoriteToggleInputSchema,
  MailerLiteSubscribeInputSchema,
  EventSchema,
  ChildSchema,
  BookingSchema,
  createPaginatedResponseSchema,
} from '../../types/schemas';
import { z } from 'zod';

// Events router
const eventsRouter = router({
  // Get paginated list of events with filters
  list: publicProcedure
    .input(FilterInputSchema)
    .output(createPaginatedResponseSchema(EventSchema))
    .query(async ({ input, ctx }) => {
      const result = await eventStore.getAll({
        categories: input.categories,
        ageRange: input.ageRange,
        priceRange: input.priceRange,
        searchQuery: input.searchQuery,
        limit: input.limit,
        offset: input.offset,
      });

      // Add favorite status for authenticated users
      if (ctx.auth) {
        const userFavorites = await favoritesStore.getUserFavorites(ctx.auth.userId);
        result.items = result.items.map(event => ({
          ...event,
          isFavorite: userFavorites.includes(event.id),
        }));
      }

      return result;
    }),

  // Get single event by ID
  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(EventSchema.nullable())
    .query(async ({ input, ctx }) => {
      const event = await eventStore.getById(input.id);
      if (!event) return null;

      // Add favorite status for authenticated users
      if (ctx.auth) {
        const userFavorites = await favoritesStore.getUserFavorites(ctx.auth.userId);
        return {
          ...event,
          isFavorite: userFavorites.includes(event.id),
        };
      }

      return event;
    }),

  // Create new event (host only)
  create: hostProcedure
    .input(CreateEventInputSchema)
    .output(EventSchema)
    .mutation(async ({ input, ctx }) => {
      // Add creator information
      const eventData = {
        ...input,
        spotsLeft: input.capacity, // Initialize to capacity
        isFavorite: false,
        createdBy: ctx.auth.userId,
      };

      const event = await eventStore.create(eventData);
      return event;
    }),

  // Update event (host only, must be creator)
  update: hostProcedure
    .input(z.object({
      id: z.string().uuid(),
      updates: CreateEventInputSchema.partial(),
    }))
    .output(EventSchema.nullable())
    .mutation(async ({ input, ctx }) => {
      const existingEvent = await eventStore.getById(input.id);
      
      if (!existingEvent) {
        throw new Error('Event not found');
      }

      // Check if user is the creator or admin
      if (existingEvent.createdBy !== ctx.auth.userId && ctx.auth.role !== 'admin') {
        throw new Error('Not authorized to update this event');
      }

      const updatedEvent = await eventStore.update(input.id, input.updates);
      return updatedEvent;
    }),
});

// Favorites router
const favoritesRouter = router({
  // Toggle favorite status
  toggle: protectedProcedure
    .input(FavoriteToggleInputSchema)
    .output(z.object({
      isFavorite: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await favoritesStore.toggleFavorite(ctx.auth.userId, input.eventId);
      
      return {
        isFavorite: result.isFavorite,
        message: result.isFavorite 
          ? 'Event added to favorites' 
          : 'Event removed from favorites',
      };
    }),

  // Get user's favorite events
  list: protectedProcedure
    .output(z.array(EventSchema))
    .query(async ({ ctx }) => {
      const favoriteEvents = await favoritesStore.getFavoriteEvents(ctx.auth.userId);
      return favoriteEvents;
    }),
});

// Children router
const childrenRouter = router({
  // Get user's children
  list: protectedProcedure
    .output(z.array(ChildSchema))
    .query(async ({ ctx }) => {
      const children = await childStore.getByUserId(ctx.auth.userId);
      return children;
    }),

  // Create new child
  create: protectedProcedure
    .input(CreateChildInputSchema)
    .output(ChildSchema)
    .mutation(async ({ input, ctx }) => {
      const childData = {
        ...input,
        parentId: ctx.auth.userId,
      };
      const child = await childStore.create(childData, ctx.auth.userId);
      return child;
    }),

  // Update child
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      updates: CreateChildInputSchema.partial(),
    }))
    .output(ChildSchema.nullable())
    .mutation(async ({ input, ctx }) => {
      const existingChild = await childStore.getById(input.id);
      
      if (!existingChild) {
        throw new Error('Child not found');
      }

      // Check if user is the parent
      if (existingChild.parentId !== ctx.auth.userId) {
        throw new Error('Not authorized to update this child');
      }

      const updatedChild = await childStore.update(input.id, input.updates);
      return updatedChild;
    }),

  // Delete child
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const existingChild = await childStore.getById(input.id);
      
      if (!existingChild) {
        throw new Error('Child not found');
      }

      // Check if user is the parent
      if (existingChild.parentId !== ctx.auth.userId) {
        throw new Error('Not authorized to delete this child');
      }

      const success = await childStore.delete(input.id);
      return { success };
    }),
});

// Bookings router
const bookingsRouter = router({
  // Get user's bookings
  list: protectedProcedure
    .output(z.array(BookingSchema))
    .query(async ({ ctx }) => {
      const bookings = await bookingStore.getByUserId(ctx.auth.userId);
      return bookings;
    }),

  // Create new booking
  create: protectedProcedure
    .input(CreateBookingInputSchema)
    .output(BookingSchema)
    .mutation(async ({ input, ctx }) => {
      // Server-side validation: quantity must be >= 1
      const qty = input.childIds.length;
      if (qty < 1) {
        throw new Error('Invalid quantity: must book for at least 1 child');
      }

      // Validate that all children belong to the user
      const children = await childStore.getByUserId(ctx.auth.userId);
      const userChildIds = children.map(child => child.id);
      const invalidChildIds = input.childIds.filter(id => !userChildIds.includes(id));
      
      if (invalidChildIds.length > 0) {
        throw new Error('One or more children do not belong to you');
      }

      // Atomically reserve spots (prevents overselling)
      const updatedEvent = await eventStore.reserveSpots(input.eventId, qty);

      try {
        // Calculate total amount
        const totalAmount = updatedEvent.price * qty;

        const bookingData = {
          eventId: input.eventId,
          childIds: input.childIds,
          status: 'confirmed' as const,
          totalAmount,
          userId: ctx.auth.userId,
          paymentStatus: 'pending' as const,
        };
        const booking = await bookingStore.create(bookingData, ctx.auth.userId);

        return booking;
      } catch (bookingError) {
        // If booking creation fails, release the reserved spots
        await eventStore.releaseSpots(input.eventId, qty);
        throw bookingError;
      }
    }),

  // Cancel booking
  cancel: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(BookingSchema.nullable())
    .mutation(async ({ input, ctx }) => {
      const existingBooking = await bookingStore.getById(input.id);
      
      if (!existingBooking) {
        throw new Error('Booking not found');
      }

      // Check if user owns the booking
      if (existingBooking.userId !== ctx.auth.userId) {
        throw new Error('Not authorized to cancel this booking');
      }

      if (existingBooking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      const cancelledBooking = await bookingStore.cancel(input.id);
      
      // Release spots back to the event
      if (cancelledBooking) {
        await eventStore.releaseSpots(cancelledBooking.eventId, cancelledBooking.childIds.length);
      }
      
      return cancelledBooking;
    }),
});

// MailerLite router  
const mailerLiteRouter = router({
  // Subscribe to newsletter
  subscribe: publicProcedure
    .input(MailerLiteSubscribeInputSchema)
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await mailerLiteService.subscribeToEventUpdates(
        input.email,
        input.name
      );

      if (result.error) {
        return {
          success: false,
          message: result.message || 'Failed to subscribe to newsletter',
        };
      }

      return {
        success: true,
        message: 'Successfully subscribed to family event updates!',
      };
    }),

  // Subscribe to category updates
  subscribeToCategory: publicProcedure
    .input(MailerLiteSubscribeInputSchema.extend({
      category: z.string(),
    }))
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await mailerLiteService.subscribeToCategory(
        input.email,
        input.category,
        input.name
      );

      if (result.error) {
        return {
          success: false,
          message: result.message || 'Failed to subscribe to category updates',
        };
      }

      return {
        success: true,
        message: `Successfully subscribed to ${input.category} event updates!`,
      };
    }),

  // Subscribe to premium updates
  subscribeToPremium: publicProcedure
    .input(MailerLiteSubscribeInputSchema)
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await mailerLiteService.subscribeToPremiumUpdates(
        input.email,
        input.name
      );

      if (result.error) {
        return {
          success: false,
          message: result.message || 'Failed to subscribe to premium updates',
        };
      }

      return {
        success: true,
        message: 'Successfully subscribed to premium member updates!',
      };
    }),
});

// Notifications router
const notificationsRouter = router({
  // Register push token
  registerToken: protectedProcedure
    .input(z.object({
      token: z.string(),
      platform: z.enum(['ios', 'android', 'web']),
    }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await notificationService.registerPushToken(ctx.auth.userId, input.token, input.platform);
      return { success: true };
    }),

  // Remove push token
  removeToken: protectedProcedure
    .input(z.object({
      token: z.string(),
    }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await notificationService.removePushToken(ctx.auth.userId, input.token);
      return { success: true };
    }),

  // Get notification preferences
  getPreferences: protectedProcedure
    .output(z.object({
      eventNotifications: z.boolean(),
      bookingReminders: z.boolean(),
      newsUpdates: z.boolean(),
    }))
    .query(async ({ ctx }) => {
      const preferences = await notificationService.getNotificationPreferences(ctx.auth.userId);
      return {
        eventNotifications: preferences.eventNotifications,
        bookingReminders: preferences.bookingReminders,
        newsUpdates: preferences.newsUpdates,
      };
    }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      eventNotifications: z.boolean().optional(),
      bookingReminders: z.boolean().optional(),
      newsUpdates: z.boolean().optional(),
    }))
    .output(z.object({
      eventNotifications: z.boolean(),
      bookingReminders: z.boolean(),
      newsUpdates: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const preferences = await notificationService.updateNotificationPreferences(ctx.auth.userId, input);
      return {
        eventNotifications: preferences.eventNotifications,
        bookingReminders: preferences.bookingReminders,
        newsUpdates: preferences.newsUpdates,
      };
    }),

  // Send test notification (for testing purposes)
  sendTest: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
    }))
    .output(z.object({ 
      success: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await notificationService.sendPushNotification({
          userIds: [ctx.auth.userId],
          title: input.title,
          body: input.body,
          data: { type: 'test' },
          sound: 'default',
          priority: 'normal',
        });

        return {
          success: result.success,
          message: result.success ? 'Test notification sent!' : 'Failed to send notification',
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }),

  // Send notification to all users (host only)
  sendToAll: hostProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      type: z.enum(['event', 'news', 'announcement']).default('announcement'),
    }))
    .output(z.object({ 
      success: z.boolean(),
      recipientCount: z.number(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        if (input.type === 'news') {
          await notificationService.sendNewsNotification(input.title, input.body);
          return {
            success: true,
            recipientCount: 0, // Would be actual count in real implementation
            message: 'News notification sent to opted-in users',
          };
        } else {
          // For other types, send to all users (in a real app, you'd get all user IDs)
          const result = await notificationService.sendPushNotification({
            title: input.title,
            body: input.body,
            data: { type: input.type },
            sound: 'default',
            priority: input.type === 'event' ? 'high' : 'normal',
          });

          return {
            success: result.success,
            recipientCount: result.results.length,
            message: result.success ? 'Notification sent successfully' : 'Failed to send notification',
          };
        }
      } catch (error) {
        return {
          success: false,
          recipientCount: 0,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }),
});

// Main app router
export const appRouter = router({
  events: eventsRouter,
  favorites: favoritesRouter,
  children: childrenRouter,
  bookings: bookingsRouter,
  mailerlite: mailerLiteRouter,
  notifications: notificationsRouter,

  // Health check
  health: publicProcedure
    .output(z.object({
      status: z.string(),
      timestamp: z.string(),
      version: z.string(),
    }))
    .query(() => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    })),
});

export type AppRouter = typeof appRouter;