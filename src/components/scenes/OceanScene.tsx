import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Water, Particles } from './ScenePrimitives';

function Fish({ speed, radius, yPos, color }: { speed: number; radius: number; yPos: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + offset;
    ref.current.position.set(Math.cos(t) * radius, yPos + Math.sin(t * 1.5) * 0.1, Math.sin(t) * radius);
    ref.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group ref={ref}>
      <mesh>
        <coneGeometry args={[0.03, 0.12, 4]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, -0.07]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.04, 0.04, 0.01]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Coral({ position, health, scale = 1 }: { position: [number, number, number]; health: number; scale?: number }) {
  const color = useMemo(() =>
    new THREE.Color().lerpColors(new THREE.Color('#888888'), new THREE.Color('#ff6688'), health), [health]);

  return (
    <group position={position} scale={scale}>
      {[0, 0.8, 1.6, 2.4].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.06, 0.08 + i * 0.02, Math.sin(angle) * 0.06]} rotation={[0.2, angle, 0]}>
          <cylinderGeometry args={[0.01, 0.03, 0.15 + i * 0.03, 5]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export function OceanScene({ sliders }: { sliders: Record<string, number> }) {
  const fishing = (sliders.fishing ?? 50) / 100;
  const plastic = (sliders.plastic ?? 60) / 100;
  const temp = (sliders.temperature ?? 35) / 100;
  const protection = (sliders.protection ?? 10) / 100;

  const fishCount = Math.round((1 - fishing * 0.6) * 20 + 3);
  const coralHealth = Math.max(0.1, 1 - temp * 0.4 - plastic * 0.3 + protection * 0.3);
  const waterColor = useMemo(() =>
    new THREE.Color().lerpColors(new THREE.Color('#0055aa'), new THREE.Color('#336655'), temp).getStyle(), [temp]);

  const corals = useMemo(() =>
    Array.from({ length: Math.round(coralHealth * 15 + 2) }, () => ({
      x: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 5,
      s: 0.5 + Math.random() * 1.5,
    })), [coralHealth]);

  const fishColors = ['#ff8844', '#44aaff', '#ffcc33', '#44ff88', '#ff44aa', '#aaaaff'];

  // Seabed rocks
  const rocks = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      x: (Math.random() - 0.5) * 6,
      z: (Math.random() - 0.5) * 6,
      s: 0.1 + Math.random() * 0.3,
    })), []);

  return (
    <>
      {/* Water surface */}
      <Water size={12} opacity={0.4} color={waterColor} />

      {/* Seabed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.95} />
      </mesh>

      {/* Rocks */}
      {rocks.map((r, i) => (
        <mesh key={`rock${i}`} position={[r.x, -1.9, r.z]}>
          <dodecahedronGeometry args={[r.s, 0]} />
          <meshStandardMaterial color="#3a4a5a" roughness={0.9} />
        </mesh>
      ))}

      {/* Corals */}
      {corals.map((c, i) => (
        <Coral key={`coral${i}`} position={[c.x, -1.85, c.z]} health={coralHealth} scale={c.s} />
      ))}

      {/* Fish */}
      {Array.from({ length: fishCount }, (_, i) => (
        <Fish key={`fish${i}`} speed={0.3 + Math.random() * 0.5} radius={0.5 + Math.random() * 2} yPos={-0.5 - Math.random() * 1} color={fishColors[i % fishColors.length]} />
      ))}

      {/* Plastic particles */}
      <Particles count={Math.round(plastic * 40 + 2)} color="#ccccaa" speed={0.2} spread={6} yBase={-0.5} />

      {/* Bubbles */}
      <Particles count={Math.round((1 - plastic * 0.5) * 15 + 3)} color="#88ccff" speed={0.6} spread={4} yBase={-1} />

      {/* Marine reserve boundary (green ring) */}
      {protection > 0.2 && (
        <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 2.6, 32]} />
          <meshBasicMaterial color="#22ff88" transparent opacity={protection * 0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Underwater light rays */}
      <pointLight position={[0, 3, 0]} intensity={0.6} color="#4488cc" />
      <pointLight position={[2, -1, 2]} intensity={0.3} color="#22aa88" />
    </>
  );
}
