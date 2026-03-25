import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Particles } from './ScenePrimitives';

function Cloud({ position, size, dark }: { position: [number, number, number]; size: number; dark: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * 10, []);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(clock.elapsedTime * 0.1 + offset) * 0.3;
    }
  });

  const color = dark ? '#444455' : '#ccccdd';

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[size * 0.4, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} transparent opacity={0.85} />
      </mesh>
      <mesh position={[size * 0.25, -0.05, 0]}>
        <sphereGeometry args={[size * 0.3, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-size * 0.2, -0.03, 0.05]}>
        <sphereGeometry args={[size * 0.35, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function RainDrop({ startPos }: { startPos: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 2 + Math.random() * 3, []);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const y = ((startPos[1] - clock.elapsedTime * speed) % 4 + 4) % 4 - 0.5;
    ref.current.position.y = y;
  });

  return (
    <mesh ref={ref} position={startPos}>
      <capsuleGeometry args={[0.003, 0.02, 2, 4]} />
      <meshBasicMaterial color="#6688cc" transparent opacity={0.6} />
    </mesh>
  );
}

function Lightning({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const visible = useRef(false);
  
  useFrame(({ clock }) => {
    if (!ref.current || !active) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    visible.current = Math.random() < 0.005;
    ref.current.visible = visible.current;
  });

  return (
    <group ref={ref}>
      <mesh position={[(Math.random() - 0.5) * 4, 2, (Math.random() - 0.5) * 2]}>
        <boxGeometry args={[0.02, 2, 0.005]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <pointLight position={[0, 3, 0]} intensity={5} color="#ffffff" distance={10} />
    </group>
  );
}

function Sun({ intensity, position }: { intensity: number; position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshBasicMaterial).opacity = intensity;
      ref.current.rotation.z = clock.elapsedTime * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={intensity} />
      </mesh>
      {/* Rays */}
      {intensity > 0.3 && Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]} position={[0, 0, -0.01]}>
          <boxGeometry args={[0.02, 0.8, 0.001]} />
          <meshBasicMaterial color="#ffee88" transparent opacity={intensity * 0.3} />
        </mesh>
      ))}
      <pointLight intensity={intensity * 2} color="#ffdd88" distance={8} />
    </group>
  );
}

export function WeatherScene({ sliders }: { sliders: Record<string, number> }) {
  const temp = sliders.temp_w ?? 22;
  const humidity = (sliders.humidity ?? 55) / 100;
  const windSpeed = (sliders.wind_speed ?? 15) / 150;
  const pressure = sliders.pressure ?? 1013;

  const rainProb = Math.min(1, Math.max(0, humidity * 0.7 - (pressure - 1000) * 0.005 + (temp > 30 ? 0.15 : 0)));
  const stormRisk = Math.min(1, Math.max(0, windSpeed * 0.4 + humidity * 0.2 - (pressure - 990) * 0.003));
  const sunIntensity = Math.max(0, 1 - humidity * 0.7 - windSpeed * 0.3);
  const isHot = temp > 30;
  const isCold = temp < 5;

  const rainCount = Math.round(rainProb * 80);
  const cloudCount = Math.round(3 + humidity * 5);

  const skyColor = useMemo(() => {
    if (stormRisk > 0.5) return '#1a1a2a';
    if (humidity > 0.7) return '#334455';
    if (isHot) return '#4488cc';
    if (isCold) return '#667788';
    return '#5599cc';
  }, [stormRisk, humidity, isHot, isCold]);

  const groundColor = useMemo(() => {
    if (isCold && humidity > 0.5) return '#ddddee'; // Snow
    if (isHot && humidity < 0.3) return '#aa8855'; // Dry
    return '#3a5a2a'; // Green
  }, [isCold, isHot, humidity]);

  const rainDrops = useMemo(() =>
    Array.from({ length: rainCount }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: Math.random() * 4,
      z: (Math.random() - 0.5) * 8,
    })), [rainCount]);

  return (
    <>
      {/* Sky dome */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial color={skyColor} side={THREE.BackSide} />
      </mesh>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color={groundColor} roughness={0.9} />
      </mesh>

      {/* Mountains / hills */}
      {[-3, -1, 1.5, 3.5].map((x, i) => (
        <mesh key={i} position={[x, 0, -4 - i * 0.3]}>
          <coneGeometry args={[1.2 + i * 0.2, 1.5 + i * 0.3, 6]} />
          <meshStandardMaterial color={isCold ? '#aabbcc' : '#4a6a3a'} roughness={0.8} />
        </mesh>
      ))}

      {/* Trees */}
      {!isCold && Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[(Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 4]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 0.4, 6]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[0.18, 0.5, 8]} />
            <meshStandardMaterial color={isHot ? '#6a8a30' : '#1a7a3a'} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Sun */}
      <Sun intensity={sunIntensity} position={[3, 4, -3]} />

      {/* Clouds */}
      {Array.from({ length: cloudCount }, (_, i) => (
        <Cloud
          key={i}
          position={[(Math.random() - 0.5) * 6, 3 + Math.random() * 1, -2 + Math.random() * 2]}
          size={0.5 + Math.random() * 0.8}
          dark={stormRisk > 0.3}
        />
      ))}

      {/* Rain */}
      {rainDrops.map((r, i) => (
        <RainDrop key={i} startPos={[r.x, r.y, r.z]} />
      ))}

      {/* Lightning */}
      <Lightning active={stormRisk > 0.5} />

      {/* Snow (cold + humid) */}
      {isCold && humidity > 0.4 && (
        <Particles count={Math.round(humidity * 50)} color="#ffffff" speed={0.2} spread={8} yBase={2} />
      )}

      {/* Wind particles */}
      <Particles count={Math.round(windSpeed * 30 + 3)} color="#aabbcc" speed={windSpeed * 3 + 0.5} spread={8} yBase={1} />

      {/* Heat haze */}
      {isHot && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshBasicMaterial color="#ff8844" transparent opacity={0.03 + (temp - 30) * 0.003} side={THREE.BackSide} />
        </mesh>
      )}

      <ambientLight intensity={sunIntensity * 0.3 + 0.2} />
    </>
  );
}
