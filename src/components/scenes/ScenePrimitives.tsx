import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Particles({ count, color, speed, spread, yBase = 0 }: { count: number; color: string; speed: number; spread: number; yBase?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() =>
    Array.from({ length: Math.max(1, count) }, () => ({
      pos: [(Math.random() - 0.5) * spread, yBase + Math.random() * spread * 0.5, (Math.random() - 0.5) * spread] as [number, number, number],
      spd: 0.2 + Math.random() * speed,
      off: Math.random() * Math.PI * 2,
      size: 0.02 + Math.random() * 0.03,
    })), [count, spread, speed, yBase]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    particles.forEach((p, i) => {
      dummy.position.set(
        p.pos[0] + Math.sin(t * p.spd + p.off) * 0.4,
        p.pos[1] + Math.cos(t * p.spd * 0.6 + p.off) * 0.3,
        p.pos[2] + Math.sin(t * p.spd * 0.4 + p.off) * 0.3
      );
      dummy.scale.setScalar(p.size + Math.sin(t * 2 + p.off) * 0.008);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, Math.max(1, count)]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} toneMapped={false} />
    </instancedMesh>
  );
}

export function AmbientDust({ count = 200, color = "#a855f7" }: { count?: number, color?: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      pos: [(Math.random() - 0.5) * 15, Math.random() * 8, (Math.random() - 0.5) * 15] as [number, number, number],
      spd: 0.05 + Math.random() * 0.1,
      off: Math.random() * Math.PI * 2,
    })), [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    particles.forEach((p, i) => {
      dummy.position.set(
        p.pos[0] + Math.sin(t * p.spd + p.off) * 0.5,
        p.pos[1] + Math.cos(t * p.spd * 0.3 + p.off) * 0.5,
        p.pos[2] + Math.sin(t * p.spd * 0.7 + p.off) * 0.5
      );
      dummy.scale.setScalar(0.015 + Math.sin(t + p.off) * 0.005);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} toneMapped={false} />
    </instancedMesh>
  );
}

