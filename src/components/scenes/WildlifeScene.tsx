import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Tree, Particles, Ground } from './ScenePrimitives';

function Animal({ position, color, size = 0.05 }: { position: [number, number, number]; color: string; size?: number }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const radius = useMemo(() => 0.5 + Math.random() * 1.5, []);
  const speed = useMemo(() => 0.15 + Math.random() * 0.3, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + offset;
    ref.current.position.set(
      position[0] + Math.sin(t) * radius,
      position[1],
      position[2] + Math.cos(t * 0.6) * radius
    );
    ref.current.rotation.y = -t + Math.PI / 2;
  });

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, size * 1.5, 0]}>
        <capsuleGeometry args={[size, size * 1.5, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, size * 2.5, size * 0.8]}>
        <sphereGeometry args={[size * 0.7, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Legs */}
      {[[-size * 0.5, 0, size * 0.4], [size * 0.5, 0, size * 0.4], [-size * 0.5, 0, -size * 0.4], [size * 0.5, 0, -size * 0.4]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[size * 0.15, size * 0.15, size * 1.5, 4]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Bird({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const wingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.5 + offset;
    ref.current.position.set(
      position[0] + Math.sin(t) * 3,
      position[1] + Math.sin(t * 2) * 0.3,
      position[2] + Math.cos(t) * 3
    );
    ref.current.rotation.y = -t + Math.PI / 2;
    if (wingRef.current) wingRef.current.rotation.z = Math.sin(clock.elapsedTime * 8 + offset) * 0.4;
  });

  return (
    <group ref={ref}>
      <mesh>
        <coneGeometry args={[0.015, 0.06, 4]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      <mesh ref={wingRef} position={[0.03, 0, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.05, 0.003, 0.02]} />
        <meshStandardMaterial color="#444444" roughness={0.5} />
      </mesh>
    </group>
  );
}

function WaterHole({ position, size }: { position: [number, number, number]; size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.5 + Math.sin(clock.elapsedTime * 0.5) * 0.05;
    }
  });
  return (
    <mesh ref={ref} position={[position[0], 0.005, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 24]} />
      <meshStandardMaterial color="#2266aa" transparent opacity={0.5} roughness={0.1} metalness={0.7} />
    </mesh>
  );
}

export function WildlifeScene({ sliders }: { sliders: Record<string, number> }) {
  const habitat = (sliders.habitat ?? 60) / 100;
  const poaching = (sliders.poaching ?? 30) / 100;
  const tourism = (sliders.tourism ?? 25) / 100;
  const rangers = (sliders.rangers ?? 20) / 100;

  const animalCount = Math.round(Math.max(3, habitat * 15 - poaching * 8 + rangers * 5));
  const treeCount = Math.round(habitat * 30 + 5);
  const birdCount = Math.round(Math.max(2, habitat * 8 - poaching * 3));

  const animalColors = ['#cc8833', '#886633', '#aa6633', '#665533', '#997744', '#bbaa55'];

  const trees = useMemo(() =>
    Array.from({ length: treeCount }, () => ({
      x: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 8,
      s: 0.6 + Math.random() * 1.2,
    })), [treeCount]);

  const groundColor = useMemo(() =>
    new THREE.Color().lerpColors(new THREE.Color('#3a2a15'), new THREE.Color('#2a5a20'), habitat).getStyle(), [habitat]);

  return (
    <>
      <Ground color={groundColor} size={12} />

      {/* Water holes */}
      <WaterHole position={[2, 0, -1]} size={0.6 + habitat * 0.3} />
      {habitat > 0.5 && <WaterHole position={[-2.5, 0, 2]} size={0.4} />}

      {/* Trees / vegetation */}
      {trees.map((t, i) => (
        <Tree key={i} position={[t.x, 0, t.z]} scale={t.s} />
      ))}

      {/* Tall grass patches */}
      {Array.from({ length: Math.round(habitat * 20) }, (_, i) => (
        <mesh key={`grass${i}`} position={[(Math.random() - 0.5) * 7, 0.03, (Math.random() - 0.5) * 7]}>
          <coneGeometry args={[0.04, 0.08, 3]} />
          <meshStandardMaterial color="#5a8a30" roughness={0.9} />
        </mesh>
      ))}

      {/* Animals */}
      {Array.from({ length: animalCount }, (_, i) => (
        <Animal key={i} position={[(Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5]} color={animalColors[i % animalColors.length]} size={0.04 + Math.random() * 0.04} />
      ))}

      {/* Birds */}
      {Array.from({ length: birdCount }, (_, i) => (
        <Bird key={i} position={[(Math.random() - 0.5) * 4, 1.5 + Math.random() * 1, (Math.random() - 0.5) * 4]} />
      ))}

      {/* Ranger stations */}
      {rangers > 0.3 && (
        <group position={[-3.5, 0, -3]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.3]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
          </mesh>
          <pointLight position={[0, 0.3, 0]} intensity={0.2} color="#ffcc44" distance={1} />
        </group>
      )}

      {/* Tourism vehicles */}
      {tourism > 0.3 && (
        <mesh position={[3, 0.04, 3]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.15, 0.06, 0.25]} />
          <meshStandardMaterial color="#ddcc88" roughness={0.5} />
        </mesh>
      )}

      {/* Danger particles (poaching) */}
      {poaching > 0.3 && <Particles count={Math.round(poaching * 15)} color="#ff4444" speed={0.3} spread={6} yBase={0.2} />}

      {/* Nature particles */}
      <Particles count={Math.round(habitat * 15 + 5)} color="#88cc44" speed={0.15} spread={6} yBase={0.5} />

      <pointLight position={[4, 5, 3]} intensity={0.7} color="#ffdd88" />
      <pointLight position={[-3, 3, -2]} intensity={0.2} color="#aaddaa" />
    </>
  );
}
