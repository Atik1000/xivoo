'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import type { Group } from 'three';

/**
 * Ambient 3D layer behind the hero copy: soft brand-coloured shapes drifting with
 * a gentle mouse parallax. Decorative only — pointer-events pass through and the
 * whole layer is skipped for prefers-reduced-motion.
 */
function Shapes() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const { x, y } = state.pointer;
    group.current.rotation.y += ((x * 0.22 - group.current.rotation.y) * delta) * 2.2;
    group.current.rotation.x += ((-y * 0.14 - group.current.rotation.x) * delta) * 2.2;
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
        <mesh position={[3.1, -1.4, -1.2]} scale={1.9}>
          <sphereGeometry args={[1, 48, 48]} />
          <MeshDistortMaterial color="#FF6A00" roughness={0.35} distort={0.32} speed={1.6} />
        </mesh>
      </Float>
      <Float speed={1.9} rotationIntensity={0.9} floatIntensity={1.4}>
        <mesh position={[-3.4, 1.7, -1.6]} scale={0.85}>
          <torusGeometry args={[1, 0.38, 24, 72]} />
          <MeshDistortMaterial color="#F2F2F0" roughness={0.5} distort={0.18} speed={1.2} />
        </mesh>
      </Float>
      <Float speed={2.3} rotationIntensity={1.2} floatIntensity={1.7}>
        <mesh position={[2.2, 2.1, -2.4]} scale={0.55}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#C9CDD2" roughness={0.3} metalness={0.1} flatShading />
        </mesh>
      </Float>
      <Float speed={1.6} rotationIntensity={0.7} floatIntensity={1.2}>
        <mesh position={[-2.6, -2.0, -2.0]} scale={0.5}>
          <torusKnotGeometry args={[0.8, 0.26, 96, 16]} />
          <meshStandardMaterial color="#16181A" roughness={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEnabled(!mq.matches);
    const onChange = () => setEnabled(!mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Canvas camera={{ position: [0, 0, 6], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} />
        <directionalLight position={[-5, -3, 2]} intensity={0.4} color="#FF6A00" />
        <Shapes />
      </Canvas>
    </div>
  );
}
