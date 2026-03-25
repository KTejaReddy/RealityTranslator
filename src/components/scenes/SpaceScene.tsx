import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { Particles } from './ScenePrimitives';

function HabitatDome({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#88aacc" transparent opacity={0.4} roughness={0.1} metalness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#334455" roughness={0.8} />
      </mesh>
      <pointLight position={[0, 0.15, 0]} intensity={0.15} color="#aaddff" distance={0.8} />
    </group>
  );
}

function SolarArray({ position, size = 1 }: { position: [number, number, number]; size?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.x = -0.3 + Math.sin(clock.elapsedTime * 0.2) * 0.05;
  });
  return (
    <group position={position} ref={ref}>
      <mesh position={[0, 0.3, 0]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.4 * size, 0.01, 0.25 * size]} />
        <meshStandardMaterial color="#8899aa" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 4]} />
        <meshStandardMaterial color="#666666" metalness={0.9} />
      </mesh>
    </group>
  );
}

function Astronaut({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const radius = useMemo(() => 0.3 + Math.random() * 0.5, []);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.3 + offset;
    ref.current.position.set(
      position[0] + Math.sin(t) * radius,
      position[1],
      position[2] + Math.cos(t * 0.7) * radius
    );
    ref.current.rotation.y = -t;
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.1, 0]}>
        <capsuleGeometry args={[0.025, 0.05, 4, 8]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.16, 0.02]}>
        <boxGeometry args={[0.03, 0.015, 0.005]} />
        <meshStandardMaterial color="#4488cc" roughness={0.1} />
      </mesh>
    </group>
  );
}

export function SpaceScene({ sliders }: { sliders: Record<string, number> }) {
  const oxygen = (sliders.oxygen_gen ?? 60) / 100;
  const food = (sliders.food_prod ?? 40) / 100;
  const energy = (sliders.energy_solar ?? 50) / 100;
  const crew = sliders.crew_size ?? 30;

  const crewCount = Math.min(20, Math.round(crew / 10));
  const domeCount = Math.round(1 + food * 3);
  const solarCount = Math.round(2 + energy * 6);

  const domes = useMemo(() =>
    Array.from({ length: domeCount }, (_, i) => ({
      x: (i - domeCount / 2) * 0.9,
      z: -0.5 + (i % 2) * 0.4,
      s: 0.8 + Math.random() * 0.5,
    })), [domeCount]);

  const solars = useMemo(() =>
    Array.from({ length: solarCount }, (_, i) => ({
      x: -3 + (i % 4) * 0.8,
      z: 2 + Math.floor(i / 4) * 0.6,
    })), [solarCount]);

  return (
    <>
      {/* Mars surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#8B4513" roughness={0.95} />
      </mesh>

      {/* Mars rocks */}
      {useMemo(() => Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 8, 0.05, (Math.random() - 0.5) * 8]}>
          <dodecahedronGeometry args={[0.05 + Math.random() * 0.15, 0]} />
          <meshStandardMaterial color="#6B3410" roughness={0.95} />
        </mesh>
      )), [])}

      {/* Habitat domes */}
      {domes.map((d, i) => (
        <HabitatDome key={i} position={[d.x, 0, d.z]} scale={d.s} />
      ))}

      {/* Solar arrays */}
      {solars.map((s, i) => (
        <SolarArray key={i} position={[s.x, 0, s.z]} size={0.8 + energy * 0.4} />
      ))}

      {/* Crew */}
      {Array.from({ length: crewCount }, (_, i) => (
        <Astronaut key={i} position={[(Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 3]} />
      ))}

      {/* O2 particles */}
      <Particles count={Math.round(oxygen * 40 + 5)} color="#66ccff" speed={0.3} spread={4} yBase={0.3} />

      {/* Dust particles */}
      <Particles count={20} color="#cc8855" speed={0.15} spread={8} yBase={0.1} />

      {/* Distant stars */}
      <Particles count={200} color="#ffffff" speed={0.01} spread={15} />

      {/* Mars sky glow */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial color="#331100" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>

      {/* Stars */}
      <Float speed={0.1} rotationIntensity={0} floatIntensity={0}>
        <Particles count={60} color="#ffffff" speed={0.02} spread={12} yBase={4} />
      </Float>

      <pointLight position={[5, 5, 3]} intensity={0.8} color="#ffddaa" />
      <pointLight position={[-3, 2, -3]} intensity={0.2} color="#ff6633" />
    </>
  );
}
