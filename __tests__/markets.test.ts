import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  eventQueryParams, findMarket, initialMarketSlug, marketForCity, marketLabel, suggestCities, type Market,
} from '../lib/markets';

// Shape of GET /api/markets (trimmed city lists).
const markets: Market[] = [
  { slug: 'atlanta', name: 'Atlanta', stateCode: 'GA', cities: ['Atlanta', 'Decatur', 'Marietta'] },
  { slug: 'louisville', name: 'Louisville', stateCode: 'KY', cities: ['Louisville', 'New Albany'] },
  {
    slug: 'detroit', name: 'Detroit', stateCode: 'MI',
    cities: ['Ann Arbor', 'Dearborn', 'Dearborn Heights', 'Detroit', 'Ferndale', 'Livonia', 'Royal Oak', 'Saline', 'Shelby Township', 'Southfield'],
  },
];

test('findMarket looks up by slug and tolerates empty input', () => {
  assert.equal(findMarket(markets, 'detroit')?.name, 'Detroit');
  assert.equal(findMarket(markets, 'chicago'), null);
  assert.equal(findMarket(markets, null), null);
  assert.equal(findMarket(markets, ''), null);
});

test('marketForCity matches a city name in any case, like the server resolver', () => {
  assert.equal(marketForCity(markets, 'Royal Oak')?.slug, 'detroit');
  assert.equal(marketForCity(markets, '  royal oak ')?.slug, 'detroit');
  assert.equal(marketForCity(markets, 'Decatur')?.slug, 'atlanta');
  assert.equal(marketForCity(markets, 'Chicago'), null);
  assert.equal(marketForCity(markets, 'Royal'), null, 'partial names do not match');
  assert.equal(marketForCity(markets, ''), null);
});

test('suggestCities puts prefix matches first and stays within the market', () => {
  const detroit = findMarket(markets, 'detroit');
  assert.deepEqual(suggestCities(detroit, 'dear'), ['Dearborn', 'Dearborn Heights']);
  assert.deepEqual(suggestCities(detroit, 'field'), ['Southfield']);
  assert.deepEqual(suggestCities(detroit, 'S'), ['Saline', 'Shelby Township', 'Southfield', 'Dearborn Heights']);
  assert.deepEqual(suggestCities(detroit, 'Marietta'), [], 'Atlanta cities are not suggested for Detroit');
  assert.deepEqual(suggestCities(detroit, 'royal oak'), [], 'nothing to suggest once the city is exact');
  assert.equal(suggestCities(detroit, '', 3).length, 3);
  assert.deepEqual(suggestCities(null, 'dear'), []);
});

test('initialMarketSlug prefers the saved market, then the saved city', () => {
  assert.equal(initialMarketSlug(markets, { market: 'louisville', city: 'Royal Oak' }), 'louisville');
  assert.equal(initialMarketSlug(markets, { market: null, city: 'Ann Arbor' }), 'detroit');
  // A market that's been switched off falls back to the city.
  assert.equal(initialMarketSlug(markets, { market: 'columbus', city: 'Ferndale' }), 'detroit');
  assert.equal(initialMarketSlug(markets, { market: null, city: 'Chicago' }), null);
  assert.equal(initialMarketSlug([], { market: 'detroit', city: 'Detroit' }), null);
});

test('marketLabel names the market with its state, or All areas', () => {
  assert.equal(marketLabel(markets, 'detroit'), 'Detroit, MI');
  assert.equal(marketLabel(markets, null), 'All areas');
  assert.equal(marketLabel(markets, 'gone'), 'All areas');
  assert.equal(marketLabel([{ slug: 'x', name: 'X', stateCode: null, cities: [] }], 'x'), 'X');
});

test('eventQueryParams sends market alongside the existing filters', () => {
  const qs = new URLSearchParams(eventQueryParams({ search: 'art', categories: ['stem', 'arts'], market: 'detroit' }));
  assert.equal(qs.get('market'), 'detroit');
  assert.equal(qs.get('search'), 'art');
  assert.equal(qs.get('categories'), 'stem,arts');
});

test('eventQueryParams omits market when browsing all areas', () => {
  assert.equal(new URLSearchParams(eventQueryParams({ market: null })).has('market'), false);
  assert.equal(new URLSearchParams(eventQueryParams({})).has('market'), false);
  assert.equal(eventQueryParams(), '');
});

test('price filters still serialise (0 is kept)', () => {
  const qs = new URLSearchParams(eventQueryParams({ priceMin: 0, priceMax: 50 }));
  assert.equal(qs.get('price_min'), '0');
  assert.equal(qs.get('price_max'), '50');
});
