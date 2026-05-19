// Shared Zod schemas for Only4kiddos family event app
// These schemas ensure type safety between frontend and backend

import { z } from 'zod';

// Event category enum
export const EventCategorySchema = z.enum([
  'outdoor',
  'indoor', 
  'educational',
  'sports',
  'arts',
  'music',
  'party',
  'workshop',
  'playdate'
]);

// Age range schema
export const AgeRangeSchema = z.object({
  min: z.number().min(0).max(18),
  max: z.number().min(0).max(18),
}).refine(data => data.min <= data.max, {
  message: "Minimum age must be less than or equal to maximum age"
});

// Core Event schema
export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  imageUrl: z.string().url("Invalid image URL"),
  date: z.string().datetime("Invalid date format"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  location: z.string().min(1, "Location is required").max(100, "Location too long"),
  address: z.string().min(1, "Address is required").max(200, "Address too long"),
  price: z.number().min(0, "Price cannot be negative"),
  ageRange: AgeRangeSchema,
  category: EventCategorySchema,
  hostName: z.string().min(1, "Host name is required").max(50, "Host name too long"),
  hostImage: z.string().url("Invalid host image URL"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  spotsLeft: z.number().min(0, "Spots left cannot be negative"),
  tags: z.array(z.string().max(30, "Tag too long")).max(10, "Too many tags"),
  accessibilityFeatures: z.array(z.string().max(50, "Feature description too long")),
  isFavorite: z.boolean().default(false),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  createdBy: z.string().uuid().optional(), // Firebase user ID
});

// Input schema for creating events (excludes generated fields)
export const CreateEventInputSchema = EventSchema.omit({
  id: true,
  spotsLeft: true, // Will be set to capacity
  isFavorite: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true, // Will be set from auth context
}).extend({
  // Override capacity to set spotsLeft automatically
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

// Child schema
export const ChildSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  age: z.number().min(0, "Age cannot be negative").max(18, "Age cannot exceed 18"),
  interests: z.array(z.string().max(30, "Interest too long")).max(10, "Too many interests"),
  allergies: z.array(z.string().max(50, "Allergy description too long")).optional(),
  specialNeeds: z.array(z.string().max(100, "Special need description too long")).optional(),
  avatarColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  parentId: z.string().uuid(), // Firebase user ID
  createdAt: z.string().datetime().optional(),
});

// Input schema for creating children
export const CreateChildInputSchema = ChildSchema.omit({
  id: true,
  parentId: true, // Will be set from auth context
  createdAt: true,
});

// Booking schema
export const BookingSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  childIds: z.array(z.string().uuid()).min(1, "At least one child must be selected"),
  status: z.enum(['confirmed', 'pending', 'cancelled']).default('pending'),
  bookingDate: z.string().datetime(),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
  userId: z.string().uuid(), // Firebase user ID
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Input schema for creating bookings
export const CreateBookingInputSchema = z.object({
  eventId: z.string().uuid(),
  childIds: z.array(z.string().uuid()).min(1, "At least one child must be selected"),
  // userId will be set from auth context
  // totalAmount will be calculated based on event price and children count
});

// Filter schema for event queries
export const FilterInputSchema = z.object({
  ageRange: AgeRangeSchema.optional(),
  categories: z.array(EventCategorySchema).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).refine(data => data.min <= data.max, {
    message: "Minimum price must be less than or equal to maximum price"
  }).optional(),
  distance: z.number().min(0).max(100).optional(), // km
  accessibility: z.array(z.string()).optional(),
  searchQuery: z.string().max(100, "Search query too long").optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Favorite toggle input
export const FavoriteToggleInputSchema = z.object({
  eventId: z.string().uuid(),
});

// MailerLite subscription input
export const MailerLiteSubscribeInputSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  subscriptionType: z.enum(['family_events', 'category_updates', 'premium_updates']).default('family_events'),
  preferredCategory: EventCategorySchema.optional(),
  // Additional custom fields
  fields: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

// Auth context schema for tRPC procedures
export const AuthContextSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().optional(),
  role: z.enum(['user', 'host', 'admin']).default('user'),
  emailVerified: z.boolean().default(false),
});

// Response schemas for consistency
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
  items: z.array(itemSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
});

export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Type exports for use in components
export type Event = z.infer<typeof EventSchema>;
export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;
export type Child = z.infer<typeof ChildSchema>;
export type CreateChildInput = z.infer<typeof CreateChildInputSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingInputSchema>;
export type FilterInput = z.infer<typeof FilterInputSchema>;
export type FavoriteToggleInput = z.infer<typeof FavoriteToggleInputSchema>;
export type MailerLiteSubscribeInput = z.infer<typeof MailerLiteSubscribeInputSchema>;
export type AuthContext = z.infer<typeof AuthContextSchema>;
export type EventCategory = z.infer<typeof EventCategorySchema>;
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};