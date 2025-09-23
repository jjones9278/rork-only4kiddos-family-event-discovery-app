// New tRPC-based hooks for events, replacing mock data
import { trpc } from '@/lib/trpc';
import type { FilterInput, CreateEventInput, CreateChildInput, CreateBookingInput } from '@/types/schemas';

// Events hooks
export function useEventList(filters?: Partial<FilterInput>) {
  const queryInput: FilterInput = {
    limit: 20,
    offset: 0,
    ...filters,
  };
  
  return trpc.events.list.useQuery(queryInput, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useEventById(id: string) {
  return trpc.events.byId.useQuery({ id }, {
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEvent() {
  const utils = trpc.useContext();
  
  return trpc.events.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch events list
      utils.events.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create event:', error);
    },
  });
}

export function useUpdateEvent() {
  const utils = trpc.useContext();
  
  return trpc.events.update.useMutation({
    onSuccess: (data) => {
      // Invalidate specific event and events list
      if (data) {
        utils.events.byId.invalidate({ id: data.id });
        utils.events.list.invalidate();
      }
    },
    onError: (error) => {
      console.error('Failed to update event:', error);
    },
  });
}

// Favorites hooks
export function useToggleFavorite() {
  const utils = trpc.useContext();
  
  return trpc.favorites.toggle.useMutation({
    onSuccess: () => {
      // Invalidate events list to update favorite status
      utils.events.list.invalidate();
      utils.favorites.list.invalidate();
    },
    // Optimistic update
    onMutate: async ({ eventId }) => {
      // Cancel any outgoing refetches for events list
      await utils.events.list.cancel();
      
      // Snapshot the previous value - we'll update all cached queries
      const previousData = new Map();
      
      // Update all cached events list queries
      utils.events.list.getInfiniteData();
      
      // For now, just invalidate to avoid complex cache key management
      return { shouldInvalidate: true };
    },
    // If the mutation fails, invalidate to refresh
    onError: () => {
      utils.events.list.invalidate();
    },
  });
}

export function useFavoriteEvents() {
  return trpc.favorites.list.useQuery(undefined, {
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Children hooks
export function useChildren() {
  return trpc.children.list.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateChild() {
  const utils = trpc.useContext();
  
  return trpc.children.create.useMutation({
    onSuccess: () => {
      utils.children.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create child:', error);
    },
  });
}

export function useUpdateChild() {
  const utils = trpc.useContext();
  
  return trpc.children.update.useMutation({
    onSuccess: () => {
      utils.children.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to update child:', error);
    },
  });
}

export function useDeleteChild() {
  const utils = trpc.useContext();
  
  return trpc.children.delete.useMutation({
    onSuccess: () => {
      utils.children.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to delete child:', error);
    },
  });
}

// Bookings hooks
export function useBookings() {
  return trpc.bookings.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateBooking() {
  const utils = trpc.useContext();
  
  return trpc.bookings.create.useMutation({
    onSuccess: () => {
      // Invalidate bookings list and events list (to update spots left)
      utils.bookings.list.invalidate();
      utils.events.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create booking:', error);
    },
  });
}

export function useCancelBooking() {
  const utils = trpc.useContext();
  
  return trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      // Invalidate bookings list and events list (to update spots left)
      utils.bookings.list.invalidate();
      utils.events.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
    },
  });
}

// MailerLite hooks (now backend-only)
export function useSubscribeToNewsletter() {
  return trpc.mailerlite.subscribe.useMutation({
    onError: (error) => {
      console.error('Failed to subscribe to newsletter:', error);
    },
  });
}

export function useSubscribeToCategory() {
  return trpc.mailerlite.subscribeToCategory.useMutation({
    onError: (error) => {
      console.error('Failed to subscribe to category:', error);
    },
  });
}

export function useSubscribeToPremium() {
  return trpc.mailerlite.subscribeToPremium.useMutation({
    onError: (error) => {
      console.error('Failed to subscribe to premium:', error);
    },
  });
}

// Health check hook
export function useHealthCheck() {
  return trpc.health.useQuery(undefined, {
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  });
}

// Utility hooks for common patterns
export function useFilteredEvents(filters: Partial<FilterInput> = {}) {
  const { data, isLoading, error, refetch } = useEventList(filters);
  
  return {
    events: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch,
  };
}

export function useUpcomingBookings() {
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: events, isLoading: eventsLoading } = useEventList();
  
  const upcomingBookings = React.useMemo(() => {
    if (!bookings || !events?.items) return [];
    
    return bookings
      .filter(booking => booking.status === 'confirmed')
      .map(booking => {
        const event = events.items.find(e => e.id === booking.eventId);
        return { ...booking, event };
      })
      .filter(booking => booking.event)
      .sort((a, b) => new Date(a.event!.date).getTime() - new Date(b.event!.date).getTime());
  }, [bookings, events]);
  
  return {
    upcomingBookings,
    isLoading: bookingsLoading || eventsLoading,
  };
}

// Search hook with debouncing
export function useEventSearch(searchQuery: string, filters: Partial<FilterInput> = {}) {
  const [debouncedQuery, setDebouncedQuery] = React.useState(searchQuery);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  return useEventList({
    ...filters,
    searchQuery: debouncedQuery.trim() || undefined,
  });
}

// We need to import React for useMemo
import React from 'react';