'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshReflectorMaterial, Sparkles } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { cinematic3D } from '@/lib/cinematic-motion';
import { colors } from '@/lib/design-tokens';

type MeshRef = THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;

function CameraRig() {
  const { camera, pointer } = useThree();
  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * cinematic3D.drift.x, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.45 + pointer.y * cinematic3D.drift.y + Math.sin(elapsed * 0.22) * 0.04, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.5 + Math.sin(elapsed * 0.16) * 0.16, 0.02);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Island({ position, scale }: { position: [number, number, number]; scale: [number, number, number] }) {
  const mesh = useRef<MeshRef>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18 + position[0]) * 0.04;
  });
  return (
    <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.16}>
      <mesh ref={mesh} position={position} scale={scale}>
        <coneGeometry args={[0.52, 1.6, 7]} />
        <meshStandardMaterial color={colors.navy} roughness={0.78} metalness={0.08} />
      </mesh>
      <mesh position={[position[0], position[1] + 0.55, position[2]]} scale={[scale[0] * 1.15, scale[1] * 0.18, scale[2] * 1.15]}>
        <sphereGeometry args={[0.42, 16, 8]} />
        <meshStandardMaterial color={colors.gold} roughness={0.7} metalness={0.04} />
      </mesh>
    </Float>
  );
}

function Water() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.08, 0]}>
      <planeGeometry args={[18, 18, 64, 64]} />
      <MeshReflectorMaterial color={colors.navy} mirror={0.28} blur={[400, 80]} mixBlur={1} roughness={0.42} metalness={0.16} />
    </mesh>
  );
}

function SceneObjects() {
  const islands = useMemo(() => [
    { position: [-2.2, -0.16, -1.4], scale: [0.9, 1.1, 0.9] },
    { position: [-0.7, -0.1, -2.2], scale: [0.75, 1, 0.75] },
    { position: [1.2, -0.08, -1.6], scale: [0.85, 1.16, 0.85] },
    { position: [2.7, -0.2, -2.8], scale: [0.62, 0.86, 0.62] }
  ], []);
  return (
    <>
      <ambientLight color={cinematic3D.lights.ambient} intensity={0.64} />
      <directionalLight color={cinematic3D.lights.gold} intensity={2.1} position={[2.8, 3.6, 2.4]} />
      <pointLight color={cinematic3D.lights.gold} intensity={3.8} position={[-2.6, 1.8, 2.8]} distance={8} />
      <Sparkles count={38} color={colors.gold} size={1.2} speed={0.12} opacity={0.34} scale={[7, 2, 4]} position={[0, 1.2, -1]} />
      {islands.map((island) => <Island key={island.position.join('-')} position={island.position as [number, number, number]} scale={island.scale as [number, number, number]} />)}
      <Water />
      <mesh position={[0, -0.72, 1.15]} rotation={[0, 0.12, 0]} scale={[0.7, 0.08, 0.18]}>
        <boxGeometry />
        <meshStandardMaterial color={colors.gold} roughness={0.38} metalness={0.18} />
      </mesh>
    </>
  );
}

export default function CinematicHeroScene() {
  return (
    <Canvas camera={cinematic3D.camera} dpr={cinematic3D.performance.dpr} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={[cinematic3D.lights.ocean]} />
      <fog attach="fog" args={[cinematic3D.lights.ocean, 4.8, 11]} />
      <Suspense fallback={null}>
        <SceneObjects />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}

