import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ground, Particles, Tree } from './ScenePrimitives';

function Crop({ position, height, healthy }: { position: [number, number, number]; height: number; healthy: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + offset) * 0.05;
  });

  const color = healthy ? '#44aa22' : '#aa8833';

  return (
    <group ref={ref} position={position}>
      {/* Stem */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.005, 0.008, height, 4]} />
        <meshStandardMaterial color="#558833" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, height, 0]}>
        <sphereGeometry args={[0.02 + height * 0.02, 6, 6]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Tractor({ position, speed }: { position: [number, number, number]; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed * 0.3;
    ref.current.position.x = position[0] + Math.sin(t) * 2;
    ref.current.position.z = position[2] + Math.cos(t * 0.5) * 2;
    ref.current.rotation.y = -t;
  });

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.18]} />
        <meshStandardMaterial color="#cc4422" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, -0.05]}>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial color="#aa3318" roughness={0.5} />
      </mesh>
      {/* Wheels */}
      {[[-0.06, 0.03, 0.06], [0.06, 0.03, 0.06], [-0.06, 0.03, -0.06], [0.06, 0.03, -0.06]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
          <meshStandardMaterial color="#333333" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function WaterSprinkler({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 2;
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.3, 4]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
      {active && (
        <group ref={ref} position={[0, 0.3, 0]}>
          {[0, 1, 2, 3].map(i => (
            <mesh key={i} position={[Math.cos(i * 1.57) * 0.1, 0, Math.sin(i * 1.57) * 0.1]} rotation={[0.5, i * 1.57, 0]}>
              <coneGeometry args={[0.02, 0.15, 4]} />
              <meshBasicMaterial color="#4488cc" transparent opacity={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export function AgricultureScene({ sliders }: { sliders: Record<string, number> }) {
  const irrigation = (sliders.irrigation ?? 50) / 100;
  const fertilizer = (sliders.fertilizer ?? 40) / 100;
  const organic = (sliders.organic ?? 15) / 100;
  const techAg = (sliders.tech_ag ?? 20) / 100;

  const cropHeight = 0.1 + (irrigation * 0.3 + fertilizer * 0.3 + techAg * 0.2);
  const soilHealth = Math.max(0.2, 0.6 + organic * 0.4 - fertilizer * 0.3 + techAg * 0.1);
  const cropHealthy = soilHealth > 0.5;

  const crops = useMemo(() => {
    const c: { x: number; z: number }[] = [];
    for (let x = -3; x <= 3; x += 0.25) {
      for (let z = -2; z <= 2; z += 0.25) {
        if (Math.random() < 0.7) {
          c.push({ x: x + (Math.random() - 0.5) * 0.1, z: z + (Math.random() - 0.5) * 0.1 });
        }
      }
    }
    return c;
  }, []);

  const soilColor = useMemo(() =>
    new THREE.Color().lerpColors(new THREE.Color('#4a3520'), new THREE.Color('#2a4a20'), soilHealth).getStyle(), [soilHealth]);

  return (
    <>
      <Ground color={soilColor} size={12} />

      {/* Field rows visual */}
      {[-3, -1.5, 0, 1.5, 3].map(z => (
        <mesh key={z} position={[0, 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7, 0.08]} />
          <meshStandardMaterial color="#3a2a15" roughness={0.95} />
        </mesh>
      ))}

      {/* Crops */}
      {crops.map((c, i) => (
        <Crop key={i} position={[c.x, 0, c.z]} height={cropHeight + Math.random() * 0.05} healthy={cropHealthy} />
      ))}

      {/* Sprinklers */}
      {irrigation > 0.2 && [-2, 0, 2].map(x =>
        [-1, 1].map(z => (
          <WaterSprinkler key={`spr${x}${z}`} position={[x, 0, z]} active={irrigation > 0.3} />
        ))
      )}

      {/* Tractor */}
      {techAg > 0.15 && <Tractor position={[0, 0, 0]} speed={techAg} />}

      {/* Barn */}
      <group position={[3.5, 0, -2.5]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.5, 0.4, 0.6]} />
          <meshStandardMaterial color="#8a3a1a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.4, 0.2, 4]} />
          <meshStandardMaterial color="#6a2a10" roughness={0.9} />
        </mesh>
      </group>

      {/* Surrounding trees */}
      {organic > 0.2 && [
        [-4, 3], [-3.5, 3.5], [4, 3], [4.5, -3], [-4, -3],
      ].map(([x, z], i) => (
        <Tree key={`tree${i}`} position={[x, 0, z]} scale={0.8 + Math.random() * 0.5} />
      ))}

      {/* Water/irrigation particles */}
      <Particles count={Math.round(irrigation * 20 + 3)} color="#4488cc" speed={0.5} spread={5} yBase={0.2} />

      {/* Fertilizer particles */}
      {fertilizer > 0.3 && (
        <Particles count={Math.round(fertilizer * 10)} color="#aaaa44" speed={0.2} spread={4} yBase={0.05} />
      )}

      {/* Sun light */}
      <pointLight position={[3, 4, 2]} intensity={0.6} color="#ffdd88" />
    </>
  );
}
