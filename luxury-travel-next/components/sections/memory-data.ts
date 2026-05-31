export type MemoryPhoto = {
  src: string;
  alt: string;
  caption: string;
};

export type MemoryAlbum = {
  cover: string;
  alt: string;
  label: string;
  note: string;
  className: string;
  photos: MemoryPhoto[];
};

export const memories: MemoryAlbum[] = [
  {
    cover: '/images/booking/vietnam-ha-long-kayaks-4k.jpg',
    alt: 'Private guests kayaking through Ha Long Bay limestone scenery',
    label: 'Ha Long golden water',
    note: 'Kayaks, limestone cliffs and a quiet morning on the bay',
    className: 'md:col-span-3 xl:col-span-3',
    photos: [
      {
        src: '/images/booking/vietnam-ha-long-kayaks-4k.jpg',
        alt: 'Guests kayaking through Ha Long Bay limestone cliffs',
        caption: 'Ha Long Bay: calm water, kayaks and limestone walls at first light'
      },
      {
        src: '/images/hubs/vietnam-ha-long-bay-4k-crisp.jpg',
        alt: 'Ha Long Bay emerald water and limestone islands',
        caption: 'Ha Long Bay: a wide emerald panorama for the cruise day'
      },
      {
        src: '/images/hubs/vietnam-ninh-binh-karsts-4k-crisp.jpg',
        alt: 'Ninh Binh limestone karsts and river landscape',
        caption: 'Ninh Binh: the northern karst landscape after the bay'
      },
      {
        src: '/images/hubs/vietnam-trang-an-river-4k-crisp.jpg',
        alt: 'Trang An river route with limestone mountains',
        caption: 'Trang An: quiet rowing routes through limestone valleys'
      },
      {
        src: '/images/hubs/vietnam-ninh-binh-tam-coc-4k-crisp.jpg',
        alt: 'Tam Coc river and rice fields in Ninh Binh',
        caption: 'Tam Coc: rice fields, river bends and soft afternoon light'
      }
    ]
  },
  {
    cover: '/images/trip-styles/culinary-journeys-4k.jpg',
    alt: 'Private culinary memory with local food and table moments',
    label: 'A table worth remembering',
    note: 'A single hero memory for food lovers and slower evenings',
    className: 'md:col-span-2 xl:col-span-2',
    photos: [
      {
        src: '/images/trip-styles/culinary-journeys-4k.jpg',
        alt: 'Vietnam culinary journey with local dishes and warm table light',
        caption: 'Culinary journey: one table, local flavours and a night worth keeping'
      }
    ]
  },
  {
    cover: '/images/trip-styles/family-holidays-4k.jpg',
    alt: 'Family holiday moment in Southeast Asia',
    label: 'Family days',
    note: 'The small expressions that become the story of the trip',
    className: 'md:col-span-2 xl:col-span-2',
    photos: [
      {
        src: '/images/trip-styles/family-holidays-4k.jpg',
        alt: 'Family holiday memory in Southeast Asia',
        caption: 'Family holiday: easy pacing and room for every generation'
      },
      {
        src: '/images/trip-styles/beach-escapes-4k.jpg',
        alt: 'Tropical beach escape with clear water',
        caption: 'Beach escape: open sand, warm water and a slow afternoon'
      },
      {
        src: '/images/trip-styles/waterfall-retreats-4k.jpg',
        alt: 'Waterfall retreat surrounded by green forest',
        caption: 'Waterfall retreat: cool air, clear pools and a quiet reset'
      },
      {
        src: '/images/trip-styles/adventure-vacations-4k.jpg',
        alt: 'Outdoor adventure vacation memory',
        caption: 'Adventure day: movement, scenery and a story to bring home'
      },
      {
        src: '/images/trip-styles/mountain-retreats-4k.jpg',
        alt: 'Mountain retreat landscape for family travel',
        caption: 'Mountain retreat: clean air and a gentler family rhythm'
      }
    ]
  },
  {
    cover: '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
    alt: 'Hoi An lantern streets and heritage rooftops for private Vietnam memories',
    label: 'Lantern-lit Central Vietnam',
    note: 'Hoi An lanes, Hue heritage and Da Nang evening lights',
    className: 'md:col-span-3 xl:col-span-3',
    photos: [
      {
        src: '/images/hubs/vietnam-hoi-an-ancient-town-4k-crisp.jpg',
        alt: 'Hoi An lantern streets and yellow heritage houses',
        caption: 'Hoi An: lantern streets, yellow walls and an unhurried walk'
      },
      {
        src: '/images/hubs/vietnam-hue-imperial-city-4k-crisp.jpg',
        alt: 'Hue Imperial City gates and heritage architecture',
        caption: 'Hue Imperial City: royal walls and a slower heritage morning'
      },
      {
        src: '/images/assurance/vietnam-golden-bridge-da-nang-4k.jpg',
        alt: 'Golden Bridge in Da Nang held by giant stone hands',
        caption: 'Da Nang Golden Bridge: the iconic mountain walkway above the clouds'
      },
      {
        src: '/images/hero/vietnam-da-nang-dragon-bridge-panorama-4k.jpg',
        alt: 'Da Nang Dragon Bridge and city panorama at night',
        caption: 'Da Nang: river lights, skyline reflections and the Dragon Bridge'
      }
    ]
  },
  {
    cover: '/images/trip-styles/honeymoon-4k.jpg',
    alt: 'Couple honeymoon memory during a private Asia journey',
    label: 'Romance kept private',
    note: 'Soft sand, private villas and quiet time between destinations',
    className: 'md:col-span-2 xl:col-span-2',
    photos: [
      {
        src: '/images/trip-styles/honeymoon-4k.jpg',
        alt: 'Couple honeymoon memory during a private Asia journey',
        caption: 'Honeymoon pause: privacy, soft light and a trip designed for two'
      },
      {
        src: '/images/trip-styles/island-villas-4k.jpg',
        alt: 'Luxury island villa over tropical water',
        caption: 'Island villa: a quiet base after days of discovery'
      },
      {
        src: '/images/collections/tailor-made-private-pool-asia-4k.jpg',
        alt: 'Private pool villa for a tailor-made Asia journey',
        caption: 'Private pool stay: one reserved moment away from the schedule'
      },
      {
        src: '/images/hero/vietnam-phu-quoc-bai-sao-4k.jpg',
        alt: 'Bai Sao beach on Phu Quoc island in Vietnam',
        caption: 'Phu Quoc Bai Sao: bright sand, clear water and an easy finish'
      },
      {
        src: '/images/trip-styles/luxury-stays-4k.jpg',
        alt: 'Luxury stay detail for a private romantic journey',
        caption: 'Luxury stay: the small hotel details that make the memory feel personal'
      }
    ]
  }
];

export const memoryPhotoTotal = memories.reduce((total, album) => total + album.photos.length, 0);