export function Ground({ color = '#1a1e2e', size = 12 }: { color?: string; size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

export function Building({ position, rotation = [0, 0, 0], height, width, color = '#1a2a4a' }: {
  position: [number, number, number]; rotation?: [number, number, number]; height: number; width: number; color?: string;
}) {
  return (
    <mesh position={[position[0], position[1] + height / 2, position[2]]} rotation={[rotation[0], rotation[1], rotation[2]]} castShadow receiveShadow>
      <boxGeometry args={[width, height, width]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.15} 
        metalness={0.85} 
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

export function Tower({ position, rotation = [0, 0, 0], height, width, color = '#223344' }: {
  position: [number, number, number]; rotation?: [number, number, number]; height: number; width: number; color?: string;
}) {
  return (
    <group position={[position[0], position[1] + height / 2, position[2]]} rotation={[rotation[0], rotation[1], rotation[2]]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[width * 0.5, width, height, 8]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, height / 2 + 0.5, 0]}>
        <sphereGeometry args={[width * 0.4, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function Dome({ position, size = 1, color = '#ffffff' }: {
  position: [number, number, number]; size?: number; color?: string;
}) {
  return (
    <mesh position={[position[0], position[1], position[2]]} castShadow receiveShadow>
      <sphereGeometry args={[size, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} roughness={0.1} />
    </mesh>
  );
}

export function Road({ position, rotation = [0, 0, 0], width, height = 5, color = '#222222' }: {
  position: [number, number, number]; rotation?: [number, number, number]; width: number; height?: number; color?: string;
}) {
  return (
    <mesh position={[position[0], position[1] + 0.02, position[2]]} rotation={[-Math.PI / 2 + rotation[0], rotation[1], rotation[2]]} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

export function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.3, 6]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial color="#1a7a3a" roughness={0.7} metalness={0.1} envMapIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function MovingObject({ path, speed, color, size = 0.08 }: {
  path: [number, number, number][]; speed: number; color: string; size?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current || path.length < 2) return;
    const t = ((clock.elapsedTime * speed) % 1 + 1) % 1;
    const idx = t * (path.length - 1);
    const i = Math.floor(idx);
    const f = idx - i;
    const a = path[i];
    const b = path[Math.min(i + 1, path.length - 1)];
    ref.current.position.set(
      a[0] + (b[0] - a[0]) * f,
      a[1] + (b[1] - a[1]) * f,
      a[2] + (b[2] - a[2]) * f
    );
  });
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[size * 2, size, size * 1.2]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} envMapIntensity={1.5} />
    </mesh>
  );
}

export function Water({ size = 15, opacity = 0.7, color = '#0066aa', intensity = 1 }: { size?: number; opacity?: number; color?: string; intensity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    // Water modulates slightly, but stays near ground level
    const baseHeight = 0.05 + (intensity - 0.5) * 0.5; 
    ref.current.position.y = baseHeight + Math.sin(clock.elapsedTime * 0.8) * 0.1;
    ref.current.rotation.x = -Math.PI / 2 + Math.sin(clock.elapsedTime * 0.3) * 0.02;
    ref.current.rotation.y = Math.cos(clock.elapsedTime * 0.2) * 0.01;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size * 3, size * 3, 64, 64]} />
      <meshPhysicalMaterial 
        color={color} 
        transparent 
        opacity={opacity} 
        roughness={0.02} 
        metalness={0.1}
        transmission={0.99} 
        ior={1.33}
        thickness={2.5} 
        clearcoat={1.0}
        envMapIntensity={3.0}
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
}

export function InstancedBoxes({ positions, color }: {
  positions: { x: number; y: number; z: number; w: number; h: number; d: number }[];
  color: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useMemo(() => {
    if (!meshRef.current) return;
    positions.forEach((p, i) => {
      dummy.position.set(p.x, p.y + p.h / 2, p.z);
      dummy.scale.set(p.w, p.h, p.d);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, dummy]);

  // Also run on mount
  useFrame(() => {
    if (!meshRef.current || !meshRef.current.userData.initialized) {
      if (meshRef.current) {
        positions.forEach((p, i) => {
          dummy.position.set(p.x, p.y + p.h / 2, p.z);
          dummy.scale.set(p.w, p.h, p.d);
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.userData.initialized = true;
      }
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, Math.max(1, positions.length)]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.2} 
        metalness={0.8}
        envMapIntensity={1.0}
      />
    </instancedMesh>
  );
}

export function Human({ position, color = '#ffcc99', scale = 1 }: { position: [number, number, number]; color?: string; scale?: number }) {
  return (
    <group position={position} scale={scale} castShadow>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

export function Furniture({ position, color = '#8b5a2b', scale = 1 }: { position: [number, number, number]; color?: string; scale?: number }) {
  return (
    <group position={position} scale={scale} castShadow>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-0.5, 0.2, -0.3]} castShadow><boxGeometry args={[0.1, 0.4, 0.1]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0.5, 0.2, -0.3]} castShadow><boxGeometry args={[0.1, 0.4, 0.1]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[-0.5, 0.2, 0.3]} castShadow><boxGeometry args={[0.1, 0.4, 0.1]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0.5, 0.2, 0.3]} castShadow><boxGeometry args={[0.1, 0.4, 0.1]} /><meshStandardMaterial color={color} /></mesh>
    </group>
  );
}

export function Decoration({ position, color = '#ff0055', scale = 1 }: { position: [number, number, number]; color?: string; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.1;
      ref.current.rotation.y = clock.elapsedTime;
    }
  });
  return (
    <group ref={ref} position={position} scale={scale} castShadow>
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.2} envMapIntensity={1.0} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export function Plant({ position, color = '#2d8a4e', scale = 1 }: { position: [number, number, number]; color?: string; scale?: number }) {
  return (
    <group position={position} scale={scale} castShadow>
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0.15, 0.3, 0.1]} castShadow>
         <sphereGeometry args={[0.2, 8, 8]} />
         <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-0.1, 0.3, -0.15]} castShadow>
         <sphereGeometry args={[0.25, 8, 8]} />
         <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Nature({ position, color = '#555555', scale = 1 }: { position: [number, number, number]; color?: string; scale?: number }) {
  // Rock-like shape
  return (
    <mesh position={position} scale={scale} castShadow rotation={[Math.random(), Math.random(), 0]}>
      <dodecahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}
