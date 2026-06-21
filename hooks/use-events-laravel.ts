/**
 * use-events-laravel.ts
 * Drop-in replacement for all tRPC/sample data hooks.
 * Connects the Only4Kiddos mobile app to the live Laravel REST API.
 *
 * Every function name and return shape matches use-events-trpc.ts exactly.
 * Screens only need to change their import line — nothing else.
 */

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { getAuth } from 'firebase/auth';

// ─── Shared favorites store ──────────────────────────────────────────────────
// Module-level so every screen sees the same state. Seeded from API responses
// (useEvents, useEventById, useFavorites) and updated by useToggleFavorite.

const favoriteState = new Map<string, boolean>();
const inFlightFavorites = new Set<string>();
const favoriteSubscribers = new Set<() => void>();
const subscribeFavorites = (cb: () => void) => {
  favoriteSubscribers.add(cb);
  return () => { favoriteSubscribers.delete(cb); };
};
const notifyFavorites = () => favoriteSubscribers.forEach((fn) => fn());

function setFavorite(eventId: string, isFavorite: boolean) {
  if (favoriteState.get(eventId) === isFavorite) return;
  favoriteState.set(eventId, isFavorite);
  notifyFavorites();
}

// Seeds isFavorite from API responses. Skips any eventId currently mid-toggle
// so an in-flight optimistic value isn't clobbered by a stale GET/list refetch.
function seedFavorites(events: Array<{ id: string; isFavorite?: boolean }>, defaultValue?: boolean) {
  let changed = false;
  for (const e of events) {
    if (inFlightFavorites.has(e.id)) continue;
    const next = e.isFavorite ?? defaultValue ?? false;
    if (favoriteState.get(e.id) !== next) {
      favoriteState.set(e.id, next);
      changed = true;
    }
  }
  if (changed) notifyFavorites();
}

export function useIsFavorite(eventId: string, fallback = false): boolean {
  const get = () => (favoriteState.has(eventId) ? favoriteState.get(eventId)! : fallback);
  return useSyncExternalStore(subscribeFavorites, get, get);
}

// ─── List invalidation ───────────────────────────────────────────────────────
// Mutations bump a per-list version. List hooks subscribe to it so they refetch
// the moment a related mutation succeeds — anywhere in the app.

const listVersions = new Map<string, number>();
const versionSubscribers = new Set<() => void>();
const subscribeVersions = (cb: () => void) => {
  versionSubscribers.add(cb);
  return () => { versionSubscribers.delete(cb); };
};

function useListVersion(key: string): number {
  const get = () => listVersions.get(key) ?? 0;
  return useSyncExternalStore(subscribeVersions, get, get);
}

function bumpVersion(...keys: string[]) {
  for (const k of keys) listVersions.set(k, (listVersions.get(k) ?? 0) + 1);
  versionSubscribers.forEach((fn) => fn());
}

const API_BASE = process.env.EXPO_PUBLIC_LARAVEL_API_URL || 'https://only4kiddos.com/api';

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const base = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const user = getAuth().currentUser;
  if (!user) return base;
  const token = await user.getIdToken();
  return { ...base, Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const label = `${method} ${path}`;
  const url = `${API_BASE}${path}`;
  const headers = await getAuthHeaders();

  const token = headers.Authorization?.replace(/^Bearer\s+/, '');
  const requestLog: Record<string, unknown> = {
    url,
    auth: token ? `Bearer ${token.slice(0, 24)}…${token.slice(-8)} (len=${token.length}, segments=${token.split('.').length})` : 'none',
  };
  if (options?.body) requestLog.body = safeParse(options.body);
  console.log(`[API Request] ${label}`, requestLog);

  if (token) {
    const bodyArg = options?.body ? ` -d '${String(options.body).replace(/'/g, "'\\''")}'` : '';
    console.log(`[curl ${label}] curl -sS -i -X ${method} -H 'Accept: application/json' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${token}'${bodyArg} '${url}'`);
  }

  try {
    const res = await fetch(url, { ...options, headers: { ...headers, ...options?.headers } });
    const text = await res.text();
    const data = text ? safeParse(text) : null;

    if (!res.ok) {
      console.log(`[API Failure] ${label}`, { status: res.status, response: data });
      throw new Error((data && (data.error || data.message)) || `API error ${res.status}`);
    }

    console.log(`[API Success] ${label}`, data);
    return data as T;
  } catch (e) {
    if (e instanceof TypeError) {
      console.log(`[API Network Error] ${label}`, e.message);
    }
    throw e;
  }
}

