import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateToursFromFacts } from './generate-legal-tour-data.mjs';

const facts = [
  {
    title: 'Majestic Vietnam with Beach Vacation 17 days',
    sourceUrl: 'https://www.bestpricetravel.com/vietnam-tours/majestic-vietnam-with-beach-relaxation-17-days.html',
    country: 'vietnam',
    route: 'Hanoi - Sapa - Halong Bay - Hoi An - Hue - Ho Chi Minh City - Mekong Delta - Phu Quoc',
    places: ['Hanoi', 'Sapa', 'Halong Bay', 'Hoi An', 'Hue', 'Ho Chi Minh City', 'Mekong Delta', 'Phu Quoc'],
    durationDays: 17,
    durationLabel: '17 days',
    style: 'Beach Vacation',
    priceFromUsd: 1728,
    oldPriceUsd: 1819,
    rating: 9.4,
    reviewCount: 29,
    categories: ['Beach Vacation', 'Private Tour']
  }
];

const imagePools = {
  fallback: [
    {
      url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=4000&q=92',
      alt: 'Limestone karsts and emerald water in northern Vietnam',
      provider: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/photo-1528127269322-539801943592',
      license: 'Unsplash License',
      width: 4000,
      height: 2667
    },
    {
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=4000&q=92',
      alt: 'Tropical beach with palm trees and calm sea',
      provider: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/photo-1500530855697-b586d89ba3ee',
      license: 'Unsplash License',
      width: 4000,
      height: 2667
    },
    {
      url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=4000&q=92',
      alt: 'Lush Vietnamese river landscape with boats',
      provider: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/photo-1559592413-7cec4d0cae2b',
      license: 'Unsplash License',
      width: 4000,
      height: 2667
    },
    {
      url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=4000&q=92',
      alt: 'Mountain landscape at golden light for a private route',
      provider: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/photo-1500534314209-a25ddb2bd429',
      license: 'Unsplash License',
      width: 4000,
      height: 2667
    }
  ]
};

const tours = generateToursFromFacts(facts, imagePools);
const [tour] = tours;

assert.equal(tours.length, 1);
assert.equal(tour.type, 'hlt_tour');
assert.equal(tour.meta.details.sourceUrl, facts[0].sourceUrl);
assert.equal(tour.meta.details.country, 'vietnam');
assert.equal(tour.meta.details.duration, '17 days');
assert.equal(tour.meta.details.reviewRating, '9.4');
assert.equal(tour.meta.details.reviewCount, '29 reviews');
assert.equal(tour.meta.pricing[0].price, 'From USD 1,728 pp');
assert.equal(tour.meta.pricing[1].price, 'Usually USD 1,819 pp');
assert.ok(tour.meta.details.sourceCompliance.includes('public factual reference'));
assert.ok(tour.meta.details.importantNotes.length >= 4);
assert.ok(tour.meta.details.blogSections.length >= 3);
assert.ok(tour.meta.itinerary.length >= 4);
assert.ok(tour.meta.gallery.length >= 3);
assert.ok(tour.meta.gallery.every((url) => !/bestpricetravel|cloudfront/i.test(url)));
assert.ok(tour.featuredImage.includes('w=4000'));
assert.ok(tour.content.includes('Majestic Vietnam with Beach Vacation 17 days'));

const generatedTours = JSON.parse(fs.readFileSync('data/generated-legal-tours.json', 'utf8'));
const featuredImageOwners = new Map();

for (const generatedTour of generatedTours) {
  const imageAttributions = generatedTour.meta.details.imageAttributions || [];
  const attributionByUrl = new Map(imageAttributions.map((item) => [item.url, item]));
  const tourImageUrls = [generatedTour.featuredImage, ...(generatedTour.meta.gallery || [])];
  const featuredAttribution = attributionByUrl.get(generatedTour.featuredImage);
  const owner = featuredImageOwners.get(generatedTour.featuredImage);
  assert.ok(generatedTour.meta.details.sourceCompliance, `Missing source compliance note for ${generatedTour.slug}`);
  assert.ok(generatedTour.meta.details.importantNotes?.length >= 4, `Missing important notes for ${generatedTour.slug}`);
  assert.equal(
    owner,
    undefined,
    `Duplicate featured image shared by "${owner}" and "${generatedTour.slug}": ${generatedTour.featuredImage}`
  );
  featuredImageOwners.set(generatedTour.featuredImage, generatedTour.slug);
  assert.equal(new Set(tourImageUrls).size, tourImageUrls.length, `Duplicate image inside ${generatedTour.slug}`);
  assert.ok(!generatedTour.meta.gallery.includes(generatedTour.featuredImage), `Gallery repeats featured image for ${generatedTour.slug}`);
  assert.ok(!/\/1920px-/i.test(generatedTour.featuredImage), `Expected 4K thumbnail URL for ${generatedTour.slug}`);
  assert.ok(featuredAttribution, `Missing image attribution URL for ${generatedTour.slug}`);
  for (const imageUrl of tourImageUrls) {
    assert.ok(!/\/1920px-/i.test(imageUrl), `Expected 4K image URL for ${generatedTour.slug}: ${imageUrl}`);
    const attribution = attributionByUrl.get(imageUrl);
    assert.ok(attribution, `Missing image attribution URL for ${generatedTour.slug}: ${imageUrl}`);
    const width = Number(attribution.width);
    const height = Number(attribution.height);
    assert.ok(
      Math.max(width, height) >= 3840 && Math.min(width, height) >= 2160,
      `Image is below 4K for ${generatedTour.slug}: ${width}x${height}`
    );
  }
}

assert.ok(generatedTours.length >= 700, 'Expected full generated legal tour dataset from BestPrice public tour pages');
assert.ok(generatedTours.some((generatedTour) => generatedTour.meta.details.country === 'myanmar'), 'Expected Myanmar tours in generated dataset');

console.log(`tour importer assertions passed for ${tours.length} generated tour and ${generatedTours.length} unique featured images`);
