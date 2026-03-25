import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Particles, Ground } from './ScenePrimitives';

function Student({ position, engaged }: { position: [number, number, number]; engaged: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const bobOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (engaged) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.5 + bobOffset) * 0.005;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.06, 0]}>
        <capsuleGeometry args={[0.015, 0.04, 4, 6]} />
        <meshStandardMaterial color={engaged ? '#4488cc' : '#888888'} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#ffccaa" roughness={0.6} />
      </mesh>
      {/* Desk */}
      <mesh position={[0, 0.03, 0.03]}>
        <boxGeometry args={[0.04, 0.002, 0.03]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
      </mesh>
      {engaged && (
        <pointLight position={[0, 0.08, 0.03]} intensity={0.02} color="#44aaff" distance={0.15} />
      )}
    </group>
  );
}

function SchoolBuilding({ position, scale = 1, quality }: { position: [number, number, number]; scale?: number; quality: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Main building */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.5]} />
        <meshStandardMaterial 
          color={quality > 0.6 ? '#cc8844' : '#887766'} 
          roughness={0.7} 
        />
      </mesh>
      {/* Windows */}
      {[-0.25, -0.1, 0.05, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0.251]}>
          <boxGeometry args={[0.08, 0.1, 0.005]} />
          <meshStandardMaterial color="#88bbdd" roughness={0.1} />
        </mesh>
      ))}
      {/* Door */}
      <mesh position={[0, 0.1, 0.251]}>
        <boxGeometry args={[0.08, 0.18, 0.005]} />
        <meshStandardMaterial color="#5a4030" roughness={0.8} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.52, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.85, 0.04, 0.55]} />
        <meshStandardMaterial color="#6a4433" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Tablet({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.3;
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime) * 0.05;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.08, 0.12, 0.005]} />
      <meshStandardMaterial color="#222222" roughness={0.1} metalness={0.8} />
    </mesh>
  );
}

export function EducationScene({ sliders }: { sliders: Record<string, number> }) {
  const funding = (sliders.funding ?? 45) / 100;
  const techEd = (sliders.tech_ed ?? 30) / 100;
  const classSize = sliders.class_size ?? 30;
  const teacherQuality = (sliders.teacher_quality ?? 50) / 100;

  const studentCount = Math.min(25, Math.round(classSize * 0.6));
  const engagement = Math.min(1, teacherQuality * 0.4 + techEd * 0.3 + funding * 0.2);

  const students = useMemo(() => {
    const rows = Math.ceil(studentCount / 5);
    return Array.from({ length: studentCount }, (_, i) => ({
      x: (i % 5 - 2) * 0.12,
      z: Math.floor(i / 5) * 0.12 - rows * 0.06,
      engaged: Math.random() < engagement,
    }));
  }, [studentCount, engagement]);

  return (
    <>
      <Ground color="#2a2a3a" size={12} />

      {/* Classroom floor */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshStandardMaterial color="#3a3528" roughness={0.9} />
      </mesh>

      {/* School building in background */}
      <SchoolBuilding position={[0, 0, -2.5]} scale={2} quality={funding} />

      {/* Teacher */}
      <group position={[0, 0, -0.6]}>
        <mesh position={[0, 0.08, 0]}>
          <capsuleGeometry args={[0.02, 0.06, 4, 8]} />
          <meshStandardMaterial color="#cc4444" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#ffccaa" roughness={0.6} />
        </mesh>
      </group>

      {/* Whiteboard */}
      <mesh position={[0, 0.2, -0.7]}>
        <boxGeometry args={[0.6, 0.3, 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Students */}
      {students.map((s, i) => (
        <Student key={i} position={[s.x, 0, s.z]} engaged={s.engaged} />
      ))}

      {/* EdTech tablets floating */}
      {techEd > 0.3 && Array.from({ length: Math.round(techEd * 5) }, (_, i) => (
        <Tablet key={i} position={[(Math.random() - 0.5) * 2, 0.8 + Math.random() * 0.5, (Math.random() - 0.5) * 2]} />
      ))}

      {/* Knowledge particles */}
      <Particles count={Math.round(engagement * 30 + 5)} color="#ffcc44" speed={0.4} spread={3} yBase={0.5} />

      {/* Trees around (funded campus) */}
      {funding > 0.5 && Array.from({ length: 4 }, (_, i) => (
        <group key={i} position={[(i < 2 ? -3 : 3), 0, (i % 2 === 0 ? -2 : 2)]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 0.3, 6]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.15, 0.4, 8]} />
            <meshStandardMaterial color="#1a7a3a" roughness={0.8} />
          </mesh>
        </group>
      ))}

      <pointLight position={[0, 3, 1]} intensity={0.6} color="#ffffdd" />
      <pointLight position={[-2, 2, -1]} intensity={0.2} color="#aaccff" />
    </>
  );
}
