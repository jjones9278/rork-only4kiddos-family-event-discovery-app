// Shared event filter state, read by:
//   - useEventList in (home)/index.tsx
//   - CategoryFilter chips on the home tab
//   - The filters modal (app/filters.tsx)
//
// Module-level + useSyncExternalStore — same pattern as the favorites store
// in use-events-laravel.ts, so no extra dependency.

import { useSyncExternalStore } from 'react';

export interface EventFilters {
  categories: string[];
  ageRange: { min: number; max: number };
  priceRange: { min: number; max: number };
}

const DEFAULT_FILTERS: EventFilters = {
  categories: [],
  ageRange: { min: 0, max: 18 },
  priceRange: { min: 0, max: 100 },
};

let state: EventFilters = { ...DEFAULT_FILTERS };
const subscribers = new Set<() => void>();
const subscribe = (cb: () => void) => {
  subscribers.add(cb);
  return () => { subscribers.delete(cb); };
};
const notify = () => subscribers.forEach((fn) => fn());

export function useFilters(): EventFilters {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function setFilters(next: EventFilters) {
  state = next;
  notify();
}

export function setCategories(categories: string[]) {
  state = { ...state, categories };
  notify();
}

export function toggleCategoryFilter(category: string) {
  const next = state.categories.includes(category)
    ? state.categories.filter((c) => c !== category)
    : [...state.categories, category];
  setCategories(next);
}

export function setAgeRange(ageRange: { min: number; max: number }) {
  state = { ...state, ageRange };
  notify();
}

export function setPriceRange(priceRange: { min: number; max: number }) {
  state = { ...state, priceRange };
  notify();
}

export function resetFilters() {
  state = { ...DEFAULT_FILTERS };
  notify();
}
