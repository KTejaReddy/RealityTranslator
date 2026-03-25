import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ground, Particles } from './ScenePrimitives';

function StockTicker({ position, value, positive }: { position: [number, number, number]; value: number; positive: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const target = value * 0.03;
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, Math.max(0.1, target), 0.05);
    ref.current.position.y = ref.current.scale.y * 0.5;
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.12, 1, 0.12]} />
      <meshStandardMaterial
        color={positive ? '#22cc66' : '#cc3344'}
        roughness={0.2}
        metalness={0.7}
      />
    </mesh>
  );
}

function CurrencyOrb({ position, size, color }: { position: [number, number, number]; size: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime + offset) * 0.15;
    ref.current.rotation.y = clock.elapsedTime * 0.5;
  });

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[size, size * 0.3, 8, 16]} />
      <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} />
    </mesh>
  );
}

export function EconomyScene({ sliders }: { sliders: Record<string, number> }) {
  const interest = (sliders.interest ?? 5) / 20;
  const trade = (sliders.trade ?? 60) / 100;
  const spending = (sliders.spending ?? 35) / 100;
  const tech = (sliders.tech ?? 25) / 100;

  const gdpGrowth = 3 - interest * 4 + trade * 3 + tech * 4 + spending * 1;
  const inflation = 5 - interest * 6 + spending * 5 + trade * 1;
  const employment = 85 - interest * 10 + trade * 10 + tech * 8 + spending * 5;

  const bars = useMemo(() => [
    { x: -2.5, label: 'GDP', value: Math.max(5, gdpGrowth * 15 + 30), positive: gdpGrowth > 0 },
    { x: -1.5, label: 'Jobs', value: Math.max(5, employment - 60), positive: employment > 85 },
    { x: -0.5, label: 'Trade', value: trade * 50 + 10, positive: true },
    { x: 0.5, label: 'Tech', value: tech * 50 + 5, positive: true },
    { x: 1.5, label: 'Spend', value: spending * 40 + 5, positive: spending < 0.6 },
    { x: 2.5, label: 'Debt', value: spending * 30 + 10, positive: false },
  ], [gdpGrowth, employment, trade, tech, spending]);

  // Office buildings
  const offices = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      x: -2.5 + i * 1,
      z: 2 + Math.random() * 1,
      h: 0.3 + Math.random() * 0.5 + tech * 0.5,
      w: 0.2 + Math.random() * 0.15,
    })), [tech]);

  return (
    <>
      <Ground color="#0a0e18" size={12} />

      {/* Trading floor - grid */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 3]} />
        <meshStandardMaterial color="#0e1220" roughness={0.8} />
      </mesh>

      {/* Stock bars */}
      {bars.map((bar, i) => (
        <StockTicker key={i} position={[bar.x, 0, 0]} value={bar.value} positive={bar.positive} />
      ))}

      {/* Currency orbs */}
      <CurrencyOrb position={[-1.5, 1.5, -1.5]} size={0.12 + trade * 0.08} color="#ffcc00" />
      <CurrencyOrb position={[1.5, 1.2, -1]} size={0.08 + tech * 0.06} color="#00ccff" />

      {/* Office skyline */}
      {offices.map((o, i) => (
        <mesh key={`off${i}`} position={[o.x, o.h / 2, o.z]}>
          <boxGeometry args={[o.w, o.h, o.w]} />
          <meshStandardMaterial color="#2a3a5a" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}

      {/* Data flow particles */}
      <Particles count={Math.round(trade * 30 + tech * 20 + 10)} color="#00e5ff" speed={1.2} spread={5} yBase={0.5} />

      {/* Inflation heat */}
      {inflation > 3 && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[4, 16, 16]} />
          <meshBasicMaterial color="#ff4400" transparent opacity={Math.min(0.12, (inflation - 3) * 0.02)} side={THREE.BackSide} />
        </mesh>
      )}
    </>
  );
}
