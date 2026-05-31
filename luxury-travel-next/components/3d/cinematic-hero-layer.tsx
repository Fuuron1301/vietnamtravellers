'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { WebGLFallback } from './webgl-fallback';

export type HeroLayerImage = {
  src: string;
  position?: string;
};

const heroRotationKey = 'luxury-travel:hero-image';
const selectedImages = new Map<string, HeroLayerImage>();

function pickNextImage(images: HeroLayerImage[], previousSrc: string | null) {
  const candidates = images.length > 1 ? images.filter((item) => item.src !== previousSrc) : images;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? images[0];
}

function selectClientHeroImage(key: string, images: HeroLayerImage[], fallback: HeroLayerImage) {
  let previousSrc: string | null = null;
  try {
    previousSrc = window.localStorage.getItem(key);
  } catch {
    previousSrc = null;
  }

  const selected = pickNextImage(images, previousSrc) ?? fallback;
  selectedImages.set(key, selected);

  try {
    window.localStorage.setItem(key, selected.src);
  } catch {
    // Private browsing can block localStorage; random rotation still works for this load.
  }

  return selected;
}

function subscribeHeroImageStore(key: string, images: HeroLayerImage[], fallback: HeroLayerImage, onStoreChange: () => void) {
  let cancelled = false;

  queueMicrotask(() => {
    if (cancelled || selectedImages.has(key)) return;
    selectClientHeroImage(key, images, fallback);
    onStoreChange();
  });

  return () => {
    cancelled = true;
  };
}

export function CinematicHeroLayer({ image, images, imagePosition, title }: { image: string; images?: readonly HeroLayerImage[]; imagePosition?: string; title: string }) {
  const pool = useMemo<HeroLayerImage[]>(() => {
    const heroImages = images?.length ? [...images] : [{ src: image, position: imagePosition }];
    return heroImages.filter((item) => item.src);
  }, [image, imagePosition, images]);
  const fallback = pool[0] ?? { src: image, position: imagePosition };
  const selectionKey = `${heroRotationKey}:${title}:${pool.map((item) => item.src).join('|')}`;
  const selected = useSyncExternalStore(
    (onStoreChange) => subscribeHeroImageStore(selectionKey, pool, fallback, onStoreChange),
    () => selectedImages.get(selectionKey) ?? fallback,
    () => fallback
  );

  // Keep local and production stable until the R3F renderer is aligned with the Next runtime.
  return <WebGLFallback image={selected.src} imagePosition={selected.position ?? imagePosition} title={title} />;
}