function safeParse(value: unknown): any {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  location: string;
  address: string;
  price: number;
  ageRange: { min: number; max: number };
  category: string;
  hostName: string;
  hostImage: string;
  capacity: number;
  spotsLeft: number;
  tags: string[];
  accessibilityFeatures: string[];
  isFavorite: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  interests: string[];
  allergies: string[];
  specialNeeds: string[];
  avatarColor: string;
  parentId: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  eventId: string;
  childIds: string[];
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingDate: string;
  totalAmount: number;
  userId: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Events ──────────────────────────────────────────────────────────────────

// Base hook — raw Laravel API shape
export function useEvents(filters?: {
  search?: string;
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
}) {
  const [data, setData] = useState<{ items: Event[]; total: number; hasMore: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.categories?.length) params.set('categories', filters.categories.join(','));
      if (filters?.priceMin != null) params.set('price_min', String(filters.priceMin));
      if (filters?.priceMax != null) params.set('price_max', String(filters.priceMax));
      const result = await apiFetch<{ items: Event[]; total: number; hasMore: boolean }>(`/events?${params}`);
      seedFavorites(result.items);
      setData(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.categories?.join(','), filters?.priceMin, filters?.priceMax]);

  useEffect(() => { load(); }, [load]);
  return { data, isLoading, error, refetch: load };
}

// useEventList — tRPC-compatible name + filter shape + isError boolean
export function useEventList(filters?: {
  categories?: string[];
  searchQuery?: string;
  priceRange?: { min: number; max: number };
  ageRange?: { min: number; max: number };
  limit?: number;
  offset?: number;
}) {
  const { data, isLoading, error, refetch } = useEvents({
    search: filters?.searchQuery,
    categories: filters?.categories,
    priceMin: filters?.priceRange?.min,
    priceMax: filters?.priceRange?.max,
  });
  return { data, isLoading, isError: !!error, refetch };
}

// useEvent — base hook (raw shape)
export function useEvent(id: string) {
  const [data, setData] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<Event>(`/events/${id}`)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [id]);

  return { data, isLoading, error };
}

