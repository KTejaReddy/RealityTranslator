import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ground, Particles } from './ScenePrimitives';

function WindTurbine({ position, spinning }: { position: [number, number, number]; spinning: number }) {
  const bladeRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (bladeRef.current) bladeRef.current.rotation.z = clock.elapsedTime * spinning * 2;
  });

  return (
    <group position={position}>
      {/* Tower */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.03, 1, 6]} />
        <meshStandardMaterial color="#cccccc" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Hub + Blades */}
      <group ref={bladeRef} position={[0, 1, 0.02]}>
        <mesh>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#dddddd" metalness={0.8} />
        </mesh>
        {[0, 2.094, 4.189].map((angle, i) => (
          <mesh key={i} position={[Math.sin(angle) * 0.2, Math.cos(angle) * 0.2, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.02, 0.38, 0.005]} />
            <meshStandardMaterial color="#eeeeee" roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SolarPanel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.2, 0.01, 0.15]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.08, 4]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
    </group>
  );
}

function PowerPlant({ position, type }: { position: [number, number, number]; type: 'fossil' | 'nuclear' }) {
  const smokeRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (smokeRef.current) {
      smokeRef.current.position.y = 0.5 + Math.sin(clock.elapsedTime) * 0.05;
      (smokeRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Building */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.25]} />
        <meshStandardMaterial color={type === 'fossil' ? '#4a3a2a' : '#3a4a5a'} roughness={0.7} />
      </mesh>
      {/* Chimney/Cooling tower */}
      <mesh position={[0.05, 0.35, 0]}>
        <cylinderGeometry args={type === 'nuclear' ? [0.08, 0.06, 0.3, 8] : [0.03, 0.03, 0.4, 6]} />
        <meshStandardMaterial color={type === 'nuclear' ? '#667788' : '#555555'} roughness={0.5} />
      </mesh>
      {/* Smoke */}
      {type === 'fossil' && (
        <mesh ref={smokeRef} position={[0.05, 0.55, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#888888" transparent opacity={0.15} />
        </mesh>
      )}
      {type === 'nuclear' && (
        <pointLight position={[0, 0.2, 0]} intensity={0.2} color="#44aaff" distance={0.8} />
      )}
    </group>
  );
}

function House({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.1, 0.12, 0.1]} />
        <meshStandardMaterial color="#6a5a4a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.09, 0.06, 4]} />
        <meshStandardMaterial color="#8a4a2a" roughness={0.9} />
      </mesh>
      <pointLight position={[0, 0.05, 0.05]} intensity={0.05} color="#ffcc88" distance={0.3} />
    </group>
  );
}

export function EnergyScene({ sliders }: { sliders: Record<string, number> }) {
  const solar = (sliders.solar ?? 20) / 100;
  const wind = (sliders.wind ?? 15) / 100;
  const nuclear = (sliders.nuclear ?? 10) / 100;
  const fossil = (sliders.fossil ?? 55) / 100;

  const solarCount = Math.round(solar * 20 + 1);
  const windCount = Math.round(wind * 8 + 1);

  const solarPositions = useMemo(() =>
    Array.from({ length: solarCount }, (_, i) => ({
      x: -3 + (i % 5) * 0.35,
      z: 1 + Math.floor(i / 5) * 0.3,
    })), [solarCount]);

  const windPositions = useMemo(() =>
    Array.from({ length: windCount }, (_, i) => ({
      x: 1.5 + (i % 4) * 0.6,
      z: -2 + Math.floor(i / 4) * 0.8,
    })), [windCount]);

  const houses = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      x: (Math.random() - 0.5) * 3,
      z: -1 + Math.random() * 2,
    })), []);

  // Power lines
  const gridIntensity = solar + wind + nuclear + fossil;

  return (
    <>
      <Ground color="#1a2418" size={12} />

      {/* Solar farm */}
      {solarPositions.map((p, i) => (
        <SolarPanel key={`solar${i}`} position={[p.x, 0, p.z]} />
      ))}

      {/* Wind farm */}
      {windPositions.map((p, i) => (
        <WindTurbine key={`wind${i}`} position={[p.x, 0, p.z]} spinning={wind} />
      ))}

      {/* Fossil fuel plant */}
      {fossil > 0.1 && <PowerPlant position={[-2.5, 0, -2]} type="fossil" />}
      {fossil > 0.4 && <PowerPlant position={[-1.8, 0, -2.3]} type="fossil" />}

      {/* Nuclear */}
      {nuclear > 0.1 && <PowerPlant position={[3, 0, 1.5]} type="nuclear" />}

      {/* Houses */}
      {houses.map((h, i) => (
        <House key={`house${i}`} position={[h.x, 0, h.z]} />
      ))}

      {/* Power grid lines */}
      <Particles count={Math.round(gridIntensity * 15 + 5)} color="#ffee44" speed={1.5} spread={5} yBase={0.3} />

      {/* Emissions from fossil */}
      <Particles count={Math.round(fossil * 30 + 2)} color="#665544" speed={0.4} spread={3} yBase={0.5} />
    </>
  );
}
