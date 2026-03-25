import { useMemo } from 'react';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { Particles, Tree } from './ScenePrimitives';

export function ClimateScene({ sliders }: { sliders: Record<string, number> }) {
  const pollution = ((100 - (sliders.renewable || 30)) * 0.4 + (sliders.industry || 60) * 0.4) / 100;
  const green = (sliders.renewable || 30) / 100;
  const deforest = (sliders.deforestation || 40) / 100;
  const treeCount = Math.round((1 - deforest) * 25 + 3);

  const trees = useMemo(() =>
    Array.from({ length: treeCount }, (_, i) => ({
      x: (Math.random() - 0.5) * 7,
      z: (Math.random() - 0.5) * 7,
      s: 0.6 + Math.random() * 0.8,
      key: i,
    })), [treeCount]);

  const earthColor = useMemo(() =>
    new THREE.Color().lerpColors(new THREE.Color('#2a9d8f'), new THREE.Color('#e76f51'), pollution), [pollution]);

  const iceCapSize = 0.4 * (1 - pollution * 0.6); // Calculate iceCapSize based on original logic

  return (
    <>
      {/* Earth */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial color={earthColor} roughness={0.7} metalness={0.05} />
        </mesh>
        {/* Atmosphere glow */}
        <mesh>
          <sphereGeometry args={[1.72, 48, 48]} />
          <meshBasicMaterial
            color={pollution > 0.5 ? '#ff6b35' : '#66ccff'}
            transparent
            opacity={0.08 + pollution * 0.12}
            side={THREE.BackSide}
          />
        </mesh>
        {/* Ice caps - shrink with temperature */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[iceCapSize, 16, 16, 0, Math.PI * 2, 0, Math.PI / 4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[iceCapSize, 16, 16, 0, Math.PI * 2, 0, Math.PI / 4]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.1} />
        </mesh>
      </Float>

      {/* Pollution particles */}
      <Particles count={Math.round(pollution * 150 + 10)} color="#ff8c42" speed={pollution * 1.5 + 0.3} spread={6} yBase={0} />
      {/* Clean air particles */}
      <Particles count={Math.round(green * 80 + 5)} color="#00e5a0" speed={0.4} spread={5} yBase={0} />
      {/* Trees around */}
      {trees.map(t => (
        <Tree key={t.key} position={[t.x, -0.5, t.z]} scale={t.s} />
      ))}
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial
          color={new THREE.Color().lerpColors(new THREE.Color('#1a3a2a'), new THREE.Color('#3a2a1a'), deforest)}
          roughness={0.95}
        />
      </mesh>
    </>
  );
}
