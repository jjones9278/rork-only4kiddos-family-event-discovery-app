// Market helpers shared by onboarding, the event filters and create-event.
//
// The market list itself is NOT defined here: it comes from the server
// (GET /api/markets, or options.markets on the family profile), which reads
// the markets/market_cities tables. Adding a city or launching a market is a
// data change on the website admin — no app release. Keep this file pure (no
// React, no network) so it can be unit tested.

export interface Market {
  slug: string;
  name: string;
  stateCode: string | null;
  cities: string[];
}

const norm = (s: string) => s.trim().toLowerCase();

export function findMarket(markets: Market[], slug: string | null | undefined): Market | null {
  if (!slug) return null;
  return markets.find((m) => m.slug === slug) ?? null;
}

// Same rule as the server's MarketResolver: exact city name, any case.
export function marketForCity(markets: Market[], city: string | null | undefined): Market | null {
  if (!city || !city.trim()) return null;
  const c = norm(city);
  return markets.find((m) => m.cities.some((name) => norm(name) === c)) ?? null;
}

// Typeahead suggestions within one market. Prefix matches first, then
// anywhere-in-name matches; an exact match means nothing left to suggest.
export function suggestCities(market: Market | null, query: string, limit = 8): string[] {
  if (!market) return [];
  const q = norm(query);
  if (!q) return market.cities.slice(0, limit);
  if (market.cities.some((c) => norm(c) === q)) return [];
  const starts = market.cities.filter((c) => norm(c).startsWith(q));
  const contains = market.cities.filter((c) => !norm(c).startsWith(q) && norm(c).includes(q));
  return [...starts, ...contains].slice(0, limit);
}

// The market to preselect for a saved profile: the saved market if it's still
// active, else whatever the saved city resolves to.
export function initialMarketSlug(
  markets: Market[],
  saved: { market?: string | null; city?: string | null },
): string | null {
  return findMarket(markets, saved.market)?.slug ?? marketForCity(markets, saved.city)?.slug ?? null;
}

// Header/filter label: "Detroit, MI", or "All areas" when unfiltered.
export function marketLabel(markets: Market[], slug: string | null | undefined): string {
  const m = findMarket(markets, slug);
  if (!m) return 'All areas';
  return m.stateCode ? `${m.name}, ${m.stateCode}` : m.name;
}

// Query string for GET /api/events. The API filters by market only — events
// have no city of their own (venue is free text).
export function eventQueryParams(filters?: {
  search?: string;
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  market?: string | null;
}): string {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.categories?.length) params.set('categories', filters.categories.join(','));
  if (filters?.priceMin != null) params.set('price_min', String(filters.priceMin));
  if (filters?.priceMax != null) params.set('price_max', String(filters.priceMax));
  if (filters?.market) params.set('market', filters.market);
  return params.toString();
}
