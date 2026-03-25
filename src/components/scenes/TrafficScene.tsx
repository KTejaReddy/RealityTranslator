import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ground, Building } from './ScenePrimitives';

function Car({ path, speed, color }: { path: [number, number, number][]; speed: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random(), []);

  useFrame(({ clock }) => {
    if (!ref.current || path.length < 2) return;
    const t = ((clock.elapsedTime * speed + offset * 10) % 1 + 1) % 1;
    const idx = t * (path.length - 1);
    const i = Math.floor(idx);
    const f = idx - i;
    const a = path[i];
    const b = path[Math.min(i + 1, path.length - 1)];
    ref.current.position.set(
      a[0] + (b[0] - a[0]) * f,
      a[1] + (b[1] - a[1]) * f + 0.04,
      a[2] + (b[2] - a[2]) * f
    );
    // Look at direction
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    if (dx !== 0 || dz !== 0) ref.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.08, 0.04, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.03, -0.01]}>
        <boxGeometry args={[0.06, 0.03, 0.07]} />
        <meshStandardMaterial color="#1a2a3a" roughness={0.1} metalness={0.9} transparent opacity={0.7} />
      </mesh>
      {/* Headlights */}
      <mesh position={[0.025, 0, 0.07]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshBasicMaterial color="#ffee88" />
      </mesh>
      <mesh position={[-0.025, 0, 0.07]}>
        <sphereGeometry args={[0.008, 6, 6]} />
        <meshBasicMaterial color="#ffee88" />
      </mesh>
    </group>
  );
}

function Bus({ path, speed }: { path: [number, number, number][]; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random(), []);

  useFrame(({ clock }) => {
    if (!ref.current || path.length < 2) return;
    const t = ((clock.elapsedTime * speed * 0.6 + offset * 10) % 1 + 1) % 1;
    const idx = t * (path.length - 1);
    const i = Math.floor(idx);
    const f = idx - i;
    const a = path[i];
    const b = path[Math.min(i + 1, path.length - 1)];
    ref.current.position.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + 0.05, a[2] + (b[2] - a[2]) * f);
    const dx = b[0] - a[0], dz = b[2] - a[2];
    if (dx !== 0 || dz !== 0) ref.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.1, 0.07, 0.25]} />
        <meshStandardMaterial color="#22aa55" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.2]} />
        <meshStandardMaterial color="#aaddcc" roughness={0.1} metalness={0.6} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export function TrafficScene({ sliders }: { sliders: Record<string, number> }) {
  const cars = sliders.cars ?? 70;
  const publicT = sliders.public ?? 30;
  const bikes = sliders.bikes ?? 15;
  const congestion = cars / 100;
  const carCount = Math.round(cars * 0.4 + 3);
  const busCount = Math.round(publicT * 0.08 + 1);

  // Road network
  const roads = useMemo(() => {
    const r: { pos: [number, number, number]; rot: number; len: number }[] = [];
    for (let i = -2; i <= 2; i++) {
      r.push({ pos: [i * 1.2, 0, 0], rot: 0, len: 6 });
      r.push({ pos: [0, 0, i * 1.2], rot: Math.PI / 2, len: 6 });
    }
    return r;
  }, []);

  // Generate car paths along roads
  const carPaths = useMemo(() => {
    const paths: [number, number, number][][] = [];
    for (let i = 0; i < carCount; i++) {
      const horizontal = Math.random() > 0.5;
      const lane = (Math.floor(Math.random() * 5) - 2) * 1.2;
      const laneOffset = (Math.random() - 0.5) * 0.15;
      if (horizontal) {
        paths.push([[-3, 0, lane + laneOffset], [3, 0, lane + laneOffset]]);
      } else {
        paths.push([[lane + laneOffset, 0, -3], [lane + laneOffset, 0, 3]]);
      }
    }
    return paths;
  }, [carCount]);

  const busPaths = useMemo(() => {
    const paths: [number, number, number][][] = [];
    for (let i = 0; i < busCount; i++) {
      const lane = (Math.floor(Math.random() * 3) - 1) * 1.2;
      paths.push([[-3, 0, lane], [3, 0, lane]]);
    }
    return paths;
  }, [busCount]);

  const buildings = useMemo(() => {
    const b: { x: number; z: number; h: number; w: number }[] = [];
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (Math.random() > 0.4) {
          b.push({ x: x * 1.2 + (Math.random() - 0.5) * 0.4, z: z * 1.2 + (Math.random() - 0.5) * 0.4, h: 0.3 + Math.random() * 0.8, w: 0.15 + Math.random() * 0.2 });
        }
      }
    }
    return b;
  }, []);

  const carColors = ['#cc3333', '#3366cc', '#cccc33', '#33cccc', '#cc6633', '#9933cc', '#ffffff', '#333333'];

  // Bike lanes (green strips)
  const bikeLaneOpacity = bikes / 100;

  return (
    <>
      <Ground color="#3d4d38" size={12} />
      {/* Roads */}
      {roads.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={[-Math.PI / 2, r.rot, 0]}>
          <planeGeometry args={[0.35, r.len]} />
          <meshStandardMaterial color="#222222" roughness={0.9} />
        </mesh>
      ))}
      {/* Road markings */}
      {roads.map((r, i) => (
        <mesh key={`m${i}`} position={[r.pos[0], 0.002, r.pos[2]]} rotation={[-Math.PI / 2, r.rot, 0]}>
          <planeGeometry args={[0.02, r.len]} />
          <meshBasicMaterial color="#555555" />
        </mesh>
      ))}
      {/* Bike lanes */}
      {bikeLaneOpacity > 0.05 && roads.slice(0, 3).map((r, i) => (
        <mesh key={`b${i}`} position={[r.pos[0] + 0.2, 0.003, r.pos[2]]} rotation={[-Math.PI / 2, r.rot, 0]}>
          <planeGeometry args={[0.06, r.len]} />
          <meshBasicMaterial color="#22aa55" transparent opacity={bikeLaneOpacity * 0.6} />
        </mesh>
      ))}
      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building key={i} position={[b.x, 0, b.z]} height={b.h} width={b.w} color="#888888" />
      ))}
      {/* Cars */}
      {carPaths.map((path, i) => (
        <Car key={`car${i}`} path={path} speed={0.08 + (1 - congestion) * 0.15} color={carColors[i % carColors.length]} />
      ))}
      {/* Buses */}
      {busPaths.map((path, i) => (
        <Bus key={`bus${i}`} path={path} speed={0.06 + (1 - congestion) * 0.08} />
      ))}
      {/* Smog */}
      <Smog intensity={congestion} />
    </>
  );
}

function Smog({ intensity }: { intensity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = intensity * 0.15 + Math.sin(clock.elapsedTime * 0.3) * 0.02;
  });
  return (
    <mesh ref={ref} position={[0, 1.5, 0]}>
      <sphereGeometry args={[4, 16, 16]} />
      <meshBasicMaterial color="#444444" transparent opacity={0.1} side={THREE.BackSide} />
    </mesh>
  );
}
