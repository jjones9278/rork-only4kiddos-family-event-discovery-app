import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  effectiveMarket, getFilters, resetFilters, setFilters, setMarketFilter, toggleCategoryFilter,
} from '../hooks/use-filters-store';

const read = getFilters;

beforeEach(() => resetFilters());

test('market starts unchosen so the family profile market applies', () => {
  const f = read();
  assert.equal(f.market, undefined);
  assert.equal(effectiveMarket(f, 'detroit'), 'detroit');
  assert.equal(effectiveMarket(f, null), null);
  assert.equal(effectiveMarket(f, undefined), null);
});

test('an explicit market wins over the profile market', () => {
  setMarketFilter('atlanta');
  assert.equal(effectiveMarket(read(), 'detroit'), 'atlanta');
});

test('explicit All areas (null) is not overridden by the profile', () => {
  setMarketFilter(null);
  assert.equal(effectiveMarket(read(), 'detroit'), null);
});

test('category toggles keep the chosen market', () => {
  setMarketFilter('detroit');
  toggleCategoryFilter('stem');
  const f = read();
  assert.deepEqual(f.categories, ['stem']);
  assert.equal(f.market, 'detroit');
});

test('Apply from the filters screen sets market with the rest', () => {
  setFilters({ categories: [], ageRange: { min: 2, max: 9 }, priceRange: { min: 0, max: 40 }, market: 'louisville' });
  assert.equal(effectiveMarket(read(), 'detroit'), 'louisville');
});

test('reset returns to the profile default', () => {
  setMarketFilter('atlanta');
  resetFilters();
  assert.equal(effectiveMarket(read(), 'detroit'), 'detroit');
});
