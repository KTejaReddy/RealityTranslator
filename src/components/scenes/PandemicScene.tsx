import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ground } from './ScenePrimitives';

function Person({ position, infected, vaccinated }: { position: [number, number, number]; infected: boolean; vaccinated: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const speed = useMemo(() => 0.3 + Math.random() * 0.5, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const radius = useMemo(() => 0.2 + Math.random() * 0.4, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + offset;
    ref.current.position.set(
      position[0] + Math.sin(t) * radius,
      position[1],
      position[2] + Math.cos(t * 0.7) * radius
    );
  });

  const color = infected ? '#ff4444' : vaccinated ? '#44cc88' : '#4488cc';

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh position={[0, 0.08, 0]}>
        <capsuleGeometry args={[0.02, 0.06, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Infection aura */}
      {infected && (
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
}

function HospitalBuilding({ position, load }: { position: [number, number, number]; load: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.4]} />
        <meshStandardMaterial color="#dddddd" roughness={0.5} />
      </mesh>
      {/* Red cross */}
      <mesh position={[0, 0.25, 0.21]}>
        <boxGeometry args={[0.08, 0.15, 0.005]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>
      <mesh position={[0, 0.25, 0.21]}>
        <boxGeometry args={[0.15, 0.08, 0.005]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>
      {/* Load indicator */}
      <pointLight position={[0, 0.4, 0]} intensity={load * 0.5} color={load > 0.7 ? '#ff3333' : '#44cc88'} distance={1.5} />
    </group>
  );
}

export function PandemicScene({ sliders }: { sliders: Record<string, number> }) {
  const vaccination = (sliders.vaccination ?? 40) / 100;
  const lockdown = (sliders.lockdown ?? 20) / 100;
  const testing = (sliders.testing ?? 30) / 100;
  const densityP = (sliders.density_p ?? 60) / 100;

  const infectionRate = Math.max(0.05, densityP * 0.6 - vaccination * 0.4 - lockdown * 0.25 - testing * 0.1 + 0.2);
  const hospitalLoad = Math.max(0.1, densityP * 0.5 - vaccination * 0.35 - lockdown * 0.2 + 0.15);
  const totalPeople = Math.round(densityP * 60 + 15);

  const people = useMemo(() =>
    Array.from({ length: totalPeople }, (_, i) => {
      const isVaxxed = Math.random() < vaccination;
      const isInfected = !isVaxxed && Math.random() < infectionRate;
      return {
        x: (Math.random() - 0.5) * (lockdown > 0.5 ? 4 : 7),
        z: (Math.random() - 0.5) * (lockdown > 0.5 ? 4 : 7),
        infected: isInfected,
        vaccinated: isVaxxed,
        key: i,
      };
    }), [totalPeople, vaccination, infectionRate, lockdown]);

  // City blocks
  const blocks = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      x: (Math.random() - 0.5) * 6,
      z: (Math.random() - 0.5) * 6,
      h: 0.15 + Math.random() * 0.3,
      w: 0.15 + Math.random() * 0.2,
    })), []);

  return (
    <>
      <Ground color="#1a1e28" size={12} />

      {/* City buildings */}
      {blocks.map((b, i) => (
        <mesh key={`block${i}`} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial
            color={lockdown > 0.5 ? '#2a2a3a' : '#5a5a6a'}
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* People */}
      {people.map(p => (
        <Person key={p.key} position={[p.x, 0, p.z]} infected={p.infected} vaccinated={p.vaccinated} />
      ))}

      {/* Hospital */}
      <HospitalBuilding position={[3, 0, 3]} load={hospitalLoad} />

      {/* Lockdown barrier */}
      {lockdown > 0.3 && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[lockdown > 0.5 ? 2 : 3.5, lockdown > 0.5 ? 2.1 : 3.6, 32]} />
          <meshBasicMaterial color="#ff8800" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Virus particles */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color={infectionRate > 0.4 ? '#ff2222' : '#223344'} transparent opacity={infectionRate * 0.08} side={THREE.BackSide} />
      </mesh>
    </>
  );
}
