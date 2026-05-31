#!/usr/bin/env node
import http from 'node:http';

const image = 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80';

const tours = [
  {
    id: 'mock-vietnam-tour',
    type: 'hlt_tour',
    title: 'Luxury Vietnam Tour 10 Days',
    slug: 'luxury-vietnam-tour-10-days',
    excerpt: 'A private Vietnam journey through Hanoi, Ha Long Bay, Hue, Hoi An and Saigon.',
    content: 'Designed for travelers who want culture, comfort and graceful pacing.',
    featuredImage: image,
    meta: {
      seo: { title: 'Luxury Vietnam Tour 10 Days', description: 'Private luxury Vietnam tour with Ha Long Bay and Hoi An.' },
      gallery: [image, image, image, image, image],
      itinerary: [
        { day: 'Day 1', title: 'Hanoi arrival', body: 'Private arrival support and an easy old quarter walk.' },
        { day: 'Day 2', title: 'Hanoi culture', body: 'Museums, artisan encounters and refined local dining.' }
      ],
      pricing: [{ tier: 'Private journey', price: 'From USD 4,800 per person' }],
      faq: [{ question: 'Is this private?', answer: 'Yes, every departure is privately arranged.' }],
      details: {
        country: 'Vietnam',
        duration: '10 days',
        style: 'Luxury',
        includes: ['Private guide', 'Selected hotels', 'Private transfers'],
        excludes: ['International flights', 'Travel insurance']
      }
    }
  }
];

const cruises = [
  {
    id: 'mock-cruise',
    type: 'hlt_cruise',
    title: 'Ha Long Bay Luxury Cruise',
    slug: 'ha-long-bay-luxury-cruise',
    excerpt: 'A refined overnight cruise through limestone islands and quiet coves.',
    content: 'A polished Ha Long Bay cruise with spacious cabins and calm service.',
    featuredImage: image,
    meta: {
      seo: { title: 'Ha Long Bay Luxury Cruise', description: 'Luxury Ha Long Bay cruise with cabins and bay itinerary.' },
      gallery: [image, image, image, image, image],
      cabins: [
        { name: 'Junior Suite', size: '32 sqm', occupancy: '2 guests', price: 'From USD 320 cabin' },
        { name: 'Terrace Suite', size: '42 sqm', occupancy: '2 guests', price: 'From USD 480 cabin' },
        { name: 'Owner Suite', size: '60 sqm', occupancy: '2 guests', price: 'From USD 760 cabin' }
      ],
      itinerary: [
        { day: 'Day 1', title: 'Board and Bay Drift', body: 'Embark, lunch on deck, cave visit and sunset cocktails.' },
        { day: 'Day 2', title: 'Morning Tai Chi', body: 'Tai chi, brunch and disembarkation.' }
      ],
      pricing: [{ tier: 'Suite Deck', price: 'From USD 320 cabin' }],
      details: {
        country: 'Vietnam',
        route: 'Ha Long Bay',
        duration: '2 days',
        includes: ['Cabin accommodation', 'Onboard meals'],
        excludes: ['Transfers unless requested', 'Drinks']
      }
    }
  }
];

const posts = [
  {
    id: 'mock-post',
    type: 'post',
    title: 'Best Time to Visit Vietnam in Style',
    slug: 'best-time-to-visit-vietnam',
    excerpt: 'Season-by-season planning notes for a refined Vietnam holiday.',
    content: '<p>Vietnam works year-round when the route follows regional weather.</p>',
    featuredImage: image,
    meta: { seo: { title: 'Best Time to Visit Vietnam', description: 'Luxury Vietnam weather and season guide.' } }
  }
];

const styles = [
  {
    id: 'mock-style',
    type: 'hlt_travel_style',
    title: 'Luxury',
    slug: 'luxury',
    excerpt: 'High-touch private travel with graceful pacing and selected hotels.',
    content: 'Luxury private journeys across Southeast Asia.',
    featuredImage: image,
    meta: { seo: { title: 'Luxury Travel Style', description: 'Luxury private travel style for Asia.' } }
  }
];

const collections = { tours, cruises, posts, styles, countries: [] };

function send(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/');
  if (parts[0] !== 'content') return send(res, 404, { message: 'Not found' });
  const collection = collections[parts[1]];
  if (!collection) return send(res, 404, { message: 'Unknown collection' });
  if (!parts[2]) return send(res, 200, collection);
  const item = collection.find((entry) => entry.slug === decodeURIComponent(parts[2]));
  return item ? send(res, 200, item) : send(res, 404, { message: 'Missing slug' });
});

const port = Number(process.env.MOCK_CMS_PORT || 4010);
server.listen(port, '127.0.0.1', () => {
  console.log(`Mock CMS listening on http://127.0.0.1:${port}`);
});
