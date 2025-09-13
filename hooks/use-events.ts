import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event, Filter, Child, Booking } from '@/types/event';
import { mockEvents } from '@/mocks/events';

export const [EventsProvider, useEvents] = createContextHook(() => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [children, setChildren] = useState<Child[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedChildren, storedBookings, storedFavorites] = await Promise.all([
          AsyncStorage.getItem('children'),
          AsyncStorage.getItem('bookings'),
          AsyncStorage.getItem('favorites'),
        ]);

        if (storedChildren) setChildren(JSON.parse(storedChildren));
        if (storedBookings) setBookings(JSON.parse(storedBookings));
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save children
  useEffect(() => {
    if (!isLoading && children.length > 0) {
      AsyncStorage.setItem('children', JSON.stringify(children));
    }
  }, [children, isLoading]);

  // Save bookings
  useEffect(() => {
    if (!isLoading && bookings.length > 0) {
      AsyncStorage.setItem('bookings', JSON.stringify(bookings));
    }
  }, [bookings, isLoading]);

  // Save favorites
  useEffect(() => {
    if (!isLoading && favorites.length > 0) {
      AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, isLoading]);

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const addChild = (child: Child) => {
    setChildren(prev => [...prev, child]);
  };

  const updateChild = (childId: string, updates: Partial<Child>) => {
    setChildren(prev => 
      prev.map(child => 
        child.id === childId ? { ...child, ...updates } : child
      )
    );
  };

  const deleteChild = (childId: string) => {
    setChildren(prev => prev.filter(child => child.id !== childId));
  };

  const createBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
    // Update spots left
    setEvents(prev => 
      prev.map(event => 
        event.id === booking.eventId 
          ? { ...event, spotsLeft: event.spotsLeft - booking.childIds.length }
          : event
      )
    );
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setBookings(prev => 
        prev.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
      // Restore spots
      setEvents(prev => 
        prev.map(event => 
          event.id === booking.eventId 
            ? { ...event, spotsLeft: event.spotsLeft + booking.childIds.length }
            : event
        )
      );
    }
  };

  const addEvent = (event: Event) => {
    setEvents(prev => [event, ...prev]);
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Update favorites status
    filtered = filtered.map(event => ({
      ...event,
      isFavorite: favorites.includes(event.id)
    }));

    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(event => 
        filters.categories!.includes(event.category)
      );
    }

    if (filters.ageRange) {
      filtered = filtered.filter(event => 
        event.ageRange.min <= filters.ageRange!.max &&
        event.ageRange.max >= filters.ageRange!.min
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(event => 
        event.price >= filters.priceRange!.min &&
        event.price <= filters.priceRange!.max
      );
    }

    return filtered;
  }, [events, filters, favorites]);

  return {
    events: filteredEvents,
    allEvents: events,
    children,
    bookings,
    favorites,
    filters,
    isLoading,
    setFilters,
    toggleFavorite,
    addChild,
    updateChild,
    deleteChild,
    createBooking,
    cancelBooking,
    addEvent,
  };
});

export function useFilteredEvents(searchQuery: string = '') {
  const { events } = useEvents();
  
  return useMemo(() => {
    if (!searchQuery) return events;
    
    const query = searchQuery.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [events, searchQuery]);
}

export function useUpcomingBookings() {
  const { bookings, allEvents } = useEvents();
  
  return useMemo(() => {
    const activeBookings = bookings.filter(b => b.status === 'confirmed');
    return activeBookings.map(booking => {
      const event = allEvents.find(e => e.id === booking.eventId);
      return { ...booking, event };
    }).filter(b => b.event);
  }, [bookings, allEvents]);
}