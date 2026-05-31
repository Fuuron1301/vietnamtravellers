import assert from 'node:assert/strict';
import {
  createBookingTourCatalog,
  matchBookingTours,
  parseBudgetRange,
  parseDurationRange
} from '../lib/booking-tour-matcher.ts';

assert.deepEqual(parseDurationRange('6-8 days'), { min: 6, max: 8 });
assert.deepEqual(parseDurationRange('17+ days'), { min: 17, max: 60 });
assert.deepEqual(parseBudgetRange('USD 2,000 - 4,000 pp'), { min: 2000, max: 4000 });
assert.deepEqual(parseBudgetRange('USD 7,000+ pp'), { min: 7000, max: 1000000 });

const catalog = createBookingTourCatalog([
  {
    id: 'north-vietnam-luxury',
    type: 'hlt_tour',
    title: 'Northern Vietnam Luxury Cruise & Culture 8 Days',
    slug: 'north-vietnam-luxury',
    excerpt: 'Ha Long, Hanoi and Ninh Binh with private guides.',
    content: '',
    featuredImage: '/north.jpg',
    meta: {
      details: {
        country: 'vietnam',
        route: 'Hanoi - Ha Long Bay - Ninh Binh',
        places: ['Hanoi', 'Ha Long Bay', 'Ninh Binh'],
        duration: '8 days',
        style: 'Luxury',
        priceFromUsd: 2750,
        highlights: ['Luxury cruise', 'Private guiding']
      }
    }
  },
  {
    id: 'samui-beach',
    type: 'hlt_tour',
    title: 'Koh Samui Beach Escape 1 Day',
    slug: 'samui-beach',
    excerpt: 'Island beach day in Thailand.',
    content: '',
    featuredImage: '/samui.jpg',
    meta: {
      details: {
        country: 'thailand',
        route: 'Koh Samui',
        places: ['Koh Samui'],
        duration: '1 day',
        style: 'Beach Vacation',
        priceFromUsd: 98,
        highlights: ['Beach and island recovery']
      }
    }
  },
  {
    id: 'laos-culture',
    type: 'hlt_tour',
    title: 'Luang Prabang Culture 4 Days',
    slug: 'laos-culture',
    excerpt: 'Temples, waterfalls and Mekong.',
    content: '',
    featuredImage: '/laos.jpg',
    meta: {
      details: {
        country: 'laos',
        route: 'Luang Prabang - Pak Ou Caves',
        places: ['Luang Prabang', 'Pak Ou Caves'],
        duration: '4 days',
        style: 'Culture',
        priceFromUsd: 890,
        highlights: ['Heritage temples']
      }
    }
  }
]);

const matches = matchBookingTours(
  {
    destinations: ['Vietnam'],
    routeFocus: ['Bay and river journeys'],
    duration: '6-8 days',
    style: 'Luxury Stays',
    budget: 'USD 2,000 - 4,000 pp',
    interests: ['Cruise and water'],
    pace: 'Balanced',
    hotel: '5-star boutique'
  },
  catalog,
  3
);

assert.equal(matches[0].slug, 'north-vietnam-luxury');
assert.ok(matches[0].score > matches[1].score);
assert.ok(matches[0].reasons.some((reason) => /Vietnam/i.test(reason)));
assert.ok(matches[0].reasons.some((reason) => /duration/i.test(reason)));
assert.equal(matches[0].paymentAmountUsd, 2750);

const fallbackMatches = matchBookingTours(
  {
    destinations: ['Cambodia'],
    routeFocus: [],
    duration: '13-16 days',
    style: 'Please advise',
    budget: 'Please advise',
    interests: []
  },
  catalog,
  2
);

assert.equal(fallbackMatches.length, 2);
assert.ok(fallbackMatches.every((match) => match.score >= 0));

console.log('booking-tour-matcher tests passed');
