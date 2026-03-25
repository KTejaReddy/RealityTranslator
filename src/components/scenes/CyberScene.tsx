import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Particles } from './ScenePrimitives';

function ServerRack({ position, active }: { position: [number, number, number]; active: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = active ? 0.15 + Math.sin(clock.elapsedTime * 3 + position[0]) * 0.05 : 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.1]} />
        <meshStandardMaterial color="#1a2030" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* LED indicators */}
      {[0.1, 0.2, 0.3, 0.4].map((y, i) => (
        <mesh key={i} position={[0.06, y, 0.051]}>
          <boxGeometry args={[0.015, 0.008, 0.002]} />
          <meshBasicMaterial color={active ? (i % 2 === 0 ? '#00ff88' : '#00ccff') : '#333333'} />
        </mesh>
      ))}
      <pointLight ref={lightRef} position={[0, 0.3, 0.1]} intensity={0.1} color={active ? '#00ff88' : '#333333'} distance={0.5} />
    </group>
  );
}

function DataStream({ start, end, speed, color }: { start: [number, number, number]; end: [number, number, number]; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.elapsedTime * speed) % 1 + 1) % 1;
    ref.current.position.set(
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
      start[2] + (end[2] - start[2]) * t
    );
    ref.current.scale.setScalar(0.8 + Math.sin(t * Math.PI) * 0.5);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.015, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

function Shield({ position, strength }: { position: [number, number, number]; strength: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = strength * 0.15 + Math.sin(clock.elapsedTime * 2) * 0.03;
    ref.current.rotation.y = clock.elapsedTime * 0.1;
  });

  return (
    <mesh ref={ref} position={position}>
      <dodecahedronGeometry args={[2.5 + strength * 0.5, 1]} />
      <meshBasicMaterial color="#00ccff" transparent opacity={0.1} wireframe side={THREE.DoubleSide} />
    </mesh>
  );
}

export function CyberScene({ sliders }: { sliders: Record<string, number> }) {
  const firewall = (sliders.firewall ?? 60) / 100;
  const encryption = (sliders.encryption ?? 50) / 100;
  const threats = (sliders.threat_vol ?? 45) / 100;
  const staff = (sliders.staff ?? 30) / 100;

  const serverCount = 8;
  const threatParticles = Math.round(threats * 40 + 5);
  const safeParticles = Math.round((firewall + encryption) * 20 + 5);

  const streams = useMemo(() =>
    Array.from({ length: Math.round(12 + staff * 8) }, (_, i) => ({
      start: [(Math.random() - 0.5) * 4, Math.random() * 2, (Math.random() - 0.5) * 4] as [number, number, number],
      end: [(Math.random() - 0.5) * 4, Math.random() * 2, (Math.random() - 0.5) * 4] as [number, number, number],
      speed: 0.3 + Math.random() * 0.8,
      safe: Math.random() > threats * 0.5,
    })), [staff, threats]);

  return (
    <>
      {/* Dark floor with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#050810" roughness={0.9} />
      </mesh>

      {/* Grid lines */}
      {Array.from({ length: 13 }, (_, i) => {
        const pos = -3 + i * 0.5;
        return (
          <group key={i}>
            <mesh position={[pos, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.005, 6]} />
              <meshBasicMaterial color="#0a1a2a" transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, 0.002, pos]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[6, 0.005]} />
              <meshBasicMaterial color="#0a1a2a" transparent opacity={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Server racks */}
      {Array.from({ length: serverCount }, (_, i) => (
        <ServerRack
          key={i}
          position={[(i - serverCount / 2) * 0.3 + 0.15, 0, -1.5]}
          active={Math.random() > threats * 0.3}
        />
      ))}

      {/* Firewall shield */}
      <Shield position={[0, 1, 0]} strength={firewall} />

      {/* Encryption inner shield */}
      {encryption > 0.3 && (
        <Shield position={[0, 1, 0]} strength={encryption * 0.6} />
      )}

      {/* Data streams */}
      {streams.map((s, i) => (
        <DataStream
          key={i}
          start={s.start}
          end={s.end}
          speed={s.speed}
          color={s.safe ? '#00ccff' : '#ff3344'}
        />
      ))}

      {/* Threat particles (red) */}
      <Particles count={threatParticles} color="#ff2244" speed={1.5} spread={6} yBase={1} />

      {/* Safe traffic particles (blue/green) */}
      <Particles count={safeParticles} color="#00ff88" speed={0.8} spread={4} yBase={0.5} />

      {/* Central hub */}
      <mesh position={[0, 0.5, 0]}>
        <octahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial color="#555555" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Alert aura when high threats */}
      {threats > 0.5 && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial color="#ff0022" transparent opacity={threats * 0.06} side={THREE.BackSide} />
        </mesh>
      )}

      <pointLight position={[0, 3, 0]} intensity={0.4} color="#0066ff" />
      <pointLight position={[3, 2, 3]} intensity={0.2} color="#00ff88" />
      <pointLight position={[-3, 2, -3]} intensity={0.15} color="#ff3344" />
    </>
  );
}
