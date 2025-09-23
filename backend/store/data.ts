// In-memory data store for Only4kiddos backend
// This provides a centralized data layer that can be easily swapped for a real database

import { v4 as uuidv4 } from 'uuid';
import type { Event, Child, Booking } from '../../types/schemas';

// In-memory storage
interface DataStore {
  events: Map<string, Event>;
  children: Map<string, Child>;
  bookings: Map<string, Booking>;
  favorites: Map<string, string[]>; // userId -> eventIds[]
  userProfiles: Map<string, any>; // For user-specific data
}

const store: DataStore = {
  events: new Map(),
  children: new Map(),
  bookings: new Map(),
  favorites: new Map(),
  userProfiles: new Map(),
};

// Initialize with some sample data
function initializeSampleData() {
  // Sample events data
  const sampleEvents: Event[] = [
    {
      id: uuidv4(),
      title: "Art & Craft Workshop",
      description: "Creative art session for kids to explore painting and crafting",
      imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      time: "10:00",
      location: "Community Center",
      address: "123 Main Street, City",
      price: 25,
      ageRange: { min: 5, max: 12 },
      category: "arts",
      hostName: "Sarah Johnson",
      hostImage: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100",
      capacity: 15,
      spotsLeft: 8,
      tags: ["creative", "indoor", "beginner-friendly"],
      accessibilityFeatures: ["wheelchair accessible", "visual aids available"],
      isFavorite: false,
      latitude: 40.7128,
      longitude: -74.0060,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Soccer Skills Training",
      description: "Fun soccer training session for kids of all skill levels",
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      time: "15:30",
      location: "City Park",
      address: "456 Park Avenue, City",
      price: 30,
      ageRange: { min: 6, max: 14 },
      category: "sports",
      hostName: "Mike Chen",
      hostImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      capacity: 20,
      spotsLeft: 12,
      tags: ["outdoor", "sports", "team-building"],
      accessibilityFeatures: ["adapted equipment available"],
      isFavorite: false,
      latitude: 40.7589,
      longitude: -73.9851,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Add sample events to store
  sampleEvents.forEach(event => {
    store.events.set(event.id, event);
  });

  console.log(`Initialized data store with ${sampleEvents.length} sample events`);
}

// Initialize sample data
initializeSampleData();

// Event operations
export const eventStore = {
  async getAll(filters?: { 
    categories?: string[];
    ageRange?: { min: number; max: number };
    priceRange?: { min: number; max: number };
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }) {
    let events = Array.from(store.events.values());

    // Apply filters
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        events = events.filter(event => filters.categories!.includes(event.category));
      }

      if (filters.ageRange) {
        events = events.filter(event => 
          event.ageRange.min <= filters.ageRange!.max &&
          event.ageRange.max >= filters.ageRange!.min
        );
      }

      if (filters.priceRange) {
        events = events.filter(event => 
          event.price >= filters.priceRange!.min &&
          event.price <= filters.priceRange!.max
        );
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        events = events.filter(event =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query) ||
          event.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
    }

    // Sort by date (upcoming events first)
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    const total = events.length;
    const paginatedEvents = events.slice(offset, offset + limit);

    return {
      items: paginatedEvents,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  },

  async getById(id: string) {
    return store.events.get(id) || null;
  },

  async create(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newEvent: Event = {
      ...event,
      id,
      spotsLeft: event.capacity, // Initialize spotsLeft to capacity
      createdAt: now,
      updatedAt: now,
    };
    
    store.events.set(id, newEvent);
    return newEvent;
  },

  async update(id: string, updates: Partial<Event>) {
    const event = store.events.get(id);
    if (!event) return null;

    const updatedEvent = {
      ...event,
      ...updates,
      id, // Prevent ID from being changed
      updatedAt: new Date().toISOString(),
    };

    store.events.set(id, updatedEvent);
    return updatedEvent;
  },

  async delete(id: string) {
    return store.events.delete(id);
  },
};

// Child operations
export const childStore = {
  async getByUserId(userId: string) {
    return Array.from(store.children.values())
      .filter(child => child.parentId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string) {
    return store.children.get(id) || null;
  },

  async create(child: Omit<Child, 'id' | 'createdAt'>, userId: string) {
    const id = uuidv4();
    const newChild: Child = {
      ...child,
      id,
      parentId: userId,
      createdAt: new Date().toISOString(),
    };
    
    store.children.set(id, newChild);
    return newChild;
  },

  async update(id: string, updates: Partial<Child>) {
    const child = store.children.get(id);
    if (!child) return null;

    const updatedChild = {
      ...child,
      ...updates,
      id, // Prevent ID from being changed
    };

    store.children.set(id, updatedChild);
    return updatedChild;
  },

  async delete(id: string) {
    return store.children.delete(id);
  },
};

// Booking operations
export const bookingStore = {
  async getByUserId(userId: string) {
    return Array.from(store.bookings.values())
      .filter(booking => booking.userId === userId)
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  },

  async getById(id: string) {
    return store.bookings.get(id) || null;
  },

  async create(booking: Omit<Booking, 'id' | 'bookingDate' | 'createdAt' | 'updatedAt'>, userId: string) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newBooking: Booking = {
      ...booking,
      id,
      userId,
      bookingDate: now,
      createdAt: now,
      updatedAt: now,
    };
    
    // Update event spots left
    const event = store.events.get(booking.eventId);
    if (event) {
      const updatedEvent = {
        ...event,
        spotsLeft: Math.max(0, event.spotsLeft - booking.childIds.length),
        updatedAt: now,
      };
      store.events.set(booking.eventId, updatedEvent);
    }
    
    store.bookings.set(id, newBooking);
    return newBooking;
  },

  async update(id: string, updates: Partial<Booking>) {
    const booking = store.bookings.get(id);
    if (!booking) return null;

    const updatedBooking = {
      ...booking,
      ...updates,
      id, // Prevent ID from being changed
      updatedAt: new Date().toISOString(),
    };

    store.bookings.set(id, updatedBooking);
    return updatedBooking;
  },

  async cancel(id: string) {
    const booking = store.bookings.get(id);
    if (!booking) return null;

    // Restore event spots
    const event = store.events.get(booking.eventId);
    if (event && booking.status !== 'cancelled') {
      const updatedEvent = {
        ...event,
        spotsLeft: event.spotsLeft + booking.childIds.length,
        updatedAt: new Date().toISOString(),
      };
      store.events.set(booking.eventId, updatedEvent);
    }

    // Update booking status
    const cancelledBooking = {
      ...booking,
      status: 'cancelled' as const,
      updatedAt: new Date().toISOString(),
    };

    store.bookings.set(id, cancelledBooking);
    return cancelledBooking;
  },
};

// Favorites operations
export const favoritesStore = {
  async getUserFavorites(userId: string) {
    return store.favorites.get(userId) || [];
  },

  async toggleFavorite(userId: string, eventId: string) {
    const favorites = store.favorites.get(userId) || [];
    const index = favorites.indexOf(eventId);
    
    if (index === -1) {
      // Add to favorites
      favorites.push(eventId);
      store.favorites.set(userId, favorites);
      return { isFavorite: true, favorites };
    } else {
      // Remove from favorites
      favorites.splice(index, 1);
      store.favorites.set(userId, favorites);
      return { isFavorite: false, favorites };
    }
  },

  async getFavoriteEvents(userId: string) {
    const favoriteIds = store.favorites.get(userId) || [];
    const events = favoriteIds
      .map(id => store.events.get(id))
      .filter(Boolean) as Event[];
    
    return events;
  },
};

// Data export for backup/migration
export const dataStore = {
  async exportAll() {
    return {
      events: Object.fromEntries(store.events),
      children: Object.fromEntries(store.children),
      bookings: Object.fromEntries(store.bookings),
      favorites: Object.fromEntries(store.favorites),
      userProfiles: Object.fromEntries(store.userProfiles),
    };
  },

  async importAll(data: any) {
    if (data.events) {
      store.events = new Map(Object.entries(data.events));
    }
    if (data.children) {
      store.children = new Map(Object.entries(data.children));
    }
    if (data.bookings) {
      store.bookings = new Map(Object.entries(data.bookings));
    }
    if (data.favorites) {
      store.favorites = new Map(Object.entries(data.favorites));
    }
    if (data.userProfiles) {
      store.userProfiles = new Map(Object.entries(data.userProfiles));
    }
  },

  async reset() {
    store.events.clear();
    store.children.clear();
    store.bookings.clear();
    store.favorites.clear();
    store.userProfiles.clear();
    
    // Re-initialize sample data
    initializeSampleData();
  },
};

// Utility function to generate UUID
function generateId(): string {
  return uuidv4();
}

export { generateId };