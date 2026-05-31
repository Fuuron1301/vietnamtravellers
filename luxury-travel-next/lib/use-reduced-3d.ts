'use client';

import { useEffect, useState } from 'react';

function shouldReduce3D() {
  if (typeof window === 'undefined') return true;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const lowMemory = 'deviceMemory' in navigator && Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory) <= 4;
  return motionQuery.matches || coarsePointer || lowMemory;
}

export function useReduced3D() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(shouldReduce3D());
    onChange();
    motionQuery.addEventListener('change', onChange);
    return () => motionQuery.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export function canUseWebGL() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}
