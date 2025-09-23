// Main tRPC router for Only4kiddos backend
import { router, publicProcedure, protectedProcedure, hostProcedure } from './procedures';
import { mailerLiteService } from '../services/mailerlite';
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
      // Validate that the event exists and has available spots
      const event = await eventStore.getById(input.eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      if (event.spotsLeft < input.childIds.length) {
        throw new Error('Not enough spots available for this event');
      }

      // Validate that all children belong to the user
      const children = await childStore.getByUserId(ctx.auth.userId);
      const userChildIds = children.map(child => child.id);
      const invalidChildIds = input.childIds.filter(id => !userChildIds.includes(id));
      
      if (invalidChildIds.length > 0) {
        throw new Error('One or more children do not belong to you');
      }

      // Calculate total amount
      const totalAmount = event.price * input.childIds.length;

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

// Main app router
export const appRouter = router({
  events: eventsRouter,
  favorites: favoritesRouter,
  children: childrenRouter,
  bookings: bookingsRouter,
  mailerlite: mailerLiteRouter,

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