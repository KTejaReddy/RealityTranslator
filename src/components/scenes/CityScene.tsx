import { useMemo } from 'react';
import * as THREE from 'three';
import { Building, Tree, Ground, AmbientDust } from './ScenePrimitives';

export function CityScene({ sliders }: { sliders: Record<string, number> }) {
  const density = (sliders.density ?? 50) / 100;
  const greenSpace = (sliders.green_space ?? 25) / 100;
  const commercial = (sliders.commercial ?? 40) / 100;
  const infra = (sliders.infrastructure ?? 50) / 100;

  const buildingCount = Math.round(density * 50 + 8);
  const treeCount = Math.round(greenSpace * 35 + 3);

  const buildings = useMemo(() =>
    Array.from({ length: buildingCount }, () => {
      const isCommercial = Math.random() < commercial;
      return {
        x: (Math.random() - 0.5) * 7,
        z: (Math.random() - 0.5) * 7,
        h: isCommercial ? 0.4 + Math.random() * density * 2.5 : 0.2 + Math.random() * density * 1.2,
        w: isCommercial ? 0.2 + Math.random() * 0.25 : 0.12 + Math.random() * 0.18,
        color: isCommercial ? '#8ca0b0' : '#888888',
        emissive: undefined,
      };
    }), [buildingCount, density, commercial]);

  const trees = useMemo(() =>
    Array.from({ length: treeCount }, () => ({
      x: (Math.random() - 0.5) * 7,
      z: (Math.random() - 0.5) * 7,
      s: 0.5 + Math.random() * 0.7,
    })), [treeCount]);

  // Parks (green patches)
  const parks = useMemo(() =>
    Array.from({ length: Math.round(greenSpace * 4 + 1) }, () => ({
      x: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 5,
      size: 0.4 + Math.random() * 0.8,
    })), [greenSpace]);

  // Roads grid
  const roadColor = infra > 0.5 ? '#222222' : '#333333';

  return (
    <>
      <Ground color={new THREE.Color().lerpColors(new THREE.Color('#3d4d38'), new THREE.Color('#2d3d28'), greenSpace).getStyle()} size={12} />

      {/* Road grid */}
      {[-2, -1, 0, 1, 2].map(i => (
        <group key={`road${i}`}>
          <mesh position={[i * 1.5, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[0.2 * (0.5 + infra * 0.5), 8]} />
            <meshStandardMaterial color={roadColor} roughness={0.65} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0.005, i * 1.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[8, 0.2 * (0.5 + infra * 0.5)]} />
            <meshStandardMaterial color={roadColor} roughness={0.65} metalness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Parks */}
      {parks.map((p, i) => (
        <mesh key={`park${i}`} position={[p.x, 0.008, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.size, 16]} />
          <meshStandardMaterial color="#1a5a2a" roughness={0.9} />
        </mesh>
      ))}

      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building key={i} position={[b.x, 0, b.z]} height={b.h} width={b.w} color={b.color} />
      ))}

      {/* Trees */}
      {trees.map((t, i) => (
        <Tree key={`t${i}`} position={[t.x, 0, t.z]} scale={t.s} />
      ))}

      {/* Street lights along infrastructure */}
      {infra > 0.3 && [-2, -1, 0, 1, 2].map(i =>
        [-2, 0, 2].map(j => (
          <group key={`light${i}${j}`} position={[i * 1.5 + 0.15, 0, j * 1.5]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.4, 4]} />
              <meshStandardMaterial color="#555555" />
            </mesh>
            <pointLight position={[0, 0.4, 0]} intensity={0.1} color="#ffcc88" distance={1} />
          </group>
        ))
      )}
      
      {/* Ambient physical dust */}
      <AmbientDust count={Math.round(150 * density)} color="#aaaaaa" />
    </>
  );
}