// useEventById — tRPC-compatible name + isError + refetch
export function useEventById(id: string) {
  const [data, setData] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFetch<Event>(`/events/${id}`);
      setData(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  return { data, isLoading, isError: !!error, refetch: load };
}

// Documented Laravel payload for POST /api/events.
export interface CreateEventApiInput {
  title: string;
  description: string;
  venue: string;
  start_date: string;   // 'YYYY-MM-DDTHH:mm:ss'
  end_date: string;
  category_id: number;
  max_attendees: number;
  price: number;
  ticket_name: string;
  age_min: number;
  age_max: number;
}

// useCreateEvent — accepts either the documented API shape OR the legacy
// screen-side shape ({title, description, date, time, location, capacity,
// ageRange, ...}) and maps it for backward compatibility. Newly created
// events return with status="pending" and only appear publicly once approved
// in the admin panel.
export function useCreateEvent() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (input: any) => {
    const payload = toCreateEventApiPayload(input);
    setIsPending(true);
    try {
      const result = await apiFetch<Event>('/events', { method: 'POST', body: JSON.stringify(payload) });
      bumpVersion('events');
      return result;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

function toCreateEventApiPayload(input: any): CreateEventApiInput {
  // Already-correct API shape passes through.
  if (input && typeof input.start_date === 'string' && typeof input.category_id === 'number') {
    return input as CreateEventApiInput;
  }
  // Legacy shape: { title, description, date: 'YYYY-MM-DD', time: 'HH:mm',
  // location, address, price, ageRange:{min,max}, category:string, capacity, ... }
  const startISO = input.date && input.time
    ? `${String(input.date).slice(0, 10)}T${input.time}:00`
    : input.date || new Date().toISOString().slice(0, 19);
  return {
    title: input.title,
    description: input.description,
    venue: input.address || input.location || input.venue || '',
    start_date: startISO,
    end_date: input.end_date || startISO,
    category_id: typeof input.category_id === 'number' ? input.category_id : 1,
    max_attendees: Number(input.capacity ?? input.max_attendees ?? 0),
    price: Number(input.price ?? 0),
    ticket_name: input.ticket_name || 'General Admission',
    age_min: Number(input.ageRange?.min ?? input.age_min ?? 0),
    age_max: Number(input.ageRange?.max ?? input.age_max ?? 18),
  };
}

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch<Category[]>('/categories').then(setData).finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

// ─── Favorites ───────────────────────────────────────────────────────────────

// useFavorites — base hook
export function useFavorites() {
  const [data, setData] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const version = useListVersion('favorites');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const result: any = await apiFetch<any>('/favorites');
      const items: Event[] = Array.isArray(result)
        ? result
        : Array.isArray(result?.data) ? result.data
        : Array.isArray(result?.items) ? result.items
        : [];
      seedFavorites(items, true);
      setData(items);
    } catch {
      // swallow — keep previous data, don't crash UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, version]);
  return { data, isLoading, refetch: load };
}

// useFavoriteEvents — tRPC-compatible name alias
export function useFavoriteEvents() {
  return useFavorites();
}

// useToggleFavorite — tRPC-compatible: { mutate, mutateAsync, isPending }
// Optimistically flips the shared favorites store, fires the API, then
// reconciles with the server's authoritative isFavorite (or reverts on failure).
export function useToggleFavorite() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({ eventId }: { eventId: string }) => {
    const previous = favoriteState.get(eventId) ?? false;
    inFlightFavorites.add(eventId);
    setFavorite(eventId, !previous);
    setIsPending(true);
    try {
      const result = await apiFetch<{ isFavorite: boolean; message: string }>('/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      });
      setFavorite(eventId, result.isFavorite);
      inFlightFavorites.delete(eventId);
      bumpVersion('favorites');
      return result;
    } catch (e) {
      setFavorite(eventId, previous);
      inFlightFavorites.delete(eventId);
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  const mutate = ({ eventId }: { eventId: string }) => {
    mutateAsync({ eventId }).catch(() => {});
  };

  return { mutate, mutateAsync, isPending };
}

// ─── Children ────────────────────────────────────────────────────────────────

export function useChildren() {
  const [data, setData] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const version = useListVersion('children');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const result: any = await apiFetch<any>('/children');
      const items: Child[] = Array.isArray(result)
        ? result
        : Array.isArray(result?.data) ? result.data
        : Array.isArray(result?.items) ? result.items
        : [];
      setData(items);
    } catch {
      // swallow — keep previous data, don't crash UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, version]);
  return { data, isLoading, refetch: load };
}

// useAddChild — base hook
export function useAddChild() {
  const [isLoading, setIsLoading] = useState(false);

  const addChild = async (child: {
    name: string;
    age: number;
    interests?: string[];
    allergies?: string[];
    specialNeeds?: string[];
    avatarColor?: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await apiFetch<Child>('/children', { method: 'POST', body: JSON.stringify(child) });
      bumpVersion('children');
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { addChild, isLoading };
}

// useCreateChild — tRPC-compatible name + { mutateAsync, isPending }
export function useCreateChild() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (child: {
    name: string;
    age: number;
    interests?: string[];
    allergies?: string[];
    specialNeeds?: string[];
    avatarColor?: string;
  }) => {
    setIsPending(true);
    try {
      const result = await apiFetch<Child>('/children', { method: 'POST', body: JSON.stringify(child) });
      bumpVersion('children');
      return result;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

export function useUpdateChild() {
  const [isLoading, setIsLoading] = useState(false);

  const updateChild = async (id: string, updates: Partial<Child>) => {
    setIsLoading(true);
    try {
      const result = await apiFetch<Child>(`/children/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      bumpVersion('children');
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateChild, isLoading };
}

// useDeleteChild — tRPC-compatible: { mutateAsync, isPending } with { id } arg shape
export function useDeleteChild() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({ id }: { id: string }) => {
    setIsPending(true);
    try {
      const result = await apiFetch<{ success: boolean }>(`/children/${id}`, { method: 'DELETE' });
      bumpVersion('children');
      return result;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export function useBookings() {
  const [data, setData] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const version = useListVersion('bookings');

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const result: any = await apiFetch<any>('/bookings');
      // Defensive: Laravel may return [] OR a paginator wrapper {data:[...]} /
      // {items:[...]} OR an error envelope. Always coerce to an array so
      // downstream .filter/.map/.length work.
      const items: Booking[] = Array.isArray(result)
        ? result
        : Array.isArray(result?.data) ? result.data
        : Array.isArray(result?.items) ? result.items
        : [];
      setData(items);
    } catch {
      // Auth errors etc. — keep last good data, don't crash consumers.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, version]);
  return { data, isLoading, refetch: load };
}

// Booking response from POST /api/bookings. For paid events, the response
// includes a Stripe client secret which the screen presents via Stripe's
// Payment Sheet, then calls useConfirmBooking on success.
export interface CreateBookingResponse extends Booking {
  paymentIntentClientSecret?: string;
}

// useCreateBooking — POST /api/bookings { eventId, childIds }
// Free events come back already confirmed/paid; paid events return
// status="pending_payment" with paymentIntentClientSecret for Stripe.
export function useCreateBooking() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({ eventId, childIds }: { eventId: string; childIds: string[] }) => {
    setIsPending(true);
    try {
      const result = await apiFetch<CreateBookingResponse>('/bookings', {
        method: 'POST',
        body: JSON.stringify({ eventId, childIds }),
      });
      bumpVersion('bookings');
      return result;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

// useConfirmBooking — POST /api/bookings/{id}/confirm
// Call after Stripe's payment sheet completes successfully. Server transitions
// the booking from "pending_payment" → "confirmed".
export function useConfirmBooking() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async ({ id }: { id: string }) => {
    setIsPending(true);
    try {
      const result = await apiFetch<Booking>(`/bookings/${id}/confirm`, { method: 'POST' });
      bumpVersion('bookings');
      return result;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}

export function useCancelBooking() {
  const cancelBooking = async (id: string) => {
    const result = await apiFetch<Booking>(`/bookings/${id}`, { method: 'DELETE' });
    bumpVersion('bookings');
    return result;
  };
  return { cancelBooking };
}

// useUpcomingBookings — tRPC-compatible computed hook derived from useBookings
export function useUpcomingBookings() {
  const { data: bookings, isLoading } = useBookings();
  const list: Booking[] = Array.isArray(bookings) ? bookings : [];

  const upcomingBookings = list
    .filter((b: Booking) => b?.status === 'confirmed')
    .sort((a: Booking, b: Booking) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());

  return { upcomingBookings, isLoading };
}

// ─── Search ───────────────────────────────────────────────────────────────────

// useEventSearch — tRPC-compatible with 300ms debounce
export function useEventSearch(searchQuery: string, filters: { categories?: string[] } = {}) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return useEventList({ ...filters, searchQuery: debouncedQuery.trim() || undefined });
}

// ─── User ─────────────────────────────────────────────────────────────────────

export function useUser() {
  const [data, setData] = useState<{ uid: string; email: string; name: string; emailVerified: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ uid: string; email: string; name: string; emailVerified: boolean }>('/user')
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export async function syncFirebaseUser(): Promise<void> {
  await apiFetch('/auth/firebase', { method: 'POST' });
}

// useDeleteAccount — DELETE /api/account
// Apple-required account-deletion flow. After this resolves the caller MUST
// also sign the user out from Firebase and navigate to /login.
export function useDeleteAccount() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async () => {
    setIsPending(true);
    try {
      return await apiFetch<{ success?: boolean; message?: string }>('/account', { method: 'DELETE' });
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending };
}
