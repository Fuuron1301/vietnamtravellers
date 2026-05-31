export const cinematic3D = {
  camera: { position: [0, 0.45, 5.5] as [number, number, number], fov: 38 },
  drift: { x: 0.18, y: 0.1, scroll: 0.0008 },
  lights: { ambient: '#F8F5EF', gold: '#C8A96A', ocean: '#0B1B2B' },
  performance: { dpr: [1, 1.5] as [number, number], frameloop: 'always' as const }
};
