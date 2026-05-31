'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type SafeTourImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src: string;
  alt: string;
  fallbackSrcs?: string[];
};

export function SafeTourImage({ src, alt, fallbackSrcs = [], onError, ...props }: SafeTourImageProps) {
  const sources = Array.from(new Set([src, ...fallbackSrcs].filter(Boolean)));
  const fallbackKey = sources.join('|');
  const [fallbackState, setFallbackState] = useState({ key: fallbackKey, index: 0 });
  const sourceIndex = fallbackState.key === fallbackKey ? fallbackState.index : 0;
  const quality = props.quality ?? 100;

  const activeSrc = sources[sourceIndex] || src;
  const shouldBypassOptimizer = props.unoptimized || /upload\.wikimedia\.org/i.test(activeSrc);

  return (
    <Image
      {...props}
      src={activeSrc}
      alt={alt}
      quality={quality}
      unoptimized={shouldBypassOptimizer}
      onError={(event) => {
        onError?.(event);
        setFallbackState((current) => {
          const currentIndex = current.key === fallbackKey ? current.index : 0;
          return {
            key: fallbackKey,
            index: currentIndex < sources.length - 1 ? currentIndex + 1 : currentIndex
          };
        });
      }}
    />
  );
}
